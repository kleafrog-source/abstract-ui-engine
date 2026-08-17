"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Bug, ChevronDown, Cpu, Database, Search, Download } from "lucide-react";
import { type DebugResponse } from "@/lib/engine/client";
import type { GenerateResponse } from "@/lib/engine/types";

export function DebugPanel({
  debug,
  response,
}: {
  debug: DebugResponse | null;
  response: GenerateResponse | null;
}) {
  const [open, setOpen] = React.useState(false);

  const handleDownloadDebug = React.useCallback(() => {
    if (!response) {
      return;
    }
    const payload = {
      generatedAt: new Date().toISOString(),
      response,
      debug,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `abstract-ui-debug-${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, [debug, response]);

  if (!debug) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bug className="h-4 w-4 text-primary" />
                Debug Panel
                <Badge variant="secondary" className="text-[10px]">
                  {debug.debug.queryTokens.length} tokens
                </Badge>
              </CardTitle>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-3 pt-0 text-xs">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Meta icon={<Cpu className="h-3 w-3" />} label="Provider" value={debug.config.provider} />
              <Meta icon={<Database className="h-3 w-3" />} label="Cache" value={debug.debug.cacheStatus} />
              <Meta icon={<Database className="h-3 w-3" />} label="Vectors" value={debug.cache.exists ? String(debug.cache.count) : "-"} />
              {response && <Meta icon={<Bug className="h-3 w-3" />} label="Archetype" value={response.archetype} />}
              {response && <Meta icon={<Bug className="h-3 w-3" />} label="Locale" value={response.locale} />}
              {response && <Meta icon={<Bug className="h-3 w-3" />} label="Motion" value={response.designDirectives.motionLevel} />}
            </div>

            {response && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadDebug}
                  className="h-8 text-[11px]"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Download Debug JSON
                </Button>
              </div>
            )}

            {response?.debugArtifacts && (
              <div className="rounded-md border border-dashed p-2 text-[10px] text-muted-foreground">
                <div className="font-medium text-foreground">Saved Debug Artifacts</div>
                <div className="mt-1">summary: {response.debugArtifacts.summary}</div>
                <div className="mt-1">full: {response.debugArtifacts.full}</div>
              </div>
            )}

            <div>
              <div className="mb-1 flex items-center gap-1 font-medium">
                <Search className="h-3 w-3" /> Query token to matched entries
              </div>
              {debug.debug.tokenMatches.length === 0 ? (
                <p className="text-muted-foreground">No token matches.</p>
              ) : (
                <div className="space-y-1">
                  {debug.debug.tokenMatches.map((tm) => (
                    <div key={tm.token} className="flex items-start gap-2">
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                        {tm.token}
                      </span>
                      <span className="text-muted-foreground">-&gt;</span>
                      <div className="flex flex-wrap gap-1">
                        {tm.hitIds.length === 0 ? (
                          <span className="text-muted-foreground italic">no global match</span>
                        ) : (
                          tm.hitIds.map((id) => (
                            <span
                              key={id}
                              className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]"
                            >
                              {id}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-1 font-medium">Lexicon coverage</div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(debug.debug.lexiconStats).map(([cat, n]) => (
                  <Badge key={cat} variant="outline" className="text-[10px]">
                    {cat}: {n}
                  </Badge>
                ))}
              </div>
            </div>

            {response && (
              <>
                <div>
                  <div className="mb-1 font-medium">Design Directives</div>
                  <div className="grid grid-cols-2 gap-2">
                    <MiniStat label="random field" value={response.designDirectives.randomFieldArea ? 1 : 0} />
                    <MiniStat label="chaos" valueText={response.designDirectives.chaosLevel} />
                    <MiniStat label="motion" valueText={response.designDirectives.motionLevel} />
                    <MiniStat label="surfaces" valueText={response.designDirectives.surfaceEffects.join(", ") || "-"} />
                  </div>
                  {response.designDirectives.matchedChaosTerms.length > 0 && (
                    <div className="mt-2 rounded bg-muted/30 px-2 py-1 text-[10px]">
                      source terms: {response.designDirectives.matchedChaosTerms.join(", ")}
                    </div>
                  )}
                </div>

                <div>
                  <div className="mb-1 font-medium">Completeness</div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <MiniStat label="slots" valueText={`${response.completeness.retrievedSlots}/${response.completeness.totalSlots}`} />
                    <MiniStat label="major" valueText={`${response.completeness.majorRetrievedSlots}/${response.completeness.majorSlots}`} />
                    <MiniStat label="fused" value={response.completeness.fusedSlots} />
                    <MiniStat label="fallback" value={response.completeness.fallbackSlots} />
                  </div>
                  {response.completeness.warnings.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {response.completeness.warnings.map((warning) => (
                        <div
                          key={warning}
                          className="rounded bg-amber-500/10 px-2 py-1 text-[10px] text-amber-700 dark:text-amber-300"
                        >
                          {warning}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="mb-1 font-medium">Assembly Plan</div>
                  <div className="space-y-1">
                    {response.plan.map((step) => (
                      <div key={step.slot} className="rounded-md bg-muted/30 px-2 py-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{step.slot}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {step.source}
                          </Badge>
                        </div>
                        <div className="mt-1 text-[10px] text-muted-foreground">
                          component: {step.componentId ?? "fallback"} | semantic: {step.semanticTag}
                        </div>
                        <div className="mt-1 text-[10px] text-muted-foreground">
                          constraints: {JSON.stringify(step.constraints)} | source tokens: {step.sourceTokens.join(", ") || "-"}
                        </div>
                        <div className="mt-1 text-[10px] text-muted-foreground">
                          bundle: base={formatBundleHit(step.bundle.base)} | layouts={formatBundleHits(step.bundle.layouts)} | sections={formatBundleHits(step.bundle.sections)} | support={formatBundleHits(step.bundle.support)} | styles={formatBundleHits(step.bundle.styles)} | interactions={formatBundleHits(step.bundle.interactions)}
                        </div>
                        {(step.bundle.retrievalQuery || step.bundle.styleQuery || step.bundle.interactionQuery) && (
                          <div className="mt-1 rounded bg-background/70 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                            q: {step.bundle.retrievalQuery || "-"} | style: {step.bundle.styleQuery || "-"} | interaction: {step.bundle.interactionQuery || "-"}
                          </div>
                        )}
                        {(step.bundle.supportTarget || step.bundle.expectedFamilies.length > 0) && (
                          <div className="mt-1 text-[10px] text-muted-foreground">
                            target: {step.bundle.supportTarget || "-"} | families: {step.bundle.expectedFamilies.join(", ") || "-"}
                          </div>
                        )}
                        {step.rejectedCandidates.length > 0 && (
                          <div className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">
                            rejected: {step.rejectedCandidates.map((item) => `${item.id}(${item.reason}${"detail" in item && item.detail ? `: ${item.detail}` : ""})`).join(", ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {response.warnings.length > 0 && (
                  <div>
                    <div className="mb-1 font-medium">Warnings</div>
                    <div className="space-y-1">
                      {response.warnings.map((warning) => (
                        <div key={warning} className="rounded bg-amber-500/10 px-2 py-1 text-[10px] text-amber-700 dark:text-amber-300">
                          {warning}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function MiniStat({
  label,
  value,
  valueText,
}: {
  label: string;
  value?: number;
  valueText?: string;
}) {
  return (
    <div className="rounded bg-muted/30 px-2 py-1">
      {label}: <span className="font-mono">{valueText ?? value ?? "-"}</span>
    </div>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-muted/40 p-2">
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 truncate font-mono text-xs">{value}</div>
    </div>
  );
}

function formatBundleHit(
  hit:
    | {
        id?: string;
        family?: string;
        level?: string;
        score?: number;
      }
    | null
    | undefined,
) {
  if (!hit?.id) {
    return "-";
  }
  const parts = [hit.id];
  if (hit.level) {
    parts.push(hit.level);
  }
  if (typeof hit.score === "number") {
    parts.push(hit.score.toFixed(3));
  }
  if (hit.family) {
    parts.push(hit.family);
  }
  return parts.join(" | ");
}

function formatBundleHits(
  hits: Array<{
    id?: string;
    family?: string;
    level?: string;
    score?: number;
  }>,
) {
  if (hits.length === 0) {
    return "-";
  }
  return hits.map((hit) => formatBundleHit(hit)).join("; ");
}
