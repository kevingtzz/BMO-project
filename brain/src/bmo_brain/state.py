"""
Graph state for the BMO brain orchestrator.

Domain-only: no references to the face or WebSocket.
Used by LangGraph StateGraph; nodes read/update this state.
"""

import operator
from typing import Annotated, Literal, TypedDict

from bmo_brain.protocol import EyeExpression

# Phase of the conversation flow (aligns with protocol.StateValue)
Phase = Literal["idle", "listening", "thinking", "speaking"]


class State(TypedDict, total=False):
    """Orchestrator state. All keys optional so nodes can return partial updates."""

    # Current phase (mouth/state on face)
    current_phase: Phase
    # Last user input from the face (type=input, text=...)
    last_input: str
    # Last reply text (set by process_input)
    last_reply: str
    # Expression chosen for the face (set by infer_expression; read by process_input)
    chosen_expression: EyeExpression
    # Pending payloads to send to the face (dicts matching protocol)
    # Reducer: nodes return new list; lists are concatenated (append semantics)
    pending_face_events: Annotated[list[dict], operator.add]
