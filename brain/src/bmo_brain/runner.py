"""
Runner: stream LLM reply to the face (or echo when no API key).
Runs lightweight infer_expression first and drains its events (face reacts early),
then sends thinking/speaking, message_start/chunk/end, speaking_end.
"""

import uuid

from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

from bmo_brain.config import OPENAI_MODEL, use_openai
from bmo_brain.face_adapter import (
    broadcast,
    send_message_chunk,
    send_message_end,
    send_message_start,
)
from bmo_brain.nodes import infer_expression
from bmo_brain.protocol import (
    message as build_message,
    speaking_end as build_speaking_end,
    state as build_state,
    to_json_dict,
)

# Chunk boundaries: emit a chunk when we hit one of these (phonetic/sentence sense)
CHUNK_BOUNDARIES = frozenset(".,;:!?\n")


async def run_on_input(user_text: str) -> None:
    """
    First run infer_expression and drain its events (emotion) so the face reacts immediately.
    Then send thinking/speaking, stream LLM reply (or echo), speaking_end.
    """
    step = infer_expression({"last_input": user_text})
    for payload in step.get("pending_face_events") or []:
        await broadcast(payload)

    await broadcast(to_json_dict(build_state("thinking")))
    await broadcast(to_json_dict(build_state("speaking")))

    if use_openai():
        response_id = str(uuid.uuid4())
        await send_message_start(response_id)
        chunk_index = 0
        buffer = ""
        llm = ChatOpenAI(model=OPENAI_MODEL)
        async for chunk in llm.astream([HumanMessage(content=user_text)]):
            part = (chunk.content or "") if hasattr(chunk, "content") else str(chunk)
            for char in part:
                buffer += char
                if char in CHUNK_BOUNDARIES and buffer:
                    await send_message_chunk(response_id, chunk_index, buffer)
                    chunk_index += 1
                    buffer = ""
        if buffer:
            await send_message_chunk(response_id, chunk_index, buffer)
        await send_message_end(response_id)
    else:
        await broadcast(to_json_dict(build_message(user_text)))

    await broadcast(to_json_dict(build_speaking_end()))
