"""In-process MCP tools for the Clearview Agent SDK core. Each tool opens its
own short-lived DB session (these run outside FastAPI's request lifecycle, so
there is no `Depends(get_db)` to hook into)."""

from typing import Any

from claude_agent_sdk import create_sdk_mcp_server, tool

from app.agent.security import MCP_SERVER_NAME
from app.db import repo
from app.db.session import SessionLocal
from app.services.rag import search_policy_knowledge as rag_search


def _text(s: str) -> dict[str, Any]:
    return {"content": [{"type": "text", "text": s}]}


@tool(
    "search_providers",
    "Search or look up providers by name, specialty, facility, risk level, or flagged status.",
    {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "Free-text search across name/specialty/facility"},
            "specialty": {"type": "string"},
            "facility": {"type": "string"},
            "riskLevel": {"type": "string", "enum": ["low", "medium", "high", "critical"]},
            "flaggedOnly": {"type": "boolean", "description": "Only providers flagged and not yet reviewed"},
            "limit": {"type": "integer"},
        },
    },
)
async def search_providers(args: dict[str, Any]) -> dict[str, Any]:
    db = SessionLocal()
    try:
        results = repo.search_providers(
            db, query=args.get("query"), specialty=args.get("specialty"), facility=args.get("facility"),
            risk_level=args.get("riskLevel"), flagged_only=bool(args.get("flaggedOnly", False)),
            limit=int(args.get("limit", 20)),
        )
        lines = [
            f"{p.id}: {p.name} ({p.specialty}, {p.facility}) score={p.performanceScore} risk={p.riskLevel}"
            f" stuckAtRiskQuarters={p.stuckAtRiskQuarters}"
            for p in results
        ]
        return _text("\n".join(lines) or "No matching providers.")
    finally:
        db.close()


@tool(
    "get_provider_claims",
    "Pull a specific provider's claims for an optional quarter range, including a denial-reason tally.",
    {
        "type": "object",
        "properties": {
            "providerId": {"type": "string", "description": "Provider id, e.g. prov-007"},
            "quarterStart": {"type": "string", "description": "e.g. 2025-Q1"},
            "quarterEnd": {"type": "string", "description": "e.g. 2026-Q2"},
            "status": {"type": "string", "enum": ["paid", "denied", "pending", "resubmitted"]},
            "limit": {"type": "integer"},
        },
        "required": ["providerId"],
    },
)
async def get_provider_claims(args: dict[str, Any]) -> dict[str, Any]:
    db = SessionLocal()
    try:
        page = repo.get_claims(db, args["providerId"], page=1, page_size=500, status=args.get("status"))
        if page is None:
            return _text(f"Provider {args['providerId']} not found.")
        claims = page.claims
        if args.get("quarterStart"):
            claims = [c for c in claims if c.quarter >= args["quarterStart"]]
        if args.get("quarterEnd"):
            claims = [c for c in claims if c.quarter <= args["quarterEnd"]]
        tally: dict[str, int] = {}
        for c in claims:
            if c.denialReason:
                tally[c.denialReason] = tally.get(c.denialReason, 0) + 1
        limit = int(args.get("limit", 30))
        lines = [f"{len(claims)} claims found. Denial-reason tally: {tally}"]
        for c in claims[:limit]:
            lines.append(f"{c.id} | {c.claimDate} | {c.quarter} | ${c.amountBilled} billed / ${c.amountPaid} paid | {c.status} | {c.denialReason or ''}")
        return _text("\n".join(lines))
    finally:
        db.close()


@tool(
    "compare_providers",
    "Compare performance metrics and trend across 2-5 named providers by id.",
    {
        "type": "object",
        "properties": {"providerIds": {"type": "array", "items": {"type": "string"}, "description": "2-5 provider ids"}},
        "required": ["providerIds"],
    },
)
async def compare_providers(args: dict[str, Any]) -> dict[str, Any]:
    db = SessionLocal()
    try:
        providers = repo.compare_providers(db, args.get("providerIds", [])[:5])
        lines = [
            f"{p.name} ({p.id}): score={p.performanceScore} risk={p.riskLevel} trend={p.trend} "
            f"denialRate={p.metrics.denialRate}% netCollection={p.metrics.netCollectionRate}% "
            f"daysInAR={p.metrics.daysInAR} stuckAtRiskQuarters={p.stuckAtRiskQuarters}"
            for p in providers
        ]
        return _text("\n".join(lines) or "No matching providers.")
    finally:
        db.close()


