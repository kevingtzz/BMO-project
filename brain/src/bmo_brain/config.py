"""
Config from environment: OpenAI API key and model for the brain LLM.
"""

import os

# OpenAI: set OPENAI_API_KEY to enable real model; optional OPENAI_MODEL (default below)
OPENAI_API_KEY: str | None = os.environ.get("OPENAI_API_KEY") or None
OPENAI_MODEL: str = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

def use_openai() -> bool:
    """True if OPENAI_API_KEY is set and non-empty."""
    return bool(OPENAI_API_KEY and OPENAI_API_KEY.strip())
