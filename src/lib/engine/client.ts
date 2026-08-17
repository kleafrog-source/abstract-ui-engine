"use client";
import type {
  DebugInfo,
  GenerateResponse,
  QualityMetrics,
  SearchResult,
  AssembledPage,
  LexiconCategory,
} from "./types";
import type {
  SemanticConfigRecommendResponse,
  SemanticConfigSchemaResponse,
  SemanticConfigValue,
} from "@/types/semantic-config";

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${msg}`);
  }
  return (await res.json()) as T;
}

export interface LexiconStatsResponse {
  total: number;
  byCategory: Record<string, number>;
  loadedAt: number;
  cache: {
    exists: boolean;
    path: string;
    size: number;
    generatedAt: string | null;
    count: number;
  };
  config: {
    provider: string;
    dim: number;
    ollama: string;
    model: string;
    cache: string;
  };
}

export async function fetchStats(): Promise<LexiconStatsResponse> {
  return json<LexiconStatsResponse>(apiUrl("/lexicon/stats"));
}

export interface GenerateParams {
  q: string;
  temperature?: number;
  topK?: number;
  locked?: string[];
  preferFamily?: string;
  archetype?: "auto" | "landing" | "dashboard" | "docs" | "catalog";
  mediaStrategy?: "mobile-first" | "desktop-first";
  debugTips?: boolean;
  animationMode?: "auto" | "none" | "simple" | "medium" | "complex";
  semanticConfig?: Record<string, SemanticConfigValue>;
}

export async function generatePage(
  params: GenerateParams,
): Promise<GenerateResponse> {
  return json<GenerateResponse>(apiUrl("/engine/generate"), {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function searchLexicon(
  params: GenerateParams & { category?: LexiconCategory },
): Promise<SearchResult> {
  return json<SearchResult>(apiUrl("/engine/search"), {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function fetchMetrics(
  params: GenerateParams,
): Promise<{ metrics: QualityMetrics; selection: AssembledPage["selection"] }> {
  return json(apiUrl("/engine/metrics"), {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function exportStandalone(
  params: GenerateParams,
): Promise<{ standalone: string }> {
  return json(apiUrl("/engine/export"), {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function downloadStandaloneUrl() {
  return apiUrl("/engine/export");
}

export async function downloadStandalone(params: GenerateParams) {
  const res = await fetch(apiUrl("/engine/export"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...params, download: true }),
  });
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `genesis-${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export interface DebugResponse {
  debug: DebugInfo;
  config: { provider: string; dim: number; ollama: string; model: string; cache: string };
  cache: { exists: boolean; count: number; generatedAt: string | null; size: number };
  hits: Array<{
    id: string;
    name: string;
    score: number;
    confidence: string;
    matchedTokens: string[];
  }>;
}

export async function fetchDebug(params: GenerateParams): Promise<DebugResponse> {
  return json<DebugResponse>(apiUrl("/engine/debug"), {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function reloadLexicon(invalidateCache = false): Promise<{
  ok: boolean;
  total: number;
  byCategory: Record<string, number>;
  cacheStatus: string;
}> {
  return json(apiUrl("/lexicon/reload"), {
    method: "POST",
    body: JSON.stringify({ invalidateCache }),
  });
}

export async function fetchSemanticConfigSchema(): Promise<SemanticConfigSchemaResponse> {
  return json<SemanticConfigSchemaResponse>(apiUrl("/semantic-config/schema"));
}

export async function recommendSemanticConfig(input: {
  q: string;
  currentValues?: Record<string, SemanticConfigValue>;
}): Promise<SemanticConfigRecommendResponse> {
  return json<SemanticConfigRecommendResponse>(apiUrl("/semantic-config/recommend"), {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface AddEntryParams {
  category: LexiconCategory;
  name: string;
  semantic_description: string;
  tags?: string[];
  payload: string;
  css?: string;
  html?: string;
  js?: string;
  conflicts?: string[];
  family?: string;
}

export async function addLexiconEntry(
  params: AddEntryParams,
): Promise<{ ok: boolean; id: string; total: number }> {
  return json(apiUrl("/lexicon/add"), {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export const QUERY_PRESET_BANK = {
  id: "prompt-preset-bank",
  title: "Prompt Preset Bank",
  subtitle: "Long-form query presets",
} as const;

export const EXAMPLE_PROMPTS = [
  "Build a premium SaaS analytics landing page with 1 hero, 4 KPI cards, 6 feature cards, 3 pricing tiers, 2 testimonial rows, deep midnight blue background, cyan-to-emerald gradients, frosted glass navigation, warm coral CTA buttons, soft mesh highlights, and subtle scroll reveal motion on every major section.",
  "Create a modern fintech dashboard with 12 metric cards, 2 stacked area charts, 1 revenue table with 8 rows, 1 right-side activity feed, graphite background, silver borders, electric lime accents, pale mint chart fills, rounded glass panels, dense enterprise spacing, and distinct hover states for filters, tabs, and export buttons.",
  "Design a docs portal with 1 sticky top search bar, 1 left navigation tree, 5 documentation cards, 3 code example blocks, 2 alert banners, soft ivory content surface, ink headings, blue-violet section anchors, green success callouts, amber warning pills, and polished editorial spacing that feels like a mature developer platform.",
  "Generate an e-commerce homepage with 1 promotional hero, 8 product cards, 4 category tiles, 1 comparison strip, 3 testimonial blocks, off-white background, charcoal typography, tangerine buy buttons, olive accent chips, lilac to peach promotional gradients, and layered shadows so the page feels like a complete retail experience rather than a single widget.",
  "Compose a cybersecurity operations dashboard with 6 threat cards, 2 timelines, 1 alert table with 10 rows, 1 command sidebar, blackened navy background, neon teal and signal red highlights, monospace metric labels, metallic separators, glowing severity badges, and restrained tactical animations for status pulses, row focus, and filter dropdowns.",
  "Assemble a creative agency website with 1 oversized hero, 7 portfolio cards, 3 service bands, 1 team strip with 5 portraits, 1 quote carousel, sandstone background, espresso headings, vermilion primary buttons, dusty pink accent underlines, cinematic gradients behind feature panels, and bold typographic rhythm across every section.",
  "Produce a healthcare patient portal with 4 appointment cards, 2 lab-result tables, 1 secure message panel, 3 action buttons, calm porcelain background, muted teal cards, deep navy headings, moss green confirmation states, soft rose notification badges, accessibility-first contrast, and calm card choreography that still feels fully built-out.",
  "Create a travel booking page with 1 destination hero, 6 offer cards, 3 filter groups, 1 itinerary preview, 4 small statistic badges, twilight indigo header, sunlit orange CTA buttons, aqua chips, sand-toned content blocks, gradient image masks, and compact but premium information density for a polished booking experience.",
  "Make a B2B onboarding workspace with 5 step panels, 1 progress sidebar, 4 checklist cards, 2 inline tips sections, 1 completion summary, slate background, icy blue strokes, emerald completion states, neutral gray form surfaces, clean gradient dividers, and responsive spacing so each step reads like a full application flow.",
  "Build a music festival landing page with 1 poster-style hero, 9 lineup cards, 1 schedule table with 12 rows, 4 ticket blocks, 1 sponsor wall, black background, ultraviolet and neon orange gradients, bright cyan secondary buttons, pink glowing badges, strong poster typography, and motion cues on cards, tabs, and headline accents.",
  "Generate a job board interface with 1 search hero, 8 featured job cards, 4 filter columns, 1 salary insights strip, 1 company logo wall, light gray canvas, ink text, cobalt apply buttons, mint highlight badges, soft yellow recommendation panels, and consistent hierarchy that clearly reads as a multi-section product page.",
  "Design a restaurant site with 1 reservation hero, 5 menu category panels, 6 dish cards, 1 gallery strip, 1 location footer, dark espresso background, cream content surfaces, terracotta buttons, sage accents, copper separators, and rich atmospheric gradients that make the page feel editorial and complete.",
  "Create a CRM account detail page with 1 profile summary, 7 info cards, 1 deal table with 6 rows, 1 notes timeline, 1 action sidebar, blue-gray application shell, white cards, indigo buttons, lime micro-badges, peach warning banners, and strong panel segmentation so the page behaves like a serious enterprise surface.",
  "Produce a learning platform dashboard with 1 welcome hero, 6 course cards, 3 progress widgets, 1 calendar panel, 1 achievements strip, mist background, navy headings, violet CTA buttons, seafoam progress fills, amber milestone badges, and subtle motion for tab switches, hover states, and level-up callouts.",
  "Build a crypto portfolio control center with 7 asset cards, 2 allocation charts, 1 watchlist table with 9 rows, 3 alert panels, 1 insights sidebar, obsidian background, electric green values, magenta-to-cyan gradients, neutral steel card frames, luminous filter pills, and complete dense layout behavior across the whole screen.",
  "Create a real-estate listing hub with 1 media hero, 6 property cards, 3 filter bars, 1 map preview, 1 mortgage calculator panel, clean pearl background, dark slate text, royal blue action buttons, olive amenity chips, sunset orange micro-gradients, and a fully composed browsing experience with multiple clearly separated sections.",
  "Сделай product landing page для AI studio с 1 hero, 5 feature cards, 3 pricing cards, 2 testimonial rows, тёмно-синий фон, бирюзово-изумрудные градиенты, coral CTA buttons, светлые glass panels, крупную типографику, и добавь выразительные hover states для карточек, кнопок и пунктов навигации.",
  "Create dashboard for logistics control center с 8 KPI cards, 2 route charts, 1 delivery table на 10 строк, 3 status filters, графитовый фон, amber alert badges, холодные blue cards, зелёные success buttons, фиолетовые gradient headers, and make every block feel enterprise-level, dense, and visually complete.",
  "Собери docs portal with 1 sticky header, 1 sidebar tree, 6 article cards, 3 code samples, 2 callout panels, молочно-белый фон, тёмные заголовки, синие anchor links, зелёные success notes, оранжевые warning badges, и аккуратные разделители между секциями как в mature developer platform.",
  "Make an ecommerce catalog page с 12 product cards, 4 filter groups, 1 compare drawer, 1 featured banner, тёплый светлый фон, charcoal typography, lime buy buttons, lavender promo gradient, muted rose badges, и добавь явные hover transitions, skeleton loading placeholders, and polished spacing between cards and controls.",
  "Сделай creative agency homepage with 1 giant hero, 6 case-study cards, 3 service blocks, 1 quote slider, песочный фон, бордовые кнопки, приглушённые розовые акценты, сине-фиолетовые декоративные градиенты, and use strong editorial contrast so the result looks like a complete premium website instead of one isolated section.",
  "Create healthcare portal с 4 appointment cards, 2 lab tables, 1 secure chat block, 3 quick-action buttons, светлый фарфоровый фон, teal карточки, navy headings, зелёные confirmation states, мягкие pink notification pills, and keep accessibility, calm spacing, and full-page completeness as core goals.",
  "Собери travel booking dashboard with 1 destination hero, 5 offer cards, 3 filter rows, 1 itinerary summary, 4 stat badges, индиго header, orange CTA buttons, aqua chips, sand panels, тёплые градиенты в hero и карточках, and make the whole composition feel polished, layered, and ready for real users.",
  "Make a festival page с 1 poster hero, 8 lineup cards, 1 schedule table on 12 rows, 4 ticket cards, чёрный фон, neon orange and violet gradients, cyan secondary buttons, pink badges, and add clear section-to-section progression so the page reads as a long immersive experience rather than a short fragment.",
  "Сделай лендинг для дизайнерского агентства с 1 hero-блоком, 6 карточками кейсов, 3 секциями услуг, 1 полосой с цифрами, бежевым фоном, тёмно-бордовыми кнопками, розово-персиковыми градиентами, оливковыми метками и крупной выразительной типографикой на всех ключевых экранах.",
  "Создай интерфейс каталога компонентов с 10 карточками, 4 фильтрами, 1 детальной боковой панелью, 1 строкой поиска, светло-серым фоном, тёмными заголовками, синими кнопками действий, янтарными бейджами, мягкими сиреневыми градиентами для промо-зон и полноценной многоуровневой структурой страницы.",
  "Собери dashboard для аналитики продаж с 8 KPI-карточками, 2 графиками, 1 таблицей на 12 строк, 1 правой панелью событий, графитовым фоном, изумрудными позитивными значениями, красными alert badges, ледяными синими карточками и акцентными кнопками цвета лайма.",
  "Сделай страницу документации с 1 верхней поисковой строкой, 1 левым меню, 5 карточками статей, 3 блоками кода, 2 информационными баннерами, молочным фоном, тёмно-синими заголовками, зелёными подсказками успеха, оранжевыми предупреждениями и аккуратной сеткой между всеми секциями.",
  "Создай интернет-магазин электроники с 1 hero-баннером, 12 товарными карточками, 4 плитками категорий, 1 секцией сравнения, 3 отзывами, белым фоном, угольно-чёрным текстом, ярко-оранжевыми кнопками покупки, голубыми бейджами, фиолетово-розовыми градиентами и выразительными hover-эффектами.",
  "Собери портал онлайн-обучения с 1 приветственным hero, 6 карточками курсов, 3 виджетами прогресса, 1 календарём, 1 блоком достижений, светлым туманным фоном, тёмно-синими заголовками, фиолетовыми CTA-кнопками, мятными progress bars, янтарными значками и цельной многоэкранной композицией.",
  "Сделай страницу для бронирования путешествий с 1 hero-секцией, 6 карточками направлений, 3 фильтрами, 1 превью маршрута, 4 бейджами преимуществ, фоном цвета тёплого песка, индиго-заголовками, оранжевыми кнопками, аква-акцентами и мягкими закатными градиентами в фоне блоков.",
].map((prompt) => prompt.replace(/\s+/g, " ").trim());
