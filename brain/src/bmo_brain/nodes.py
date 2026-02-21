"""
Graph nodes: pure state-in, state-out. No I/O to the face (output via pending_face_events).
Uses OpenAI when OPENAI_API_KEY is set; otherwise echoes input.
"""

from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

from bmo_brain.config import OPENAI_MODEL, use_openai
from bmo_brain.protocol import (
    EyeExpression,
    message as build_message,
    speaking_end as build_speaking_end,
    state as build_state,
    to_json_dict,
)
from bmo_brain.state import State

# Primary expression while BMO answers.
RESPONSE_TONE_DURATION_MS = 2_000


def _reply_text(user_text: str) -> str:
    """Get reply text: from OpenAI if OPENAI_API_KEY is set, else echo."""
    if use_openai():
        llm = ChatOpenAI(model=OPENAI_MODEL)  # api_key from env OPENAI_API_KEY
        response = llm.invoke([HumanMessage(content=user_text)])
        return (response.content or "").strip() if response else user_text
    return user_text


def infer_response_tone_expression(reply_text: str) -> EyeExpression:
    """
    Infer the main emotion from the assistant reply tone (phase 2).
    """
    lower = reply_text.lower().strip()
    if not lower:
        return "neutral"
    if any(w in lower for w in ("jaja", "jajaja", "😂", "🤣", "genial", "me encanta", "feliz")):
        return "happy"
    if any(w in lower for w in ("lo siento", "perdón", "lament", "triste")):
        return "sad"
    if any(w in lower for w in ("ojo", "cuidado", "error", "no deberías", "no deberia")):
        return "angry"
    if any(
        w in lower
        for w in (
            "wow",
            "sorprendente",
            "increíble",
            "increible",
            "no puede ser",
            "qué loco",
            "que loco",
        )
    ):
        return "surprised"
    if "?" in lower:
        return "thinking"
    return "neutral"


def process_input(state: State) -> dict:
    """
    Heavy node: LLM (or echo), then enqueue thinking, message, speaking_end.
    Response tone is inferred from reply text only.
    """
    user_text = state.get("last_input") or ""
    reply = _reply_text(user_text)
    response_tone = infer_response_tone_expression(reply)
    events = [
        to_json_dict(build_state("thinking")),
        to_json_dict(build_message(reply)),
        to_json_dict(build_speaking_end()),
    ]
    return {
        "current_phase": "thinking",
        "last_reply": reply,
        "response_tone_expression": response_tone,
        "pending_face_events": events,
    }
