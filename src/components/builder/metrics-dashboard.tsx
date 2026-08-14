"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Activity,
  Accessibility,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import type { QualityMetrics } from "@/lib/engine/types";

function scoreColor(v: number): string {
  if (v >= 75) return "text-emerald-500";
  if (v >= 50) return "text-amber-500";
  return "text-rose-500";
}
function barClass(v: number): string {
  if (v >= 75) return "[&>div]:bg-emerald-500";
  if (v >= 50) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-rose-500";
}

export function MetricsDashboard({
  metrics,
  loading,
}: {
  metrics: QualityMetrics | null;
  loading?: boolean;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-primary" />
          Quality Metrics Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!metrics ? (
          <div className="text-xs text-muted-foreground">
            {loading ? "Computing metrics…" : "Generate a page to see metrics."}
          </div>
        ) : (
          <>
            <Metric
              icon={<Layers className="h-4 w-4" />}
              label="Semantic Coherence"
              value={metrics.semanticCoherence}
              hint="How close the selected elements' vectors are to each other (style unity)."
            />
            <Metric
              icon={<Accessibility className="h-4 w-4" />}
              label="Accessibility Score"
              value={metrics.accessibilityScore}
              hint={`Contrast + ARIA + focus coverage. ariaCoverage ${metrics.ariaCoverage}%.`}
            />
            <Metric
              icon={<Activity className="h-4 w-4" />}
              label="Complexity Index"
              value={metrics.complexityIndex}
              hint={`~${metrics.domNodeEstimate} DOM nodes, ${metrics.mediaQueries} media queries. Higher = denser page.`}
            />

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <Stat label="Pairwise cosine" value={metrics.detail.pairwiseCosine.toFixed(3)} />
              <Stat label="Locked blocks" value={String(metrics.detail.lockedCount)} />
              <Stat label="Components" value={String(metrics.detail.componentCount)} />
              <Stat label="Styles" value={String(metrics.detail.styleCount)} />
              <Stat label="Utilities" value={String(metrics.detail.utilityCount)} />
              <Stat label="Media queries" value={String(metrics.mediaQueries)} />
            </div>

            {metrics.contrastWarnings.length > 0 ? (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2 text-xs">
                <div className="mb-1 flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" /> Contrast warnings
                </div>
                <ul className="list-disc space-y-0.5 pl-4 text-muted-foreground">
                  {metrics.contrastWarnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> No contrast warnings detected.
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex cursor-help items-center gap-1.5 text-xs font-medium">
                {icon}
                {label}
                <Info className="h-3 w-3 text-muted-foreground" />
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[240px] text-xs">
              {hint}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Badge variant="outline" className={`tabular-nums ${scoreColor(value)}`}>
          {value}
          <span className="text-muted-foreground">/100</span>
        </Badge>
      </div>
      <Progress value={value} className={`h-1.5 ${barClass(value)}`} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium tabular-nums">{value}</span>
    </div>
  );
}
