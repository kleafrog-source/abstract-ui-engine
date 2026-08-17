from __future__ import annotations

import hashlib
import json
import math
import pickle
import re
from dataclasses import dataclass
from pathlib import Path
from threading import Lock
from typing import Any

from .config import CACHE_DIR, LEXICON_DIR
from .embeddings import create_provider


PARAMETER_FILES = (
    ("core", LEXICON_DIR / "parameters.json", "parameters"),
    ("mmss", LEXICON_DIR / "parameters-mmss.json", "mmss_parameters"),
)
PARAMETER_EMBEDDING_CACHE_FILE = CACHE_DIR / "parameter_embeddings.pkl"
COLOR_WORDS = {
    "black": "#111111",
    "white": "#ffffff",
    "gray": "#6b7280",
    "grey": "#6b7280",
    "silver": "#c0c0c0",
    "gold": "#d4af37",
    "yellow": "#facc15",
    "amber": "#f59e0b",
    "orange": "#f97316",
    "red": "#ef4444",
    "coral": "#fb7185",
    "pink": "#ec4899",
    "magenta": "#d946ef",
    "purple": "#8b5cf6",
    "violet": "#7c3aed",
    "indigo": "#4f46e5",
    "blue": "#2563eb",
    "cyan": "#06b6d4",
    "aqua": "#22d3ee",
    "teal": "#14b8a6",
    "green": "#22c55e",
    "emerald": "#10b981",
    "lime": "#84cc16",
    "olive": "#65a30d",
    "brown": "#8b5e3c",
    "sand": "#d6b98c",
    "beige": "#e8d6b9",
    "ivory": "#fff8e7",
    "peach": "#fdba74",
    "navy": "#172554",
    "charcoal": "#364153",
    "graphite": "#374151",
    "midnight": "#0f172a",
    "slate": "#475569",
    "бирюз": "#14b8a6",
    "голуб": "#38bdf8",
    "синий": "#2563eb",
    "тёмно-синий": "#172554",
    "темно-синий": "#172554",
    "оранж": "#f97316",
    "красн": "#ef4444",
    "розов": "#ec4899",
    "фиолет": "#8b5cf6",
    "зел": "#22c55e",
    "изумруд": "#10b981",
    "мят": "#6ee7b7",
    "пес": "#d6b98c",
    "беж": "#e8d6b9",
    "янтар": "#f59e0b",
    "уголь": "#1f2937",
    "чёрн": "#111111",
    "черн": "#111111",
    "бел": "#ffffff",
}
LOW_HINTS = ("minimal", "simple", "light", "calm", "clean", "subtle", "plain", "small", "compact")
HIGH_HINTS = ("complex", "rich", "dense", "bold", "dramatic", "immersive", "large", "premium", "chaotic")


@dataclass(frozen=True)
class ParameterCandidate:
    parameter_id: str
    label: str
    value: Any
    text: str
    source: str


_provider_lock = Lock()
_provider: Any | None = None
_candidate_cache: dict[str, list[ParameterCandidate]] = {}
_embedding_cache: dict[str, dict[str, list[float]]] = {}


def _cosine_similarity(left: list[float], right: list[float]) -> float:
    if not left or not right or len(left) != len(right):
        return 0.0
    return sum(a * b for a, b in zip(left, right))


def _schema_digest() -> str:
    digest = hashlib.sha256()
    for _, path, _ in PARAMETER_FILES:
        digest.update(path.read_bytes())
    return digest.hexdigest()


def _get_provider():
    global _provider
    with _provider_lock:
        if _provider is None:
            _provider = create_provider()
        return _provider


