from __future__ import annotations

import re
from typing import Any

from .archetype_classifier import classify_archetype
from .page_planner import build_page_plan

FEATURE_HINTS = ("feature", "features", "benefit", "benefits")
STAT_HINTS = ("stat", "stats", "metric", "metrics", "kpi")
PRICING_HINTS = ("pricing", "plans", "tiers", "price", "prices")

CHAOS_HINTS = (
    "random",
    "random variation",
    "chaos",
    "chaotic",
    "chaotically",
    "dynamic",
    "mixed",
    "rolled",
    "overlays",
    "z-index",
    "gravity",
    "textures",
    "patterns",
    "gradient variations",
)

ANIMATION_HINTS = {
    "complex": (
        "complex animation",
        "complex motion",
        "cinematic",
        "animated sequence",
        "staggered reveal",
        "rich motion",
    ),
    "medium": (
        "animated",
        "animation",
        "motion",
        "interactive",
        "reveal",
        "transition",
        "hover",
    ),
    "simple": ("subtle", "soft motion", "light animation", "microinteraction"),
}

QUANTITY_PATTERNS = {
    "buttons_count": [
        r"(\d+)\s*(?:button[s]?|nav(?:igation)?\s+items?)",
        r"(?:button[s]?|nav(?:igation)?\s+items?)\s*[-:=]?\s*(\d+)",
    ],
    "cards_count": [
        r"(\d+)\s*(?:card[s]?|item[s]?|tier[s]?|plan[s]?)",
        r"(?:card[s]?|item[s]?|tier[s]?|plan[s]?)\s*[-:=]?\s*(\d+)",
    ],
    "columns_count": [
        r"(\d+)\s*(?:column[s]?)",
        r"(?:column[s]?)\s*[-:=]?\s*(\d+)",
    ],
    "examples_count": [
        r"(\d+)\s*(?:code\s+examples?|snippet[s]?)",
        r"(?:code\s+examples?|snippet[s]?)\s*[-:=]?\s*(\d+)",
    ],
}

SAFE_BOUNDS = {
    "buttons_count": (1, 12),
    "cards_count": (1, 12),
    "examples_count": (1, 12),
    "columns_count": (1, 6),
}


def detect_locale(query: str) -> str:
    cyrillic = len(re.findall(r"[а-яё]", query.lower()))
    latin = len(re.findall(r"[a-z]", query.lower()))
    if cyrillic and latin:
        return "mixed"
    if cyrillic:
        return "ru"
    return "en"


def parse_query(
    query: str,
    explicit_archetype: str | None = None,
    explicit_animation: str | None = None,
) -> dict[str, Any]:
    q = query.lower()
    warnings: list[str] = []
    raw_quantities = _extract_quantities(q)
    locale = detect_locale(query)

    archetype_result = classify_archetype(query)
    archetype = archetype_result["archetype"]

    if explicit_archetype and explicit_archetype in archetype_result["scores"]:
        if explicit_archetype != archetype:
            warnings.append(
                f"Explicit archetype '{explicit_archetype}' overrides parsed archetype '{archetype}'."
            )
        archetype = explicit_archetype

    constraints: dict[str, dict[str, int]] = {}
    for key, value in raw_quantities.items():
        minimum, maximum = SAFE_BOUNDS[key]
        clamped = max(minimum, min(maximum, value))
        if clamped != value:
            warnings.append(f"{key}={value} was clamped to safe range {minimum}..{maximum}.")
        raw_quantities[key] = clamped

    if "buttons_count" in raw_quantities:
        button_slot = _resolve_buttons_slot(archetype)
        if button_slot:
            constraints[button_slot] = {"buttons_count": raw_quantities["buttons_count"]}
        else:
            warnings.append(
                "buttons_count was ignored because the selected archetype has no navigational slot."
            )

    if "examples_count" in raw_quantities:
        constraints["code"] = {"examples_count": raw_quantities["examples_count"]}

    if "columns_count" in raw_quantities:
        constraints.setdefault("features", {})["columns_count"] = raw_quantities["columns_count"]

    if "cards_count" in raw_quantities:
        card_slot = _resolve_cards_slot(q, archetype)
        constraints.setdefault(card_slot, {})["cards_count"] = raw_quantities["cards_count"]
        if card_slot == "features" and "columns_count" not in constraints.get("features", {}):
            constraints["features"]["columns_count"] = max(1, min(6, raw_quantities["cards_count"]))

    design_directives = _extract_design_directives(q, explicit_animation)
    page_plan = build_page_plan(
        query=query,
        archetype=archetype,
        locale=locale,
        constraints=constraints,
        design_directives=design_directives,
        archetype_scores=archetype_result["scores"],
    )

    return {
        "archetype": archetype,
        "locale": locale,
        "slots": constraints,
        "constraints": constraints,
        "raw_quantities": raw_quantities,
        "archetypeScores": archetype_result["scores"],
        "pagePlan": page_plan,
        "designDirectives": design_directives,
        "warnings": warnings,
    }


def _extract_quantities(query: str) -> dict[str, int]:
    quantities: dict[str, int] = {}
    for name, patterns in QUANTITY_PATTERNS.items():
        for pattern in patterns:
            match = re.search(pattern, query)
            if not match:
                continue
            value = next((group for group in match.groups() if group and group.isdigit()), None)
            if value:
                quantities[name] = int(value)
                break
    return quantities


def _resolve_cards_slot(query: str, archetype: str) -> str:
    if archetype == "catalog":
        return "catalog_list"
    if any(hint in query for hint in PRICING_HINTS):
        return "pricing"
    if any(hint in query for hint in FEATURE_HINTS):
        return "features"
    if any(hint in query for hint in STAT_HINTS):
        return "stats"
    return "stats" if archetype == "dashboard" else "features"


def _resolve_buttons_slot(archetype: str) -> str | None:
    if archetype == "dashboard":
        return "sidebar"
    if archetype == "docs":
        return "nav"
    return None


def _extract_design_directives(query: str, explicit_animation: str | None) -> dict[str, Any]:
    matched_chaos_terms = [term for term in CHAOS_HINTS if term in query]
    motion_level = "none"
    for level in ("complex", "medium", "simple"):
        if any(term in query for term in ANIMATION_HINTS[level]):
            motion_level = level
            break
    if explicit_animation and explicit_animation in {"none", "simple", "medium", "complex"}:
        motion_level = explicit_animation

    chaos_level = "calm"
    if matched_chaos_terms:
        chaos_level = (
            "chaotic"
            if any(term in query for term in ("chaos", "chaotic", "chaotically"))
            else "dynamic"
        )

    return {
        "randomFieldArea": bool(matched_chaos_terms),
        "chaosLevel": chaos_level,
        "motionLevel": motion_level,
        "matchedChaosTerms": matched_chaos_terms,
        "surfaceEffects": _surface_effects_from_terms(matched_chaos_terms),
    }


def _surface_effects_from_terms(terms: list[str]) -> list[str]:
    effects: list[str] = []
    if any(term in terms for term in ("overlays", "textures", "patterns")):
        effects.append("layered-overlays")
    if any(term in terms for term in ("gradient variations", "patterns", "mixed")):
        effects.append("gradient-variance")
    if any(term in terms for term in ("z-index", "gravity", "rolled")):
        effects.append("offset-stack")
    return effects
