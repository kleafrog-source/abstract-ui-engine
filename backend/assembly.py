from __future__ import annotations

import hashlib
import html
import os
import shutil
import subprocess
import tempfile
from typing import Any

from bs4 import BeautifulSoup

from .archetypes import ARCHETYPES
from .mmss_bridge import MMSSMetrics
from .query_parser import parse_query
from .search_engine import mean_pairwise_cosine, search, tokenize
from .section_templates import SECTION_TEMPLATES

_JS_VALIDATION_CACHE: dict[str, tuple[bool, str | None]] = {}
_MMSS = MMSSMetrics()
SLOT_CATEGORY_PREFERENCES = {
    "hero": ("layouts", "components"),
    "features": ("components", "layouts"),
    "testimonials": ("components", "layouts"),
    "pricing": ("components", "layouts"),
    "faq": ("components",),
    "cta": ("components", "layouts"),
    "footer": ("components", "layouts"),
    "sidebar": ("components", "layouts"),
    "header": ("components", "layouts"),
    "stats": ("components", "layouts"),
    "filters": ("components", "layouts"),
    "charts": ("components", "layouts"),
    "table": ("components", "layouts"),
    "widgets": ("components", "layouts"),
    "nav": ("components", "layouts"),
    "article_header": ("components", "layouts"),
    "content_body": ("components", "layouts"),
    "code": ("components",),
    "catalog_header": ("components", "layouts"),
    "catalog_filters": ("components", "layouts"),
    "catalog_list": ("components", "layouts"),
    "catalog_detail": ("components", "layouts"),
}
ENTITY_LEVEL_PRIORITY = {
    "section": 4,
    "component": 3,
    "modifier": 2,
    "interaction": 1,
    "utility": 0,
}
HYBRID_INSERT_LIMITS = {
    "hero": 2,
    "features": 3,
    "testimonials": 2,
    "pricing": 2,
    "faq": 2,
    "cta": 2,
    "header": 2,
    "stats": 3,
    "filters": 2,
    "charts": 2,
    "widgets": 3,
    "content_body": 2,
    "catalog_list": 3,
    "catalog_detail": 2,
}
MAJOR_SECTION_SLOTS = {
    "hero",
    "features",
    "testimonials",
    "pricing",
    "faq",
    "cta",
    "header",
    "footer",
    "sidebar",
    "stats",
    "filters",
    "charts",
    "widgets",
    "content_body",
    "catalog_header",
    "catalog_filters",
    "catalog_list",
    "catalog_detail",
}
SLOT_DISCOURAGED_TOKENS = {
    "hero": {"table", "rows", "sidebar", "footer", "faq", "code", "filters"},
    "features": {"footer", "sidebar", "table", "nav", "faq"},
    "testimonials": {"pricing", "table", "sidebar", "filters", "code"},
    "pricing": {"testimonial", "quote", "sidebar", "table", "faq"},
    "faq": {"pricing", "table", "chart", "hero", "sidebar"},
    "cta": {"table", "sidebar", "faq", "chart", "code"},
    "sidebar": {"hero", "pricing", "testimonial", "faq", "chart"},
    "header": {"pricing", "testimonial", "faq", "table"},
    "stats": {"footer", "faq", "navigation", "testimonial", "code"},
    "filters": {"hero", "testimonial", "pricing", "footer", "code"},
    "charts": {"hero", "faq", "footer", "testimonial", "form"},
    "table": {"hero", "testimonial", "pricing", "faq", "gallery"},
    "widgets": {"hero", "pricing", "footer", "faq"},
    "content_body": {"pricing", "table", "sidebar", "filters"},
    "catalog_header": {"table", "sidebar", "faq", "footer"},
    "catalog_filters": {"hero", "testimonial", "pricing", "footer"},
    "catalog_list": {"faq", "footer", "sidebar", "hero"},
    "catalog_detail": {"faq", "footer", "sidebar", "hero"},
}

BASE_RESET = """*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:var(--color-fg,#111);background:var(--color-bg,#fff)}
img{max-width:100%;display:block}
button{font:inherit;cursor:pointer}
a{text-decoration:none;color:inherit}
:focus-visible{outline:2px solid var(--color-accent,#2563eb);outline-offset:2px}
.page-shell{min-height:100vh}
.page-shell main{width:100%}
.landing-shell{display:flex;flex-direction:column}
.landing-main{display:flex;flex-direction:column;gap:40px}
.dashboard-shell{display:grid;grid-template-columns:minmax(220px,280px) 1fr;min-height:100vh}
.dashboard-content{display:flex;flex-direction:column;min-width:0}
.dashboard-main{display:flex;flex-direction:column;gap:24px;padding:24px}
.docs-shell{display:grid;grid-template-columns:minmax(220px,280px) 1fr;min-height:100vh}
.docs-sidebar{border-right:1px solid rgba(0,0,0,.08);padding:24px}
.docs-main{padding:24px;display:flex;flex-direction:column;gap:24px}
.hero,.cta,.features-section,.testimonials,.stats-section,.table-section,.widgets-section,.content-body,.article-header{padding:24px}
.hero__inner,.cta__inner,.footer__inner,.table-shell,.section-heading{max-width:1200px;margin:0 auto}
.features-grid,.stats-grid,.testimonials-grid,.widgets-grid{display:grid;gap:16px}
.section-heading{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:20px}
.section-heading h2,.hero__title,.dashboard-header h1,.article-header h1{margin:8px 0 0;font-size:clamp(1.8rem,2.6vw,3.6rem);line-height:1.05}
.section-heading p,.hero__subtitle,.dashboard-header p,.article-header p,.feature-card p,.stat-card p,.widget-card p,.testimonial-card p,.content-body p{margin:0;color:var(--color-muted,#666)}
.section-kicker{display:inline-flex;align-items:center;gap:8px;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;color:var(--color-muted,#666)}
.columns-2{grid-template-columns:repeat(2,minmax(0,1fr))}
.columns-3{grid-template-columns:repeat(3,minmax(0,1fr))}
.columns-4{grid-template-columns:repeat(4,minmax(0,1fr))}
.columns-5{grid-template-columns:repeat(5,minmax(0,1fr))}
.columns-6{grid-template-columns:repeat(6,minmax(0,1fr))}
.feature-card,.stat-card,.widget-card,.testimonial-card,.hero-panel__card,.hero-panel__grid>div{padding:20px;border:1px solid rgba(0,0,0,.08);border-radius:18px;background:rgba(255,255,255,.72)}
.docs-nav ul,.dashboard-sidebar ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
.docs-nav a,.dashboard-sidebar a{display:block;padding:10px 12px;border-radius:12px;background:rgba(0,0,0,.03)}
.dashboard-header,.article-header{padding:24px;border-bottom:1px solid rgba(0,0,0,.08);display:flex;align-items:end;justify-content:space-between;gap:24px}
.data-table{width:100%;border-collapse:collapse}
.data-table th,.data-table td{padding:12px;border-bottom:1px solid rgba(0,0,0,.08);text-align:left}
.footer{padding:20px 24px;border-top:1px solid rgba(0,0,0,.08);color:var(--color-muted,#666);font-size:.9rem}
.btn,.btn--primary,.btn--ghost{display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:12px}
.btn,.btn--primary{background:#111;color:#fff}
.btn--ghost{background:rgba(0,0,0,.04);color:inherit}
.code-section pre{overflow:auto;padding:16px;border-radius:14px;background:#111;color:#f5f5f5}
.hero{padding-top:40px}
.hero__inner{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(300px,.8fr);gap:24px;align-items:stretch}
.hero-copy,.hero-panel{display:flex;flex-direction:column;gap:18px}
.hero-actions,.cta-actions,.dashboard-actions{display:flex;flex-wrap:wrap;gap:12px}
.hero-panel__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.hero-panel__label,.stat-card__eyebrow,.feature-card__index,.stat-card__delta,.code-pill{font-size:.78rem;color:var(--color-muted,#666)}
.stat-card h3,.feature-card h3,.widget-card h3{margin:8px 0 10px}
.widgets-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
.pricing-card{display:flex;flex-direction:column;gap:12px}
.faq-item{display:flex;flex-direction:column;gap:8px}
.filters-bar{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.filter-input{flex:1;min-width:220px;padding:12px 14px;border-radius:12px;border:1px solid rgba(0,0,0,.08);background:rgba(255,255,255,.72)}
.chart-bars{display:flex;align-items:end;gap:10px;height:140px;padding-top:12px}
.chart-bars span{display:block;flex:1;border-radius:10px 10px 4px 4px;background:linear-gradient(180deg,#111,#666)}
.dashboard-sidebar{display:flex;flex-direction:column;justify-content:space-between;padding:24px;border-right:1px solid rgba(0,0,0,.08);background:rgba(0,0,0,.02)}
.dashboard-sidebar__brand{display:flex;flex-direction:column;gap:4px;margin-bottom:24px}
.dashboard-sidebar__footer{margin-top:24px;color:var(--color-muted,#666);font-size:.85rem}
.content-body{display:flex;flex-direction:column;gap:16px}
.code-section{display:flex;flex-direction:column;gap:12px}
.code-section__meta{display:flex;gap:8px;flex-wrap:wrap}
.code-pill{display:inline-flex;padding:6px 10px;border-radius:999px;background:rgba(0,0,0,.05)}
.code-pill--muted{opacity:.8}
.catalog-code{margin:0;overflow:auto;padding:14px;border-radius:14px;background:#111;color:#f5f5f5;font-size:.82rem;line-height:1.45}
.hybrid-slot{display:flex;flex-direction:column;gap:12px;margin-top:18px}
.hybrid-slot__label{font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--color-muted,#666)}
.hybrid-slot__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
.hybrid-slot__item{padding:16px;border:1px solid rgba(0,0,0,.08);border-radius:16px;background:rgba(255,255,255,.68)}
.hybrid-slot__item h3{margin:10px 0 8px;font-size:1rem}
.hybrid-slot__item p{margin:0 0 10px;color:var(--color-muted,#666)}
.slot-fusion{display:flex;flex-direction:column;gap:14px;margin-top:18px}
.slot-fusion__label{font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--color-muted,#666)}
.slot-fusion__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
.section-recipe{display:flex;flex-direction:column;gap:18px}
.section-recipe__primary{display:flex;flex-direction:column;gap:14px}
.section-recipe__support{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
.section-recipe__secondary{display:flex;flex-direction:column;gap:14px}
.section-recipe__module{padding:16px;border:1px solid rgba(0,0,0,.08);border-radius:16px;background:rgba(255,255,255,.7)}
.section-recipe__layout{width:100%}
@media (max-width: 960px){.dashboard-shell,.docs-shell{grid-template-columns:1fr}.docs-sidebar,.dashboard-sidebar{border-right:0;border-bottom:1px solid rgba(0,0,0,.08)}}
@media (max-width: 960px){.hero__inner,.dashboard-header,.section-heading{grid-template-columns:1fr;flex-direction:column;align-items:start}.widgets-grid{grid-template-columns:1fr 1fr}}
@media (max-width: 720px){.features-grid,.stats-grid,.testimonials-grid,.widgets-grid{grid-template-columns:1fr !important}.dashboard-main,.docs-main,.hero,.cta,.features-section,.testimonials,.stats-section,.table-section,.widgets-section,.content-body,.article-header{padding:18px}.hero-panel__grid{grid-template-columns:1fr}}
"""


