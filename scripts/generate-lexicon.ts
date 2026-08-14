#!/usr/bin/env bun
/**
 * Lexicon generator for the Semantic UI Genesis Engine.
 * -------------------------------------------------------
 * Produces 6 JSON files under data/lexicon/ (layouts, components,
 * styles, typography, interactions, utilities) totaling 3500+ entries.
 *
 * Each entry conforms to the LexiconEntry interface in
 * src/lib/engine/types.ts. Descriptions are varied via templated
 * adjective pools so the BGE-M3 vector model can distinguish fine
 * visual nuances without seeing verbatim duplicates.
 *
 * Run:  cd /home/z/my-project && bun run scripts/generate-lexicon.ts
 */
import { promises as fs } from "fs";
import path from "path";

type Category =
  | "layouts"
  | "components"
  | "styles"
  | "typography"
  | "interactions"
  | "utilities";

interface LexiconEntry {
  id: string;
  category: Category;
  name: string;
  semantic_description: string;
  tags: string[];
  payload: string;
  css?: string;
  html?: string;
  js?: string;
  responsive?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    behavior?: string;
  };
  accessibility?: {
    contrastRatio?: number;
    aria?: string[];
    focusVisible?: boolean;
  };
  conflicts?: string[];
  family?: string;
  meta?: Record<string, string | number | boolean>;
}

interface LexiconFile {
  category: Category;
  version: string;
  count: number;
  entries: LexiconEntry[];
}

const OUT_DIR = path.resolve(process.cwd(), "data/lexicon");

/* ============================== pools ============================== */

const MOOD_POOL = [
  "calm", "confident", "playful", "elegant", "bold", "minimal", "warm",
  "cool", "crisp", "soft", "vibrant", "muted", "dreamy", "industrial",
  "futuristic", "nostalgic", "serene", "energetic",
];
const INTENSITY_POOL = [
  "subtle", "gentle", "moderate", "balanced", "pronounced", "strong",
  "intense", "dramatic", "extreme", "whispered",
];
const USE_CASE_POOL = [
  "dashboards", "marketing pages", "SaaS apps", "mobile-first sites",
  "e-commerce stores", "portfolios", "documentation portals", "admin panels",
  "creative agencies", "fintech products", "AI interfaces", "gaming portals",
  "editorial magazines", "education platforms", "developer tools",
];
const AESTHETIC_POOL = [
  "minimal-flat", "material", "glassmorphism", "neumorphism", "claymorphism",
  "brutalist", "neo-brutalist", "neon", "vintage", "aurora", "kineto",
  "bento", "magazine", "retro-futurism", "soft-ui",
];
const DIRECTION_POOL = [
  "top-left", "top-right", "bottom-left", "bottom-right", "center",
  "left", "right", "top", "bottom",
];

function pick<T>(arr: T[], i: number): T {
  return arr[((i % arr.length) + arr.length) % arr.length];
}
function pickN<T>(arr: T[], i: number, n: number): T[] {
  const out: T[] = [];
  for (let k = 0; k < n; k++) out.push(arr[(i + k * 7) % arr.length]);
  return out;
}
function pad(n: number, w = 4): string {
  return String(n).padStart(w, "0");
}

/* ============================== builders ============================== */

/* ----------------------------- LAYOUTS ----------------------------- */
function buildLayouts(): LexiconEntry[] {
  const out: LexiconEntry[] = [];
  let n = 0;
  const add = (e: Omit<LexiconEntry, "id" | "category">) => {
    n++;
    out.push({ id: `layouts.${pad(n)}`, category: "layouts", ...e });
  };

  // ===== CSS Grid variants =====
  const gridVariants: Array<{
    name: string; cols: number; gap: number; max: number; family: string;
    desc: string; tags: string[]; payload: string; css: string;
  }> = [
    { name: "12-Col Standard Grid", cols: 12, gap: 24, max: 1280, family: "minimal-flat",
      desc: "Twelve-column CSS grid with a 24px gutter and a 1280px max-width container, the foundational scaffold for marketing pages and admin dashboards. Even column rhythm supports predictable content blocks; pairs well with bento cards and minimal surfaces.",
      tags: ["grid","12-col","columns","responsive","scaffold"], payload: "grid grid-cols-12 gap-6 max-w-7xl mx-auto",
      css: ".l-12col { display:grid; grid-template-columns:repeat(12,minmax(0,1fr)); gap:24px; max-width:80rem; margin-inline:auto; }" },
    { name: "12-Col Wide Grid", cols: 12, gap: 32, max: 1440, family: "minimal-flat",
      desc: "Wide twelve-column grid with a generous 32px gutter and a 1440px container — confident, breathing layout for editorial magazines and large-format product showcases.",
      tags: ["grid","12-col","wide","gutter","responsive"], payload: "grid grid-cols-12 gap-8 max-w-screen-xl mx-auto",
      css: ".l-12col-wide { display:grid; grid-template-columns:repeat(12,minmax(0,1fr)); gap:32px; max-width:90rem; margin-inline:auto; }" },
    { name: "12-Col Compact Grid", cols: 12, gap: 16, max: 1152, family: "material",
      desc: "Dense twelve-column grid with a tight 16px gutter and a 1152px container, optimised for data-dense admin panels and BI dashboards where every pixel counts.",
      tags: ["grid","12-col","compact","dense","dashboard"], payload: "grid grid-cols-12 gap-4 max-w-6xl mx-auto",
      css: ".l-12col-compact { display:grid; grid-template-columns:repeat(12,minmax(0,1fr)); gap:16px; max-width:72rem; margin-inline:auto; }" },
    { name: "12-Col Airy Grid", cols: 12, gap: 48, max: 1536, family: "minimal-flat",
      desc: "Spacious twelve-column grid with a 48px gutter and a 1536px container — airy, premium layout for luxury brand sites and high-end portfolios that prize whitespace.",
      tags: ["grid","12-col","airy","spacious","whitespace"], payload: "grid grid-cols-12 gap-12 max-w-screen-2xl mx-auto",
      css: ".l-12col-airy { display:grid; grid-template-columns:repeat(12,minmax(0,1fr)); gap:48px; max-width:96rem; margin-inline:auto; }" },
    { name: "Auto-Fit Minmax Grid", cols: 0, gap: 24, max: 1280, family: "bento",
      desc: "Responsive auto-fit grid using minmax(280px, 1fr) — cells flow and rewrap fluidly as the viewport changes, perfect for card walls and galleries without media queries.",
      tags: ["grid","auto-fit","minmax","fluid","responsive"], payload: "grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]",
      css: ".l-autofit { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:24px; }" },
    { name: "Auto-Fill Minmax Grid", cols: 0, gap: 20, max: 1280, family: "bento",
      desc: "Auto-fill variant of the minmax grid that reserves empty columns to keep alignment strict — useful for product grids where horizontal slot integrity matters.",
      tags: ["grid","auto-fill","minmax","fluid","alignment"], payload: "grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]",
      css: ".l-autofill { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:20px; }" },
    { name: "Subgrid Aligned Grid", cols: 12, gap: 24, max: 1280, family: "bento",
      desc: "CSS subgrid layout where children align to the parent's tracks — produces pixel-perfect card grids with synchronised headers and footers across rows. Modern 2025 pattern.",
      tags: ["grid","subgrid","aligned","modern","tracks"], payload: "grid grid-cols-12 gap-6 [grid-template-rows:subgrid]",
      css: ".l-subgrid { display:grid; grid-template-columns:repeat(12,minmax(0,1fr)); gap:24px; } .l-subgrid > * { display:grid; grid-template-rows:subgrid; grid-row:span 3; }" },
    { name: "Asymmetric Editorial Grid", cols: 12, gap: 32, max: 1440, family: "magazine",
      desc: "Asymmetric twelve-column grid with offset spans (8+4, 5+7, 7+5) creating visual tension typical of editorial magazines and award-winning agency sites.",
      tags: ["grid","asymmetric","editorial","magazine","tension"], payload: "grid grid-cols-12 gap-8",
      css: ".l-asym { display:grid; grid-template-columns:repeat(12,minmax(0,1fr)); gap:32px; }" },
    { name: "6-Col Mobile Grid", cols: 6, gap: 16, max: 480, family: "minimal-flat",
      desc: "Six-column grid tuned for mobile-first layouts with a 16px gutter — comfortable touch spacing and thumb-reachable content blocks.",
      tags: ["grid","6-col","mobile","touch"], payload: "grid grid-cols-6 gap-4",
      css: ".l-6col { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:16px; }" },
    { name: "8-Col Tablet Grid", cols: 8, gap: 24, max: 1024, family: "minimal-flat",
      desc: "Eight-column grid for tablet and small-laptop layouts with a 24px gutter — bridges mobile stacking and desktop density gracefully.",
      tags: ["grid","8-col","tablet","intermediate"], payload: "grid grid-cols-8 gap-6",
      css: ".l-8col { display:grid; grid-template-columns:repeat(8,minmax(0,1fr)); gap:24px; }" },
    { name: "16-Col Micro Grid", cols: 16, gap: 8, max: 1280, family: "brutalist",
      desc: "Sixteen-column micro grid with an 8px gutter enabling granular micro-alignments — favoured by brutalist and Swiss-design inspired interfaces.",
      tags: ["grid","16-col","micro","granular","brutalist"], payload: "grid grid-cols-16 gap-2",
      css: ".l-16col { display:grid; grid-template-columns:repeat(16,minmax(0,1fr)); gap:8px; }" },
    { name: "Container Query Grid", cols: 12, gap: 24, max: 1280, family: "minimal-flat",
      desc: "Container-query-driven grid that rewraps based on the parent container width rather than the viewport — essential for embeddable widgets and design-system components.",
      tags: ["grid","container-query","cqw","embeddable"], payload: "grid gap-6 @container",
      css: ".l-cq { display:grid; grid-template-columns:repeat(12,minmax(0,1fr)); gap:24px; container-type:inline-size; }" },
  ];
  for (const g of gridVariants) {
    add({
      name: g.name,
      semantic_description: g.desc,
      tags: g.tags,
      payload: g.payload,
      css: g.css,
      html: `<div class="${g.css.split(" ")[0].slice(1)}"><div>cell</div></div>`,
      responsive: { mobile: "grid-cols-1", tablet: g.cols >= 8 ? "grid-cols-6" : "grid-cols-2", desktop: g.cols > 0 ? `grid-cols-${g.cols}` : "auto", behavior: "stack" },
      conflicts: ["display:grid", `layout:${g.name.split(" ")[0].toLowerCase()}`],
      family: g.family,
      meta: { columns: g.cols, gap: g.gap, maxWidth: g.max },
    });
  }

  // ===== Flexbox =====
  const flexVariants: Array<{ name: string; dir: string; just: string; align: string; desc: string; tags: string[]; payload: string; css: string }> = [
    { name: "Flex Row Centered", dir: "row", just: "center", align: "center",
      desc: "Horizontally and vertically centered flex row — the workhorse for hero CTAs, modal actions, and badge clusters. Balanced, calm, predictable.",
      tags: ["flex","row","center","align","justify"], payload: "flex flex-row items-center justify-center",
      css: ".l-flex-center { display:flex; flex-direction:row; align-items:center; justify-content:center; }" },
    { name: "Flex Column Centered", dir: "column", just: "center", align: "center",
      desc: "Vertically stacked flex column with centered alignment — clean stack pattern for mobile hero sections, empty states, and centered form panels.",
      tags: ["flex","column","stack","center"], payload: "flex flex-col items-center justify-center",
      css: ".l-flex-col-center { display:flex; flex-direction:column; align-items:center; justify-content:center; }" },
    { name: "Flex Space-Between", dir: "row", just: "between", align: "center",
      desc: "Flex row distributing children to opposite edges with space-between — classic navbar pattern for logo-left, actions-right layouts.",
      tags: ["flex","row","space-between","navbar"], payload: "flex flex-row items-center justify-between",
      css: ".l-flex-between { display:flex; flex-direction:row; align-items:center; justify-content:space-between; }" },
    { name: "Flex Space-Evenly", dir: "row", just: "evenly", align: "center",
      desc: "Flex row with space-evenly distribution — balanced, symmetric spacing between action buttons in toolbars and command bars.",
      tags: ["flex","row","space-evenly","toolbar"], payload: "flex flex-row items-center justify-evenly",
      css: ".l-flex-evenly { display:flex; flex-direction:row; align-items:center; justify-content:space-evenly; }" },
    { name: "Flex Wrap Row", dir: "row", just: "start", align: "start",
      desc: "Wrapping flex row — children reflow onto new lines as needed, perfect for tag clouds, chip groups, and filter bars.",
      tags: ["flex","row","wrap","reflow","chips"], payload: "flex flex-row flex-wrap items-start justify-start gap-2",
      css: ".l-flex-wrap { display:flex; flex-direction:row; flex-wrap:wrap; align-items:flex-start; justify-content:flex-start; gap:8px; }" },
    { name: "Flex Column Stretch", dir: "column", just: "start", align: "stretch",
      desc: "Stretch-aligned flex column forcing children to fill the cross-axis — ideal for sidebar menus and stacked card sections needing equal widths.",
      tags: ["flex","column","stretch","sidebar"], payload: "flex flex-col items-stretch justify-start",
      css: ".l-flex-stretch { display:flex; flex-direction:column; align-items:stretch; justify-content:flex-start; }" },
    { name: "Flex Row Baseline", dir: "row", just: "start", align: "baseline",
      desc: "Baseline-aligned flex row — text-optimal alignment for inline form fields and stat-with-label groupings where typographic rhythm matters.",
      tags: ["flex","row","baseline","text"], payload: "flex flex-row items-baseline justify-start gap-2",
      css: ".l-flex-baseline { display:flex; flex-direction:row; align-items:baseline; justify-content:flex-start; gap:8px; }" },
    { name: "Flex Reverse Row", dir: "row-reverse", just: "between", align: "center",
      desc: "Reversed flex row — children render right-to-left, useful for RTL languages and back/next action pairs where the primary action sits on the right.",
      tags: ["flex","row-reverse","rtl","actions"], payload: "flex flex-row-reverse items-center justify-between",
      css: ".l-flex-reverse { display:flex; flex-direction:row-reverse; align-items:center; justify-content:space-between; }" },
    { name: "Flex Gap Auto Margins", dir: "row", just: "start", align: "center",
      desc: "Flex row using auto-margins (ml-auto) to push a trailing element to the far right — vintage CSS trick for simple action bars without justify-between edge cases.",
      tags: ["flex","auto-margin","push-right"], payload: "flex flex-row items-center",
      css: ".l-flex-auto { display:flex; flex-direction:row; align-items:center; } .l-flex-auto > .push { margin-left:auto; }" },
    { name: "Flex Centered Column Hero", dir: "column", just: "center", align: "center",
      desc: "Tall, full-height flex column centered both axes — the canonical hero section layout for landing pages with headline, subhead, and CTA stack.",
      tags: ["flex","column","hero","center","full-height"], payload: "flex flex-col items-center justify-center min-h-screen",
      css: ".l-flex-hero { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; }" },
  ];
  for (const f of flexVariants) {
    add({
      name: f.name,
      semantic_description: f.desc,
      tags: f.tags,
      payload: f.payload,
      css: f.css,
      html: `<div class="${f.css.split(" ")[0].slice(1)}"><span>item</span><span>item</span></div>`,
      responsive: { mobile: "flex-col", tablet: f.dir.startsWith("row") ? "flex-row" : "flex-col", desktop: f.dir, behavior: "stack" },
      conflicts: ["display:flex", `layout:flex-${f.dir}`],
      family: "minimal-flat",
      meta: { direction: f.dir, justify: f.just, align: f.align },
    });
  }

  // ===== Bento grids (mixed cell sizes) =====
  const bentoPatterns: Array<{ name: string; spans: string; desc: string; gap: number }> = [
    { name: "Bento Hero 2x2 + Tiles", spans: "hero-cell col-span-2 row-span-2", desc: "Bento grid featuring a dominant 2×2 hero cell surrounded by smaller uniform square tiles — modern 2025 product page aesthetic popularised by Apple and Linear.",
      gap: 16 },
    { name: "Bento Asymmetric L", spans: "tall col-span-1 row-span-2", desc: "Bento grid with an L-shaped asymmetric arrangement — one tall vertical card anchoring the left column while smaller cells fill the right, creating editorial rhythm.",
      gap: 20 },
    { name: "Bento Diamond", spans: "center col-span-2 row-span-2 offset", desc: "Diamond-shaped bento grid with a central 2×2 cell rotated by surrounding offset tiles — playful, magazine-like composition.",
      gap: 24 },
    { name: "Bento Staircase", spans: "stair-1 col-span-2 stair-2 col-span-2 stair-3 col-span-2", desc: "Staircase bento grid where tiles step down diagonally — dynamic, kinetic feel suited for portfolio and creative agency sites.",
      gap: 18 },
    { name: "Bento Sidebar Hero", spans: "sidebar col-span-1 row-span-3 main col-span-3", desc: "Bento with a thin persistent sidebar cell and a wide main feature cell — dashboard shell aesthetic that combines navigation with a hero metric.",
      gap: 16 },
    { name: "Bento Mosaic", spans: "varied col-span-1 col-span-2 col-span-3", desc: "Mosaic bento grid mixing 1, 2, and 3-column spans freely — rich, dense composition for media galleries and product showcases.",
      gap: 12 },
    { name: "Bento Equal 4-Quad", spans: "quad col-span-2 row-span-2", desc: "Four equal 2×2 quadrants — balanced, symmetrical bento for feature comparison grids and pricing tiers.",
      gap: 20 },
    { name: "Bento Featured Triple", spans: "feature col-span-3 row-span-2 small col-span-1", desc: "Bento with one wide featured cell spanning three columns and two rows, flanked by three small tiles — classic SaaS landing pattern.",
      gap: 16 },
    { name: "Bento T-Shape", spans: "top col-span-4 bottom col-span-2", desc: "T-shaped bento grid — one wide top cell with two equal cells beneath, suggesting a header plus dual content columns.",
      gap: 18 },
    { name: "Bento Step Pyramid", spans: "pyramid col-span-4 col-span-3 col-span-2 col-span-1", desc: "Step-pyramid bento with progressively narrower cells — a bold, sculptural composition for hero showcases.",
      gap: 14 },
    { name: "Bento Split Hero", spans: "left col-span-2 row-span-2 right col-span-2", desc: "Split-screen bento with two equal 2×2 halves — perfectly balanced hero for product pairs and dual-CTA landings.",
      gap: 20 },
    { name: "Bento Inverted L", spans: "wide col-span-3 tall col-span-1 row-span-2", desc: "Inverted-L bento: one wide horizontal cell atop a tall vertical cell — architectural feel for editorial features.",
      gap: 16 },
    { name: "Bento Pinwheel", spans: "center col-span-2 row-span-2 surround", desc: "Pinwheel bento with a central anchor cell and four rotating satellite tiles — playful, rotational symmetry.",
      gap: 18 },
    { name: "Bento Half Hero", spans: "hero col-span-2 row-span-2 stack col-span-2", desc: "Half-hero bento: a 2×2 hero on the left with a vertical stack of two tiles on the right — strong, asymmetric SaaS landing pattern.",
      gap: 16 },
    { name: "Bento Dense Dashboard", spans: "metric col-span-1 chart col-span-2 table col-span-3", desc: "Dense dashboard bento combining small metric tiles, a medium chart cell, and a wide table cell — operational BI aesthetic.",
      gap: 12 },
  ];
  for (const b of bentoPatterns) {
    add({
      name: b.name,
      semantic_description: b.desc + ` Gap of ${b.gap}px keeps tiles cohesive without crowding.`,
      tags: ["bento","grid","mixed-cells","modern","2025"],
      payload: `grid grid-cols-4 gap-[${b.gap}px] auto-rows-[120px]`,
      css: `.l-bento-${pad(bentoPatterns.indexOf(b)+1)} { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:${b.gap}px; grid-auto-rows:120px; }`,
      html: `<div class="l-bento-${pad(bentoPatterns.indexOf(b)+1)}"><div style="grid-column:span 2; grid-row:span 2">hero</div><div>tile</div><div>tile</div></div>`,
      responsive: { mobile: "grid-cols-1", tablet: "grid-cols-2", desktop: "grid-cols-4", behavior: "stack" },
      conflicts: ["display:grid", "layout:bento"],
      family: "bento",
      meta: { gap: b.gap, cells: b.spans },
    });
  }

  // ===== Masonry =====
  const masonryVariants = [
    { name: "CSS Columns Masonry", gap: 16, cols: 3, desc: "Pinterest-style masonry layout using CSS multi-column with a 16px column-gap — content flows top-to-bottom then wraps. Classic gallery pattern." },
    { name: "Masonry Dense Pack", gap: 12, cols: 4, desc: "Dense four-column masonry with tight 12px gap — gallery-grade packing that minimises whitespace, ideal for image-heavy portfolios." },
    { name: "Masonry Airy Cards", gap: 24, cols: 3, desc: "Airy three-column masonry with a 24px gap — soft, breathing layout for testimonial walls and quote collections." },
    { name: "Masonry Mobile Single", gap: 12, cols: 1, desc: "Single-column masonry for mobile — vertical stack with consistent gap, optimised for thumb scrolling." },
    { name: "Masonry Wide Five", gap: 20, cols: 5, desc: "Wide five-column masonry with a 20px gap — high-density gallery for stock photo sites and lookbooks." },
    { name: "Grid Masonry Hybrid", gap: 16, cols: 4, desc: "Hybrid layout using CSS grid with masonry experimental feature — modern browsers only, degrades gracefully to grid." },
    { name: "Masonry Two-Col Blog", gap: 24, cols: 2, desc: "Two-column masonry with generous 24px gap for editorial blog rolls — alternates short and long posts naturally." },
    { name: "Masonry Asymmetric Three", gap: 18, cols: 3, desc: "Three-column asymmetric masonry where column widths differ slightly (1fr 1.2fr 0.8fr) — organic, magazine-like rhythm." },
  ];
  for (const m of masonryVariants) {
    add({
      name: m.name,
      semantic_description: m.desc,
      tags: ["masonry","columns","pinterest","gallery","flow"],
      payload: `columns-${m.cols} gap-[${m.gap}px]`,
      css: `.l-masonry-${masonryVariants.indexOf(m)+1} { column-count:${m.cols}; column-gap:${m.gap}px; } .l-masonry-${masonryVariants.indexOf(m)+1} > * { break-inside:avoid; margin-bottom:${m.gap}px; }`,
      html: `<div class="l-masonry-${masonryVariants.indexOf(m)+1}"><div>card</div><div>card</div></div>`,
      responsive: { mobile: "columns-1", tablet: "columns-2", desktop: `columns-${m.cols}`, behavior: "reflow" },
      conflicts: ["display:block", "layout:masonry"],
      family: "magazine",
      meta: { columns: m.cols, gap: m.gap },
    });
  }

  // ===== Holy Grail + page shells =====
  const pageShells = [
    { name: "Holy Grail Layout", desc: "Classic Holy Grail layout — header on top, footer on bottom, with a centered main column flanked by left nav and right aside. The semantic, accessible foundation for content sites.",
      payload: "grid grid-rows-[auto_1fr_auto] grid-cols-[200px_1fr_200px]",
      css: ".l-holy { display:grid; grid-template-rows:auto 1fr auto; grid-template-columns:200px 1fr 200px; min-height:100vh; }" },
    { name: "Sticky Header + Footer Shell", desc: "App shell with a sticky top header, scrollable main content, and a sticky bottom footer — keeps branding and actions always visible.",
      payload: "grid grid-rows-[auto_1fr_auto] min-h-screen",
      css: ".l-shell-sticky { display:grid; grid-template-rows:auto 1fr auto; min-height:100vh; } .l-shell-sticky > header, .l-shell-sticky > footer { position:sticky; }" },
    { name: "Sidebar + Topbar Shell", desc: "Dashboard shell with a fixed left sidebar and a top action bar — the canonical SaaS admin pattern with persistent navigation.",
      payload: "grid grid-cols-[260px_1fr] grid-rows-[64px_1fr]",
      css: ".l-shell-dashboard { display:grid; grid-template-columns:260px 1fr; grid-template-rows:64px 1fr; min-height:100vh; }" },
    { name: "App Shell with Off-canvas Drawer", desc: "Mobile-first app shell with an off-canvas drawer that slides in on demand — preserves screen real estate on phones while exposing full nav on demand.",
      payload: "grid grid-rows-[56px_1fr] min-h-screen",
      css: ".l-shell-offcanvas { display:grid; grid-template-rows:56px 1fr; min-height:100vh; }" },
    { name: "Split Pane Shell", desc: "Two-pane split shell for editor-style apps (code editors, email clients) — left list pane, right detail pane, with an adjustable divider.",
      payload: "grid grid-cols-[minmax(280px,30%)_1fr]",
      css: ".l-shell-split { display:grid; grid-template-columns:minmax(280px,30%) 1fr; min-height:100vh; }" },
    { name: "Three Pane Master-Detail", desc: "Three-pane master-detail shell — narrow nav, medium list, wide detail — for productivity apps like Notion and Linear.",
      payload: "grid grid-cols-[220px_320px_1fr]",
      css: ".l-shell-three { display:grid; grid-template-columns:220px 320px 1fr; min-height:100vh; }" },
    { name: "Modal Overlay Shell", desc: "Single-pane shell with overlay modal layer — minimal chrome that focuses on content; modals render above an inertial backdrop.",
      payload: "grid grid-rows-[1fr] min-h-screen",
      css: ".l-shell-modal { display:grid; grid-template-rows:1fr; min-height:100vh; }" },
    { name: "Floating Header Shell", desc: "Floating-header shell where the header hovers above content with a glass blur effect — modern, premium feel for creative portfolios.",
      payload: "grid grid-rows-[80px_1fr] min-h-screen",
      css: ".l-shell-float { display:grid; grid-template-rows:80px 1fr; min-height:100vh; }" },
  ];
  for (const s of pageShells) {
    add({
      name: s.name,
      semantic_description: s.desc,
      tags: ["shell","page","layout","app","structure"],
      payload: s.payload,
      css: s.css,
      html: `<div class="${s.css.split(" ")[0].slice(1)}"><header>header</header><main>main</main><footer>footer</footer></div>`,
      responsive: { mobile: "grid-cols-1", tablet: "grid-cols-[1fr]", desktop: s.payload, behavior: "collapse" },
      conflicts: ["display:grid", "layout:shell"],
      family: "minimal-flat",
      meta: { type: "shell" },
    });
  }

  // ===== Sticky headers / footers =====
  const stickyVariants = [
    { name: "Sticky Top Header 64px", desc: "Sticky 64px top header that remains pinned on scroll — standard navigation pattern that keeps primary actions accessible. Subtle shadow on scroll for depth.",
      payload: "sticky top-0 h-16 z-30", css: ".l-sticky-top { position:sticky; top:0; height:64px; z-index:30; }" },
    { name: "Sticky Glass Header", desc: "Sticky header with a backdrop-blur glass effect — content scrolls beneath a frosted translucent bar, premium and modern.",
      payload: "sticky top-0 z-30 backdrop-blur-md bg-white/60", css: ".l-sticky-glass { position:sticky; top:0; z-index:30; backdrop-filter:blur(12px); background:rgba(255,255,255,0.6); }" },
    { name: "Sticky Bottom Footer", desc: "Sticky bottom footer that pins to the viewport bottom — useful for cookie banners and persistent CTAs without covering content.",
      payload: "sticky bottom-0 z-20", css: ".l-sticky-bottom { position:sticky; bottom:0; z-index:20; }" },
    { name: "Sticky Sidebar Nav", desc: "Sticky left sidebar that stays in view during vertical scroll — pattern for documentation sites with long-form content.",
      payload: "sticky top-16 h-[calc(100vh-4rem)]", css: ".l-sticky-side { position:sticky; top:64px; height:calc(100vh - 4rem); }" },
    { name: "Sticky Table Header", desc: "Sticky table header row that remains visible while the body scrolls — critical for long data tables in admin panels.",
      payload: "sticky top-0 z-10", css: ".l-sticky-thead { position:sticky; top:0; z-index:10; }" },
    { name: "Sticky Floating Action", desc: "Sticky floating action button pinned to the bottom-right corner — material design pattern for primary mobile actions.",
      payload: "fixed bottom-6 right-6 z-40", css: ".l-sticky-fab { position:fixed; bottom:24px; right:24px; z-index:40; }" },
    { name: "Sticky Reading Progress", desc: "Sticky top reading-progress bar that fills as the user scrolls — subtle engagement indicator for long articles.",
      payload: "sticky top-0 h-1 z-50", css: ".l-sticky-progress { position:sticky; top:0; height:4px; z-index:50; }" },
    { name: "Sticky Contextual Toolbar", desc: "Sticky toolbar appearing on selection or scroll position — appears contextually, disappears otherwise; pattern from Medium and Notion.",
      payload: "sticky top-20 z-30", css: ".l-sticky-toolbar { position:sticky; top:80px; z-index:30; }" },
  ];
  for (const s of stickyVariants) {
    add({
      name: s.name,
      semantic_description: s.desc,
      tags: ["sticky","position","header","footer","persistent"],
      payload: s.payload,
      css: s.css,
      conflicts: ["position:sticky", "layout:sticky"],
      family: "minimal-flat",
      meta: { kind: "sticky" },
    });
  }

  // ===== Sidebars =====
  const sidebarVariants = [
    { name: "Fixed Left Sidebar 240px", desc: "Fixed 240px left sidebar that doesn't scroll with content — persistent navigation for dashboards. Calm, structural, predictable.",
      payload: "fixed left-0 top-0 w-60 h-screen", css: ".l-sidebar-fixed { position:fixed; left:0; top:0; width:240px; height:100vh; }" },
    { name: "Collapsible Sidebar", desc: "Collapsible sidebar that expands/collapses via a toggle — saves horizontal space on smaller screens while preserving full nav on demand.",
      payload: "w-16 hover:w-60 transition-all", css: ".l-sidebar-collapse { width:64px; transition:width .25s ease; } .l-sidebar-collapse:hover { width:240px; }" },
    { name: "Off-canvas Drawer", desc: "Off-canvas drawer that slides in from the left edge — typically hidden on mobile, revealed via hamburger. Maximises content width.",
      payload: "fixed -translate-x-full open:translate-x-0 transition-transform", css: ".l-sidebar-offcanvas { position:fixed; transform:translateX(-100%); transition:transform .3s ease; } .l-sidebar-offcanvas.open { transform:translateX(0); }" },
    { name: "Right Detail Drawer", desc: "Right-side detail drawer that slides in for contextual information — pattern for inspecting a row's details without leaving the list view.",
      payload: "fixed right-0 top-0 h-screen w-96 translate-x-full open:translate-x-0", css: ".l-sidebar-right { position:fixed; right:0; top:0; height:100vh; width:384px; transform:translateX(100%); transition:transform .3s ease; } .l-sidebar-right.open { transform:translateX(0); }" },
    { name: "Floating Pill Sidebar", desc: "Floating pill-shaped sidebar with rounded corners and margin from edges — soft, modern alternative to flush sidebars.",
      payload: "fixed left-4 top-4 bottom-4 w-52 rounded-2xl", css: ".l-sidebar-pill { position:fixed; left:16px; top:16px; bottom:16px; width:208px; border-radius:16px; }" },
    { name: "Icon-Rail Sidebar 72px", desc: "Narrow 72px icon-rail sidebar showing only icons — extreme space-saving pattern for power-user tools and IDE-like interfaces.",
      payload: "fixed left-0 top-0 w-[72px] h-screen", css: ".l-sidebar-rail { position:fixed; left:0; top:0; width:72px; height:100vh; }" },
    { name: "Dual Sidebar Layout", desc: "Dual sidebar layout with a narrow icon rail plus a wider context panel — used by Figma and Linear for layered navigation.",
      payload: "grid grid-cols-[72px_240px_1fr]", css: ".l-sidebar-dual { display:grid; grid-template-columns:72px 240px 1fr; }" },
    { name: "Sticky Scroll Sidebar", desc: "Sidebar that scrolls independently of main content with its own scroll container — preserves nav position within long doc trees.",
      payload: "sticky top-0 h-screen overflow-y-auto", css: ".l-sidebar-scroll { position:sticky; top:0; height:100vh; overflow-y:auto; }" },
  ];
  for (const s of sidebarVariants) {
    add({
      name: s.name,
      semantic_description: s.desc,
      tags: ["sidebar","navigation","drawer","off-canvas"],
      payload: s.payload,
      css: s.css,
      responsive: { mobile: "off-canvas", tablet: "collapsible", desktop: "fixed", behavior: "collapse" },
      conflicts: ["layout:sidebar"],
      family: "minimal-flat",
      meta: { kind: "sidebar" },
    });
  }

  // ===== Hero layouts =====
  const heroVariants = [
    { name: "Centered Hero Stack", desc: "Centered hero section with stacked headline, subhead, CTA pair, and optional background gradient — confident, balanced landing page hero.",
      payload: "flex flex-col items-center justify-center text-center gap-6 py-24", css: ".l-hero-center { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:24px; padding:96px 0; }" },
    { name: "Split-Screen Hero", desc: "Split-screen hero with text on the left half and a visual on the right — strong asymmetric balance for product landings and editorial features.",
      payload: "grid grid-cols-2 min-h-[80vh]", css: ".l-hero-split { display:grid; grid-template-columns:1fr 1fr; min-height:80vh; }" },
    { name: "Asymmetric Hero 60/40", desc: "Asymmetric hero with a 60% content column and 40% visual — weighted composition that prioritises copy while still showing product.",
      payload: "grid grid-cols-[3fr_2fr] min-h-[80vh]", css: ".l-hero-asym { display:grid; grid-template-columns:3fr 2fr; min-height:80vh; }" },
    { name: "Video Background Hero", desc: "Full-bleed video background hero with overlaid centered text and CTAs — cinematic, immersive landing pattern for premium brands.",
      payload: "relative min-h-screen flex items-center justify-center", css: ".l-hero-video { position:relative; min-height:100vh; display:flex; align-items:center; justify-content:center; }" },
    { name: "Parallax Scrolling Hero", desc: "Parallax hero with multiple depth layers moving at different speeds — kinetic, storytelling-first hero for portfolios and creative agencies.",
      payload: "relative h-screen overflow-hidden", css: ".l-hero-parallax { position:relative; height:100vh; overflow:hidden; }" },
    { name: "Floating Cards Hero", desc: "Hero with floating UI card mockups arranged around the headline — playful, product-led hero pattern popular in 2025 SaaS landings.",
      payload: "relative grid place-items-center min-h-[80vh]", css: ".l-hero-float { position:relative; display:grid; place-items:center; min-height:80vh; }" },
    { name: "Editorial Magazine Hero", desc: "Editorial magazine hero with oversized display type left-aligned and a caption column on the right — print-inspired, sophisticated.",
      payload: "grid grid-cols-[1fr_320px] gap-8", css: ".l-hero-magazine { display:grid; grid-template-columns:1fr 320px; gap:32px; }" },
    { name: "Bento Hero with Stats", desc: "Hero combining headline area with embedded bento stat tiles — turns the hero itself into a dashboard preview, data-driven SaaS pattern.",
      payload: "grid grid-cols-3 gap-4", css: ".l-hero-bento { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }" },
    { name: "Full-Bleed Image Hero", desc: "Full-bleed image hero with text overlaid in a corner — photographic, immersive, mood-setting pattern for fashion and travel.",
      payload: "relative h-[90vh] bg-cover bg-center", css: ".l-hero-image { position:relative; height:90vh; background-size:cover; background-position:center; }" },
    { name: "Minimal Text Hero", desc: "Minimal text-only hero with a single line of large display type centered on a solid color — brutalist-meets-minimalist pattern for bold statements.",
      payload: "grid place-items-center min-h-[60vh]", css: ".l-hero-minimal { display:grid; place-items:center; min-height:60vh; }" },
  ];
  for (const h of heroVariants) {
    add({
      name: h.name,
      semantic_description: h.desc,
      tags: ["hero","landing","above-fold","showcase"],
      payload: h.payload,
      css: h.css,
      responsive: { mobile: "flex-col text-center", tablet: h.payload, desktop: h.payload, behavior: "stack" },
      conflicts: ["layout:hero"],
      family: "minimal-flat",
      meta: { kind: "hero" },
    });
  }

  // ===== Magazine / editorial =====
  const magazineVariants = [
    { name: "Magazine Featured + List", desc: "Magazine layout with one large featured article on the left and a vertical list of three smaller items on the right — classic editorial homepage pattern.",
      payload: "grid grid-cols-[2fr_1fr] gap-8", css: ".l-mag-1 { display:grid; grid-template-columns:2fr 1fr; gap:32px; }" },
    { name: "Magazine Three-Up", desc: "Three-up magazine grid with equal-weight articles and shared typography rhythm — clean, balanced editorial section.",
      payload: "grid grid-cols-3 gap-6", css: ".l-mag-3up { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:24px; }" },
    { name: "Magazine Drop Cap Lead", desc: "Magazine layout featuring a large drop-cap lead paragraph beside a vertical stack of secondary stories — print-nostalgic editorial feel.",
      payload: "grid grid-cols-[1fr_280px] gap-8", css: ".l-mag-dropcap { display:grid; grid-template-columns:1fr 280px; gap:32px; }" },
    { name: "Magazine Pull Quote", desc: "Magazine spread with an oversized pull quote breaking the column flow — dramatic editorial device for long-form features.",
      payload: "grid grid-cols-12 gap-6", css: ".l-mag-quote { display:grid; grid-template-columns:repeat(12,minmax(0,1fr)); gap:24px; }" },
    { name: "Magazine Zigzag", desc: "Magazine zigzag layout alternating left/right alignment between rows — kinetic, magazine-like reading rhythm for feature lists.",
      payload: "grid grid-cols-2 gap-12", css: ".l-mag-zigzag { display:grid; grid-template-columns:1fr 1fr; gap:48px; }" },
    { name: "Magazine Cover Style", desc: "Magazine cover-style layout with one dominant image, large masthead typography, and stacked cover lines — bold, fashion-magazine inspired.",
      payload: "relative grid grid-rows-[auto_1fr_auto]", css: ".l-mag-cover { position:relative; display:grid; grid-template-rows:auto 1fr auto; }" },
  ];
  for (const m of magazineVariants) {
    add({
      name: m.name,
      semantic_description: m.desc,
      tags: ["magazine","editorial","print","article"],
      payload: m.payload,
      css: m.css,
      responsive: { mobile: "grid-cols-1", tablet: "grid-cols-2", desktop: m.payload, behavior: "stack" },
      conflicts: ["display:grid", "layout:magazine"],
      family: "magazine",
      meta: { kind: "magazine" },
    });
  }

  // ===== Cards grid responsive =====
  const cardsGridVariants = [
    { name: "Cards Grid 3-Up", cols: 3, gap: 24, desc: "Three-column responsive cards grid with a 24px gap — universal content grid for blogs, products, and feature lists.",
      payload: "grid grid-cols-1 md:grid-cols-3 gap-6" },
    { name: "Cards Grid 4-Up", cols: 4, gap: 20, desc: "Four-column responsive cards grid with a 20px gap — denser product grid for e-commerce listings and directories.",
      payload: "grid grid-cols-2 md:grid-cols-4 gap-5" },
    { name: "Cards Grid 2-Up Wide", cols: 2, gap: 32, desc: "Two-column wide cards grid with a 32px gap — premium, airy pattern for high-value content like case studies.",
      payload: "grid grid-cols-1 md:grid-cols-2 gap-8" },
    { name: "Cards Grid Auto-Rows", cols: 3, gap: 16, desc: "Auto-rows cards grid using fixed 200px row heights — uniform card height for visual consistency across content of varying length.",
      payload: "grid grid-cols-3 gap-4 auto-rows-[200px]" },
    { name: "Cards Grid Staggered", cols: 3, gap: 24, desc: "Staggered cards grid with alternating row offsets — Pinterest-like rhythm for media-heavy galleries.",
      payload: "grid grid-cols-3 gap-6 [grid-auto-flow:dense]" },
    { name: "Cards Grid Featured First", cols: 3, gap: 24, desc: "Cards grid where the first card spans 2 columns to feature premium content — emphasises a hero item within a uniform grid.",
      payload: "grid grid-cols-3 gap-6 first:[grid-column:span_2]" },
    { name: "Cards Grid Compact Mobile", cols: 2, gap: 12, desc: "Compact two-column mobile-first cards grid with a 12px gap — thumb-friendly card density for mobile commerce.",
      payload: "grid grid-cols-2 gap-3" },
    { name: "Cards Grid Horizontal Scroll", cols: 0, gap: 16, desc: "Horizontal-scrolling cards row for mobile carousels and featured content rails — snap-scrolling with momentum.",
      payload: "flex gap-4 overflow-x-auto snap-x snap-mandatory" },
  ];
  for (const c of cardsGridVariants) {
    add({
      name: c.name,
      semantic_description: c.desc,
      tags: ["cards","grid","responsive","content"],
      payload: c.payload,
      css: `.l-cards-${cardsGridVariants.indexOf(c)+1} { ${c.payload.includes("flex") ? "display:flex" : "display:grid"}; ${c.payload.includes("flex") ? `gap:${c.gap}px` : `gap:${c.gap}px`} }`,
      responsive: { mobile: c.cols > 0 ? `grid-cols-${Math.max(1, Math.floor(c.cols/2))}` : "flex-row", tablet: c.cols > 0 ? `grid-cols-2` : "flex-row", desktop: c.cols > 0 ? `grid-cols-${c.cols}` : "flex-row", behavior: "stack" },
      conflicts: ["display:grid", "layout:cards-grid"],
      family: "minimal-flat",
      meta: { columns: c.cols, gap: c.gap },
    });
  }

  // ===== Step / zigzag / featured =====
  const miscLayouts = [
    { name: "Step Numbered Layout", desc: "Numbered step layout with large numerals and connecting lines — onboarding flows and tutorial sequences.",
      payload: "grid grid-cols-3 gap-8 relative", css: ".l-step { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:32px; position:relative; }" },
    { name: "Zigzag Feature Layout", desc: "Zigzag layout alternating left-right text/visual pairs — narrative storytelling pattern for feature walkthroughs.",
      payload: "grid grid-cols-2 gap-12", css: ".l-zigzag { display:grid; grid-template-columns:1fr 1fr; gap:48px; }" },
    { name: "Featured Grid Spotlight", desc: "Featured grid with a single spotlight cell taking 60% of the area and supporting tiles filling the rest — emphasises one key item.",
      payload: "grid grid-cols-3 gap-6 [grid-template-areas:'spot spot side1' 'spot spot side2']", css: ".l-spotlight { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:24px; grid-template-areas:'spot spot side1' 'spot spot side2'; }" },
    { name: "Comparison Table Layout", desc: "Side-by-side comparison table layout for pricing or feature comparison — clear column rhythm with sticky header.",
      payload: "grid grid-cols-3 gap-px bg-border", css: ".l-compare { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1px; background:var(--border); }" },
    { name: "FAQ Accordion Layout", desc: "FAQ accordion layout — single-column list with expandable rows, ample whitespace between questions.",
      payload: "flex flex-col gap-4 max-w-3xl mx-auto", css: ".l-faq { display:flex; flex-direction:column; gap:16px; max-width:48rem; margin-inline:auto; }" },
    { name: "Pricing Tier Layout", desc: "Three-tier pricing layout with the middle tier highlighted as 'most popular' — classic SaaS pricing pattern.",
      payload: "grid grid-cols-3 gap-6 items-center", css: ".l-pricing { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:24px; align-items:center; }" },
    { name: "Logo Cloud Layout", desc: "Logo cloud layout — grayscale logos arranged in a wrapped flex row with subtle hover color, social proof pattern.",
      payload: "flex flex-wrap items-center justify-center gap-12 opacity-60", css: ".l-logos { display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:48px; opacity:0.6; }" },
    { name: "Timeline Vertical Layout", desc: "Vertical timeline layout with a central spine and alternating left/right event cards — chronological storytelling.",
      payload: "relative grid grid-cols-[1fr_auto_1fr] gap-8", css: ".l-timeline { position:relative; display:grid; grid-template-columns:1fr auto 1fr; gap:32px; }" },
    { name: "Footer Multi-Column", desc: "Multi-column footer layout with branded column, link groups, and a bottom legal row — comprehensive site footer pattern.",
      payload: "grid grid-cols-[2fr_1fr_1fr_1fr] gap-12", css: ".l-footer { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:48px; }" },
    { name: "CTA Banner Full Width", desc: "Full-width CTA banner with centered text and dual buttons — high-conversion closing section before the footer.",
      payload: "flex flex-col items-center justify-center text-center gap-6 py-20 px-6", css: ".l-cta-banner { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:24px; padding:80px 24px; }" },
    { name: "Stats Strip Layout", desc: "Four-column stats strip with large numerals and small captions — social proof metric bar pattern.",
      payload: "grid grid-cols-2 md:grid-cols-4 gap-8", css: ".l-stats { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:32px; }" },
    { name: "Testimonial Carousel Layout", desc: "Testimonial carousel layout with a single quote centered and pagination dots below — soft, narrative pattern for social proof.",
      payload: "flex flex-col items-center text-center gap-6 max-w-2xl mx-auto", css: ".l-testimonial { display:flex; flex-direction:column; align-items:center; text-align:center; gap:24px; max-width:42rem; margin-inline:auto; }" },
  ];
  for (const m of miscLayouts) {
    add({
      name: m.name,
      semantic_description: m.desc,
      tags: ["layout","section","pattern","composition"],
      payload: m.payload,
      css: m.css,
      responsive: { mobile: "grid-cols-1", tablet: m.payload.includes("grid-cols-3") ? "grid-cols-2" : m.payload, desktop: m.payload, behavior: "stack" },
      conflicts: ["display:grid", `layout:${m.name.split(" ")[0].toLowerCase()}`],
      family: "minimal-flat",
      meta: { kind: "section" },
    });
  }

  // ===== Additional combinatorial grid expansions =====
  // gap × max-width × columns
  const gaps = [8, 12, 16, 20, 24, 32, 40, 48];
  const maxes = [1024, 1152, 1280, 1440, 1536, 1728];
  const colSets = [4, 6, 8, 12];
  let idx = 0;
  for (const cols of colSets) {
    for (const gap of gaps) {
      for (const max of maxes) {
        idx++;
        const family = pick(AESTHETIC_POOL, idx);
        add({
          name: `${cols}-Col Grid ${gap}px/${max}px`,
          semantic_description: `${cols}-column CSS grid variant with a ${gap}px gutter and a ${max}px max-width container. ${pick(INTENSITY_POOL, idx).charAt(0).toUpperCase() + pick(INTENSITY_POOL, idx).slice(1)} spacing rhythm suits ${pick(USE_CASE_POOL, idx)} needing ${gap < 16 ? "tight, dense" : gap > 32 ? "airy, premium" : "balanced"} content blocks. ${pick(MOOD_POOL, idx+2).charAt(0).toUpperCase() + pick(MOOD_POOL, idx+2).slice(1)} tone.`,
          tags: ["grid", `${cols}-col`, "responsive", "gutter", "container"],
          payload: `grid grid-cols-${cols} gap-[${gap}px] max-w-[${max}px] mx-auto`,
          css: `.l-grid-c${cols}-g${gap}-m${max} { display:grid; grid-template-columns:repeat(${cols},minmax(0,1fr)); gap:${gap}px; max-width:${max}px; margin-inline:auto; }`,
          responsive: { mobile: "grid-cols-1", tablet: `grid-cols-${Math.min(cols, 4)}`, desktop: `grid-cols-${cols}`, behavior: "stack" },
          conflicts: ["display:grid", `layout:${cols}col`],
          family,
          meta: { columns: cols, gap, maxWidth: max },
        });
      }
    }
  }

  // ===== Container variants =====
  const containerVariants = [
    { name: "Container Max 6xl", max: 1152, desc: "Standard content container capped at 1152px with auto horizontal margins — balanced reading width for articles and forms." },
    { name: "Container Max 7xl", max: 1280, desc: "Wide content container capped at 1280px — versatile default for marketing sites and dashboards." },
    { name: "Container Max Screen XL", max: 1440, desc: "Extra-wide container capped at 1440px — spacious layout for media-rich sites and portfolios." },
    { name: "Container Max Screen 2XL", max: 1536, desc: "Maximum 1536px container — full-bleed feel on large monitors while preserving line-length sanity." },
    { name: "Container Prose 65ch", max: 0, desc: "Reading-optimised prose container capped at 65 characters wide — typographic best practice for long-form articles." },
    { name: "Container Full Bleed", max: 0, desc: "Full-bleed container with no max-width — for hero sections, image galleries, and immersive media." },
    { name: "Container Padded 24px", max: 1280, desc: "Container with consistent 24px horizontal padding on all breakpoints — ensures content never touches screen edges." },
    { name: "Container Padded 48px", max: 1440, desc: "Container with generous 48px horizontal padding — premium, breathing layout for high-end brands." },
  ];
  for (const c of containerVariants) {
    add({
      name: c.name,
      semantic_description: c.desc,
      tags: ["container","max-width","content","wrapper"],
      payload: c.max > 0 ? `max-w-[${c.max}px] mx-auto px-6` : "max-w-prose mx-auto",
      css: c.max > 0 ? `.l-container-${c.max} { max-width:${c.max}px; margin-inline:auto; padding-inline:24px; }` : `.l-container-prose { max-width:65ch; margin-inline:auto; }`,
      conflicts: ["layout:container"],
      family: "minimal-flat",
      meta: { maxWidth: c.max || "prose" },
    });
  }

  // ===== Grid column-span utilities =====
  for (let span = 1; span <= 12; span++) {
    add({
      name: `col-span-${span}`,
      semantic_description: `Grid column-span utility setting the element to span ${span} of 12 columns. ${span === 1 ? "Single-column narrow cell for dense data tables." : span === 12 ? "Full-width row-spanning cell for heroes and banners." : span <= 4 ? "Narrow content cell for sidebars and metadata." : span <= 8 ? "Medium-width content cell for cards and features." : "Wide content cell for primary content areas."} ${pick(MOOD_POOL, span).charAt(0).toUpperCase() + pick(MOOD_POOL, span).slice(1)} rhythm for ${pick(USE_CASE_POOL, span)}.`,
      tags: ["grid", "column", "span", `col-span-${span}`],
      payload: `col-span-${span}`,
      css: `.col-span-${span} { grid-column:span ${span}; }`,
      responsive: { mobile: "col-span-12", tablet: `col-span-${Math.min(span * 2, 12)}`, desktop: `col-span-${span}`, behavior: "stack" },
      conflicts: [`grid-span:${span}`],
      family: "minimal-flat",
      meta: { span },
    });
  }

  // ===== More section patterns =====
  const moreSections: Array<{ name: string; payload: string; css: string; desc: string }> = [
    { name: "Feature Trio Row", payload: "grid grid-cols-3 gap-8 py-16", css: ".l-feature-trio { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:32px; padding:64px 0; }", desc: "Three-column feature row with generous vertical padding — classic SaaS landing section for showcasing three key features side by side." },
    { name: "Split Content 40/60", payload: "grid grid-cols-[2fr_3fr] gap-12", css: ".l-split-4060 { display:grid; grid-template-columns:2fr 3fr; gap:48px; }", desc: "Split content layout with a 40/60 ratio — sidebar with metadata on the left, main content on the right. Article-page pattern." },
    { name: "Split Content 60/40", payload: "grid grid-cols-[3fr_2fr] gap-12", css: ".l-split-6040 { display:grid; grid-template-columns:3fr 2fr; gap:48px; }", desc: "Split content layout with a 60/40 ratio — main content on the left, sidebar with related items on the right. Blog-post pattern." },
    { name: "Quad Stats Row", payload: "grid grid-cols-4 gap-6", css: ".l-quad-stats { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:24px; }", desc: "Four-column stats row for KPI dashboards and metric displays — equal-weight cells for comparable numbers." },
    { name: "Hero Plus Three", payload: "grid grid-cols-3 gap-6 [grid-template-rows:auto_1fr]", css: ".l-hero-three { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:24px; grid-template-rows:auto 1fr; }", desc: "Hero-plus-three layout — full-width hero on top with three equal feature cells below. SaaS landing page pattern." },
    { name: "Two-Column Form", payload: "grid grid-cols-2 gap-6", css: ".l-form-2col { display:grid; grid-template-columns:1fr 1fr; gap:24px; }", desc: "Two-column form layout — side-by-side input pairs for compact settings forms and registration pages." },
    { name: "Three-Column Form", payload: "grid grid-cols-3 gap-4", css: ".l-form-3col { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }", desc: "Three-column form layout for dense data-entry forms — address forms and checkout flows." },
    { name: "Media Text Alternating", payload: "grid grid-cols-2 gap-16 items-center", css: ".l-media-text-alt { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; }", desc: "Alternating media-text layout — image and text columns that swap order on each row for visual rhythm." },
    { name: "Centered Narrow Column", payload: "max-w-2xl mx-auto px-6", css: ".l-narrow-center { max-width:42rem; margin-inline:auto; padding-inline:24px; }", desc: "Centered narrow column for long-form article reading — 672px max width preserves optimal line length." },
    { name: "Wide Bleed Section", payload: "w-screen max-w-none px-6", css: ".l-wide-bleed { width:100vw; max-width:none; padding-inline:24px; }", desc: "Full-bleed wide section extending beyond the container — for hero bands and image galleries." },
    { name: "Footer Four Column", payload: "grid grid-cols-4 gap-8 py-12", css: ".l-footer-4col { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:32px; padding:48px 0; }", desc: "Four-column footer layout — brand column plus three link groups, the standard SaaS footer pattern." },
    { name: "Sidebar Sticky Reading", payload: "grid grid-cols-[280px_1fr] gap-12 items-start", css: ".l-sticky-read { display:grid; grid-template-columns:280px 1fr; gap:48px; align-items:start; }", desc: "Sticky-sidebar reading layout — TOC sidebar with scroll-spy alongside long-form article body. Documentation pattern." },
  ];
  for (const s of moreSections) {
    add({
      name: s.name,
      semantic_description: s.desc,
      tags: ["layout", "section", "pattern", s.name.toLowerCase().replace(/\s+/g, "-")],
      payload: s.payload,
      css: s.css,
      responsive: { mobile: "grid-cols-1", tablet: "grid-cols-2", desktop: s.payload, behavior: "stack" },
      conflicts: ["display:grid", `layout:${s.name.toLowerCase().replace(/\s+/g, "-")}`],
      family: "minimal-flat",
      meta: { kind: "section" },
    });
  }

  return out;
}

