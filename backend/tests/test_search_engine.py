from __future__ import annotations

from backend.search_engine import _keyword_score, _matched_tokens, tokenize


def _entry(
    *,
    category: str,
    name: str,
    tags: list[str],
    payload: str = "",
    semantic_description: str = "",
    family: str = "test-family",
) -> dict:
    return {
        "id": f"{category}.{name.lower().replace(' ', '-')}",
        "category": category,
        "name": name,
        "tags": tags,
        "payload": payload,
        "semantic_description": semantic_description or name,
        "family": family,
    }


def test_keyword_score_prefers_component_intent_match():
    query = "animated button with rotating icon"
    query_tokens = tokenize(query)
    button_entry = _entry(
        category="components",
        name="Pulse icon action button",
        tags=["button", "rotating icon", "cta"],
        payload="pulse-icon-action-button",
        semantic_description="Animated button with rotating icon and pulsing shadow.",
    )
    palette_entry = _entry(
        category="styles",
        name="Warm Sand palette",
        tags=["palette", "color", "warm-sand"],
        payload="palette-warm-sand",
        semantic_description="Color palette for soft neutral surfaces.",
    )
    button_score = _keyword_score(query, query_tokens, button_entry, _matched_tokens(query_tokens, button_entry))
    palette_score = _keyword_score(query, query_tokens, palette_entry, _matched_tokens(query_tokens, palette_entry))
    assert button_score > palette_score


def test_keyword_score_prefers_palette_for_color_queries():
    query = "warm sand palette with earthy accent"
    query_tokens = tokenize(query)
    palette_entry = _entry(
        category="styles",
        name="Warm Sand palette",
        tags=["palette", "warm sand", "earthy accent"],
        payload="palette-warm-sand",
        semantic_description="Warm sand palette with earthy accent tones.",
    )
    card_entry = _entry(
        category="components",
        name="Feature card",
        tags=["card", "feature"],
        payload="feature-card",
        semantic_description="Simple feature card component.",
    )
    palette_score = _keyword_score(query, query_tokens, palette_entry, _matched_tokens(query_tokens, palette_entry))
    card_score = _keyword_score(query, query_tokens, card_entry, _matched_tokens(query_tokens, card_entry))
    assert palette_score > card_score


def test_keyword_score_rewards_scroll_reveal_phrase():
    query = "scroll reveal progress bar"
    query_tokens = tokenize(query)
    reveal_entry = _entry(
        category="interactions",
        name="Scroll reveal with progress bar",
        tags=["scroll reveal", "progress bar", "intersection observer"],
        payload="scroll-reveal-progress",
        semantic_description="Scroll reveal interaction with progress bar and section observer.",
    )
    generic_entry = _entry(
        category="interactions",
        name="Hover glow",
        tags=["hover", "glow"],
        payload="hover-glow",
        semantic_description="Glow on hover.",
    )
    reveal_score = _keyword_score(query, query_tokens, reveal_entry, _matched_tokens(query_tokens, reveal_entry))
    generic_score = _keyword_score(query, query_tokens, generic_entry, _matched_tokens(query_tokens, generic_entry))
    assert reveal_score > generic_score