def assemble(
    result: dict[str, Any],
    vectors: dict[str, list[float]],
    *,
    locked: list[str] | None = None,
    prefer_family: str | None = None,
    archetype_override: str | None = None,
    media_strategy: str = "mobile-first",
    debug_tips: bool = False,
    animation_mode: str = "auto",
) -> dict[str, Any]:
    locked_set = set(locked or [])
    query = result["query"]
    parsed = parse_query(
        query,
        explicit_archetype=archetype_override,
        explicit_animation=None if animation_mode == "auto" else animation_mode,
    )
    archetype_name = parsed["archetype"]
    archetype = ARCHETYPES.get(archetype_name, ARCHETYPES["landing"])
    design_directives = parsed["designDirectives"]

    selection = _build_selection(result, locked_set, prefer_family)
    render_context = _build_render_context(query, selection, result["hits"], design_directives)
    slot_sections: list[dict[str, Any]] = []
    slot_hits: list[dict[str, Any]] = []
    slot_style_hits: list[dict[str, Any]] = []
    slot_interaction_hits: list[dict[str, Any]] = []

    retrieval_context = {
        "query": query,
        "hits": result["hits"],
        "locked": locked_set,
        "prefer_family": prefer_family,
        "renderContext": render_context,
        "usedComponentIds": set(),
        "usedMajorFamilies": set(),
        "pagePlan": {item["slot"]: item for item in parsed.get("pagePlan", [])},
    }

    for slot_def in archetype:
        slot_name = slot_def["slot"]
        slot_params = parsed["slots"].get(slot_name, {})
        section = fill_slot(slot_def, retrieval_context, slot_params, parsed["locale"])
        slot_sections.append(section)
        hit = section.get("hit")
        if hit and hit not in slot_hits:
            slot_hits.append(hit)
        for style_hit in section.get("styleHits", []):
            if style_hit not in slot_style_hits:
                slot_style_hits.append(style_hit)
        for interaction_hit in section.get("interactionHits", []):
            if interaction_hit not in slot_interaction_hits:
                slot_interaction_hits.append(interaction_hit)
        if section.get("componentId"):
            retrieval_context["usedComponentIds"].add(section["componentId"])
        if slot_name in MAJOR_SECTION_SLOTS:
            base_hit = section.get("hit")
            if isinstance(base_hit, dict):
                family = str(base_hit["entry"].get("family") or "").strip().lower()
                if family:
                    retrieval_context["usedMajorFamilies"].add(family)

    selection["components"] = _merge_selected_components(selection["components"], slot_hits)
    selection["styles"] = _merge_selected_hits(selection["styles"], slot_style_hits, 8)
    selection["interactions"] = _merge_selected_hits(selection["interactions"], slot_interaction_hits, 5)
    selected_hits = _selected_hits(selection)
    css = _render_css(selected_hits, slot_sections, media_strategy, debug_tips, design_directives)
    js, js_warnings = _render_js([hit["entry"] for hit in selection["interactions"]], design_directives)
    page_html = _render_html(archetype_name, slot_sections)
    standalone = _render_standalone(
        css,
        page_html,
        js,
        selection,
        archetype_name,
        media_strategy,
        debug_tips,
    )
    constraint_validation = validate_slot_constraints(standalone, parsed["constraints"])
    metrics = compute_metrics(selection, vectors)
    completeness = assess_completeness(slot_sections, archetype_name)
    warnings = [
        *parsed["warnings"],
        *js_warnings,
        *constraint_validation["violations"],
        *completeness["warnings"],
    ]

    return {
        "archetype": archetype_name,
        "locale": parsed["locale"],
        "pagePlan": parsed.get("pagePlan", []),
        "mediaStrategy": media_strategy,
        "designDirectives": design_directives,
        "constraints": parsed["constraints"],
        "warnings": warnings,
        "completeness": completeness,
        "constraintValidation": constraint_validation,
        "plan": [
            {
                "slot": section["slot"],
                "source": section["source"],
                "componentId": section.get("componentId"),
                "constraints": section["constraints"],
                "valid": section["valid"],
                "rejectedCandidates": section["rejectedCandidates"],
                "semanticTag": section["semanticTag"],
                "sourceTokens": section["sourceTokens"],
                "bundle": _describe_slot_bundle(section),
            }
            for section in slot_sections
        ],
        "assembly": {
            "html": page_html,
            "css": css,
            "js": js,
            "standalone": standalone,
            "tree": _build_tree(archetype_name, selection, slot_sections),
            "selection": selection,
        },
        "metrics": metrics,
    }


def fill_slot(
    slot_def: dict[str, Any],
    retrieval_context: dict[str, Any],
    slot_params: dict[str, int],
    locale: str,
) -> dict[str, Any]:
    slot_name = slot_def["slot"]
    slot_plan = (retrieval_context.get("pagePlan") or {}).get(slot_name, {})
    candidates = retrieve_slot_candidates(slot_def, retrieval_context)
    layer_bundle = _select_slot_layer_bundle(slot_name, retrieval_context, slot_plan, candidates)
    primary_candidates = [
        candidate for candidate in candidates if _supports_primary_slot(slot_name, candidate)
    ]
    rejected: list[dict[str, Any]] = []
    eligible: list[tuple[float, dict[str, Any]]] = []

    for candidate in primary_candidates:
        acceptance = slot_def.get("acceptance") or {}
        acceptance_check = _candidate_acceptance_report(candidate["entry"].get("html"), acceptance)
        if not acceptance_check["valid"]:
            rejected.append(
                {
                    "id": candidate["entry"]["id"],
                    "reason": "acceptance",
                    "detail": ", ".join(acceptance_check["reasons"]),
                }
            )
            continue
        if slot_params and not candidate_satisfies_constraints(candidate["entry"].get("html", ""), slot_name, slot_params):
            rejected.append(
                {
                    "id": candidate["entry"]["id"],
                    "reason": "constraints",
                }
            )
            continue
        eligible.append(
            (
                _slot_candidate_score(
                    slot_name,
                    candidate,
                    retrieval_context.get("usedComponentIds", set()),
                    retrieval_context.get("usedMajorFamilies", set()),
                    slot_plan,
                ),
                candidate,
            )
        )

    if eligible:
        eligible.sort(key=lambda item: item[0], reverse=True)
        candidate = _select_slot_base_candidate(slot_name, eligible, slot_plan)
        fused_html, fused_entries = _build_fused_slot_html(
            slot_name,
            candidate,
            [item[1] for item in eligible],
            layer_bundle,
            slot_plan,
        )
        slot_html = fused_html or candidate["entry"].get("html", "")
        return {
            "slot": slot_name,
            "html": _wrap_slot_html(
                slot_name,
                slot_html,
                semantic_tag=_slot_semantic_tag(slot_name),
                source_tokens=candidate.get("matchedTokens") or slot_def.get("tags", []),
                source_label=candidate["entry"]["name"],
            ),
            "source": "retrieved_fused" if fused_entries else "retrieved",
            "componentId": candidate["entry"]["id"],
            "constraints": slot_params,
            "valid": True,
            "rejectedCandidates": rejected,
            "hit": candidate,
            "supportHits": fused_entries,
            "layoutHits": layer_bundle["layouts"],
            "sectionHits": layer_bundle["sections"],
            "styleHits": layer_bundle["styles"],
            "interactionHits": layer_bundle["interactions"],
            "supportTarget": layer_bundle.get("supportTarget"),
            "retrievalQuery": slot_plan.get("retrievalQuery"),
            "styleQuery": slot_plan.get("styleQuery"),
            "interactionQuery": slot_plan.get("interactionQuery"),
            "expectedFamilies": slot_plan.get("expectedFamilies", []),
            "semanticTag": _slot_semantic_tag(slot_name),
            "sourceTokens": candidate.get("matchedTokens") or slot_def.get("tags", []),
        }

    renderer_name = slot_def.get("renderer")
    renderer = SECTION_TEMPLATES.get(renderer_name) if renderer_name else None
    if renderer:
        rendered = renderer(locale=locale, **retrieval_context.get("renderContext", {}), **slot_params)
        hybrid_html, hybrid_entries = _build_hybrid_slot_html(slot_name, rendered, candidates)
        return {
            "slot": slot_name,
            "html": _wrap_slot_html(
                slot_name,
                hybrid_html,
                semantic_tag=_slot_semantic_tag(slot_name),
                source_tokens=slot_def.get("tags", []),
                source_label=f"{slot_name} fallback",
            ),
            "source": "fallback_hybrid" if hybrid_entries else "fallback_parameterized",
            "componentId": hybrid_entries[0]["entry"]["id"] if hybrid_entries else None,
            "constraints": slot_params,
            "valid": True,
            "rejectedCandidates": rejected,
            "hit": hybrid_entries[0] if hybrid_entries else None,
            "supportHits": hybrid_entries,
            "layoutHits": layer_bundle["layouts"],
            "sectionHits": layer_bundle["sections"],
            "styleHits": layer_bundle["styles"],
            "interactionHits": layer_bundle["interactions"],
            "supportTarget": layer_bundle.get("supportTarget"),
            "retrievalQuery": slot_plan.get("retrievalQuery"),
            "styleQuery": slot_plan.get("styleQuery"),
            "interactionQuery": slot_plan.get("interactionQuery"),
            "expectedFamilies": slot_plan.get("expectedFamilies", []),
            "semanticTag": _slot_semantic_tag(slot_name),
            "sourceTokens": slot_def.get("tags", []),
        }

    fallback_html = str(SECTION_TEMPLATES.get(slot_def["fallback"], f"<section class='{slot_name}'></section>"))
    return {
        "slot": slot_name,
        "html": _wrap_slot_html(
            slot_name,
            fallback_html,
            semantic_tag=_slot_semantic_tag(slot_name),
            source_tokens=slot_def.get("tags", []),
            source_label=f"{slot_name} static fallback",
        ),
        "source": "fallback_static",
        "componentId": None,
        "constraints": slot_params,
        "valid": not slot_def.get("required", False) or bool(fallback_html),
        "rejectedCandidates": rejected,
        "hit": None,
        "supportHits": [],
        "layoutHits": layer_bundle["layouts"],
        "sectionHits": layer_bundle["sections"],
        "styleHits": layer_bundle["styles"],
        "interactionHits": layer_bundle["interactions"],
        "supportTarget": layer_bundle.get("supportTarget"),
        "retrievalQuery": slot_plan.get("retrievalQuery"),
        "styleQuery": slot_plan.get("styleQuery"),
        "interactionQuery": slot_plan.get("interactionQuery"),
        "expectedFamilies": slot_plan.get("expectedFamilies", []),
        "semanticTag": _slot_semantic_tag(slot_name),
        "sourceTokens": slot_def.get("tags", []),
    }


