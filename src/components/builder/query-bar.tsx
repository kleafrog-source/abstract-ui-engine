"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles, Thermometer, Loader2, Lock, LockOpen, Wand2 } from "lucide-react";
import { EXAMPLE_PROMPTS } from "@/lib/engine/client";

export function QueryBar({
  query,
  onQuery,
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

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <Textarea
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                onGenerate();
              }
            }}
            placeholder="Describe the interface you want…  e.g. 'soft glassmorphism SaaS dashboard with bento grid and warm sand palette'"
            className="min-h-[56px] resize-none text-sm"
            rows={compact ? 2 : 3}
          />
        </div>
        <div className="flex flex-row gap-2 sm:flex-col sm:justify-stretch">
          <Button
            onClick={onGenerate}
            disabled={loading || !query.trim()}
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

      {/* Temperature slider */}
      <div className="flex items-center gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Thermometer className="h-3.5 w-3.5" />
                Temperature
              </span>
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              Strict (0) trusts vectors — fewer, tighter matches. Creative (1)
              blends keyword diversity — broader, exploratory results.
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
          {tempLabel} · {temperature.toFixed(2)}
        </Badge>
      </div>

      {/* Example prompts */}
      {!compact && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Sparkles className="h-3 w-3" /> Try:
          </span>
          {EXAMPLE_PROMPTS.slice(0, 5).map((p) => (
            <button
              key={p}
              onClick={() => onQuery(p)}
              className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"
            >
              {p.length > 42 ? p.slice(0, 42) + "…" : p}
            </button>
          ))}
        </div>
      )}

      {lockedCount > 0 && !compact && (
        <div className="flex items-center gap-1.5 text-[11px] text-primary">
          <Lock className="h-3 w-3" />
          {lockedCount} block{lockedCount > 1 ? "s" : ""} locked — preserved across regeneration.
        </div>
      )}
    </div>
  );
}
