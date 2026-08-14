from __future__ import annotations

import json
import re
from time import time
from typing import Any

from .config import LEXICON_CATEGORIES, LEXICON_DIR

_entries: list[dict[str, Any]] | None = None
_loaded_at = 0.0


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "entry"


def load_lexicon(force: bool = False) -> list[dict[str, Any]]:
    global _entries, _loaded_at
    if _entries is not None and not force:
        return _entries

    entries: list[dict[str, Any]] = []
    for category in LEXICON_CATEGORIES:
        file_path = LEXICON_DIR / f"{category}.json"
        if not file_path.exists():
            continue
        parsed = json.loads(file_path.read_text(encoding="utf-8"))
        for entry in parsed.get("entries", []):
            normalized = normalize_entry(entry, category)
            entries.append(normalized)

    custom_file = LEXICON_DIR / "custom.json"
    if custom_file.exists():
        parsed = json.loads(custom_file.read_text(encoding="utf-8"))
        for entry in parsed.get("entries", []):
            category = entry.get("category", "components")
            entries.append(normalize_entry(entry, category))

    _entries = entries
    _loaded_at = time()
    return entries


def normalize_entry(entry: dict[str, Any], category: str) -> dict[str, Any]:
    normalized = dict(entry)
    normalized["category"] = category
    normalized["id"] = normalized.get("id") or f"{category}.{_slugify(normalized['name'])}"
    normalized["tags"] = [str(tag) for tag in normalized.get("tags", [])]
    normalized["payload"] = normalized.get("payload") or ""
    normalized["conflicts"] = [str(item) for item in normalized.get("conflicts", [])]
    return normalized


def lexicon_stats() -> dict[str, Any]:
    entries = load_lexicon()
    by_category: dict[str, int] = {}
    for entry in entries:
        by_category[entry["category"]] = by_category.get(entry["category"], 0) + 1
    return {"total": len(entries), "byCategory": by_category, "loadedAt": _loaded_at}


def add_custom_entry(entry: dict[str, Any]) -> dict[str, Any]:
    custom_file = LEXICON_DIR / "custom.json"
    payload = {
        "category": entry["category"],
        "version": "1.0.0",
        "count": 0,
        "entries": [],
    }
    if custom_file.exists():
        payload = json.loads(custom_file.read_text(encoding="utf-8"))
    payload["entries"] = [item for item in payload.get("entries", []) if item.get("id") != entry["id"]]
    payload["entries"].append(entry)
    payload["count"] = len(payload["entries"])
    custom_file.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    load_lexicon(force=True)
    return {"ok": True, "id": entry["id"]}


def custom_entry_id(category: str, name: str) -> str:
    return f"custom.{category}.{_slugify(name)}"
