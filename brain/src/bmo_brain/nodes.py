"""
Graph nodes: pure state-in, state-out. No I/O to the face (output via pending_face_events).
Uses OpenAI when OPENAI_API_KEY is set; otherwise echoes input.
"""

from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

from bmo_brain.config import OPENAI_MODEL, use_openai
from bmo_brain.protocol import (
    message as build_message,
    speaking_end as build_speaking_end,
    state as build_state,
    to_json_dict,
)
from bmo_brain.state import State


def _reply_text(user_text: str) -> str:
    """Get reply text: from OpenAI if OPENAI_API_KEY is set, else echo."""
    if use_openai():
        llm = ChatOpenAI(model=OPENAI_MODEL)  # api_key from env OPENAI_API_KEY
        response = llm.invoke([HumanMessage(content=user_text)])
        return (response.content or "").strip() if response else user_text
    return user_text


def process_input(state: State) -> dict:
    """
    React to last user input: enqueue thinking, reply (LLM or echo), speaking_end for the face.
    Reads state["last_input"]; returns partial state update with pending_face_events.
    """
    user_text = state.get("last_input") or ""
    reply = _reply_text(user_text)
    events = [
        to_json_dict(build_state("thinking")),
        to_json_dict(build_message(reply)),
        to_json_dict(build_speaking_end()),
    ]
    return {
        "current_phase": "thinking",
        "pending_face_events": events,
    }
