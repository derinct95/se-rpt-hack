"""Email/agenda drafting -- plain single-shot Claude call (not the full agent;
this is pure text generation, no tool use needed), with the same
forced-structured-output + rule-based-fallback pattern used by ai_insights.py
and practice_review.py."""

import os

import anthropic

from app.models import Provider

MODEL = "claude-opus-4-8"

DRAFT_EMAIL_TOOL = {
    "name": "record_email_draft",
    "description": "Record a drafted email subject and body.",
    "strict": True,
    "input_schema": {
        "type": "object",
        "properties": {
            "subject": {"type": "string"},
            "body": {"type": "string"},
        },
        "required": ["subject", "body"],
        "additionalProperties": False,
    },
}

SYSTEM_PROMPT = """You are drafting a professional email on behalf of Clearview Medical Group's practice \
administration to one or more providers, about a revenue-cycle-management performance topic. All data is \
synthetic. Reference concrete figures from the provided provider data. Be respectful, specific, and concise -- \
a real practice administrator would send this as written."""


def _rule_based_email(providers: list[Provider], topic: str) -> tuple[str, str]:
    names = ", ".join(p.name for p in providers)
    subject = f"Performance discussion: {topic}"
    lines = [f"Dear {names},", "", f"I'd like to connect regarding: {topic}.", ""]
    for p in providers:
        lines.append(
            f"- {p.name}: performance score {p.performanceScore} ({p.riskLevel} risk), "
            f"denial rate {p.metrics.denialRate}%, days in AR {p.metrics.daysInAR}."
        )
    lines += ["", "Please let me know a convenient time to discuss.", "", "Best regards,", "Clearview Medical Group"]
    return subject, "\n".join(lines)


def draft_email(providers: list[Provider], topic: str) -> tuple[str, str, str]:
    if os.environ.get("ANTHROPIC_API_KEY"):
        try:
            client = anthropic.Anthropic()
            provider_summary = "\n".join(
                f"{p.name} ({p.specialty}): score={p.performanceScore}, risk={p.riskLevel}, "
                f"denialRate={p.metrics.denialRate}%, daysInAR={p.metrics.daysInAR}, "
                f"stuckAtRiskQuarters={p.stuckAtRiskQuarters}"
                for p in providers
            )
            response = client.messages.create(
                model=MODEL, max_tokens=1024, system=SYSTEM_PROMPT,
                tools=[DRAFT_EMAIL_TOOL],
                tool_choice={"type": "tool", "name": "record_email_draft"},
                messages=[{"role": "user", "content": f"Topic: {topic}\n\nProviders:\n{provider_summary}"}],
            )
            tool_use = next(b for b in response.content if b.type == "tool_use")
            return tool_use.input["subject"], tool_use.input["body"], "ai"
        except Exception:
            pass
    subject, body = _rule_based_email(providers, topic)
    return subject, body, "rule"
