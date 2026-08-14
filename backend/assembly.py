from __future__ import annotations

import html
from typing import Any

from .search_engine import mean_pairwise_cosine

BASE_RESET = """*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:var(--color-fg,#111);background:var(--color-bg,#fff)}
img{max-width:100%;display:block}
button{font:inherit;cursor:pointer}
:focus-visible{outline:2px solid var(--color-accent,#2563eb);outline-offset:2px}
.genesis-layout{min-height:100vh;display:flex;flex-direction:column}
.genesis-main{flex:1;width:100%;max-width:1200px;margin:0 auto;padding:24px}
.genesis-header{padding:16px 24px;border-bottom:1px solid rgba(0,0,0,.08)}
.genesis-footer{padding:16px 24px;border-top:1px solid rgba(0,0,0,.08);text-align:center;color:var(--color-muted,#666);font-size:.85rem}"""

DEFAULT_LAYOUT_HTML = """<div class="genesis-layout">
  <header class="genesis-header"><strong>{{title}}</strong></header>
  <main class="genesis-main">{{components}}</main>
  <footer class="genesis-footer">Assembled by Semantic UI Genesis Engine</footer>
</div>"""


def assemble(result: dict[str, Any], vectors: dict[str, list[float]], *, locked: list[str] | None = None, prefer_family: str | None = None) -> dict[str, Any]:
    locked_set = set(locked or [])
    selection = {
        "layout": _pick_locked(_by_category(result["hits"], "layouts"), locked_set) or _best(_by_category(result["hits"], "layouts")),
        "typography": [],
        "styles": [],
        "components": [],
        "interactions": [],
        "utilities": [],
        "locked": list(locked_set),
    }
    best_typography = _pick_locked(_by_category(result["hits"], "typography"), locked_set) or _best(_by_category(result["hits"], "typography"))
    if best_typography:
        selection["typography"] = [best_typography]
    selection["styles"] = _resolve_conflicts(_by_category(result["hits"], "styles"), locked_set, 4, prefer_family)
    selection["components"] = _resolve_conflicts(_by_category(result["hits"], "components"), locked_set, 6, prefer_family)
    selection["interactions"] = _resolve_conflicts(_by_category(result["hits"], "interactions"), locked_set, 3, prefer_family)
    selection["utilities"] = [hit for hit in _by_category(result["hits"], "utilities")[:4] if hit["score"] > 0.1 or hit["entry"]["id"] in locked_set]

    selected_hits = [
        selection["layout"],
        *selection["typography"],
        *selection["styles"],
        *selection["components"],
        *selection["interactions"],
        *selection["utilities"],
    ]
    selected_hits = [item for item in selected_hits if item]

    css = _render_css(selected_hits)
    js = _render_js([hit["entry"] for hit in selection["interactions"]])
    page_html = _render_html(selection)
    standalone = _render_standalone(css, page_html, js, selection)
    metrics = compute_metrics(selection, vectors)
    return {
        "assembly": {
            "html": page_html,
            "css": css,
            "js": js,
            "standalone": standalone,
            "tree": _build_tree(selection),
            "selection": selection,
        },
        "metrics": metrics,
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


def _render_css(selected: list[dict[str, Any]]) -> str:
    blocks = [BASE_RESET]
    root_vars = [hit["entry"]["css"] for hit in selected if hit["entry"].get("css") and ":root" in hit["entry"]["css"]]
    if root_vars:
        blocks.append("\n".join(root_vars))
    for hit in selected:
        css = hit["entry"].get("css")
        if css and ":root" not in css:
            blocks.append(f"/* {hit['entry']['id']} */\n{css}")
    responsive = _responsive_rules(selected)
    if responsive:
        blocks.append(responsive)
    return "\n\n".join(blocks)


def _responsive_rules(selected: list[dict[str, Any]]) -> str:
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
    chunks: list[str] = []
    if mobile:
        chunks.append("@media (max-width: 640px) {\n" + "\n".join(mobile) + "\n}")
    if tablet:
        chunks.append("@media (min-width: 641px) and (max-width: 1024px) {\n" + "\n".join(tablet) + "\n}")
    if desktop:
        chunks.append("@media (min-width: 1025px) {\n" + "\n".join(desktop) + "\n}")
    return "\n\n".join(chunks)


def _render_js(entries: list[dict[str, Any]]) -> str:
    snippets = [entry.get("js", "").strip() for entry in entries if entry.get("js")]
    return "\n\n".join(f"/* interaction {index + 1} */\n{snippet}" for index, snippet in enumerate(snippets))


def _render_html(selection: dict[str, Any]) -> str:
    layout = selection["layout"]["entry"] if selection["layout"] else None
    layout_html = layout.get("html") if layout else DEFAULT_LAYOUT_HTML
    components = "\n".join(
        hit["entry"].get("html") or f"<div class=\"{hit['entry']['payload']}\">{html.escape(hit['entry']['name'])}</div>"
        for hit in selection["components"]
    )
    title = selection["typography"][0]["entry"]["name"] if selection["typography"] else "Semantic UI Genesis"
    return (
        layout_html.replace("{{components}}", components or "<!-- no components -->")
        .replace("{{layoutClass}}", layout.get("payload", "genesis-layout") if layout else "genesis-layout")
        .replace("{{title}}", title)
    )


def _render_standalone(css: str, page_html: str, js: str, selection: dict[str, Any]) -> str:
    title = selection["typography"][0]["entry"]["name"] if selection["typography"] else "Semantic UI Genesis"
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
<body>
{page_html}
{f"<script>\\n{js}\\n</script>" if js else ""}
</body>
</html>"""
    if any(token in output.lower() for token in ('<link ', 'script src=', 'http://', 'https://')):
        raise RuntimeError("Export Standalone produced external references.")
    return output


def _build_tree(selection: dict[str, Any]) -> dict[str, Any]:
    def node(label: str, category: str, hit: dict[str, Any] | None = None) -> dict[str, Any]:
        return {
            "id": hit["entry"]["id"] if hit else f"{category}-{label}",
            "label": label,
            "category": category,
            "score": hit["score"] if hit else None,
            "locked": bool(hit and hit["entry"]["id"] in selection["locked"]),
        }

    return {
        "id": "page-root",
        "label": "Assembled Page",
        "category": "page",
        "children": [
            {
                **node("Layout", "layouts", selection["layout"]),
                "children": [node(hit["entry"]["name"], "components", hit) for hit in selection["components"]],
            },
            node("Typography", "typography", selection["typography"][0] if selection["typography"] else None),
            {
                "id": "styles-group",
                "label": "Styles",
                "category": "root",
                "children": [node(hit["entry"]["name"], "styles", hit) for hit in selection["styles"]],
            },
            {
                "id": "interactions-group",
                "label": "Interactions",
                "category": "root",
                "children": [node(hit["entry"]["name"], "interactions", hit) for hit in selection["interactions"]],
            },
            {
                "id": "utilities-group",
                "label": "Utilities",
                "category": "root",
                "children": [node(hit["entry"]["name"], "utilities", hit) for hit in selection["utilities"]],
            },
        ],
    }


def compute_metrics(selection: dict[str, Any], vectors: dict[str, list[float]]) -> dict[str, Any]:
    selected_hits = [
        selection["layout"],
        *selection["typography"],
        *selection["styles"],
        *selection["components"],
        *selection["interactions"],
        *selection["utilities"],
    ]
    selected_hits = [item for item in selected_hits if item]
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
    dom_estimate = 8 + len(selection["components"]) * 6 + len(selection["styles"]) * 2 + len(selection["utilities"]) + len(selection["interactions"]) * 3
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


def _clamp_pct(value: int) -> int:
    return max(0, min(100, value))