@tool(
    "summarize_department",
    "Summarize aggregate performance for a specialty or facility (average score, denial rate, stuck-at-risk count, top/bottom performer).",
    {
        "type": "object",
        "properties": {
            "groupBy": {"type": "string", "enum": ["specialty", "facility"]},
            "value": {"type": "string", "description": "The specialty or facility name to summarize"},
        },
        "required": ["groupBy", "value"],
    },
)
async def summarize_department(args: dict[str, Any]) -> dict[str, Any]:
    db = SessionLocal()
    try:
        result = repo.summarize_department(db, args.get("groupBy", "specialty"), args.get("value", ""))
        if result is None:
            return _text(f"No providers found for {args.get('groupBy')}={args.get('value')}")
        return _text(str(result))
    finally:
        db.close()


@tool(
    "search_policy_knowledge",
    "Retrieve relevant (synthetic) payer-policy and coding-guideline snippets explaining WHY a denial reason occurs or what a payer's policy requires.",
    {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "What to look up, e.g. a denial reason or topic like 'timely filing'"},
            "payer": {"type": "string", "description": "Optional payer name to narrow results, e.g. 'Medicare'"},
        },
        "required": ["query"],
    },
)
async def search_policy_knowledge(args: dict[str, Any]) -> dict[str, Any]:
    results = rag_search(args.get("query", ""), payer=args.get("payer"))
    if not results:
        return _text("No matching synthetic policy documents found for this query.")
    lines = [f"[{r['payer'] or 'General'}] {r['title']}: {r['text']}" for r in results]
    return _text("\n\n".join(lines))


@tool(
    "send_email",
    "Send (log) an email to one or more providers. Only use this once the user has clearly asked you to send it -- if unsure, share the drafted subject/body first and ask for confirmation.",
    {
        "type": "object",
        "properties": {
            "providerIds": {"type": "array", "items": {"type": "string"}},
            "subject": {"type": "string"},
            "body": {"type": "string"},
        },
        "required": ["providerIds", "subject", "body"],
    },
)
async def send_email(args: dict[str, Any]) -> dict[str, Any]:
    db = SessionLocal()
    try:
        result = repo.send_email(db, args["providerIds"], args["subject"], args["body"], sent_by="ai-agent")
        return _text(f"Email \"{result.subject}\" sent (logged) to {', '.join(result.recipients) or 'no recipients found'}.")
    finally:
        db.close()


@tool(
    "schedule_appointment",
    "Schedule (book) a meeting with one or more providers to discuss their performance, and send a confirmation email automatically.",
    {
        "type": "object",
        "properties": {
            "providerIds": {"type": "array", "items": {"type": "string"}},
            "topic": {"type": "string"},
            "agenda": {"type": "string"},
            "scheduledAt": {"type": "string", "description": "ISO date/time, e.g. 2026-07-21T14:00"},
        },
        "required": ["providerIds", "topic", "scheduledAt"],
    },
)
async def schedule_appointment(args: dict[str, Any]) -> dict[str, Any]:
    db = SessionLocal()
    try:
        appt = repo.create_appointment(db, args["providerIds"], args["topic"], args.get("agenda", ""), args["scheduledAt"])
        return _text(f"Appointment \"{appt.topic}\" scheduled for {appt.scheduledAt} with {', '.join(appt.providerNames)}. Confirmation email sent.")
    finally:
        db.close()


clearview_server = create_sdk_mcp_server(
    name=MCP_SERVER_NAME,
    version="1.0.0",
    tools=[
        search_providers, get_provider_claims, compare_providers, summarize_department,
        search_policy_knowledge, send_email, schedule_appointment,
    ],
)
