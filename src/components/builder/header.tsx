"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Database,
  Cpu,
  RefreshCw,
  Layers3,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { AddEntryDialog } from "./add-entry-dialog";
import {
  fetchStats,
  reloadLexicon,
  type LexiconStatsResponse,
} from "@/lib/engine/client";
import { useEngine } from "@/lib/engine/store";
import { toast } from "sonner";

export function Header() {
  const [stats, setStats] = React.useState<LexiconStatsResponse | null>(null);
  const [reloading, setReloading] = React.useState(false);
  const mode = useEngine((s) => s.mode);
  const setMode = useEngine((s) => s.setMode);

  const load = React.useCallback(async () => {
    try {
      setStats(await fetchStats());
    } catch {
      /* ignore initial */
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleReload = async () => {
    setReloading(true);
    try {
      const res = await reloadLexicon(false);
      toast.success(
        `Lexicon reloaded: ${res.total} entries · cache ${res.cacheStatus}`,
      );
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setReloading(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-2.5">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-sm">
            <Layers3 className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              Semantic UI Genesis Engine
              <Sparkles className="h-3 w-3 text-amber-500" />
            </div>
            <div className="hidden text-[10px] text-muted-foreground sm:block">
              Natural language → adaptive web interfaces
            </div>
          </div>
        </div>

        {/* Stats badges */}
        <div className="ml-1 hidden items-center gap-1.5 md:flex">
          {stats && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <Database className="h-3 w-3" />
                      {stats.total.toLocaleString()} entries
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    {Object.entries(stats.byCategory).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-3">
                        <span>{k}</span>
                        <span className="font-mono">{v}</span>
                      </div>
                    ))}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="gap-1 border-emerald-500/40 text-[10px] text-emerald-600 dark:text-emerald-400"
                    >
                      <Cpu className="h-3 w-3" />
                      {stats.config.provider}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    Embedding provider · {stats.config.dim}-dim
                    {stats.config.provider === "bge-m3-ollama" &&
                      ` · ${stats.config.model}@${stats.config.ollama}`}
                    <br />
                    Cache: {stats.cache.exists ? `${stats.cache.count} vectors` : "not built"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {stats.cache.exists && stats.cache.generatedAt && (
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  cache: {new Date(stats.cache.generatedAt).toLocaleTimeString()}
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1.5">
          <AddEntryDialog onAdded={load} />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleReload}
                  disabled={reloading}
                  aria-label="Hot-reload lexicon"
                >
                  <RefreshCw className={`h-4 w-4 ${reloading ? "animate-spin" : ""}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Hot-reload lexicon JSON (no restart)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <ThemeToggle />

          <Tabs value={mode} onValueChange={(v) => setMode(v as "architect" | "genesis" | "semantic-config" | "settings")}>
            <TabsList className="h-8">
              <TabsTrigger value="architect" className="text-xs">
                Architect
              </TabsTrigger>
              <TabsTrigger value="genesis" className="text-xs">
                Genesis
              </TabsTrigger>
              <TabsTrigger value="semantic-config" className="text-xs">
                Config
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">
                Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </header>
  );
}
