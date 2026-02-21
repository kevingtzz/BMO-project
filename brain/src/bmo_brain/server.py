"""
WebSocket server for BMO face connections.

Listens on 0.0.0.0:8765, registers connected clients (no business logic yet).
"""

import asyncio
import json
import logging

from bmo_brain.face_contract import FACE_CONTRACT_VERSION
from bmo_brain.protocol import contract_info as build_contract_info, to_json_dict
from websockets.asyncio.server import serve

logger = logging.getLogger(__name__)

# Clients that have completed the WebSocket handshake (ServerConnection)
_connected: set = set()


def get_connected() -> set:
    """Return the set of connected WebSocket connections (for broadcasting in Paso 4)."""
    return _connected


async def _handle_incoming(raw: str | bytes) -> None:
    """Log and optionally respond to a message from the face (e.g. type=input -> echo)."""
    text = raw.decode("utf-8") if isinstance(raw, bytes) else raw
    try:
        data = json.loads(text)
        if not isinstance(data, dict):
            logger.info("Face -> brain: payload=%s", data)
            return
        msg_type = data.get("type", "?")
        logger.info("Face -> brain: type=%s payload=%s", msg_type, data)
        if msg_type == "input" and "text" in data:
            from bmo_brain.runner import run_on_input
            await run_on_input(str(data["text"]))
    except (json.JSONDecodeError, TypeError):
        preview = text[:200] + "..." if len(text) > 200 else text
        logger.info("Face -> brain: (raw) %s", preview)


async def _handler(websocket) -> None:
    """Register client on connect, unregister on disconnect."""
    _connected.add(websocket)
    logger.info("Face connected (total: %d)", len(_connected))
    await websocket.send(json.dumps(to_json_dict(build_contract_info(FACE_CONTRACT_VERSION))))
    try:
        async for raw in websocket:
            await _handle_incoming(raw)
    finally:
        _connected.discard(websocket)
        logger.info("Face disconnected (remaining: %d)", len(_connected))


async def _demo_broadcast() -> None:
    """After a short delay, send state thinking + message 'Hola' when at least one client is connected (for manual verification)."""
    await asyncio.sleep(2)
    if not _connected:
        return
    from bmo_brain.face_adapter import send_message, send_state
    await send_state("thinking")
    await send_message("Hola")


async def run_server(host: str = "0.0.0.0", port: int = 8765) -> None:
    """Run the WebSocket server until cancelled."""
    async with serve(_handler, host, port) as ws_server:
        logger.info("Brain WebSocket server listening on %s:%d", host, port)
        asyncio.create_task(_demo_broadcast())
        await asyncio.Future()  # run forever


def run(host: str = "0.0.0.0", port: int = 8765) -> None:
    """Entry point: run the server (blocks)."""
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")
    asyncio.run(run_server(host=host, port=port))
