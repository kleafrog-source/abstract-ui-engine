"use client";

import type {
  DebugInfo,
  GenerateResponse,
  QualityMetrics,
  SearchResult,
  AssembledPage,
  LexiconCategory,
} from "./types";

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${msg}`);
  }
  return (await res.json()) as T;
}

export interface LexiconStatsResponse {
  total: number;
  byCategory: Record<string, number>;
  loadedAt: number;
  cache: {
    exists: boolean;
    path: string;
    size: number;
    generatedAt: string | null;
    count: number;
  };
  config: {
    provider: string;
    dim: number;
    ollama: string;
    model: string;
    cache: string;
  };
}

export async function fetchStats(): Promise<LexiconStatsResponse> {
  return json<LexiconStatsResponse>(apiUrl("/lexicon/stats"));
}

export interface GenerateParams {
  q: string;
  temperature?: number;
  topK?: number;
  locked?: string[];
  preferFamily?: string;
}

export async function generatePage(
  params: GenerateParams,
): Promise<GenerateResponse> {
  return json<GenerateResponse>(apiUrl("/engine/generate"), {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function searchLexicon(
  params: GenerateParams & { category?: LexiconCategory },
): Promise<SearchResult> {
  return json<SearchResult>(apiUrl("/engine/search"), {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function fetchMetrics(
  params: GenerateParams,
): Promise<{ metrics: QualityMetrics; selection: AssembledPage["selection"] }> {
  return json(apiUrl("/engine/metrics"), {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function exportStandalone(
  params: GenerateParams,
): Promise<{ standalone: string }> {
  return json(apiUrl("/engine/export"), {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function downloadStandaloneUrl() {
  return apiUrl("/engine/export");
}

export async function downloadStandalone(params: GenerateParams) {
  const res = await fetch(apiUrl("/engine/export"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...params, download: true }),
  });
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `genesis-${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export interface DebugResponse {
  debug: DebugInfo;
  config: { provider: string; dim: number; ollama: string; model: string; cache: string };
  cache: { exists: boolean; count: number; generatedAt: string | null; size: number };
  hits: Array<{
    id: string;
    name: string;
    score: number;
    confidence: string;
    matchedTokens: string[];
  }>;
}

export async function fetchDebug(params: GenerateParams): Promise<DebugResponse> {
  return json<DebugResponse>(apiUrl("/engine/debug"), {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function reloadLexicon(invalidateCache = false): Promise<{
  ok: boolean;
  total: number;
  byCategory: Record<string, number>;
  cacheStatus: string;
}> {
  return json(apiUrl("/lexicon/reload"), {
    method: "POST",
    body: JSON.stringify({ invalidateCache }),
  });
}

export interface AddEntryParams {
  category: LexiconCategory;
  name: string;
  semantic_description: string;
  tags?: string[];
  payload: string;
  css?: string;
  html?: string;
  js?: string;
  conflicts?: string[];
  family?: string;
}

export async function addLexiconEntry(
  params: AddEntryParams,
): Promise<{ ok: boolean; id: string; total: number }> {
  return json(apiUrl("/lexicon/add"), {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export const EXAMPLE_PROMPTS = [
  "soft glassmorphism SaaS dashboard with bento grid and warm sand palette",
  "brutalist portfolio landing page with bold typography and hard shadows",
  "neumorphism login form with soft UI and mint accent",
  "aurora gradient hero section for an AI startup, modern 2026 aesthetic",
  "minimal pricing cards with claymorphism and electric lime accent",
  "dark cyberpunk command palette with neon glow interactions",
  "magazine-style blog layout with asymmetric grid and serif headings",
  "e-commerce product grid with hover lift and image zoom",
];
