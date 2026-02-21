"""
Shared face contract loader for brain<->face synchronization.

Source of truth lives in face/src/contracts/faceContract.json.
This module keeps brain aware of available preset names/aliases.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import TypedDict


class _FaceContract(TypedDict):
    version: str
    aliases: dict[str, str]
    presets: dict[str, dict]


def _contract_path() -> Path:
    repo_root = Path(__file__).resolve().parents[3]
    return repo_root / "face" / "src" / "contracts" / "faceContract.json"


def _load_contract() -> _FaceContract:
    path = _contract_path()
    if not path.exists():
        # Minimal fallback for environments where face/ is not present.
        return {"version": "missing", "aliases": {}, "presets": {}}
    return json.loads(path.read_text(encoding="utf-8"))


_CONTRACT = _load_contract()
FACE_CONTRACT_VERSION: str = _CONTRACT.get("version", "unknown")
FACE_PRESET_ALIASES: dict[str, str] = dict(_CONTRACT.get("aliases", {}))
FACE_PRESETS: dict[str, dict] = dict(_CONTRACT.get("presets", {}))


def normalize_face_preset(value: str) -> str | None:
    """Normalize incoming emotion/preset text into canonical preset key."""
    key = value.strip().lower().replace("/", "_").replace(" ", "_")
    return FACE_PRESET_ALIASES.get(key)


def is_supported_emotion_value(value: str) -> bool:
    """Return True when value is known by the shared contract aliases."""
    return normalize_face_preset(value) is not None
