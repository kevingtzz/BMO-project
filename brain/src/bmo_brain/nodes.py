"""
Graph nodes: pure state-in, state-out. No I/O to the face (output via pending_face_events).
Uses OpenAI when OPENAI_API_KEY is set; otherwise echoes input.
"""

from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

from bmo_brain.config import OPENAI_MODEL, use_openai
from bmo_brain.protocol import (
    EyeExpression,
    emotion as build_emotion,
    message as build_message,
    speaking_end as build_speaking_end,
    state as build_state,
    to_json_dict,
)
from bmo_brain.state import State

# Default duration (ms) for the chosen expression after the reply
EMOTION_DURATION_MS = 2_000


def _reply_text(user_text: str) -> str:
    """Get reply text: from OpenAI if OPENAI_API_KEY is set, else echo."""
    if use_openai():
        llm = ChatOpenAI(model=OPENAI_MODEL)  # api_key from env OPENAI_API_KEY
        response = llm.invoke([HumanMessage(content=user_text)])
        return (response.content or "").strip() if response else user_text
    return user_text


def _infer_expression_from_input(user_text: str) -> EyeExpression:
    """
    Lightweight inference: pick BMO eye expression from user input only (no LLM).
    Can be replaced later with gpt-4o-mini or similar for richer nuance.
    """
    lower = user_text.lower().strip()
    if any(w in lower for w in ("chiste", "joke", "risa", "gracioso", "😂", "🤣")):
        return "happy"
    if any(w in lower for w in ("triste", "sad", "llorar", "mal")):
        return "sad"
    if any(w in lower for w in ("sorpresa", "surprise", "wow", "increíble")):
        return "surprised"
    if "?" in lower:
        return "thinking"
    return "neutral"


def infer_expression(state: State) -> dict:
    """
    Light, fast node: infer eye expression from last_input only. Writes chosen_expression
    and one emotion event so the runner can drain early (face reacts before LLM reply).
    """
    user_text = state.get("last_input") or ""
    expression = _infer_expression_from_input(user_text)
    event = to_json_dict(build_emotion(expression, duration_ms=EMOTION_DURATION_MS))
    return {
        "chosen_expression": expression,
        "pending_face_events": [event],
    }


def process_input(state: State) -> dict:
    """
    Heavy node: LLM (or echo), then enqueue thinking, message, speaking_end.
    Uses chosen_expression from state (already sent by infer_expression); no duplicate emotion.
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
        "last_reply": reply,
        "pending_face_events": events,
    }
