"""Run the BMO brain WebSocket server (default: 0.0.0.0:8765)."""
from pathlib import Path

from dotenv import load_dotenv

# Load brain/.env so OPENAI_API_KEY and OPENAI_MODEL are set before any config use
_load_env = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(_load_env)

from bmo_brain.server import run

if __name__ == "__main__":
    run()
