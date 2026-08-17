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
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Info, Sigma } from "lucide-react";
import type { MMSSMetrics } from "@/types/mmss";

const METRIC_META = [
  {
    key: "V",
    label: "Volume",
    description: "V = (N_content + 0.5 * N_structure) / N_total",
    invert: false,
  },
  {
    key: "S",
    label: "Stability",
    description: "S = 1 - (0.6 * sigma_depth / mu_depth + 0.4 * empty_wrappers / structure)",
    invert: false,
  },
  {
    key: "N",
    label: "Noise",
    description: "Noise: ratio of unique classes and suspicious attributes. Higher is worse.",
    invert: true,
  },
  {
    key: "Df",
    label: "Fractal Dimension",
    description: "Df = log(N_levels) / log(N_nodes)",
    invert: false,
  },
  {
    key: "QEC",
    label: "QEC",
    description: "QEC = 0.2*V + 0.35*S + 0.35*(1-N) + 0.1*Df",
    invert: false,
  },
] as const;

function barClass(value: number, invert = false): string {
  if (invert) {
    if (value >= 0.65) return "[&>div]:bg-rose-500";
    if (value >= 0.35) return "[&>div]:bg-amber-500";
    return "[&>div]:bg-emerald-500";
  }

  if (value >= 0.75) return "[&>div]:bg-emerald-500";
  if (value >= 0.45) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-rose-500";
}

function badgeClass(value: number, invert = false): string {
  if (invert) {
    if (value >= 0.65) return "text-rose-500";
    if (value >= 0.35) return "text-amber-500";
    return "text-emerald-500";
  }

  if (value >= 0.75) return "text-emerald-500";
  if (value >= 0.45) return "text-amber-500";
  return "text-rose-500";
}

export function MMSSPanel({
  metrics,
  loading,
}: {
  metrics: MMSSMetrics | null;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sigma className="h-4 w-4 text-primary" />
          MMSS Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!metrics ? (
          loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Generate a page to compute MMSS metrics.
            </p>
          )
        ) : (
          <>
            {METRIC_META.map((item) => {
              const value = metrics[item.key];
              return (
                <div key={item.key} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex cursor-help items-center gap-1.5 text-xs font-medium">
                            <Activity className="h-3.5 w-3.5" />
                            {item.label}
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[260px] text-xs">
                          {item.description}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Badge variant="outline" className={`tabular-nums ${badgeClass(value, item.invert)}`}>
                      {value.toFixed(3)}
                    </Badge>
                  </div>
                  <Progress value={value * 100} className={`h-1.5 ${barClass(value, item.invert)}`} />
                </div>
              );
            })}

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <Stat label="Nodes" value={metrics.details.N_nodes} />
              <Stat label="Levels" value={metrics.details.N_levels} />
              <Stat label="Content" value={metrics.details.N_content} />
              <Stat label="Structure" value={metrics.details.N_structure} />
              <Stat label="Signal classes" value={metrics.details.C_unique} />
              <Stat label="Noisy classes" value={metrics.details.C_noisy} />
            </div>

            <div className="space-y-2 rounded-lg border border-dashed p-3">
              <div className="text-xs font-medium">MMSS Debug</div>
              <div className="grid grid-cols-1 gap-2 text-[11px]">
                <DebugRow
                  label="Volume inputs"
                  value={`(${metrics.details.N_content} + 0.5 * ${metrics.details.N_structure}) / ${metrics.details.N_total || 1}`}
                  note={`= ${metrics.V.toFixed(4)}`}
                />
                <DebugRow
                  label="Depth variance"
                  value={`${metrics.details.sigma_depth.toFixed(4)} / ${Math.max(metrics.details.mu_depth, 1).toFixed(4)}`}
                  note={`mu=${metrics.details.mu_depth.toFixed(4)}, sigma=${metrics.details.sigma_depth.toFixed(4)}`}
                />
                <DebugRow
                  label="Empty wrappers"
                  value={`${metrics.details.N_empty_wrappers} / ${Math.max(metrics.details.N_structure, 1)}`}
                  note={`structure=${metrics.details.N_structure}`}
                />
                <DebugRow
                  label="Class signal"
                  value={`${metrics.details.C_unique} / ${Math.max(metrics.details.C_total, 1)}`}
                  note={`signal=${metrics.details.C_unique}, raw unique=${metrics.details.C_raw_unique}, class tokens=${metrics.details.C_total}`}
                />
                <DebugRow
                  label="Suspicious attrs"
                  value={`${metrics.details.A_suspicious} / ${Math.max(metrics.details.A_total, 1)}`}
                  note={`noise attrs=${metrics.details.A_total}`}
                />
                <DebugRow
                  label="Fractal inputs"
                  value={`log(${metrics.details.N_levels}) / log(${metrics.details.N_nodes})`}
                  note={`Df=${metrics.Df.toFixed(4)}`}
                />
                <DebugRow
                  label="QEC composition"
                  value={`0.2*${metrics.V.toFixed(4)} + 0.35*${metrics.S.toFixed(4)} + 0.35*${(1 - metrics.N).toFixed(4)} + 0.1*${metrics.Df.toFixed(4)}`}
                  note={`= ${metrics.QEC.toFixed(4)}`}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  );
}

function DebugRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-md bg-muted/30 px-2 py-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums">{value}</span>
      </div>
      <div className="mt-0.5 text-[10px] text-muted-foreground">{note}</div>
    </div>
  );
}
