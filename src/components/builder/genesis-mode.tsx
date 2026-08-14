"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Zap, Download, Loader2, FileCode2, Lock, LockOpen } from "lucide-react";
import { useEngine } from "@/lib/engine/store";
import { QueryBar } from "./query-bar";
import { PreviewFrame } from "./preview-frame";
import { MetricsDashboard } from "./metrics-dashboard";
import { downloadStandalone } from "@/lib/engine/client";
import { toast } from "sonner";

export function GenesisMode() {
  const {
    query,
    setQuery,
    temperature,
    setTemperature,
    run,
    loading,
    error,
    response,
    locked,
    clearLocked,
    lastParams,
  } = useEngine();

  const [exporting, setExporting] = React.useState(false);
  const standalone = response?.assembly.standalone ?? "";
  const metrics = response?.metrics ?? null;

  const handleExport = async () => {
    if (!lastParams) {
      toast.error("Generate a page first.");
      return;
    }
    setExporting(true);
    try {
      await downloadStandalone(lastParams);
      toast.success("Standalone HTML downloaded.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Compact query bar */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="hidden text-xs font-medium text-muted-foreground sm:block">
              Genesis:
            </span>
            <QueryBar
              query={query}
              onQuery={setQuery}
              temperature={temperature}
              onTemperature={setTemperature}
              onGenerate={() => run()}
              loading={loading}
              lockedCount={locked.length}
              onClearLocks={clearLocked}
              compact
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleExport}
                    disabled={exporting || !standalone}
                    className="shrink-0"
                  >
                    {exporting ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    <span className="hidden sm:inline">Export</span>
                    <span className="sm:hidden">.html</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Export Standalone — self-contained .html (inline CSS + vanilla JS, no external deps)
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
        </CardContent>
      </Card>

      {/* Preview + metrics side by side on desktop */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="xl:col-span-9">
          <div className="h-[calc(100vh-260px)] min-h-[420px]">
            <PreviewFrame
              html={standalone}
              loading={loading}
              title="Instant Render"
            />
          </div>
        </div>
        <div className="space-y-3 xl:col-span-3">
          <MetricsDashboard metrics={metrics} loading={loading} />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileCode2 className="h-4 w-4 text-primary" />
                Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p className="text-muted-foreground">
                Generate a single self-contained <code>.html</code> file with all
                HTML, inline CSS and vanilla JS. No external dependencies.
              </p>
              <Separator />
              <div className="space-y-1">
                <Row label="Provider" value={response?.result.provider ?? "—"} />
                <Row label="Hits" value={response ? String(response.result.hits.length) : "—"} />
                <Row label="Standalone" value={standalone ? `${(standalone.length / 1024).toFixed(1)} KB` : "—"} />
                <Row label="Search time" value={response ? `${response.result.tookMs}ms` : "—"} />
              </div>
              <Button
                onClick={handleExport}
                disabled={exporting || !standalone}
                className="w-full"
                size="sm"
              >
                {exporting ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                )}
                Export Standalone HTML
              </Button>
              {locked.length > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-primary">
                  <Lock className="h-3 w-3" />
                  {locked.length} locked block{locked.length > 1 ? "s" : ""}
                  <button
                    onClick={clearLocked}
                    className="ml-auto inline-flex items-center gap-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <LockOpen className="h-3 w-3" /> clear
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Metrics strip on mobile */}
      <div className="xl:hidden">
        <div className="grid grid-cols-3 gap-2">
          <MiniMetric label="Coherence" value={metrics?.semanticCoherence} />
          <MiniMetric label="Accessibility" value={metrics?.accessibilityScore} />
          <MiniMetric label="Complexity" value={metrics?.complexityIndex} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-mono text-right">{value}</span>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-md border bg-card p-2 text-center">
      <div className="text-lg font-semibold tabular-nums">{value ?? "—"}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
