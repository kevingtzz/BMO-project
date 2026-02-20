"""
Runner: invoke the graph and send pending_face_events to the face via the adapter.
"""

from bmo_brain.face_adapter import broadcast
from bmo_brain.graph import graph


async def run_on_input(user_text: str) -> None:
    """
    Invoke the graph with last_input; drain pending_face_events and broadcast each to the face.
    """
    result = await graph.ainvoke({"last_input": user_text})
    events = result.get("pending_face_events") or []
    for payload in events:
        if isinstance(payload, dict):
            await broadcast(payload)
