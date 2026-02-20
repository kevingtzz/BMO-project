"""
Graph state for the BMO brain orchestrator.

Domain-only: no references to the face or WebSocket.
Used by LangGraph StateGraph; nodes read/update this state.
"""

from typing import Literal, TypedDict

# Phase of the conversation flow (aligns with protocol.StateValue)
Phase = Literal["idle", "listening", "thinking", "speaking"]


class State(TypedDict, total=False):
    """Orchestrator state. All keys optional so nodes can return partial updates."""

    # Current phase (mouth/state on face)
    current_phase: Phase
    # Last user input from the face (type=input, text=...)
    last_input: str
    # Pending payloads to send to the face (dicts matching protocol: type, text, value, duration_ms)
    # Runner drains this and calls the FaceAdapter
    pending_face_events: list[dict]
