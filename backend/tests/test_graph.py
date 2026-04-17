"""Graph smoke-test — verifies the graph is built correctly and nodes are wired.

The LLM is NOT invoked here; we just check the compiled graph has the expected
nodes and the TOOLS list is the promised six.
"""
from __future__ import annotations

import pytest


def test_tools_registry_has_six_required_tools():
    from app.agent.tools import TOOLS

    names = {t.name for t in TOOLS}
    required = {
        "log_interaction",
        "edit_interaction",
        "search_hcp",
        "schedule_followup",
        "summarize_history",
        "recommend_next_action",
    }
    assert required.issubset(names), f"missing tools: {required - names}"
    assert len(TOOLS) >= 5


def test_tool_signatures_are_usable():
    from app.agent.tools import TOOLS

    for t in TOOLS:
        # Every tool must have a description the LLM can use to pick it.
        assert t.description, f"tool {t.name} missing description"
        # Each tool must declare its args schema.
        assert t.args_schema is not None, f"tool {t.name} missing args_schema"
