from __future__ import annotations

import json
import re
from time import time
from typing import Any

from .config import LEXICON_CATEGORIES, LEXICON_DIR

_entries: list[dict[str, Any]] | None = None
_loaded_at = 0.0
SECTION_HTML_HINTS = (
    "<section",
    "<header",
    "<footer",
    "<nav",
    "<main",
    "<article",
    "<table",
    "<aside",
    "<h1",
)
MODIFIER_HINTS = (
    "accent",
    "size",
    "variant",
    "tone",
    "padding",
    "radius",
    "border",
    "shadow",
    "color",
    "spacing",
    "density",
)


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
    html_fragment = str(normalized.get("html") or "")
    meta = dict(normalized.get("meta") or {})
    normalized["meta"] = meta
    meta.setdefault("has_html", bool(html_fragment))
    meta.setdefault(
        "section_capable",
        bool(html_fragment and any(hint in html_fragment.lower() for hint in SECTION_HTML_HINTS)),
    )
    meta.setdefault("enrichment_only", category in {"styles", "interactions", "utilities", "typography"})
    meta.setdefault("entity_level", _infer_entity_level(normalized, category))
    return normalized


def _infer_entity_level(entry: dict[str, Any], category: str) -> str:
    meta = dict(entry.get("meta") or {})
    explicit = meta.get("entity_level")
    if isinstance(explicit, str) and explicit.strip():
        return explicit.strip().lower()

    if category == "interactions":
        return "interaction"
    if category == "utilities":
        return "utility"
    if category in {"styles", "typography"}:
        return "modifier"
    if category == "layouts":
        return "section"

    html_fragment = str(entry.get("html") or "").strip().lower()
    name = str(entry.get("name", "")).lower()
    semantic = str(entry.get("semantic_description", "")).lower()
    payload = str(entry.get("payload", "")).lower()
    tags = {str(tag).lower() for tag in entry.get("tags", [])}

    if meta.get("section_capable"):
        return "section"

    if html_fragment:
        if _looks_like_large_fragment(html_fragment, tags, semantic):
            return "section"
        return "component"

    modifier_signal = 0
    if any(hint in name for hint in MODIFIER_HINTS):
        modifier_signal += 1
    if any(hint in semantic for hint in MODIFIER_HINTS):
        modifier_signal += 1
    if any(hint in payload for hint in MODIFIER_HINTS):
        modifier_signal += 1
    if {"accent", "size", "variant", "tone"} & tags:
        modifier_signal += 1

    if modifier_signal >= 2:
        return "modifier"
    return "component"


def _looks_like_large_fragment(html_fragment: str, tags: set[str], semantic: str) -> bool:
    strong_tags = {"hero", "pricing", "faq", "testimonial", "sidebar", "nav", "catalog", "docs", "dashboard"}
    if strong_tags & tags:
        return True
    if any(token in semantic for token in ("section", "grid", "layout", "shell", "panel group", "workspace")):
        return True
    return any(tag in html_fragment for tag in ("<section", "<article", "<nav", "<aside", "<header", "<footer", "<main", "<table"))


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
