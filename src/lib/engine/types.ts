export type LexiconCategory =
  | "layouts"
  | "components"
  | "styles"
  | "typography"
  | "interactions"
  | "utilities";

/**
 * A single entry in the UI Lexicon. Every entry has a `semantic_description`
 * written in English, crafted to expose fine visual nuance to an embedding
 * model (e.g. BGE-M3) so cosine search can distinguish "soft diffuse shadow"
 * from "hard drop shadow".
 */
export interface LexiconEntry {
  /** Globally unique id, e.g. "styles.shadow.soft-diffuse". */
  id: string;
  /** Category bucket (file name without extension). */
  category: LexiconCategory;
  /** Short human label, e.g. "Soft Diffuse Shadow". */
  name: string;
  /**
   * Rich English description embedding fine visual nuance. This is the text
   * that gets vectorized for semantic search.
   */
  semantic_description: string;
  /** Keywords/tags for hybrid (keyword + vector) matching and debug highlighting. */
  tags: string[];
  /** The actual CSS / HTML / JS payload (class names, css declarations, snippet). */
  payload: string;
  /** Inline CSS rules to inject when the entry is selected (optional). */
  css?: string;
  /** Optional raw HTML fragment the assembly engine may render. */
  html?: string;
  /** Optional vanilla JS snippet (for interactions). */
  js?: string;
  /** Responsive hints used by the assembly engine to emit media queries. */
  responsive?: ResponsiveSpec;
  /** Accessibility hints (contrast pair, recommended aria). */
  accessibility?: AccessibilitySpec;
  /** Conflict keys the resolver uses to prevent incompatible overlaps. */
  conflicts?: string[];
  /** Specifier of the visual "family" for semantic-coherence grouping. */
  family?: string;
  /** Freeform metadata. */
  meta?: Record<string, string | number | boolean>;
}

export interface ResponsiveSpec {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  /** e.g. "stack" | "grid" | "hide" | "collapse" */
  behavior?: string;
}

export interface AccessibilitySpec {
  /** Min contrast ratio (WCAG) intended for foreground/background pairs. */
  contrastRatio?: number;
  aria?: string[];
  focusVisible?: boolean;
}

export interface LexiconFile {
  category: LexiconCategory;
  version: string;
  count: number;
  entries: LexiconEntry[];
}

/* ----------------------------- Search results ---------------------------- */

export interface SearchHit {
  entry: LexiconEntry;
  /** Cosine similarity 0..1. */
  score: number;
  /** Confidence bucket label for UI badges. */
  confidence: "high" | "medium" | "low";
  /** Which query tokens matched this entry's tags/description (debug). */
  matchedTokens: string[];
}

export interface SearchResult {
  query: string;
  provider: string;
  temperature: number;
  hits: SearchHit[];
  tookMs: number;
}

/* ----------------------------- Assembly output --------------------------- */

export interface AssemblySelection {
  layout?: SearchHit;
  components: SearchHit[];
  styles: SearchHit[];
  typography: SearchHit[];
  interactions: SearchHit[];
  utilities: SearchHit[];
  locked: string[]; // entry ids the user froze
}

export interface BuildTreeNode {
  id: string;
  label: string;
  category: LexiconCategory | "root" | "page";
  score?: number;
  locked?: boolean;
  children?: BuildTreeNode[];
}

export interface AssembledPage {
  html: string;
  css: string;
  js: string;
  /** Full standalone HTML document (head + inline styles + body + script). */
  standalone: string;
  tree: BuildTreeNode;
  selection: AssemblySelection;
}

/* ------------------------------- Metrics --------------------------------- */

export interface QualityMetrics {
  semanticCoherence: number; // 0..100
  accessibilityScore: number; // 0..100
  complexityIndex: number; // 0..100 (higher = more complex)
  contrastWarnings: string[];
  ariaCoverage: number; // 0..100
  domNodeEstimate: number;
  mediaQueries: number;
  detail: {
    pairwiseCosine: number;
    lockedCount: number;
    componentCount: number;
    styleCount: number;
    utilityCount: number;
  };
}

export interface GenerateResponse {
  result: SearchResult;
  assembly: AssembledPage;
  metrics: QualityMetrics;
  debug: DebugInfo;
}

export interface DebugInfo {
  queryTokens: string[];
  tokenMatches: Array<{ token: string; hitIds: string[] }>;
  provider: string;
  cacheStatus: "fresh" | "loaded" | "rebuilt";
  lexiconStats: Record<string, number>;
}
