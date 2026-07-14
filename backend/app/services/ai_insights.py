"""AI proactive insights: real Claude-generated narrative insights, with a
deterministic rule-based fallback so the dashboard never breaks offline or
when ANTHROPIC_API_KEY is missing / the API call fails."""

import json
import os

import anthropic

from app.models import Insight, Provider

MODEL = "claude-opus-4-8"

RECORD_INSIGHTS_TOOL = {
    "name": "record_insights",
    "description": "Record the structured list of AI-generated proactive insights for the provider performance dashboard.",
    "strict": True,
    "input_schema": {
        "type": "object",
        "properties": {
            "insights": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "providerId": {"type": "string"},
                        "providerName": {"type": "string"},
                        "severity": {
                            "type": "string",
                            "enum": ["critical", "high", "medium", "info"],
                        },
                        "title": {"type": "string"},
                        "narrative": {"type": "string"},
                        "recommendedAction": {"type": "string"},
                        "confidenceScore": {"type": "number"},
                        "estimatedFinancialImpact": {"type": "number"},
                    },
                    "required": [
                        "providerId",
                        "providerName",
                        "severity",
                        "title",
                        "narrative",
                        "recommendedAction",
                        "confidenceScore",
                        "estimatedFinancialImpact",
                    ],
                    "additionalProperties": False,
                },
            }
        },
        "required": ["insights"],
        "additionalProperties": False,
    },
}

SYSTEM_PROMPT = """You are an AI analyst embedded in a Revenue Cycle Management (RCM) \
provider performance dashboard. You will be given performance data for a set of \
healthcare providers (scores, denial rates, days in AR, coding accuracy, trends, \
claims history). Identify the 4-8 most important, actionable insights across the \
whole provider population -- prioritize revenue-impacting risks (rising denial \
rates, declining scores, compliance/coding risk) and call out standout top \
performers worth replicating. Use providerId "" and providerName "Organization-wide" \
for insights that span multiple providers rather than one. Write narratives a \
revenue-cycle director would find credible and specific, referencing actual \
numbers from the data. Estimate confidenceScore as a 0-1 probability and \
estimatedFinancialImpact as a signed USD estimate (positive = opportunity/savings, \
negative = revenue at risk) -- use 0 if not estimable."""


def _provider_payload(providers: list[Provider]) -> list[dict]:
    return [
        {
            "id": p.id,
            "name": p.name,
            "specialty": p.specialty,
            "performanceScore": p.performanceScore,
            "riskLevel": p.riskLevel,
            "trend": p.trend,
            "scoreHistory": p.scoreHistory,
            "flagged": p.flagged,
            "metrics": p.metrics.model_dump(),
            "peerAverageMetrics": p.peerAverageMetrics.model_dump(),
        }
        for p in providers
    ]


def _call_claude(providers: list[Provider]) -> list[Insight]:
    client = anthropic.Anthropic()
    response = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        tools=[RECORD_INSIGHTS_TOOL],
        tool_choice={"type": "tool", "name": "record_insights"},
        messages=[
            {
                "role": "user",
                "content": json.dumps(_provider_payload(providers)),
            }
        ],
    )
    tool_use = next(b for b in response.content if b.type == "tool_use")
    raw_insights = tool_use.input["insights"]

    insights = []
    for i, item in enumerate(raw_insights):
        insights.append(Insight(
            id=f"ins-ai-{i}",
            providerId=item["providerId"] or None,
            providerName=item["providerName"] or None,
            severity=item["severity"],
            title=item["title"],
            narrative=item["narrative"],
            recommendedAction=item["recommendedAction"],
            confidenceScore=item["confidenceScore"],
            estimatedFinancialImpact=item["estimatedFinancialImpact"],
            generatedBy="ai",
        ))
    return insights


def _rule_based_fallback(providers: list[Provider]) -> list[Insight]:
    insights = []
    sorted_by_score = sorted(providers, key=lambda p: p.performanceScore)

    worst = [p for p in sorted_by_score if p.riskLevel in ("critical", "high")][:3]
    for i, p in enumerate(worst):
        impact = round((p.peerAverageMetrics.denialRate - p.metrics.denialRate) * p.metrics.claimsVolumeMonthly * p.metrics.avgReimbursementPerClaim / 100 * 12, 0)
        insights.append(Insight(
            id=f"ins-rule-risk-{i}",
            providerId=p.id,
            providerName=p.name,
            severity="critical" if p.riskLevel == "critical" else "high",
            title=f"{p.name} showing elevated revenue risk",
            narrative=(
                f"{p.name} ({p.specialty}) has a performance score of {p.performanceScore}, "
                f"a denial rate of {p.metrics.denialRate}% versus a peer average of "
                f"{p.peerAverageMetrics.denialRate}%, and {p.metrics.daysInAR} days in AR."
            ),
            recommendedAction="Schedule a denial root-cause review and prioritize aged AR follow-up.",
            confidenceScore=0.72,
            estimatedFinancialImpact=impact,
            generatedBy="rule",
        ))

    top = max(providers, key=lambda p: p.performanceScore)
    insights.append(Insight(
        id="ins-rule-top",
        providerId=top.id,
        providerName=top.name,
        severity="info",
        title=f"{top.name} is the top performer this period",
        narrative=(
            f"{top.name} leads all providers with a score of {top.performanceScore}, "
            f"a clean claim rate of {top.metrics.cleanClaimRate}%, and a denial rate of only "
            f"{top.metrics.denialRate}%."
        ),
        recommendedAction="Document this provider's workflow as a best-practice template for peers.",
        confidenceScore=0.8,
        estimatedFinancialImpact=0,
        generatedBy="rule",
    ))

    declining = [p for p in providers if p.trend == "down"][:2]
    for i, p in enumerate(declining):
        insights.append(Insight(
            id=f"ins-rule-trend-{i}",
            providerId=p.id,
            providerName=p.name,
            severity="medium",
            title=f"{p.name} trending downward",
            narrative=f"{p.name}'s performance score has declined over the last 12 months, now at {p.performanceScore}.",
            recommendedAction="Review recent coding/documentation changes and schedule a check-in.",
            confidenceScore=0.6,
            estimatedFinancialImpact=0,
            generatedBy="rule",
        ))

    return insights


def generate_insights(providers: list[Provider]) -> list[Insight]:
    if os.environ.get("ANTHROPIC_API_KEY"):
        try:
            return _call_claude(providers)
        except Exception:
            pass
    return _rule_based_fallback(providers)
