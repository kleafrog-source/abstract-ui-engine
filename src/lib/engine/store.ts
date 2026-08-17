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
  fetchSemanticConfigSchema,
  type DebugResponse,
  type GenerateParams,
  recommendSemanticConfig,
} from "./client";
import type {
  SemanticConfigRecommendation,
  SemanticConfigSchemaResponse,
  SemanticConfigValue,
} from "@/types/semantic-config";

export type EngineMode = "architect" | "genesis";
export type EngineViewMode = "architect" | "genesis" | "semantic-config" | "settings";

interface EngineState {
  mode: EngineViewMode;
  query: string;
  archetype: "auto" | "landing" | "dashboard" | "docs" | "catalog";
  mediaStrategy: "mobile-first" | "desktop-first";
  animationMode: "auto" | "none" | "simple" | "medium" | "complex";
  debugTips: boolean;
  temperature: number;
  locked: string[];
  loading: boolean;
  error: string | null;
  response: GenerateResponse | null;
  debug: DebugResponse | null;
  lastParams: GenerateParams | null;
  semanticConfigSchema: SemanticConfigSchemaResponse | null;
  semanticConfigValues: Record<string, SemanticConfigValue>;
  semanticConfigRecommendations: Record<string, SemanticConfigRecommendation>;
  semanticConfigLoading: boolean;
  semanticConfigRetrievalQuery: string;

  setMode: (m: EngineViewMode) => void;
  setQuery: (q: string) => void;
  setArchetype: (a: "auto" | "landing" | "dashboard" | "docs" | "catalog") => void;
  setMediaStrategy: (value: "mobile-first" | "desktop-first") => void;
  setAnimationMode: (value: "auto" | "none" | "simple" | "medium" | "complex") => void;
  setDebugTips: (value: boolean) => void;
  setTemperature: (t: number) => void;
  loadSemanticConfigSchema: () => Promise<void>;
  setSemanticConfigValue: (id: string, value: SemanticConfigValue) => void;
  resetSemanticConfigValues: () => void;
  recommendSemanticConfigValues: () => Promise<void>;
  toggleLock: (id: string) => void;
  setLocked: (ids: string[]) => void;
  clearLocked: () => void;
  run: (opts?: { query?: string; temperature?: number; semanticConfig?: Record<string, SemanticConfigValue> | null }) => Promise<void>;
  refreshDebug: () => Promise<void>;
  reset: () => void;
}

export const useEngine = create<EngineState>((set, get) => ({
  mode: "architect",
  query: "",
  archetype: "auto",
  mediaStrategy: "mobile-first",
  animationMode: "auto",
  debugTips: false,
  temperature: 0.4,
  locked: [],
  loading: false,
  error: null,
  response: null,
  debug: null,
  lastParams: null,
  semanticConfigSchema: null,
  semanticConfigValues: {},
  semanticConfigRecommendations: {},
  semanticConfigLoading: false,
  semanticConfigRetrievalQuery: "",

  setMode: (m) => set({ mode: m }),
  setQuery: (q) => set({ query: q }),
  setArchetype: (a) => set({ archetype: a }),
  setMediaStrategy: (value) => set({ mediaStrategy: value }),
  setAnimationMode: (value) => set({ animationMode: value }),
  setDebugTips: (value) => set({ debugTips: value }),
  setTemperature: (t) => set({ temperature: t }),
  loadSemanticConfigSchema: async () => {
    const current = get().semanticConfigSchema;
    if (current) return;
    const schema = await fetchSemanticConfigSchema();
    set({
      semanticConfigSchema: schema,
      semanticConfigValues: Object.keys(get().semanticConfigValues).length
        ? get().semanticConfigValues
        : schema.defaults,
    });
  },
  setSemanticConfigValue: (id, value) =>
    set((state) => ({
      semanticConfigValues: { ...state.semanticConfigValues, [id]: value },
    })),
  resetSemanticConfigValues: () =>
    set((state) => ({
      semanticConfigValues: state.semanticConfigSchema?.defaults ?? {},
      semanticConfigRecommendations: {},
      semanticConfigRetrievalQuery: "",
    })),
  recommendSemanticConfigValues: async () => {
    const state = get();
    const q = state.query.trim();
    if (!q) {
      set({ error: "Enter a prompt first." });
      return;
    }
    set({ semanticConfigLoading: true, error: null });
    try {
      const proposal = await recommendSemanticConfig({
        q,
        currentValues: state.semanticConfigValues,
      });
      set({
        semanticConfigSchema: proposal.schema,
        semanticConfigValues: proposal.values,
        semanticConfigRecommendations: proposal.recommendations,
        semanticConfigRetrievalQuery: proposal.retrievalQuery,
        semanticConfigLoading: false,
      });
    } catch (e) {
      set({ semanticConfigLoading: false, error: (e as Error).message });
    }
  },
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
      archetype: state.archetype,
      mediaStrategy: state.mediaStrategy,
      animationMode: state.animationMode,
      debugTips: state.debugTips,
      temperature,
      topK: 24,
      locked: state.locked,
      semanticConfig: opts?.semanticConfig ?? undefined,
    };

    try {
      const response = await generatePage(params);
      set({ response, lastParams: params, loading: false });
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
      archetype: "auto",
      mediaStrategy: "mobile-first",
      animationMode: "auto",
      debugTips: false,
      response: null,
      debug: null,
      error: null,
      locked: [],
      lastParams: null,
      semanticConfigRecommendations: {},
      semanticConfigRetrievalQuery: "",
    }),
}));

export type { DebugInfo, QualityMetrics };