def retrieve_slot_candidates(slot_def: dict[str, Any], retrieval_context: dict[str, Any]) -> list[dict[str, Any]]:
    tags = slot_def["tags"]
    slot_name = slot_def["slot"]
    query = retrieval_context["query"]
    slot_plan = (retrieval_context.get("pagePlan") or {}).get(slot_name, {})
    existing = [
        hit
        for hit in retrieval_context["hits"]
        if hit["entry"]["category"] in {"components", "layouts"} and _tag_overlap(hit["entry"], tags)
    ]
    targeted_hits: list[dict[str, Any]] = []
    lookup_query = str(slot_plan.get("retrievalQuery") or f"{query} {' '.join(tags)}".strip())
    for category in SLOT_CATEGORY_PREFERENCES.get(slot_name, ("components",)):
        targeted_hits.extend(
            search(
                lookup_query,
                temperature=0.18,
                top_k=10,
                category=category,
                locked=list(retrieval_context["locked"]),
            )["hits"]
        )
    merged: list[dict[str, Any]] = []
    seen: set[str] = set()
    for hit in [*existing, *targeted_hits]:
        entry_id = hit["entry"]["id"]
        if entry_id in seen:
            continue
        seen.add(entry_id)
        merged.append(hit)
    merged.sort(key=lambda hit: _planned_slot_priority(slot_name, hit, slot_plan), reverse=True)
    if slot_name in MAJOR_SECTION_SLOTS:
        section_first = [
            hit
            for hit in merged
            if str((hit["entry"].get("meta") or {}).get("entity_level") or "component") == "section"
            or bool((hit["entry"].get("meta") or {}).get("section_capable"))
        ]
        section_ids = {hit["entry"]["id"] for hit in section_first}
        component_fallbacks = [hit for hit in merged if hit["entry"]["id"] not in section_ids]
        return [*section_first, *component_fallbacks]
    return merged


def validate_slot_constraints(final_html: str, constraints: dict[str, dict[str, int]]) -> dict[str, Any]:
    soup = BeautifulSoup(final_html, "lxml")
    result = {"valid": True, "slots": {}, "violations": []}
    for slot_name, slot_constraints in constraints.items():
        container = soup.select_one(f"[data-slot='{slot_name}']")
        slot_result: dict[str, Any] = {}
        if container is None:
            result["valid"] = False
            result["violations"].append(f"Slot '{slot_name}' is missing from final HTML.")
            result["slots"][slot_name] = {"valid": False, "missing": True}
            continue

        for key, expected in slot_constraints.items():
            actual = _measure_slot(container, slot_name, key)
            valid = actual == expected
            slot_result[key] = {"expected": expected, "actual": actual, "valid": valid}
            if not valid:
                result["valid"] = False
                result["violations"].append(
                    f"Slot '{slot_name}' expected {key}={expected}, got {actual}."
                )
        slot_result["valid"] = all(item["valid"] for item in slot_result.values())
        result["slots"][slot_name] = slot_result
    return result


def candidate_satisfies_constraints(candidate_html: str, slot_name: str, slot_params: dict[str, int]) -> bool:
    soup = BeautifulSoup(_wrap_slot_html(slot_name, candidate_html), "lxml")
    container = soup.select_one(f"[data-slot='{slot_name}']")
    if container is None:
        return False
    for key, expected in slot_params.items():
        if _measure_slot(container, slot_name, key) != expected:
            return False
    return True


def _measure_slot(container: BeautifulSoup, slot_name: str, key: str) -> int:
    if slot_name in {"nav", "sidebar"} and key == "buttons_count":
        return len(container.select("a, button"))
    if slot_name == "code" and key == "examples_count":
        return len(container.select("pre code"))
    if slot_name in {"features", "stats", "pricing", "catalog_list"} and key == "cards_count":
        return len(container.select(".feature-card, .stat-card, .card, article"))
    if slot_name == "features" and key == "columns_count":
        for token in container.get("class", []):
            if token.startswith("columns-") and token.split("-", 1)[1].isdigit():
                return int(token.split("-", 1)[1])
        match = container.select_one("[class*='columns-']")
        if match:
            for token in match.get("class", []):
                if token.startswith("columns-") and token.split("-", 1)[1].isdigit():
                    return int(token.split("-", 1)[1])
        return 1
    return 0


def _build_selection(result: dict[str, Any], locked_set: set[str], prefer_family: str | None) -> dict[str, Any]:
    query = result["query"]
    layout_hits = _backfill_category_hits(result["hits"], query, "layouts", 4)
    typography_hits = _backfill_category_hits(result["hits"], query, "typography", 6)
    style_hits = _backfill_category_hits(result["hits"], query, "styles", 10)
    component_hits = _backfill_category_hits(result["hits"], query, "components", 12)
    interaction_hits = _backfill_category_hits(result["hits"], query, "interactions", 8)
    utility_hits = _backfill_category_hits(result["hits"], query, "utilities", 8)

    selection = {
        "layout": _pick_locked(layout_hits, locked_set) or _best(layout_hits),
        "typography": [],
        "styles": [],
        "components": [],
        "interactions": [],
        "utilities": [],
        "locked": list(locked_set),
    }
    best_typography = _pick_locked(typography_hits, locked_set) or _best(typography_hits)
    if best_typography:
        selection["typography"] = [best_typography]
    selection["styles"] = _resolve_conflicts(style_hits, locked_set, 6, prefer_family)
    selection["components"] = _resolve_conflicts(component_hits, locked_set, 6, prefer_family)
    selection["interactions"] = _resolve_conflicts(interaction_hits, locked_set, 3, prefer_family)
    selection["utilities"] = [
        hit
        for hit in utility_hits[:4]
        if hit["score"] > 0.1 or hit["entry"]["id"] in locked_set
    ]
    return selection


def _backfill_category_hits(
    base_hits: list[dict[str, Any]],
    query: str,
    category: str,
    minimum: int,
) -> list[dict[str, Any]]:
    existing = _by_category(base_hits, category)
    if len(existing) >= minimum:
        return existing

    targeted = search(
        query,
        temperature=0.22,
        top_k=max(minimum * 2, 8),
        category=category,
    )["hits"]
    merged: list[dict[str, Any]] = []
    seen: set[str] = set()
    for hit in [*existing, *targeted]:
        entry_id = hit["entry"]["id"]
        if entry_id in seen:
            continue
        seen.add(entry_id)
        merged.append(hit)
    merged.sort(key=_slot_candidate_priority, reverse=True)
    return merged


def _merge_selected_components(existing: list[dict[str, Any]], slot_hits: list[dict[str, Any]]) -> list[dict[str, Any]]:
    merged: list[dict[str, Any]] = []
    seen: set[str] = set()
    for hit in [*slot_hits, *existing]:
        entry_id = hit["entry"]["id"]
        if entry_id in seen:
            continue
        seen.add(entry_id)
        merged.append(hit)
    return merged[:8]


def _merge_selected_hits(existing: list[dict[str, Any]], new_hits: list[dict[str, Any]], limit: int) -> list[dict[str, Any]]:
    merged: list[dict[str, Any]] = []
    seen: set[str] = set()
    for hit in [*new_hits, *existing]:
        entry_id = hit["entry"]["id"]
        if entry_id in seen:
            continue
        seen.add(entry_id)
        merged.append(hit)
    return merged[:limit]


def _selected_hits(selection: dict[str, Any]) -> list[dict[str, Any]]:
    hits = [
        selection["layout"],
        *selection["typography"],
        *selection["styles"],
        *selection["components"],
        *selection["interactions"],
        *selection["utilities"],
    ]
    return [hit for hit in hits if hit]


def _tag_overlap(entry: dict[str, Any], tags: list[str]) -> bool:
    values = {
        *[str(tag).lower() for tag in entry.get("tags", [])],
        str(entry.get("name", "")).lower(),
        str(entry.get("semantic_description", "")).lower(),
    }
    return any(tag.lower() in value for tag in tags for value in values)


def _slot_candidate_priority(hit: dict[str, Any]) -> tuple[int, int, float]:
    meta = hit["entry"].get("meta") or {}
    return (
        ENTITY_LEVEL_PRIORITY.get(str(meta.get("entity_level") or "component"), 0),
        1 if meta.get("section_capable") else 0,
        1 if meta.get("has_html") else 0,
        float(hit.get("score", 0.0)),
    )