def _load_schema_file(path: Path, root_key: str, source: str) -> list[dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    parameters = payload[root_key]
    for item in parameters:
        item["_source"] = source
    return parameters


def load_parameter_schema() -> dict[str, Any]:
    core = _load_schema_file(PARAMETER_FILES[0][1], PARAMETER_FILES[0][2], "core")
    mmss = _load_schema_file(PARAMETER_FILES[1][1], PARAMETER_FILES[1][2], "mmss")
    defaults = {
        parameter["id"]: parameter.get("default")
        for parameter in [*core, *mmss]
    }
    categories: dict[str, list[str]] = {}
    for parameter in [*core, *mmss]:
        key = str(parameter.get("category") or "misc")
        categories.setdefault(key, []).append(parameter["id"])
    return {
        "core": core,
        "mmss": mmss,
        "defaults": defaults,
        "categories": categories,
        "digest": _schema_digest(),
    }


def _bucket_value(minimum: float, maximum: float, bucket: str) -> float:
    span = maximum - minimum
    if bucket == "low":
        return minimum + span * 0.2
    if bucket == "high":
        return minimum + span * 0.8
    return minimum + span * 0.5


def _step_value(minimum: float, maximum: float, step: float, bucket: str) -> float | int:
    raw = _bucket_value(minimum, maximum, bucket)
    if step <= 0:
        return raw
    snapped = round((raw - minimum) / step) * step + minimum
    snapped = max(minimum, min(maximum, snapped))
    if float(step).is_integer() and float(minimum).is_integer() and float(maximum).is_integer():
        return int(round(snapped))
    decimals = max(0, -int(math.floor(math.log10(step)))) if step < 1 else 0
    return round(snapped, decimals + 1)


def _build_range_candidates(parameter: dict[str, Any]) -> list[ParameterCandidate]:
    range_data = parameter.get("range") or {}
    control_type = parameter.get("control_type")
    name = parameter.get("name_en") or parameter["id"]
    description = parameter.get("description_en") or ""

    if control_type == "xy_slider":
        default = parameter.get("default") or {"x": 5, "y": 5}
        return [
            ParameterCandidate(
                parameter_id=parameter["id"],
                label=f"{name} default",
                value=default,
                text=f"{name}. {description}. Balanced layered composition and medium z-index control.",
                source="range_xy_default",
            ),
            ParameterCandidate(
                parameter_id=parameter["id"],
                label=f"{name} low",
                value={"x": range_data["x"]["min"], "y": range_data["y"]["min"]},
                text=f"{name}. {description}. Minimal layering and low overlap.",
                source="range_xy_low",
            ),
            ParameterCandidate(
                parameter_id=parameter["id"],
                label=f"{name} high",
                value={"x": range_data["x"]["max"], "y": range_data["y"]["max"]},
                text=f"{name}. {description}. Advanced layering, overlays, floating menus, tooltips, stacked surfaces.",
                source="range_xy_high",
            ),
        ]

    minimum = float(range_data.get("min", 0))
    maximum = float(range_data.get("max", 1))
    step = float(range_data.get("step", 1))
    candidates: list[ParameterCandidate] = []
    for bucket, bucket_description in (
        ("low", "minimal, subtle, quiet, light"),
        ("mid", "balanced, moderate, standard"),
        ("high", "rich, dense, expressive, advanced"),
    ):
        value = _step_value(minimum, maximum, step, bucket)
        candidates.append(
            ParameterCandidate(
                parameter_id=parameter["id"],
                label=f"{name} {bucket}",
                value=value,
                text=f"{name}. {description}. {bucket_description}.",
                source=f"range_{bucket}",
            )
        )
    return candidates


def _build_option_candidates(parameter: dict[str, Any]) -> list[ParameterCandidate]:
    name = parameter.get("name_en") or parameter["id"]
    description = parameter.get("description_en") or ""
    candidates: list[ParameterCandidate] = []
    for option in parameter.get("options", []):
        if isinstance(option, dict):
            option_value = option.get("value")
            option_label = option.get("label_en") or option.get("label_ru") or str(option_value)
            option_description = option.get("description_en") or option.get("description_ru") or ""
        else:
            option_value = option
            option_label = str(option)
            option_description = ""
        candidates.append(
            ParameterCandidate(
                parameter_id=parameter["id"],
                label=str(option_label),
                value=option_value,
                text=f"{name}. {description}. Option {option_label}. {option_description}",
                source="option",
            )
        )
    return candidates


def _build_candidates(parameter: dict[str, Any]) -> list[ParameterCandidate]:
    cache_key = f"{_schema_digest()}::{parameter['id']}"
    cached = _candidate_cache.get(cache_key)
    if cached is not None:
        return cached
    control_type = parameter.get("control_type")
    if parameter.get("options"):
        candidates = _build_option_candidates(parameter)
    elif control_type in {"slider", "stepper", "xy_slider"}:
        candidates = _build_range_candidates(parameter)
    else:
        name = parameter.get("name_en") or parameter["id"]
        description = parameter.get("description_en") or ""
        candidates = [
            ParameterCandidate(
                parameter_id=parameter["id"],
                label="default",
                value=parameter.get("default"),
                text=f"{name}. {description}. Default value.",
                source="default",
            )
        ]
    _candidate_cache[cache_key] = candidates
    return candidates


def _load_parameter_embedding_cache(provider_key: str) -> dict[str, list[float]]:
    if provider_key in _embedding_cache:
        return _embedding_cache[provider_key]
    if not PARAMETER_EMBEDDING_CACHE_FILE.exists():
        _embedding_cache[provider_key] = {}
        return {}
    with PARAMETER_EMBEDDING_CACHE_FILE.open("rb") as handle:
        payload = pickle.load(handle)
    if payload.get("digest") != _schema_digest():
        _embedding_cache[provider_key] = {}
        return {}
    cache = payload.get("providers", {}).get(provider_key, {})
    _embedding_cache[provider_key] = cache
    return cache


def _save_parameter_embedding_cache(provider_key: str, cache: dict[str, list[float]]) -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    payload = {"digest": _schema_digest(), "providers": {provider_key: cache}}
    if PARAMETER_EMBEDDING_CACHE_FILE.exists():
        try:
            with PARAMETER_EMBEDDING_CACHE_FILE.open("rb") as handle:
                existing = pickle.load(handle)
            if existing.get("digest") == payload["digest"]:
                payload["providers"] = existing.get("providers", {})
                payload["providers"][provider_key] = cache
        except Exception:
            pass
    with PARAMETER_EMBEDDING_CACHE_FILE.open("wb") as handle:
        pickle.dump(payload, handle)


def _embed_texts(texts: list[str]) -> list[list[float]]:
    provider = _get_provider()
    return provider.embed_batch(texts)


def _candidate_embedding_key(parameter: dict[str, Any], candidate: ParameterCandidate) -> str:
    raw = json.dumps(
        {
            "parameter": parameter["id"],
            "label": candidate.label,
            "value": candidate.value,
            "text": candidate.text,
        },
        sort_keys=True,
        ensure_ascii=False,
    )
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _ensure_parameter_embeddings(parameters: list[dict[str, Any]]) -> tuple[str, dict[str, list[float]]]:
    provider = _get_provider()
    provider_key = getattr(provider, "kind", provider.__class__.__name__)
    cache = _load_parameter_embedding_cache(provider_key)
    missing_texts: list[str] = []
    missing_keys: list[str] = []

    for parameter in parameters:
        for candidate in _build_candidates(parameter):
            key = _candidate_embedding_key(parameter, candidate)
            if key not in cache:
                missing_keys.append(key)
                missing_texts.append(candidate.text)

    if missing_texts:
        vectors = _embed_texts(missing_texts)
        for key, vector in zip(missing_keys, vectors):
            cache[key] = [float(value) for value in vector]
        _save_parameter_embedding_cache(provider_key, cache)

    return provider_key, cache


def _find_color(query: str) -> str | None:
    lowered = query.lower()
    for token, hex_value in COLOR_WORDS.items():
        if token in lowered:
            return hex_value
    hex_match = re.search(r"#[0-9a-fA-F]{6}", query)
    if hex_match:
        return hex_match.group(0)
    return None


def _recommend_text_value(parameter: dict[str, Any], query: str) -> tuple[Any, str, float]:
    parameter_id = parameter["id"]
    if "color" in parameter_id:
        color = _find_color(query)
        if color:
            return color, "query_color_match", 0.92
    match = re.search(rf"{re.escape(parameter_id.replace('_', ' '))}\s*[:=]\s*([^\n,;]+)", query, re.I)
    if match:
        return match.group(1).strip(), "query_literal", 0.9
    return parameter.get("default"), "default", 0.4


def _score_bucket_from_query(query: str) -> str:
    lowered = query.lower()
    if any(token in lowered for token in HIGH_HINTS):
        return "high"
    if any(token in lowered for token in LOW_HINTS):
        return "low"
    return "mid"


def _recommend_parameter_value(
    parameter: dict[str, Any],
    query_embedding: list[float],
    embedding_cache: dict[str, list[float]],
    query: str,
) -> dict[str, Any]:
    control_type = parameter.get("control_type")
    default = parameter.get("default")

    if control_type == "text_input":
        value, reason, confidence = _recommend_text_value(parameter, query)
        return {"value": value, "reason": reason, "confidence": confidence}

    if control_type == "checkbox":
        selected: list[Any] = []
        details: list[dict[str, Any]] = []
        for candidate in _build_candidates(parameter):
            key = _candidate_embedding_key(parameter, candidate)
            score = _cosine_similarity(query_embedding, embedding_cache.get(key, []))
            if score >= 0.42:
                selected.append(candidate.value)
                details.append({"label": candidate.label, "score": round(score, 4)})
        if not selected:
            selected = list(default or [])
            return {"value": selected, "reason": "default_checkbox", "confidence": 0.4}
        return {"value": selected, "reason": "semantic_multi_match", "confidence": 0.7, "details": details[:6]}

    if control_type in {"slider", "stepper", "xy_slider"} and not parameter.get("options"):
        bucket = _score_bucket_from_query(query)
        match = next((item for item in _build_candidates(parameter) if item.source.endswith(bucket)), None)
        if match is not None:
            confidence = 0.75 if bucket != "mid" else 0.55
            return {"value": match.value, "reason": f"semantic_range_{bucket}", "confidence": confidence}
        return {"value": default, "reason": "default_range", "confidence": 0.4}

    best_score = -1.0
    best_candidate: ParameterCandidate | None = None
    for candidate in _build_candidates(parameter):
        key = _candidate_embedding_key(parameter, candidate)
        score = _cosine_similarity(query_embedding, embedding_cache.get(key, []))
        if score > best_score:
            best_score = score
            best_candidate = candidate

    if best_candidate is None:
        return {"value": default, "reason": "default_fallback", "confidence": 0.3}

    return {
        "value": best_candidate.value,
        "reason": f"semantic_match:{best_candidate.label}",
        "confidence": round(max(0.25, min(0.98, best_score)), 4),
    }


def recommend_semantic_config(query: str, current_values: dict[str, Any] | None = None) -> dict[str, Any]:
    schema = load_parameter_schema()
    parameters = [*schema["core"], *schema["mmss"]]
    _, embedding_cache = _ensure_parameter_embeddings(parameters)
    query_embedding = _embed_texts([query])[0]

    values = dict(schema["defaults"])
    if current_values:
        values.update(current_values)

    recommendations: dict[str, Any] = {}
    changed: list[dict[str, Any]] = []
    for parameter in parameters:
        recommendation = _recommend_parameter_value(parameter, query_embedding, embedding_cache, query)
        parameter_id = parameter["id"]
        previous = values.get(parameter_id, schema["defaults"].get(parameter_id))
        values[parameter_id] = recommendation["value"]
        recommendations[parameter_id] = recommendation
        if previous != recommendation["value"]:
            changed.append(
                {
                    "id": parameter_id,
                    "before": previous,
                    "after": recommendation["value"],
                    "reason": recommendation["reason"],
                    "confidence": recommendation["confidence"],
                }
            )

    return {
        "schema": schema,
        "values": values,
        "recommendations": recommendations,
        "changed": changed,
        "retrievalQuery": build_semantic_retrieval_query(query, values, schema),
    }


def build_semantic_retrieval_query(
    query: str,
    values: dict[str, Any] | None,
    schema: dict[str, Any] | None = None,
) -> str:
    if not values:
        return query
    schema = schema or load_parameter_schema()
    parameters = {item["id"]: item for item in [*schema["core"], *schema["mmss"]]}
    important_ids = (
        "page_type",
        "layout_archetype",
        "color_palette",
        "primary_color",
        "secondary_color",
        "accent_color",
        "background_color",
        "font_family_base",
        "font_family_heading",
        "content_density",
        "animation_complexity",
        "scroll_animation_style",
        "glassmorphism",
        "texture_type",
        "pattern_type",
    )
    segments: list[str] = [query.strip()]
    additions: list[str] = []
    for parameter_id in important_ids:
        if parameter_id not in values or parameter_id not in parameters:
            continue
        value = values[parameter_id]
        if value in (None, "", [], {}):
            continue
        parameter = parameters[parameter_id]
        if value == parameter.get("default"):
            continue
        if isinstance(value, list):
            additions.extend(str(item).strip() for item in value[:4] if str(item).strip())
        elif isinstance(value, dict):
            continue
        elif isinstance(value, bool):
            if not value:
                continue
            additions.append(_parameter_semantic_phrase(parameter))
        elif isinstance(value, (int, float)):
            continue
        else:
            rendered = _resolve_option_label(parameter, value)
            if rendered:
                additions.append(rendered)

    unique_additions: list[str] = []
    seen: set[str] = set()
    for item in additions:
        normalized = item.strip().lower()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        unique_additions.append(item.strip())

    if unique_additions:
        segments.append("semantic profile " + " ".join(unique_additions[:10]))
    return " | ".join(segment for segment in segments if segment)


def _resolve_option_label(parameter: dict[str, Any], value: Any) -> str:
    for option in parameter.get("options", []):
        if isinstance(option, dict):
            if option.get("value") == value:
                return str(option.get("label_en") or option.get("label_ru") or value)
        elif option == value:
            return str(option)
    if isinstance(value, str):
        return value.replace("_", " ")
    return ""


def _parameter_semantic_phrase(parameter: dict[str, Any]) -> str:
    semantic_phrases = {
        "glassmorphism": "glass frosted translucent panels",
        "gradient_presence": "gradient background color blend",
        "parallax_effect": "parallax scroll depth",
        "scroll_animations": "scroll reveal motion",
        "load_animation": "entrance animation motion",
        "dynamic_content": "dynamic content live sections",
        "mixed_layouts": "mixed modular layout",
        "overlays": "overlay layered surfaces",
        "texture_presence": "textured background surface",
        "pattern_presence": "patterned decorative background",
    }
    return semantic_phrases.get(parameter["id"], str(parameter.get("name_en") or parameter["id"]).replace("_", " "))
