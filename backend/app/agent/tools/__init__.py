from app.agent.tools.edit_interaction import edit_interaction
from app.agent.tools.log_interaction import log_interaction
from app.agent.tools.recommend_next_action import recommend_next_action
from app.agent.tools.schedule_followup import schedule_followup
from app.agent.tools.search_hcp import search_hcp
from app.agent.tools.summarize_history import summarize_history

TOOLS = [
    log_interaction,
    edit_interaction,
    search_hcp,
    schedule_followup,
    summarize_history,
    recommend_next_action,
]

__all__ = [
    "TOOLS",
    "log_interaction",
    "edit_interaction",
    "search_hcp",
    "schedule_followup",
    "summarize_history",
    "recommend_next_action",
]
