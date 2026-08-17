from __future__ import annotations

from bs4 import BeautifulSoup

from backend.assembly import assemble, validate_slot_constraints
from backend.query_parser import parse_query


def _fake_hit(
    entry_id: str,
    category: str,
    name: str,
    *,
    html: str | None = None,
    css: str | None = None,
    tags: list[str] | None = None,
) -> dict:
    return {
        "entry": {
            "id": entry_id,
            "category": category,
            "name": name,
            "semantic_description": name,
            "tags": tags or [],
            "payload": name.lower().replace(" ", "-"),
            "css": css,
            "html": html,
            "conflicts": [],
            "family": "test-family",
        },
        "score": 0.9,
        "confidence": "high",
        "matchedTokens": [],
    }


def test_parse_query_docs_buttons():
    parsed = parse_query("docs with 6 buttons")
    assert parsed["archetype"] == "docs"
    assert parsed["slots"]["nav"]["buttons_count"] == 6


def test_parse_query_extracts_design_directives():
    parsed = parse_query("chaotic landing page with overlays, textures and complex animation")
    assert parsed["designDirectives"]["randomFieldArea"] is True
    assert parsed["designDirectives"]["chaosLevel"] == "chaotic"
    assert parsed["designDirectives"]["motionLevel"] == "complex"
    assert "layered-overlays" in parsed["designDirectives"]["surfaceEffects"]


def test_assemble_docs_respects_nav_buttons_constraint():
    result = {
        "query": "documentation with 6 navigation buttons and 3 code examples",
        "hits": [
            _fake_hit("layouts.test", "layouts", "Test Layout", css=".layout{display:block}", tags=["layout"]),
            _fake_hit("typography.test", "typography", "Docs Typography", css=":root{--color-fg:#111}", tags=["type"]),
            _fake_hit("styles.test", "styles", "Docs Style", css=".docs-nav a{font-weight:600}", tags=["docs"]),
            _fake_hit("nav.bad", "components", "Small Nav", html='<nav><ul><li><a href="#">A</a></li><li><a href="#">B</a></li><li><a href="#">C</a></li><li><a href="#">D</a></li></ul></nav>', tags=["nav", "menu"]),
            _fake_hit("code.bad", "components", "Single Code", html="<section><pre><code>x</code></pre></section>", tags=["code", "snippet"]),
        ],
    }
    payload = assemble(result, vectors={}, archetype_override="docs")
    soup = BeautifulSoup(payload["assembly"]["standalone"], "lxml")
    nav_links = soup.select("[data-slot='nav'] a")
    code_blocks = soup.select("[data-slot='code'] pre code")
    assert len(nav_links) == 6
    assert len(code_blocks) == 3
    assert payload["constraintValidation"]["valid"] is True
    assert payload["plan"][0]["source"] == "fallback_parameterized"


def test_validate_slot_constraints_detects_mismatch():
    html = """
    <html><body>
      <section data-slot="nav"><nav><a href="#">One</a><a href="#">Two</a></nav></section>
    </body></html>
    """
    validation = validate_slot_constraints(html, {"nav": {"buttons_count": 3}})
    assert validation["valid"] is False
    assert validation["slots"]["nav"]["buttons_count"]["actual"] == 2


def test_regression_generation_without_numeric_constraints_returns_standalone():
    result = {
        "query": "modern landing page for fintech startup",
        "hits": [
            _fake_hit("layouts.test", "layouts", "Test Layout", css=".layout{display:block}", tags=["layout"]),
            _fake_hit("typography.test", "typography", "Landing Typography", css=":root{--color-fg:#111}", tags=["type"]),
            _fake_hit("styles.test", "styles", "Landing Style", css=".hero{padding:24px}", tags=["hero"]),
        ],
    }
    payload = assemble(result, vectors={}, archetype_override="landing")
    assert payload["assembly"]["standalone"].startswith("<!DOCTYPE html>")
    assert payload["archetype"] == "landing"
    assert "selection" in payload["assembly"]


def test_assemble_applies_design_directives_to_standalone():
    result = {
        "query": "chaotic landing page with overlays and complex animation",
        "hits": [
            _fake_hit("layouts.test", "layouts", "Test Layout", css=".layout{display:block}", tags=["layout"]),
            _fake_hit("typography.test", "typography", "Landing Typography", css=":root{--color-fg:#111}", tags=["type"]),
            _fake_hit("styles.test", "styles", "Landing Style", css=".hero{padding:24px}", tags=["hero"]),
        ],
    }
    payload = assemble(result, vectors={}, archetype_override="landing")
    standalone = payload["assembly"]["standalone"]
    assert 'data-debug-label="' in standalone
    assert "random field area" in standalone
    assert payload["designDirectives"]["motionLevel"] == "complex"
