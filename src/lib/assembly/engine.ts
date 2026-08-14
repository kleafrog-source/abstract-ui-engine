import type {
  AssembledPage,
  BuildTreeNode,
  LexiconEntry,
  LexiconCategory,
  QualityMetrics,
  SearchHit,
  SearchResult,
  AssemblySelection,
} from "../engine/types";
import { meanPairwiseCosine } from "../search/vector";

/**
 * Assembly Engine.
 *
 * Takes a raw search result and curates a coherent page:
 *  1. Selects exactly one layout, one typography, a few styles, components,
 *     interactions, utilities — preferring high-confidence + family cohesion.
 *  2. Resolves style conflicts (display, surface, elevation, border, text
 *     effects) so incompatible declarations don't stack.
 *  3. Emits responsive media queries derived from each entry's `responsive`.
 *  4. Builds a "Build Tree" visualizing the assembled page.
 *  5. Renders a standalone HTML document (inline CSS + vanilla JS).
 */

export interface AssembleOptions {
  locked?: string[]; // entry ids frozen by the user
  preferFamily?: string; // bias selection toward a family
}

export function assemble(
  result: SearchResult,
  vectors: Map<string, number[]>,
  opts: AssembleOptions = {},
): { assembly: AssembledPage; selection: AssemblySelection } {
  const locked = new Set(opts.locked ?? []);
  const byCat = groupByCategory(result.hits);

  const selection: AssemblySelection = {
    locked: Array.from(locked),
    components: [],
    styles: [],
    typography: [],
    interactions: [],
    utilities: [],
  };

  // Layout: pick the best locked layout, else best layout hit, else a default.
  selection.layout =
    pickLocked(byCategoryAll(result.hits, "layouts"), locked) ??
    bestOf(byCategoryAll(result.hits, "layouts")) ??
    undefined;

  // Typography: pick one.
  selection.typography = [
    pickLocked(byCategoryAll(result.hits, "typography"), locked) ??
      bestOf(byCategoryAll(result.hits, "typography")),
  ].filter(Boolean) as SearchHit[];

  // Styles: pick a few, resolving conflicts.
  selection.styles = resolveConflicts(
    byCategoryAll(result.hits, "styles"),
    locked,
    4,
    opts.preferFamily,
  );

  // Components: pick several, allow variety but cap.
  selection.components = resolveConflicts(
    byCategoryAll(result.hits, "components"),
    locked,
    6,
    opts.preferFamily,
  );

  // Interactions: pick a few.
  selection.interactions = resolveConflicts(
    byCategoryAll(result.hits, "interactions"),
    locked,
    3,
    opts.preferFamily,
  );

  // Utilities: pick a few (spacing/visibility/aria) — never conflicting.
  selection.utilities = byCategoryAll(result.hits, "utilities")
    .slice(0, 4)
    .filter((h) => locked.has(h.entry.id) || h.score > 0.1);

  // Ensure locked entries always appear somewhere even if below threshold.
  for (const id of locked) {
    const hit = result.hits.find((h) => h.entry.id === id);
    if (!hit) continue;
    const cat = hit.entry.category;
    const arr =
      cat === "layouts"
        ? null
        : cat === "typography"
          ? selection.typography
          : cat === "styles"
            ? selection.styles
            : cat === "components"
              ? selection.components
              : cat === "interactions"
                ? selection.interactions
                : selection.utilities;
    if (arr && !arr.some((h) => h.entry.id === id)) arr.unshift(hit);
  }

  const allSelected = [
    selection.layout,
    ...selection.typography,
    ...selection.styles,
    ...selection.components,
    ...selection.interactions,
    ...selection.utilities,
  ].filter(Boolean) as SearchHit[];

  const css = renderCSS(allSelected);
  const js = renderJS(selection.interactions.map((h) => h.entry));
  const html = renderHTML(selection);
  const tree = buildTree(selection);
  const standalone = renderStandalone(css, html, js, selection);

  return {
    assembly: { html, css, js, standalone, tree, selection },
    selection,
  };
}

/* --------------------------- selection helpers -------------------------- */

