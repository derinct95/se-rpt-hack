import os
from datetime import datetime, timezone

import anthropic
from sqlalchemy.orm import Session

from app.db import repo
from app.models import PracticeReviewAction, PracticeReviewFinding, PracticeReviewReport

MODEL = "claude-opus-4-8"

RECORD_PRACTICE_REVIEW_TOOL = {
    "name": "record_practice_review",
    "description": "Record the structured practice-wide review: key findings and priority actions.",
    "strict": True,
    "input_schema": {
        "type": "object",
        "properties": {
            "keyFindings": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string"},
                        "narrative": {"type": "string"},
                        "severity": {"type": "string", "enum": ["critical", "high", "medium", "info"]},
                    },
                    "required": ["title", "narrative", "severity"],
                    "additionalProperties": False,
                },
            },
            "priorityActions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string"},
                        "description": {"type": "string"},
                        "priority": {"type": "string", "enum": ["low", "medium", "high"]},
                    },
                    "required": ["title", "description", "priority"],
                    "additionalProperties": False,
                },
            },
        },
        "required": ["keyFindings", "priorityActions"],
        "additionalProperties": False,
    },
}

SYSTEM_PROMPT = """You are an AI practice-operations analyst for Clearview Medical Group, a fictional \
(100% synthetic, no real PHI) medical practice. You are given aggregate revenue-cycle statistics for a \
reporting period. Write 3-6 key findings and 3-5 priority actions a practice administrator would find \
credible and specific, referencing the actual numbers provided. Do not invent figures not present in \
the data."""


def _default_period_label(db: Session, period_type: str) -> str:
    providers = repo.list_providers(db)
    if not providers:
        return "Current period"
    full = repo.get_provider(db, providers[0].id)
    if period_type == "quarterly" and full.quarterlyHistory:
        return full.quarterlyHistory[-1].quarter
    if full.claimsHistory:
        latest_month = full.claimsHistory[-1].month
        if period_type == "weekly":
            return f"Week of {datetime.now(timezone.utc).date().isoformat()} (rolled up from {latest_month})"
        return latest_month
    return "Current period"


def aggregate_practice_stats(db: Session, period_type: str) -> dict:
    providers = repo.list_providers(db)
    total = len(providers)
    avg_score = round(sum(p.performanceScore for p in providers) / total, 1) if total else 0.0
    stuck_count = sum(1 for p in providers if p.stuckAtRiskQuarters >= repo.STUCK_AT_RISK_THRESHOLD)
    flagged_count = sum(1 for p in providers if p.flagged and not p.reviewed)

    total_revenue = total_denied = total_submitted = 0.0
    denial_tally: dict[str, int] = {}
    movers: list[tuple[str, float]] = []

    for s in providers:
        full = repo.get_provider(db, s.id)
        if full.claimsHistory:
            latest_month = full.claimsHistory[-1]
            total_revenue += latest_month.revenueCollected
            total_denied += latest_month.claimsDenied
            total_submitted += latest_month.claimsSubmitted
            for d in latest_month.denialReasons:
                denial_tally[d.reason] = denial_tally.get(d.reason, 0) + d.count
        if len(full.quarterlyHistory) >= 2:
            delta = full.quarterlyHistory[-1].performanceScore - full.quarterlyHistory[-2].performanceScore
            movers.append((s.name, round(delta, 1)))

    scale = 1.0
    if period_type == "weekly":
        scale = 1 / 4.33
    total_revenue *= scale
    total_denied = round(total_denied * scale)
    total_submitted = round(total_submitted * scale)
    denial_tally = {k: round(v * scale) for k, v in denial_tally.items()}

    movers.sort(key=lambda x: x[1])
    decliners = [m for m in movers if m[1] < -3][:3]
    improvers = sorted([m for m in movers if m[1] > 3], key=lambda x: -x[1])[:3]
    top_denial_reasons = sorted(denial_tally.items(), key=lambda x: -x[1])[:3]

    return {
        "totalProviders": total, "averageScore": avg_score, "stuckAtRiskCount": stuck_count,
        "flaggedCount": flagged_count, "totalRevenue": round(total_revenue, 2),
        "totalDenied": total_denied, "totalSubmitted": total_submitted,
        "topDenialReasons": top_denial_reasons, "decliners": decliners, "improvers": improvers,
    }


