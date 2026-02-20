# BMO Brain

WebSocket server that orchestrates the BMO face. The face connects to the brain and sends/receives messages (state, emotion, speech text, input).

## Setup

- Python 3.11+
- [uv](https://docs.astral.sh/uv/)

```bash
cd brain
uv sync
```

## Run

```bash
uv run python -m bmo_brain
```

Listens on `0.0.0.0:8765` by default.

### OpenAI (optional)

To use a real LLM instead of echoing input, set:

- **`OPENAI_API_KEY`** — Your OpenAI API key (required for LLM replies).
- **`OPENAI_MODEL`** — Model name (default: `gpt-4o-mini`). Examples: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`.

Example:

```bash
export OPENAI_API_KEY=sk-...
export OPENAI_MODEL=gpt-4o-mini
uv run python -m bmo_brain
```

You can put the variables in **`brain/.env`**; the app loads that file on startup (no need to `export`). `brain/.env` is in `.gitignore` so your key is not committed. To use another host/port, call from code:

```python
from bmo_brain.server import run
run(host="127.0.0.1", port=9000)
```

## Protocol (brain → face)

Messages sent by the brain (JSON over WebSocket):

- `{ "type": "message", "text": "..." }` — Speech text on face
- `{ "type": "state", "value": "idle"|"listening"|"thinking"|"speaking" }` — Mouth state
- `{ "type": "speaking_end" }` — Stop mouth animation
- `{ "type": "emotion", "value": "<expression>", "duration_ms": number? }` — Eye expression (e.g. neutral, happy, sad, surprised, thinking, angry, closed, sleeping)

## Protocol (face → brain)

- `{ "type": "input", "text": "..." }` — User input; brain can reply with state + message + speaking_end.

## Using the face with the brain

1. Start the brain: `uv run python -m bmo_brain`
2. Start the face app and open it in the browser (face connects to `ws://localhost:8765` by default; override with `REACT_APP_BRAIN_WS_URL`).