function groupByCategory(hits: SearchHit[]): Map<string, SearchHit[]> {
  const m = new Map<string, SearchHit[]>();
  for (const h of hits) {
    if (!m.has(h.entry.category)) m.set(h.entry.category, []);
    m.get(h.entry.category)!.push(h);
  }
  // each bucket already sorted by score from search.
  return m;
}

function byCategoryAll(
  hits: SearchHit[],
  cat: LexiconCategory,
): SearchHit[] {
  return hits.filter((h) => h.entry.category === cat);
}

function bestOf(hits: SearchHit[]): SearchHit | undefined {
  return hits[0];
}

function pickLocked(
  hits: SearchHit[],
  locked: Set<string>,
): SearchHit | undefined {
  return hits.find((h) => locked.has(h.entry.id));
}

/**
 * Conflict resolver: walks the (score-sorted) candidates and keeps an entry
 * unless it introduces a conflict key already claimed by a kept entry.
 * Locked entries are always kept (and claim their keys first).
 */
function resolveConflicts(
  hits: SearchHit[],
  locked: Set<string>,
  max: number,
  preferFamily?: string,
): SearchHit[] {
  const kept: SearchHit[] = [];
  const claimed = new Set<string>();

  // Locked first (they win conflicts).
  for (const h of hits) {
    if (locked.has(h.entry.id)) {
      kept.push(h);
      for (const c of h.entry.conflicts ?? []) claimed.add(c);
    }
  }

  // Then fill with best non-conflicting, family-biased.
  for (const h of hits) {
    if (kept.length >= max) break;
    if (locked.has(h.entry.id)) continue;
    const conflicts = h.entry.conflicts ?? [];
    if (conflicts.some((c) => claimed.has(c))) continue;
    kept.push(h);
    for (const c of conflicts) claimed.add(c);
  }

  // Family bias: if a preferred family exists and we have spare room, prefer
  // same-family entries (boosts semantic coherence).
  if (preferFamily && kept.length < max) {
    for (const h of hits) {
      if (kept.length >= max) break;
      if (kept.some((k) => k.entry.id === h.entry.id)) continue;
      if (h.entry.family !== preferFamily) continue;
      const conflicts = h.entry.conflicts ?? [];
      if (conflicts.some((c) => claimed.has(c))) continue;
      kept.push(h);
      for (const c of conflicts) claimed.add(c);
    }
  }

  return kept;
}

/* ------------------------------- rendering ------------------------------ */

function renderCSS(selected: SearchHit[]): string {
  const blocks: string[] = [];

  // 1. Root vars from styles with css payloads (palettes).
  const rootVars: string[] = [];
  for (const h of selected) {
    if (h.entry.css && /:root/.test(h.entry.css)) {
      rootVars.push(h.entry.css);
    }
  }
  if (rootVars.length) blocks.push(rootVars.join("\n"));

  // 2. General CSS payloads (non-root).
  for (const h of selected) {
    if (h.entry.css && !/:root/.test(h.entry.css)) {
      blocks.push(`/* ${h.entry.id} — ${h.entry.name} */\n${h.entry.css}`);
    }
  }

  // 3. Responsive media queries derived from each entry's `responsive`.
  const responsiveRules = collectResponsive(selected);
  if (responsiveRules) blocks.push(responsiveRules);

  // 4. Base reset + body styling so the standalone page looks right.
  blocks.unshift(BASE_RESET);

  return blocks.join("\n\n");
}

function collectResponsive(selected: SearchHit[]): string {
  const mobile: string[] = [];
  const tablet: string[] = [];
  const desktop: string[] = [];

  for (const h of selected) {
    const r = h.entry.responsive;
    if (!r) continue;
    if (r.mobile) mobile.push(`  ${r.mobile}`);
    if (r.tablet) tablet.push(`  ${r.tablet}`);
    if (r.desktop) desktop.push(`  ${r.desktop}`);
  }

  const parts: string[] = [];
  if (mobile.length)
    parts.push(`@media (max-width: 640px) {\n${mobile.join("\n")}\n}`);
  if (tablet.length)
    parts.push(
      `@media (min-width: 641px) and (max-width: 1024px) {\n${tablet.join("\n")}\n}`,
    );
  if (desktop.length)
    parts.push(`@media (min-width: 1025px) {\n${desktop.join("\n")}\n}`);
  return parts.join("\n\n");
}

