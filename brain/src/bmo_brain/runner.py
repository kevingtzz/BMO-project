"""
Runner: stream LLM reply to the face (or echo when no API key).
Sends message_start, message_chunk (by phrase/sentence), message_end.
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
    Send thinking/speaking, then stream LLM reply (or echo) to the face, then speaking_end.
    Streams message_start -> message_chunk (by phrase) -> message_end.
    """
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
