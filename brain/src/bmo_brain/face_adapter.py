"""
Adapter to send BrainMessage payloads to all connected face clients via WebSocket.
"""

import json
import logging

from bmo_brain.protocol import (
    emotion as build_emotion,
    message as build_message,
    message_chunk as build_message_chunk,
    message_end as build_message_end,
    message_start as build_message_start,
    speaking_end as build_speaking_end,
    state as build_state,
    to_json_dict,
)
from bmo_brain.protocol import StateValue
from bmo_brain.server import get_connected

logger = logging.getLogger(__name__)


async def broadcast(payload: dict) -> None:
    """Send a JSON payload to every connected WebSocket client. Drops dead connections."""
    msg_type = payload.get("type", "?")
    logger.info("Brain -> face: type=%s payload=%s", msg_type, payload)
    text = json.dumps(payload)
    dead = []
    for ws in list(get_connected()):
        try:
            await ws.send(text)
        except Exception as e:
            logger.warning("Send failed for a client: %s", e)
            dead.append(ws)
    for ws in dead:
        get_connected().discard(ws)


async def send_state(value: StateValue) -> None:
    """Send state (idle / listening / thinking / speaking) to the face."""
    await broadcast(to_json_dict(build_state(value)))


async def send_message(text: str) -> None:
    """Send speech text to the face (legacy: single full text)."""
    await broadcast(to_json_dict(build_message(text)))


async def send_message_start(id: str) -> None:
    """Start a new response stream; face clears and tracks by id."""
    await broadcast(to_json_dict(build_message_start(id)))


async def send_message_chunk(id: str, index: int, text: str) -> None:
    """Send one chunk of the response (e.g. phrase/sentence)."""
    await broadcast(to_json_dict(build_message_chunk(id, index, text)))


async def send_message_end(id: str) -> None:
    """Signal end of response stream."""
    await broadcast(to_json_dict(build_message_end(id)))


async def send_emotion(value: str, duration_ms: int | None = None) -> None:
    """Send eye expression to the face, optionally with duration in ms."""
    await broadcast(to_json_dict(build_emotion(value, duration_ms)))


async def send_speaking_end() -> None:
    """Tell the face to stop mouth animation."""
    await broadcast(to_json_dict(build_speaking_end()))
