"""
Runner: stream LLM reply to the face (or echo when no API key).
Emotion is decided from reply tone only (single decision source).
If tone is still unclear by a small timeout, keep recent emotion or fallback to thinking.
"""

import uuid
from time import monotonic

from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

from bmo_brain.config import OPENAI_MODEL, use_openai
from bmo_brain.face_adapter import (
    broadcast,
    send_message_chunk,
    send_message_end,
    send_message_start,
)
from bmo_brain.nodes import (
    RESPONSE_TONE_DURATION_MS,
    infer_response_tone_expression,
)
from bmo_brain.protocol import (
    emotion as build_emotion,
    message as build_message,
    speaking_end as build_speaking_end,
    state as build_state,
    to_json_dict,
)

# Chunk boundaries: emit a chunk when we hit one of these (phonetic/sentence sense)
CHUNK_BOUNDARIES = frozenset(".,;:!?\n")
EMOTION_DECISION_TIMEOUT_MS = 450
EMOTION_HOLD_MS = 1_500
MIN_RESPONSE_CHARS_FOR_TONE = 24
FALLBACK_EMOTION = "thinking"

# Memory across turns to avoid unnecessary jumps.
_last_emotion_value: str | None = None
_last_emotion_sent_at: float = 0.0


def _has_recent_emotion(now: float) -> bool:
    return _last_emotion_value is not None and (now - _last_emotion_sent_at) * 1000 < EMOTION_HOLD_MS


async def _emit_emotion(value: str, duration_ms: int = RESPONSE_TONE_DURATION_MS) -> None:
    global _last_emotion_value, _last_emotion_sent_at
    await broadcast(to_json_dict(build_emotion(value, duration_ms=duration_ms)))
    _last_emotion_value = value
    _last_emotion_sent_at = monotonic()


async def _decide_and_maybe_emit_response_emotion(
    *,
    reply_text: str,
    deadline_reached: bool,
) -> bool:
    """
    Return True when emotional decision is closed for this turn.
    """
    now = monotonic()
    tone = infer_response_tone_expression(reply_text)

    # Strong tone: emit unless it is already the current emotion.
    if tone not in {"neutral", "thinking"}:
        if tone != _last_emotion_value:
            await _emit_emotion(tone)
        return True

    # Not enough semantic signal yet: keep waiting until timeout.
    if not deadline_reached and len(reply_text) < MIN_RESPONSE_CHARS_FOR_TONE:
        return False

    # Low-signal after timeout: keep recent expression or fallback to thinking.
    if _has_recent_emotion(now):
        return True
    if _last_emotion_value != FALLBACK_EMOTION:
        await _emit_emotion(FALLBACK_EMOTION, duration_ms=1_000)
    return True


async def run_on_input(user_text: str) -> None:
    """
    Send thinking/speaking, stream reply, and decide emotion from response tone only.
    If tone is unclear by timeout, keep recent emotion or fallback to thinking.
    """
    await broadcast(to_json_dict(build_state("thinking")))
    await broadcast(to_json_dict(build_state("speaking")))
    decision_deadline = monotonic() + (EMOTION_DECISION_TIMEOUT_MS / 1000.0)
    emotion_decision_closed = False

    if use_openai():
        response_id = str(uuid.uuid4())
        await send_message_start(response_id)
        chunk_index = 0
        buffer = ""
        full_reply = ""
        llm = ChatOpenAI(model=OPENAI_MODEL)
        async for chunk in llm.astream([HumanMessage(content=user_text)]):
            part = (chunk.content or "") if hasattr(chunk, "content") else str(chunk)
            full_reply += part
            for char in part:
                buffer += char
                if char in CHUNK_BOUNDARIES and buffer:
                    if not emotion_decision_closed:
                        emotion_decision_closed = await _decide_and_maybe_emit_response_emotion(
                            reply_text=full_reply,
                            deadline_reached=monotonic() >= decision_deadline,
                        )
                    await send_message_chunk(response_id, chunk_index, buffer)
                    chunk_index += 1
                    buffer = ""
        if buffer:
            await send_message_chunk(response_id, chunk_index, buffer)
        if not emotion_decision_closed:
            emotion_decision_closed = await _decide_and_maybe_emit_response_emotion(
                reply_text=full_reply,
                deadline_reached=True,
            )
        await send_message_end(response_id)
    else:
        emotion_decision_closed = await _decide_and_maybe_emit_response_emotion(
            reply_text=user_text,
            deadline_reached=True,
        )
        await broadcast(to_json_dict(build_message(user_text)))

    await broadcast(to_json_dict(build_speaking_end()))
