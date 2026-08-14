"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Lock,
  Unlock,
  Box,
  Type,
  Palette,
  MousePointerClick,
  Wrench,
  LayoutGrid,
} from "lucide-react";
import type { LexiconCategory, SearchHit } from "@/lib/engine/types";

const CAT_META: Record<
  LexiconCategory,
  { icon: React.ReactNode; label: string; color: string }
> = {
  layouts: { icon: <LayoutGrid className="h-3.5 w-3.5" />, label: "Layouts", color: "text-sky-500" },
  components: { icon: <Box className="h-3.5 w-3.5" />, label: "Components", color: "text-violet-500" },
  styles: { icon: <Palette className="h-3.5 w-3.5" />, label: "Styles", color: "text-rose-500" },
  typography: { icon: <Type className="h-3.5 w-3.5" />, label: "Typography", color: "text-amber-500" },
  interactions: { icon: <MousePointerClick className="h-3.5 w-3.5" />, label: "Interactions", color: "text-emerald-500" },
  utilities: { icon: <Wrench className="h-3.5 w-3.5" />, label: "Utilities", color: "text-cyan-500" },
};

const ORDER: LexiconCategory[] = [
  "layouts",
  "typography",
  "styles",
  "components",
  "interactions",
  "utilities",
];

function confBadge(c: SearchHit["confidence"]) {
  if (c === "high") return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20">high</Badge>;
  if (c === "medium") return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20">medium</Badge>;
  return <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20">low</Badge>;
}

export function LexiconResults({
  hits,
  locked,
  onToggleLock,
  loading,
}: {
  hits: SearchHit[];
  locked: string[];
  onToggleLock: (id: string) => void;
  loading?: boolean;
}) {
  const grouped = React.useMemo(() => {
    const m = new Map<LexiconCategory, SearchHit[]>();
    for (const h of hits) {
      if (!m.has(h.entry.category)) m.set(h.entry.category, []);
      m.get(h.entry.category)!.push(h);
    }
    return m;
  }, [hits]);

  if (loading && hits.length === 0) {
    return (
      <div className="space-y-2 p-4 text-sm text-muted-foreground">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (hits.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        No matches yet. Enter a prompt and hit <span className="font-medium">Generate</span>.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-220px)] min-h-[280px]">
      <div className="space-y-4 p-1">
        {ORDER.map((cat) => {
          const list = grouped.get(cat);
          if (!list || list.length === 0) return null;
          const meta = CAT_META[cat];
          return (
            <div key={cat} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={meta.color}>{meta.icon}</span>
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {meta.label}
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {list.length}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-1.5">
                {list.map((h) => {
                  const isLocked = locked.includes(h.entry.id);
                  return (
                    <div
                      key={h.entry.id}
                      className={`group rounded-md border p-2 transition-colors ${
                        isLocked
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/60 hover:border-border hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-xs font-medium">
                              {h.entry.name}
                            </span>
                            {confBadge(h.confidence)}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                            {h.entry.semantic_description}
                          </p>
                          {h.matchedTokens.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {h.matchedTokens.slice(0, 6).map((t) => (
                                <span
                                  key={t}
                                  className="rounded bg-primary/10 px-1 py-0.5 font-mono text-[9px] text-primary"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="font-mono">{h.entry.id}</span>
                            <span>·</span>
                            <span className="font-mono tabular-nums">
                              score {h.score.toFixed(3)}
                            </span>
                            {h.entry.family && (
                              <>
                                <span>·</span>
                                <span className="italic">{h.entry.family}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => onToggleLock(h.entry.id)}
                                className={`shrink-0 rounded p-1 transition-colors ${
                                  isLocked
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                                aria-label={isLocked ? "Unlock block" : "Lock block"}
                              >
                                {isLocked ? (
                                  <Lock className="h-3.5 w-3.5" />
                                ) : (
                                  <Unlock className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isLocked ? "Locked — preserved on regenerate" : "Lock this block"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