def _planned_slot_priority(
    slot_name: str,
    hit: dict[str, Any],
    slot_plan: dict[str, Any] | None = None,
) -> tuple[float, float, float, int, int, int, int, float]:
    entry = hit["entry"]
    meta = entry.get("meta") or {}
    entity_level = str(meta.get("entity_level") or "component")
    level_priority = ENTITY_LEVEL_PRIORITY.get(entity_level, 0)
    section_like = 1 if meta.get("section_capable") else 0
    html_like = 1 if meta.get("has_html") else 0
    tags = {str(tag).lower() for tag in entry.get("tags", [])}
    semantic = str(entry.get("semantic_description", "")).lower()
    family = str(entry.get("family") or "").lower()
    expected_families = [str(item).lower() for item in (slot_plan or {}).get("expectedFamilies", [])]
    intent_tokens = [str(item).lower() for item in (slot_plan or {}).get("intentTokens", [])]
    preferred_levels = [str(item).lower() for item in (slot_plan or {}).get("preferredLevels", [])]
    richness = _section_richness(entry)
    slot_match = 1 if slot_name.replace("_", " ") in semantic or slot_name in tags else 0
    family_match = 1 if any(item and item in family for item in expected_families) else 0
    intent_match_count = sum(1 for token in intent_tokens if token and (token in semantic or token in tags or token in family))
    preferred_level_rank = 0
    if entity_level in preferred_levels:
        preferred_level_rank = len(preferred_levels) - preferred_levels.index(entity_level)
    return (
        float(hit.get("score", 0.0)),
        float(intent_match_count),
        float(family_match),
        slot_match,
        preferred_level_rank,
        level_priority,
        section_like + html_like,
        richness,
        float(len(hit.get("matchedTokens") or [])),
    )


def _select_slot_base_candidate(
    slot_name: str,
    eligible: list[tuple[float, dict[str, Any]]],
    slot_plan: dict[str, Any] | None = None,
) -> dict[str, Any]:
    top_score = eligible[0][0]
    top_candidate = eligible[0][1]
    top_level = str((top_candidate["entry"].get("meta") or {}).get("entity_level") or "component")
    if slot_name not in MAJOR_SECTION_SLOTS or top_level == "section":
        return top_candidate

    preferred_levels = [str(item).lower() for item in (slot_plan or {}).get("preferredLevels", [])]
    prefer_section_first = bool(preferred_levels and preferred_levels[0] == "section")

    for score, candidate in eligible[1:]:
        level = str((candidate["entry"].get("meta") or {}).get("entity_level") or "component")
        if level != "section":
            continue
        if top_score - score <= (0.16 if prefer_section_first else 0.1):
            return candidate
    return top_candidate


def _supports_primary_slot(slot_name: str, candidate: dict[str, Any]) -> bool:
    entry = candidate["entry"]
    meta = entry.get("meta") or {}
    entity_level = str(meta.get("entity_level") or "component")
    if not (bool(meta.get("has_html")) or bool(meta.get("section_capable"))):
        return False
    if entity_level in {"modifier", "interaction", "utility"}:
        return False
    if slot_name in MAJOR_SECTION_SLOTS and _is_low_value_fragment(entry):
        return False
    if slot_name in MAJOR_SECTION_SLOTS and _is_atomic_fragment(entry):
        return False
    return True


def _build_render_context(
    query: str,
    selection: dict[str, Any],
    hits: list[dict[str, Any]],
    design_directives: dict[str, Any],
) -> dict[str, Any]:
    catalog_hits = [
        hit
        for hit in hits
        if hit["entry"]["category"] in {"components", "styles", "interactions", "utilities"}
    ][:12]
    category_counts: dict[str, int] = {}
    family_counts: dict[str, int] = {}
    tag_counts: dict[str, int] = {}
    entries: list[dict[str, Any]] = []

    for hit in catalog_hits:
        entry = hit["entry"]
        category = str(entry.get("category", "components"))
        family = str(entry.get("family") or "general")
        category_counts[category] = category_counts.get(category, 0) + 1
        family_counts[family] = family_counts.get(family, 0) + 1
        for token in hit.get("matchedTokens") or []:
            tag_counts[token] = tag_counts.get(token, 0) + 1
        entries.append(
            {
                "id": entry["id"],
                "name": entry["name"],
                "category": category,
                "family": family,
                "score": round(float(hit.get("score", 0.0)), 3),
                "matchedTokens": hit.get("matchedTokens") or [],
                "tags": entry.get("tags", [])[:6],
                "summary": _short_text(entry.get("semantic_description", ""), 180),
                "payload": _short_text(entry.get("payload", ""), 88),
                "hasCss": bool(entry.get("css")),
                "hasJs": bool(entry.get("js")),
            }
        )

    selected_categories = {
        "components": len(selection["components"]),
        "styles": len(selection["styles"]),
        "interactions": len(selection["interactions"]),
        "utilities": len(selection["utilities"]),
    }
    query_tokens = tokenize(query)[:8]
    top_tags = [tag for tag, _count in sorted(tag_counts.items(), key=lambda item: (-item[1], item[0]))[:8]]
    families = [
        {"name": name, "count": count}
        for name, count in sorted(family_counts.items(), key=lambda item: (-item[1], item[0]))[:6]
    ]
    return {
        "catalog_query": query,
        "catalog_query_tokens": query_tokens,
        "catalog_entries": entries,
        "catalog_primary": entries[0] if entries else None,
        "catalog_counts": category_counts,
        "catalog_selected_counts": selected_categories,
        "catalog_families": families,
        "catalog_tags": top_tags,
        "catalog_motion_level": design_directives.get("motionLevel", "none"),
    }


def _short_text(value: Any, limit: int) -> str:
    text = " ".join(str(value or "").split())
    if len(text) <= limit:
        return text
    return text[: max(0, limit - 1)].rstrip() + "..."


def _candidate_acceptance_report(candidate_html: str | None, acceptance: dict[str, Any]) -> dict[str, Any]:
    if not candidate_html:
        return {"valid": False, "reasons": ["empty html"]}
    return {"valid": True, "reasons": []}


def _candidate_is_eligible(candidate_html: str | None, acceptance: dict[str, Any]) -> bool:
    return bool(_candidate_acceptance_report(candidate_html, acceptance)["valid"])


def _slot_candidate_score(
    slot_name: str,
    candidate: dict[str, Any],
    used_component_ids: set[str] | None = None,
    used_major_families: set[str] | None = None,
    slot_plan: dict[str, Any] | None = None,
) -> float:
    entry = candidate["entry"]
    base_score = float(candidate.get("score", 0.0))
    html_fragment = entry.get("html") or ""
    wrapped = _wrap_slot_html(
        slot_name,
        html_fragment,
        semantic_tag=_slot_semantic_tag(slot_name),
        source_tokens=candidate.get("matchedTokens") or [],
        source_label=entry.get("name", entry.get("id", slot_name)),
    )
    mmss = _MMSS.compute(wrapped)
    qec = float(mmss.get("QEC", 0.0))
    stability = float(mmss.get("S", 0.0))
    volume = float(mmss.get("V", 0.0))
    bonus = qec * 0.18 + stability * 0.08 + volume * 0.04
    meta = entry.get("meta") or {}
    entity_level = str(meta.get("entity_level") or "component")
    family = str(entry.get("family") or "").lower()
    semantic = str(entry.get("semantic_description", "")).lower()
    tags = {str(tag).lower() for tag in entry.get("tags", [])}
    expected_families = [str(item).lower() for item in (slot_plan or {}).get("expectedFamilies", [])]
    intent_tokens = [str(item).lower() for item in (slot_plan or {}).get("intentTokens", [])]
    preferred_levels = [str(item).lower() for item in (slot_plan or {}).get("preferredLevels", [])]
    section_bonus = 0.18 if meta.get("section_capable") else 0.0
    html_bonus = 0.06 if meta.get("has_html") else 0.0
    level_bonus = 0.1 if entity_level == "section" else 0.03 if entity_level == "component" else -0.08
    if preferred_levels and entity_level in preferred_levels:
        level_bonus += 0.05 if preferred_levels.index(entity_level) == 0 else 0.01
    richness_bonus = min(0.14, _section_richness(entry) * (0.14 if slot_name in MAJOR_SECTION_SLOTS else 0.06))
    family_bonus = 0.12 if any(item and item in family for item in expected_families) else 0.0
    intent_bonus = min(0.12, sum(0.03 for token in intent_tokens if token and (token in semantic or token in tags or token in family)))
    discouraged_tokens = SLOT_DISCOURAGED_TOKENS.get(slot_name, set())
    mismatch_penalty = min(
        0.18,
        sum(0.045 for token in discouraged_tokens if token and (token in semantic or token in tags or token in family)),
    )
    atomic_penalty = 0.0
    if slot_name in MAJOR_SECTION_SLOTS and _is_atomic_fragment(entry):
        atomic_penalty += 0.28
    if slot_name in {"hero", "features", "pricing", "catalog_list", "catalog_detail", "widgets", "stats"} and _is_card_variant(entry):
        atomic_penalty += 0.12
    if _is_low_value_fragment(entry):
        atomic_penalty += 0.22 if slot_name in MAJOR_SECTION_SLOTS else 0.1
    repeat_penalty = 0.0
    if used_component_ids and entry.get("id") in used_component_ids:
        repeat_penalty += 0.24
    if slot_name in MAJOR_SECTION_SLOTS and used_major_families and family and family in used_major_families:
        repeat_penalty += 0.16
    return (
        base_score
        + bonus
        + section_bonus
        + html_bonus
        + level_bonus
        + richness_bonus
        + family_bonus
        + intent_bonus
        - mismatch_penalty
        - atomic_penalty
        - repeat_penalty
    )


