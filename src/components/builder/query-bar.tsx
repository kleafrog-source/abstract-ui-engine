"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sparkles,
  Thermometer,
  Loader2,
  Lock,
  LockOpen,
  Wand2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { EXAMPLE_PROMPTS, QUERY_PRESET_BANK } from "@/lib/engine/client";
import { useUndo } from "@/hooks/useUndo";

export function QueryBar({
  query,
  onQuery,
  archetype,
  onArchetype,
  mediaStrategy,
  onMediaStrategy,
  animationMode,
  onAnimationMode,
  debugTips,
  onDebugTips,
  temperature,
  onTemperature,
  onGenerate,
  loading,
  lockedCount,
  onClearLocks,
  compact,
}: {
  query: string;
  onQuery: (q: string) => void;
  archetype: "auto" | "landing" | "dashboard" | "docs" | "catalog";
  onArchetype: (a: "auto" | "landing" | "dashboard" | "docs" | "catalog") => void;
  mediaStrategy: "mobile-first" | "desktop-first";
  onMediaStrategy: (value: "mobile-first" | "desktop-first") => void;
  animationMode: "auto" | "none" | "simple" | "medium" | "complex";
  onAnimationMode: (value: "auto" | "none" | "simple" | "medium" | "complex") => void;
  debugTips: boolean;
  onDebugTips: (value: boolean) => void;
  temperature: number;
  onTemperature: (t: number) => void;
  onGenerate: () => void;
  loading?: boolean;
  lockedCount: number;
  onClearLocks: () => void;
  compact?: boolean;
}) {
  const tempLabel =
    temperature < 0.25
      ? "Strict"
      : temperature < 0.6
        ? "Balanced"
        : temperature < 0.85
          ? "Creative"
          : "Wild";

  const undo = useUndo(query);
  const [presetsOpen, setPresetsOpen] = React.useState(true);

  React.useEffect(() => {
    if (query !== undo.value) {
      undo.resetValue(query);
    }
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (archetype !== "auto") {
      onArchetype("auto");
    }
  }, [archetype, onArchetype]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <Textarea
            value={undo.value}
            onChange={(e) => {
              undo.setValue(e.target.value);
              onQuery(e.target.value);
            }}
            onKeyDown={(e) => {
              undo.onKeyDown(e);
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                onGenerate();
              }
            }}
            placeholder="Describe the interface you want... e.g. 'chaotic layered landing page with rich motion and mixed gradients'"
            className="min-h-[56px] resize-none text-sm"
            rows={compact ? 2 : 3}
          />
        </div>
        <div className="flex flex-row gap-2 sm:flex-col sm:justify-stretch">
          <Button
            onClick={onGenerate}
            disabled={loading || !undo.value.trim()}
            className="flex-1 sm:flex-none"
          >
            {loading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-1.5 h-4 w-4" />
            )}
            {compact ? "Go" : "Generate"}
          </Button>
          {lockedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearLocks}
              className="flex-1 sm:flex-none"
            >
              <LockOpen className="mr-1.5 h-3.5 w-3.5" />
              {lockedCount} locked
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex w-[184px] shrink-0 items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs">
          <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
            Auto
          </Badge>
          <span className="leading-tight text-muted-foreground">
            Page type is inferred adaptively from the query.
          </span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Thermometer className="h-3.5 w-3.5" />
                Temperature
              </span>
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              Strict (0) trusts vectors. Creative (1) broadens retrieval and mixes more styles.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Slider
          value={[temperature]}
          onValueChange={(v) => onTemperature(v[0])}
          min={0}
          max={1}
          step={0.05}
          className="flex-1"
        />
        <Badge variant="outline" className="w-20 justify-center tabular-nums">
          {tempLabel} | {temperature.toFixed(2)}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Select
          value={mediaStrategy}
          onValueChange={(value) =>
            onMediaStrategy(value as "mobile-first" | "desktop-first")
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Media strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mobile-first">Mobile-first</SelectItem>
            <SelectItem value="desktop-first">Desktop-first</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={animationMode}
          onValueChange={(value) =>
            onAnimationMode(value as "auto" | "none" | "simple" | "medium" | "complex")
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Animation preset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Animation: Auto</SelectItem>
            <SelectItem value="none">Animation: None</SelectItem>
            <SelectItem value="simple">Animation: Simple</SelectItem>
            <SelectItem value="medium">Animation: Medium</SelectItem>
            <SelectItem value="complex">Animation: Complex</SelectItem>
          </SelectContent>
        </Select>

        <label className="flex min-h-10 items-center gap-2 rounded-md border px-3 text-xs text-muted-foreground">
          <Switch checked={debugTips} onCheckedChange={onDebugTips} />
          Show debug tips
        </label>
      </div>

      {!compact && (
        <div
          id={QUERY_PRESET_BANK.id}
          className="rounded-lg border border-border/60 bg-muted/20 p-2.5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Try:
                <span>{QUERY_PRESET_BANK.title}</span>
                <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                  {EXAMPLE_PROMPTS.length}
                </Badge>
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                ID: <code>{QUERY_PRESET_BANK.id}</code> · {QUERY_PRESET_BANK.subtitle}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPresetsOpen((value) => !value)}
              className="h-7 px-2 text-[11px] text-muted-foreground"
            >
              {presetsOpen ? (
                <>
                  <ChevronUp className="mr-1 h-3.5 w-3.5" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-3.5 w-3.5" />
                  Expand
                </>
              )}
            </Button>
          </div>
          {presetsOpen && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {EXAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    undo.resetValue(p);
                    onQuery(p);
                  }}
                  className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-left text-[11px] leading-4 text-muted-foreground transition-colors hover:border-border hover:bg-background hover:text-foreground"
                  title={p}
                >
                  {p.length > 92 ? `${p.slice(0, 92)}...` : p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {lockedCount > 0 && !compact && (
        <div className="flex items-center gap-1.5 text-[11px] text-primary">
          <Lock className="h-3 w-3" />
          {lockedCount} block{lockedCount > 1 ? "s" : ""} locked - preserved across regeneration.
        </div>
      )}
    </div>
  );
}
