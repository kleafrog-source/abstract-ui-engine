export type SemanticConfigPrimitive = string | number | boolean;
export type SemanticConfigValue =
  | SemanticConfigPrimitive
  | SemanticConfigPrimitive[]
  | { x: number; y: number }
  | null;

export interface SemanticConfigOption {
  value: SemanticConfigPrimitive;
  label_en?: string;
  label_ru?: string;
  description_en?: string;
  description_ru?: string;
}

export interface SemanticConfigRangeAxis {
  min: number;
  max: number;
  step: number;
  description_en?: string;
  description_ru?: string;
}

export interface SemanticConfigRange {
  min?: number;
  max?: number;
  step?: number;
  x?: SemanticConfigRangeAxis;
  y?: SemanticConfigRangeAxis;
  description_en?: string;
  description_ru?: string;
}

export interface SemanticConfigParameter {
  id: string;
  name_en?: string;
  name_ru?: string;
  description_en?: string;
  description_ru?: string;
  control_type:
    | "dropdown"
    | "segmented_control"
    | "toggle"
    | "radio"
    | "slider"
    | "stepper"
    | "checkbox"
    | "text_input"
    | "xy_slider";
  options?: SemanticConfigOption[];
  range?: SemanticConfigRange;
  default?: SemanticConfigValue;
  category?: string;
  metric?: string;
  formula_role?: string;
  _source?: "core" | "mmss";
}

export interface SemanticConfigSchemaResponse {
  core: SemanticConfigParameter[];
  mmss: SemanticConfigParameter[];
  defaults: Record<string, SemanticConfigValue>;
  categories: Record<string, string[]>;
  digest: string;
}

export interface SemanticConfigRecommendation {
  value: SemanticConfigValue;
  reason: string;
  confidence: number;
  details?: Array<{ label: string; score: number }>;
}

export interface SemanticConfigRecommendResponse {
  schema: SemanticConfigSchemaResponse;
  values: Record<string, SemanticConfigValue>;
  recommendations: Record<string, SemanticConfigRecommendation>;
  changed: Array<{
    id: string;
    before: SemanticConfigValue;
    after: SemanticConfigValue;
    reason: string;
    confidence: number;
  }>;
  retrievalQuery: string;
}
