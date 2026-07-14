"""Deny-by-default tool lockdown for the Claude Agent SDK.

Empirically confirmed (do not remove without re-testing): setting
`allowed_tools` on ClaudeAgentOptions alone does NOT prevent execution of
Claude Code's built-in tools (Bash/Read/Write/Edit/WebFetch/etc.) -- a request
to run a shell command still executed against the host in local testing even
with `allowed_tools` scoped to a single custom MCP tool. The actual
enforcement boundary is a `PreToolUse` hook that explicitly denies anything
outside our own whitelist. This hook is what makes it safe to expose the
agent through a web-facing endpoint.
"""

MCP_SERVER_NAME = "clearview"

_TOOL_BASENAMES = [
    "search_providers",
    "get_provider_claims",
    "compare_providers",
    "summarize_department",
    "search_policy_knowledge",
    "send_email",
    "schedule_appointment",
]

ALLOWED_TOOL_NAMES = {f"mcp__{MCP_SERVER_NAME}__{name}" for name in _TOOL_BASENAMES}


async def deny_unlisted_tools(input_data, tool_use_id, context):
    tool_name = input_data.get("tool_name")
    if tool_name in ALLOWED_TOOL_NAMES:
        return {}
    return {
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": f"Tool '{tool_name}' is not permitted for the Clearview agent.",
        }
    }