function renderJS(entries: LexiconEntry[]): string {
  const snippets = entries
    .map((e) => e.js)
    .filter((s): s is string => !!s && s.trim().length > 0);
  if (!snippets.length) return "";
  return snippets
    .map((s, i) => `/* interaction ${i + 1} */\n${s}`)
    .join("\n\n");
}

function renderHTML(selection: AssemblySelection): string {
  const layout = selection.layout?.entry;
  const layoutClass = layout?.payload ?? "genesis-layout";
  const layoutHTML = layout?.html ?? DEFAULT_LAYOUT_HTML;

  const componentHTML = selection.components
    .map((h) => h.entry.html ?? `<div class="${h.entry.payload}">${h.entry.name}</div>`)
    .join("\n");

  // Merge component HTML into the layout's {{components}} slot if present.
  return layoutHTML
    .replace(/{{\s*components\s*}}/g, componentHTML || "<!-- no components -->")
    .replace(/{{\s*layoutClass\s*}}/g, layoutClass)
    .replace(
      /{{\s*title\s*}}/g,
      selection.typography[0]?.entry.name ?? "Semantic UI Genesis",
    );
}

function buildTree(selection: AssemblySelection): BuildTreeNode {
  const node = (
    label: string,
    category: BuildTreeNode["category"],
    hit?: SearchHit,
  ): BuildTreeNode => ({
    id: hit?.entry.id ?? `${category}-${label}`,
    label,
    category,
    score: hit?.score,
    locked: selection.locked.includes(hit?.entry.id ?? ""),
  });
  return {
    id: "page-root",
    label: "Assembled Page",
    category: "page",
    children: [
      {
        ...node("Layout", "layouts", selection.layout),
        children: selection.components.map((h) =>
          node(h.entry.name, "components", h),
        ),
      },
      {
        ...node("Typography", "typography", selection.typography[0]),
      },
      {
        label: "Styles",
        id: "styles-group",
        category: "root",
        children: selection.styles.map((h) =>
          node(h.entry.name, "styles", h),
        ),
      },
      {
        label: "Interactions",
        id: "interactions-group",
        category: "root",
        children: selection.interactions.map((h) =>
          node(h.entry.name, "interactions", h),
        ),
      },
      {
        label: "Utilities",
        id: "utilities-group",
        category: "root",
        children: selection.utilities.map((h) =>
          node(h.entry.name, "utilities", h),
        ),
      },
    ],
  };
}

