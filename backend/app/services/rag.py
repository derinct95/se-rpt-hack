"""Minimal retrieval-augmented-generation layer over the synthetic policy
corpus. Retrieval-augmented generation just means "retrieve relevant
documents, then feed them into LLM generation" -- it does not require a
vector database or neural embeddings. Given the corpus is ~20 short
documents, a hand-rolled TF-IDF + cosine-similarity search is a legitimate,
fully-offline implementation: no new dependency, no external embeddings API
call, and it's fast enough to recompute the index at import time.
"""

import math
import re
from collections import Counter

from app.data.policy_corpus import POLICY_DOCS

_TOKEN_RE = re.compile(r"[a-z0-9]+")


def _tokenize(text: str) -> list[str]:
    return _TOKEN_RE.findall(text.lower())


def _build_index():
    doc_tokens = [_tokenize(f"{d['title']} {d['text']} {d.get('category', '')} {d.get('payer') or ''}") for d in POLICY_DOCS]
    doc_freqs = [Counter(tokens) for tokens in doc_tokens]

    df: Counter = Counter()
    for freq in doc_freqs:
        for term in freq:
            df[term] += 1

    n_docs = len(POLICY_DOCS)
    idf = {term: math.log((n_docs + 1) / (count + 1)) + 1 for term, count in df.items()}

    doc_vectors = []
    for freq in doc_freqs:
        vec = {term: tf * idf.get(term, 0.0) for term, tf in freq.items()}
        norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
        doc_vectors.append((vec, norm))

    return idf, doc_vectors


_IDF, _DOC_VECTORS = _build_index()


def _query_vector(query: str) -> tuple[dict, float]:
    tokens = _tokenize(query)
    freq = Counter(tokens)
    vec = {term: tf * _IDF.get(term, 0.0) for term, tf in freq.items()}
    norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
    return vec, norm


def _cosine(vec_a: dict, norm_a: float, vec_b: dict, norm_b: float) -> float:
    shorter, longer = (vec_a, vec_b) if len(vec_a) < len(vec_b) else (vec_b, vec_a)
    dot = sum(v * longer.get(k, 0.0) for k, v in shorter.items())
    return dot / (norm_a * norm_b)


def search_policy_knowledge(query: str, payer: str | None = None, top_k: int = 3) -> list[dict]:
    q_vec, q_norm = _query_vector(query)
    scored = []
    for doc, (doc_vec, doc_norm) in zip(POLICY_DOCS, _DOC_VECTORS):
        if payer and doc.get("payer") and doc["payer"].lower() != payer.lower():
            continue
        score = _cosine(q_vec, q_norm, doc_vec, doc_norm)
        if score > 0:
            scored.append((score, doc))
    scored.sort(key=lambda x: -x[0])
    return [
        {"id": d["id"], "payer": d.get("payer"), "title": d["title"], "text": d["text"], "relevance": round(s, 3)}
        for s, d in scored[:top_k]
    ]
