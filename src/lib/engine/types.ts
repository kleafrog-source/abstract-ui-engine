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
  retrievalQuery?: string;
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
  archetype: "landing" | "dashboard" | "docs" | "catalog";
  locale: "en" | "ru" | "mixed";
  completeness: {
    totalSlots: number;
    majorSlots: number;
    retrievedSlots: number;
    fusedSlots: number;
    fallbackSlots: number;
    majorRetrievedSlots: number;
    sectionFirstSlots: number;
    warnings: string[];
  };
  mediaStrategy: "mobile-first" | "desktop-first";
  designDirectives: {
    randomFieldArea: boolean;
    chaosLevel: "calm" | "dynamic" | "chaotic";
    motionLevel: "none" | "simple" | "medium" | "complex";
    matchedChaosTerms: string[];
    surfaceEffects: string[];
  };
  constraints: Record<string, Record<string, number>>;
  warnings: string[];
  constraintValidation: {
    valid: boolean;
    slots: Record<string, Record<string, { expected: number; actual: number; valid: boolean } | boolean>>;
    violations: string[];
  };
  plan: Array<{
    slot: string;
    source: "retrieved" | "retrieved_fused" | "fallback_parameterized" | "fallback_hybrid" | "fallback_static";
    componentId: string | null;
    constraints: Record<string, number>;
    valid: boolean;
    rejectedCandidates: Array<{ id: string; reason: string; detail?: string }>;
    semanticTag: string;
    sourceTokens: string[];
    bundle: {
      base: SlotBundleHit | null;
      layouts: SlotBundleHit[];
      sections: SlotBundleHit[];
      support: SlotBundleHit[];
      styles: SlotBundleHit[];
      interactions: SlotBundleHit[];
      supportTarget: string | null;
      retrievalQuery?: string;
      styleQuery?: string;
      interactionQuery?: string;
      expectedFamilies: string[];
      baseFamily: string;
      baseLevel: string;
    };
  }>;
  result: SearchResult;
  assembly: AssembledPage;
  metrics: QualityMetrics;
  debug: DebugInfo;
  mmss: import("@/types/mmss").MMSSMetrics;
  semanticConfig?: Record<string, import("@/types/semantic-config").SemanticConfigValue>;
  debugArtifacts?: {
    generatedAt: string;
    full: string;
    summary: string;
  };
}

export interface SlotBundleHit {
  id?: string;
  category?: string;
  name?: string;
  family?: string;
  level?: string;
  sectionCapable?: boolean;
  score?: number;
  matchedTokens?: string[];
}

export interface DebugInfo {
  queryTokens: string[];
  tokenMatches: Array<{ token: string; hitIds: string[] }>;
  provider: string;
  cacheStatus: "fresh" | "loaded" | "rebuilt";
  lexiconStats: Record<string, number>;
}
