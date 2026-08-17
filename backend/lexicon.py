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
LOW_VALUE_HINTS = (
    "skeleton",
    "empty state",
    "loading state",
    "placeholder",
    "dummy",
    "stub",
    "command palette",
    "toast",
    "tooltip",
    "badge",
    "chip",
)
MICRO_FRAGMENT_HINTS = (
    "button",
    "badge",
    "chip",
    "pill",
    "icon",
    "avatar",
    "toggle",
    "switch",
    "radio",
    "checkbox",
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
    meta.setdefault("section_richness", _section_richness(normalized))
    meta.setdefault("low_value_fragment", _is_low_value_fragment(normalized))
    meta.setdefault("micro_fragment", _is_micro_fragment(normalized))
    meta.setdefault("retrieval_weight", _retrieval_weight(normalized, category))
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


def _section_richness(entry: dict[str, Any]) -> float:
    html_fragment = str(entry.get("html") or "").strip().lower()
    if not html_fragment:
        return 0.0

    block_nodes = sum(html_fragment.count(token) for token in ("<section", "<article", "<nav", "<aside", "<header", "<footer", "<main", "<div", "<li"))
    interactive_nodes = sum(html_fragment.count(token) for token in ("<button", "<a ", "<a>", "<input", "<select", "<textarea"))
    heading_nodes = sum(html_fragment.count(token) for token in ("<h1", "<h2", "<h3", "<h4"))
    text_length = len(re.sub(r"<[^>]+>", " ", html_fragment))

    richness = 0.0
    richness += min(0.35, block_nodes * 0.025)
    richness += min(0.2, interactive_nodes * 0.04)
    richness += min(0.18, heading_nodes * 0.06)
    richness += min(0.27, text_length / 900)
    return round(min(1.0, richness), 4)


def _is_low_value_fragment(entry: dict[str, Any]) -> bool:
    text = " ".join(
        [
            str(entry.get("name", "")).lower(),
            str(entry.get("semantic_description", "")).lower(),
            str(entry.get("payload", "")).lower(),
            str(entry.get("html", "")).lower(),
        ]
    )
    return any(token in text for token in LOW_VALUE_HINTS)


def _is_micro_fragment(entry: dict[str, Any]) -> bool:
    text = " ".join(
        [
            str(entry.get("name", "")).lower(),
            str(entry.get("semantic_description", "")).lower(),
            " ".join(str(tag).lower() for tag in entry.get("tags", [])),
        ]
    )
    html_fragment = str(entry.get("html") or "").lower()
    if any(token in text for token in MICRO_FRAGMENT_HINTS):
        return True
    if html_fragment.startswith("<button") or html_fragment.startswith("<a") or html_fragment.startswith("<span"):
        return True
    return False


def _retrieval_weight(entry: dict[str, Any], category: str) -> float:
    meta = entry.get("meta") or {}
    entity_level = str(meta.get("entity_level") or "component")
    richness = float(meta.get("section_richness") or 0.0)
    low_value = bool(meta.get("low_value_fragment"))
    micro_fragment = bool(meta.get("micro_fragment"))

    weight = 1.0
    if entity_level == "section":
        weight += 0.12 + min(0.18, richness * 0.18)
    elif entity_level == "component":
        weight += min(0.06, richness * 0.06)
    if category == "layouts":
        weight += 0.06
    if low_value:
        weight -= 0.32
    if micro_fragment and entity_level != "section":
        weight -= 0.14
    return round(max(0.25, min(1.4, weight)), 4)


def lexicon_stats() -> dict[str, Any]:
    entries = load_lexicon()
    by_category: dict[str, int] = {}
    quality = {
        "sectionCapable": 0,
        "lowValue": 0,
        "microFragments": 0,
        "richSections": 0,
    }
    for entry in entries:
        by_category[entry["category"]] = by_category.get(entry["category"], 0) + 1
        meta = entry.get("meta") or {}
        if meta.get("section_capable"):
            quality["sectionCapable"] += 1
        if meta.get("low_value_fragment"):
            quality["lowValue"] += 1
        if meta.get("micro_fragment"):
            quality["microFragments"] += 1
        if float(meta.get("section_richness") or 0.0) >= 0.4:
            quality["richSections"] += 1
    return {"total": len(entries), "byCategory": by_category, "quality": quality, "loadedAt": _loaded_at}


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
