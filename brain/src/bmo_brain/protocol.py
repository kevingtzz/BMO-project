"""
Protocol types and serialization for BMO face <-> brain communication.

Messages match the contract in face/src/services/socket.ts (BrainMessage).
"""

import logging
from typing import Literal, TypedDict

from bmo_brain.face_contract import (
    FACE_CONTRACT_VERSION,
    normalize_face_preset,
)

logger = logging.getLogger(__name__)

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


class MessageStartPayload(TypedDict):
    type: Literal["message_start"]
    id: str


class MessageChunkPayload(TypedDict):
    type: Literal["message_chunk"]
    id: str
    index: int
    text: str


class MessageEndPayload(TypedDict):
    type: Literal["message_end"]
    id: str


class StatePayload(TypedDict):
    type: Literal["state"]
    value: StateValue


class SpeakingEndPayload(TypedDict):
    type: Literal["speaking_end"]


class ContractInfoPayload(TypedDict):
    type: Literal["contract_info"]
    version: str


class EmotionPayload(TypedDict, total=False):
    type: Literal["emotion"]
    value: str  # EyeExpression
    duration_ms: int


def message(text: str) -> MessagePayload:
    """Build a message payload (speech text shown on face). Legacy: full text."""
    return {"type": "message", "text": text}


def message_start(id: str) -> MessageStartPayload:
    """Start a new response; face clears and uses this id for following chunks."""
    return {"type": "message_start", "id": id}


def message_chunk(id: str, index: int, text: str) -> MessageChunkPayload:
    """Stream chunk (e.g. phrase/sentence). End of response is signaled with message_end."""
    return {"type": "message_chunk", "id": id, "index": index, "text": text}


def message_end(id: str) -> MessageEndPayload:
    """End of response."""
    return {"type": "message_end", "id": id}


def state(value: StateValue) -> StatePayload:
    """Build a state payload (idle / listening / thinking / speaking)."""
    return {"type": "state", "value": value}


def speaking_end() -> SpeakingEndPayload:
    """Build speaking_end payload (stop mouth animation)."""
    return {"type": "speaking_end"}


def contract_info(version: str) -> ContractInfoPayload:
    """Build contract_info payload (shared contract version)."""
    return {"type": "contract_info", "version": version}


def emotion(value: str, duration_ms: int | None = None) -> EmotionPayload:
    """
    Build an emotion payload.

    If value matches shared face contract aliases, emit canonical preset key.
    """
    canonical = normalize_face_preset(value)
    if canonical is None:
        logger.warning(
            "Emotion value '%s' not present in face contract v%s; sending raw value",
            value,
            FACE_CONTRACT_VERSION,
        )
    payload: EmotionPayload = {"type": "emotion", "value": canonical or value}
    if duration_ms is not None:
        payload["duration_ms"] = duration_ms
    return payload


def to_json_dict(
    payload: MessagePayload
    | MessageStartPayload
    | MessageChunkPayload
    | MessageEndPayload
    | StatePayload
    | SpeakingEndPayload
    | ContractInfoPayload
    | EmotionPayload,
) -> dict:
    """Return the payload as a dict ready for json.dumps (same shape the face expects)."""
    return dict(payload)
