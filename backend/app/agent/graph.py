from __future__ import annotations

from functools import lru_cache
from typing import Any

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage, ToolMessage
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

from app.agent.llm import get_llm
from app.agent.prompts import build_system_prompt
from app.agent.state import AgentState
from app.agent.tools import TOOLS


def _agent_node(llm_with_tools):
    async def node(state: AgentState) -> dict[str, list[BaseMessage]]:
        system = SystemMessage(content=build_system_prompt(state.get("hcp_context")))
        # Ensure the system prompt is always first
        messages = [system, *state["messages"]]
        response = await llm_with_tools.ainvoke(messages)
        return {"messages": [response]}

    return node


@lru_cache(maxsize=1)
def build_graph():
    """Build and compile the LangGraph StateGraph once."""
    llm = get_llm().bind_tools(TOOLS)

    graph = StateGraph(AgentState)
    graph.add_node("agent", _agent_node(llm))
    graph.add_node("tools", ToolNode(TOOLS))

    graph.add_edge(START, "agent")
    graph.add_conditional_edges(
        "agent",
        tools_condition,
        {"tools": "tools", END: END},
    )
    graph.add_edge("tools", "agent")

    return graph.compile()


async def run_turn(
    user_message: str,
    history: list[BaseMessage] | None = None,
    hcp_context: dict | None = None,
) -> dict[str, Any]:
    """Run a single chat turn through the graph.

    Returns a dict with:
      - reply: final assistant text
      - tool_events: list of {tool, args, result}
      - messages: updated full message list (for the frontend to persist)
    """
    graph = build_graph()
    initial_messages: list[BaseMessage] = list(history or [])
    initial_messages.append(HumanMessage(content=user_message))

    final_state = await graph.ainvoke(
        {"messages": initial_messages, "hcp_context": hcp_context},
        config={"recursion_limit": 8},
    )

    messages: list[BaseMessage] = final_state["messages"]

    # Extract tool events: pair AI tool_calls with matching ToolMessages by id
    tool_events: list[dict[str, Any]] = []
    tool_msgs_by_id = {
        m.tool_call_id: m for m in messages if isinstance(m, ToolMessage) and m.tool_call_id
    }
    for m in messages:
        if isinstance(m, AIMessage) and getattr(m, "tool_calls", None):
            for tc in m.tool_calls:
                tm = tool_msgs_by_id.get(tc.get("id", ""))
                tool_events.append({
                    "tool": tc.get("name"),
                    "args": tc.get("args") or {},
                    "result": tm.content if tm else None,
                })

    # Final assistant reply = last AIMessage without tool_calls
    reply = ""
    for m in reversed(messages):
        if isinstance(m, AIMessage) and not getattr(m, "tool_calls", None):
            reply = m.content if isinstance(m.content, str) else str(m.content)
            break

    return {"reply": reply, "tool_events": tool_events, "messages": messages}
