#!/usr/bin/env python
"""Clearview Medical Group -- standalone CLI agent.

Built on the Claude Agent SDK (the same SDK that powers Claude Code), sharing
its tool definitions and security lockdown with the web app's /api/chat
endpoint (see app/agent/). Run directly in your own terminal:

    python agent_cli.py                          # interactive REPL
    python agent_cli.py "which providers are stuck at high risk?"   # one-shot

Requires:
  - The Claude Code CLI available on PATH (the Python claude_agent_sdk
    communicates with it under the hood) -- install via
    `npm install -g @anthropic-ai/claude-code` if `claude --version` fails.
  - ANTHROPIC_API_KEY set (or an active `claude login` / `ant auth login` profile).
"""

import asyncio
import sys

from dotenv import load_dotenv

load_dotenv()

from claude_agent_sdk import (  # noqa: E402
    AssistantMessage,
    ClaudeSDKClient,
    ResultMessage,
    TextBlock,
    ToolUseBlock,
)

from app.agent.core import build_options  # noqa: E402
from app.db.seed_db import seed_if_empty  # noqa: E402
from app.db.session import SessionLocal, init_db  # noqa: E402

BANNER = """
Clearview Medical Group -- AI Agent CLI
Ask about providers, claims, denial-reason policy, department summaries.
Ask it to draft/send an email or schedule a meeting with a provider (or group).
Type 'exit' to quit.
"""


def _ensure_db_ready() -> None:
    init_db()
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()


async def _print_turn(client: ClaudeSDKClient) -> None:
    async for message in client.receive_response():
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, ToolUseBlock):
                    short_name = block.name.rsplit("__", 1)[-1]
                    print(f"  \033[2m[using tool: {short_name}]\033[0m")
                if isinstance(block, TextBlock) and block.text.strip():
                    pass  # final text arrives via ResultMessage; avoid double-printing
        if isinstance(message, ResultMessage):
            print(f"\nAgent: {message.result}\n")


async def run_one_shot(prompt: str) -> None:
    async with ClaudeSDKClient(options=build_options()) as client:
        await client.query(prompt)
        await _print_turn(client)


async def run_repl() -> None:
    print(BANNER)
    async with ClaudeSDKClient(options=build_options()) as client:
        while True:
            try:
                user_input = input("You: ").strip()
            except (EOFError, KeyboardInterrupt):
                print("\nExiting.")
                break
            if not user_input:
                continue
            if user_input.lower() in ("exit", "quit"):
                break
            await client.query(user_input)
            await _print_turn(client)


def main() -> None:
    _ensure_db_ready()
    prompt = " ".join(sys.argv[1:]).strip()
    if prompt:
        asyncio.run(run_one_shot(prompt))
    else:
        asyncio.run(run_repl())


if __name__ == "__main__":
    main()
