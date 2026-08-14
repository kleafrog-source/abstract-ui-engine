"use client";

import { create } from "zustand";
import type {
  DebugInfo,
  GenerateResponse,
  QualityMetrics,
} from "./types";
import {
  generatePage,
  fetchDebug,
  type DebugResponse,
  type GenerateParams,
} from "./client";

export type EngineMode = "architect" | "genesis";
export type EngineViewMode = "architect" | "genesis" | "settings";

interface EngineState {
  mode: EngineViewMode;
  query: string;
  temperature: number; // 0 strict .. 1 creative
  locked: string[];
  loading: boolean;
  error: string | null;
  response: GenerateResponse | null;
  debug: DebugResponse | null;
  lastParams: GenerateParams | null;

  setMode: (m: EngineViewMode) => void;
  setQuery: (q: string) => void;
  setTemperature: (t: number) => void;
  toggleLock: (id: string) => void;
  setLocked: (ids: string[]) => void;
  clearLocked: () => void;
  run: (opts?: { query?: string; temperature?: number }) => Promise<void>;
  refreshDebug: () => Promise<void>;
  reset: () => void;
}

export const useEngine = create<EngineState>((set, get) => ({
  mode: "architect",
  query: "",
  temperature: 0.4,
  locked: [],
  loading: false,
  error: null,
  response: null,
  debug: null,
  lastParams: null,

  setMode: (m) => set({ mode: m }),
  setQuery: (q) => set({ query: q }),
  setTemperature: (t) => set({ temperature: t }),
  toggleLock: (id) =>
    set((s) => ({
      locked: s.locked.includes(id)
        ? s.locked.filter((x) => x !== id)
        : [...s.locked, id],
    })),
  setLocked: (ids) => set({ locked: ids }),
  clearLocked: () => set({ locked: [] }),

  run: async (opts) => {
    const state = get();
    const q = (opts?.query ?? state.query).trim();
    const temperature = opts?.temperature ?? state.temperature;
    if (!q) {
      set({ error: "Enter a prompt first." });
      return;
    }
    set({ loading: true, error: null, query: q, temperature });
    const params: GenerateParams = {
      q,
      temperature,
      topK: 10,
      locked: state.locked,
    };
    try {
      const response = await generatePage(params);
      set({ response, lastParams: params, loading: false });
      // Fetch debug in parallel-ish (non-blocking).
      void get().refreshDebug();
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },

  refreshDebug: async () => {
    const { lastParams } = get();
    if (!lastParams) return;
    try {
      const debug = await fetchDebug(lastParams);
      set({ debug });
    } catch {
      /* non-critical */
    }
  },

  reset: () =>
    set({
      query: "",
      response: null,
      debug: null,
      error: null,
      locked: [],
      lastParams: null,
    }),
}));

export type { DebugInfo, QualityMetrics };
