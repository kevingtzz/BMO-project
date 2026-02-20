"""
Protocol types and serialization for BMO face <-> brain communication.

Messages match the contract in face/src/services/socket.ts (BrainMessage).
"""

from typing import Literal, TypedDict

# State values drive mouth mode and animation (face App.tsx)
StateValue = Literal["idle", "listening", "thinking", "speaking"]

# Eye expressions supported by BmoEyes (face)
EyeExpression = Literal[
    "neutral",
    "happy",
    "sad",
    "surprised",
    "thinking",
    "angry",
    "closed",
    "sleeping",
]


class MessagePayload(TypedDict):
    type: Literal["message"]
    text: str


class StatePayload(TypedDict):
    type: Literal["state"]
    value: StateValue


class SpeakingEndPayload(TypedDict):
    type: Literal["speaking_end"]


class EmotionPayload(TypedDict, total=False):
    type: Literal["emotion"]
    value: str  # EyeExpression
    duration_ms: int


def message(text: str) -> MessagePayload:
    """Build a message payload (speech text shown on face)."""
    return {"type": "message", "text": text}


def state(value: StateValue) -> StatePayload:
    """Build a state payload (idle / listening / thinking / speaking)."""
    return {"type": "state", "value": value}


def speaking_end() -> SpeakingEndPayload:
    """Build speaking_end payload (stop mouth animation)."""
    return {"type": "speaking_end"}


def emotion(value: str, duration_ms: int | None = None) -> EmotionPayload:
    """Build an emotion payload (eye expression, optional duration in ms)."""
    payload: EmotionPayload = {"type": "emotion", "value": value}
    if duration_ms is not None:
        payload["duration_ms"] = duration_ms
    return payload


def to_json_dict(
    payload: MessagePayload | StatePayload | SpeakingEndPayload | EmotionPayload,
) -> dict:
    """Return the payload as a dict ready for json.dumps (same shape the face expects)."""
    return dict(payload)