def _build_fused_slot_html(
    slot_name: str,
    base_candidate: dict[str, Any],
    candidates: list[dict[str, Any]],
    layer_bundle: dict[str, Any] | None = None,
    slot_plan: dict[str, Any] | None = None,
) -> tuple[str, list[dict[str, Any]]]:
    if slot_name not in MAJOR_SECTION_SLOTS:
        return "", []

    base_entry = base_candidate["entry"]
    base_level = str((base_entry.get("meta") or {}).get("entity_level") or "component")
    base_html = str(base_entry.get("html") or "")
    recipe = _build_slot_recipe(slot_name, base_candidate, candidates, layer_bundle, slot_plan)
    if recipe["html"]:
        return recipe["html"], recipe["entries"]
    if base_level != "section":
        return "", []

    support_entries = _collect_supporting_slot_candidates(slot_name, base_candidate, candidates, slot_plan)
    if not support_entries:
        return "", []

    support_markup = [_hybrid_insert_markup(candidate) for candidate in support_entries]
    fused_html = _inject_support_modules(base_html, slot_name, support_markup, slot_plan)
    return fused_html, support_entries


def _build_slot_recipe(
    slot_name: str,
    base_candidate: dict[str, Any],
    candidates: list[dict[str, Any]],
    layer_bundle: dict[str, Any] | None = None,
    slot_plan: dict[str, Any] | None = None,
) -> dict[str, Any]:
    bundle = layer_bundle or {}
    shell_hits = [item for item in bundle.get("layouts", []) if isinstance(item, dict)]
    support_sections = [item for item in bundle.get("sections", []) if isinstance(item, dict)]
    support_components = [item for item in bundle.get("components", []) if isinstance(item, dict)]
    base_entry = base_candidate["entry"]
    base_html = str(base_entry.get("html") or "").strip()
    base_level = str((base_entry.get("meta") or {}).get("entity_level") or "component")

    if not shell_hits and base_level == "section" and not support_sections and not support_components:
        return {"html": "", "entries": []}

    modules: list[str] = []
    used_entries: list[dict[str, Any]] = []
    seen_ids: set[str] = set()

    if base_html:
        modules.append(f'<div class="section-recipe__primary">{base_html}</div>')
    if base_candidate["entry"]["id"] not in seen_ids:
        seen_ids.add(base_candidate["entry"]["id"])
        used_entries.append(base_candidate)

    secondary_sections = [
        candidate for candidate in support_sections
        if candidate["entry"]["id"] not in seen_ids
    ][:2]
    if secondary_sections:
        modules.append(
            '<div class="section-recipe__secondary">'
            + "".join(_recipe_module_markup(candidate) for candidate in secondary_sections)
            + "</div>"
        )
        for candidate in secondary_sections:
            seen_ids.add(candidate["entry"]["id"])
            used_entries.append(candidate)

    secondary_components = [
        candidate for candidate in support_components
        if candidate["entry"]["id"] not in seen_ids
    ][:3]
    if secondary_components:
        modules.append(
            '<div class="section-recipe__support">'
            + "".join(_recipe_module_markup(candidate) for candidate in secondary_components)
            + "</div>"
        )
        for candidate in secondary_components:
            seen_ids.add(candidate["entry"]["id"])
            used_entries.append(candidate)

    if not modules:
        return {"html": "", "entries": []}

    shell_class = _extract_layout_shell_class(shell_hits[0]) if shell_hits else ""
    shell_attr = f" section-recipe__layout {shell_class}".strip()
    shell_open = f'<div class="{html.escape(shell_attr, quote=True)}">' if shell_attr else "<div>"
    recipe_html = (
        f'<div class="section-recipe section-recipe--{slot_name}">'
        f"{shell_open}"
        + "".join(modules)
        + "</div></div>"
    )

    if base_level == "section" and base_html and not secondary_sections and secondary_components:
        support_markup = [_hybrid_insert_markup(candidate) for candidate in secondary_components]
        injected = _inject_support_modules(base_html, slot_name, support_markup, slot_plan)
        if injected and injected != base_html:
            recipe_html = (
                f'<div class="section-recipe section-recipe--{slot_name}">'
                f"{shell_open}<div class=\"section-recipe__primary\">{injected}</div></div></div>"
            )

    for shell_hit in shell_hits[:1]:
        if shell_hit["entry"]["id"] not in seen_ids:
            used_entries.append(shell_hit)
    return {"html": recipe_html, "entries": used_entries}


