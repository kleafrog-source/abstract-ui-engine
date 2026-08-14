"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Bug, ChevronDown, Cpu, Database, Search } from "lucide-react";
import type { DebugResponse } from "@/lib/engine/client";

export function DebugPanel({ debug }: { debug: DebugResponse | null }) {
  const [open, setOpen] = React.useState(false);
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
            {/* Provider + cache */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Meta icon={<Cpu className="h-3 w-3" />} label="Provider" value={debug.config.provider} />
              <Meta icon={<Database className="h-3 w-3" />} label="Cache" value={debug.debug.cacheStatus} />
              <Meta
                icon={<Database className="h-3 w-3" />}
                label="Vectors"
                value={debug.cache.exists ? String(debug.cache.count) : "—"}
              />
            </div>

            {/* Token matches */}
            <div>
              <div className="mb-1 flex items-center gap-1 font-medium">
                <Search className="h-3 w-3" /> Query token → matched entries
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
                      <span className="text-muted-foreground">→</span>
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

            {/* Lexicon stats */}
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
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
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