function renderStandalone(
  css: string,
  html: string,
  js: string,
  selection: AssemblySelection,
): string {
  const title =
    selection.typography[0]?.entry.name ?? "Semantic UI Genesis — Exported Page";
  const fam = dominantFamily(selection);
  const meta = [
    "<meta charset=\"utf-8\" />",
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />",
    `<meta name="generator" content="Semantic UI Genesis Engine" />`,
    `<meta name="theme-family" content="${fam ?? "auto"}" />`,
    `<title>${escapeHtml(title)}</title>`,
  ].join("\n  ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${meta}
  <style>
${css}
  </style>
</head>
<body>
${html}
${js ? `<script>\n${js}\n</script>` : ""}
</body>
</html>`;
}

function dominantFamily(selection: AssemblySelection): string | undefined {
  const counts = new Map<string, number>();
  const all = [
    ...selection.styles,
    ...selection.components,
    ...selection.interactions,
    ...selection.utilities,
    ...(selection.layout ? [selection.layout] : []),
    ...selection.typography,
  ];
  for (const h of all) {
    if (h.entry.family) counts.set(h.entry.family, (counts.get(h.entry.family) ?? 0) + 1);
  }
  let best: string | undefined;
  let bestN = 0;
  for (const [f, n] of counts) {
    if (n > bestN) {
      best = f;
      bestN = n;
    }
  }
  return best;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const BASE_RESET = `*,*::before,*::after{box-sizing:border-box}
html{ -webkit-text-size-adjust:100%; }
body{ margin:0; font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif; line-height:1.6; color:var(--color-fg,#111); background:var(--color-bg,#fff); }
img{max-width:100%;display:block}
button{font:inherit;cursor:pointer}
:focus-visible{outline:2px solid var(--color-accent,#2563eb);outline-offset:2px}
.genesis-layout{min-height:100vh;display:flex;flex-direction:column}
.genesis-main{flex:1;width:100%;max-width:1200px;margin:0 auto;padding:24px}
.genesis-header{padding:16px 24px;border-bottom:1px solid rgba(0,0,0,.08)}
.genesis-footer{padding:16px 24px;border-top:1px solid rgba(0,0,0,.08);text-align:center;color:var(--color-muted,#666);font-size:.85rem}`;

const DEFAULT_LAYOUT_HTML = `<div class="genesis-layout">
  <header class="genesis-header">
    <strong>{{title}}</strong>
  </header>
  <main class="genesis-main">
    {{components}}
  </main>
  <footer class="genesis-footer">Assembled by Semantic UI Genesis Engine</footer>
</div>`;

/* ------------------------------ quality metrics ------------------------- */

export function computeMetrics(
  selection: AssemblySelection,
  vectors: Map<string, number[]>,
): QualityMetrics {
  const all = [
    selection.layout,
    ...selection.typography,
    ...selection.styles,
    ...selection.components,
    ...selection.interactions,
    ...selection.utilities,
  ].filter(Boolean) as SearchHit[];

  // Semantic coherence: mean pairwise cosine of selected vectors.
  const vecs = all
    .map((h) => vectors.get(h.entry.id))
    .filter((v): v is number[] => !!v);
  const pairwise = meanPairwiseCosine(vecs);
  // Family agreement bonus.
  const fams = all.map((h) => h.entry.family).filter(Boolean);
  const famAgreement =
    fams.length > 1
      ? 1 -
        new Set(fams).size / fams.length // 1 = all same family
      : 1;
  const semanticCoherence = clampPct(
    Math.round((pairwise * 0.6 + famAgreement * 0.4) * 100),
  );

  // Accessibility: contrast + aria coverage.
  const contrastVals: number[] = [];
  const contrastWarnings: string[] = [];
  for (const h of all) {
    const cr = h.entry.accessibility?.contrastRatio;
    if (typeof cr === "number") {
      contrastVals.push(cr);
      if (cr < 4.5)
        contrastWarnings.push(
          `${h.entry.name}: contrast ${cr}:1 below WCAG AA (4.5)`,
        );
    }
  }
  const meanContrast =
    contrastVals.length > 0
      ? contrastVals.reduce((a, b) => a + b, 0) / contrastVals.length
      : 7; // assume decent if unspecified
  const contrastScore = clampPct(Math.round((meanContrast / 7) * 100));

  const interactive = all.filter((h) =>
    ["components", "interactions"].includes(h.entry.category),
  );
  const withAria = interactive.filter(
    (h) => (h.entry.accessibility?.aria?.length ?? 0) > 0,
  );
  const ariaCoverage = interactive.length
    ? clampPct(Math.round((withAria.length / interactive.length) * 100))
    : 100;

  const focusCoverage = interactive.filter(
    (h) => h.entry.accessibility?.focusVisible,
  ).length;
  const focusScore = interactive.length
    ? clampPct(Math.round((focusCoverage / interactive.length) * 100))
    : 100;

  const accessibilityScore = clampPct(
    Math.round(contrastScore * 0.45 + ariaCoverage * 0.3 + focusScore * 0.25),
  );

  // Complexity: elements + nesting + media queries.
  const componentCount = selection.components.length;
  const styleCount = selection.styles.length;
  const utilityCount = selection.utilities.length;
  const interactionCount = selection.interactions.length;
  const mediaQueries = all.filter((h) => h.entry.responsive).length;
  const domNodeEstimate =
    8 + componentCount * 6 + styleCount * 2 + utilityCount + interactionCount * 3;
  const complexityIndex = clampPct(
    Math.round(
      Math.min(
        100,
        domNodeEstimate * 0.6 +
          mediaQueries * 6 +
          (styleCount + interactionCount) * 4,
      ),
    ),
  );

  return {
    semanticCoherence,
    accessibilityScore,
    complexityIndex,
    contrastWarnings,
    ariaCoverage,
    domNodeEstimate,
    mediaQueries,
    detail: {
      pairwiseCosine: Math.round(pairwise * 1000) / 1000,
      lockedCount: selection.locked.length,
      componentCount,
      styleCount,
      utilityCount,
    },
  };
}

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, v));
}