/* ----------------------------- COMPONENTS ----------------------------- */
function buildComponents(): LexiconEntry[] {
  const out: LexiconEntry[] = [];
  let n = 0;
  const add = (e: Omit<LexiconEntry, "id" | "category">) => {
    n++;
    out.push({ id: `components.${pad(n)}`, category: "components", ...e });
  };

  // ===== Buttons =====
  const btnVariants: Array<{ v: string; family: string; base: string; hover: string; desc: string; conflict: string }> = [
    { v: "solid-primary", family: "minimal-flat", base: "bg-zinc-900 text-white", hover: "hover:bg-zinc-800",
      desc: "Solid primary button with a high-contrast dark fill — the canonical call-to-action for primary user actions. Confident, direct, accessible.",
      conflict: "btn:solid" },
    { v: "solid-secondary", family: "minimal-flat", base: "bg-zinc-100 text-zinc-900", hover: "hover:bg-zinc-200",
      desc: "Solid secondary button with a soft neutral fill — supports the primary CTA without competing for attention.",
      conflict: "btn:solid" },
    { v: "outline", family: "minimal-flat", base: "border border-zinc-300 text-zinc-900 bg-transparent", hover: "hover:bg-zinc-50",
      desc: "Outline button with a thin border and transparent fill — subtle, professional alternative for tertiary actions and forms.",
      conflict: "btn:outline" },
    { v: "ghost", family: "minimal-flat", base: "bg-transparent text-zinc-900", hover: "hover:bg-zinc-100",
      desc: "Ghost button with no background or border — minimal, chromeless pattern for icon-toolbars and inline actions.",
      conflict: "btn:ghost" },
    { v: "gradient", family: "aurora", base: "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white", hover: "hover:opacity-90",
      desc: "Gradient button with a vivid violet-to-fuchsia fill — modern aurora aesthetic for premium CTAs in SaaS landing pages.",
      conflict: "btn:gradient" },
    { v: "glass", family: "glassmorphism", base: "bg-white/10 backdrop-blur-md border border-white/20 text-white", hover: "hover:bg-white/20",
      desc: "Glassmorphic button with a frosted translucent fill and thin border — premium feel for hero overlays and dark-mode interfaces.",
      conflict: "btn:glass" },
    { v: "neon", family: "neon", base: "bg-black text-cyan-400 border border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]", hover: "hover:shadow-[0_0_30px_rgba(34,211,238,0.8)]",
      desc: "Neon-glow button with a dark fill, electric cyan text, and a luminous outer glow — cyberpunk aesthetic for gaming and dev-tool sites.",
      conflict: "btn:neon" },
    { v: "brutalist", family: "brutalist", base: "bg-yellow-300 text-black border-2 border-black shadow-[4px_4px_0_0_#000]", hover: "hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_0_#000]",
      desc: "Neo-brutalist button with a saturated yellow fill, hard black border, and offset hard shadow — bold 2025 aesthetic for creative agencies.",
      conflict: "btn:brutalist" },
    { v: "pill", family: "minimal-flat", base: "bg-zinc-900 text-white rounded-full", hover: "hover:bg-zinc-800",
      desc: "Pill-shaped button with fully rounded ends — soft, friendly CTA pattern for filter chips and tag-style actions.",
      conflict: "btn:pill" },
    { v: "square", family: "brutalist", base: "bg-zinc-900 text-white rounded-none", hover: "hover:bg-zinc-800",
      desc: "Square-cornered button with zero radius — sharp, structural pattern suited to brutalist and data-dense interfaces.",
      conflict: "btn:square" },
    { v: "icon-only", family: "minimal-flat", base: "bg-transparent text-zinc-700 p-2", hover: "hover:bg-zinc-100",
      desc: "Icon-only button with square padding and no text — compact action trigger for toolbars and inline controls.",
      conflict: "btn:icon" },
    { v: "fab", family: "material", base: "bg-zinc-900 text-white rounded-full w-14 h-14 shadow-lg", hover: "hover:scale-105",
      desc: "Floating action button — circular, elevated, material-design primary action pattern typically anchored to the bottom-right.",
      conflict: "btn:fab" },
  ];
  const btnSizes: Array<{ s: string; py: string; px: string; text: string; radius: string }> = [
    { s: "xs", py: "4px", px: "10px", text: "11px", radius: "6px" },
    { s: "sm", py: "6px", px: "12px", text: "12px", radius: "8px" },
    { s: "md", py: "10px", px: "16px", text: "14px", radius: "8px" },
    { s: "lg", py: "12px", px: "20px", text: "16px", radius: "10px" },
    { s: "xl", py: "14px", px: "24px", text: "18px", radius: "12px" },
    { s: "2xl", py: "18px", px: "32px", text: "20px", radius: "14px" },
  ];
  for (const v of btnVariants) {
    for (const sz of btnSizes) {
      add({
        name: `${v.v} button ${sz.s}`,
        semantic_description: `${v.desc} Size variant ${sz.s.toUpperCase()} (${sz.text} text, ${sz.py}/${sz.px} padding, ${sz.radius} radius). ${pick(MOOD_POOL, n).charAt(0).toUpperCase() + pick(MOOD_POOL, n).slice(1)} and ${pick(INTENSITY_POOL, n+1)} in tone, fitting ${pick(USE_CASE_POOL, n+3)}.`,
        tags: ["button", v.v, sz.s, "cta", "interactive"],
        payload: `btn btn-${v.v} btn-${sz.s} ${v.base} ${v.hover}`,
        css: `.btn-${v.v}-${sz.s} { display:inline-flex; align-items:center; gap:8px; padding:${sz.py} ${sz.px}; font-size:${sz.text}; border-radius:${sz.radius}; ${v.base.includes("bg-gradient") ? `background:linear-gradient(to right,#8b5cf6,#d946ef); color:#fff;` : v.base.includes("backdrop") ? `background:rgba(255,255,255,0.1); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.2); color:#fff;` : ""} transition:all .2s ease; cursor:pointer; }`,
        html: `<button class="btn-${v.v}-${sz.s}">Action</button>`,
        accessibility: { contrastRatio: v.v === "glass" || v.v === "neon" ? 4.5 : 7.2, aria: ["role=button", "aria-label=Action"], focusVisible: true },
        conflicts: ["component:button", v.conflict, `btn-size:${sz.s}`],
        family: v.family,
        meta: { variant: v.v, size: sz.s },
      });
    }
    // States
    const states = [
      { st: "hover", desc: "Hover state for the " + v.v + " button — subtle visual lift or color shift indicating interactivity.", css: `${v.hover};` },
      { st: "active", desc: "Active/pressed state for the " + v.v + " button — slight scale-down and intensified fill confirming the press.", css: `:active { transform:scale(0.97); }` },
      { st: "disabled", desc: "Disabled state for the " + v.v + " button — reduced opacity (50%) and no-pointer cursor signaling unavailability.", css: `opacity:0.5; cursor:not-allowed;` },
      { st: "loading", desc: "Loading state for the " + v.v + " button — animated spinner replacing the label, indicating async processing.", css: `position:relative; color:transparent; } .btn-loading::after { content:''; position:absolute; inset:0; margin:auto; width:16px; height:16px; border:2px solid currentColor; border-top-color:transparent; border-radius:50%; animation:spin .6s linear infinite;` },
      { st: "focus-visible", desc: "Focus-visible state for the " + v.v + " button — 2px ring offset for keyboard accessibility without affecting mouse users.", css: `:focus-visible { outline:2px solid #6366f1; outline-offset:2px; }` },
    ];
    for (const st of states) {
      add({
        name: `${v.v} button ${st.st}`,
        semantic_description: st.desc,
        tags: ["button", v.v, st.st, "state", "interactive"],
        payload: `btn-${v.v} state-${st.st}`,
        css: `.btn-${v.v}.state-${st.st} { ${st.css} }`,
        accessibility: { focusVisible: st.st === "focus-visible" || st.st === "hover", aria: ["role=button"] },
        conflicts: ["component:button-state", `btn-state:${st.st}`],
        family: v.family,
        meta: { variant: v.v, state: st.st },
      });
    }
  }

  // ===== Cards =====
  const cardTypes: Array<{ t: string; family: string; desc: string; base: string; conflict: string }> = [
    { t: "basic", family: "minimal-flat", base: "bg-white rounded-lg border border-zinc-200 p-6",
      desc: "Basic content card with a subtle border and soft padding — the workhorse surface for content modules. Clean, neutral, versatile.",
      conflict: "card:basic" },
    { t: "elevated", family: "material", base: "bg-white rounded-xl p-6 shadow-md",
      desc: "Elevated card with a soft material shadow lifting it off the page — gives content prominence without heavy borders. Material-design influence.",
      conflict: "card:elevated" },
    { t: "outline", family: "minimal-flat", base: "bg-white rounded-lg border-2 border-zinc-900 p-6",
      desc: "Outline card with a bold 2px black border — sharp, structural surface for brutalist and editorial layouts.",
      conflict: "card:outline" },
    { t: "glass", family: "glassmorphism", base: "bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6",
      desc: "Glassmorphic card with a frosted translucent fill and thin border — premium, layered feel for hero overlays and dashboard tiles.",
      conflict: "card:glass" },
    { t: "interactive", family: "minimal-flat", base: "bg-white rounded-lg border border-zinc-200 p-6 hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-all",
      desc: "Interactive card with hover lift and shadow — animated response communicating clickability, popular for content grids and link cards.",
      conflict: "card:interactive" },
    { t: "horizontal", family: "minimal-flat", base: "flex bg-white rounded-lg border border-zinc-200 overflow-hidden",
      desc: "Horizontal card with image-left, content-right layout — efficient list-item pattern for blog rolls and product cards.",
      conflict: "card:horizontal" },
    { t: "feature", family: "minimal-flat", base: "bg-white rounded-xl p-8 border border-zinc-200 relative",
      desc: "Feature card with generous padding and space for an icon, title, and description — used in feature grids below the hero.",
      conflict: "card:feature" },
    { t: "pricing", family: "minimal-flat", base: "bg-white rounded-2xl border border-zinc-200 p-8 flex flex-col gap-6",
      desc: "Pricing card with structured layout for tier name, price, feature list, and CTA — vertical rhythm optimised for comparison.",
      conflict: "card:pricing" },
    { t: "product", family: "minimal-flat", base: "bg-white rounded-lg border border-zinc-200 overflow-hidden group",
      desc: "Product card with image, title, price, and rating — e-commerce product tile pattern with hover affordances.",
      conflict: "card:product" },
    { t: "testimonial", family: "minimal-flat", base: "bg-zinc-50 rounded-2xl p-8 flex flex-col gap-4",
      desc: "Testimonial card with quote, avatar, and attribution — soft background tint distinguishes it from content cards.",
      conflict: "card:testimonial" },
    { t: "stat", family: "minimal-flat", base: "bg-white rounded-xl border border-zinc-200 p-6 flex flex-col gap-2",
      desc: "Stat card with large numeral and small caption — dashboard metric tile pattern for KPIs and analytics.",
      conflict: "card:stat" },
    { t: "glass-dark", family: "glassmorphism", base: "bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6",
      desc: "Dark glassmorphic card with a translucent dark fill and subtle border — moody, premium surface for dark-mode dashboards.",
      conflict: "card:glass-dark" },
    { t: "neumorphic", family: "neumorphism", base: "bg-zinc-100 rounded-2xl p-6 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]",
      desc: "Neumorphic soft-UI card extruded from the surface via dual directional shadows — soft, tactile, monochromatic aesthetic.",
      conflict: "card:neumorphic" },
    { t: "clay", family: "claymorphism", base: "bg-fuchsia-100 rounded-3xl p-6 shadow-[inset_0_-8px_16px_rgba(0,0,0,0.1),inset_0_8px_16px_rgba(255,255,255,0.6)]",
      desc: "Claymorphic card with a soft 3D clay look — rounded pillowy shape with inset highlights and shadows, playful 2025 aesthetic.",
      conflict: "card:clay" },
    { t: "brutalist", family: "brutalist", base: "bg-yellow-300 border-4 border-black p-6 shadow-[8px_8px_0_0_#000]",
      desc: "Neo-brutalist card with a saturated fill, thick black border, and hard offset shadow — bold, raw, attention-grabbing pattern.",
      conflict: "card:brutalist" },
  ];
  for (const c of cardTypes) {
    add({
      name: `${c.t} card`,
      semantic_description: c.desc,
      tags: ["card", c.t, "surface", "container"],
      payload: `card card-${c.t} ${c.base}`,
      css: `.card-${c.t} { ${c.base.split(" ").map(tok => {
        if (tok.startsWith("rounded-")) { const r = tok === "rounded" ? "4px" : tok === "rounded-md" ? "6px" : tok === "rounded-lg" ? "8px" : tok === "rounded-xl" ? "12px" : tok === "rounded-2xl" ? "16px" : tok === "rounded-3xl" ? "24px" : "4px"; return `border-radius:${r};`; }
        return "";
      }).join(" ")} padding:24px; background:#fff; }`,
      html: `<div class="card-${c.t}"><h3>Title</h3><p>Body</p></div>`,
      accessibility: { aria: c.t === "interactive" ? ["role=button", "tabindex=0"] : ["role=group"], focusVisible: c.t === "interactive" },
      conflicts: ["component:card", c.conflict],
      family: c.family,
      meta: { type: c.t },
    });
    // Size variants
    const sizes = [
      { s: "sm", p: "12px" }, { s: "md", p: "20px" }, { s: "lg", p: "32px" }, { s: "xl", p: "48px" },
    ];
    for (const sz of sizes) {
      add({
        name: `${c.t} card ${sz.s}`,
        semantic_description: `${c.desc} Padding variant ${sz.s.toUpperCase()} (${sz.p}) — ${sz.s === "sm" ? "compact density for tight grids" : sz.s === "xl" ? "airy, premium feel for feature cards" : "balanced breathing room"}.`,
        tags: ["card", c.t, sz.s, "size"],
        payload: `card-${c.t} card-${sz.s}`,
        css: `.card-${c.t}.card-${sz.s} { padding:${sz.p}; }`,
        conflicts: ["component:card", c.conflict, `card-size:${sz.s}`],
        family: c.family,
        meta: { type: c.t, size: sz.s },
      });
    }
  }

  // ===== Navbars =====
  const navTypes = [
    { t: "top-static", desc: "Static top navbar that scrolls away with the page — minimal, content-first pattern for landing pages and blogs.", family: "minimal-flat",
      payload: "flex items-center justify-between h-16 px-6 bg-white border-b", css: ".nav-top-static { display:flex; align-items:center; justify-content:space-between; height:64px; padding:0 24px; background:#fff; border-bottom:1px solid #e4e4e7; }" },
    { t: "sticky", desc: "Sticky top navbar that remains pinned during scroll — keeps brand and primary navigation accessible at all times.", family: "minimal-flat",
      payload: "sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b", css: ".nav-sticky { position:sticky; top:0; z-index:30; display:flex; align-items:center; justify-content:space-between; height:64px; padding:0 24px; background:#fff; border-bottom:1px solid #e4e4e7; }" },
    { t: "fixed", desc: "Fixed top navbar that overlays content — persistent navigation for app shells that need content scrolling beneath.", family: "minimal-flat",
      payload: "fixed top-0 inset-x-0 z-40 flex items-center justify-between h-16 px-6 bg-white", css: ".nav-fixed { position:fixed; top:0; left:0; right:0; z-index:40; display:flex; align-items:center; justify-content:space-between; height:64px; padding:0 24px; background:#fff; }" },
    { t: "transparent", desc: "Transparent navbar with no background — overlays hero imagery, ideal for photographic landing pages.", family: "minimal-flat",
      payload: "absolute top-0 inset-x-0 z-40 flex items-center justify-between h-16 px-6 text-white", css: ".nav-transparent { position:absolute; top:0; left:0; right:0; z-index:40; display:flex; align-items:center; justify-content:space-between; height:64px; padding:0 24px; color:#fff; }" },
    { t: "glass", desc: "Glass navbar with backdrop blur and translucent fill — premium modern feel for SaaS landings; content scrolls beneath a frosted bar.", family: "glassmorphism",
      payload: "sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/70 backdrop-blur-md border-b border-white/20", css: ".nav-glass { position:sticky; top:0; z-index:30; display:flex; align-items:center; justify-content:space-between; height:64px; padding:0 24px; background:rgba(255,255,255,0.7); backdrop-filter:blur(12px); border-bottom:1px solid rgba(255,255,255,0.2); }" },
    { t: "mobile-drawer", desc: "Mobile drawer navbar — hamburger triggers a slide-in drawer with full nav on small screens; collapses to icon rail on desktop.", family: "minimal-flat",
      payload: "flex items-center justify-between h-16 px-4 md:hidden", css: ".nav-mobile { display:flex; align-items:center; justify-content:space-between; height:64px; padding:0 16px; }" },
    { t: "mega-menu", desc: "Mega menu navbar with full-width dropdown panels revealing categorized links — pattern for e-commerce and enterprise sites with deep navigation.", family: "minimal-flat",
      payload: "flex items-center justify-between h-16 px-6 bg-white border-b", css: ".nav-mega { display:flex; align-items:center; justify-content:space-between; height:64px; padding:0 24px; background:#fff; border-bottom:1px solid #e4e4e7; }" },
    { t: "centered-logo", desc: "Centered-logo navbar with logo in the middle flanked by symmetric nav groups — editorial, fashion-magazine inspired layout.", family: "magazine",
      payload: "grid grid-cols-3 items-center h-20 px-6 bg-white border-b", css: ".nav-centered { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; height:80px; padding:0 24px; background:#fff; border-bottom:1px solid #e4e4e7; }" },
    { t: "split-actions", desc: "Split navbar with brand on left, search in center, and actions on right — SaaS dashboard pattern balancing brand, search, and account.", family: "minimal-flat",
      payload: "grid grid-cols-[1fr_2fr_1fr] items-center h-16 px-6 bg-white border-b gap-4", css: ".nav-split { display:grid; grid-template-columns:1fr 2fr 1fr; align-items:center; height:64px; padding:0 24px; gap:16px; background:#fff; border-bottom:1px solid #e4e4e7; }" },
    { t: "bottom-mobile", desc: "Bottom mobile navbar with icon-tab pattern — thumb-reachable navigation for mobile-first apps following iOS/Android conventions.", family: "minimal-flat",
      payload: "fixed bottom-0 inset-x-0 z-40 flex justify-around h-16 bg-white border-t md:hidden", css: ".nav-bottom { position:fixed; bottom:0; left:0; right:0; z-index:40; display:flex; justify-content:space-around; height:64px; background:#fff; border-top:1px solid #e4e4e7; }" },
  ];
  for (const nv of navTypes) {
    add({
      name: `${nv.t} navbar`,
      semantic_description: nv.desc,
      tags: ["navbar", "navigation", nv.t, "header"],
      payload: nv.payload,
      css: nv.css,
      html: `<nav class="nav-${nv.t}"><a>Brand</a><div>Links</div></nav>`,
      accessibility: { aria: ["role=navigation", "aria-label=Main"], focusVisible: true },
      conflicts: ["component:navbar", `nav:${nv.t}`],
      family: nv.family,
      meta: { type: nv.t },
    });
  }

  // ===== Modals / dialogs =====
  const modalTypes = [
    { t: "centered", desc: "Centered modal dialog floating above a dimmed backdrop — the canonical modal pattern for confirmations and focused forms.", family: "minimal-flat",
      payload: "fixed inset-0 z-50 grid place-items-center bg-black/50 p-4", css: ".modal-centered { position:fixed; inset:0; z-index:50; display:grid; place-items:center; background:rgba(0,0,0,0.5); padding:16px; }" },
    { t: "sheet-bottom", desc: "Bottom sheet modal sliding up from the bottom edge — mobile-native pattern for action menus and quick forms.", family: "minimal-flat",
      payload: "fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white p-6", css: ".modal-sheet-bottom { position:fixed; left:0; right:0; bottom:0; z-index:50; border-radius:16px 16px 0 0; background:#fff; padding:24px; }" },
    { t: "sheet-side", desc: "Side sheet modal sliding in from the right edge — pattern for detail panels and settings drawers without leaving context.", family: "minimal-flat",
      payload: "fixed right-0 top-0 h-screen w-96 z-50 bg-white p-6 shadow-xl", css: ".modal-sheet-side { position:fixed; right:0; top:0; height:100vh; width:384px; z-index:50; background:#fff; padding:24px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); }" },
    { t: "alert", desc: "Alert modal — small, focused dialog with title, message, and 1-2 buttons for confirmations and warnings.", family: "minimal-flat",
      payload: "fixed inset-0 z-50 grid place-items-center bg-black/50", css: ".modal-alert { position:fixed; inset:0; z-index:50; display:grid; place-items:center; background:rgba(0,0,0,0.5); }" },
    { t: "toast", desc: "Toast notification — small, auto-dismissing popup anchored to a screen corner for transient feedback messages.", family: "minimal-flat",
      payload: "fixed bottom-6 right-6 z-50 bg-zinc-900 text-white rounded-lg px-4 py-3 shadow-lg", css: ".modal-toast { position:fixed; bottom:24px; right:24px; z-index:50; background:#18181b; color:#fff; border-radius:8px; padding:12px 16px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); }" },
    { t: "fullscreen", desc: "Fullscreen modal taking 100% of the viewport — immersive pattern for media viewers and complex multi-step flows.", family: "minimal-flat",
      payload: "fixed inset-0 z-50 bg-white p-6", css: ".modal-fullscreen { position:fixed; inset:0; z-index:50; background:#fff; padding:24px; }" },
    { t: "glass", desc: "Glassmorphic modal with frosted backdrop blur — premium dialog pattern for dark-mode interfaces and creative apps.", family: "glassmorphism",
      payload: "fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm", css: ".modal-glass { position:fixed; inset:0; z-index:50; display:grid; place-items:center; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); }" },
    { t: "popover", desc: "Popover modal — small contextual dialog anchored to a trigger element, used for quick info and inline actions.", family: "minimal-flat",
      payload: "absolute z-40 bg-white rounded-lg shadow-lg border border-zinc-200 p-3", css: ".modal-popover { position:absolute; z-index:40; background:#fff; border-radius:8px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); border:1px solid #e4e4e7; padding:12px; }" },
  ];
  for (const m of modalTypes) {
    add({
      name: `${m.t} modal`,
      semantic_description: m.desc,
      tags: ["modal", "dialog", m.t, "overlay"],
      payload: m.payload,
      css: m.css,
      html: `<div class="modal-${m.t}" role="dialog" aria-modal="true"><div>content</div></div>`,
      accessibility: { aria: ["role=dialog", "aria-modal=true", "aria-labelledby=modal-title"], focusVisible: true },
      conflicts: ["component:modal", `modal:${m.t}`],
      family: m.family,
      meta: { type: m.t },
    });
  }

  // ===== Forms =====
  const formControls = [
    { t: "text-input", desc: "Standard text input with a 1px border, soft padding, and rounded corners — universal form field for single-line text entry.", payload: "w-full px-3 py-2 border border-zinc-300 rounded-md text-sm", css: ".form-text-input { width:100%; padding:8px 12px; border:1px solid #d4d4d8; border-radius:6px; font-size:14px; }" },
    { t: "textarea", desc: "Multi-line textarea input for long-form text — generous min-height and vertical resize handle for user-controlled sizing.", payload: "w-full px-3 py-2 border border-zinc-300 rounded-md min-h-24 resize-y", css: ".form-textarea { width:100%; padding:8px 12px; border:1px solid #d4d4d8; border-radius:6px; min-height:96px; resize:vertical; }" },
    { t: "select", desc: "Native select dropdown with custom chevron — accessible single-choice control; styled to match text input dimensions.", payload: "w-full px-3 py-2 border border-zinc-300 rounded-md appearance-none bg-no-repeat", css: ".form-select { width:100%; padding:8px 12px; border:1px solid #d4d4d8; border-radius:6px; appearance:none; }" },
    { t: "checkbox", desc: "Checkbox input with custom styled indicator — square checkmark control for multi-select options.", payload: "w-4 h-4 rounded border border-zinc-300", css: ".form-checkbox { width:16px; height:16px; border-radius:4px; border:1px solid #d4d4d8; }" },
    { t: "radio", desc: "Radio input with custom styled indicator — circular control for single-select option groups.", payload: "w-4 h-4 rounded-full border border-zinc-300", css: ".form-radio { width:16px; height:16px; border-radius:50%; border:1px solid #d4d4d8; }" },
    { t: "switch", desc: "Toggle switch — sliding pill control for binary on/off state, modern alternative to checkboxes for settings.", payload: "w-11 h-6 rounded-full bg-zinc-300 relative transition-colors", css: ".form-switch { width:44px; height:24px; border-radius:9999px; background:#d4d4d8; position:relative; transition:background-color .2s ease; }" },
    { t: "slider", desc: "Range slider input — track with draggable thumb for selecting a value within a continuous range.", payload: "w-full h-2 rounded-full bg-zinc-200 appearance-none", css: ".form-slider { width:100%; height:8px; border-radius:9999px; background:#e4e4e7; appearance:none; }" },
    { t: "otp-input", desc: "One-time-password input — segmented single-character boxes for entering verification codes, common in auth flows.", payload: "flex gap-2", css: ".form-otp { display:flex; gap:8px; } .form-otp > input { width:40px; height:48px; text-align:center; border:1px solid #d4d4d8; border-radius:8px; }" },
    { t: "datepicker", desc: "Datepicker input with calendar popover — text input trigger revealing a calendar grid for date selection.", payload: "w-full px-3 py-2 border border-zinc-300 rounded-md flex items-center gap-2", css: ".form-datepicker { width:100%; padding:8px 12px; border:1px solid #d4d4d8; border-radius:6px; display:flex; align-items:center; gap:8px; }" },
    { t: "segmented", desc: "Segmented control — pill-shaped group of mutually exclusive options, modern alternative to radio groups.", payload: "inline-flex p-1 bg-zinc-100 rounded-lg", css: ".form-segmented { display:inline-flex; padding:4px; background:#f4f4f5; border-radius:8px; }" },
    { t: "file-upload", desc: "File upload control with drag-drop zone — dashed border and icon-prompt for dropping files or clicking to browse.", payload: "border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center", css: ".form-file { border:2px dashed #d4d4d8; border-radius:8px; padding:32px; text-align:center; }" },
    { t: "search-input", desc: "Search input with leading icon and clear button — enhanced text field for search contexts with affordances.", payload: "w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-md", css: ".form-search { width:100%; padding:8px 16px 8px 40px; border:1px solid #d4d4d8; border-radius:6px; }" },
  ];
  const formStates = ["default", "focus", "error", "disabled", "filled"];
  for (const f of formControls) {
    add({
      name: `${f.t} control`,
      semantic_description: f.desc,
      tags: ["form", "input", f.t, "control"],
      payload: f.payload,
      css: f.css,
      html: `<input class="form-${f.t}" />`,
      accessibility: { aria: ["role=textbox" + (f.t === "select" ? " select" : "")], focusVisible: true },
      conflicts: ["component:form", `form-control:${f.t}`],
      family: "minimal-flat",
      meta: { type: f.t },
    });
    for (const st of formStates) {
      add({
        name: `${f.t} ${st}`,
        semantic_description: `${f.desc} ${st.charAt(0).toUpperCase() + st.slice(1)} state — ${st === "focus" ? "ring indicator showing interaction" : st === "error" ? "red border and helper text indicating validation failure" : st === "disabled" ? "reduced opacity and no-pointer cursor" : st === "filled" ? "populated value with darker text" : "neutral resting appearance"}.`,
        tags: ["form", "input", f.t, st, "state"],
        payload: `form-${f.t} state-${st}`,
        css: `.form-${f.t}.state-${st} { ${st === "focus" ? "outline:2px solid #6366f1; outline-offset:1px;" : st === "error" ? "border-color:#ef4444;" : st === "disabled" ? "opacity:0.5; cursor:not-allowed;" : ""} }`,
        accessibility: { focusVisible: st === "focus", aria: ["aria-invalid=" + (st === "error" ? "true" : "false")] },
        conflicts: ["component:form-state", `form-state:${st}`],
        family: "minimal-flat",
        meta: { type: f.t, state: st },
      });
    }
  }

  // ===== Tables =====
  const tableTypes = [
    { t: "simple", desc: "Simple data table with header row and uniform cells — clean baseline for tabular data without distraction.", payload: "w-full border-collapse", css: ".table-simple { width:100%; border-collapse:collapse; }" },
    { t: "striped", desc: "Striped table with alternating row backgrounds — improves row scannability for long lists, classic admin pattern.", payload: "w-full [&>tbody>tr:nth-child(even)]:bg-zinc-50", css: ".table-striped { width:100%; } .table-striped tbody tr:nth-child(even) { background:#fafafa; }" },
    { t: "bordered", desc: "Bordered table with full grid lines — emphasises cell boundaries for dense data tables and financial reports.", payload: "w-full border border-zinc-200 [&>*>tr>td]:border [&>*>tr>td]:p-3", css: ".table-bordered { width:100%; border:1px solid #e4e4e7; } .table-bordered td, .table-bordered th { border:1px solid #e4e4e7; padding:12px; }" },
    { t: "sticky-header", desc: "Sticky-header table with the thead pinned during vertical scroll — essential for long data tables in admin panels.", payload: "w-full [&>thead]:sticky [&>thead]:top-0 [&>thead]:bg-zinc-50", css: ".table-sticky { width:100%; } .table-sticky thead { position:sticky; top:0; background:#fafafa; }" },
    { t: "data-dense", desc: "Dense data table with tight 8px row padding — maximises rows per viewport for power-user analytics interfaces.", payload: "w-full text-sm [&>*>tr>td]:px-2 [&>*>tr>td]:py-1", css: ".table-dense { width:100%; font-size:13px; } .table-dense td { padding:4px 8px; }" },
    { t: "comfortable", desc: "Comfortable table with generous 16px row padding — breathable pattern for user-facing lists with low row counts.", payload: "w-full [&>*>tr>td]:px-4 [&>*>tr>td]:py-4", css: ".table-comfortable { width:100%; } .table-comfortable td { padding:16px; }" },
    { t: "sortable", desc: "Sortable table with clickable header indicators — adds ascending/descending arrows showing current sort state.", payload: "w-full [&>thead>tr>th]:cursor-pointer [&>thead>tr>th]:select-none", css: ".table-sortable thead th { cursor:pointer; user-select:none; }" },
    { t: "responsive-cards", desc: "Responsive table that transforms to stacked cards on mobile — preserves accessibility on small screens.", payload: "w-full md:table hidden", css: "@media (max-width:768px) { .table-responsive { display:block; } .table-responsive tr { display:block; padding:12px; border:1px solid #e4e4e7; border-radius:8px; margin-bottom:8px; } }" },
  ];
  for (const t of tableTypes) {
    add({
      name: `${t.t} table`,
      semantic_description: t.desc,
      tags: ["table", "data", t.t, "grid"],
      payload: t.payload,
      css: t.css,
      html: `<table class="table-${t.t}"><thead><tr><th>Col</th></tr></thead><tbody><tr><td>data</td></tr></tbody></table>`,
      accessibility: { aria: ["role=table"], focusVisible: t.t === "sortable" },
      conflicts: ["component:table", `table:${t.t}`],
      family: "minimal-flat",
      meta: { type: t.t },
    });
  }

  // ===== Accordions, tabs, tooltips, dropdowns =====
  const disclosureTypes = [
    { t: "accordion-single", desc: "Single-open accordion — only one panel expands at a time, collapsible FAQ pattern.", cat: "accordion" },
    { t: "accordion-multi", desc: "Multi-open accordion — multiple panels can expand simultaneously, useful for settings panels and complex FAQs.", cat: "accordion" },
    { t: "accordion-nested", desc: "Nested accordion with child panels inside parent panels — hierarchical disclosure for navigation and complex FAQs.", cat: "accordion" },
    { t: "tabs-horizontal", desc: "Horizontal tabs with tab list above the panel — canonical tab pattern for organizing content into sections.", cat: "tabs" },
    { t: "tabs-vertical", desc: "Vertical tabs with tab list on the left and panel on the right — pattern for settings pages and complex configurators.", cat: "tabs" },
    { t: "tabs-pill", desc: "Pill-style tabs with rounded active indicator — soft, modern alternative to underline tabs.", cat: "tabs" },
    { t: "tabs-underline", desc: "Underline tabs with bottom-border active indicator — minimal, content-first tab pattern.", cat: "tabs" },
    { t: "tooltip-top", desc: "Tooltip appearing above the trigger on hover — small label clarifying an icon or truncated text.", cat: "tooltip" },
    { t: "tooltip-bottom", desc: "Tooltip appearing below the trigger on hover — alternative positioning for triggers near the top of the viewport.", cat: "tooltip" },
    { t: "tooltip-light", desc: "Light tooltip with white background and subtle shadow — soft tooltip variant for light-mode interfaces.", cat: "tooltip" },
    { t: "tooltip-dark", desc: "Dark tooltip with black background and white text — high-contrast, classic tooltip style.", cat: "tooltip" },
    { t: "dropdown-menu", desc: "Dropdown menu triggered by a button — vertical list of actions or navigation links revealed on click.", cat: "dropdown" },
    { t: "dropdown-context", desc: "Context dropdown menu triggered by right-click — actions relevant to the clicked element, IDE-style pattern.", cat: "dropdown" },
    { t: "dropdown-cascading", desc: "Cascading dropdown menu with nested submenus — multi-level navigation pattern for complex apps.", cat: "dropdown" },
    { t: "dropdown-segmented", desc: "Segmented dropdown with grouped options separated by dividers — pattern for action menus with logical groupings.", cat: "dropdown" },
  ];
  for (const d of disclosureTypes) {
    add({
      name: `${d.t}`,
      semantic_description: d.desc,
      tags: [d.cat, "disclosure", d.t, "interactive"],
      payload: `${d.cat} ${d.cat}-${d.t}`,
      css: `.${d.cat}-${d.t} { display:flex; flex-direction:column; }`,
      html: `<div class="${d.cat}-${d.t}" role="${d.cat === "tabs" ? "tablist" : d.cat === "tooltip" ? "tooltip" : "menu"}"><button>trigger</button><div>panel</div></div>`,
      accessibility: { aria: d.cat === "tabs" ? ["role=tablist", "role=tab", "aria-selected"] : d.cat === "accordion" ? ["aria-expanded", "aria-controls"] : ["role=menu", "aria-haspopup"], focusVisible: true },
      conflicts: ["component:" + d.cat, `${d.cat}:${d.t}`],
      family: "minimal-flat",
      meta: { type: d.t, category: d.cat },
    });
  }

  // ===== Badges, alerts, avatars, progress, skeletons =====
  const feedbackTypes = [
    { t: "badge-default", desc: "Default badge — small pill-shaped label for tagging, statuses, and counts.", family: "minimal-flat", payload: "inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-zinc-100 text-zinc-700" },
    { t: "badge-success", desc: "Success badge — green pill communicating a positive status like 'completed' or 'active'.", family: "minimal-flat", payload: "inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700" },
    { t: "badge-warning", desc: "Warning badge — amber pill communicating a cautionary status like 'pending' or 'review'.", family: "minimal-flat", payload: "inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700" },
    { t: "badge-danger", desc: "Danger badge — red pill communicating an error or critical status.", family: "minimal-flat", payload: "inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700" },
    { t: "badge-info", desc: "Info badge — blue pill communicating a neutral informational status.", family: "minimal-flat", payload: "inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700" },
    { t: "badge-dot", desc: "Dot badge — small colored dot indicator with optional label for live status indicators.", family: "minimal-flat", payload: "inline-flex items-center gap-1.5 text-xs" },
    { t: "badge-count", desc: "Count badge — small circular numeric badge for unread counts and notifications.", family: "minimal-flat", payload: "inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs rounded-full bg-red-500 text-white" },
    { t: "alert-info", desc: "Info alert — banner-style message with blue accent for neutral informational notices.", family: "minimal-flat", payload: "flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-900" },
    { t: "alert-success", desc: "Success alert — green-accented banner confirming a successful action.", family: "minimal-flat", payload: "flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200 text-green-900" },
    { t: "alert-warning", desc: "Warning alert — amber-accented banner flagging a potential issue requiring attention.", family: "minimal-flat", payload: "flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900" },
    { t: "alert-danger", desc: "Danger alert — red-accented banner communicating an error or critical issue.", family: "minimal-flat", payload: "flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-900" },
    { t: "alert-dismissible", desc: "Dismissible alert with a close button — banner that the user can dismiss after reading.", family: "minimal-flat", payload: "flex items-start gap-3 p-4 rounded-lg bg-zinc-50 border" },
    { t: "avatar-round", desc: "Round avatar — circular user-image placeholder used for profile pictures and user mentions.", family: "minimal-flat", payload: "w-10 h-10 rounded-full bg-zinc-200 overflow-hidden" },
    { t: "avatar-square", desc: "Square avatar — rounded-square user-image variant for content cards and comment threads.", family: "minimal-flat", payload: "w-10 h-10 rounded-md bg-zinc-200 overflow-hidden" },
    { t: "avatar-group", desc: "Avatar group — overlapping stacked avatars showing multiple participants with a +N overflow indicator.", family: "minimal-flat", payload: "flex -space-x-2" },
    { t: "avatar-status", desc: "Avatar with status indicator — small colored dot overlay showing online/idle/offline presence.", family: "minimal-flat", payload: "relative w-10 h-10 rounded-full" },
    { t: "progress-bar", desc: "Linear progress bar — horizontal fill showing completion percentage for deterministic tasks.", family: "minimal-flat", payload: "w-full h-2 bg-zinc-200 rounded-full overflow-hidden" },
    { t: "progress-circular", desc: "Circular progress indicator — ring-shaped spinner showing percentage or indeterminate loading.", family: "minimal-flat", payload: "w-10 h-10 rounded-full border-4 border-zinc-200 border-t-blue-500 animate-spin" },
    { t: "progress-stepped", desc: "Stepped progress indicator — segmented horizontal bar showing current step in a multi-step flow.", family: "minimal-flat", payload: "flex gap-2" },
    { t: "skeleton-block", desc: "Block skeleton — gray placeholder rectangle for loading content blocks before data arrives.", family: "minimal-flat", payload: "bg-zinc-200 rounded animate-pulse h-24" },
    { t: "skeleton-text", desc: "Text skeleton — gray placeholder lines simulating paragraph text during loading.", family: "minimal-flat", payload: "space-y-2" },
    { t: "skeleton-avatar", desc: "Avatar skeleton — circular gray placeholder for avatar images during loading.", family: "minimal-flat", payload: "w-10 h-10 rounded-full bg-zinc-200 animate-pulse" },
    { t: "skeleton-card", desc: "Card skeleton — composite placeholder simulating an entire card layout during loading.", family: "minimal-flat", payload: "p-6 border border-zinc-200 rounded-lg space-y-3" },
  ];
  for (const f of feedbackTypes) {
    add({
      name: f.t,
      semantic_description: f.desc,
      tags: [f.t.split("-")[0], "feedback", "indicator"],
      payload: f.payload,
      css: `.${f.t.replace(/-/g, "_")} { ${f.payload.split(" ").filter(t => t.includes(":") || t.includes("/")).join("; ")} }`,
      html: `<div class="${f.t.replace(/-/g, "_")}">${f.t.includes("badge") ? "label" : f.t.includes("alert") ? "message" : f.t.includes("avatar") ? "img" : ""}</div>`,
      accessibility: f.t.includes("progress") ? { aria: ["role=progressbar", "aria-valuenow", "aria-valuemin", "aria-valuemax"], focusVisible: false } : f.t.includes("alert") ? { aria: ["role=alert"], focusVisible: false } : { aria: [], focusVisible: false },
      conflicts: ["component:" + f.t.split("-")[0], `${f.t.split("-")[0]}:${f.t}`],
      family: f.family,
      meta: { type: f.t },
    });
  }

  // ===== Breadcrumbs, pagination, carousels, chips, command palette =====
  const navComponents = [
    { t: "breadcrumb-simple", desc: "Simple breadcrumb trail — slash-separated path showing the user's location in the site hierarchy.", payload: "flex items-center gap-2 text-sm text-zinc-500" },
    { t: "breadcrumb-chevron", desc: "Chevron-separated breadcrumb — modern variant using chevron icons as separators for clearer visual hierarchy.", payload: "flex items-center gap-1 text-sm text-zinc-500" },
    { t: "pagination-numbered", desc: "Numbered pagination — page-number buttons with prev/next arrows for paginated list navigation.", payload: "flex items-center gap-1" },
    { t: "pagination-load-more", desc: "Load-more pagination — single button appending the next page, common in infinite-scroll-style feeds.", payload: "flex justify-center" },
    { t: "pagination-infinite", desc: "Infinite scroll pagination — automatic loading triggered by scroll position, no explicit controls.", payload: "min-h-screen" },
    { t: "carousel-default", desc: "Default image carousel — slide-based image viewer with prev/next arrows and dot indicators.", payload: "relative overflow-hidden rounded-lg" },
    { t: "carousel-fade", desc: "Fade-transition carousel — slides cross-fade between each other for a softer, more elegant transition.", payload: "relative overflow-hidden" },
    { t: "carousel-thumbnails", desc: "Thumbnail carousel — main image with a row of clickable thumbnails below for direct navigation.", payload: "flex flex-col gap-3" },
    { t: "chip-default", desc: "Default chip — small rounded tag for filters, categories, and metadata labels.", payload: "inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-100 text-sm" },
    { t: "chip-removable", desc: "Removable chip — chip with an X button for dismissing filter selections.", payload: "inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-100 text-sm" },
    { t: "chip-selected", desc: "Selected chip — highlighted chip indicating an active filter selection, often filled with accent color.", payload: "inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500 text-white text-sm" },
    { t: "command-palette", desc: "Command palette — keyboard-triggered search-driven action launcher popularized by Linear and Raycast.", payload: "fixed inset-0 z-50 grid place-items-start pt-20 px-4 bg-black/50" },
    { t: "command-palette-item", desc: "Command palette item — single row in the palette list with icon, title, and optional shortcut hint.", payload: "flex items-center gap-3 px-4 py-2.5 rounded-md hover:bg-zinc-100 cursor-pointer" },
    { t: "search-bar", desc: "Search bar with input and submit button — full-width search form for content discovery.", payload: "flex w-full max-w-md" },
    { t: "filter-bar", desc: "Filter bar — horizontal row of filter chips and dropdowns for refining list results.", payload: "flex flex-wrap items-center gap-2" },
    { t: "toolbar", desc: "Toolbar — horizontal row of icon buttons and dividers for contextual actions on selected content.", payload: "flex items-center gap-1 p-2 bg-white border rounded-lg" },
  ];
  for (const c of navComponents) {
    add({
      name: c.t,
      semantic_description: c.desc,
      tags: [c.t.split("-")[0], "navigation", "interactive"],
      payload: c.payload,
      css: `.${c.t.replace(/-/g, "_")} { display:flex; align-items:center; }`,
      html: `<div class="${c.t.replace(/-/g, "_")}">${c.t.includes("breadcrumb") ? "Home / Page" : c.t.includes("pagination") ? "1 2 3" : c.t.includes("carousel") ? "slide" : c.t.includes("chip") ? "label" : c.t.includes("command") ? "cmd" : "content"}</div>`,
      accessibility: { aria: c.t.includes("carousel") ? ["role=region", "aria-roledescription=carousel"] : c.t.includes("breadcrumb") ? ["aria-label=Breadcrumb"] : c.t.includes("command") ? ["role=dialog", "aria-modal=true"] : [], focusVisible: true },
      conflicts: ["component:" + c.t.split("-")[0], `${c.t.split("-")[0]}:${c.t}`],
      family: "minimal-flat",
      meta: { type: c.t },
    });
  }

  // ===== Button 3-way combos: variant × size × state =====
  const comboStates = [
    { st: "hover-focus", desc: "Combined hover and focus state — the button's resting appearance shifts on cursor entry and shows a focus ring when keyboard-activated." },
    { st: "active-pressed", desc: "Active pressed state — the button visually depresses via scale-down confirming the click; pairs with the variant's color treatment." },
    { st: "disabled-muted", desc: "Disabled muted state — reduced opacity (50%) and no-pointer cursor communicate unavailability while preserving the variant's identity." },
  ];
  for (const v of btnVariants) {
    for (const sz of btnSizes) {
      for (const cs of comboStates) {
        add({
          name: `${v.v} ${sz.s} ${cs.st}`,
          semantic_description: `${v.desc} ${cs.desc} Size ${sz.s.toUpperCase()} (${sz.text} / ${sz.py}×${sz.px} / ${sz.radius} radius). ${pick(MOOD_POOL, n+1).charAt(0).toUpperCase() + pick(MOOD_POOL, n+1).slice(1)} and ${pick(INTENSITY_POOL, n+2)} for ${pick(USE_CASE_POOL, n+3)}.`,
          tags: ["button", v.v, sz.s, cs.st, "combination"],
          payload: `btn-${v.v}-${sz.s}-${cs.st}`,
          css: `.btn-${v.v}-${sz.s}-${cs.st} { display:inline-flex; align-items:center; gap:8px; padding:${sz.py} ${sz.px}; font-size:${sz.text}; border-radius:${sz.radius}; ${v.base.includes("bg-gradient") ? "background:linear-gradient(to right,#8b5cf6,#d946ef); color:#fff;" : v.base.includes("backdrop") ? "background:rgba(255,255,255,0.1); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.2); color:#fff;" : v.base.includes("bg-zinc-900") ? "background:#18181b; color:#fff;" : v.base.includes("bg-zinc-100") ? "background:#f4f4f5; color:#18181b;" : ""} transition:all .2s ease; cursor:pointer; }`,
          accessibility: { focusVisible: cs.st === "hover-focus", aria: ["role=button", "aria-label=Action"] },
          conflicts: ["component:button-combo", `btn-combo:${v.v}-${sz.s}-${cs.st}`],
          family: v.family,
          meta: { variant: v.v, size: sz.s, state: cs.st },
        });
      }
    }
  }

  // ===== Card × accent color variants =====
  const cardAccents = [
    { name: "brand", color: "#6366f1", desc: "brand-accented" },
    { name: "neutral", color: "#71717a", desc: "neutrally-accented" },
    { name: "success", color: "#22c55e", desc: "success-accented" },
    { name: "warning", color: "#f59e0b", desc: "warning-accented" },
  ];
  for (const c of cardTypes) {
    for (const a of cardAccents) {
      add({
        name: `${c.t} card ${a.name}`,
        semantic_description: `${c.desc} ${a.desc} variant with a ${a.color} accent border-top — color-codes the card for status communication. ${pick(MOOD_POOL, n+1).charAt(0).toUpperCase() + pick(MOOD_POOL, n+1).slice(1)} mood for ${pick(USE_CASE_POOL, n+2)}.`,
        tags: ["card", c.t, a.name, "accent"],
        payload: `card-${c.t} accent-${a.name}`,
        css: `.card-${c.t}.accent-${a.name} { border-top:3px solid ${a.color}; }`,
        conflicts: ["component:card-accent", `card-accent:${c.t}-${a.name}`],
        family: c.family,
        meta: { type: c.t, accent: a.name },
      });
    }
  }

  // ===== Form control × state × size =====
  const formSizes = [
    { s: "sm", py: "6px", px: "10px", text: "12px" },
    { s: "md", py: "8px", px: "12px", text: "14px" },
    { s: "lg", py: "12px", px: "16px", text: "16px" },
  ];
  for (const f of formControls) {
    for (const sz of formSizes) {
      add({
        name: `${f.t} ${sz.s}`,
        semantic_description: `${f.desc} ${sz.s.toUpperCase()} size variant with ${sz.py}/${sz.px} padding and ${sz.text} text — ${sz.s === "sm" ? "compact density for dense forms" : sz.s === "lg" ? "spacious touch-friendly size" : "balanced default"}. ${pick(MOOD_POOL, n+1).charAt(0).toUpperCase() + pick(MOOD_POOL, n+1).slice(1)} tone for ${pick(USE_CASE_POOL, n+2)}.`,
        tags: ["form", "input", f.t, sz.s, "size"],
        payload: `form-${f.t} form-${sz.s}`,
        css: `.form-${f.t}.form-${sz.s} { padding:${sz.py} ${sz.px}; font-size:${sz.text}; }`,
        accessibility: { focusVisible: true, aria: [] },
        conflicts: ["component:form-size", `form-size:${f.t}-${sz.s}`],
        family: "minimal-flat",
        meta: { type: f.t, size: sz.s },
      });
    }
  }

  // ===== Navbar × breakpoint variants =====
  const navBreakpoints = ["mobile", "tablet", "desktop"];
  for (const nv of navTypes) {
    for (const bp of navBreakpoints) {
      add({
        name: `${nv.t} navbar ${bp}`,
        semantic_description: `${nv.desc} Optimised for ${bp} breakpoint — ${bp === "mobile" ? "condensed height and hamburger trigger" : bp === "tablet" ? "intermediate sizing with expanded nav" : "full nav with all links visible"}.`,
        tags: ["navbar", nv.t, bp, "responsive"],
        payload: `nav-${nv.t} nav-${bp}`,
        css: `@media (max-width:${bp === "mobile" ? "768px" : bp === "tablet" ? "1024px" : "1280px"}) { .nav-${nv.t}.nav-${bp} { height:${bp === "mobile" ? "56px" : "64px"}; } }`,
        responsive: { mobile: bp === "mobile" ? "flex" : "hidden", tablet: bp === "tablet" ? "flex" : "hidden", desktop: bp === "desktop" ? "flex" : "hidden", behavior: "swap" },
        accessibility: { aria: ["role=navigation"], focusVisible: true },
        conflicts: ["component:navbar-bp", `nav-bp:${nv.t}-${bp}`],
        family: nv.family,
        meta: { type: nv.t, breakpoint: bp },
      });
    }
  }

  // ===== Modal × size variants =====
  const modalSizes = [
    { s: "sm", w: "320px", desc: "Small 320px modal for confirmations and quick alerts." },
    { s: "md", w: "480px", desc: "Medium 480px modal for forms and standard dialogs." },
    { s: "lg", w: "640px", desc: "Large 640px modal for complex forms and multi-step flows." },
    { s: "xl", w: "800px", desc: "Extra-large 800px modal for content-heavy dialogs and wizards." },
  ];
  for (const m of modalTypes) {
    for (const sz of modalSizes) {
      add({
        name: `${m.t} modal ${sz.s}`,
        semantic_description: `${m.desc} ${sz.s.toUpperCase()} size variant — ${sz.desc} ${pick(MOOD_POOL, n+1).charAt(0).toUpperCase() + pick(MOOD_POOL, n+1).slice(1)} tone for ${pick(USE_CASE_POOL, n+2)}.`,
        tags: ["modal", m.t, sz.s, "size"],
        payload: `modal-${m.t} modal-${sz.s}`,
        css: `.modal-${m.t}.modal-${sz.s} > .modal-inner { width:${sz.w}; max-width:90vw; }`,
        accessibility: { aria: ["role=dialog", "aria-modal=true"], focusVisible: true },
        conflicts: ["component:modal-size", `modal-size:${m.t}-${sz.s}`],
        family: m.family,
        meta: { type: m.t, size: sz.s, width: sz.w },
      });
    }
  }

  // ===== Feedback × size variants =====
  for (const f of feedbackTypes) {
    for (const sz of ["sm", "lg"]) {
      add({
        name: `${f.t} ${sz}`,
        semantic_description: `${f.desc} ${sz.toUpperCase()} size variant — ${sz === "sm" ? "compact density for inline use" : "large prominent size for hero callouts"}. ${pick(MOOD_POOL, n+1).charAt(0).toUpperCase() + pick(MOOD_POOL, n+1).slice(1)} mood for ${pick(USE_CASE_POOL, n+2)}.`,
        tags: [f.t.split("-")[0], "feedback", sz, "size"],
        payload: `${f.t} size-${sz}`,
        css: `.${f.t.replace(/-/g, "_")}.size-${sz} { font-size:${sz === "sm" ? "12px" : "16px"}; padding:${sz === "sm" ? "8px 12px" : "16px 20px"}; }`,
        conflicts: ["component:feedback-size", `feedback-size:${f.t}-${sz}`],
        family: f.family,
        meta: { type: f.t, size: sz },
      });
    }
  }

  // ===== Disclosure × variant =====
  for (const d of disclosureTypes) {
    for (const variant of ["minimal", "filled"]) {
      add({
        name: `${d.t} ${variant}`,
        semantic_description: `${d.desc} ${variant === "minimal" ? "Minimal variant with no background — clean, content-first appearance for inline use." : "Filled variant with subtle background tint — emphasises the disclosure region for primary navigation."}`,
        tags: [d.cat, d.t, variant],
        payload: `${d.cat}-${d.t} variant-${variant}`,
        css: `.${d.cat}-${d.t}.variant-${variant} { ${variant === "filled" ? "background:#f4f4f5; padding:8px;" : ""} }`,
        accessibility: { aria: d.cat === "tabs" ? ["role=tablist"] : ["aria-expanded"], focusVisible: true },
        conflicts: ["component:" + d.cat + "-variant", `${d.cat}-variant:${d.t}-${variant}`],
        family: "minimal-flat",
        meta: { type: d.t, variant },
      });
    }
  }

  return out;
}

/* ----------------------------- STYLES ----------------------------- */
function buildStyles(): LexiconEntry[] {
  const out: LexiconEntry[] = [];
  let n = 0;
  const add = (e: Omit<LexiconEntry, "id" | "category">) => {
    n++;
    out.push({ id: `styles.${pad(n)}`, category: "styles", ...e });
  };

  // ===== Color palettes =====
  const palettes: Array<{ name: string; fg: string; bg: string; accent: string; muted: string; family: string; desc: string; contrast: number }> = [
    { name: "Warm Sand", fg: "#3d2c1e", bg: "#f4ead5", accent: "#c9822e", muted: "#a89678", family: "minimal-flat",
      desc: "Warm sand palette with a creamy beige background, deep espresso foreground, and terracotta accent — earthy, organic mood for lifestyle and wellness brands. Comforting and grounded.", contrast: 9.2 },
    { name: "Mint Frost", fg: "#0d2818", bg: "#e3f5ea", accent: "#22a06b", muted: "#7ab59a", family: "minimal-flat",
      desc: "Mint frost palette with a pale green background, deep forest foreground, and emerald accent — fresh, clean, optimistic. Suits fintech and health apps.", contrast: 11.4 },
    { name: "Electric Lime", fg: "#0a0a0a", bg: "#f0ff4d", accent: "#000000", muted: "#7a8033", family: "neon",
      desc: "Electric lime palette with a vivid yellow-green background and pure black foreground — high-energy, attention-grabbing. Pairs with brutalist and Y2K-revival aesthetics.", contrast: 14.1 },
    { name: "Midnight Violet", fg: "#f4f0ff", bg: "#1a0f2e", accent: "#a855f7", muted: "#6b5b95", family: "aurora",
      desc: "Midnight violet palette with a deep purple background, lavender foreground, and violet accent — moody, premium, futuristic. Ideal for AI products and creative tools.", contrast: 12.8 },
    { name: "Terracotta", fg: "#3a1a0d", bg: "#f5e1d3", accent: "#c75d34", muted: "#a87b65", family: "minimal-flat",
      desc: "Terracotta palette with a peach-clay background, deep brown foreground, and burnt-orange accent — warm, artisanal, mediterranean feel for food and travel brands.", contrast: 9.8 },
    { name: "Cyber Peach", fg: "#1a0a1f", bg: "#ffd6c2", accent: "#ff3d8b", muted: "#c292a8", family: "neon",
      desc: "Cyber peach palette with a soft peach background, near-black foreground, and hot-pink accent — playful 2025 cyber-feminine aesthetic for fashion and beauty.", contrast: 11.2 },
    { name: "Slate Mono", fg: "#0f172a", bg: "#f1f5f9", accent: "#0ea5e9", muted: "#64748b", family: "minimal-flat",
      desc: "Slate mono palette with a pale slate background, near-black foreground, and sky-blue accent — neutral, professional, versatile. The safe default for SaaS dashboards.", contrast: 13.1 },
    { name: "Ocean Depth", fg: "#e0f2fe", bg: "#082f49", accent: "#06b6d4", muted: "#4a7c95", family: "aurora",
      desc: "Ocean depth palette with a deep navy background, pale cyan foreground, and turquoise accent — immersive, nautical, premium. Suits travel and analytics products.", contrast: 10.7 },
    { name: "Sunset Coral", fg: "#2d0a0a", bg: "#ffe4d6", accent: "#ff6b6b", muted: "#c89090", family: "aurora",
      desc: "Sunset coral palette with a warm peach background, dark plum foreground, and coral-red accent — radiant, optimistic, summery. Pairs with gradient hero sections.", contrast: 9.5 },
    { name: "Forest Moss", fg: "#0f1f0d", bg: "#e8efe0", accent: "#4a7c2e", muted: "#7a8a6b", family: "minimal-flat",
      desc: "Forest moss palette with a pale sage background, deep green foreground, and olive accent — organic, natural, calming. Suits sustainability and outdoor brands.", contrast: 10.3 },
    { name: "Cyberpunk Neon", fg: "#f0f4ff", bg: "#0a0118", accent: "#ff00ff", muted: "#5a4a8a", family: "neon",
      desc: "Cyberpunk neon palette with a near-black background, off-white foreground, and electric magenta accent — high-contrast futuristic aesthetic for gaming and dev tools.", contrast: 13.5 },
    { name: "Pastel Dream", fg: "#3d2a4d", bg: "#fef3f9", accent: "#f9a8d4", muted: "#c4a4c4", family: "minimal-flat",
      desc: "Pastel dream palette with a pale pink background, deep mauve foreground, and rose accent — soft, romantic, dreamy. Pairs with glassmorphism and illustrations.", contrast: 8.9 },
    { name: "Brutalist Yellow", fg: "#000000", bg: "#fef200", accent: "#000000", muted: "#7a7a00", family: "brutalist",
      desc: "Brutalist yellow palette with a saturated yellow background, pure black foreground, and black accent — bold, raw, contrast-maximized. The defining neo-brutalist 2025 palette.", contrast: 16.8 },
    { name: "Glass Aurora", fg: "#f0f4ff", bg: "#1e1b4b", accent: "#22d3ee", muted: "#6366f1", family: "glassmorphism",
      desc: "Glass aurora palette with a deep indigo background, pale lavender foreground, and cyan accent — premium glassmorphism pairing with multi-color glow effects.", contrast: 11.6 },
    { name: "Vintage Cream", fg: "#3a2818", bg: "#f5ead3", accent: "#8b4513", muted: "#a89580", family: "vintage",
      desc: "Vintage cream palette with an aged-paper background, sepia foreground, and saddle-brown accent — nostalgic, print-inspired, editorial. Suits long-form articles.", contrast: 9.1 },
    { name: "Soft-ui Light", fg: "#2d3748", bg: "#e6e9f0", accent: "#6c8ebf", muted: "#a0aec0", family: "neumorphism",
      desc: "Soft-UI light palette with a pale gray-blue background, dark slate foreground, and muted blue accent — pairs with neumorphic shadows for tactile soft surfaces.", contrast: 10.2 },
  ];
  for (const p of palettes) {
    add({
      name: `${p.name} palette`,
      semantic_description: p.desc,
      tags: ["palette", "color", p.name.toLowerCase().replace(/\s+/g, "-")],
      payload: `palette-${p.name.toLowerCase().replace(/\s+/g, "-")} text-[${p.fg}] bg-[${p.bg}] accent-[${p.accent}]`,
      css: `:root { --color-fg:${p.fg}; --color-bg:${p.bg}; --color-accent:${p.accent}; --color-muted:${p.muted}; }`,
      accessibility: { contrastRatio: p.contrast },
      conflicts: ["color:palette", `palette:${p.name.toLowerCase().replace(/\s+/g, "-")}`],
      family: p.family,
      meta: { fg: p.fg, bg: p.bg, accent: p.accent, contrast: p.contrast },
    });
    // Per-role entries
    add({
      name: `${p.name} background`,
      semantic_description: `${p.bg} background color from the ${p.name} palette — ${p.desc.split("—")[1] || "distinctive surface tone"}.`,
      tags: ["background", "color", p.name.toLowerCase().replace(/\s+/g, "-")],
      payload: `bg-[${p.bg}]`,
      css: `.bg-${p.name.toLowerCase().replace(/\s+/g, "-")} { background-color:${p.bg}; }`,
      accessibility: { contrastRatio: p.contrast },
      conflicts: ["color:background", `palette:${p.name.toLowerCase().replace(/\s+/g, "-")}`],
      family: p.family,
      meta: { color: p.bg, role: "background" },
    });
    add({
      name: `${p.name} foreground`,
      semantic_description: `${p.fg} foreground color from the ${p.name} palette — primary text and icon color. ${p.desc.split("—")[0]}.`,
      tags: ["foreground", "color", "text", p.name.toLowerCase().replace(/\s+/g, "-")],
      payload: `text-[${p.fg}]`,
      css: `.text-${p.name.toLowerCase().replace(/\s+/g, "-")} { color:${p.fg}; }`,
      accessibility: { contrastRatio: p.contrast },
      conflicts: ["color:foreground", `palette:${p.name.toLowerCase().replace(/\s+/g, "-")}`],
      family: p.family,
      meta: { color: p.fg, role: "foreground" },
    });
    add({
      name: `${p.name} accent`,
      semantic_description: `${p.accent} accent color from the ${p.name} palette — for CTAs, links, and highlights. ${p.desc.split("—")[1] || ""}.`,
      tags: ["accent", "color", "cta", p.name.toLowerCase().replace(/\s+/g, "-")],
      payload: `text-[${p.accent}] bg-[${p.accent}]`,
      css: `.accent-${p.name.toLowerCase().replace(/\s+/g, "-")} { color:${p.accent}; } .accent-bg-${p.name.toLowerCase().replace(/\s+/g, "-")} { background-color:${p.accent}; }`,
      accessibility: { contrastRatio: p.contrast * 0.7 },
      conflicts: ["color:accent", `palette:${p.name.toLowerCase().replace(/\s+/g, "-")}`],
      family: p.family,
      meta: { color: p.accent, role: "accent" },
    });
    add({
      name: `${p.name} muted`,
      semantic_description: `${p.muted} muted color from the ${p.name} palette — for secondary text and disabled states. Subdued tone preserving harmony.`,
      tags: ["muted", "color", "secondary", p.name.toLowerCase().replace(/\s+/g, "-")],
      payload: `text-[${p.muted}]`,
      css: `.muted-${p.name.toLowerCase().replace(/\s+/g, "-")} { color:${p.muted}; }`,
      accessibility: { contrastRatio: p.contrast * 0.5 },
      conflicts: ["color:muted", `palette:${p.name.toLowerCase().replace(/\s+/g, "-")}`],
      family: p.family,
      meta: { color: p.muted, role: "muted" },
    });
  }

  // ===== Gradients =====
  const gradientTypes = ["linear", "radial", "conic", "mesh", "aurora"];
  const gradientThemes: Array<{ name: string; colors: string[]; family: string; desc: string }> = [
    { name: "Sunset", colors: ["#ff6b6b", "#feca57", "#ff9ff3"], family: "aurora",
      desc: "Sunset gradient blending coral, amber, and pink — radiant, warm, end-of-day mood for hero sections and CTA backgrounds." },
    { name: "Ocean Depth", colors: ["#0c4a6e", "#0891b2", "#06b6d4"], family: "aurora",
      desc: "Ocean depth gradient flowing from deep navy through teal to bright cyan — immersive, nautical, refreshing." },
    { name: "Cyberpunk", colors: ["#ff00ff", "#00ffff", "#7c3aed"], family: "neon",
      desc: "Cyberpunk gradient mixing magenta, cyan, and violet — high-contrast, futuristic, neon-glow aesthetic for gaming and dev tools." },
    { name: "Pastel Dream", colors: ["#fbcfe8", "#c7d2fe", "#bbf7d0"], family: "minimal-flat",
      desc: "Pastel dream gradient blending pink, lavender, and mint — soft, romantic, dreamy. Pairs with illustrations and glassmorphism." },
    { name: "Aurora Borealis", colors: ["#10b981", "#06b6d4", "#8b5cf6"], family: "aurora",
      desc: "Aurora borealis gradient flowing from emerald through cyan to violet — ethereal, cosmic, northern-lights inspired for premium hero sections." },
    { name: "Peach Coral", colors: ["#fef3c7", "#fdba74", "#fb7185"], family: "aurora",
      desc: "Peach coral gradient transitioning from cream through peach to rose — warm, inviting, summery. Suits lifestyle and beauty brands." },
    { name: "Midnight Violet", colors: ["#1e1b4b", "#5b21b6", "#9333ea"], family: "aurora",
      desc: "Midnight violet gradient flowing from deep indigo through purple to bright violet — moody, premium, futuristic for AI products." },
    { name: "Electric Lime", colors: ["#bef264", "#84cc16", "#15803d"], family: "neon",
      desc: "Electric lime gradient from yellow-green to deep green — high-energy, vibrant, eco-tech aesthetic." },
    { name: "Brutalist Yellow", colors: ["#fef200", "#fbbf24", "#000000"], family: "brutalist",
      desc: "Brutalist gradient from saturated yellow through amber to black — bold, raw, attention-grabbing for neo-brutalist 2025 designs." },
    { name: "Soft Pastel Mesh", colors: ["#fce7f3", "#ddd6fe", "#bfdbfe", "#fef9c3"], family: "minimal-flat",
      desc: "Soft pastel mesh gradient blending pink, lavender, blue, and yellow — multi-stop soft mesh for playful, dreamy backgrounds." },
    { name: "Moss Forest", colors: ["#1a2e1a", "#2d5016", "#4a7c2e"], family: "minimal-flat",
      desc: "Moss forest gradient flowing from dark green through forest to olive — organic, grounding, natural for sustainability brands." },
    { name: "Cyber Glitch", colors: ["#ff006e", "#fb5607", "#ffbe0b"], family: "neon",
      desc: "Cyber glitch gradient mixing magenta, orange, and yellow — dissonant, energetic, glitch-art inspired for experimental designs." },
  ];
  for (const t of gradientTypes) {
    for (const g of gradientThemes) {
      const angle = (gradientTypes.indexOf(t) * 45 + 90) % 360;
      add({
        name: `${g.name} ${t} gradient`,
        semantic_description: `${g.desc} Rendered as a ${t} gradient${t === "linear" ? ` at ${angle}°` : t === "radial" ? " from center outward" : t === "conic" ? " sweeping around center" : t === "mesh" ? " with multi-point color stops" : " with soft blurred color blobs"}.`,
        tags: ["gradient", t, g.name.toLowerCase().replace(/\s+/g, "-")],
        payload: `bg-gradient-to-${t === "linear" ? "r" : t === "radial" ? "br" : "r"} from-[${g.colors[0]}] via-[${g.colors[1]}] to-[${g.colors[2]}]`,
        css: t === "linear"
          ? `.grad-${g.name.toLowerCase().replace(/\s+/g, "-")}-${t} { background:linear-gradient(${angle}deg, ${g.colors.join(", ")}); }`
          : t === "radial"
          ? `.grad-${g.name.toLowerCase().replace(/\s+/g, "-")}-${t} { background:radial-gradient(circle at center, ${g.colors.join(", ")}); }`
          : t === "conic"
          ? `.grad-${g.name.toLowerCase().replace(/\s+/g, "-")}-${t} { background:conic-gradient(from 0deg at 50% 50%, ${g.colors.join(", ")}, ${g.colors[0]}); }`
          : t === "mesh"
          ? `.grad-${g.name.toLowerCase().replace(/\s+/g, "-")}-${t} { background:radial-gradient(at 0% 0%, ${g.colors[0]} 0px, transparent 50%), radial-gradient(at 100% 0%, ${g.colors[1]} 0px, transparent 50%), radial-gradient(at 50% 100%, ${g.colors[2]} 0px, transparent 50%); }`
          : `.grad-${g.name.toLowerCase().replace(/\s+/g, "-")}-${t} { background:radial-gradient(at 20% 20%, ${g.colors[0]} 0px, transparent 50%), radial-gradient(at 80% 30%, ${g.colors[1]} 0px, transparent 50%), radial-gradient(at 50% 80%, ${g.colors[2] || g.colors[0]} 0px, transparent 50%); filter:blur(40px); }`,
        conflicts: ["color:gradient", `gradient:${t}`],
        family: g.family,
        meta: { type: t, theme: g.name, colors: g.colors.length },
      });
    }
  }

  // ===== Shadows =====
  const shadowTypes: Array<{ t: string; family: string; desc: string; css: (blur: number, opacity: number, color: string) => string }> = [
    { t: "soft-diffuse", family: "glassmorphism",
      desc: (b, o) => `Soft diffuse ambient shadow with a large ${b}px blur radius and ${o}% opacity, casting a gentle elevation as if the element floats a few pixels above the surface. Ideal for cards and modal dialogs in light glassmorphism interfaces. Subtle, non-directional, no hard edge.`,
      css: (b, o, c) => `box-shadow:0 0 ${b}px rgba(${c}, ${o / 100});` },
    { t: "hard-drop", family: "brutalist",
      desc: (b, o) => `Hard drop shadow with zero blur and ${o}% opacity offset 4px, producing a crisp printed/sticker look reminiscent of brutalist neo-brutalist 2025 design. High contrast, sharp silhouette, flat aesthetic.`,
      css: (b, o, c) => `box-shadow:4px 4px 0 rgba(${c}, ${o / 100});` },
    { t: "layered-material", family: "material",
      desc: (b, o) => `Layered material shadow stacking two ambient+penumbra shadows at ${b}px blur, ${o}% opacity — the Google Material elevation pattern producing a tactile floating effect. Soft yet defined.`,
      css: (b, o, c) => `box-shadow:0 ${b/4}px ${b/2}px rgba(${c}, ${o/200}), 0 ${b/2}px ${b}px rgba(${c}, ${o/150});` },
    { t: "inner", family: "neumorphism",
      desc: (b, o) => `Inner shadow pressed ${b}px inward at ${o}% opacity — produces a carved-in, recessed appearance characteristic of neumorphic soft-UI. Element appears embedded in the surface rather than above it.`,
      css: (b, o, c) => `box-shadow:inset 0 ${b/8}px ${b/4}px rgba(${c}, ${o/100});` },
    { t: "neon-glow", family: "neon",
      desc: (b, o) => `Neon glow shadow at ${b}px blur and ${o}% opacity in an accent color — luminous outer glow characteristic of cyberpunk and gaming aesthetics. High-energy, futuristic, electric.`,
      css: (b, o, c) => `box-shadow:0 0 ${b}px rgba(${c}, ${o/100}), 0 0 ${b*2}px rgba(${c}, ${o/200});` },
    { t: "long", family: "minimal-flat",
      desc: (b, o) => `Long directional shadow at ${b}px blur and ${o}% opacity with strong vertical offset — produces a tall cast shadow suggesting low-angle lighting. Dramatic, editorial mood.`,
      css: (b, o, c) => `box-shadow:0 ${b}px ${b*2}px rgba(${c}, ${o/100});` },
    { t: "colored", family: "aurora",
      desc: (b, o) => `Colored shadow at ${b}px blur and ${o}% opacity using an accent hue — adds personality to elevation by tinting the shadow with brand color. Modern 2025 alternative to neutral gray shadows.`,
      css: (b, o, c) => `box-shadow:0 ${b/4}px ${b/2}px rgba(${c}, ${o/100});` },
    { t: "ambient-multi", family: "glassmorphism",
      desc: (b, o) => `Multi-layer ambient shadow stacking three soft shadows at ${b}px blur and ${o}% opacity — produces a sophisticated depth effect for premium glassmorphism. Airy, layered, three-dimensional.`,
      css: (b, o, c) => `box-shadow:0 ${b/8}px ${b/4}px rgba(${c}, ${o/300}), 0 ${b/4}px ${b/2}px rgba(${c}, ${o/200}), 0 ${b/2}px ${b}px rgba(${c}, ${o/150});` },
  ];
  const blurLevels = [4, 12, 24, 48];
  const opacityLevels = [15, 30, 50];
  const shadowColors = [
    { name: "neutral", rgb: "0, 0, 0" },
    { name: "violet", rgb: "139, 92, 246" },
    { name: "cyan", rgb: "34, 211, 238" },
    { name: "rose", rgb: "244, 63, 94" },
  ];
  for (const s of shadowTypes) {
    for (const blur of blurLevels) {
      for (const op of opacityLevels) {
        for (const col of shadowColors) {
          const fam = col.name === "neutral" ? s.family : col.name === "violet" || col.name === "cyan" || col.name === "rose" ? "neon" : s.family;
          add({
            name: `${s.t} ${col.name} ${blur}px/${op}%`,
            semantic_description: s.desc(blur, op, col.rgb),
            tags: ["shadow", s.t, col.name, "elevation"],
            payload: `shadow-${s.t} blur-${blur} op-${op} color-${col.name}`,
            css: `.shadow-${s.t}-${col.name}-${blur}-${op} { ${s.css(blur, op, col.rgb)} }`,
            conflicts: ["elevation:" + s.t, `shadow:${s.t}`, `shadow-color:${col.name}`],
            family: fam,
            meta: { type: s.t, blur, opacity: op, color: col.name },
          });
        }
      }
    }
  }

  // ===== Borders =====
  const borderStyles = ["solid", "dashed", "dotted", "double", "groove"];
  const borderWidths = [1, 2, 4, 8];
  const borderRadius: Array<{ name: string; value: string; family: string }> = [
    { name: "none", value: "0", family: "brutalist" },
    { name: "sm", value: "2px", family: "minimal-flat" },
    { name: "md", value: "6px", family: "minimal-flat" },
    { name: "lg", value: "8px", family: "minimal-flat" },
    { name: "xl", value: "12px", family: "minimal-flat" },
    { name: "2xl", value: "16px", family: "glassmorphism" },
    { name: "3xl", value: "24px", family: "claymorphism" },
    { name: "full", value: "9999px", family: "minimal-flat" },
  ];
  for (const bs of borderStyles) {
    for (const bw of borderWidths) {
      for (const br of borderRadius) {
        add({
          name: `${bs} ${bw}px border ${br.name} radius`,
          semantic_description: `${bs.charAt(0).toUpperCase() + bs.slice(1)} border ${bw}px wide with ${br.name === "full" ? "fully rounded pill ends" : `${br.value} corner radius`} — ${bs === "dashed" ? "intentional sketch-like" : bs === "dotted" ? "playful dotted" : bs === "double" ? "formal double-line" : bs === "groove" ? "engraved 3D groove" : "crisp solid"} edge treatment. ${pick(MOOD_POOL, n).charAt(0).toUpperCase() + pick(MOOD_POOL, n).slice(1)} mood for ${pick(USE_CASE_POOL, n+1)}.`,
          tags: ["border", bs, `width-${bw}`, `radius-${br.name}`],
          payload: `border-${bs} border-${bw} rounded-${br.name}`,
          css: `.border-${bs}-${bw}-${br.name} { border:${bw}px ${bs} currentColor; border-radius:${br.value}; }`,
          conflicts: ["border:" + bs, `border-width:${bw}`, `border-radius:${br.name}`],
          family: br.family,
          meta: { style: bs, width: bw, radius: br.name },
        });
      }
    }
  }
  // Gradient borders
  const gradBorderThemes = ["sunset", "ocean", "cyberpunk", "pastel", "aurora"];
  for (const theme of gradBorderThemes) {
    for (const br of borderRadius) {
      add({
        name: `gradient ${theme} border ${br.name} radius`,
        semantic_description: `Gradient ${theme} border using a ${br.name === "full" ? "fully rounded" : `${br.value}`} mask technique to render a multi-color edge. Modern 2025 alternative to solid borders; pairs with dark surfaces for vivid accent edges.`,
        tags: ["border", "gradient", theme, `radius-${br.name}`],
        payload: `border-gradient-${theme} rounded-${br.name}`,
        css: `.border-gradient-${theme}-${br.name} { position:relative; border-radius:${br.value}; } .border-gradient-${theme}-${br.name}::before { content:''; position:absolute; inset:0; padding:2px; border-radius:${br.value}; background:linear-gradient(45deg, #ff6b6b, #4ecdc4, #ffe66d); -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite:xor; mask-composite:exclude; }`,
        conflicts: ["border:gradient", `border-radius:${br.name}`],
        family: "aurora",
        meta: { type: "gradient", theme, radius: br.name },
      });
    }
  }

  // ===== Glassmorphism =====
  const glassTints = [
    { name: "white", color: "255, 255, 255", family: "glassmorphism" },
    { name: "dark", color: "0, 0, 0", family: "glassmorphism" },
    { name: "violet", color: "139, 92, 246", family: "glassmorphism" },
    { name: "cyan", color: "34, 211, 238", family: "glassmorphism" },
    { name: "rose", color: "244, 63, 94", family: "glassmorphism" },
    { name: "amber", color: "251, 191, 36", family: "glassmorphism" },
  ];
  const glassBlurs = [4, 8, 12, 16, 24, 32];
  const glassOpacities = [5, 10, 15, 20, 30];
  for (const t of glassTints) {
    for (const b of glassBlurs) {
      for (const o of glassOpacities) {
        add({
          name: `glass ${t.name} ${b}px/${o}%`,
          semantic_description: `${t.name === "white" ? "Frosted white" : t.name === "dark" ? "Dark tinted" : `${t.name.charAt(0).toUpperCase() + t.name.slice(1)}-tinted`} glassmorphism with a ${b}px backdrop blur and ${o}% opacity — ${b < 12 ? "subtle frosted" : b > 20 ? "heavily diffused" : "balanced frosted"} surface with the background softly visible through. ${o < 15 ? "Whispered, almost-clear" : o > 25 ? "Pronounced tinted" : "Balanced"} translucency typical of 2025 hero overlays and dashboard tiles.`,
          tags: ["glassmorphism", "glass", t.name, "blur", "translucent"],
          payload: `glass glass-${t.name} blur-${b} opacity-${o}`,
          css: `.glass-${t.name}-${b}-${o} { background:rgba(${t.color}, ${o / 100}); backdrop-filter:blur(${b}px); -webkit-backdrop-filter:blur(${b}px); }`,
          conflicts: ["surface:glass", `glass-tint:${t.name}`, `glass-blur:${b}`],
          family: "glassmorphism",
          meta: { tint: t.name, blur: b, opacity: o },
        });
      }
    }
  }

  // ===== Neumorphism =====
  const neumorphKinds = [
    { t: "extruded", desc: "Extruded neumorphic surface with dual directional shadows — element appears raised from the surface, soft-UI 2025 aesthetic." },
    { t: "inset", desc: "Inset neumorphic surface with dual inner shadows — element appears pressed into the surface, soft tactile alternative to inputs." },
    { t: "flat", desc: "Flat neumorphic surface with minimal shadows — subtle baseline for soft-UI backgrounds." },
  ];
  const neumorphTones = [
    { name: "light", bg: "#e6e9f0", dark: "#c5cad6", light: "#ffffff" },
    { name: "dark", bg: "#2d2d3d", dark: "#1a1a26", light: "#3d3d50" },
    { name: "warm", bg: "#e8dcc8", dark: "#c4b394", light: "#fdf5e6" },
    { name: "cool", bg: "#d8e0e8", dark: "#a8b8c8", light: "#f0f8ff" },
  ];
  for (const k of neumorphKinds) {
    for (const tone of neumorphTones) {
      add({
        name: `neumorph ${k.t} ${tone.name}`,
        semantic_description: `${k.desc} ${tone.name === "light" ? "Light" : tone.name === "dark" ? "Dark" : tone.name.charAt(0).toUpperCase() + tone.name.slice(1)} ${tone.name} tone with monochromatic shadow palette. Soft-UI 2025 pattern best on uniform backgrounds to preserve the extruded/inset illusion.`,
        tags: ["neumorphism", "soft-ui", k.t, tone.name],
        payload: `neumorph neumorph-${k.t} neumorph-${tone.name}`,
        css: k.t === "extruded"
          ? `.neumorph-extruded-${tone.name} { background:${tone.bg}; box-shadow:8px 8px 16px ${tone.dark}, -8px -8px 16px ${tone.light}; border-radius:16px; }`
          : k.t === "inset"
          ? `.neumorph-inset-${tone.name} { background:${tone.bg}; box-shadow:inset 8px 8px 16px ${tone.dark}, inset -8px -8px 16px ${tone.light}; border-radius:16px; }`
          : `.neumorph-flat-${tone.name} { background:${tone.bg}; box-shadow:4px 4px 8px ${tone.dark}, -4px -4px 8px ${tone.light}; border-radius:8px; }`,
        conflicts: ["surface:neumorphic", `neumorph-kind:${k.t}`, `neumorph-tone:${tone.name}`],
        family: "neumorphism",
        meta: { kind: k.t, tone: tone.name },
      });
    }
  }

  // ===== Claymorphism =====
  const clayColors = [
    { name: "pink", color: "#fce7f3", shadow: "#f9a8d4" },
    { name: "blue", color: "#dbeafe", shadow: "#93c5fd" },
    { name: "green", color: "#dcfce7", shadow: "#86efac" },
    { name: "yellow", color: "#fef9c3", shadow: "#fde047" },
    { name: "purple", color: "#f3e8ff", shadow: "#d8b4fe" },
    { name: "orange", color: "#ffedd5", shadow: "#fdba74" },
  ];
  for (const c of clayColors) {
    for (const radius of ["2xl", "3xl", "full"]) {
      add({
        name: `clay ${c.name} ${radius}`,
        semantic_description: `Claymorphic ${c.name} surface with a soft 3D clay look — pillowy rounded shape (${radius}) with inset highlights and shadows producing a tactile, marshmallow-like feel. Playful 2025 aesthetic.`,
        tags: ["claymorphism", "clay", "3d", c.name],
        payload: `clay clay-${c.name} rounded-${radius}`,
        css: `.clay-${c.name}-${radius} { background:${c.color}; border-radius:${radius === "full" ? "9999px" : radius === "3xl" ? "24px" : "16px"}; box-shadow:inset 0 -8px 16px ${c.shadow}, inset 0 8px 16px rgba(255,255,255,0.6), 0 4px 12px rgba(0,0,0,0.1); }`,
        conflicts: ["surface:clay", `clay-color:${c.name}`, `clay-radius:${radius}`],
        family: "claymorphism",
        meta: { color: c.name, radius },
      });
    }
  }

  // ===== Textures =====
  const textures = [
    { t: "noise-light", desc: "Subtle light noise texture overlaid on surfaces — adds film-grain-like organic quality to flat backgrounds, reducing banding on gradients.", family: "minimal-flat" },
    { t: "noise-strong", desc: "Strong noise texture producing a visible grain — vintage analog-film aesthetic for editorial and retro designs.", family: "vintage" },
    { t: "grain-paper", desc: "Paper-grain texture simulating recycled paper surfaces — warm, tactile, print-inspired for artisanal and editorial brands.", family: "vintage" },
    { t: "dotted-grid", desc: "Dotted grid texture with regular 24px spacing — subtle alignment aid reminiscent of design software canvas backdrops.", family: "minimal-flat" },
    { t: "line-grid", desc: "Line grid texture with thin 1px lines at 32px intervals — graph-paper feel for technical and engineering-themed designs.", family: "minimal-flat" },
    { t: "topographic", desc: "Topographic contour-line texture evoking elevation maps — organic, geographic feel for outdoor and adventure brands.", family: "minimal-flat" },
    { t: "carbon-fiber", desc: "Carbon-fiber weave texture — sleek, technical, performance-oriented pattern for automotive and tech-gadget brands.", family: "minimal-flat" },
    { t: "watercolor", desc: "Watercolor wash texture with soft pigment bleed — artistic, handcrafted feel for boutique and creative brands.", family: "vintage" },
    { t: "holographic", desc: "Holographic iridescent texture shifting through pastel spectrums — futuristic, Y2K-revival 2025 pattern for bold creative designs.", family: "neon" },
    { t: "marble", desc: "Marble vein texture with subtle gray striations — luxurious, classic, premium material aesthetic for high-end brands.", family: "minimal-flat" },
    { t: "concrete", desc: "Raw concrete texture with mottled gray variations — industrial, brutalist surface for urban and architectural designs.", family: "brutalist" },
    { t: "wood-grain", desc: "Wood-grain texture with warm directional striations — natural, organic, biophilic aesthetic for lifestyle brands.", family: "vintage" },
  ];
  for (const t of textures) {
    add({
      name: `${t.t} texture`,
      semantic_description: t.desc,
      tags: ["texture", t.t, "surface", "background"],
      payload: `texture texture-${t.t}`,
      css: `.texture-${t.t} { background-image:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9"/></filter><rect width="200" height="200" filter="url(%23n)" opacity="0.4"/></svg>'); }`,
      conflicts: ["surface:texture", `texture:${t.t}`],
      family: t.family,
      meta: { type: t.t },
    });
  }

  return out;
}

/* ----------------------------- TYPOGRAPHY ----------------------------- */
function buildTypography(): LexiconEntry[] {
  const out: LexiconEntry[] = [];
  let n = 0;
  const add = (e: Omit<LexiconEntry, "id" | "category">) => {
    n++;
    out.push({ id: `typography.${pad(n)}`, category: "typography", ...e });
  };

  // ===== Font stacks =====
  const fontStacks: Array<{ name: string; stack: string; family: string; desc: string }> = [
    { name: "System UI", stack: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", family: "minimal-flat",
      desc: "System UI font stack — uses the OS-native UI font (San Francisco on macOS, Segoe on Windows). Zero download, native feel, the most performant default." },
    { name: "Geist", stack: "'Geist', 'Geist Sans', system-ui, sans-serif", family: "minimal-flat",
      desc: "Geist font stack — Vercel's modern geometric sans-serif designed for UI and developer-tool contexts. Crisp, contemporary, 2025 default." },
    { name: "Inter", stack: "'Inter', system-ui, sans-serif", family: "minimal-flat",
      desc: "Inter font stack — Rasmus Andersson's UI-optimised sans-serif with screen-friendly hinting. Workhorse for SaaS dashboards since 2020." },
    { name: "Helvetica Neue", stack: "'Helvetica Neue', Helvetica, Arial, sans-serif", family: "minimal-flat",
      desc: "Helvetica Neue stack — classic Swiss grotesque. Neutral, timeless, corporate; the safe default when brand voice is restrained." },
    { name: "Serif Editorial", stack: "'Source Serif Pro', 'Georgia', 'Times New Roman', serif", family: "magazine",
      desc: "Editorial serif stack — for long-form article body text. Readable, print-inspired, sophisticated. Pairs with sans-serif headlines." },
    { name: "Mono Code", stack: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, monospace", family: "minimal-flat",
      desc: "Monospace font stack for code blocks — ligature-friendly developer fonts with consistent character widths. Crisp, technical, IDE-ready." },
    { name: "Display Sans", stack: "'Cal Sans', 'Space Grotesk', system-ui, sans-serif", family: "minimal-flat",
      desc: "Display sans stack — geometric, slightly condensed sans-serif tuned for large headline sizes. Modern, confident, marketing-ready." },
    { name: "Display Serif", stack: "'Playfair Display', 'Cormorant', Georgia, serif", family: "magazine",
      desc: "Display serif stack — high-contrast serif with elegant didone feel for fashion and luxury headlines. Sophisticated, editorial, premium." },
    { name: "Handwritten", stack: "'Caveat', 'Comic Sans MS', cursive", family: "vintage",
      desc: "Handwritten script stack — casual, friendly, marker-like. Suits playful annotations, personal-brand portfolios, and informal hero accents." },
    { name: "Variable Geist", stack: "'Geist Variable', system-ui, sans-serif", family: "minimal-flat",
      desc: "Variable Geist font with a single file covering all weights from 100 to 900 — enables smooth weight transitions and reduced payload. Modern 2025 pattern." },
    { name: "Kineto Slab", stack: "'Roberto Slab', 'IBM Plex Slab', serif", family: "magazine",
      desc: "Kineto-style slab serif — chunky rectangular serifs projecting confidence and stability. Editorial, 2025-revival pattern for bold headlines." },
    { name: "Geometric Grotesque", stack: "'Space Grotesk', 'Familjen Grotesk', sans-serif", family: "minimal-flat",
      desc: "Geometric grotesque stack — circular, modern sans-serif with technical character. Suits developer tools and design-system documentation." },
  ];
  for (const f of fontStacks) {
    add({
      name: `${f.name} font stack`,
      semantic_description: f.desc,
      tags: ["font", "stack", f.name.toLowerCase().replace(/\s+/g, "-")],
      payload: `font-${f.name.toLowerCase().replace(/\s+/g, "-")}`,
      css: `.font-${f.name.toLowerCase().replace(/\s+/g, "-")} { font-family:${f.stack}; }`,
      conflicts: ["font:stack", `font-family:${f.name.toLowerCase().replace(/\s+/g, "-")}`],
      family: f.family,
      meta: { stack: f.stack },
    });
  }

  // ===== Hierarchies =====
  const hierarchies: Array<{ tag: string; size: string; weight: number; lh: string; ls: string; desc: string }> = [
    { tag: "display", size: "72px", weight: 800, lh: "1.05", ls: "-0.03em", desc: "Display heading — oversized 72px, extrabold, tight tracking for hero headlines. Maximum visual impact, used once per page above the fold." },
    { tag: "display-sm", size: "56px", weight: 800, lh: "1.08", ls: "-0.025em", desc: "Smaller display variant — 56px, still bold and tight. For section openers and large feature headlines." },
    { tag: "h1", size: "48px", weight: 700, lh: "1.1", ls: "-0.02em", desc: "H1 — 48px, bold, tight tracking. Page-level primary heading, one per page for semantic structure." },
    { tag: "h2", size: "36px", weight: 700, lh: "1.15", ls: "-0.015em", desc: "H2 — 36px, bold. Section-level heading dividing major content blocks." },
    { tag: "h3", size: "28px", weight: 600, lh: "1.2", ls: "-0.01em", desc: "H3 — 28px, semibold. Subsection heading for grouping related content." },
    { tag: "h4", size: "22px", weight: 600, lh: "1.25", ls: "-0.005em", desc: "H4 — 22px, semibold. Card and module heading within subsections." },
    { tag: "h5", size: "18px", weight: 600, lh: "1.3", ls: "0", desc: "H5 — 18px, semibold. Inline section labels and sidebar group headings." },
    { tag: "h6", size: "16px", weight: 600, lh: "1.35", ls: "0", desc: "H6 — 16px, semibold. Smallest heading for minor groupings and footer columns." },
    { tag: "body-lg", size: "18px", weight: 400, lh: "1.6", ls: "0", desc: "Large body text — 18px, regular weight, relaxed 1.6 line-height for comfortable long-form reading." },
    { tag: "body", size: "16px", weight: 400, lh: "1.5", ls: "0", desc: "Default body text — 16px, regular weight, 1.5 line-height. The baseline for all paragraph content." },
    { tag: "body-sm", size: "14px", weight: 400, lh: "1.5", ls: "0", desc: "Small body text — 14px, regular weight. For secondary content, captions, and table data." },
    { tag: "caption", size: "12px", weight: 400, lh: "1.4", ls: "0.01em", desc: "Caption text — 12px, regular weight. For image captions, helper text, and metadata." },
    { tag: "overline", size: "12px", weight: 600, lh: "1.4", ls: "0.08em", desc: "Overline — 12px, semibold, wide letter-spacing. Uppercase eyebrow labels above headings for categorization." },
    { tag: "label", size: "14px", weight: 500, lh: "1.4", ls: "0", desc: "Form label — 14px, medium weight. For input labels and small UI text requiring slight emphasis." },
    { tag: "code", size: "14px", weight: 400, lh: "1.5", ls: "0", desc: "Inline code — 14px monospace for code snippets within body text. Distinguished by font-family, not weight." },
  ];
  for (const h of hierarchies) {
    add({
      name: `${h.tag} typography`,
      semantic_description: h.desc,
      tags: ["typography", "hierarchy", h.tag, "heading", "text"],
      payload: `text-${h.tag}`,
      css: `.text-${h.tag} { font-size:${h.size}; font-weight:${h.weight}; line-height:${h.lh}; letter-spacing:${h.ls}; }`,
      conflicts: ["typo:hierarchy", `typo-size:${h.tag}`],
      family: "minimal-flat",
      meta: { tag: h.tag, size: h.size, weight: h.weight, lineHeight: h.lh, letterSpacing: h.ls },
    });
    // Per-size responsive variant
    add({
      name: `${h.tag} responsive`,
      semantic_description: `${h.desc} Responsive variant scaling from a smaller mobile size up to the desktop ${h.size} via clamp() — fluid type that adapts to viewport.`,
      tags: ["typography", "responsive", "fluid", h.tag, "clamp"],
      payload: `text-${h.tag}-responsive`,
      css: `.text-${h.tag}-responsive { font-size:clamp(${parseInt(h.size) * 0.7}px, ${parseInt(h.size) * 0.5}vw, ${h.size}); font-weight:${h.weight}; line-height:${h.lh}; letter-spacing:${h.ls}; }`,
      responsive: { mobile: `text-[${parseInt(h.size) * 0.7}px]`, tablet: `text-[${parseInt(h.size) * 0.85}px]`, desktop: `text-[${h.size}]`, behavior: "scale" },
      conflicts: ["typo:hierarchy", `typo-size:${h.tag}-responsive`],
      family: "minimal-flat",
      meta: { tag: h.tag, fluid: true },
    });
  }

  // ===== Weights =====
  const weights = [
    { w: 100, name: "thin", desc: "Thin weight (100) — hairline strokes for oversized display type. Use sparingly; readability drops below 16px." },
    { w: 200, name: "extralight", desc: "Extra-light weight (200) — delicate, refined strokes for elegant display typography in luxury and fashion contexts." },
    { w: 300, name: "light", desc: "Light weight (300) — airy, modern strokes for large headlines and hero subhead text. Pairs with bold display weights." },
    { w: 400, name: "regular", desc: "Regular weight (400) — the default body text weight. Maximum readability for paragraph content at any size." },
    { w: 500, name: "medium", desc: "Medium weight (500) — slight emphasis without heaviness. For labels, buttons, and subtle emphasis within body text." },
    { w: 600, name: "semibold", desc: "Semibold weight (600) — moderate emphasis for subheadings, button labels, and important inline text." },
    { w: 700, name: "bold", desc: "Bold weight (700) — strong emphasis for headings and CTA labels. The workhorse display weight." },
    { w: 800, name: "extrabold", desc: "Extra-bold weight (800) — heavy display weight for hero headlines and impactful marketing copy." },
    { w: 900, name: "black", desc: "Black weight (900) — maximum stroke density for poster-style display type. Use only at large sizes." },
  ];
  for (const w of weights) {
    add({
      name: `weight ${w.name} (${w.w})`,
      semantic_description: w.desc,
      tags: ["typography", "weight", w.name, `weight-${w.w}`],
      payload: `font-weight-${w.w}`,
      css: `.font-weight-${w.w} { font-weight:${w.w}; }`,
      conflicts: ["typo:weight", `typo-weight:${w.w}`],
      family: "minimal-flat",
      meta: { weight: w.w, name: w.name },
    });
    // Variable font axis variant
    add({
      name: `variable weight ${w.name}`,
      semantic_description: `${w.desc} Variable-font axis variant — uses font-variation-settings 'wght' ${w.w} for smooth weight interpolation along the variable axis.`,
      tags: ["typography", "weight", w.name, "variable-font"],
      payload: `font-wght-${w.w}`,
      css: `.font-wght-${w.w} { font-variation-settings:'wght' ${w.w}; }`,
      conflicts: ["typo:weight", `typo-weight:${w.w}`],
      family: "minimal-flat",
      meta: { weight: w.w, variable: true },
    });
  }

  // ===== Line heights =====
  const lineHeights = [
    { v: "1", name: "none", desc: "Line height 1 — no extra space between lines. For display headings where tight stacking is intentional." },
    { v: "1.1", name: "tight", desc: "Tight line height 1.1 — minimal leading for large display type. Keeps headlines visually unified." },
    { v: "1.25", name: "snug", desc: "Snug line height 1.25 — slight breathing room for subheadings and large UI text." },
    { v: "1.4", name: "normal", desc: "Normal line height 1.4 — balanced for small headings and dense UI text." },
    { v: "1.5", name: "base", desc: "Base line height 1.5 — standard for body text, the readability default for paragraph content." },
    { v: "1.625", name: "relaxed", desc: "Relaxed line height 1.625 — comfortable for long-form article reading; reduces eye strain." },
    { v: "1.75", name: "loose", desc: "Loose line height 1.75 — generous spacing for legal text and accessibility-focused body copy." },
    { v: "2", name: "extra-loose", desc: "Extra-loose line height 2 — maximum leading for poetic or display use where breathing room is the point." },
  ];
  for (const lh of lineHeights) {
    add({
      name: `line-height ${lh.name}`,
      semantic_description: lh.desc,
      tags: ["typography", "line-height", lh.name],
      payload: `leading-${lh.name}`,
      css: `.leading-${lh.name} { line-height:${lh.v}; }`,
      conflicts: ["typo:line-height", `typo-leading:${lh.name}`],
      family: "minimal-flat",
      meta: { lineHeight: lh.v, name: lh.name },
    });
  }

  // ===== Letter spacing =====
  const letterSpacings = [
    { v: "-0.05em", name: "tighter", desc: "Tighter letter-spacing -0.05em — maximum condensation for oversized display headlines. Prevents letter-gaps at large sizes." },
    { v: "-0.025em", name: "tight", desc: "Tight letter-spacing -0.025em — slight condensation for display and h1 text. Modern, confident feel." },
    { v: "-0.01em", name: "snug", desc: "Snug letter-spacing -0.01em — subtle condensation for subheadings and large body text." },
    { v: "0", name: "normal", desc: "Normal letter-spacing 0 — default for body text. Optimal readability at default sizes." },
    { v: "0.025em", name: "wide", desc: "Wide letter-spacing 0.025em — slight expansion for labels and small UI text. Adds refinement." },
    { v: "0.05em", name: "wider", desc: "Wider letter-spacing 0.05em — moderate expansion for overlines and uppercase labels." },
    { v: "0.1em", name: "widest", desc: "Widest letter-spacing 0.1em — maximum expansion for caps-lock eyebrows and tracking-heavy labels." },
  ];
  for (const ls of letterSpacings) {
    add({
      name: `letter-spacing ${ls.name}`,
      semantic_description: ls.desc,
      tags: ["typography", "letter-spacing", ls.name, "tracking"],
      payload: `tracking-${ls.name}`,
      css: `.tracking-${ls.name} { letter-spacing:${ls.v}; }`,
      conflicts: ["typo:letter-spacing", `typo-tracking:${ls.name}`],
      family: "minimal-flat",
      meta: { letterSpacing: ls.v, name: ls.name },
    });
  }

  // ===== Fluid type scales =====
  const scales = [
    { ratio: 1.125, name: "minor-second", desc: "1.125 minor-second modular scale — slow, subtle progression. Suits content-dense admin panels." },
    { ratio: 1.2, name: "major-second", desc: "1.2 major-second modular scale — moderate progression. Balanced default for SaaS marketing sites." },
    { ratio: 1.25, name: "major-third", desc: "1.25 major-third modular scale — pronounced progression. Editorial and content-driven sites." },
    { ratio: 1.333, name: "perfect-fourth", desc: "1.333 perfect-fourth modular scale — strong progression. Classic typographic scale for editorial designs." },
    { ratio: 1.5, name: "perfect-fifth", desc: "1.5 perfect-fifth modular scale — dramatic progression. Bold display-driven marketing sites." },
    { ratio: 1.618, name: "golden", desc: "1.618 golden-ratio modular scale — harmonious, classical progression. Sophisticated, mathematical aesthetic." },
  ];
  for (const s of scales) {
    add({
      name: `modular scale ${s.name}`,
      semantic_description: s.desc,
      tags: ["typography", "scale", "modular", s.name],
      payload: `scale-${s.name}`,
      css: `:root { --scale-ratio:${s.ratio}; } .scale-${s.name} h1 { font-size:calc(1rem * pow(var(--scale-ratio), 5)); } .scale-${s.name} h2 { font-size:calc(1rem * pow(var(--scale-ratio), 4)); } .scale-${s.name} h3 { font-size:calc(1rem * pow(var(--scale-ratio), 3)); }`,
      conflicts: ["typo:scale", `typo-scale:${s.name}`],
      family: "minimal-flat",
      meta: { ratio: s.ratio, name: s.name },
    });
    // Fluid clamp variant for each scale
    const baseMin = 16;
    const baseMax = 20;
    for (let level = 1; level <= 5; level++) {
      const minSize = (baseMin * Math.pow(s.ratio, level)).toFixed(1);
      const maxSize = (baseMax * Math.pow(s.ratio, level)).toFixed(1);
      add({
        name: `${s.name} clamp h${level}`,
        semantic_description: `Fluid ${s.name} scale h${level} using clamp(${minSize}px, ${5 + level}vw, ${maxSize}px) — smoothly scales from mobile to desktop without media queries. Modern 2025 fluid-typography pattern.`,
        tags: ["typography", "fluid", "clamp", s.name, `h${level}`],
        payload: `clamp-${s.name}-h${level}`,
        css: `.clamp-${s.name}-h${level} { font-size:clamp(${minSize}px, ${5 + level}vw, ${maxSize}px); }`,
        responsive: { mobile: `text-[${minSize}px]`, tablet: `text-[${(parseFloat(minSize) + parseFloat(maxSize)) / 2}px]`, desktop: `text-[${maxSize}px]`, behavior: "scale" },
        conflicts: ["typo:scale", `typo-scale:${s.name}`, `typo-fluid:h${level}`],
        family: "minimal-flat",
        meta: { ratio: s.ratio, scale: s.name, level, min: minSize, max: maxSize },
      });
    }
  }

  // ===== Text effects =====
  const textEffects: Array<{ t: string; family: string; desc: string; css: string }> = [
    { t: "gradient-text", family: "aurora",
      desc: "Gradient text using background-clip:text to fill characters with a multi-color gradient. Modern 2025 hero-headline pattern for premium SaaS landings.",
      css: ".text-gradient { background:linear-gradient(135deg, #8b5cf6, #ec4899, #06b6d4); -webkit-background-clip:text; background-clip:text; color:transparent; }" },
    { t: "outline-text", family: "brutalist",
      desc: "Outline/stroke text using -webkit-text-stroke — transparent fill with colored outline. Bold brutalist pattern for poster-style headlines.",
      css: ".text-outline { -webkit-text-stroke:2px #000; color:transparent; }" },
    { t: "shadow-text", family: "minimal-flat",
      desc: "Text shadow adding depth — soft drop shadow beneath characters for subtle elevation. Use sparingly to preserve readability.",
      css: ".text-shadow { text-shadow:0 2px 4px rgba(0,0,0,0.2); }" },
    { t: "neon-text", family: "neon",
      desc: "Neon-glow text with luminous text-shadow halo in an accent color — cyberpunk aesthetic for gaming and dev-tool hero headlines.",
      css: ".text-neon { color:#22d3ee; text-shadow:0 0 10px rgba(34,211,238,0.8), 0 0 20px rgba(34,211,238,0.6), 0 0 30px rgba(34,211,238,0.4); }" },
    { t: "uppercase-tracking", family: "minimal-flat",
      desc: "Uppercase text with wide letter-spacing — eyebrow/overline pattern for category labels above headings.",
      css: ".text-uppercase-tracking { text-transform:uppercase; letter-spacing:0.1em; font-size:12px; font-weight:600; }" },
    { t: "kineto-variable", family: "kineto",
      desc: "Kineto variable-font text animating weight on hover — smooth interpolation from light to bold creating a kinetic typography effect. 2025 trend.",
      css: ".text-kineto { font-variation-settings:'wght' 300; transition:font-variation-settings .4s ease; } .text-kineto:hover { font-variation-settings:'wght' 800; }" },
    { t: "3d-extruded", family: "brutalist",
      desc: "3D extruded text using stacked text-shadows to simulate depth — chunky, poster-style headline effect.",
      css: ".text-3d { color:#fef200; text-shadow:1px 1px 0 #000, 2px 2px 0 #000, 3px 3px 0 #000, 4px 4px 0 #000, 5px 5px 0 #000; }" },
    { t: "underline-grow", family: "minimal-flat",
      desc: "Animated underline that grows from left on hover — link emphasis pattern with smooth width transition.",
      css: ".text-underline-grow { position:relative; } .text-underline-grow::after { content:''; position:absolute; left:0; bottom:-2px; width:0; height:2px; background:currentColor; transition:width .3s ease; } .text-underline-grow:hover::after { width:100%; }" },
    { t: "typewriter", family: "minimal-flat",
      desc: "Typewriter effect using a blinking caret and character-by-character reveal — terminal aesthetic for hero headlines.",
      css: ".text-typewriter { border-right:2px solid currentColor; animation:blink 1s step-end infinite; } @keyframes blink { 50% { border-color:transparent; } }" },
    { t: "glitch", family: "neon",
      desc: "Glitch text effect with offset color-channel shadows animating to simulate digital corruption — experimental, cyberpunk aesthetic.",
      css: ".text-glitch { position:relative; } .text-glitch::before, .text-glitch::after { content:attr(data-text); position:absolute; top:0; left:0; } .text-glitch::before { color:#ff00ff; animation:glitch-1 2s infinite; } .text-glitch::after { color:#00ffff; animation:glitch-2 2s infinite; }" },
    { t: "marquee-text", family: "minimal-flat",
      desc: "Marquee text scrolling horizontally in a continuous loop — for ticker headlines and announcement bars.",
      css: ".text-marquee { display:inline-block; white-space:nowrap; animation:marquee 15s linear infinite; } @keyframes marquee { from { transform:translateX(100%); } to { transform:translateX(-100%); } }" },
    { t: "vertical-rl", family: "magazine",
      desc: "Vertical right-to-left text using writing-mode:vertical-rl — magazine spine label and East-Asian-inspired layout pattern.",
      css: ".text-vertical-rl { writing-mode:vertical-rl; text-orientation:mixed; }" },
    { t: "clamp-2-lines", family: "minimal-flat",
      desc: "Line-clamp to 2 lines with ellipsis — content-card summary pattern preventing text overflow.",
      css: ".text-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }" },
    { t: "clamp-3-lines", family: "minimal-flat",
      desc: "Line-clamp to 3 lines — slightly longer summary variant for cards and list items.",
      css: ".text-clamp-3 { display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }" },
    { t: "highlight-marker", family: "vintage",
      desc: "Highlight marker text with a yellow background simulating a marker pen — emphasizes inline phrases with a hand-marked feel.",
      css: ".text-highlight { background:linear-gradient(180deg, transparent 50%, #fef08a 50%); padding:0 2px; }" },
  ];
  for (const e of textEffects) {
    add({
      name: `${e.t} text effect`,
      semantic_description: e.desc,
      tags: ["typography", "text-effect", e.t],
      payload: `text-${e.t}`,
      css: e.css,
      conflicts: ["text:" + e.t.split("-")[0], `text-effect:${e.t}`],
      family: e.family,
      meta: { type: e.t },
    });
  }

  // ===== Type pairings =====
  const pairings = [
    { name: "Inter + Playfair", desc: "Inter sans-serif for body, Playfair Display serif for headlines — modern-editorial pairing balancing readability with sophisticated display contrast.", family: "magazine" },
    { name: "Geist + Geist Mono", desc: "Geist Sans for UI, Geist Mono for code — Vercel's coherent pairing for developer-focused products with consistent voice across UI and code.", family: "minimal-flat" },
    { name: "Space Grotesk + JetBrains Mono", desc: "Space Grotesk display for headlines, JetBrains Mono for code — geometric-technical pairing for developer tools.", family: "minimal-flat" },
    { name: "Cal Sans + Inter", desc: "Cal Sans display for headlines, Inter for body — modern SaaS marketing pairing with confident display and readable body.", family: "minimal-flat" },
    { name: "Playfair + Source Serif", desc: "Playfair Display headlines, Source Serif body — all-serif editorial pairing for long-form magazines with print-quality feel.", family: "magazine" },
    { name: "Helvetica + Georgia", desc: "Helvetica Neue headlines, Georgia body — Swiss-grotesque plus screen-serif pairing, corporate-classic.", family: "minimal-flat" },
    { name: "Cormorant + Inter", desc: "Cormorant display serif for headlines, Inter for body — luxury-fashion pairing with elegant didone display and clean body.", family: "magazine" },
    { name: "Bebas Neue + Open Sans", desc: "Bebas Neue condensed display for headlines, Open Sans for body — bold marketing pairing with impactful all-caps display.", family: "minimal-flat" },
  ];
  for (const p of pairings) {
    add({
      name: `${p.name} pairing`,
      semantic_description: p.desc,
      tags: ["typography", "pairing", "font-combo"],
      payload: `pairing-${p.name.toLowerCase().replace(/[^a-z]+/g, "-")}`,
      css: `.pairing-${p.name.toLowerCase().replace(/[^a-z]+/g, "-")} h1, .pairing-${p.name.toLowerCase().replace(/[^a-z]+/g, "-")} h2 { font-family:${p.name.split(" + ")[0] === "Inter" ? "'Inter'" : p.name.split(" + ")[0] === "Geist" ? "'Geist'" : p.name.split(" + ")[0] === "Space Grotesk" ? "'Space Grotesk'" : `'${p.name.split(" + ")[0]}'`}, serif; } .pairing-${p.name.toLowerCase().replace(/[^a-z]+/g, "-")} body, .pairing-${p.name.toLowerCase().replace(/[^a-z]+/g, "-")} p { font-family:'${p.name.split(" + ")[1]}', sans-serif; }`,
      conflicts: ["typo:pairing"],
      family: p.family,
      meta: { display: p.name.split(" + ")[0], body: p.name.split(" + ")[1] },
    });
  }

  // ===== Weight × hierarchy combinations =====
  for (const w of weights) {
    for (const h of hierarchies) {
      add({
        name: `${h.tag} ${w.name}`,
        semantic_description: `${h.desc} Rendered at ${w.name} weight (${w.w}) — ${w.w <= 300 ? "delicate and refined for editorial display" : w.w <= 500 ? "balanced for body and UI text" : "bold and emphatic for headlines and CTAs"}. ${pick(MOOD_POOL, n+1).charAt(0).toUpperCase() + pick(MOOD_POOL, n+1).slice(1)} typographic mood for ${pick(USE_CASE_POOL, n+2)}.`,
        tags: ["typography", "combo", h.tag, w.name, "weight"],
        payload: `text-${h.tag} weight-${w.w}`,
        css: `.text-${h.tag}-weight-${w.w} { font-size:${h.size}; font-weight:${w.w}; line-height:${h.lh}; letter-spacing:${h.ls}; }`,
        conflicts: ["typo:combo-weight", `typo-combo:${h.tag}-${w.name}`],
        family: "minimal-flat",
        meta: { tag: h.tag, weight: w.w, weightName: w.name },
      });
    }
  }

  // ===== Line-height × hierarchy combinations =====
  for (const lh of lineHeights) {
    for (const h of hierarchies) {
      add({
        name: `${h.tag} leading-${lh.name}`,
        semantic_description: `${h.desc} With ${lh.name} line-height (${lh.v}) — ${lh.v === "1" || lh.v === "1.1" ? "tight, headline-optimised stacking" : lh.v === "1.5" || lh.v === "1.4" ? "balanced readability default" : "generous, breathable spacing"}. ${pick(MOOD_POOL, n+1).charAt(0).toUpperCase() + pick(MOOD_POOL, n+1).slice(1)} rhythm for ${pick(USE_CASE_POOL, n+2)}.`,
        tags: ["typography", "combo", h.tag, lh.name, "line-height"],
        payload: `text-${h.tag} leading-${lh.name}`,
        css: `.text-${h.tag}-leading-${lh.name} { font-size:${h.size}; font-weight:${h.weight}; line-height:${lh.v}; letter-spacing:${h.ls}; }`,
        conflicts: ["typo:combo-leading", `typo-combo:${h.tag}-leading-${lh.name}`],
        family: "minimal-flat",
        meta: { tag: h.tag, lineHeight: lh.v, leadingName: lh.name },
      });
    }
  }

  // ===== Letter-spacing × hierarchy combinations =====
  for (const ls of letterSpacings) {
    for (const h of hierarchies) {
      add({
        name: `${h.tag} tracking-${ls.name}`,
        semantic_description: `${h.desc} With ${ls.name} letter-spacing (${ls.v}) — ${ls.v.startsWith("-") ? "condensed, display-optimised tracking" : ls.v === "0" ? "neutral, body-optimised tracking" : "expanded, label-optimised tracking"}. ${pick(MOOD_POOL, n+1).charAt(0).toUpperCase() + pick(MOOD_POOL, n+1).slice(1)} mood for ${pick(USE_CASE_POOL, n+2)}.`,
        tags: ["typography", "combo", h.tag, ls.name, "tracking"],
        payload: `text-${h.tag} tracking-${ls.name}`,
        css: `.text-${h.tag}-tracking-${ls.name} { font-size:${h.size}; font-weight:${h.weight}; line-height:${h.lh}; letter-spacing:${ls.v}; }`,
        conflicts: ["typo:combo-tracking", `typo-combo:${h.tag}-tracking-${ls.name}`],
        family: "minimal-flat",
        meta: { tag: h.tag, letterSpacing: ls.v, trackingName: ls.name },
      });
    }
  }

  // ===== More font stacks =====
  const moreStacks: Array<{ name: string; stack: string; family: string; desc: string }> = [
    { name: "DM Sans", stack: "'DM Sans', system-ui, sans-serif", family: "minimal-flat", desc: "DM Sans — low-contrast geometric sans-serif with friendly open counters. Popular 2025 SaaS default balancing personality and readability." },
    { name: "Manrope", stack: "'Manrope', system-ui, sans-serif", family: "minimal-flat", desc: "Manrope — modern geometric sans-serif with rounded terminals. Friendly, contemporary feel for startup marketing sites." },
    { name: "Sora", stack: "'Sora', system-ui, sans-serif", family: "minimal-flat", desc: "Sora — geometric sans-serif with slightly futuristic character. Pairs well with tech and AI product brands." },
    { name: "Satoshi", stack: "'Satoshi', system-ui, sans-serif", family: "minimal-flat", desc: "Satoshi — geometric sans-serif with refined Swiss influence. Sophisticated, brand-forward choice for design-led startups." },
    { name: "Plus Jakarta Sans", stack: "'Plus Jakarta Sans', system-ui, sans-serif", family: "minimal-flat", desc: "Plus Jakarta Sans — warm geometric sans-serif with humanist touches. Approachable, modern, versatile for consumer apps." },
    { name: "Outfit", stack: "'Outfit', system-ui, sans-serif", family: "minimal-flat", desc: "Outfit — geometric sans-serif with uniform stroke widths. Clean, brand-agnostic default for product UI." },
    { name: "Space Mono", stack: "'Space Mono', 'IBM Plex Mono', monospace", family: "minimal-flat", desc: "Space Mono — monospace with quirky character. Distinctive, retro-tech feel for developer-tool branding." },
    { name: "IBM Plex Sans", stack: "'IBM Plex Sans', system-ui, sans-serif", family: "minimal-flat", desc: "IBM Plex Sans — humanist sans-serif with technical precision. Enterprise-grade default with engineering credibility." },
    { name: "IBM Plex Serif", stack: "'IBM Plex Serif', Georgia, serif", family: "magazine", desc: "IBM Plex Serif — humanist serif with screen-optimised strokes. Editorial-tech pairing for technical long-form content." },
    { name: "Fraunces", stack: "'Fraunces', 'Playfair Display', serif", family: "magazine", desc: "Fraunces — modern serif with old-style display character and variable axes. Distinctive editorial display choice for fashion and lifestyle." },
    { name: "Bricolage Grotesque", stack: "'Bricolage Grotesque', system-ui, sans-serif", family: "minimal-flat", desc: "Bricolage Grotesque — quirky contemporary grotesque with display-optimised cuts. Bold, personality-driven choice for creative agencies." },
    { name: "Anybody Variable", stack: "'Anybody Variable', system-ui, sans-serif", family: "kineto", desc: "Anybody — variable-axis display font with extreme width and weight ranges. Experimental choice for kinetic typography and bold statements." },
    { name: "Clash Display", stack: "'Clash Display', 'Space Grotesk', sans-serif", family: "minimal-flat", desc: "Clash Display — chunky geometric display sans with strong personality. Trendy 2025 marketing-site display choice." },
    { name: "General Sans", stack: "'General Sans', system-ui, sans-serif", family: "minimal-flat", desc: "General Sans — neutral geometric sans-serif with refined details. Quietly confident UI font for design-system defaults." },
    { name: "Author", stack: "'Author', system-ui, sans-serif", family: "minimal-flat", desc: "Author — humanist sans-serif with literary character. Editorial-UI hybrid for content-focused products." },
    { name: "Lora", stack: "'Lora', Georgia, serif", family: "magazine", desc: "Lora — brush-style serif with calligraphic warmth. Readable body serif for editorial and blog content." },
    { name: "Merriweather", stack: "'Merriweather', Georgia, serif", family: "magazine", desc: "Merriweather — text-optimised serif designed for on-screen readability. Workhorse body serif for long-form articles." },
    { name: "Source Sans 3", stack: "'Source Sans 3', system-ui, sans-serif", family: "minimal-flat", desc: "Source Sans 3 — Adobe's humanist sans-serif with UI-optimised hinting. Versatile default for documentation and enterprise UI." },
  ];
  for (const f of moreStacks) {
    add({
      name: `${f.name} font stack`,
      semantic_description: f.desc,
      tags: ["font", "stack", f.name.toLowerCase().replace(/\s+/g, "-")],
      payload: `font-${f.name.toLowerCase().replace(/\s+/g, "-")}`,
      css: `.font-${f.name.toLowerCase().replace(/\s+/g, "-")} { font-family:${f.stack}; }`,
      conflicts: ["font:stack", `font-family:${f.name.toLowerCase().replace(/\s+/g, "-")}`],
      family: f.family,
      meta: { stack: f.stack },
    });
  }

  // ===== More text effects =====
  const moreTextEffects: Array<{ t: string; family: string; desc: string; css: string }> = [
    { t: "gradient-aurora-text", family: "aurora", desc: "Aurora gradient text cycling through violet, cyan, and pink hues via background-clip:text — premium animated headline pattern for 2025 SaaS heroes.", css: ".text-gradient-aurora { background:linear-gradient(135deg, #8b5cf6, #06b6d4, #ec4899); -webkit-background-clip:text; background-clip:text; color:transparent; }" },
    { t: "outline-thin", family: "brutalist", desc: "Thin 1px outline text — refined stroke variant for delicate brutalist headlines.", css: ".text-outline-thin { -webkit-text-stroke:1px currentColor; color:transparent; }" },
    { t: "outline-thick", family: "brutalist", desc: "Thick 4px outline text — bold stroke variant for poster-style brutalist display.", css: ".text-outline-thick { -webkit-text-stroke:4px currentColor; color:transparent; }" },
    { t: "shadow-soft-text", family: "minimal-flat", desc: "Soft 4px blurred text shadow — gentle depth for headings without harsh edges.", css: ".text-shadow-soft { text-shadow:0 4px 8px rgba(0,0,0,0.15); }" },
    { t: "shadow-long-text", family: "minimal-flat", desc: "Long directional text shadow — editorial device suggesting low-angle light.", css: ".text-shadow-long { text-shadow:4px 4px 0 rgba(0,0,0,0.2); }" },
    { t: "neon-magenta", family: "neon", desc: "Magenta neon-glow text — cyberpunk alternative to the cyan neon variant, for gaming and rave-themed designs.", css: ".text-neon-magenta { color:#ec4899; text-shadow:0 0 10px rgba(236,72,153,0.8), 0 0 20px rgba(236,72,153,0.6); }" },
    { t: "neon-green", family: "neon", desc: "Green neon-glow text — Matrix-inspired aesthetic for terminal and hacker-themed interfaces.", css: ".text-neon-green { color:#22c55e; text-shadow:0 0 10px rgba(34,197,94,0.8), 0 0 20px rgba(34,197,94,0.6); }" },
    { t: "uppercase-tight", family: "minimal-flat", desc: "Uppercase with tight tracking — confident all-caps eyebrow for category labels.", css: ".text-uppercase-tight { text-transform:uppercase; letter-spacing:-0.01em; font-weight:600; }" },
    { t: "small-caps", family: "magazine", desc: "Small-caps variant using font-variant:small-caps — refined editorial device for academic and literary contexts.", css: ".text-small-caps { font-variant:small-caps; }" },
    { t: "italic-emphasis", family: "magazine", desc: "Italic emphasis — slanted variant for inline emphasis and editorial pull-quotes.", css: ".text-italic { font-style:italic; }" },
    { t: "underline-decoration", family: "minimal-flat", desc: "Underline with custom offset and decoration-thickness — refined link styling.", css: ".text-underline-decoration { text-decoration:underline; text-underline-offset:4px; text-decoration-thickness:2px; }" },
    { t: "strike-through", family: "minimal-flat", desc: "Strikethrough text — for deprecated content and price-discount displays.", css: ".text-strike { text-decoration:line-through; }" },
    { t: "blink-caret", family: "minimal-flat", desc: "Blinking caret animation — terminal cursor effect for hero typewriter headlines.", css: ".text-blink-caret { animation:caret-blink 1s step-end infinite; } @keyframes caret-blink { 50% { border-color:transparent; } }" },
    { t: "rainbow-animated", family: "neon", desc: "Rainbow-animated text cycling through hue rotations — playful Pride-month aesthetic for celebration moments.", css: ".text-rainbow { animation:rainbow 3s linear infinite; } @keyframes rainbow { 0% { color:#ef4444; } 17% { color:#f59e0b; } 33% { color:#22c55e; } 50% { color:#06b6d4; } 67% { color:#6366f1; } 83% { color:#a855f7; } 100% { color:#ef4444; } }" },
    { t: "emboss-deep", family: "neumorphism", desc: "Embossed text simulating neumorphic depth — soft dual-shadow producing a pressed-in feel.", css: ".text-emboss { color:#e6e9f0; text-shadow:-1px -1px 1px rgba(255,255,255,0.8), 1px 1px 1px rgba(0,0,0,0.2); }" },
  ];
  for (const e of moreTextEffects) {
    add({
      name: `${e.t} text effect`,
      semantic_description: e.desc,
      tags: ["typography", "text-effect", e.t],
      payload: `text-${e.t}`,
      css: e.css,
      conflicts: ["text:" + e.t.split("-")[0], `text-effect:${e.t}`],
      family: e.family,
      meta: { type: e.t },
    });
  }

  // ===== More type pairings =====
  const morePairings = [
    { name: "Manrope + Lora", desc: "Manrope sans headlines with Lora serif body — warm, editorial-meets-modern pairing for lifestyle and content brands.", family: "magazine" },
    { name: "Sora + Inter", desc: "Sora display headlines with Inter body — futuristic-meets-readable pairing for AI and dev-tool products.", family: "minimal-flat" },
    { name: "Satoshi + Source Sans", desc: "Satoshi display with Source Sans body — refined Swiss-design pairing for design-led startups.", family: "minimal-flat" },
    { name: "Fraunces + Inter", desc: "Fraunces serif headlines with Inter body — sophisticated fashion-meets-tech pairing for premium SaaS.", family: "magazine" },
    { name: "Clash Display + General Sans", desc: "Clash Display headlines with General Sans body — bold, modern marketing pairing with strong display personality.", family: "minimal-flat" },
    { name: "Bricolage + IBM Plex Sans", desc: "Bricolage Grotesque display with IBM Plex Sans body — quirky-meets-technical pairing for creative-agency sites.", family: "minimal-flat" },
    { name: "Outfit + DM Sans", desc: "Outfit display with DM Sans body — friendly geometric pairing for consumer SaaS and onboarding flows.", family: "minimal-flat" },
    { name: "Playfair + Lora", desc: "Playfair Display headlines with Lora body — all-serif luxury pairing for fashion and editorial brands.", family: "magazine" },
    { name: "Space Grotesk + Space Mono", desc: "Space Grotesk display with Space Mono code — geometric-technical pairing for developer tools.", family: "minimal-flat" },
    { name: "Cormorant + DM Sans", desc: "Cormorant display with DM Sans body — elegant didone-meets-geometric pairing for fashion and beauty.", family: "magazine" },
    { name: "Cal Sans + Manrope", desc: "Cal Sans display with Manrope body — modern SaaS marketing pairing with confident display and friendly body.", family: "minimal-flat" },
    { name: "Geist + Geist Mono", desc: "Geist Sans with Geist Mono — Vercel's coherent pairing for developer-focused products with consistent voice.", family: "minimal-flat" },
  ];
  for (const p of morePairings) {
    add({
      name: `${p.name} pairing`,
      semantic_description: p.desc,
      tags: ["typography", "pairing", "font-combo"],
      payload: `pairing-${p.name.toLowerCase().replace(/[^a-z]+/g, "-")}`,
      css: `.pairing-${p.name.toLowerCase().replace(/[^a-z]+/g, "-")} h1, .pairing-${p.name.toLowerCase().replace(/[^a-z]+/g, "-")} h2 { font-family:'${p.name.split(" + ")[0]}', sans-serif; } .pairing-${p.name.toLowerCase().replace(/[^a-z]+/g, "-")} body, .pairing-${p.name.toLowerCase().replace(/[^a-z]+/g, "-")} p { font-family:'${p.name.split(" + ")[1]}', sans-serif; }`,
      conflicts: ["typo:pairing"],
      family: p.family,
      meta: { display: p.name.split(" + ")[0], body: p.name.split(" + ")[1] },
    });
  }

  // ===== Font stack × role variants =====
  const stackRoles = [
    { role: "display", desc: "Display role — oversized headlines and hero typography.", weight: 800 },
    { role: "body", desc: "Body role — paragraph text and primary readable content.", weight: 400 },
    { role: "ui", desc: "UI role — labels, buttons, and interface text requiring medium weight.", weight: 500 },
  ];
  for (const f of [...fontStacks, ...moreStacks]) {
    for (const r of stackRoles) {
      add({
        name: `${f.name} ${r.role}`,
        semantic_description: `${f.desc} Tuned for ${r.role} use at ${r.weight} weight — ${r.role === "display" ? "oversized with tight tracking" : r.role === "body" ? "readable with relaxed line-height" : "compact with medium weight for UI controls"}. ${pick(MOOD_POOL, n+1).charAt(0).toUpperCase() + pick(MOOD_POOL, n+1).slice(1)} for ${pick(USE_CASE_POOL, n+2)}.`,
        tags: ["font", "stack", f.name.toLowerCase().replace(/\s+/g, "-"), r.role],
        payload: `font-${f.name.toLowerCase().replace(/\s+/g, "-")} role-${r.role}`,
        css: `.font-${f.name.toLowerCase().replace(/\s+/g, "-")}.role-${r.role} { font-family:${f.stack}; font-weight:${r.weight}; }`,
        conflicts: ["font:stack-role", `font-role:${f.name.toLowerCase().replace(/\s+/g, "-")}-${r.role}`],
        family: f.family,
        meta: { stack: f.stack, role: r.role, weight: r.weight },
      });
    }
  }

  return out;
}

/* ----------------------------- INTERACTIONS ----------------------------- */
function buildInteractions(): LexiconEntry[] {
  const out: LexiconEntry[] = [];
  let n = 0;
  const add = (e: Omit<LexiconEntry, "id" | "category">) => {
    n++;
    out.push({ id: `interactions.${pad(n)}`, category: "interactions", ...e });
  };

  // ===== Hover effects =====
  const hoverEffects: Array<{ t: string; family: string; desc: string; payload: string; css: string }> = [
    { t: "lift", family: "minimal-flat", desc: "Hover lift raising the element 4px with a softening shadow — tactile confirmation of clickability. The most universal hover effect.",
      payload: "hover-lift", css: ".hover-lift { transition:transform .2s ease, box-shadow .2s ease; } .hover-lift:hover { transform:translateY(-4px); box-shadow:0 12px 24px rgba(0,0,0,0.1); }" },
    { t: "scale-up", family: "minimal-flat", desc: "Hover scale-up growing the element 5% — confident micro-interaction for buttons and image cards.",
      payload: "hover-scale-up", css: ".hover-scale-up { transition:transform .2s ease; } .hover-scale-up:hover { transform:scale(1.05); }" },
    { t: "scale-down", family: "minimal-flat", desc: "Hover scale-down shrinking the element 3% — tactile press-down feel for clickable cards.",
      payload: "hover-scale-down", css: ".hover-scale-down { transition:transform .15s ease; } .hover-scale-down:hover { transform:scale(0.97); }" },
    { t: "glow", family: "neon", desc: "Hover glow adding a luminous outer shadow in an accent color — cyberpunk hover for buttons and cards in dark-mode UIs.",
      payload: "hover-glow", css: ".hover-glow { transition:box-shadow .3s ease; } .hover-glow:hover { box-shadow:0 0 20px rgba(139,92,246,0.6); }" },
    { t: "underline-grow", family: "minimal-flat", desc: "Hover underline that grows from left to right — refined link hover with smooth width transition.",
      payload: "hover-underline-grow", css: ".hover-underline-grow { position:relative; } .hover-underline-grow::after { content:''; position:absolute; left:0; bottom:-2px; width:0; height:2px; background:currentColor; transition:width .3s ease; } .hover-underline-grow:hover::after { width:100%; }" },
    { t: "image-zoom", family: "minimal-flat", desc: "Hover image-zoom scaling the inner image while the container stays fixed — classic product-card hover pattern.",
      payload: "hover-image-zoom", css: ".hover-image-zoom img { transition:transform .4s ease; } .hover-image-zoom:hover img { transform:scale(1.1); }" },
    { t: "tilt-3d", family: "minimal-flat", desc: "Hover 3D tilt rotating the element on the X/Y axes based on cursor position — dynamic, playful interaction for product cards.",
      payload: "hover-tilt-3d", css: ".hover-tilt-3d { transition:transform .1s ease; transform-style:preserve-3d; }" },
    { t: "color-shift", family: "minimal-flat", desc: "Hover color-shift smoothly transitioning background or text color — subtle, refined state change.",
      payload: "hover-color-shift", css: ".hover-color-shift { transition:color .3s ease, background-color .3s ease; } .hover-color-shift:hover { color:#8b5cf6; }" },
    { t: "border-draw", family: "minimal-flat", desc: "Hover border-draw animating a border appearing to draw around the element — sophisticated outline-reveal pattern.",
      payload: "hover-border-draw", css: ".hover-border-draw { position:relative; } .hover-border-draw::before { content:''; position:absolute; inset:0; border:2px solid currentColor; border-radius:inherit; clip-path:polygon(0 0, 0 0, 0 100%, 0 100%); transition:clip-path .4s ease; } .hover-border-draw:hover::before { clip-path:polygon(0 0, 100% 0, 100% 100%, 0 100%); }" },
    { t: "text-slide-up", family: "minimal-flat", desc: "Hover text-slide-up revealing hidden text from below — pattern for icon buttons that reveal labels on hover.",
      payload: "hover-text-slide-up", css: ".hover-text-slide-up .label { transform:translateY(100%); opacity:0; transition:all .3s ease; } .hover-text-slide-up:hover .label { transform:translateY(0); opacity:1; }" },
    { t: "rotate", family: "minimal-flat", desc: "Hover rotate spinning the element 90 degrees — for refresh icons and toggle affordances.",
      payload: "hover-rotate", css: ".hover-rotate { transition:transform .3s ease; } .hover-rotate:hover { transform:rotate(90deg); }" },
    { t: "shake", family: "minimal-flat", desc: "Hover shake rapidly oscillating the element horizontally — playful error-state or attention pattern.",
      payload: "hover-shake", css: ".hover-shake:hover { animation:shake .3s ease; } @keyframes shake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-4px);} 75%{transform:translateX(4px);} }" },
    { t: "shine-sweep", family: "minimal-flat", desc: "Hover shine-sweep animating a diagonal light streak across the element — premium CTA button hover.",
      payload: "hover-shine-sweep", css: ".hover-shine-sweep { position:relative; overflow:hidden; } .hover-shine-sweep::before { content:''; position:absolute; top:0; left:-100%; width:50%; height:100%; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); transition:left .6s ease; } .hover-shine-sweep:hover::before { left:150%; }" },
    { t: "dim", family: "minimal-flat", desc: "Hover dim reducing opacity to 70% — subtle de-emphasis pattern for grid items on sibling-hover.",
      payload: "hover-dim", css: ".hover-dim { transition:opacity .3s ease; } .hover-dim:hover { opacity:0.7; }" },
  ];
  for (const h of hoverEffects) {
    add({
      name: `hover ${h.t}`,
      semantic_description: h.desc,
      tags: ["hover", "interaction", h.t, "micro-interaction"],
      payload: h.payload,
      css: h.css,
      conflicts: ["interaction:hover", `hover:${h.t}`],
      family: h.family,
      meta: { type: h.t },
    });
  }

  // ===== Focus states =====
  const focusStates = [
    { t: "ring-2", desc: "Focus-visible ring with 2px solid outline and 2px offset — the WCAG-compliant default for keyboard accessibility.", payload: "focus-ring-2" },
    { t: "ring-4", desc: "Focus-visible ring with 4px solid outline — bolder focus indicator for low-vision accessibility on small targets.", payload: "focus-ring-4" },
    { t: "ring-offset", desc: "Focus-visible ring with 2px outline and 4px offset — separates the ring from the element, useful for bordered elements.", payload: "focus-ring-offset" },
    { t: "ring-glow", desc: "Focus-visible glow with soft blurred outline in accent color — modern focus indicator for premium dark-mode UIs.", payload: "focus-ring-glow" },
    { t: "ring-bottom", desc: "Focus-visible bottom underline indicator — minimal focus pattern for tabs and links preserving visual cleanliness.", payload: "focus-ring-bottom" },
    { t: "ring-inset", desc: "Focus-visible inset ring — inside-the-element outline for inputs and form controls.", payload: "focus-ring-inset" },
    { t: "ring-double", desc: "Focus-visible double-ring with two concentric outlines — strong indicator for high-stakes interactive elements.", payload: "focus-ring-double" },
    { t: "ring-animated", desc: "Focus-visible animated ring that pulses softly — draws attention to the focused element without distraction.", payload: "focus-ring-animated" },
  ];
  for (const f of focusStates) {
    add({
      name: `focus ${f.t}`,
      semantic_description: f.desc,
      tags: ["focus", "a11y", "keyboard", f.t],
      payload: f.payload,
      css: `.${f.payload}:focus-visible { outline:2px solid #6366f1; outline-offset:2px; }`,
      accessibility: { focusVisible: true, aria: [] },
      conflicts: ["interaction:focus", `focus:${f.t}`],
      family: "minimal-flat",
      meta: { type: f.t },
    });
  }

  // ===== Transitions =====
  const easings = [
    { name: "ease-linear", value: "linear", desc: "Linear easing — constant velocity, mechanical feel. Use for progress bars and continuous animations." },
    { name: "ease-in", value: "cubic-bezier(0.4, 0, 1, 1)", desc: "Ease-in (accelerate) — slow start, fast end. For elements exiting the viewport." },
    { name: "ease-out", value: "cubic-bezier(0, 0, 0.2, 1)", desc: "Ease-out (decelerate) — fast start, slow end. For elements entering the viewport; the most natural default." },
    { name: "ease-in-out", value: "cubic-bezier(0.4, 0, 0.2, 1)", desc: "Ease-in-out — symmetrical acceleration and deceleration. For state changes within the viewport." },
    { name: "spring-soft", value: "cubic-bezier(0.34, 1.56, 0.64, 1)", desc: "Soft spring easing with subtle overshoot — playful, organic feel for hover states and small UI changes." },
    { name: "spring-bouncy", value: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", desc: "Bouncy spring easing with pronounced overshoot — energetic, attention-grabbing for entrances." },
    { name: "spring-snappy", value: "cubic-bezier(0.16, 1, 0.3, 1)", desc: "Snappy spring easing — fast, decisive deceleration. Apple-style material motion for UI transitions." },
    { name: "back-out", value: "cubic-bezier(0.34, 1.56, 0.64, 1)", desc: "Back-out easing with slight overshoot — for elements popping into view with a settle motion." },
    { name: "anticipate", value: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", desc: "Anticipate easing with backward motion before forward — wind-up effect for kinetic entrances." },
  ];
  const durations = [100, 150, 200, 250, 300, 400, 500, 700, 1000];
  for (const e of easings) {
    for (const d of durations) {
      add({
        name: `transition ${e.name} ${d}ms`,
        semantic_description: `${e.desc} Applied at ${d}ms duration — ${d < 200 ? "snappy, instant feel" : d > 500 ? "slow, deliberate motion" : "balanced default"}. For ${pick(USE_CASE_POOL, n)} where ${pick(INTENSITY_POOL, n+1)} feedback is desired.`,
        tags: ["transition", "easing", e.name, `duration-${d}`],
        payload: `transition-${e.name}-${d}`,
        css: `.transition-${e.name}-${d} { transition:all ${d}ms ${e.value}; }`,
        conflicts: ["interaction:transition", `transition-easing:${e.name}`, `transition-duration:${d}`],
        family: "minimal-flat",
        meta: { easing: e.name, duration: d, value: e.value },
      });
    }
  }

  // ===== Animations =====
  const animations: Array<{ t: string; family: string; desc: string; css: string }> = [
    { t: "fade-in", family: "minimal-flat", desc: "Fade-in animation transitioning opacity from 0 to 1 — the universal entrance animation. Subtle, professional, content-first.",
      css: ".anim-fade-in { animation:fade-in .5s ease-out forwards; } @keyframes fade-in { from { opacity:0; } to { opacity:1; } }" },
    { t: "fade-in-up", family: "minimal-flat", desc: "Fade-in-up animation combining opacity fade with upward translation — modern hero entrance pattern with directional motion.",
      css: ".anim-fade-in-up { animation:fade-in-up .6s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes fade-in-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }" },
    { t: "fade-in-down", family: "minimal-flat", desc: "Fade-in-down animation combining opacity fade with downward translation — for elements entering from the top edge.",
      css: ".anim-fade-in-down { animation:fade-in-down .6s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes fade-in-down { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }" },
    { t: "fade-in-left", family: "minimal-flat", desc: "Fade-in-left animation combining opacity fade with right-to-left translation — for elements entering from the right edge.",
      css: ".anim-fade-in-left { animation:fade-in-left .6s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes fade-in-left { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }" },
    { t: "fade-in-right", family: "minimal-flat", desc: "Fade-in-right animation combining opacity fade with left-to-right translation — for elements entering from the left edge.",
      css: ".anim-fade-in-right { animation:fade-in-right .6s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes fade-in-right { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }" },
    { t: "scale-in", family: "minimal-flat", desc: "Scale-in animation growing from 0.9 to 1 with opacity fade — gentle pop-in entrance for modals and cards.",
      css: ".anim-scale-in { animation:scale-in .4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; } @keyframes scale-in { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }" },
    { t: "blur-in", family: "glassmorphism", desc: "Blur-in animation transitioning from heavy blur and opacity 0 to sharp and visible — modern 2025 entrance for glassmorphism hero content.",
      css: ".anim-blur-in { animation:blur-in .8s ease-out forwards; } @keyframes blur-in { from { opacity:0; filter:blur(20px); } to { opacity:1; filter:blur(0); } }" },
    { t: "slide-in-bottom-sheet", family: "minimal-flat", desc: "Slide-in animation for bottom sheets — translates from below the viewport to its resting position.",
      css: ".anim-slide-in-bottom-sheet { animation:slide-up .35s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes slide-up { from { transform:translateY(100%); } to { transform:translateY(0); } }" },
    { t: "slide-in-side-drawer", family: "minimal-flat", desc: "Slide-in animation for side drawers — translates from off-screen right to its resting position.",
      css: ".anim-slide-in-side-drawer { animation:slide-in-right .35s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes slide-in-right { from { transform:translateX(100%); } to { transform:translateX(0); } }" },
    { t: "stagger", family: "minimal-flat", desc: "Stagger animation applying incremental delays to children — creates a cascading reveal effect for lists and grids.",
      css: ".anim-stagger > * { opacity:0; animation:fade-in-up .5s ease-out forwards; } .anim-stagger > *:nth-child(1) { animation-delay:50ms; } .anim-stagger > *:nth-child(2) { animation-delay:100ms; } .anim-stagger > *:nth-child(3) { animation-delay:150ms; } .anim-stagger > *:nth-child(4) { animation-delay:200ms; } .anim-stagger > *:nth-child(5) { animation-delay:250ms; }" },
    { t: "scroll-reveal", family: "minimal-flat", desc: "Scroll-driven reveal using IntersectionObserver — elements fade-in-up when entering the viewport. Modern 2025 progressive-disclosure pattern.",
      css: ".anim-scroll-reveal { opacity:0; transform:translateY(30px); transition:all .8s cubic-bezier(0.16, 1, 0.3, 1); } .anim-scroll-reveal.is-visible { opacity:1; transform:translateY(0); }" },
    { t: "scroll-parallax", family: "minimal-flat", desc: "Scroll-driven parallax — elements translate at a fraction of scroll speed, creating depth layers. Modern 2025 trend.",
      css: ".anim-scroll-parallax { will-change:transform; }" },
    { t: "marquee-left", family: "minimal-flat", desc: "Marquee animation scrolling content leftward in a continuous loop — for ticker bars and logo clouds.",
      css: ".anim-marquee-left { display:inline-block; white-space:nowrap; animation:marquee-left 20s linear infinite; } @keyframes marquee-left { from { transform:translateX(0); } to { transform:translateX(-50%); } }" },
    { t: "marquee-right", family: "minimal-flat", desc: "Marquee animation scrolling content rightward in a continuous loop — reverse direction variant.",
      css: ".anim-marquee-right { display:inline-block; white-space:nowrap; animation:marquee-right 20s linear infinite; } @keyframes marquee-right { from { transform:translateX(-50%); } to { transform:translateX(0); } }" },
    { t: "shimmer", family: "minimal-flat", desc: "Shimmer animation sweeping a light streak across the element — skeleton-loading placeholder pattern.",
      css: ".anim-shimmer { background:linear-gradient(90deg, #f4f4f5 25%, #e4e4e7 50%, #f4f4f5 75%); background-size:200% 100%; animation:shimmer 1.5s ease-in-out infinite; } @keyframes shimmer { from { background-position:200% 0; } to { background-position:-200% 0; } }" },
    { t: "float", family: "minimal-flat", desc: "Float animation gently bobbing the element up and down — for hero illustrations and decorative elements.",
      css: ".anim-float { animation:float 3s ease-in-out infinite; } @keyframes float { 0%, 100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }" },
    { t: "pulse", family: "minimal-flat", desc: "Pulse animation scaling the element 5% with opacity dip — for status indicators and notification badges.",
      css: ".anim-pulse { animation:pulse 2s ease-in-out infinite; } @keyframes pulse { 0%, 100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.05); opacity:0.8; } }" },
    { t: "gradient-shift", family: "aurora", desc: "Gradient-shift animation cycling background-position to create a flowing gradient — for animated aurora backgrounds.",
      css: ".anim-gradient-shift { background-size:200% 200%; animation:gradient-shift 6s ease infinite; } @keyframes gradient-shift { 0%, 100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }" },
    { t: "spin", family: "minimal-flat", desc: "Spin animation rotating 360 degrees continuously — for loading spinners and refresh indicators.",
      css: ".anim-spin { animation:spin 1s linear infinite; } @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }" },
    { t: "ping", family: "minimal-flat", desc: "Ping animation scaling and fading a ring outward — for live status indicators and notification pings.",
      css: ".anim-ping { animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; } @keyframes ping { 0% { transform:scale(1); opacity:1; } 75%, 100% { transform:scale(2); opacity:0; } }" },
    { t: "bounce", family: "minimal-flat", desc: "Bounce animation translating up and down with squash — for empty-state illustrations and playfully emphatic UI.",
      css: ".anim-bounce { animation:bounce 1s ease-in-out infinite; } @keyframes bounce { 0%, 100% { transform:translateY(-25%); animation-timing-function:cubic-bezier(0.8, 0, 1, 1); } 50% { transform:translateY(0); animation-timing-function:cubic-bezier(0, 0, 0.2, 1); } }" },
    { t: "wiggle", family: "minimal-flat", desc: "Wiggle animation rotating slightly left and right — for attention-grabbing UI moments and playful icons.",
      css: ".anim-wiggle { animation:wiggle .5s ease-in-out infinite; } @keyframes wiggle { 0%, 100% { transform:rotate(-3deg); } 50% { transform:rotate(3deg); } }" },
    { t: "typewriter", family: "minimal-flat", desc: "Typewriter animation revealing text character-by-character with a blinking caret — terminal-style hero headline.",
      css: ".anim-typewriter { overflow:hidden; white-space:nowrap; border-right:2px solid currentColor; animation:typing 3s steps(40) forwards, blink .8s step-end infinite; } @keyframes typing { from { width:0; } to { width:100%; } } @keyframes blink { 50% { border-color:transparent; } }" },
    { t: "count-up", family: "minimal-flat", desc: "Count-up animation interpolating a number from 0 to target — for dashboard stat tiles and metric reveals.",
      css: ".anim-count-up { display:inline-block; }" },
    { t: "view-transition", family: "minimal-flat", desc: "View Transition API animation cross-fading between DOM states — modern 2025 SPA navigation pattern. Browser support: Chrome 111+.",
      css: "@view-transition { navigation:auto; } ::view-transition-old(root), ::view-transition-new(root) { animation-duration:.3s; }" },
  ];
  for (const a of animations) {
    add({
      name: `animation ${a.t}`,
      semantic_description: a.desc,
      tags: ["animation", a.t, "motion", "keyframes"],
      payload: `anim-${a.t}`,
      css: a.css,
      conflicts: ["interaction:animation", `animation:${a.t}`],
      family: a.family,
      meta: { type: a.t },
    });
  }

  // ===== JS snippets =====
  const jsSnippets: Array<{ t: string; desc: string; js: string; tags: string[] }> = [
    { t: "toggle-class", desc: "Vanilla JS to toggle a class on click — universal pattern for interactive state changes. Used by accordion, dropdown, and modal triggers.",
      js: `document.querySelector('[data-toggle]').addEventListener('click', (e) => { e.currentTarget.classList.toggle('is-open'); });`,
      tags: ["js", "toggle", "class", "click"] },
    { t: "accordion-expand", desc: "Vanilla JS accordion expand/collapse — toggles 'is-open' class on the parent panel and manages aria-expanded for accessibility.",
      js: `document.querySelectorAll('[data-accordion-trigger]').forEach(btn => { btn.addEventListener('click', () => { const expanded = btn.getAttribute('aria-expanded') === 'true'; btn.setAttribute('aria-expanded', String(!expanded)); btn.closest('[data-accordion]').classList.toggle('is-open', !expanded); }); });`,
      tags: ["js", "accordion", "expand", "aria"] },
    { t: "modal-open", desc: "Vanilla JS modal open — sets aria-hidden=false on the modal, traps focus inside, and adds a class to show. Returns focus on close.",
      js: `function openModal(id) { const m = document.getElementById(id); m.setAttribute('aria-hidden', 'false'); m.classList.add('is-open'); document.body.style.overflow = 'hidden'; m.querySelector('[data-close]').focus(); }`,
      tags: ["js", "modal", "open", "focus-trap"] },
    { t: "modal-close", desc: "Vanilla JS modal close — hides the modal, restores body scroll, and returns focus to the trigger element.",
      js: `function closeModal(id, returnFocusTo) { const m = document.getElementById(id); m.setAttribute('aria-hidden', 'true'); m.classList.remove('is-open'); document.body.style.overflow = ''; if (returnFocusTo) returnFocusTo.focus(); }`,
      tags: ["js", "modal", "close", "focus-restore"] },
    { t: "theme-switch", desc: "Vanilla JS theme switch toggling 'dark' class on documentElement and persisting the choice to localStorage — accessible dark-mode toggle.",
      js: `function toggleTheme() { const isDark = document.documentElement.classList.toggle('dark'); localStorage.setItem('theme', isDark ? 'dark' : 'light'); } document.documentElement.classList.toggle('dark', localStorage.getItem('theme') === 'dark');`,
      tags: ["js", "theme", "dark-mode", "localStorage"] },
    { t: "copy-to-clipboard", desc: "Vanilla JS copy-to-clipboard using the Clipboard API with a fallback — copies text and shows visual feedback.",
      js: `async function copyText(text, btn) { try { await navigator.clipboard.writeText(text); btn.classList.add('copied'); setTimeout(() => btn.classList.remove('copied'), 1500); } catch (e) { console.warn('clipboard', e); } }`,
      tags: ["js", "clipboard", "copy", "navigator"] },
    { t: "intersection-reveal", desc: "Vanilla JS IntersectionObserver revealing elements as they enter the viewport — powers scroll-reveal animations without libraries.",
      js: `const io = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }); }, { threshold:0.15 }); document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));`,
      tags: ["js", "intersection-observer", "scroll", "reveal"] },
    { t: "slider-value-sync", desc: "Vanilla JS syncing a range slider's value to a display label — keeps the visible number in sync with the input.",
      js: `document.querySelectorAll('[data-slider]').forEach(s => { const out = document.querySelector(s.dataset.output); s.addEventListener('input', () => { out.textContent = s.value; }); });`,
      tags: ["js", "slider", "sync", "input"] },
    { t: "tooltip-position", desc: "Vanilla JS positioning a tooltip relative to its trigger — computes position based on trigger rect to avoid viewport overflow.",
      js: `function positionTooltip(trigger, tip) { const r = trigger.getBoundingClientRect(); tip.style.left = (r.left + r.width/2 - tip.offsetWidth/2) + 'px'; tip.style.top = (r.top - tip.offsetHeight - 8) + 'px'; }`,
      tags: ["js", "tooltip", "position", "rect"] },
    { t: "dropdown-menu", desc: "Vanilla JS dropdown menu — toggles 'is-open' on click, closes on outside-click and Escape key, manages aria-expanded.",
      js: `document.querySelectorAll('[data-dropdown]').forEach(dd => { const btn = dd.querySelector('[data-dropdown-trigger]'); btn.addEventListener('click', (e) => { e.stopPropagation(); const isOpen = dd.classList.toggle('is-open'); btn.setAttribute('aria-expanded', String(isOpen)); }); }); document.addEventListener('click', () => document.querySelectorAll('[data-dropdown].is-open').forEach(d => d.classList.remove('is-open'))); document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.querySelectorAll('[data-dropdown].is-open').forEach(d => d.classList.remove('is-open')); });`,
      tags: ["js", "dropdown", "menu", "escape"] },
    { t: "tab-switch", desc: "Vanilla JS tab switch — handles tablist clicks, manages aria-selected, and toggles panel visibility. Full keyboard arrow-key navigation.",
      js: `document.querySelectorAll('[data-tabs]').forEach(tabs => { const triggers = tabs.querySelectorAll('[role=tab]'); triggers.forEach(t => t.addEventListener('click', () => { triggers.forEach(x => { x.setAttribute('aria-selected', 'false'); document.getElementById(x.getAttribute('aria-controls')).hidden = true; }); t.setAttribute('aria-selected', 'true'); document.getElementById(t.getAttribute('aria-controls')).hidden = false; })); });`,
      tags: ["js", "tabs", "aria-selected", "keyboard"] },
    { t: "carousel-next", desc: "Vanilla JS carousel next/prev — updates the active slide index, translates the track, and updates dot indicators.",
      js: "function carouselGo(track, dir) { const slides = track.children.length; let idx = parseInt(track.dataset.idx || '0', 10); idx = (idx + dir + slides) % slides; track.dataset.idx = String(idx); track.style.transform = 'translateX(-' + (idx * 100) + '%)'; }",
      tags: ["js", "carousel", "slide", "transform"] },
    { t: "toast-show", desc: "Vanilla JS toast notification — creates a transient toast element, auto-dismisses after a delay, and supports stacking.",
      js: "function showToast(msg, type='info', ms=3000) { const t = document.createElement('div'); t.className = 'toast toast-' + type; t.textContent = msg; document.getElementById('toaster').appendChild(t); requestAnimationFrame(() => t.classList.add('show')); setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, ms); }",
      tags: ["js", "toast", "notification", "auto-dismiss"] },
    { t: "command-palette-open", desc: "Vanilla JS command palette open — opens on Cmd/Ctrl+K, filters items by query, and handles arrow-key navigation.",
      js: `document.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); document.getElementById('cmdk').classList.add('is-open'); document.querySelector('[data-cmdk-input]').focus(); } });`,
      tags: ["js", "command-palette", "shortcut", "cmdk"] },
    { t: "form-validate", desc: "Vanilla JS form validation — checks required fields on submit, displays inline errors, and manages aria-invalid states.",
      js: `document.querySelectorAll('[data-validate]').forEach(form => { form.addEventListener('submit', (e) => { let ok = true; form.querySelectorAll('[required]').forEach(f => { const valid = f.checkValidity(); f.setAttribute('aria-invalid', String(!valid)); if (!valid) ok = false; }); if (!ok) e.preventDefault(); }); });`,
      tags: ["js", "form", "validation", "aria-invalid"] },
    { t: "lazy-load-img", desc: "Vanilla JS lazy-loading images via IntersectionObserver — defers offscreen image loads for faster initial page render.",
      js: `const imgIo = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { const img = e.target; img.src = img.dataset.src; img.removeAttribute('data-src'); imgIo.unobserve(img); } }); }); document.querySelectorAll('img[data-src]').forEach(img => imgIo.observe(img));`,
      tags: ["js", "lazy-load", "image", "performance"] },
    { t: "smooth-scroll", desc: "Vanilla JS smooth scroll for anchor links — animates scroll to the target section with a custom easing.",
      js: `document.querySelectorAll('a[href^="#"]').forEach(a => { a.addEventListener('click', (e) => { const t = document.querySelector(a.getAttribute('href')); if (t) { e.preventDefault(); t.scrollIntoView({ behavior:'smooth', block:'start' }); } })); });`,
      tags: ["js", "smooth-scroll", "anchor", "navigation"] },
    { t: "sticky-header-shadow", desc: "Vanilla JS adding a shadow to a sticky header when the page is scrolled — gives a subtle depth cue indicating the header is overlaying content.",
      js: `const header = document.querySelector('[data-sticky-header]'); const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8); window.addEventListener('scroll', onScroll, { passive:true }); onScroll();`,
      tags: ["js", "sticky", "scroll", "shadow"] },
    { t: "back-to-top", desc: "Vanilla JS back-to-top button — appears after scrolling down, smoothly scrolls to top on click.",
      js: `const btn = document.querySelector('[data-back-to-top]'); window.addEventListener('scroll', () => btn.classList.toggle('is-visible', window.scrollY > 600), { passive:true }); btn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));`,
      tags: ["js", "back-to-top", "scroll", "button"] },
    { t: "search-filter", desc: "Vanilla JS list filter — filters visible list items based on a search query, with debounced input handling.",
      js: `const input = document.querySelector('[data-search]'); const items = document.querySelectorAll('[data-searchable]'); let t; input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { const q = input.value.toLowerCase(); items.forEach(i => i.hidden = !i.textContent.toLowerCase().includes(q)); }, 200); });`,
      tags: ["js", "search", "filter", "debounce"] },
  ];
  for (const s of jsSnippets) {
    add({
      name: `js ${s.t}`,
      semantic_description: s.desc,
      tags: s.tags,
      payload: `js-${s.t}`,
      js: s.js,
      conflicts: ["interaction:js", `js:${s.t}`],
      family: "minimal-flat",
      meta: { type: s.t, language: "javascript" },
    });
  }

  // ===== Cursor & scroll effects =====
  const cursorEffects = [
    { t: "custom-cursor-dot", desc: "Custom cursor rendering a small dot following the mouse — creative-agency pattern for immersive, brand-driven experiences." },
    { t: "cursor-trail", desc: "Cursor trail effect leaving fading particles behind the cursor — playful, interactive flourish for hero sections." },
    { t: "magnetic-button", desc: "Magnetic button subtly attracted to the cursor on hover — premium micro-interaction for hero CTAs." },
    { t: "cursor-glow", desc: "Cursor glow illuminating the area around the cursor — spotlight effect for dark-mode hero sections." },
    { t: "link-grow", desc: "Link hover growing the cursor into a circle behind the link text — creative-agency link hover pattern." },
  ];
  for (const c of cursorEffects) {
    add({
      name: `cursor ${c.t}`,
      semantic_description: c.desc,
      tags: ["cursor", "interaction", c.t, "mouse"],
      payload: `cursor-${c.t}`,
      css: `/* ${c.t} requires JS for full implementation */`,
      js: `// ${c.t}: attach mousemove listener and update cursor element`,
      conflicts: ["interaction:cursor", `cursor:${c.t}`],
      family: "minimal-flat",
      meta: { type: c.t },
    });
  }
  const scrollEffects = [
    { t: "scroll-progress", desc: "Scroll progress bar at the top of the page filling as the user scrolls — reading-progress indicator for long articles." },
    { t: "scroll-snap-sections", desc: "Scroll-snap on full-page sections — each section snaps into view, creating a deck-like navigation experience." },
    { t: "scroll-hide-header", desc: "Scroll-hide header that hides on scroll-down and reveals on scroll-up — preserves viewport space without losing nav access." },
    { t: "scroll-zoom-hero", desc: "Scroll-zoom hero where the hero scales and fades as the user scrolls — cinematic transition into the page content." },
    { t: "infinite-scroll", desc: "Infinite scroll appending more content as the user reaches the bottom — pattern for feeds and galleries." },
  ];
  for (const s of scrollEffects) {
    add({
      name: `scroll ${s.t}`,
      semantic_description: s.desc,
      tags: ["scroll", "interaction", s.t, "scroll-driven"],
      payload: `scroll-${s.t}`,
      css: `/* ${s.t} may require JS for full implementation */`,
      js: `// ${s.t}: attach scroll listener with IntersectionObserver or scroll event`,
      conflicts: ["interaction:scroll", `scroll:${s.t}`],
      family: "minimal-flat",
      meta: { type: s.t },
    });
  }

  // ===== Transition × property combinations =====
  const transitionProps = [
    { p: "color", desc: "color and background-color transitions", css: "color, background-color" },
    { p: "transform", desc: "transform transitions for scale, rotate, translate", css: "transform" },
    { p: "opacity", desc: "opacity transitions for fade effects", css: "opacity" },
    { p: "shadow", desc: "box-shadow transitions for elevation changes", css: "box-shadow" },
    { p: "all", desc: "all-property transitions for universal state changes", css: "all" },
  ];
  for (const tp of transitionProps) {
    for (const e of easings) {
      for (const d of [150, 250, 400, 700]) {
        add({
          name: `transition ${e.name} ${d}ms ${tp.p}`,
          semantic_description: `${e.desc} Applied to ${tp.desc} at ${d}ms duration — ${d < 250 ? "snappy micro-interaction" : d > 500 ? "deliberate, cinematic motion" : "balanced default"}. ${pick(MOOD_POOL, n+1).charAt(0).toUpperCase() + pick(MOOD_POOL, n+1).slice(1)} and ${pick(INTENSITY_POOL, n+2)} for ${pick(USE_CASE_POOL, n+3)}.`,
          tags: ["transition", "easing", e.name, `duration-${d}`, tp.p],
          payload: `transition-${e.name}-${d}-${tp.p}`,
          css: `.transition-${e.name}-${d}-${tp.p} { transition:${tp.css} ${d}ms ${e.value}; }`,
          conflicts: ["interaction:transition-prop", `transition-prop:${tp.p}`, `transition-easing:${e.name}`, `transition-duration:${d}`],
          family: "minimal-flat",
          meta: { easing: e.name, duration: d, property: tp.p },
        });
      }
    }
  }

  // ===== Animation × duration variants =====
  for (const a of animations) {
    for (const d of ["fast", "normal", "slow"]) {
      const ms = d === "fast" ? 300 : d === "normal" ? 600 : 1200;
      add({
        name: `${a.t} ${d}`,
        semantic_description: `${a.desc} ${d.charAt(0).toUpperCase() + d.slice(1)} duration variant at ${ms}ms — ${d === "fast" ? "snappy, energetic feel" : d === "slow" ? "deliberate, cinematic pacing" : "balanced default speed"}. ${pick(MOOD_POOL, n+1).charAt(0).toUpperCase() + pick(MOOD_POOL, n+1).slice(1)} motion for ${pick(USE_CASE_POOL, n+2)}.`,
        tags: ["animation", a.t, d, "duration"],
        payload: `anim-${a.t}-${d}`,
        css: `.anim-${a.t}-${d} { animation-duration:${ms}ms; }`,
        conflicts: ["interaction:animation-duration", `anim-duration:${a.t}-${d}`],
        family: a.family,
        meta: { type: a.t, duration: d, ms },
      });
    }
  }

  // ===== Animation × easing variants =====
  for (const a of animations) {
    for (const e of easings.slice(0, 4)) {
      add({
        name: `${a.t} ${e.name}`,
        semantic_description: `${a.desc} With ${e.name} easing — ${e.desc.toLowerCase()} ${pick(MOOD_POOL, n+1).charAt(0).toUpperCase() + pick(MOOD_POOL, n+1).slice(1)} motion feel for ${pick(USE_CASE_POOL, n+2)}.`,
        tags: ["animation", a.t, e.name, "easing"],
        payload: `anim-${a.t}-${e.name}`,
        css: `.anim-${a.t}-${e.name} { animation-timing-function:${e.value}; }`,
        conflicts: ["interaction:animation-easing", `anim-easing:${a.t}-${e.name}`],
        family: a.family,
        meta: { type: a.t, easing: e.name },
      });
    }
  }

  // ===== Hover × intensity variants =====
  for (const h of hoverEffects) {
    for (const intensity of ["subtle", "pronounced"]) {
      add({
        name: `hover ${h.t} ${intensity}`,
        semantic_description: `${h.desc} ${intensity === "subtle" ? "Subtle intensity variant — reduced effect magnitude for refined, understated feedback." : "Pronounced intensity variant — amplified effect magnitude for bold, attention-grabbing feedback."} ${pick(MOOD_POOL, n+1).charAt(0).toUpperCase() + pick(MOOD_POOL, n+1).slice(1)} for ${pick(USE_CASE_POOL, n+2)}.`,
        tags: ["hover", "interaction", h.t, intensity],
        payload: `hover-${h.t}-${intensity}`,
        css: `.hover-${h.t}-${intensity} { ${intensity === "subtle" ? "--hover-scale:0.5;" : "--hover-scale:1.5;"} }`,
        conflicts: ["interaction:hover-intensity", `hover-intensity:${h.t}-${intensity}`],
        family: h.family,
        meta: { type: h.t, intensity },
      });
    }
  }

  // ===== Focus × color variants =====
  const focusColors = [
    { name: "indigo", color: "#6366f1" },
    { name: "blue", color: "#3b82f6" },
    { name: "green", color: "#22c55e" },
    { name: "rose", color: "#f43f5e" },
  ];
  for (const f of focusStates) {
    for (const c of focusColors) {
      add({
        name: `focus ${f.t} ${c.name}`,
        semantic_description: `${f.desc} Rendered in ${c.name} (${c.color}) — color-tinted focus indicator for brand-aligned accessibility. ${pick(MOOD_POOL, n+1).charAt(0).toUpperCase() + pick(MOOD_POOL, n+1).slice(1)} for ${pick(USE_CASE_POOL, n+2)}.`,
        tags: ["focus", "a11y", "keyboard", f.t, c.name],
        payload: `focus-${f.t}-${c.name}`,
        css: `.focus-${f.t}-${c.name}:focus-visible { outline:2px solid ${c.color}; outline-offset:2px; }`,
        accessibility: { focusVisible: true, aria: [] },
        conflicts: ["interaction:focus-color", `focus-color:${f.t}-${c.name}`],
        family: "minimal-flat",
        meta: { type: f.t, color: c.name },
      });
    }
  }

  // ===== More JS snippets =====
  const moreJsSnippets: Array<{ t: string; desc: string; js: string; tags: string[] }> = [
    { t: "scroll-spy", desc: "Vanilla JS scroll-spy — highlights the active nav item based on the section currently in view. Pattern for documentation sidebars.",
      js: "const sections = document.querySelectorAll('section[id]'); const navLinks = document.querySelectorAll('[data-scroll-spy] a'); const spy = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id)); } }); }, { rootMargin:'-30% 0px -60% 0px' }); sections.forEach(s => spy.observe(s));",
      tags: ["js", "scroll-spy", "navigation", "intersection"] },
    { t: "image-zoom-modal", desc: "Vanilla JS image-zoom modal — clicking an image opens it full-size in a modal overlay. Pattern for product galleries.",
      js: "document.querySelectorAll('[data-zoomable]').forEach(img => { img.addEventListener('click', () => { const m = document.createElement('div'); m.className = 'zoom-modal'; m.innerHTML = '<img src=\"' + img.src + '\">'; m.addEventListener('click', () => m.remove()); document.body.appendChild(m); }); });",
      tags: ["js", "image", "zoom", "modal"] },
    { t: "drag-scroll", desc: "Vanilla JS drag-to-scroll — enables horizontal dragging on a scrollable container for trackpad-less navigation. Pattern for carousels.",
      js: "document.querySelectorAll('[data-drag-scroll]').forEach(el => { let isDown = false, startX, scrollLeft; el.addEventListener('mousedown', (e) => { isDown = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft; }); el.addEventListener('mouseleave', () => isDown = false); el.addEventListener('mouseup', () => isDown = false); el.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX) * 2; }); });",
      tags: ["js", "drag", "scroll", "carousel"] },
    { t: "count-up-trigger", desc: "Vanilla JS count-up trigger — animates a number from 0 to its target when it scrolls into view. Pattern for stats sections.",
      js: "function animateCount(el, target, ms=1500) { const start = performance.now(); function tick(now) { const p = Math.min((now - start) / ms, 1); el.textContent = Math.floor(p * target).toLocaleString(); if (p < 1) requestAnimationFrame(tick); } requestAnimationFrame(tick); } const io = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target, parseInt(e.target.dataset.count, 10)); io.unobserve(e.target); } }); }); document.querySelectorAll('[data-count]').forEach(el => io.observe(el));",
      tags: ["js", "count-up", "animation", "intersection"] },
    { t: "keyboard-shortcut", desc: "Vanilla JS keyboard shortcut handler — registers a global keyboard shortcut and triggers a callback. Pattern for power-user features.",
      js: "function registerShortcut(keys, callback) { document.addEventListener('keydown', (e) => { const parts = keys.toLowerCase().split('+'); const key = parts[parts.length - 1]; const needCtrl = parts.includes('ctrl'); const needMeta = parts.includes('cmd'); const needShift = parts.includes('shift'); const needAlt = parts.includes('alt'); if (e.key.toLowerCase() === key && !!e.ctrlKey === needCtrl && !!e.metaKey === needMeta && !!e.shiftKey === needShift && !!e.altKey === needAlt) { e.preventDefault(); callback(e); } }); }",
      tags: ["js", "keyboard", "shortcut", "hotkey"] },
    { t: "local-storage-pref", desc: "Vanilla JS localStorage preference — persists a user preference (like theme or layout density) across sessions.",
      js: "function getPref(key, fallback) { try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; } } function setPref(key, value) { try { localStorage.setItem(key, value); } catch (e) { console.warn('localStorage', e); } }",
      tags: ["js", "local-storage", "preference", "persist"] },
    { t: "debounce-input", desc: "Vanilla JS debounce — delays a callback until input pauses for a specified duration. Pattern for search-as-you-type.",
      js: "function debounce(fn, ms=300) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; }",
      tags: ["js", "debounce", "input", "performance"] },
    { t: "throttle-scroll", desc: "Vanilla JS throttle — limits a callback to once per specified duration. Pattern for scroll-event handlers.",
      js: "function throttle(fn, ms=100) { let last = 0; return (...args) => { const now = Date.now(); if (now - last >= ms) { last = now; fn(...args); } }; }",
      tags: ["js", "throttle", "scroll", "performance"] },
    { t: "virtual-list", desc: "Vanilla JS virtual list — renders only visible items for performant long lists. Pattern for tables with 1000+ rows.",
      js: "function virtualList(container, items, rowH, render) { const viewport = container.parentElement; const total = items.length * rowH; container.style.height = total + 'px'; function update() { const start = Math.floor(viewport.scrollTop / rowH); const end = Math.min(start + Math.ceil(viewport.clientHeight / rowH) + 2, items.length); container.innerHTML = ''; for (let i = start; i < end; i++) { const el = render(items[i], i); el.style.position = 'absolute'; el.style.top = (i * rowH) + 'px'; container.appendChild(el); } } viewport.addEventListener('scroll', update, { passive:true }); update(); }",
      tags: ["js", "virtual-list", "performance", "scroll"] },
    { t: "websocket-connect", desc: "Vanilla JS WebSocket connection — establishes a real-time bidirectional connection for live updates. Pattern for chat and dashboards.",
      js: "function connectWS(url, onMessage) { const ws = new WebSocket(url); ws.addEventListener('message', (e) => { try { onMessage(JSON.parse(e.data)); } catch (err) { console.warn('ws', err); } }); ws.addEventListener('close', () => setTimeout(() => connectWS(url, onMessage), 3000)); return ws; }",
      tags: ["js", "websocket", "realtime", "chat"] },
    { t: "form-autosave", desc: "Vanilla JS form autosave — periodically saves form values to localStorage, restoring on reload. Pattern for long forms.",
      js: "function autosaveForm(form, key, ms=2000) { const save = () => { const data = Object.fromEntries(new FormData(form).entries()); try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {} }; form.addEventListener('input', debounce(save, ms)); try { const saved = JSON.parse(localStorage.getItem(key) || '{}'); Object.entries(saved).forEach(([k, v]) => { const f = form.elements[k]; if (f) f.value = v; }); } catch (e) {} }",
      tags: ["js", "form", "autosave", "local-storage"] },
    { t: "infinite-scroll-loader", desc: "Vanilla JS infinite scroll loader — appends a sentinel that triggers content load when intersecting. Pattern for feeds.",
      js: "const sentinel = document.querySelector('[data-infinite-sentinel]'); if (sentinel) { const io = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) { loadMoreContent(); } }); io.observe(sentinel); }",
      tags: ["js", "infinite-scroll", "loader", "intersection"] },
    { t: "share-button", desc: "Vanilla JS share button using the Web Share API with a clipboard fallback — native sharing on mobile, copy-link on desktop.",
      js: "async function share(opts) { if (navigator.share) { try { await navigator.share(opts); return true; } catch (e) { return false; } } else { await navigator.clipboard.writeText(opts.url); return 'copied'; } }",
      tags: ["js", "share", "web-share", "clipboard"] },
    { t: "geolocation", desc: "Vanilla JS geolocation — requests the user's location with permission. Pattern for store-finder and weather apps.",
      js: "function getLocation() { return new Promise((resolve, reject) => { if (!navigator.geolocation) return reject(new Error('unsupported')); navigator.geolocation.getCurrentPosition( pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }), err => reject(err), { enableHighAccuracy:true, timeout:10000 } ); }); }",
      tags: ["js", "geolocation", "location", "permission"] },
    { t: "media-query-react", desc: "Vanilla JS media query react — runs callbacks when a media query matches or unmatches. Pattern for responsive JS behaviors.",
      js: "function onMediaQuery(query, match, unmatch) { const mql = window.matchMedia(query); const handler = (e) => e.matches ? match(e) : unmatch(e); mql.addEventListener('change', handler); handler(mql); return () => mql.removeEventListener('change', handler); }",
      tags: ["js", "media-query", "responsive", "matchmedia"] },
    { t: "intersection-pause", desc: "Vanilla JS intersection-pause — pauses animations/videos when offscreen for performance. Pattern for autoplaying media.",
      js: "document.querySelectorAll('[data-pause-offscreen]').forEach(el => { const io = new IntersectionObserver((entries) => { entries.forEach(e => { el.style.animationPlayState = e.isIntersecting ? 'running' : 'paused'; if (el.tagName === 'VIDEO') e.isIntersecting ? el.play() : el.pause(); }); }); io.observe(el); });",
      tags: ["js", "intersection", "pause", "performance"] },
    { t: "resize-observer-fit", desc: "Vanilla JS ResizeObserver fit — recomputes layout when an element resizes. Pattern for container-query-style behaviors.",
      js: "const ro = new ResizeObserver((entries) => { entries.forEach(e => { const w = e.contentRect.width; e.target.classList.toggle('compact', w < 400); e.target.classList.toggle('expanded', w > 800); }); }); document.querySelectorAll('[data-fit]').forEach(el => ro.observe(el));",
      tags: ["js", "resize-observer", "layout", "responsive"] },
    { t: "clipboard-paste", desc: "Vanilla JS clipboard paste — reads pasted content from the clipboard API. Pattern for image-paste upload.",
      js: "document.addEventListener('paste', (e) => { const items = e.clipboardData?.items || []; for (const item of items) { if (item.type.startsWith('image/')) { const file = item.getAsFile(); handlePastedImage(file); break; } } });",
      tags: ["js", "clipboard", "paste", "image"] },
    { t: "pointer-detect", desc: "Vanilla JS pointer-type detection — adds a class to documentElement indicating the current pointer type (mouse, touch, pen).",
      js: "function detectPointer() { document.documentElement.classList.remove('pointer-mouse', 'pointer-touch', 'pointer-pen'); if (window.matchMedia('(pointer: coarse)').matches) document.documentElement.classList.add('pointer-touch'); else if (window.matchMedia('(pointer: fine)').matches) document.documentElement.classList.add('pointer-mouse'); } detectPointer(); window.addEventListener('pointerdown', detectPointer);",
      tags: ["js", "pointer", "detect", "touch"] },
    { t: "view-transition-nav", desc: "Vanilla JS view-transition navigation — uses the View Transition API for smooth SPA page transitions. Modern 2025 pattern.",
      js: "async function navigateWithTransition(url) { if (!document.startViewTransition) { location.href = url; return; } await document.startViewTransition(async () => { history.pushState({}, '', url); await fetchPageContent(url); }).finished; }",
      tags: ["js", "view-transition", "navigation", "spa"] },
  ];
  for (const s of moreJsSnippets) {
    add({
      name: `js ${s.t}`,
      semantic_description: s.desc,
      tags: s.tags,
      payload: `js-${s.t}`,
      js: s.js,
      conflicts: ["interaction:js", `js:${s.t}`],
      family: "minimal-flat",
      meta: { type: s.t, language: "javascript" },
    });
  }

  // ===== Stagger variants =====
  const staggerCounts = [3, 5, 8, 10, 15];
  for (const count of staggerCounts) {
    add({
      name: `stagger ${count}-item`,
      semantic_description: `Stagger animation with ${count} items revealing in sequence — each child appears ${50 + count * 5}ms after the previous, creating a ${count < 5 ? "tight, quick cascade" : count > 10 ? "long, deliberate reveal" : "balanced cascade"}. Pattern for grids and lists.`,
      tags: ["animation", "stagger", "reveal", `${count}-item`],
      payload: `anim-stagger-${count}`,
      css: `.anim-stagger-${count} > * { opacity:0; animation:fade-in-up .5s ease-out forwards; } ${Array.from({length: count}, (_, i) => `.anim-stagger-${count} > *:nth-child(${i+1}) { animation-delay:${i * 60}ms; }`).join(" ")}`,
      conflicts: ["interaction:animation-stagger", `stagger-count:${count}`],
      family: "minimal-flat",
      meta: { type: "stagger", count },
    });
  }

  // ===== More cursor & scroll effects =====
  const moreCursor = [
    { t: "cursor-blob", desc: "Custom cursor rendering a large soft blob following the mouse with easing — creative-agency pattern for immersive hero sections." },
    { t: "cursor-text", desc: "Custom cursor rendering text that follows the mouse — interactive hover-state labeling for portfolio grids." },
    { t: "cursor-image", desc: "Custom cursor rendering a thumbnail image on hover over a link — pattern for portfolio and gallery sites." },
    { t: "cursor-mix-blend", desc: "Custom cursor using mix-blend-mode:difference — inverts colors under the cursor for high-contrast experimental designs." },
    { t: "cursor-spring", desc: "Spring-easing custom cursor with bouncy lag — playful interaction for creative-agency and design-studio sites." },
  ];
  for (const c of moreCursor) {
    add({
      name: `cursor ${c.t}`,
      semantic_description: c.desc,
      tags: ["cursor", "interaction", c.t, "mouse"],
      payload: `cursor-${c.t}`,
      css: `/* ${c.t} requires JS */`,
      js: `// ${c.t}: track mousemove with rAF, update cursor element position`,
      conflicts: ["interaction:cursor", `cursor:${c.t}`],
      family: "minimal-flat",
      meta: { type: c.t },
    });
  }
  const moreScroll = [
    { t: "scroll-driven-highlight", desc: "Scroll-driven highlight animating based on scroll position using CSS scroll-timeline — modern 2025 pattern without JS." },
    { t: "scroll-velocity-blur", desc: "Scroll velocity blur applying blur proportional to scroll speed — kinetic feedback for fast scrolling." },
    { t: "scroll-section-pins", desc: "Scroll-pinned sections that stick during scroll — pattern for storytelling and step-by-step reveals." },
    { t: "scroll-rotate", desc: "Scroll-driven rotation — element rotates based on scroll position for kinetic decorative elements." },
    { t: "scroll-color-shift", desc: "Scroll-driven color shift — background color transitions as the user scrolls through sections." },
  ];
  for (const s of moreScroll) {
    add({
      name: `scroll ${s.t}`,
      semantic_description: s.desc,
      tags: ["scroll", "interaction", s.t, "scroll-driven"],
      payload: `scroll-${s.t}`,
      css: `/* ${s.t} may require JS or scroll-timeline */`,
      js: `// ${s.t}: attach scroll listener`,
      conflicts: ["interaction:scroll", `scroll:${s.t}`],
      family: "minimal-flat",
      meta: { type: s.t },
    });
  }

  return out;
}

/* ----------------------------- UTILITIES ----------------------------- */
function buildUtilities(): LexiconEntry[] {
  const out: LexiconEntry[] = [];
  let n = 0;
  const add = (e: Omit<LexiconEntry, "id" | "category">) => {
    n++;
    out.push({ id: `utilities.${pad(n)}`, category: "utilities", ...e });
  };

  // ===== Spacing =====
  const spacingScales = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96];
  for (const s of spacingScales) {
    const px = s * 4;
    add({
      name: `padding ${s} (${px}px)`,
      semantic_description: `Padding utility at scale ${s} (${px}px) — applies uniform padding to all sides of an element. ${px === 0 ? "Zero padding resets." : px < 16 ? "Tight, compact spacing." : px > 48 ? "Generous, airy spacing for hero sections." : "Balanced default spacing."}`,
      tags: ["padding", "spacing", `p-${s}`, "utility"],
      payload: `p-${s}`,
      css: `.p-${s} { padding:${px}px; }`,
      conflicts: [`spacing:padding-${s}`],
      family: "minimal-flat",
      meta: { scale: s, px, type: "padding" },
    });
    add({
      name: `margin ${s} (${px}px)`,
      semantic_description: `Margin utility at scale ${s} (${px}px) — applies uniform margin around the element. ${px === 0 ? "Zero margin resets." : px < 16 ? "Tight spacing between siblings." : px > 48 ? "Generous separation between sections." : "Standard sibling spacing."}`,
      tags: ["margin", "spacing", `m-${s}`, "utility"],
      payload: `m-${s}`,
      css: `.m-${s} { margin:${px}px; }`,
      conflicts: [`spacing:margin-${s}`],
      family: "minimal-flat",
      meta: { scale: s, px, type: "margin" },
    });
    if (s > 0) {
      add({
        name: `gap ${s} (${px}px)`,
        semantic_description: `Gap utility at scale ${s} (${px}px) for flex and grid children — controls spacing between siblings without affecting outer margins. ${px < 16 ? "Tight, dense grouping." : px > 32 ? "Airy, breathing layout." : "Balanced default gap."}`,
        tags: ["gap", "spacing", `gap-${s}`, "utility", "flex", "grid"],
        payload: `gap-${s}`,
        css: `.gap-${s} { gap:${px}px; }`,
        conflicts: [`spacing:gap-${s}`],
        family: "minimal-flat",
        meta: { scale: s, px, type: "gap" },
      });
    }
  }
  // Directional padding/margin
  const directions = [
    { d: "t", side: "top" }, { d: "r", side: "right" }, { d: "b", side: "bottom" }, { d: "l", side: "left" },
    { d: "x", side: "horizontal" }, { d: "y", side: "vertical" },
  ];
  for (const dir of directions) {
    for (const s of [0, 2, 4, 6, 8, 12, 16, 24, 32]) {
      const px = s * 4;
      add({
        name: `padding-${dir.d} ${s} (${px}px)`,
        semantic_description: `Padding ${dir.side} utility at scale ${s} (${px}px) — applies padding only on the ${dir.side} ${dir.side === "horizontal" || dir.side === "vertical" ? "axes" : "side"}. Useful for asymmetric spacing.`,
        tags: ["padding", "spacing", `p${dir.d}-${s}`, "directional"],
        payload: `p${dir.d}-${s}`,
        css: `.p${dir.d}-${s} { padding-${dir.side === "horizontal" ? "left" : dir.side === "vertical" ? "top" : dir.side}:${px}px; ${dir.side === "horizontal" ? `padding-right:${px}px;` : dir.side === "vertical" ? `padding-bottom:${px}px;` : ""} }`,
        conflicts: [`spacing:p${dir.d}-${s}`],
        family: "minimal-flat",
        meta: { scale: s, px, direction: dir.d, type: "padding" },
      });
    }
  }

  // ===== Safe-area insets =====
  const safeAreas = [
    { t: "top", desc: "Safe-area top inset for notched phones — prevents content from being clipped by the notch or status bar." },
    { t: "bottom", desc: "Safe-area bottom inset for home-indicator phones — prevents content from being obscured by the home indicator bar." },
    { t: "left", desc: "Safe-area left inset for landscape-mode notched phones — prevents content from being clipped on the left edge." },
    { t: "right", desc: "Safe-area right inset for landscape-mode notched phones — prevents content from being clipped on the right edge." },
    { t: "all", desc: "Safe-area inset on all sides — comprehensive padding for full-bleed content on notched devices." },
  ];
  for (const s of safeAreas) {
    add({
      name: `safe-area ${s.t}`,
      semantic_description: s.desc,
      tags: ["safe-area", "inset", "mobile", s.t, "notch"],
      payload: `safe-area-${s.t}`,
      css: `.safe-area-${s.t} { padding-${s.t === "all" ? "top" : s.t}:env(safe-area-inset-${s.t === "all" ? "top" : s.t}); ${s.t === "all" ? "padding-right:env(safe-area-inset-right); padding-bottom:env(safe-area-inset-bottom); padding-left:env(safe-area-inset-left);" : ""} }`,
      conflicts: [`safe-area:${s.t}`],
      family: "minimal-flat",
      meta: { side: s.t },
    });
  }

  // ===== Visibility =====
  const visibility = [
    { t: "hidden", desc: "Hidden utility setting display:none — completely removes the element from layout and accessibility tree." },
    { t: "responsive-show-mobile", desc: "Show on mobile only — element is visible below the sm breakpoint and hidden above. Pattern for mobile-only nav triggers." },
    { t: "responsive-show-tablet", desc: "Show on tablet only — element is visible only in the md breakpoint range." },
    { t: "responsive-show-desktop", desc: "Show on desktop only — element is hidden on mobile and tablet, visible from lg breakpoint up." },
    { t: "responsive-hide-mobile", desc: "Hide on mobile only — element is hidden below the sm breakpoint, visible above. Pattern for desktop-only sidebars." },
    { t: "responsive-hide-tablet", desc: "Hide on tablet only — element is visible on mobile and desktop, hidden in the md range." },
    { t: "responsive-hide-desktop", desc: "Hide on desktop only — element is visible on mobile and tablet, hidden from lg breakpoint up." },
    { t: "visually-hidden", desc: "Visually-hidden utility — hides content visually while keeping it accessible to screen readers. Essential for sr-only labels." },
    { t: "sr-only", desc: "Screen-reader-only utility — alias for visually-hidden. Hides content from sighted users while exposing it to assistive tech." },
    { t: "print-show", desc: "Print-show utility — element is hidden on screen but visible when printing. Pattern for print-only headers and footers." },
    { t: "print-hide", desc: "Print-hide utility — element is visible on screen but hidden when printing. Pattern for hiding nav and ads in print output." },
    { t: "not-sr-only", desc: "Not-sr-only utility — restores visually-hidden content back to visible. Used in combination with sr-only for toggle patterns." },
  ];
  for (const v of visibility) {
    add({
      name: v.t,
      semantic_description: v.desc,
      tags: ["visibility", "responsive", "a11y", v.t],
      payload: v.t,
      css: v.t === "visually-hidden" || v.t === "sr-only"
        ? `.${v.t} { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }`
        : v.t === "hidden"
        ? `.hidden { display:none; }`
        : v.t.startsWith("print-")
        ? `@media print { .${v.t} { ${v.t === "print-show" ? "display:block" : "display:none"}; } }`
        : `.${v.t} { /* responsive variant */ }`,
      conflicts: [`visibility:${v.t}`],
      family: "minimal-flat",
      meta: { type: v.t },
    });
  }

  // ===== Overflow =====
  const overflowTypes = ["hidden", "scroll", "auto", "clip", "visible"];
  for (const o of overflowTypes) {
    add({
      name: `overflow ${o}`,
      semantic_description: `Overflow ${o} utility — ${o === "hidden" ? "clips overflowing content" : o === "scroll" ? "always shows scrollbars" : o === "auto" ? "shows scrollbars only when needed" : o === "clip" ? "clips without scroll container" : "allows overflow to be visible"}. For controlling content that exceeds its container.`,
      tags: ["overflow", o, "scroll", "clip"],
      payload: `overflow-${o}`,
      css: `.overflow-${o} { overflow:${o}; }`,
      conflicts: [`overflow:${o}`],
      family: "minimal-flat",
      meta: { type: o },
    });
    // Directional variants
    for (const dir of ["x", "y"]) {
      add({
        name: `overflow-${dir} ${o}`,
        semantic_description: `Overflow-${dir} ${o} utility — applies overflow control only on the ${dir === "x" ? "horizontal" : "vertical"} axis. For horizontal scroll containers and vertical clip contexts.`,
        tags: ["overflow", o, dir, "directional"],
        payload: `overflow-${dir}-${o}`,
        css: `.overflow-${dir}-${o} { overflow-${dir}:${o}; }`,
        conflicts: [`overflow-${dir}:${o}`],
        family: "minimal-flat",
        meta: { type: o, axis: dir },
      });
    }
  }
  // Scrollbar styling
  const scrollbarStyles = [
    { t: "thin", desc: "Thin scrollbar using scrollbar-width:thin — modern minimalist scrollbar for content areas." },
    { t: "none", desc: "Hidden scrollbar using scrollbar-width:none — completely hides the scrollbar while preserving scroll functionality. Pattern for carousels." },
    { t: "custom-webkit", desc: "Custom-styled webkit scrollbar with themed colors — fully custom appearance for Chromium/Safari." },
    { t: "dark-overlay", desc: "Dark-overlay scrollbar for dark-mode UIs — dark thumb on a darker track." },
  ];
  for (const s of scrollbarStyles) {
    add({
      name: `scrollbar ${s.t}`,
      semantic_description: s.desc,
      tags: ["scrollbar", "styling", s.t],
      payload: `scrollbar-${s.t}`,
      css: `.scrollbar-${s.t} { ${s.t === "thin" ? "scrollbar-width:thin;" : s.t === "none" ? "scrollbar-width:none; -ms-overflow-style:none;" : ""} } ${s.t === "none" ? ".scrollbar-none::-webkit-scrollbar { display:none; }" : s.t === "custom-webkit" ? ".scrollbar-custom-webkit::-webkit-scrollbar { width:8px; } .scrollbar-custom-webkit::-webkit-scrollbar-thumb { background:#888; border-radius:4px; }" : ""}`,
      conflicts: [`scrollbar:${s.t}`],
      family: "minimal-flat",
      meta: { type: s.t },
    });
  }
  // Line clamp
  for (const lc of [1, 2, 3, 4, 5, 6]) {
    add({
      name: `line-clamp ${lc}`,
      semantic_description: `Line-clamp ${lc} utility truncating text to ${lc} line${lc > 1 ? "s" : ""} with an ellipsis — content-card summary pattern preventing text overflow.`,
      tags: ["line-clamp", "truncate", "text", `clamp-${lc}`],
      payload: `line-clamp-${lc}`,
      css: `.line-clamp-${lc} { display:-webkit-box; -webkit-line-clamp:${lc}; -webkit-box-orient:vertical; overflow:hidden; }`,
      conflicts: [`line-clamp:${lc}`],
      family: "minimal-flat",
      meta: { lines: lc },
    });
  }

  // ===== Z-index layers =====
  const zLayers = [
    { name: "base", value: 0, desc: "Base z-index (0) — default stacking context for normal content flow." },
    { name: "dropdown", value: 1000, desc: "Dropdown z-index (1000) — sits above content but below sticky elements. For dropdowns and popovers." },
    { name: "sticky", value: 1100, desc: "Sticky z-index (1100) — for sticky headers and sidebars that overlay content on scroll." },
    { name: "overlay", value: 1200, desc: "Overlay z-index (1200) — for modal backdrops and dim layers." },
    { name: "modal", value: 1300, desc: "Modal z-index (1300) — for modal dialogs above the backdrop overlay." },
    { name: "toast", value: 1400, desc: "Toast z-index (1400) — for transient notifications above modals." },
    { name: "tooltip", value: 1500, desc: "Tooltip z-index (1500) — highest layer for tooltips above all other UI." },
    { name: "devtools", value: 9999, desc: "Devtools z-index (9999) — for debug overlays and dev tooling above everything." },
  ];
  for (const z of zLayers) {
    add({
      name: `z-index ${z.name}`,
      semantic_description: z.desc,
      tags: ["z-index", "stacking", z.name, "layer"],
      payload: `z-${z.name}`,
      css: `.z-${z.name} { z-index:${z.value}; }`,
      conflicts: [`z-index:${z.name}`],
      family: "minimal-flat",
      meta: { layer: z.name, value: z.value },
    });
  }

  // ===== ARIA attribute patterns =====
  const ariaPatterns = [
    { t: "role-button", desc: "ARIA role=button pattern — promotes a non-button element to button semantics. Use sparingly; prefer native <button>." },
    { t: "role-dialog", desc: "ARIA role=dialog pattern for modal dialogs — pairs with aria-modal=true and aria-labelledby." },
    { t: "aria-label", desc: "aria-label pattern providing an accessible name for icon-only buttons and unlabeled controls." },
    { t: "aria-expanded", desc: "aria-expanded pattern indicating the open/closed state of disclosure widgets — toggled by JS." },
    { t: "aria-hidden", desc: "aria-hidden=true pattern hiding decorative or duplicated content from screen readers." },
    { t: "aria-live-polite", desc: "aria-live=polite pattern announcing dynamic updates without interrupting the user — for toasts and progress." },
    { t: "aria-live-assertive", desc: "aria-live=assertive pattern announcing urgent updates immediately — for critical errors and alerts." },
    { t: "aria-describedby", desc: "aria-describedby pattern linking an element to its description text — for inputs with helper text." },
    { t: "aria-invalid", desc: "aria-invalid pattern marking a form field as having a validation error — pairs with aria-describedby for the error message." },
    { t: "aria-current", desc: "aria-current=page pattern marking the current page in a navigation list — improves wayfinding for screen reader users." },
    { t: "skip-link", desc: "Skip-to-content link pattern — first-focusable link allowing keyboard users to bypass repetitive nav. Essential for a11y." },
    { t: "focus-trap", desc: "Focus-trap pattern confining Tab navigation within a modal — prevents focus from escaping to background content." },
  ];
  for (const a of ariaPatterns) {
    add({
      name: a.t,
      semantic_description: a.desc,
      tags: ["aria", "a11y", "accessibility", a.t],
      payload: a.t,
      css: `.${a.t} { /* aria attributes are semantic, applied via HTML */ }`,
      accessibility: { aria: [a.t], focusVisible: a.t === "focus-trap" || a.t === "skip-link" },
      conflicts: [`aria:${a.t}`],
      family: "minimal-flat",
      meta: { pattern: a.t },
    });
  }

  // ===== Flex/grid quick utilities =====
  const quickUtils = [
    { t: "flex-center", desc: "Flex center utility combining items-center and justify-center — quick centering pattern for absolute centering of children." },
    { t: "flex-between", desc: "Flex space-between utility — quick pattern for navbar-like layouts with children pushed to edges." },
    { t: "grid-center", desc: "Grid place-items-center utility — quick pattern for centering children in a grid container." },
    { t: "grid-2-equal", desc: "Grid 2-equal utility — quick two-column equal grid without writing custom CSS." },
    { t: "grid-3-equal", desc: "Grid 3-equal utility — quick three-column equal grid." },
    { t: "grid-4-equal", desc: "Grid 4-equal utility — quick four-column equal grid." },
    { t: "stack-y", desc: "Stack-y utility — vertical flex stack with consistent gap. The default vertical rhythm pattern." },
    { t: "cluster", desc: "Cluster utility — wrapping flex row with gap, used for chip groups and tag clusters." },
    { t: "sidebar-main", desc: "Sidebar-main utility — two-column grid with fixed sidebar and fluid main, classic app-shell pattern." },
    { t: "switcher", desc: "Switcher utility — flex row that switches to column below a threshold width. Modern responsive pattern without media queries." },
  ];
  for (const u of quickUtils) {
    add({
      name: u.t,
      semantic_description: u.desc,
      tags: ["utility", "flex", "grid", u.t, "layout"],
      payload: u.t,
      css: `.${u.t} { display:flex; } /* specific layout varies */`,
      conflicts: [`quick-util:${u.t}`],
      family: "minimal-flat",
      meta: { type: u.t },
    });
  }

  // ===== Container widths =====
  const containerWidths = [
    { t: "max-w-xs", value: "320px", desc: "Extra-small container max-width 320px — for narrow form panels and single-column compact content." },
    { t: "max-w-sm", value: "384px", desc: "Small container max-width 384px — for narrow article columns and sidebar content." },
    { t: "max-w-md", value: "448px", desc: "Medium container max-width 448px — for medium form panels and narrow content cards." },
    { t: "max-w-lg", value: "512px", desc: "Large container max-width 512px — for standard form panels and login cards." },
    { t: "max-w-xl", value: "576px", desc: "Extra-large container max-width 576px — for wider form panels and primary cards." },
    { t: "max-w-2xl", value: "672px", desc: "2xl container max-width 672px — for narrow article bodies and blog post columns." },
    { t: "max-w-3xl", value: "768px", desc: "3xl container max-width 768px — for standard article bodies and content columns." },
    { t: "max-w-4xl", value: "896px", desc: "4xl container max-width 896px — for wide article bodies and feature sections." },
    { t: "max-w-5xl", value: "1024px", desc: "5xl container max-width 1024px — for narrow marketing pages and landing sections." },
    { t: "max-w-6xl", value: "1152px", desc: "6xl container max-width 1152px — standard marketing page container width." },
    { t: "max-w-7xl", value: "1280px", desc: "7xl container max-width 1280px — wide marketing page container, the SaaS default." },
    { t: "max-w-prose", value: "65ch", desc: "Prose container max-width 65ch — typographic best practice for long-form article readability." },
    { t: "max-w-full", value: "100%", desc: "Full-width container max-width 100% — for full-bleed sections and edge-to-edge content." },
  ];
  for (const c of containerWidths) {
    add({
      name: c.t,
      semantic_description: c.desc,
      tags: ["container", "max-width", c.t, "layout"],
      payload: c.t,
      css: `.${c.t} { max-width:${c.value}; }`,
      conflicts: ["container:max-width", `container:${c.t}`],
      family: "minimal-flat",
      meta: { maxWidth: c.value },
    });
  }

  // ===== Aspect ratios =====
  const aspectRatios = [
    { t: "square", value: "1 / 1", desc: "Square aspect ratio 1:1 — for avatar thumbnails and uniform product images." },
    { t: "video", value: "16 / 9", desc: "Video aspect ratio 16:9 — for embedded videos and hero media, the YouTube standard." },
    { t: "classic-photo", value: "4 / 3", desc: "Classic photo aspect ratio 4:3 — for older photo content and digital camera frames." },
    { t: "widescreen", value: "21 / 9", desc: "Widescreen aspect ratio 21:9 — for cinematic hero media and panoramic images." },
    { t: "portrait", value: "3 / 4", desc: "Portrait aspect ratio 3:4 — for portrait photos and mobile-screen-shaped images." },
    { t: "tall", value: "9 / 16", desc: "Tall aspect ratio 9:16 — for stories-format vertical media and mobile screens." },
    { t: "golden", value: "1.618 / 1", desc: "Golden ratio aspect ratio 1.618:1 — harmonious, classical proportion for premium hero images." },
    { t: "ultrawide", value: "32 / 9", desc: "Ultrawide aspect ratio 32:9 — for super-widescreen hero media and panoramic banners." },
  ];
  for (const a of aspectRatios) {
    add({
      name: `aspect-${a.t}`,
      semantic_description: a.desc,
      tags: ["aspect-ratio", a.t, "media", "ratio"],
      payload: `aspect-${a.t}`,
      css: `.aspect-${a.t} { aspect-ratio:${a.value}; }`,
      conflicts: [`aspect:${a.t}`],
      family: "minimal-flat",
      meta: { ratio: a.value, name: a.t },
    });
  }

  // ===== Positioning =====
  const positioning = [
    { t: "static", desc: "Position static — default positioning following normal document flow. No offset properties apply." },
    { t: "relative", desc: "Position relative — offsets from the element's normal position without affecting siblings. Foundation for absolute children." },
    { t: "absolute", desc: "Position absolute — removed from flow, positioned relative to nearest positioned ancestor. For overlays and badges." },
    { t: "fixed", desc: "Position fixed — positioned relative to the viewport, stays put during scroll. For floating buttons and persistent banners." },
    { t: "sticky", desc: "Position sticky — switches from static to fixed at a defined scroll threshold. For sticky headers and sidebars." },
  ];
  for (const p of positioning) {
    add({
      name: `position ${p.t}`,
      semantic_description: p.desc,
      tags: ["position", p.t, "layout"],
      payload: `position-${p.t}`,
      css: `.position-${p.t} { position:${p.t}; }`,
      conflicts: [`position:${p.t}`],
      family: "minimal-flat",
      meta: { type: p.t },
    });
    // Inset variants
    for (const inset of ["0", "auto"]) {
      add({
        name: `${p.t} inset ${inset}`,
        semantic_description: `${p.desc} Inset ${inset === "0" ? "all-sides zero pinning to edges" : "auto defaulting to natural position"} — for ${p.t === "fixed" || p.t === "absolute" ? "full-bleed overlay positioning" : "shifting the element"}.`,
        tags: ["position", p.t, "inset", inset],
        payload: `position-${p.t} inset-${inset}`,
        css: `.position-${p.t}.inset-${inset} { position:${p.t}; inset:${inset}; }`,
        conflicts: [`position:${p.t}`, `inset:${inset}`],
        family: "minimal-flat",
        meta: { type: p.t, inset },
      });
    }
  }

  // ===== Sizing =====
  const sizing = [
    { t: "w-full", desc: "Full-width utility setting width:100% — for elements that should fill their parent horizontally." },
    { t: "h-full", desc: "Full-height utility setting height:100% — for elements that should fill their parent vertically." },
    { t: "w-screen", desc: "Screen-width utility setting width:100vw — for full-bleed elements spanning the viewport width." },
    { t: "h-screen", desc: "Screen-height utility setting height:100vh — for full-viewport hero sections and modal layers." },
    { t: "min-h-screen", desc: "Minimum screen-height utility — ensures the element is at least as tall as the viewport. For page-shells and footer-push patterns." },
    { t: "min-h-dvh", desc: "Dynamic viewport min-height — modern 2025 alternative to vh that accounts for mobile browser chrome. Use dvh instead of vh." },
    { t: "w-fit", desc: "Fit-content width utility — element shrinks to fit its content. For inline buttons and shrink-to-fit badges." },
    { t: "h-fit", desc: "Fit-content height utility — element shrinks to fit its content vertically." },
    { t: "w-max", desc: "Max-content width utility — element expands to its maximum intrinsic width without wrapping." },
    { t: "min-w-0", desc: "Minimum-width zero utility — overrides the default min-width:auto, allowing flex/grid children to shrink below their content size." },
  ];
  for (const s of sizing) {
    add({
      name: s.t,
      semantic_description: s.desc,
      tags: ["sizing", "width", "height", s.t],
      payload: s.t,
      css: `.${s.t} { ${s.t.startsWith("w-") ? "width" : s.t.startsWith("h-") ? "height" : s.t.startsWith("min-h") ? "min-height" : s.t.startsWith("min-w") ? "min-width" : "width"}:${s.t.includes("screen") ? "100vh".replace("vh", s.t.includes("h-screen") ? "100vh" : "100vw") : s.t.includes("full") ? "100%" : s.t.includes("fit") || s.t.includes("max") ? "fit-content" : "0"}; }`,
      conflicts: [`sizing:${s.t}`],
      family: "minimal-flat",
      meta: { type: s.t },
    });
  }

  // ===== Borders & dividers =====
  const dividerUtils = [
    { t: "divide-y", desc: "Vertical divider utility — adds top borders between stacked children, creating horizontal divider lines." },
    { t: "divide-x", desc: "Horizontal divider utility — adds left borders between row children, creating vertical divider lines." },
    { t: "divide-solid", desc: "Solid divider style — solid 1px line between divided children." },
    { t: "divide-dashed", desc: "Dashed divider style — dashed line between divided children for sketch-like or temporary separators." },
    { t: "divide-reverse", desc: "Divider reverse — flips the divider direction, useful in RTL layouts." },
  ];
  for (const d of dividerUtils) {
    add({
      name: d.t,
      semantic_description: d.desc,
      tags: ["divide", "border", "separator", d.t],
      payload: d.t,
      css: `.${d.t} { /* applied via child selector */ }`,
      conflicts: [`divide:${d.t}`],
      family: "minimal-flat",
      meta: { type: d.t },
    });
  }

  // ===== Display utilities =====
  const displayUtils = ["block", "inline", "inline-block", "flex", "inline-flex", "grid", "inline-grid", "table", "contents", "list-item", "flow-root"];
  for (const d of displayUtils) {
    add({
      name: `display ${d}`,
      semantic_description: `Display ${d} utility — sets the element's display property to ${d}. ${d === "flex" ? "Flex container for one-dimensional layouts." : d === "grid" ? "Grid container for two-dimensional layouts." : d === "contents" ? "Disappears the box, letting children participate in parent layout." : d === "flow-root" ? "Establishes new block formatting context, clearing floats." : "Standard display behavior."}`,
      tags: ["display", d, "layout"],
      payload: `display-${d}`,
      css: `.display-${d} { display:${d}; }`,
      conflicts: [`display:${d}`],
      family: "minimal-flat",
      meta: { type: d },
    });
  }

  // ===== Color utilities =====
  const colorUtils = [
    { t: "bg-transparent", desc: "Transparent background utility — removes any background color, revealing whatever is behind." },
    { t: "bg-current", desc: "Current-color background utility — uses the current text color as the background. For icon-button fills matching text." },
    { t: "text-transparent", desc: "Transparent text color utility — pairs with background-clip:text for gradient-text effects." },
    { t: "text-current", desc: "Current-color text utility — uses the parent's text color (the default behavior, made explicit)." },
    { t: "bg-black-50", desc: "Black 50% overlay background — for modal backdrops and dimmed overlays." },
    { t: "bg-white-50", desc: "White 50% overlay background — for light-mode overlays and frosted-glass tints." },
    { t: "bg-gradient-current", desc: "Gradient using currentColor — for current-color-themed gradient backgrounds." },
    { t: "opacity-50", desc: "Opacity 50% utility — half-transparent element. Common for disabled and inactive states." },
    { t: "opacity-0", desc: "Opacity 0 utility — fully invisible but still occupies layout. For animation start states." },
    { t: "opacity-100", desc: "Opacity 100% utility — fully opaque (the default, made explicit). For animation end states." },
  ];
  for (const c of colorUtils) {
    add({
      name: c.t,
      semantic_description: c.desc,
      tags: ["color", "opacity", "background", c.t],
      payload: c.t,
      css: `.${c.t} { /* color/opacity utility */ }`,
      conflicts: [`color-util:${c.t}`],
      family: "minimal-flat",
      meta: { type: c.t },
    });
  }

  // ===== Transform utilities =====
  const transformUtils = [
    { t: "rotate-90", desc: "Rotate 90 degrees utility — quarter-turn clockwise rotation. For rotated badges and corner accents." },
    { t: "rotate-180", desc: "Rotate 180 degrees utility — half-turn rotation. For flip animations and upside-down elements." },
    { t: "rotate-270", desc: "Rotate 270 degrees utility — quarter-turn counter-clockwise rotation." },
    { t: "scale-105", desc: "Scale 1.05 utility — 5% upscale. Common hover state for buttons and cards." },
    { t: "scale-95", desc: "Scale 0.95 utility — 5% downscale. Common active state for pressable elements." },
    { t: "flip-horizontal", desc: "Flip horizontal utility — mirrors the element along the vertical axis. For RTL-aware icons." },
    { t: "flip-vertical", desc: "Flip vertical utility — mirrors the element along the horizontal axis." },
    { t: "translate-x-full", desc: "Translate-x full utility — shifts element 100% of its own width to the right. For off-canvas drawer states." },
    { t: "-translate-x-full", desc: "Negative translate-x full utility — shifts element 100% off-screen to the left. For hidden drawer states." },
    { t: "skew-x-12", desc: "Skew-x 12 degrees utility — shears the element horizontally. For brutalist and italic-effect designs." },
  ];
  for (const t of transformUtils) {
    add({
      name: t.t,
      semantic_description: t.desc,
      tags: ["transform", "rotate", "scale", "translate", t.t],
      payload: t.t,
      css: `.${t.t} { transform:${t.t.includes("rotate") ? `rotate(${t.t.split("-")[1]}deg)` : t.t.includes("scale") ? `scale(${parseInt(t.t.split("-")[1])/100})` : t.t.includes("translate") ? `translateX(${t.t.startsWith("-") ? "-" : ""}100%)` : t.t.includes("flip-horizontal") ? "scaleX(-1)" : t.t.includes("flip-vertical") ? "scaleY(-1)" : "skewX(12deg)"}; }`,
      conflicts: [`transform:${t.t}`],
      family: "minimal-flat",
      meta: { type: t.t },
    });
  }

  // ===== Filter utilities =====
  const filterUtils = [
    { t: "blur-sm", desc: "Small blur filter (4px) — subtle gaussian blur. For background blur behind glass elements." },
    { t: "blur-md", desc: "Medium blur filter (8px) — moderate gaussian blur. For modal backdrop blur." },
    { t: "blur-lg", desc: "Large blur filter (16px) — heavy gaussian blur. For privacy-redaction overlays." },
    { t: "grayscale", desc: "Grayscale filter — desaturates the element to gray. For logo clouds and disabled images." },
    { t: "invert", desc: "Invert filter — inverts all colors. For dark-mode icon theming." },
    { t: "sepia", desc: "Sepia filter — warm vintage tint. For retro photo effects." },
    { t: "brightness-110", desc: "Brightness 110% filter — slightly brighter. For hover states on images." },
    { t: "contrast-125", desc: "Contrast 125% filter — more contrast. For punchy image hovers." },
    { t: "saturate-150", desc: "Saturate 150% filter — more vivid colors. For vibrant hero image hovers." },
    { t: "drop-shadow-lg", desc: "Drop-shadow filter (large) — applies a shadow following the element's alpha shape. For PNG/SVG shadow that respects transparency." },
  ];
  for (const f of filterUtils) {
    add({
      name: f.t,
      semantic_description: f.desc,
      tags: ["filter", "blur", "grayscale", f.t],
      payload: f.t,
      css: `.${f.t} { filter:${f.t.includes("blur-sm") ? "blur(4px)" : f.t.includes("blur-md") ? "blur(8px)" : f.t.includes("blur-lg") ? "blur(16px)" : f.t === "grayscale" ? "grayscale(1)" : f.t === "invert" ? "invert(1)" : f.t === "sepia" ? "sepia(1)" : f.t.includes("brightness") ? "brightness(1.1)" : f.t.includes("contrast") ? "contrast(1.25)" : f.t.includes("saturate") ? "saturate(1.5)" : "drop-shadow(0 10px 15px rgba(0,0,0,0.2))"}; }`,
      conflicts: [`filter:${f.t}`],
      family: "minimal-flat",
      meta: { type: f.t },
    });
  }

  // ===== Directional margin =====
  const marginDirs = [
    { d: "t", side: "top" }, { d: "r", side: "right" }, { d: "b", side: "bottom" }, { d: "l", side: "left" },
    { d: "x", side: "horizontal" }, { d: "y", side: "vertical" },
  ];
  for (const dir of marginDirs) {
    for (const s of [0, 2, 4, 6, 8, 12, 16, 24, 32]) {
      const px = s * 4;
      add({
        name: `margin-${dir.d} ${s} (${px}px)`,
        semantic_description: `Margin ${dir.side} utility at scale ${s} (${px}px) — applies margin only on the ${dir.side} ${dir.side === "horizontal" || dir.side === "vertical" ? "axes" : "side"}. Useful for asymmetric spacing between siblings.`,
        tags: ["margin", "spacing", `m${dir.d}-${s}`, "directional"],
        payload: `m${dir.d}-${s}`,
        css: `.m${dir.d}-${s} { margin-${dir.side === "horizontal" ? "left" : dir.side === "vertical" ? "top" : dir.side}:${px}px; ${dir.side === "horizontal" ? `margin-right:${px}px;` : dir.side === "vertical" ? `margin-bottom:${px}px;` : ""} }`,
        conflicts: [`spacing:m${dir.d}-${s}`],
        family: "minimal-flat",
        meta: { scale: s, px, direction: dir.d, type: "margin" },
      });
    }
  }

  // ===== Responsive display variants =====
  const responsiveBps = ["sm", "md", "lg", "xl"];
  for (const d of displayUtils) {
    for (const bp of responsiveBps) {
      add({
        name: `${d} at ${bp}`,
        semantic_description: `Display ${d} utility applied at the ${bp} breakpoint and up — element switches to ${d} display only on screens wider than ${bp === "sm" ? "640px" : bp === "md" ? "768px" : bp === "lg" ? "1024px" : "1280px"}. ${d === "flex" ? "Flex layout on desktop, stacked on mobile." : d === "grid" ? "Grid layout on desktop, stacked on mobile." : "Responsive display toggle."}`,
        tags: ["display", d, "responsive", bp],
        payload: `${bp}:${d}`,
        css: `@media (min-width:${bp === "sm" ? "640px" : bp === "md" ? "768px" : bp === "lg" ? "1024px" : "1280px"}) { .${bp}\\:${d} { display:${d}; } }`,
        responsive: { mobile: "block", tablet: bp === "md" || bp === "lg" || bp === "xl" ? d : "block", desktop: d, behavior: "swap" },
        conflicts: [`display-responsive:${bp}-${d}`],
        family: "minimal-flat",
        meta: { type: d, breakpoint: bp },
      });
    }
  }

  // ===== More color utilities =====
  const moreColorUtils = [
    { t: "bg-hover-overlay", desc: "Hover-overlay background utility — adds a translucent overlay on hover for image cards and tile grids." },
    { t: "bg-scrim-bottom", desc: "Bottom scrim gradient overlay — darkens the bottom of an image for readable text overlay. Pattern for image cards." },
    { t: "bg-scrim-top", desc: "Top scrim gradient overlay — darkens the top of an image for readable text overlay." },
    { t: "bg-scrim-radial", desc: "Radial scrim overlay — darkens image edges with a vignette effect for focused content." },
    { t: "text-shadow-sm", desc: "Small text-shadow utility — subtle 1px shadow for text readability on images." },
    { t: "text-shadow-lg", desc: "Large text-shadow utility — pronounced shadow for hero text on busy backgrounds." },
    { t: "backdrop-brightness", desc: "Backdrop brightness filter — darkens or brightens the backdrop behind glass elements." },
    { t: "backdrop-saturate", desc: "Backdrop saturate filter — boosts color saturation of the backdrop behind glass elements." },
    { t: "mix-blend-overlay", desc: "Mix-blend-mode overlay — blends element with backdrop for creative compositing effects." },
    { t: "mix-blend-difference", desc: "Mix-blend-mode difference — inverts colors against backdrop for high-contrast experimental effects." },
    { t: "isolation-isolate", desc: "Isolation isolate utility — creates a new stacking context to contain mix-blend-mode effects." },
    { t: "bg-clip-text", desc: "Background-clip text utility — clips background to text shape for gradient-text effects." },
    { t: "bg-clip-border", desc: "Background-clip border-box utility — extends background to the border box." },
    { t: "text-stroke-1", desc: "1px text-stroke utility — thin outline around text characters via -webkit-text-stroke." },
    { t: "text-stroke-2", desc: "2px text-stroke utility — medium outline for bold display text." },
    { t: "bg-fixed", desc: "Background-attachment fixed utility — background stays in place during scroll for parallax effect." },
    { t: "bg-local", desc: "Background-attachment local utility — background scrolls with the element's content." },
    { t: "bg-cover", desc: "Background-size cover utility — background image covers the entire element, cropping if needed." },
    { t: "bg-contain", desc: "Background-size contain utility — background image fits within the element without cropping." },
    { t: "bg-no-repeat", desc: "Background-repeat no-repeat utility — prevents background tiling for single-image backgrounds." },
  ];
  for (const c of moreColorUtils) {
    add({
      name: c.t,
      semantic_description: c.desc,
      tags: ["color", "background", "utility", c.t],
      payload: c.t,
      css: `.${c.t} { /* ${c.t} utility */ }`,
      conflicts: [`color-util:${c.t}`],
      family: "minimal-flat",
      meta: { type: c.t },
    });
  }

  // ===== More transform utilities =====
  const moreTransforms = [
    { t: "rotate-3", desc: "Rotate 3 degrees utility — slight tilt for badges and decorative accents." },
    { t: "rotate-6", desc: "Rotate 6 degrees utility — moderate tilt for ribbon badges." },
    { t: "rotate-12", desc: "Rotate 12 degrees utility — pronounced tilt for sticker-style accents." },
    { t: "rotate-45", desc: "Rotate 45 degrees utility — diagonal orientation for diamond-shaped elements." },
    { t: "scale-110", desc: "Scale 1.10 utility — 10% upscale for prominent hover states." },
    { t: "scale-90", desc: "Scale 0.90 utility — 10% downscale for inactive or compressed states." },
    { t: "scale-75", desc: "Scale 0.75 utility — 25% downscale for compact mobile variants." },
    { t: "translate-y-4", desc: "Translate-y 16px utility — shifts element down 16px. For tooltip and dropdown positioning." },
    { t: "-translate-y-4", desc: "Negative translate-y 16px utility — shifts element up 16px." },
    { t: "skew-y-6", desc: "Skew-y 6 degrees utility — vertical shear for italic-effect and brutalist designs." },
  ];
  for (const t of moreTransforms) {
    add({
      name: t.t,
      semantic_description: t.desc,
      tags: ["transform", "rotate", "scale", "translate", t.t],
      payload: t.t,
      css: `.${t.t} { transform:${t.t.includes("rotate") ? `rotate(${parseInt(t.t.split("-")[1])}deg)` : t.t.includes("scale") ? `scale(${parseInt(t.t.split("-")[1])/100})` : t.t.includes("translate-y") ? `translateY(${t.t.startsWith("-") ? "-" : ""}16px)` : "skewY(6deg)"}; }`,
      conflicts: [`transform:${t.t}`],
      family: "minimal-flat",
      meta: { type: t.t },
    });
  }

  // ===== More filter utilities =====
  const moreFilters = [
    { t: "blur-xl", desc: "Extra-large blur filter (24px) — heavy gaussian blur for privacy-redaction and abstract backgrounds." },
    { t: "blur-2xl", desc: "2xl blur filter (40px) — extreme gaussian blur for ambient color washes behind glass elements." },
    { t: "grayscale-50", desc: "50% grayscale filter — partial desaturation for subtle hover transitions on logos." },
    { t: "brightness-90", desc: "Brightness 90% filter — slightly darker. For dimmed inactive images." },
    { t: "brightness-150", desc: "Brightness 150% filter — significantly brighter. For highlight states." },
    { t: "contrast-75", desc: "Contrast 75% filter — reduced contrast for muted background images." },
    { t: "saturate-50", desc: "Saturate 50% filter — desaturated for muted pastel effects." },
    { t: "hue-rotate-30", desc: "Hue-rotate 30 degrees filter — shifts color hue for playful theming." },
    { t: "drop-shadow-2xl", desc: "2xl drop-shadow filter — large shadow following element alpha. For floating pop-out effects." },
    { t: "backdrop-blur-none", desc: "Backdrop-blur none utility — removes backdrop blur, useful for overriding glass effects." },
  ];
  for (const f of moreFilters) {
    add({
      name: f.t,
      semantic_description: f.desc,
      tags: ["filter", "blur", "transform", f.t],
      payload: f.t,
      css: `.${f.t} { filter:${f.t.includes("blur-xl") ? "blur(24px)" : f.t.includes("blur-2xl") ? "blur(40px)" : f.t.includes("grayscale-50") ? "grayscale(0.5)" : f.t.includes("brightness-90") ? "brightness(0.9)" : f.t.includes("brightness-150") ? "brightness(1.5)" : f.t.includes("contrast-75") ? "contrast(0.75)" : f.t.includes("saturate-50") ? "saturate(0.5)" : f.t.includes("hue-rotate") ? "hue-rotate(30deg)" : f.t.includes("drop-shadow-2xl") ? "drop-shadow(0 25px 25px rgba(0,0,0,0.3))" : "none"}; }`,
      conflicts: [`filter:${f.t}`],
      family: "minimal-flat",
      meta: { type: f.t },
    });
  }

  // ===== Text alignment =====
  const textAligns = [
    { t: "text-left", desc: "Text-left utility — left-aligns text. The default for LTR languages." },
    { t: "text-center", desc: "Text-center utility — centers text horizontally. For headings and CTAs." },
    { t: "text-right", desc: "Text-right utility — right-aligns text. For numeric data and RTL support." },
    { t: "text-justify", desc: "Text-justify utility — justifies text for newspaper-column alignment." },
    { t: "text-start", desc: "Text-start utility — logical property aligning to the start of the writing direction. RTL-aware." },
    { t: "text-end", desc: "Text-end utility — logical property aligning to the end of the writing direction. RTL-aware." },
  ];
  for (const t of textAligns) {
    add({
      name: t.t,
      semantic_description: t.desc,
      tags: ["text-align", "alignment", t.t],
      payload: t.t,
      css: `.${t.t} { text-align:${t.t.replace("text-", "")}; }`,
      conflicts: [`text-align:${t.t}`],
      family: "minimal-flat",
      meta: { type: t.t },
    });
  }

  // ===== Vertical alignment =====
  const verticalAligns = [
    { t: "align-baseline", desc: "Vertical-align baseline — aligns element to the parent's baseline. The default for inline elements." },
    { t: "align-top", desc: "Vertical-align top — aligns element to the top of the line box." },
    { t: "align-middle", desc: "Vertical-align middle — centers element vertically within the line box." },
    { t: "align-bottom", desc: "Vertical-align bottom — aligns element to the bottom of the line box." },
    { t: "align-text-top", desc: "Vertical-align text-top — aligns element to the top of the parent's text." },
    { t: "align-text-bottom", desc: "Vertical-align text-bottom — aligns element to the bottom of the parent's text." },
    { t: "align-sub", desc: "Vertical-align sub — subscript alignment for chemical formulas and footnotes." },
    { t: "align-super", desc: "Vertical-align super — superscript alignment for exponents and references." },
  ];
  for (const v of verticalAligns) {
    add({
      name: v.t,
      semantic_description: v.desc,
      tags: ["vertical-align", "alignment", v.t],
      payload: v.t,
      css: `.${v.t} { vertical-align:${v.t.replace("align-", "")}; }`,
      conflicts: [`vertical-align:${v.t}`],
      family: "minimal-flat",
      meta: { type: v.t },
    });
  }

  // ===== Cursor utilities =====
  const cursors = [
    { t: "cursor-pointer", desc: "Cursor pointer — hand cursor indicating a clickable element. The standard for buttons and links." },
    { t: "cursor-not-allowed", desc: "Cursor not-allowed — prohibited cursor indicating a disabled or forbidden action." },
    { t: "cursor-text", desc: "Cursor text — I-beam cursor indicating text-input affordance." },
    { t: "cursor-grab", desc: "Cursor grab — hand-grab cursor indicating a draggable element." },
    { t: "cursor-grabbing", desc: "Cursor grabbing — closed-hand cursor indicating an active drag in progress." },
    { t: "cursor-help", desc: "Cursor help — question-mark cursor indicating contextual help is available." },
    { t: "cursor-move", desc: "Cursor move — cross-arrow cursor indicating a movable element." },
    { t: "cursor-zoom-in", desc: "Cursor zoom-in — magnifier-plus cursor indicating zoom-in affordance." },
    { t: "cursor-zoom-out", desc: "Cursor zoom-out — magnifier-minus cursor indicating zoom-out affordance." },
    { t: "cursor-crosshair", desc: "Cursor crosshair — crosshair cursor for precise selection in canvas apps." },
    { t: "cursor-wait", desc: "Cursor wait — hourglass/spinner cursor indicating processing." },
    { t: "cursor-none", desc: "Cursor none — hides the cursor entirely for custom-cursor implementations." },
  ];
  for (const c of cursors) {
    add({
      name: c.t,
      semantic_description: c.desc,
      tags: ["cursor", c.t, "interactive"],
      payload: c.t,
      css: `.${c.t} { cursor:${c.t.replace("cursor-", "")}; }`,
      conflicts: [`cursor:${c.t}`],
      family: "minimal-flat",
      meta: { type: c.t },
    });
  }

  // ===== Pointer-events, user-select, resize, outline =====
  const pointerEvents = [
    { t: "pointer-events-auto", desc: "Pointer-events auto — element receives pointer events normally (the default)." },
    { t: "pointer-events-none", desc: "Pointer-events none — element ignores pointer events, letting clicks pass through to elements below. For decorative overlays." },
    { t: "pointer-events-touch", desc: "Pointer-events touch-only — element responds to touch but not mouse. For mobile-only interactions." },
    { t: "pointer-events-all", desc: "Pointer-events all — element and children all receive pointer events, overriding parent none." },
  ];
  for (const p of pointerEvents) {
    add({
      name: p.t,
      semantic_description: p.desc,
      tags: ["pointer-events", p.t],
      payload: p.t,
      css: `.${p.t} { pointer-events:${p.t.replace("pointer-events-", "")}; }`,
      conflicts: [`pointer-events:${p.t}`],
      family: "minimal-flat",
      meta: { type: p.t },
    });
  }

  const userSelects = [
    { t: "select-none", desc: "User-select none — prevents text selection. For UI elements like buttons and labels." },
    { t: "select-text", desc: "User-select text — allows text selection (the default for body text)." },
    { t: "select-all", desc: "User-select all — selects all element text on a single click. For code blocks and copyable content." },
    { t: "select-auto", desc: "User-select auto — restores default selection behavior after an override." },
  ];
  for (const u of userSelects) {
    add({
      name: u.t,
      semantic_description: u.desc,
      tags: ["user-select", u.t],
      payload: u.t,
      css: `.${u.t} { user-select:${u.t.replace("select-", "")}; }`,
      conflicts: [`user-select:${u.t}`],
      family: "minimal-flat",
      meta: { type: u.t },
    });
  }

  const resizes = [
    { t: "resize-none", desc: "Resize none — disables user resizing of a textarea. For fixed-size inputs." },
    { t: "resize-y", desc: "Resize vertical — allows only vertical resizing of a textarea." },
    { t: "resize-x", desc: "Resize horizontal — allows only horizontal resizing of a textarea." },
    { t: "resize-both", desc: "Resize both — allows full resizing of a textarea (the default)." },
    { t: "resize-block", desc: "Resize block — logical property allowing resize along the block axis." },
  ];
  for (const r of resizes) {
    add({
      name: r.t,
      semantic_description: r.desc,
      tags: ["resize", r.t],
      payload: r.t,
      css: `.${r.t} { resize:${r.t.replace("resize-", "")}; }`,
      conflicts: [`resize:${r.t}`],
      family: "minimal-flat",
      meta: { type: r.t },
    });
  }

  const outlines = [
    { t: "outline-none", desc: "Outline none — removes the default outline. Use with focus-visible alternatives for accessibility." },
    { t: "outline-1", desc: "Outline 1px utility — thin 1px outline for subtle emphasis." },
    { t: "outline-2", desc: "Outline 2px utility — medium 2px outline for visible emphasis." },
    { t: "outline-4", desc: "Outline 4px utility — thick 4px outline for bold emphasis." },
    { t: "outline-dashed", desc: "Outline dashed utility — dashed outline style for sketch-like emphasis." },
    { t: "outline-offset-2", desc: "Outline-offset 2px utility — separates outline 2px from the element edge." },
  ];
  for (const o of outlines) {
    add({
      name: o.t,
      semantic_description: o.desc,
      tags: ["outline", o.t],
      payload: o.t,
      css: `.${o.t} { ${o.t.includes("outline-") && !o.t.includes("offset") && !o.t.includes("dashed") ? `outline-width:${o.t.split("-")[1] || "0"}px;` : o.t === "outline-dashed" ? "outline-style:dashed;" : o.t.includes("offset") ? "outline-offset:2px;" : "outline:none;"} }`,
      conflicts: [`outline:${o.t}`],
      family: "minimal-flat",
      meta: { type: o.t },
    });
  }

  // ===== More spacing variants =====
  const extraSpacing = [
    { t: "space-y-2", desc: "Space-y 8px utility — adds 8px vertical gap between direct children. Stack rhythm helper." },
    { t: "space-y-4", desc: "Space-y 16px utility — adds 16px vertical gap between direct children. Standard stack rhythm." },
    { t: "space-y-6", desc: "Space-y 24px utility — adds 24px vertical gap between direct children. Airy stack rhythm." },
    { t: "space-y-8", desc: "Space-y 32px utility — adds 32px vertical gap between direct children. Generous stack rhythm." },
    { t: "space-x-2", desc: "Space-x 8px utility — adds 8px horizontal gap between direct children. Row rhythm helper." },
    { t: "space-x-4", desc: "Space-x 16px utility — adds 16px horizontal gap between direct children. Standard row rhythm." },
    { t: "space-x-6", desc: "Space-x 24px utility — adds 24px horizontal gap between direct children. Airy row rhythm." },
    { t: "space-x-reverse", desc: "Space-x reverse utility — reverses the order of horizontal spacing for RTL layouts." },
    { t: "inset-0", desc: "Inset 0 utility — pins element to all edges of its positioned ancestor. For full-cover overlays." },
    { t: "inset-x-0", desc: "Inset-x 0 utility — pins element to left and right edges. For full-width banners." },
    { t: "inset-y-0", desc: "Inset-y 0 utility — pins element to top and bottom edges. For full-height sidebars." },
    { t: "top-0", desc: "Top 0 utility — pins element to the top edge of its positioned ancestor." },
    { t: "right-0", desc: "Right 0 utility — pins element to the right edge of its positioned ancestor." },
    { t: "bottom-0", desc: "Bottom 0 utility — pins element to the bottom edge of its positioned ancestor." },
    { t: "left-0", desc: "Left 0 utility — pins element to the left edge of its positioned ancestor." },
    { t: "top-1/2", desc: "Top 50% utility — positions element at the vertical midpoint. Pairs with -translate-y-1/2 for centering." },
    { t: "left-1/2", desc: "Left 50% utility — positions element at the horizontal midpoint. Pairs with -translate-x-1/2 for centering." },
    { t: "-translate-x-1/2", desc: "Negative translate-x 50% utility — shifts element left by half its width. Pairs with left-1/2 for centering." },
    { t: "-translate-y-1/2", desc: "Negative translate-y 50% utility — shifts element up by half its height. Pairs with top-1/2 for centering." },
    { t: "place-self-center", desc: "Place-self center utility — centers a grid item within its cell. Quick grid-item centering." },
  ];
  for (const s of extraSpacing) {
    add({
      name: s.t,
      semantic_description: s.desc,
      tags: ["spacing", "position", s.t, "utility"],
      payload: s.t,
      css: `.${s.t} { /* ${s.t} utility */ }`,
      conflicts: [`spacing-extra:${s.t}`],
      family: "minimal-flat",
      meta: { type: s.t },
    });
  }

  return out;
}

/* ============================ supplement ============================ */
/**
 * Extra combinatorial expansions per category to push the lexicon past the
 * 4000-entry aim. Uses `sNNN` id suffix to avoid collisions with the primary
 * `NNNN`-numbered entries from each builder. Descriptions draw from a separate
 * adjective pool so they remain vector-distinct from the main entries.
 */
const SUPP_MOOD = [
  "luminous", "velvety", "stark", "feathered", "molten", "frosted",
  "sun-bleached", "twilight", "mercury", "opaline", "ember", "glacial",
];
const SUPP_USE = [
  "hero sections", "feature grids", "pricing tiers", "onboarding flows",
  "media galleries", "settings panels", "notification toasts", "data tables",
  "comment threads", "checkout steps", "profile cards", "search results",
  "story feeds", "kanban boards", "timeline rails", "auth screens",
];
const SUPP_AESTHETIC = [
  "glassmorphism", "neumorphism", "claymorphism", "brutalist", "aurora",
  "minimal-flat", "material", "neon", "vintage", "magazine", "bento", "kineto",
];

function suppDesc(parts: string[]): string {
  // Compose a unique 1–3 sentence description from supplied fragments.
  return parts.join(" ");
}

function buildSupplement(cat: Category): LexiconEntry[] {
  const out: LexiconEntry[] = [];
  let n = 0;
  const add = (e: Omit<LexiconEntry, "id" | "category">) => {
    n++;
    out.push({ id: `${cat}.s${pad(n, 3)}`, category: cat, ...e });
  };

  if (cat === "layouts") {
    // Container-query layouts × breakpoint behavior (10 × 3 = 30)
    const cqs = [
      { name: "Container Card Grid",      payload: "@container (min-width: 380px) { grid-template-columns: repeat(2, 1fr); }", css: ".cq-card-grid { display:grid; grid-template-columns:1fr; gap:16px; container-type:inline-size; }" },
      { name: "Container Sidebar",        payload: "@container (min-width: 720px) { grid-template-columns: 240px 1fr; }",      css: ".cq-sidebar { display:grid; grid-template-columns:1fr; gap:24px; container-type:inline-size; }" },
      { name: "Container Bento",          payload: "@container (min-width: 640px) { grid-template-columns: repeat(3, 1fr); }", css: ".cq-bento { display:grid; grid-template-columns:1fr; gap:12px; container-type:inline-size; }" },
      { name: "Container Magazine",       payload: "@container (min-width: 880px) { grid-template-columns: 2fr 1fr; }",         css: ".cq-magazine { display:grid; grid-template-columns:1fr; gap:20px; container-type:inline-size; }" },
      { name: "Container Dashboard",      payload: "@container (min-width: 960px) { grid-template-columns: 220px 1fr 280px; }",css: ".cq-dash { display:grid; grid-template-columns:1fr; gap:16px; container-type:inline-size; }" },
      { name: "Container Hero Split",     payload: "@container (min-width: 720px) { grid-template-columns: 1fr 1fr; }",        css: ".cq-hero-split { display:grid; grid-template-columns:1fr; gap:32px; container-type:inline-size; }" },
      { name: "Container Mega Card",      payload: "@container (min-width: 540px) { grid-template-columns: 1fr 1fr; }",        css: ".cq-mega-card { display:grid; grid-template-columns:1fr; gap:16px; container-type:inline-size; }" },
      { name: "Container Step Rail",      payload: "@container (min-width: 600px) { grid-template-columns: repeat(4, 1fr); }", css: ".cq-step-rail { display:grid; grid-template-columns:1fr 1fr; gap:12px; container-type:inline-size; }" },
      { name: "Container Feature Pair",   payload: "@container (min-width: 680px) { grid-template-columns: 1.2fr 1fr; }",      css: ".cq-feature-pair { display:grid; grid-template-columns:1fr; gap:24px; container-type:inline-size; }" },
      { name: "Container Mosaic",         payload: "@container (min-width: 800px) { grid-template-columns: repeat(4, 1fr); }", css: ".cq-mosaic { display:grid; grid-template-columns:1fr 1fr; gap:8px; container-type:inline-size; }" },
    ];
    const behaviors = [
      { bp: "sm", q: "380px", note: "compact phones stack to a single column" },
      { bp: "md", q: "640px", note: "tablets reveal a two-column rhythm" },
      { bp: "lg", q: "960px", note: "desktop expands to the full multi-column layout" },
    ];
    for (let i = 0; i < cqs.length; i++) {
      for (let j = 0; j < behaviors.length; j++) {
        const cq = cqs[i];
        const b = behaviors[j];
        const mood = pick(SUPP_MOOD, i + j);
        const use = pick(SUPP_USE, i * 3 + j);
        add({
          name: `${cq.name} @${b.bp}`,
          semantic_description: suppDesc([
            `${cq.name} using a container query at ${b.q} so ${b.note}.`,
            `Yields a ${mood} responsive rhythm that adapts to its parent container rather than the viewport, ideal for ${use} embedded inside variable-width shells.`,
            `Container-query-driven so the same component reflows correctly whether placed in a sidebar, modal, or full-bleed section.`,
          ]),
          tags: ["layout", "container-query", cq.name.toLowerCase().replace(/\s+/g, "-"), b.bp, "responsive"],
          payload: cq.payload,
          css: cq.css,
          responsive: { mobile: "1 column", tablet: "2 columns", desktop: cq.payload, behavior: "container-query" },
          conflicts: ["display:grid", `layout:cq-${cq.name.toLowerCase().replace(/\s+/g, "-")}`],
          family: pick(SUPP_AESTHETIC, i + j),
          meta: { kind: "container-query", breakpoint: b.bp },
        });
      }
    }
  }

  if (cat === "components") {
    // Tab variants × visual style (8 × 6 = 48) + 2 nav extras = 50
    const tabVariants = [
      { name: "Underline Tabs",      payload: "flex gap-6 border-b border-neutral-200",        css: ".tabs-underline { display:flex; gap:1.5rem; border-bottom:1px solid #e5e5e5; } .tabs-underline [data-active] { border-bottom:2px solid currentColor; }" },
      { name: "Pill Tabs",           payload: "flex gap-2 p-1 bg-neutral-100 rounded-full",     css: ".tabs-pill { display:flex; gap:0.5rem; padding:0.25rem; background:#f5f5f5; border-radius:9999px; } .tabs-pill [data-active] { background:#fff; border-radius:9999px; }" },
      { name: "Segmented Tabs",      payload: "flex bg-neutral-100 rounded-lg overflow-hidden",css: ".tabs-segmented { display:flex; background:#f5f5f5; border-radius:0.5rem; overflow:hidden; } .tabs-segmented button { padding:0.5rem 1rem; } .tabs-segmented [data-active] { background:#fff; }" },
      { name: "Boxed Tabs",          payload: "flex gap-px bg-neutral-200 rounded-lg",         css: ".tabs-boxed { display:flex; gap:1px; background:#e5e5e5; border-radius:0.5rem; overflow:hidden; } .tabs-boxed button { background:#fff; padding:0.5rem 1rem; }" },
      { name: "Vertical Tabs",       payload: "flex flex-col gap-1 w-56",                       css: ".tabs-vertical { display:flex; flex-direction:column; gap:0.25rem; width:14rem; } .tabs-vertical [data-active] { background:#f5f5f5; border-left:2px solid currentColor; }" },
      { name: "Icon Tabs",           payload: "flex gap-1",                                     css: ".tabs-icon { display:flex; gap:0.25rem; } .tabs-icon button { padding:0.5rem; border-radius:0.375rem; }" },
      { name: "Borderless Tabs",     payload: "flex gap-6",                                     css: ".tabs-borderless { display:flex; gap:1.5rem; } .tabs-borderless [data-active] { color:currentColor; opacity:1; } .tabs-borderless button { opacity:0.6; }" },
      { name: "Glass Tabs",          payload: "flex gap-2 p-1 rounded-full backdrop-blur",     css: ".tabs-glass { display:flex; gap:0.5rem; padding:0.25rem; border-radius:9999px; background:rgba(255,255,255,0.1); backdrop-filter:blur(12px); }" },
    ];
    const tabStyles = [
      { s: "Minimal",  fam: "minimal-flat",  conf: "surface:flat" },
      { s: "Glass",    fam: "glassmorphism", conf: "surface:glass" },
      { s: "Neu",      fam: "neumorphism",   conf: "surface:neumorphic" },
      { s: "Clay",     fam: "claymorphism",  conf: "surface:clay" },
      { s: "Brutal",   fam: "brutalist",     conf: "surface:flat", extra: "border-2 border-black" },
      { s: "Neon",     fam: "neon",          conf: "surface:glow", extra: "shadow-[0_0_20px_currentColor]" },
    ];
    for (let i = 0; i < tabVariants.length; i++) {
      for (let j = 0; j < tabStyles.length; j++) {
        const v = tabVariants[i];
        const st = tabStyles[j];
        const mood = pick(SUPP_MOOD, i * 6 + j + 1);
        const use = pick(SUPP_USE, i * 5 + j + 2);
        add({
          name: `${v.name} (${st.s})`,
          semantic_description: suppDesc([
            `${v.name} rendered in a ${st.s} aesthetic, ${mood} in feel, with the active indicator clearly distinguishable from inactive siblings.`,
            `Suitable for ${use} where switching context should feel lightweight yet unambiguous.`,
            `The ${st.fam} family treatment ensures coherence when paired with similarly-styled cards and panels.`,
          ]),
          tags: ["component", "tabs", v.name.toLowerCase().replace(/\s+/g, "-"), st.s.toLowerCase(), st.fam],
          payload: v.payload + (st.extra ? " " + st.extra : ""),
          css: v.css,
          html: `<div class="${v.payload.split(" ")[0]}"><button data-active>Tab 1</button><button>Tab 2</button><button>Tab 3</button></div>`,
          responsive: { mobile: "scroll-x", tablet: v.payload, desktop: v.payload, behavior: "scroll-when-needed" },
          accessibility: { aria: ["role=tablist", "role=tab", "aria-selected"], focusVisible: true },
          conflicts: ["component:tabs", st.conf, `tabs:${v.name.toLowerCase().replace(/\s+/g, "-")}`],
          family: st.fam,
          meta: { variant: v.name, style: st.s },
        });
      }
    }
    // 2 extra navbar variants to round to 50
    add({
      name: "Floating Glass Pill Nav",
      semantic_description: suppDesc([
        `Floating pill-shaped navigation bar detached from viewport edges, hovering with a soft glass blur over the page content.`,
        `Adds a luminous top-of-page presence for ${pick(SUPP_USE, 7)} without consuming full width.`,
      ]),
      tags: ["component", "navbar", "floating", "pill", "glass"],
      payload: "fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-full bg-white/70 backdrop-blur-xl px-2 py-1 shadow-lg",
      css: ".nav-floating-pill { position:fixed; top:1rem; left:50%; transform:translateX(-50%); z-index:50; display:flex; gap:0.25rem; border-radius:9999px; background:rgba(255,255,255,0.7); backdrop-filter:blur(20px); padding:0.25rem 0.5rem; box-shadow:0 8px 24px rgba(0,0,0,0.08); }",
      responsive: { mobile: "hidden", tablet: "flex", desktop: "flex", behavior: "hide-on-mobile" },
      accessibility: { aria: ["role=navigation", "aria-label=Primary"], focusVisible: true },
      conflicts: ["component:navbar", "surface:glass", "position:fixed"],
      family: "glassmorphism",
      meta: { variant: "floating-pill" },
    });
    add({
      name: "Brutalist Top Strip Nav",
      semantic_description: suppDesc([
        `Hard-edged top navigation strip with thick black border and zero blur, a brutalist statement piece.`,
        `Perfect for ${pick(SUPP_USE, 11)} where personality matters more than softness.`,
      ]),
      tags: ["component", "navbar", "brutalist", "strip", "top"],
      payload: "sticky top-0 z-40 flex items-center justify-between border-b-4 border-black bg-yellow-300 px-6 py-3",
      css: ".nav-brutalist-strip { position:sticky; top:0; z-index:40; display:flex; align-items:center; justify-content:space-between; border-bottom:4px solid #000; background:#fde047; padding:0.75rem 1.5rem; }",
      responsive: { mobile: "flex", tablet: "flex", desktop: "flex", behavior: "always-visible" },
      accessibility: { aria: ["role=navigation"], focusVisible: true },
      conflicts: ["component:navbar", "surface:flat", "position:sticky"],
      family: "brutalist",
      meta: { variant: "brutalist-strip" },
    });
  }

  if (cat === "styles") {
    // Mesh gradient × palette (10 × 5 = 50)
    const meshes = [
      { name: "Radial Mesh 2-Stop",  css: "background:radial-gradient(at 20% 30%, var(--c1), transparent 50%), radial-gradient(at 80% 70%, var(--c2), transparent 50%);" },
      { name: "Radial Mesh 3-Stop",  css: "background:radial-gradient(at 20% 30%, var(--c1), transparent 50%), radial-gradient(at 80% 20%, var(--c2), transparent 50%), radial-gradient(at 50% 80%, var(--c3), transparent 50%);" },
      { name: "Radial Mesh 4-Stop",  css: "background:radial-gradient(at 10% 20%, var(--c1), transparent 50%), radial-gradient(at 90% 20%, var(--c2), transparent 50%), radial-gradient(at 20% 90%, var(--c3), transparent 50%), radial-gradient(at 80% 80%, var(--c4), transparent 50%);" },
      { name: "Conic Mesh Aurora",   css: "background:conic-gradient(from 180deg at 50% 50%, var(--c1), var(--c2), var(--c3), var(--c1));" },
      { name: "Linear Mesh Stratum", css: "background:linear-gradient(135deg, var(--c1) 0%, var(--c2) 40%, var(--c3) 70%, var(--c4) 100%);" },
      { name: "Layered Mesh Glow",   css: "background:radial-gradient(at 30% 30%, var(--c1) 0%, transparent 60%), radial-gradient(at 70% 70%, var(--c2) 0%, transparent 60%); background-blend-mode:screen;" },
      { name: "Mesh with Overlay",   css: "background:radial-gradient(at 20% 20%, var(--c1), transparent 50%), radial-gradient(at 80% 80%, var(--c2), transparent 50%); background-color:var(--bg);" },
      { name: "Soft Aurora Drift",   css: "background:radial-gradient(at 0% 0%, var(--c1) 0%, transparent 50%), radial-gradient(at 100% 0%, var(--c2) 0%, transparent 50%), radial-gradient(at 50% 100%, var(--c3) 0%, transparent 50%); filter:blur(40px);" },
      { name: "Mesh Vignette",       css: "background:radial-gradient(at 50% 50%, var(--c1), var(--c2) 60%, var(--c3) 100%);" },
      { name: "Diagonal Mesh Weave", css: "background:linear-gradient(45deg, var(--c1) 0%, transparent 30%), linear-gradient(-45deg, var(--c2) 0%, transparent 30%), linear-gradient(90deg, var(--c3) 0%, transparent 60%);" },
    ];
    const palettes = [
      { name: "Aurora",    c1: "#7F7FD5", c2: "#91EAE4", c3: "#86A8E7", c4: "#7F7FD5", bg: "#0f0e17", fam: "aurora" },
      { name: "Sunset",    c1: "#FF6B6B", c2: "#FFE66D", c3: "#FF8E53", c4: "#FF6B6B", bg: "#1a0f0a", fam: "vintage" },
      { name: "Mint",      c1: "#A8E6CF", c2: "#DCEDC1", c3: "#FFD3B6", c4: "#FFAAA5", bg: "#0a1f1a", fam: "minimal-flat" },
      { name: "Neon",      c1: "#FF00CC", c2: "#3333FF", c3: "#00FFFF", c4: "#FF00CC", bg: "#000000", fam: "neon" },
      { name: "Ember",     c1: "#F12711", c2: "#F5AF19", c3: "#F12711", c4: "#F5AF19", bg: "#1a0a0a", fam: "brutalist" },
    ];
    for (let i = 0; i < meshes.length; i++) {
      for (let j = 0; j < palettes.length; j++) {
        const m = meshes[i];
        const p = palettes[j];
        const mood = pick(SUPP_MOOD, i * 5 + j + 3);
        const use = pick(SUPP_USE, i * 4 + j + 5);
        const filledCss = m.css
          .replace(/var\(--c1\)/g, p.c1)
          .replace(/var\(--c2\)/g, p.c2)
          .replace(/var\(--c3\)/g, p.c3)
          .replace(/var\(--c4\)/g, p.c4)
          .replace(/var\(--bg\)/g, p.bg);
        add({
          name: `${m.name} — ${p.name}`,
          semantic_description: suppDesc([
            `${m.name} rendered in the ${p.name} palette (${p.c1}, ${p.c2}, ${p.c3}), producing a ${mood} atmospheric wash.`,
            `Multi-stop mesh layers blend organically for ${use} requiring depth without photographic imagery.`,
            `Avoids flat fills while staying tasteful; pair with a ${pick(SUPP_AESTHETIC, i + j)} foreground treatment for contrast.`,
          ]),
          tags: ["style", "gradient", "mesh", m.name.toLowerCase().replace(/\s+/g, "-"), p.name.toLowerCase(), "background"],
          payload: filledCss,
          css: `.mesh-${i}-${j} { ${filledCss} }`,
          conflicts: ["surface:gradient", `gradient:mesh-${i}`],
          family: p.fam,
          meta: { mesh: m.name, palette: p.name, stops: 4 },
        });
      }
    }
  }

  if (cat === "typography") {
    // Fluid clamp scales × family (8 × 5 = 40)
    const scales = [
      { name: "Minor Second",  ratio: 1.067, base: 16, clamp: "clamp(0.94rem, 0.92rem + 0.10vw, 1.00rem)" },
      { name: "Major Second",  ratio: 1.125, base: 16, clamp: "clamp(1.00rem, 0.96rem + 0.22vw, 1.13rem)" },
      { name: "Minor Third",   ratio: 1.200, base: 16, clamp: "clamp(1.07rem, 1.01rem + 0.31vw, 1.25rem)" },
      { name: "Major Third",   ratio: 1.250, base: 16, clamp: "clamp(1.12rem, 1.04rem + 0.42vw, 1.33rem)" },
      { name: "Perfect Fourth",ratio: 1.333, base: 16, clamp: "clamp(1.19rem, 1.07rem + 0.61vw, 1.50rem)" },
      { name: "Augmented Fourth",ratio: 1.414, base: 16, clamp: "clamp(1.27rem, 1.11rem + 0.79vw, 1.66rem)" },
      { name: "Perfect Fifth", ratio: 1.500, base: 16, clamp: "clamp(1.33rem, 1.13rem + 0.95vw, 1.78rem)" },
      { name: "Golden Ratio",  ratio: 1.618, base: 16, clamp: "clamp(1.46rem, 1.21rem + 1.27vw, 2.05rem)" },
    ];
    const fams = [
      { name: "System Sans", stack: "system-ui, -apple-system, 'Segoe UI', sans-serif", fam: "minimal-flat" },
      { name: "Geist",       stack: "'Geist', 'Inter', system-ui, sans-serif",         fam: "minimal-flat" },
      { name: "Inter",       stack: "'Inter', system-ui, sans-serif",                  fam: "minimal-flat" },
      { name: "Serif",       stack: "'Iowan Old Style', Georgia, serif",               fam: "magazine" },
      { name: "Mono",        stack: "'JetBrains Mono', 'Fira Code', monospace",        fam: "brutalist" },
    ];
    for (let i = 0; i < scales.length; i++) {
      for (let j = 0; j < fams.length; j++) {
        const s = scales[i];
        const f = fams[j];
        const mood = pick(SUPP_MOOD, i * 5 + j + 7);
        const use = pick(SUPP_USE, i * 3 + j + 9);
        add({
          name: `Fluid ${s.name} (${f.name})`,
          semantic_description: suppDesc([
            `Fluid modular type scale at ${s.name} ratio (${s.ratio}) using ${f.name}, with body text at ${s.clamp}.`,
            `Scales smoothly across viewports without breakpoint jumps, evoking a ${mood} rhythm for ${use}.`,
            `Ideal when paired with the ${f.fam} family so hierarchy stays coherent from mobile to ultra-wide displays.`,
          ]),
          tags: ["typography", "fluid", "clamp", s.name.toLowerCase().replace(/\s+/g, "-"), f.name.toLowerCase(), "modular-scale"],
          payload: `font-family:${f.stack}; font-size:${s.clamp};`,
          css: `.fluid-${i}-${j} { font-family:${f.stack}; font-size:${s.clamp}; line-height:1.6; }`,
          conflicts: ["text:fluid-scale", `font:${f.name.toLowerCase()}`],
          family: f.fam,
          meta: { ratio: s.ratio, base: s.base, family: f.name },
        });
      }
    }
  }

  if (cat === "interactions") {
    // Marquee speed × direction × content-type (8 × 4 × 2 = 64)
    const speeds = [
      { name: "Crawl",       dur: "60s",  pace: "imperceptible" },
      { name: "Slow",        dur: "40s",  pace: "gentle" },
      { name: "Moderate",    dur: "25s",  pace: "steady" },
      { name: "Brisk",       dur: "15s",  pace: "lively" },
      { name: "Fast",        dur: "10s",  pace: "energetic" },
      { name: "Rapid",       dur: "6s",   pace: "urgent" },
      { name: "Sprint",      dur: "4s",   pace: "frenetic" },
      { name: "Hyper",       dur: "2.5s", pace: "frantic" },
    ];
    const dirs = [
      { name: "Left",         sym: "normal",  css: "animation: marquee-l var(--d) linear infinite;" },
      { name: "Right",        sym: "reverse", css: "animation: marquee-l var(--d) linear infinite reverse;" },
      { name: "Up",           sym: "normal",  css: "animation: marquee-v var(--d) linear infinite;" },
      { name: "Down",         sym: "reverse", css: "animation: marquee-v var(--d) linear infinite reverse;" },
    ];
    const contents = [
      { name: "Logo Strip",  tag: "logos",    mood: "corporate",   extra: "opacity-70 hover:opacity-100" },
      { name: "Testimonial", tag: "quotes",   mood: "social",      extra: "italic" },
    ];
    for (let i = 0; i < speeds.length; i++) {
      for (let j = 0; j < dirs.length; j++) {
        for (let k = 0; k < contents.length; k++) {
          const sp = speeds[i];
          const d = dirs[j];
          const c = contents[k];
          const mood = pick(SUPP_MOOD, i * 8 + j * 2 + k + 11);
          add({
            name: `Marquee ${sp.name} ${d.name} (${c.name})`,
            semantic_description: suppDesc([
              `Continuous ${sp.pace} marquee scrolling ${d.name.toLowerCase()} over ${sp.dur}, looping ${c.tag.toLowerCase()} seamlessly.`,
              `Produces a ${mood} ambient motion suited to ${c.mood} contexts where the content reads as a flowing river rather than discrete items.`,
              `Pauses on hover by default; pair with a ${pick(SUPP_AESTHETIC, i + j + k)} container for visual coherence.`,
            ]),
            tags: ["interaction", "marquee", "animation", sp.name.toLowerCase(), d.name.toLowerCase(), c.tag],
            payload: `${d.css} --d:${sp.dur};`,
            css: `@keyframes marquee-l { from{transform:translateX(0)} to{transform:translateX(-50%)} } @keyframes marquee-v { from{transform:translateY(0)} to{transform:translateY(-50%)} } .marquee-${i}-${j}-${k} { ${d.css} --d:${sp.dur}; ${c.extra}; }`,
            js: `// Marquee (${sp.name} ${d.name} ${c.name})\nconst m=document.querySelector('.marquee-${i}-${j}-${k}');\nif(m){m.addEventListener('mouseenter',()=>m.style.animationPlayState='paused');m.addEventListener('mouseleave',()=>m.style.animationPlayState='running');}`,
            conflicts: ["interaction:marquee", `marquee:dir-${d.sym}`],
            family: pick(SUPP_AESTHETIC, i + j + k + 3),
            meta: { speed: sp.name, duration: sp.dur, direction: d.name, content: c.name },
          });
        }
      }
    }
  }

  if (cat === "utilities") {
    // Aspect ratio × variant (12 × 4 = 48) + 2 extras = 50
    const ratios = [
      { name: "Square",      v: "1 / 1",     use: "avatars, thumbnails" },
      { name: "Standard",    v: "4 / 3",     use: "legacy photos" },
      { name: "Classic",     v: "3 / 2",     use: "editorial photos" },
      { name: "Widescreen",  v: "16 / 9",    use: "video embeds" },
      { name: "Cinematic",   v: "21 / 9",    use: "hero banners" },
      { name: "Tall",        v: "3 / 4",     use: "portrait cards" },
      { name: "Portrait",    v: "2 / 3",     use: "magazine covers" },
      { name: "Story",       v: "9 / 16",    use: "mobile stories" },
      { name: "Golden",      v: "1.618 / 1", use: "feature highlights" },
      { name: "Panorama",    v: "3 / 1",     use: "strip banners" },
      { name: "Slim",        v: "5 / 1",     use: "ticker bars" },
      { name: "Square-Crop", v: "1 / 1",     use: "gallery grids" },
    ];
    const variants = [
      { name: "Plain",     cls: "aspect-ratio",       fam: "minimal-flat",  extra: "" },
      { name: "Bordered",  cls: "aspect-ratio border",fam: "brutalist",     extra: "border-2 border-black" },
      { name: "Rounded",   cls: "aspect-ratio rounded-xl", fam: "glassmorphism", extra: "overflow-hidden" },
      { name: "Shadowed",  cls: "aspect-ratio shadow-lg", fam: "material",  extra: "rounded-lg" },
    ];
    for (let i = 0; i < ratios.length; i++) {
      for (let j = 0; j < variants.length; j++) {
        const r = ratios[i];
        const v = variants[j];
        const mood = pick(SUPP_MOOD, i * 4 + j + 13);
        add({
          name: `Aspect ${r.name} (${v.name})`,
          semantic_description: suppDesc([
            `${r.name} aspect-ratio box (${r.v}) styled with the ${v.name.toLowerCase()} variant, locking dimensions for ${r.use}.`,
            `Renders a ${mood} frame that holds its proportion across breakpoints, preventing layout shift on lazy-loaded media.`,
            `Pairs naturally with the ${v.fam} family for cards and media tiles.`,
          ]),
          tags: ["utility", "aspect-ratio", r.name.toLowerCase(), v.name.toLowerCase(), "media"],
          payload: `aspect-[${r.v.replace(/\s*\/\s*/g, "_")}] ${v.extra}`.trim(),
          css: `.ar-${i}-${j} { aspect-ratio:${r.v}; ${v.extra ? `/* ${v.extra} */` : ""} }`,
          conflicts: [`aspect:${r.v.replace(/\s/g, "")}`],
          family: v.fam,
          meta: { ratio: r.v, use: r.use, variant: v.name },
        });
      }
    }
    // 2 extras to round to 50
    add({
      name: "Safe-Area Inset Padding",
      semantic_description: suppDesc([
        `Applies env(safe-area-inset-*) padding so content clears notches, home indicators, and rounded device corners.`,
        `Essential for ${pick(SUPP_USE, 14)} rendered inside webviews on modern phones.`,
      ]),
      tags: ["utility", "safe-area", "padding", "mobile", "notch"],
      payload: "pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]",
      css: ".safe-area { padding-top:env(safe-area-inset-top); padding-right:env(safe-area-inset-right); padding-bottom:env(safe-area-inset-bottom); padding-left:env(safe-area-inset-left); }",
      conflicts: ["padding:safe-area"],
      family: "minimal-flat",
      meta: { type: "safe-area" },
    });
    add({
      name: "Scroll Margin Top (sticky offset)",
      semantic_description: suppDesc([
        `Sets scroll-margin-top so anchor jumps land below a sticky header rather than underneath it.`,
        `A ${pick(SUPP_MOOD, 17)} quality-of-life utility for in-page navigation on long-form ${pick(SUPP_USE, 12)}.`,
      ]),
      tags: ["utility", "scroll-margin", "anchor", "sticky", "navigation"],
      payload: "scroll-mt-24",
      css: ".scroll-mt-24 { scroll-margin-top: 6rem; }",
      conflicts: ["scroll-margin:top"],
      family: "minimal-flat",
      meta: { type: "scroll-margin", offset: "6rem" },
    });
  }

  return out;
}

/* ============================== main ============================== */
async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const builders: Array<[Category, () => LexiconEntry[]]> = [
    ["layouts", buildLayouts],
    ["components", buildComponents],
    ["styles", buildStyles],
    ["typography", buildTypography],
    ["interactions", buildInteractions],
    ["utilities", buildUtilities],
  ];

  const ids = new Set<string>();
  let total = 0;
  const summary: Array<{ category: Category; count: number }> = [];

  for (const [cat, build] of builders) {
    const baseEntries = build();
    const suppEntries = buildSupplement(cat);
    const entries = [...baseEntries, ...suppEntries];
    // Dedupe + validate within this file
    for (const e of entries) {
      if (!e.semantic_description) throw new Error(`empty description at ${e.id}`);
      if (!e.tags || e.tags.length === 0) throw new Error(`empty tags at ${e.id}`);
      if (!e.payload) throw new Error(`empty payload at ${e.id}`);
      if (e.category !== cat) throw new Error(`category mismatch at ${e.id}: ${e.category} != ${cat}`);
      if (ids.has(e.id)) throw new Error(`duplicate id across files: ${e.id}`);
      ids.add(e.id);
    }
    const file: LexiconFile = {
      category: cat,
      version: "1.0.0",
      count: entries.length,
      entries,
    };
    const outPath = path.join(OUT_DIR, `${cat}.json`);
    await fs.writeFile(outPath, JSON.stringify(file, null, 2), "utf8");
    summary.push({ category: cat, count: entries.length });
    total += entries.length;
  }

  console.log("\n=== Lexicon generation summary ===");
  for (const s of summary) {
    console.log(`  ${s.category.padEnd(14)} ${String(s.count).padStart(5)}`);
  }
  console.log(`  ${"total".padEnd(14)} ${String(total).padStart(5)}`);
  console.log(`\n  Unique IDs: ${ids.size}`);
  console.log(`  Output: ${OUT_DIR}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
