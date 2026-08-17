"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GitBranch, Loader2, Download } from "lucide-react";
import { useEngine } from "@/lib/engine/store";
import { QueryBar } from "./query-bar";
import { LexiconResults } from "./lexicon-results";
import { BuildTree } from "./build-tree";
import { MetricsDashboard } from "./metrics-dashboard";
import { MMSSPanel } from "./MMSSPanel";
import { DebugPanel } from "./debug-panel";
import { PreviewFrame } from "./preview-frame";
import { downloadStandalone } from "@/lib/engine/client";
import { toast } from "sonner";

export function ArchitectMode() {
  const {
    query,
    setQuery,
    archetype,
    setArchetype,
    mediaStrategy,
    setMediaStrategy,
    animationMode,
    setAnimationMode,
    debugTips,
    setDebugTips,
    temperature,
    setTemperature,
    run,
    loading,
    error,
    response,
    debug,
    locked,
    toggleLock,
    clearLocked,
    lastParams,
  } = useEngine();

  const [exporting, setExporting] = React.useState(false);
  const hits = response?.result.hits ?? [];
  const standalone = response?.assembly.standalone ?? "";
  const tree = response?.assembly.tree ?? null;
  const metrics = response?.metrics ?? null;
  const mmss = response?.mmss ?? null;

  const handleSaveHtml = async () => {
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
    <div className="grid grid-cols-1 gap-3 p-3 lg:grid-cols-12 xl:grid-cols-12">
      <div className="space-y-3 lg:col-span-4 xl:col-span-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Prompt & Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <QueryBar
              query={query}
              onQuery={setQuery}
              archetype={archetype}
              onArchetype={setArchetype}
              mediaStrategy={mediaStrategy}
              onMediaStrategy={setMediaStrategy}
              animationMode={animationMode}
              onAnimationMode={setAnimationMode}
              debugTips={debugTips}
              onDebugTips={setDebugTips}
              temperature={temperature}
              onTemperature={setTemperature}
              onGenerate={() => run()}
              loading={loading}
              lockedCount={locked.length}
              onClearLocks={clearLocked}
            />
            {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Lexicon Matches</CardTitle>
              {hits.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {hits.length} hits | {(response?.result.tookMs ?? 0)}ms
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <LexiconResults
              hits={hits}
              locked={locked}
              onToggleLock={toggleLock}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3 lg:col-span-5 xl:col-span-6">
        <div className="h-[calc(100vh-150px)] min-h-[420px]">
          <PreviewFrame html={standalone} loading={loading} />
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <GitBranch className="h-4 w-4 text-primary" />
              Build Tree
              {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <BuildTree node={tree} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3 lg:col-span-3 xl:col-span-3">
        <MetricsDashboard metrics={metrics} loading={loading} />
        <MMSSPanel metrics={mmss} loading={loading} />
        <DebugPanel debug={debug} response={response} />
        {response && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-[11px]">
              <Row label="Layout" value={response.assembly.selection.layout?.entry.name} />
              <Row label="Typography" value={response.assembly.selection.typography[0]?.entry.name} />
              <Row label="Styles" value={`${response.assembly.selection.styles.length}`} />
              <Row label="Components" value={`${response.assembly.selection.components.length}`} />
              <Row label="Interactions" value={`${response.assembly.selection.interactions.length}`} />
              <Row label="Utilities" value={`${response.assembly.selection.utilities.length}`} />
              <Separator className="my-1" />
              <Row label="Standalone size" value={`${(response.assembly.standalone.length / 1024).toFixed(1)} KB`} />
              <Row label="Media strategy" value={response.mediaStrategy} />
              <Row label="Motion" value={response.designDirectives.motionLevel} />
              <Button onClick={handleSaveHtml} disabled={exporting || !standalone} className="w-full" size="sm">
                {exporting ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                )}
                Save HTML
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium">{value ?? "-"}</span>
    </div>
  );
}