def _collect_supporting_slot_candidates(
    slot_name: str,
    base_candidate: dict[str, Any],
    candidates: list[dict[str, Any]],
    slot_plan: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    expected_families = [str(item).lower() for item in (slot_plan or {}).get("expectedFamilies", [])]
    intent_tokens = [str(item).lower() for item in (slot_plan or {}).get("intentTokens", [])]
    base_family = str(base_candidate["entry"].get("family") or "").lower()
    base_id = base_candidate["entry"]["id"]

    scored: list[tuple[float, dict[str, Any]]] = []
    seen: set[str] = {base_id}
    for candidate in candidates:
        entry = candidate["entry"]
        entry_id = entry["id"]
        if entry_id in seen:
            continue
        seen.add(entry_id)
        meta = entry.get("meta") or {}
        level = str(meta.get("entity_level") or "component")
        if level not in {"section", "component"}:
            continue
        if _is_atomic_fragment(entry):
            continue
        family = str(entry.get("family") or "").lower()
        semantic = str(entry.get("semantic_description", "")).lower()
        tags = {str(tag).lower() for tag in entry.get("tags", [])}
        score = float(candidate.get("score", 0.0))
        if family and family == base_family:
            score += 0.08
        if any(item and item in family for item in expected_families):
            score += 0.08
        score += sum(0.02 for token in intent_tokens if token and (token in semantic or token in tags or token in family))
        if slot_name in {"catalog_list", "catalog_detail", "features", "widgets", "stats"} and _is_card_variant(entry):
            score += 0.04
        scored.append((score, candidate))

    scored.sort(key=lambda item: item[0], reverse=True)
    limit = 2 if slot_name in {"hero", "cta", "header", "footer"} else 3
    return [candidate for _score, candidate in scored[:limit]]


def _select_slot_layer_bundle(
    slot_name: str,
    retrieval_context: dict[str, Any],
    slot_plan: dict[str, Any] | None,
    component_candidates: list[dict[str, Any]],
) -> dict[str, Any]:
    layout_hits = search(
        str((slot_plan or {}).get("retrievalQuery") or retrieval_context["query"]),
        temperature=0.14,
        top_k=5,
        category="layouts",
        locked=list(retrieval_context["locked"]),
    )["hits"]
    style_hits = search(
        str((slot_plan or {}).get("styleQuery") or retrieval_context["query"]),
        temperature=0.16,
        top_k=4,
        category="styles",
        locked=list(retrieval_context["locked"]),
    )["hits"]
    interaction_hits = search(
        str((slot_plan or {}).get("interactionQuery") or retrieval_context["query"]),
        temperature=0.16,
        top_k=3,
        category="interactions",
        locked=list(retrieval_context["locked"]),
    )["hits"]

    expected_families = [str(item).lower() for item in (slot_plan or {}).get("expectedFamilies", [])]

    def rank_hits(hits: list[dict[str, Any]]) -> list[dict[str, Any]]:
        ranked: list[tuple[float, dict[str, Any]]] = []
        seen: set[str] = set()
        for hit in hits:
            entry = hit["entry"]
            entry_id = entry["id"]
            if entry_id in seen:
                continue
            seen.add(entry_id)
            family = str(entry.get("family") or "").lower()
            semantic = str(entry.get("semantic_description", "")).lower()
            tags = {str(tag).lower() for tag in entry.get("tags", [])}
            score = float(hit.get("score", 0.0))
            if any(item and item in family for item in expected_families):
                score += 0.08
            if slot_name in semantic or slot_name in tags:
                score += 0.04
            ranked.append((score, hit))
        ranked.sort(key=lambda item: item[0], reverse=True)
        return [hit for _score, hit in ranked]

    ranked_components = rank_hits(component_candidates)
    support_sections = [
        hit
        for hit in ranked_components
        if str((hit["entry"].get("meta") or {}).get("entity_level") or "component") == "section"
        and not _is_low_value_fragment(hit["entry"])
    ][:2]

    support_components = _collect_supporting_slot_candidates(
        slot_name,
        component_candidates[0] if component_candidates else {"entry": {"id": f"slot-{slot_name}", "family": "", "meta": {"entity_level": "section"}}},
        ranked_components,
        slot_plan,
    ) if component_candidates else []

    support_targets = [str(item) for item in (slot_plan or {}).get("supportTargets", []) if str(item).strip()]

    return {
        "layouts": rank_hits(layout_hits)[:2],
        "sections": support_sections,
        "components": support_components,
        "styles": rank_hits(style_hits)[:2],
        "interactions": rank_hits(interaction_hits)[:1 if slot_name in {"hero", "cta", "header"} else 2],
        "supportTarget": support_targets[0] if support_targets else None,
    }


def _describe_slot_bundle(section: dict[str, Any]) -> dict[str, Any]:
    hit = section.get("hit")
    base_entry = hit["entry"] if isinstance(hit, dict) and isinstance(hit.get("entry"), dict) else None
    layout_hits = [item for item in section.get("layoutHits", []) if isinstance(item, dict)]
    section_hits = [item for item in section.get("sectionHits", []) if isinstance(item, dict)]
    support_hits = [item for item in section.get("supportHits", []) if isinstance(item, dict)]
    style_hits = [item for item in section.get("styleHits", []) if isinstance(item, dict)]
    interaction_hits = [item for item in section.get("interactionHits", []) if isinstance(item, dict)]

    return {
        "base": _describe_hit_for_bundle(hit),
        "layouts": [_describe_hit_for_bundle(item) for item in layout_hits],
        "sections": [_describe_hit_for_bundle(item) for item in section_hits],
        "support": [_describe_hit_for_bundle(item) for item in support_hits],
        "styles": [_describe_hit_for_bundle(item) for item in style_hits],
        "interactions": [_describe_hit_for_bundle(item) for item in interaction_hits],
        "supportTarget": section.get("supportTarget"),
        "retrievalQuery": section.get("retrievalQuery"),
        "styleQuery": section.get("styleQuery"),
        "interactionQuery": section.get("interactionQuery"),
        "expectedFamilies": [str(item) for item in section.get("expectedFamilies", [])],
        "baseFamily": str(base_entry.get("family") or "") if base_entry else "",
        "baseLevel": str((base_entry.get("meta") or {}).get("entity_level") or "") if base_entry else "",
    }


def _describe_hit_for_bundle(hit: dict[str, Any] | None) -> dict[str, Any] | None:
    if not isinstance(hit, dict):
        return None
    entry = hit.get("entry")
    if not isinstance(entry, dict):
        return None
    meta = entry.get("meta") or {}
    return {
        "id": entry.get("id"),
        "category": entry.get("category"),
        "name": entry.get("name"),
        "family": entry.get("family"),
        "level": meta.get("entity_level"),
        "sectionCapable": bool(meta.get("section_capable")),
        "score": round(float(hit.get("score", 0.0)), 4),
        "matchedTokens": hit.get("matchedTokens", []),
    }


def _inject_support_modules(
    base_html: str,
    slot_name: str,
    support_markup: list[str],
    slot_plan: dict[str, Any] | None = None,
) -> str:
    if not support_markup:
        return base_html

    soup = BeautifulSoup(base_html, "lxml")
    selectors = [str(item) for item in (slot_plan or {}).get("supportTargets", []) if str(item).strip()]
    target = None
    for selector in selectors:
        target = soup.select_one(selector)
        if target is not None:
            break

    if target is not None:
        for markup in support_markup:
            fragment = BeautifulSoup(markup, "lxml")
            nodes = list(fragment.body.contents) if fragment.body else list(fragment.contents)
            for node in nodes:
                target.append(node)
        body = soup.body
        return "".join(str(node) for node in body.contents) if body else str(soup)

    return (
        f"{base_html}\n"
        f'<div class="slot-fusion slot-fusion--{slot_name}">'
        f'<div class="slot-fusion__label">Supporting modules</div>'
        f'<div class="slot-fusion__grid">{"".join(support_markup)}</div>'
        f"</div>"
    )


def _recipe_module_markup(candidate: dict[str, Any]) -> str:
    entry = candidate["entry"]
    html_fragment = str(entry.get("html") or "").strip()
    if html_fragment:
        return f'<div class="section-recipe__module">{html_fragment}</div>'
    return _hybrid_insert_markup(candidate)


def _extract_layout_shell_class(hit: dict[str, Any] | None) -> str:
    if not isinstance(hit, dict):
        return ""
    entry = hit.get("entry")
    if not isinstance(entry, dict):
        return ""

    html_fragment = str(entry.get("html") or "").strip()
    if html_fragment:
        soup = BeautifulSoup(html_fragment, "lxml")
        root = next((node for node in soup.body.contents if getattr(node, "name", None)), None)
        if root is not None:
            classes = root.get("class") or []
            if classes:
                return " ".join(str(item) for item in classes[:4])

    payload = str(entry.get("payload") or "").strip()
    payload_tokens = [token for token in payload.split() if token and not token.startswith("grid-cols-")]
    return " ".join(payload_tokens[:4])


def _is_card_variant(entry: dict[str, Any]) -> bool:
    tags = {str(tag).lower() for tag in entry.get("tags", [])}
    meta = entry.get("meta") or {}
    return "card" in tags or str(meta.get("type", "")).lower() in {"product", "testimonial", "stat", "feature"}


def _section_richness(entry: dict[str, Any]) -> float:
    html_fragment = str(entry.get("html") or "").strip()
    if not html_fragment:
        return 0.0

    soup = BeautifulSoup(html_fragment, "lxml")
    root = next((node for node in soup.body.contents if getattr(node, "name", None)), None)
    if root is None:
        return 0.0

    block_nodes = len(root.select("section, article, nav, aside, header, footer, ul, ol, li, div"))
    interactive_nodes = len(root.select("button, a, input, select, textarea"))
    heading_nodes = len(root.select("h1, h2, h3, h4"))
    text_length = len(root.get_text(" ", strip=True))
    richness = 0.0
    richness += min(0.35, block_nodes * 0.025)
    richness += min(0.2, interactive_nodes * 0.04)
    richness += min(0.18, heading_nodes * 0.06)
    richness += min(0.27, text_length / 900)
    return min(1.0, richness)


def _is_low_value_fragment(entry: dict[str, Any]) -> bool:
    text = " ".join(
        [
            str(entry.get("name", "")).lower(),
            str(entry.get("semantic_description", "")).lower(),
            str(entry.get("payload", "")).lower(),
            str(entry.get("html", "")).lower(),
        ]
    )
    return any(
        token in text
        for token in (
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
    )


def _is_atomic_fragment(entry: dict[str, Any]) -> bool:
    html_fragment = str(entry.get("html") or "").strip()
    if not html_fragment:
        return True

    soup = BeautifulSoup(html_fragment, "lxml")
    root = next((node for node in soup.body.contents if getattr(node, "name", None)), None)
    if root is None:
        return True

    descendants = [node for node in root.descendants if getattr(node, "name", None)]
    interactive_count = len(root.select("button, a, input, select, textarea"))
    heading_count = len(root.select("h1, h2, h3, h4"))
    block_count = len(root.select("section, article, nav, aside, header, footer, ul, ol"))
    text_length = len(root.get_text(" ", strip=True))

    if root.name in {"button", "a", "input"}:
        return True
    if interactive_count == 1 and len(descendants) <= 2 and text_length <= 40:
        return True
    if block_count == 0 and heading_count <= 1 and len(descendants) <= 3 and text_length <= 80:
        return True
    return False


def _build_hybrid_slot_html(
    slot_name: str,
    fallback_html: str,
    candidates: list[dict[str, Any]],
) -> tuple[str, list[dict[str, Any]]]:
    limit = HYBRID_INSERT_LIMITS.get(slot_name, 0)
    if limit <= 0:
        return fallback_html, []

    inserts: list[str] = []
    used_entries: list[dict[str, Any]] = []
    seen: set[str] = set()

    for candidate in candidates:
        entry = candidate["entry"]
        entry_id = entry["id"]
        if entry_id in seen:
            continue
        seen.add(entry_id)
        if (entry.get("meta") or {}).get("section_capable"):
            continue
        insert_markup = _hybrid_insert_markup(candidate)
        if not insert_markup:
            continue
        used_entries.append(candidate)
        inserts.append(insert_markup)
        if len(inserts) >= limit:
            break

    if not inserts:
        return fallback_html, []

    hybrid_block = (
        f'<div class="hybrid-slot hybrid-slot--{slot_name}">'
        f'<div class="hybrid-slot__label">Retrieved enrichments</div>'
        f'<div class="hybrid-slot__grid">{"".join(inserts)}</div>'
        f"</div>"
    )
    return f"{fallback_html}\n{hybrid_block}", used_entries


def assess_completeness(slot_sections: list[dict[str, Any]], archetype_name: str) -> dict[str, Any]:
    total = len(slot_sections)
    major_total = sum(1 for section in slot_sections if section["slot"] in MAJOR_SECTION_SLOTS)
    retrieved = sum(1 for section in slot_sections if section["source"] in {"retrieved", "retrieved_fused"})
    fused = sum(1 for section in slot_sections if section["source"] == "retrieved_fused")
    fallback = sum(1 for section in slot_sections if str(section["source"]).startswith("fallback"))
    major_retrieved = sum(
        1 for section in slot_sections if section["slot"] in MAJOR_SECTION_SLOTS and section["source"] in {"retrieved", "retrieved_fused"}
    )
    section_first = sum(
        1 for section in slot_sections if section["slot"] in MAJOR_SECTION_SLOTS and section.get("componentId")
    )
    warnings: list[str] = []
    if major_total and major_retrieved / major_total < 0.5:
        warnings.append(
            f"Section coverage is low: only {major_retrieved}/{major_total} major slots were retrieval-backed."
        )
    if fallback >= max(2, total // 2):
        warnings.append(
            f"Fallback pressure is high: {fallback}/{total} slots used fallback assembly."
        )
    if fused == 0 and archetype_name in {"landing", "dashboard", "catalog"}:
        warnings.append("No fused section composition was applied to major slots.")
    return {
        "totalSlots": total,
        "majorSlots": major_total,
        "retrievedSlots": retrieved,
        "fusedSlots": fused,
        "fallbackSlots": fallback,
        "majorRetrievedSlots": major_retrieved,
        "sectionFirstSlots": section_first,
        "warnings": warnings,
    }


def _hybrid_insert_markup(candidate: dict[str, Any]) -> str:
    entry = candidate["entry"]
    html_fragment = str(entry.get("html") or "").strip()
    if html_fragment:
        return f'<article class="hybrid-slot__item hybrid-slot__item--html">{html_fragment}</article>'

    name = html.escape(str(entry.get("name", "Retrieved entry")))
    category = html.escape(str(entry.get("category", "component")))
    family = html.escape(str(entry.get("family") or "general"))
    summary = html.escape(_short_text(entry.get("semantic_description", ""), 140))
    payload = html.escape(_short_text(entry.get("payload", ""), 88))
    score = f"{float(candidate.get('score', 0.0)):.3f}"
    return (
        '<article class="hybrid-slot__item hybrid-slot__item--semantic">'
        f'<span class="code-pill">{category}</span>'
        f'<span class="code-pill code-pill--muted">{family}</span>'
        f"<h3>{name}</h3>"
        f"<p>{summary}</p>"
        f'<pre class="catalog-code"><code>{payload}</code></pre>'
        f'<div class="code-section__meta"><span class="code-pill code-pill--muted">score {score}</span></div>'
        "</article>"
    )


def _wrap_slot_html(
    slot_name: str,
    inner_html: str,
    *,
    semantic_tag: str,
    source_tokens: list[str],
    source_label: str,
) -> str:
    safe_tokens = ", ".join(dict.fromkeys(token for token in source_tokens if token))
    debug_label = f"{slot_name} [{semantic_tag}]"
    return (
        f'<section class="slot slot--{slot_name}" '
        f'data-slot="{html.escape(slot_name, quote=True)}" '
        f'data-semantic-tag="{html.escape(semantic_tag, quote=True)}" '
        f'data-source-label="{html.escape(source_label, quote=True)}" '
        f'data-source-tokens="{html.escape(safe_tokens, quote=True)}" '
        f'data-debug-label="{html.escape(debug_label, quote=True)}">'
        f"{inner_html}</section>"
    )


def _render_css(
    selected: list[dict[str, Any]],
    slot_sections: list[dict[str, Any]],
    media_strategy: str,
    debug_tips: bool,
    design_directives: dict[str, Any],
) -> str:
    blocks = [BASE_RESET]
    root_vars = [hit["entry"]["css"] for hit in selected if hit["entry"].get("css") and ":root" in hit["entry"]["css"]]
    if root_vars:
        blocks.append("\n".join(root_vars))
    for hit in selected:
        css = hit["entry"].get("css")
        if css and ":root" not in css:
            source_tokens = ", ".join(hit.get("matchedTokens") or [])
            blocks.append(
                f"/* {hit['entry']['id']} | source tokens: {source_tokens or 'none'} */\n{css}"
            )
    responsive = _responsive_rules(selected, media_strategy)
    if responsive:
        blocks.append(responsive)
    directive_css = _directive_css(design_directives)
    if directive_css:
        blocks.append(directive_css)
    if debug_tips:
        blocks.append(_debug_tips_css(slot_sections))
    return "\n\n".join(blocks)


def _responsive_rules(selected: list[dict[str, Any]], media_strategy: str) -> str:
    mobile: list[str] = []
    tablet: list[str] = []
    desktop: list[str] = []
    for hit in selected:
        responsive = hit["entry"].get("responsive") or {}
        if responsive.get("mobile"):
            mobile.append(f"  {responsive['mobile']}")
        if responsive.get("tablet"):
            tablet.append(f"  {responsive['tablet']}")
        if responsive.get("desktop"):
            desktop.append(f"  {responsive['desktop']}")
    chunks_by_key = {
        "mobile": "@media (max-width: 480px) {\n  /* mobile viewport */\n"
        + ("\n".join(mobile) + "\n" if mobile else "")
        + "}",
        "tablet": "@media (min-width: 768px) and (max-width: 1024px) {\n  /* tablet viewport */\n"
        + ("\n".join(tablet) + "\n" if tablet else "")
        + "}",
        "full-hd": "@media (min-width: 1920px) and (max-width: 2559px) {\n  /* Full HD viewport */\n  .page-shell{max-width:1800px;margin:0 auto;}\n"
        + ("\n".join(desktop) + "\n" if desktop else "")
        + "}",
        "qhd": "@media (min-width: 2560px) {\n  /* 2K / QHD viewport */\n  .page-shell{max-width:2200px;margin:0 auto;}\n"
        + ("\n".join(desktop) + "\n" if desktop else "")
        + "}",
    }
    order = (
        ["mobile", "tablet", "full-hd", "qhd"]
        if media_strategy == "mobile-first"
        else ["qhd", "full-hd", "tablet", "mobile"]
    )
    return "\n\n".join([f"/* media strategy: {media_strategy} */", *[chunks_by_key[key] for key in order]])


def _debug_tips_css(slot_sections: list[dict[str, Any]]) -> str:
    semantic_tags = {section["semanticTag"] for section in slot_sections}
    color_map = {
        "hero": "#f59e0b",
        "navigation": "#3b82f6",
        "content": "#10b981",
        "metrics": "#8b5cf6",
        "commerce": "#ef4444",
        "insight": "#14b8a6",
        "action": "#f97316",
        "footer": "#64748b",
        "data": "#ec4899",
    }
    tag_rules = "\n".join(
        f'[data-semantic-tag="{tag}"]{{--semantic-color:{color_map.get(tag, "#111827")};}}'
        for tag in sorted(semantic_tags)
    )
    return f"""
{tag_rules}
body[data-debug-tips="1"] [data-slot]{{position:relative;outline-offset:4px;}}
body[data-debug-tips="1"] [data-slot]::before{{content:"";position:absolute;top:10px;left:10px;width:10px;height:10px;border-radius:999px;background:var(--semantic-color,#111827);box-shadow:0 0 0 3px rgba(255,255,255,.9);z-index:20;}}
body[data-debug-tips="1"] [data-slot]:hover{{outline:2px dashed var(--semantic-color,#111827);}}
body[data-debug-tips="1"] [data-slot]:hover::after{{content:attr(data-debug-label) " | " attr(data-source-tokens);position:absolute;top:10px;left:28px;max-width:min(70ch,calc(100% - 40px));padding:8px 10px;border-radius:10px;background:rgba(17,24,39,.92);color:#f8fafc;font-size:12px;line-height:1.35;z-index:21;box-shadow:0 12px 30px rgba(15,23,42,.28);}}
"""


def _render_js(entries: list[dict[str, Any]], design_directives: dict[str, Any]) -> tuple[str, list[str]]:
    snippets: list[str] = []
    warnings: list[str] = []
    for entry in entries:
        snippet = entry.get("js", "").strip()
        if not snippet:
            continue
        is_valid, reason = _validate_js_snippet(snippet)
        if not is_valid:
            warnings.append(
                f"Skipped invalid JS snippet from '{entry.get('name', entry.get('id', 'unknown'))}': {reason}"
            )
            continue
        snippets.append(snippet)
    directive_js = _directive_js(design_directives)
    if directive_js:
        snippets.append(directive_js)
    return "\n\n".join(f"/* interaction {index + 1} */\n{snippet}" for index, snippet in enumerate(snippets)), warnings


def _render_html(archetype_name: str, slot_sections: list[dict[str, Any]]) -> str:
    section_map = {section["slot"]: section["html"] for section in slot_sections}
    if archetype_name == "dashboard":
        return f"""<div class="page-shell dashboard-shell">
  {section_map.get("sidebar", "")}
  <div class="dashboard-content">
    {section_map.get("header", "")}
    <main class="dashboard-main">
      {section_map.get("stats", "")}
      {section_map.get("filters", "")}
      {section_map.get("charts", "")}
      {section_map.get("table", "")}
      {section_map.get("widgets", "")}
    </main>
  </div>
</div>"""
    if archetype_name == "docs":
        return f"""<div class="page-shell docs-shell">
  <aside class="docs-sidebar">{section_map.get("nav", "")}</aside>
  <main class="docs-main">
    {section_map.get("article_header", "")}
    {section_map.get("content_body", "")}
    {section_map.get("code", "")}
    {section_map.get("footer", "")}
  </main>
</div>"""
    if archetype_name == "catalog":
        return f"""<div class="page-shell landing-shell">
  <main class="landing-main">
    {section_map.get("catalog_header", "")}
    {section_map.get("catalog_filters", "")}
    {section_map.get("catalog_list", "")}
    {section_map.get("catalog_detail", "")}
  </main>
  {section_map.get("footer", "")}
</div>"""
    return f"""<div class="page-shell landing-shell">
  <main class="landing-main">
    {section_map.get("hero", "")}
    {section_map.get("features", "")}
    {section_map.get("testimonials", "")}
    {section_map.get("pricing", "")}
    {section_map.get("faq", "")}
    {section_map.get("cta", "")}
  </main>
  {section_map.get("footer", "")}
</div>"""


def _render_standalone(
    css: str,
    page_html: str,
    js: str,
    selection: dict[str, Any],
    archetype_name: str,
    media_strategy: str,
    debug_tips: bool,
) -> str:
    title = selection["typography"][0]["entry"]["name"] if selection["typography"] else archetype_name.title()
    inline_js = _sanitize_inline_script(js)
    output = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="generator" content="Semantic UI Genesis Engine" />
  <title>{html.escape(title)}</title>
  <style>
{css}
  </style>
</head>
<body data-media-strategy="{html.escape(media_strategy)}" data-debug-tips="{1 if debug_tips else 0}">
{page_html}
{f"<script>\\n{inline_js}\\n</script>" if inline_js else ""}
</body>
</html>"""
    if any(token in output.lower() for token in ("<link ", "script src=", "http://", "https://")):
        raise RuntimeError("Export Standalone produced external references.")
    return output


def _build_tree(archetype_name: str, selection: dict[str, Any], slot_sections: list[dict[str, Any]]) -> dict[str, Any]:
    slot_nodes = []
    for section in slot_sections:
        category = "components"
        hit = next((hit for hit in selection["components"] if hit["entry"]["id"] == section.get("componentId")), None)
        if hit:
            category = hit["entry"]["category"]
        slot_nodes.append(
            {
                "id": section.get("componentId") or f"slot-{section['slot']}",
                "label": f"{section['slot']} ({section['source']})",
                "category": category if category in {"components", "layouts", "styles", "typography", "interactions", "utilities"} else "root",
                "score": hit["score"] if hit else None,
                "locked": bool(hit and hit["entry"]["id"] in selection["locked"]),
            }
        )
    return {
        "id": "page-root",
        "label": f"Assembled {archetype_name.title()} Page",
        "category": "page",
        "children": [
            {
                "id": "slot-plan",
                "label": "Slot Plan",
                "category": "root",
                "children": slot_nodes,
            },
            {
                "id": "styles-group",
                "label": "Styles",
                "category": "root",
                "children": [_tree_hit(hit, selection) for hit in selection["styles"]],
            },
            {
                "id": "interactions-group",
                "label": "Interactions",
                "category": "root",
                "children": [_tree_hit(hit, selection) for hit in selection["interactions"]],
            },
            {
                "id": "utilities-group",
                "label": "Utilities",
                "category": "root",
                "children": [_tree_hit(hit, selection) for hit in selection["utilities"]],
            },
        ],
    }


def _tree_hit(hit: dict[str, Any], selection: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": hit["entry"]["id"],
        "label": hit["entry"]["name"],
        "category": hit["entry"]["category"],
        "score": hit["score"],
        "locked": hit["entry"]["id"] in selection["locked"],
    }


def compute_metrics(selection: dict[str, Any], vectors: dict[str, list[float]]) -> dict[str, Any]:
    selected_hits = _selected_hits(selection)
    semantic_vectors = [vectors[hit["entry"]["id"]] for hit in selected_hits if hit["entry"]["id"] in vectors]
    pairwise = mean_pairwise_cosine(semantic_vectors)
    families = [hit["entry"].get("family") for hit in selected_hits if hit["entry"].get("family")]
    family_agreement = 1 - len(set(families)) / len(families) if len(families) > 1 else 1
    semantic_coherence = _clamp_pct(round((pairwise * 0.6 + family_agreement * 0.4) * 100))

    contrast_values: list[float] = []
    contrast_warnings: list[str] = []
    for hit in selected_hits:
        ratio = (hit["entry"].get("accessibility") or {}).get("contrastRatio")
        if isinstance(ratio, (int, float)):
            contrast_values.append(float(ratio))
            if ratio < 4.5:
                contrast_warnings.append(f"{hit['entry']['name']}: contrast {ratio}:1 below WCAG AA (4.5)")
    mean_contrast = sum(contrast_values) / len(contrast_values) if contrast_values else 7.0
    contrast_score = _clamp_pct(round((mean_contrast / 7) * 100))

    interactive = [hit for hit in selected_hits if hit["entry"]["category"] in {"components", "interactions"}]
    with_aria = [hit for hit in interactive if (hit["entry"].get("accessibility") or {}).get("aria")]
    focus_visible = [hit for hit in interactive if (hit["entry"].get("accessibility") or {}).get("focusVisible")]
    aria_coverage = _clamp_pct(round((len(with_aria) / len(interactive)) * 100)) if interactive else 100
    focus_score = _clamp_pct(round((len(focus_visible) / len(interactive)) * 100)) if interactive else 100
    accessibility_score = _clamp_pct(round(contrast_score * 0.45 + aria_coverage * 0.3 + focus_score * 0.25))

    media_queries = sum(1 for hit in selected_hits if hit["entry"].get("responsive"))
    dom_estimate = 20 + len(selection["components"]) * 12 + len(selection["styles"]) * 2 + len(selection["utilities"]) + len(selection["interactions"]) * 3
    complexity_index = _clamp_pct(round(min(100, dom_estimate * 0.6 + media_queries * 6 + (len(selection["styles"]) + len(selection["interactions"])) * 4)))
    return {
        "semanticCoherence": semantic_coherence,
        "accessibilityScore": accessibility_score,
        "complexityIndex": complexity_index,
        "contrastWarnings": contrast_warnings,
        "ariaCoverage": aria_coverage,
        "domNodeEstimate": dom_estimate,
        "mediaQueries": media_queries,
        "detail": {
            "pairwiseCosine": round(pairwise, 3),
            "lockedCount": len(selection["locked"]),
            "componentCount": len(selection["components"]),
            "styleCount": len(selection["styles"]),
            "utilityCount": len(selection["utilities"]),
        },
    }


def _by_category(hits: list[dict[str, Any]], category: str) -> list[dict[str, Any]]:
    return [hit for hit in hits if hit["entry"]["category"] == category]


def _best(hits: list[dict[str, Any]]) -> dict[str, Any] | None:
    return hits[0] if hits else None


def _pick_locked(hits: list[dict[str, Any]], locked: set[str]) -> dict[str, Any] | None:
    return next((hit for hit in hits if hit["entry"]["id"] in locked), None)


def _resolve_conflicts(hits: list[dict[str, Any]], locked: set[str], maximum: int, prefer_family: str | None) -> list[dict[str, Any]]:
    kept: list[dict[str, Any]] = []
    claimed: set[str] = set()
    for hit in hits:
        if hit["entry"]["id"] in locked:
            kept.append(hit)
            claimed.update(hit["entry"].get("conflicts", []))
    for hit in hits:
        if len(kept) >= maximum:
            break
        if hit["entry"]["id"] in locked:
            continue
        conflicts = set(hit["entry"].get("conflicts", []))
        if conflicts & claimed:
            continue
        kept.append(hit)
        claimed.update(conflicts)
    if prefer_family and len(kept) < maximum:
        for hit in hits:
            if len(kept) >= maximum:
                break
            if hit in kept or hit["entry"].get("family") != prefer_family:
                continue
            conflicts = set(hit["entry"].get("conflicts", []))
            if conflicts & claimed:
                continue
            kept.append(hit)
            claimed.update(conflicts)
    return kept


def _clamp_pct(value: int) -> int:
    return max(0, min(100, value))


def _slot_semantic_tag(slot_name: str) -> str:
    mapping = {
        "hero": "hero",
        "sidebar": "navigation",
        "nav": "navigation",
        "header": "content",
        "article_header": "content",
        "content_body": "content",
        "features": "content",
        "testimonials": "insight",
        "pricing": "commerce",
        "faq": "insight",
        "cta": "action",
        "footer": "footer",
        "stats": "metrics",
        "filters": "navigation",
        "charts": "data",
        "table": "data",
        "widgets": "insight",
        "code": "content",
        "catalog_header": "content",
        "catalog_filters": "navigation",
        "catalog_list": "content",
        "catalog_detail": "insight",
    }
    return mapping.get(slot_name, "content")


def _directive_css(design_directives: dict[str, Any]) -> str:
    blocks: list[str] = []
    chaos_level = design_directives.get("chaosLevel", "calm")
    random_field = bool(design_directives.get("randomFieldArea"))
    motion_level = design_directives.get("motionLevel", "none")
    surface_effects = set(design_directives.get("surfaceEffects") or [])

    if random_field:
        amplitude_map = {"dynamic": 8, "chaotic": 14}
        rotation_map = {"dynamic": 1.5, "chaotic": 3.5}
        amplitude = amplitude_map.get(chaos_level, 4)
        rotation = rotation_map.get(chaos_level, 0.75)
        blocks.append(
            f"""
/* random field area */
.feature-card:nth-child(3n+1), .widget-card:nth-child(3n+1), .testimonial-card:nth-child(3n+1){{transform:translate({amplitude}px,-{max(2, amplitude // 2)}px) rotate({rotation}deg);}}
.feature-card:nth-child(3n+2), .widget-card:nth-child(3n+2), .testimonial-card:nth-child(3n+2){{transform:translate(-{max(3, amplitude - 2)}px,{max(2, amplitude // 3)}px) rotate(-{max(0.8, rotation * 0.8)}deg);}}
.feature-card:nth-child(3n), .widget-card:nth-child(3n), .testimonial-card:nth-child(3n){{transform:translate({max(2, amplitude // 2)}px,{max(3, amplitude // 2)}px) rotate({max(0.6, rotation * 0.5)}deg);}}
"""
        )

    if "layered-overlays" in surface_effects:
        blocks.append(
            """
/* layered overlays */
.hero::before,.features-section::before,.widgets-section::before{content:"";position:absolute;inset:auto 8% 12% auto;width:180px;height:180px;border-radius:999px;background:radial-gradient(circle,rgba(255,255,255,.22),transparent 70%);mix-blend-mode:screen;pointer-events:none;filter:blur(6px);opacity:.7;}
.hero,.features-section,.widgets-section{position:relative;overflow:hidden;}
"""
        )

    if "gradient-variance" in surface_effects:
        blocks.append(
            """
/* gradient variance */
.hero,.cta,.pricing-section{background-image:
linear-gradient(135deg, rgba(99,102,241,.08), transparent 42%),
linear-gradient(225deg, rgba(16,185,129,.08), transparent 38%),
linear-gradient(180deg, rgba(249,115,22,.06), transparent 100%);}
"""
        )

    if "offset-stack" in surface_effects:
        blocks.append(
            """
/* offset stack */
.hero-panel__card,.stat-card,.pricing-card{box-shadow:
12px 12px 0 rgba(17,24,39,.05),
0 18px 48px rgba(17,24,39,.12);}
"""
        )

    if motion_level != "none":
        duration_map = {"simple": "280ms", "medium": "540ms", "complex": "820ms"}
        translate_map = {"simple": "10px", "medium": "18px", "complex": "28px"}
        blocks.append(
            f"""
/* motion level: {motion_level} */
[data-motion-ready="0"] [data-slot]{{opacity:0;transform:translateY({translate_map.get(motion_level, "10px")});}}
[data-motion-ready="1"] [data-slot]{{opacity:1;transform:none;transition:opacity {duration_map.get(motion_level, "280ms")} ease, transform {duration_map.get(motion_level, "280ms")} cubic-bezier(.22,1,.36,1);}}
.btn,.feature-card,.widget-card,.stat-card,.testimonial-card{{transition:transform 220ms ease, box-shadow 220ms ease, filter 220ms ease;}}
.btn:hover,.feature-card:hover,.widget-card:hover,.stat-card:hover,.testimonial-card:hover{{transform:translateY(-2px);}}
"""
        )

    return "\n\n".join(blocks)


def _directive_js(design_directives: dict[str, Any]) -> str:
    snippets: list[str] = []
    motion_level = design_directives.get("motionLevel", "none")
    if motion_level != "none":
        stagger_map = {"simple": 45, "medium": 90, "complex": 140}
        snippets.append(
            f"""
document.body.setAttribute("data-motion-ready", "0");
window.addEventListener("load", function () {{
  var slots = document.querySelectorAll("[data-slot]");
  var step = {stagger_map.get(motion_level, 45)};
  slots.forEach(function (slot, index) {{
    window.setTimeout(function () {{
      document.body.setAttribute("data-motion-ready", "1");
      slot.style.transitionDelay = (index * step) + "ms";
    }}, index * step);
  }});
}});
"""
        )
    return "\n\n".join(snippets)


def _sanitize_inline_script(script: str) -> str:
    cleaned = script.replace("\ufeff", "").replace("\x00", "")
    return cleaned.replace("</script", "<\\/script")


def _validate_js_snippet(snippet: str) -> tuple[bool, str | None]:
    cache_key = hashlib.sha256(snippet.encode("utf-8")).hexdigest()
    cached = _JS_VALIDATION_CACHE.get(cache_key)
    if cached is not None:
        return cached

    node = shutil.which("node")
    if not node:
        result = (True, None)
        _JS_VALIDATION_CACHE[cache_key] = result
        return result

    temp_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as handle:
            temp_path = handle.name
            handle.write("(function(){\n")
            handle.write(snippet)
            handle.write("\n})();\n")
        proc = subprocess.run(
            [node, "--check", temp_path],
            capture_output=True,
            text=True,
            check=False,
        )
        if proc.returncode == 0:
            result = (True, None)
        else:
            reason = (proc.stderr or proc.stdout or "syntax error").strip().splitlines()[-1]
            result = (False, reason)
    except OSError:
        result = (True, None)
    finally:
        if temp_path:
            try:
                os.unlink(temp_path)
            except OSError:
                pass

    _JS_VALIDATION_CACHE[cache_key] = result
    return result