def _rule_based_review(stats: dict, period_type: str, label: str) -> PracticeReviewReport:
    findings = [
        PracticeReviewFinding(
            title="Practice-wide performance snapshot",
            narrative=f"Average performance score across {stats['totalProviders']} providers is {stats['averageScore']}. "
                      f"{stats['stuckAtRiskCount']} provider(s) have been stuck at high/critical risk for multiple consecutive quarters.",
            severity="high" if stats["stuckAtRiskCount"] > 0 else "info",
        ),
        PracticeReviewFinding(
            title="Claims volume and revenue",
            narrative=f"{stats['totalSubmitted']} claims submitted with {stats['totalDenied']} denied, "
                      f"collecting ${stats['totalRevenue']:,.0f} in revenue this {period_type} period.",
            severity="medium",
        ),
    ]
    if stats["topDenialReasons"]:
        top = stats["topDenialReasons"][0]
        findings.append(PracticeReviewFinding(
            title="Leading denial reason",
            narrative=f"\"{top[0]}\" is the most common denial reason org-wide, accounting for {top[1]} denied claims this period.",
            severity="medium",
        ))
    if stats["decliners"]:
        names = ", ".join(f"{n} ({d:+.1f})" for n, d in stats["decliners"])
        findings.append(PracticeReviewFinding(title="Providers trending down", narrative=names, severity="high"))
    if stats["improvers"]:
        names = ", ".join(f"{n} ({d:+.1f})" for n, d in stats["improvers"])
        findings.append(PracticeReviewFinding(title="Providers trending up", narrative=names, severity="info"))
    if stats["flaggedCount"] > 0:
        findings.append(PracticeReviewFinding(
            title="Providers awaiting review",
            narrative=f"{stats['flaggedCount']} flagged provider(s) have not yet been reviewed.",
            severity="medium",
        ))

    actions = [
        PracticeReviewAction(
            title="Review stuck-at-risk providers", priority="high",
            description="Schedule 1:1 check-ins with providers stuck at high/critical risk for 2+ consecutive quarters.",
        ) if stats["stuckAtRiskCount"] > 0 else None,
        PracticeReviewAction(
            title="Address the leading denial reason", priority="high",
            description=f"Investigate root cause of \"{stats['topDenialReasons'][0][0]}\" denials across the practice."
            if stats["topDenialReasons"] else "Investigate denial trends across the practice.",
        ),
        PracticeReviewAction(
            title="Clear the flagged-provider review queue", priority="medium",
            description=f"{stats['flaggedCount']} provider(s) are awaiting review — assign an owner to clear the queue.",
        ) if stats["flaggedCount"] > 0 else None,
    ]
    actions = [a for a in actions if a is not None]
    if not actions:
        actions = [PracticeReviewAction(title="Maintain current cadence", priority="low", description="No urgent priority actions this period — continue routine monitoring.")]

    return PracticeReviewReport(
        period=period_type, periodLabel=label, generatedAt=datetime.now(timezone.utc).isoformat(),
        keyFindings=findings, priorityActions=actions, generatedBy="rule",
    )


def _call_claude_for_review(stats: dict, period_type: str, label: str) -> PracticeReviewReport:
    client = anthropic.Anthropic()
    response = client.messages.create(
        model=MODEL, max_tokens=2048, system=SYSTEM_PROMPT,
        tools=[RECORD_PRACTICE_REVIEW_TOOL],
        tool_choice={"type": "tool", "name": "record_practice_review"},
        messages=[{"role": "user", "content": f"Period: {period_type} ({label})\nStats: {stats}"}],
    )
    tool_use = next(b for b in response.content if b.type == "tool_use")
    data = tool_use.input
    return PracticeReviewReport(
        period=period_type, periodLabel=label, generatedAt=datetime.now(timezone.utc).isoformat(),
        keyFindings=[PracticeReviewFinding(**f) for f in data["keyFindings"]],
        priorityActions=[PracticeReviewAction(**a) for a in data["priorityActions"]],
        generatedBy="ai",
    )


def generate_practice_review(db: Session, period_type: str, period_label: str | None = None) -> PracticeReviewReport:
    stats = aggregate_practice_stats(db, period_type)
    label = period_label or _default_period_label(db, period_type)
    if os.environ.get("ANTHROPIC_API_KEY"):
        try:
            return _call_claude_for_review(stats, period_type, label)
        except Exception:
            pass
    return _rule_based_review(stats, period_type, label)
