"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Wand2, SlidersHorizontal } from "lucide-react";
import { useEngine } from "@/lib/engine/store";
import { PreviewFrame } from "@/components/builder/preview-frame";
import { MetricsDashboard } from "@/components/builder/metrics-dashboard";
import { MMSSPanel } from "@/components/builder/MMSSPanel";
import type {
  SemanticConfigParameter,
  SemanticConfigOption,
  SemanticConfigPrimitive,
  SemanticConfigValue,
} from "@/types/semantic-config";

const CATEGORY_LABELS: Record<string, string> = {
  layout_structure: "Layout Structure",
  color_theme: "Color Theme",
  typography: "Typography",
  spacing_alignment: "Spacing & Alignment",
  shapes_borders: "Shapes & Borders",
  effects_style: "Effects & Style",
  components: "Components",
  interactions: "Interactions",
  advanced: "Advanced",
  content: "Content",
  performance: "Performance",
  accessibility_seo: "Accessibility & SEO",
};

export function SemanticConfigMode() {
  const {
    query,
    setQuery,
    error,
    loading,
    response,
    semanticConfigSchema,
    semanticConfigValues,
    semanticConfigRecommendations,
    semanticConfigLoading,
    semanticConfigRetrievalQuery,
    loadSemanticConfigSchema,
    setSemanticConfigValue,
    resetSemanticConfigValues,
    recommendSemanticConfigValues,
    run,
  } = useEngine();

  React.useEffect(() => {
    void loadSemanticConfigSchema();
  }, [loadSemanticConfigSchema]);

  const parameters = React.useMemo(
    () => semanticConfigSchema ? [...semanticConfigSchema.core, ...semanticConfigSchema.mmss] : [],
    [semanticConfigSchema],
  );
  const grouped = React.useMemo(() => {
    const map = new Map<string, SemanticConfigParameter[]>();
    for (const parameter of parameters) {
      const key = parameter.category ?? "misc";
      const existing = map.get(key) ?? [];
      existing.push(parameter);
      map.set(key, existing);
    }
    return Array.from(map.entries());
  }, [parameters]);
  const nonDefaultCount = React.useMemo(() => {
    if (!semanticConfigSchema) return 0;
    return Object.entries(semanticConfigValues).filter(([id, value]) => !isSameValue(value, semanticConfigSchema.defaults[id])).length;
  }, [semanticConfigSchema, semanticConfigValues]);
  const standalone = response?.assembly.standalone ?? "";
  const metrics = response?.metrics ?? null;
  const mmss = response?.mmss ?? null;

  return (
    <div className="grid grid-cols-1 gap-3 p-3 xl:grid-cols-12">
      <div className="space-y-3 xl:col-span-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Semantic Configurator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="semantic-config-query">Query</Label>
              <Input
                id="semantic-config-query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Travel booking page with 6 cards, orange CTA buttons, aqua chips, sand panels..."
              />
              <p className="text-[11px] text-muted-foreground">
                BGE-M3 will map this prompt to page parameters, then generation runs with an expanded retrieval query.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void recommendSemanticConfigValues()} disabled={semanticConfigLoading || !query.trim()}>
                {semanticConfigLoading ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-1.5 h-4 w-4" />
                )}
                Suggest Parameters
              </Button>
              <Button
                variant="secondary"
                onClick={() => void run({ semanticConfig: semanticConfigValues })}
                disabled={loading || !query.trim()}
              >
                {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
                Generate From Config
              </Button>
              <Button variant="ghost" onClick={resetSemanticConfigValues} disabled={!semanticConfigSchema}>
                Reset
              </Button>
            </div>
            {error && <p className="text-xs text-rose-500">{error}</p>}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <MetricChip label="Parameters" value={String(parameters.length)} />
              <MetricChip label="Changed" value={String(nonDefaultCount)} />
              <MetricChip label="Recommended" value={String(Object.keys(semanticConfigRecommendations).length)} />
              <MetricChip label="Schema" value={semanticConfigSchema ? "loaded" : "loading"} />
            </div>
            {semanticConfigRetrievalQuery ? (
              <>
                <Separator />
                <div className="space-y-1">
                  <div className="text-[11px] font-medium">Expanded retrieval query</div>
                  <div className="rounded-md border bg-muted/40 p-2 text-[11px] text-muted-foreground">
                    {semanticConfigRetrievalQuery}
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Parameter Controls</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="px-4 pb-4">
                <Accordion type="multiple" defaultValue={grouped.slice(0, 4).map(([category]) => category)}>
                  {grouped.map(([category, items]) => (
                    <AccordionItem key={category} value={category}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{CATEGORY_LABELS[category] ?? category}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {items.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        {items.map((parameter) => (
                          <ParameterField
                            key={parameter.id}
                            parameter={parameter}
                            value={semanticConfigValues[parameter.id] ?? parameter.default ?? null}
                            recommendation={semanticConfigRecommendations[parameter.id]}
                            onChange={(value) => setSemanticConfigValue(parameter.id, value)}
                          />
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3 xl:col-span-5">
        <div className="h-[calc(100vh-130px)] min-h-[440px]">
          <PreviewFrame html={standalone} loading={loading} title="Semantic Config Preview" />
        </div>
      </div>

      <div className="space-y-3 xl:col-span-3">
        <MetricsDashboard metrics={metrics} loading={loading} />
        <MMSSPanel metrics={mmss} loading={loading} />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Applied Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-[11px]">
            {buildAppliedSummary(semanticConfigValues, semanticConfigSchema?.defaults ?? {}).map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground">{item.id}</span>
                <span className="max-w-[55%] text-right font-medium">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ParameterField({
  parameter,
  value,
  recommendation,
  onChange,
}: {
  parameter: SemanticConfigParameter;
  value: SemanticConfigValue;
  recommendation?: { reason: string; confidence: number };
  onChange: (value: SemanticConfigValue) => void;
}) {
  const title = parameter.name_ru || parameter.name_en || parameter.id;
  const description = parameter.description_ru || parameter.description_en || "";
  const control = parameter.control_type;

  return (
    <div className="space-y-2 rounded-lg border bg-card/40 p-3">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-medium">{title}</div>
          <Badge variant="secondary" className="text-[10px]">
            {control}
          </Badge>
          {parameter._source === "mmss" ? (
            <Badge variant="outline" className="text-[10px]">
              MMSS
            </Badge>
          ) : null}
        </div>
        <p className="text-[11px] text-muted-foreground">{description}</p>
        {recommendation ? (
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
            {recommendation.reason} · {Math.round(recommendation.confidence * 100)}%
          </p>
        ) : null}
      </div>

      {control === "toggle" ? (
        <div className="flex items-center justify-between rounded-md border bg-background/60 px-3 py-2">
          <span className="text-xs">{asBoolean(value) ? "Enabled" : "Disabled"}</span>
          <Switch checked={asBoolean(value)} onCheckedChange={(checked) => onChange(checked)} />
        </div>
      ) : null}

      {(control === "dropdown" || control === "segmented_control") && parameter.options ? (
        <Select value={stringValue(value)} onValueChange={(next) => onChange(parseOptionValue(next, parameter.options ?? []))}>
          <SelectTrigger>
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {parameter.options.map((option) => {
              const normalized = normalizeOption(option);
              return (
              <SelectItem key={String(normalized.value)} value={String(normalized.value)}>
                {normalized.label_ru || normalized.label_en || String(normalized.value)}
              </SelectItem>
            )})}
          </SelectContent>
        </Select>
      ) : null}

      {control === "radio" && parameter.options ? (
        <RadioGroup value={stringValue(value)} onValueChange={(next) => onChange(parseOptionValue(next, parameter.options ?? []))}>
          {parameter.options.map((option) => {
            const normalized = normalizeOption(option);
            return (
            <label key={String(normalized.value)} className="flex items-start gap-2 rounded-md border bg-background/60 p-2">
              <RadioGroupItem value={String(normalized.value)} className="mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-xs font-medium">{normalized.label_ru || normalized.label_en || String(normalized.value)}</div>
                <p className="text-[11px] text-muted-foreground">{normalized.description_ru || normalized.description_en}</p>
              </div>
            </label>
          )})}
        </RadioGroup>
      ) : null}

      {control === "checkbox" && parameter.options ? (
        <div className="space-y-2">
          {parameter.options.map((option) => {
            const normalized = normalizeOption(option);
            const selected = Array.isArray(value) && value.includes(normalized.value);
            return (
              <label key={String(normalized.value)} className="flex items-start gap-2 rounded-md border bg-background/60 p-2">
                <Checkbox
                  checked={selected}
                  onCheckedChange={(checked) => {
                    const current = Array.isArray(value) ? [...value] as SemanticConfigPrimitive[] : [];
                    const next = checked
                      ? Array.from(new Set([...current, normalized.value]))
                      : current.filter((item) => item !== normalized.value);
                    onChange(next);
                  }}
                  className="mt-0.5"
                />
                <div className="space-y-0.5">
                  <div className="text-xs font-medium">{normalized.label_ru || normalized.label_en || String(normalized.value)}</div>
                  <p className="text-[11px] text-muted-foreground">{normalized.description_ru || normalized.description_en}</p>
                </div>
              </label>
            );
          })}
        </div>
      ) : null}

      {(control === "slider" || control === "stepper") && parameter.range?.min !== undefined && parameter.range.max !== undefined ? (
        <NumericField
          value={typeof value === "number" ? value : Number(parameter.default ?? parameter.range.min)}
          min={parameter.range.min}
          max={parameter.range.max}
          step={parameter.range.step ?? 1}
          compact={control === "stepper"}
          onChange={(next) => onChange(next)}
        />
      ) : null}

      {control === "xy_slider" && parameter.range?.x && parameter.range?.y ? (
        <XYField
          value={isXYValue(value) ? value : { x: Number(parameter.range.x.min), y: Number(parameter.range.y.min) }}
          parameter={parameter}
          onChange={onChange}
        />
      ) : null}

      {control === "text_input" ? (
        <Input value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} />
      ) : null}
    </div>
  );
}

function NumericField({
  value,
  min,
  max,
  step,
  compact,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  compact?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Slider value={[value]} min={min} max={max} step={step} onValueChange={([next]) => onChange(next ?? value)} />
        <Input
          type="number"
          className="w-24"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        {compact ? "Stepper-style numeric control." : "Continuous value control."} Range {min} to {max}.
      </p>
    </div>
  );
}

function XYField({
  value,
  parameter,
  onChange,
}: {
  value: { x: number; y: number };
  parameter: SemanticConfigParameter;
  onChange: (value: SemanticConfigValue) => void;
}) {
  const x = parameter.range?.x;
  const y = parameter.range?.y;
  if (!x || !y) return null;
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="text-[11px] text-muted-foreground">X axis: {value.x}</div>
        <Slider value={[value.x]} min={x.min} max={x.max} step={x.step} onValueChange={([next]) => onChange({ ...value, x: next ?? value.x })} />
      </div>
      <div className="space-y-1">
        <div className="text-[11px] text-muted-foreground">Y axis: {value.y}</div>
        <Slider value={[value.y]} min={y.min} max={y.max} step={y.step} onValueChange={([next]) => onChange({ ...value, y: next ?? value.y })} />
      </div>
    </div>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/30 px-2 py-1.5">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function buildAppliedSummary(values: Record<string, SemanticConfigValue>, defaults: Record<string, SemanticConfigValue>) {
  return Object.entries(values)
    .filter(([id, value]) => !isSameValue(value, defaults[id]))
    .slice(0, 18)
    .map(([id, value]) => ({ id, value: renderSummaryValue(value) }));
}

function renderSummaryValue(value: SemanticConfigValue): string {
  if (Array.isArray(value)) return value.join(", ");
  if (isXYValue(value)) return `x:${value.x}, y:${value.y}`;
  return String(value);
}

function normalizeOption(option: SemanticConfigOption | SemanticConfigPrimitive): SemanticConfigOption {
  if (typeof option === "object" && option !== null && "value" in option) {
    return option;
  }
  return {
    value: option as SemanticConfigPrimitive,
    label_en: String(option),
    label_ru: String(option),
  };
}

function parseOptionValue(input: string, options: Array<SemanticConfigOption | SemanticConfigPrimitive>): SemanticConfigPrimitive {
  const matched = options.map(normalizeOption).find((option) => String(option.value) === input);
  return matched ? matched.value : input;
}

function stringValue(value: SemanticConfigValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function asBoolean(value: SemanticConfigValue): boolean {
  return value === true || value === "true";
}

function isXYValue(value: SemanticConfigValue): value is { x: number; y: number } {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && "x" in value && "y" in value;
}

function isSameValue(left: SemanticConfigValue, right: SemanticConfigValue): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
