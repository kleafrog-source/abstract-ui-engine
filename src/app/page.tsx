"use client";

import * as React from "react";
import { Header } from "@/components/builder/header";
import { ArchitectMode } from "@/components/builder/architect-mode";
import { GenesisMode } from "@/components/builder/genesis-mode";
import { useEngine } from "@/lib/engine/store";
import { Github, Sparkles } from "lucide-react";

export default function Home() {
  const mode = useEngine((s) => s.mode);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {mode === "architect" ? <ArchitectMode /> : <GenesisMode />}
      </main>
      <footer className="mt-auto border-t bg-background/80 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2 px-4 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>
              <strong className="text-foreground">Semantic UI Genesis Engine</strong> ·
              modular lexicon + cosine NN search · BGE-M3 compatible
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>
              Backend cache + embeddings live in{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono">backend/</code>
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <Github className="h-3 w-3" /> project
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
