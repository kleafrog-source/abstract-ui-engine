#!/usr/bin/env bun
/**
 * Validate the generated lexicon JSON files independently.
 *
 * Checks:
 *   1. Each file under data/lexicon/ parses as valid JSON.
 *   2. Total entry count >= 3500.
 *   3. No duplicate `id` values across all files.
 *   4. Every entry has non-empty semantic_description, tags (len>0), payload.
 *   5. Each entry's `category` matches its filename.
 *   6. The LexiconFile wrapper has correct `count` and `version` fields.
 */
import { promises as fs } from "fs";
import path from "path";

const LEXICON_DIR = path.resolve(process.cwd(), "data/lexicon");
const CATEGORIES = ["layouts", "components", "styles", "typography", "interactions", "utilities"] as const;

interface LexiconEntry {
  id: string;
  category: string;
  name: string;
  semantic_description: string;
  tags: string[];
  payload: string;
}

interface LexiconFile {
  category: string;
  version: string;
  count: number;
  entries: LexiconEntry[];
}

let total = 0;
const ids = new Set<string>();
const dupIds: string[] = [];
const errors: string[] = [];
const summary: Array<{ category: string; count: number }> = [];

for (const cat of CATEGORIES) {
  const file = path.join(LEXICON_DIR, `${cat}.json`);
  let raw: string;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch (e) {
    errors.push(`[FATAL] Could not read ${file}: ${(e as Error).message}`);
    continue;
  }

  let parsed: LexiconFile;
  try {
    parsed = JSON.parse(raw) as LexiconFile;
  } catch (e) {
    errors.push(`[FATAL] ${file} is not valid JSON: ${(e as Error).message}`);
    continue;
  }

  // Wrapper validation
  if (parsed.category !== cat) {
    errors.push(`[${cat}] wrapper category mismatch: got ${parsed.category}`);
  }
  if (parsed.version !== "1.0.0") {
    errors.push(`[${cat}] wrapper version is ${parsed.version}, expected 1.0.0`);
  }
  if (parsed.count !== parsed.entries.length) {
    errors.push(`[${cat}] wrapper count ${parsed.count} != entries.length ${parsed.entries.length}`);
  }

  // Entry validation
  for (const e of parsed.entries) {
    if (!e.id) {
      errors.push(`[${cat}] entry missing id`);
      continue;
    }
    if (ids.has(e.id)) {
      dupIds.push(e.id);
      errors.push(`[${cat}] duplicate id: ${e.id}`);
    }
    ids.add(e.id);

    if (e.category !== cat) {
      errors.push(`[${cat}] entry ${e.id} has category ${e.category} != ${cat}`);
    }
    if (!e.semantic_description || e.semantic_description.trim().length < 10) {
      errors.push(`[${cat}] entry ${e.id} has empty/short semantic_description`);
    }
    if (!e.tags || !Array.isArray(e.tags) || e.tags.length === 0) {
      errors.push(`[${cat}] entry ${e.id} has empty tags`);
    }
    if (!e.payload || e.payload.trim().length === 0) {
      errors.push(`[${cat}] entry ${e.id} has empty payload`);
    }
  }

  summary.push({ category: cat, count: parsed.entries.length });
  total += parsed.entries.length;
}

console.log("\n=== Lexicon validation report ===\n");
for (const s of summary) {
  console.log(`  ${s.category.padEnd(14)} ${String(s.count).padStart(5)}`);
}
console.log(`  ${"total".padEnd(14)} ${String(total).padStart(5)}`);
console.log(`  ${"unique-ids".padEnd(14)} ${String(ids.size).padStart(5)}`);
console.log(`  ${"dup-ids".padEnd(14)} ${String(dupIds.length).padStart(5)}`);

console.log("\n=== Checks ===");
console.log(`  Total >= 3500:           ${total >= 3500 ? "PASS" : "FAIL"} (${total})`);
console.log(`  No duplicate ids:        ${dupIds.length === 0 ? "PASS" : "FAIL"} (${dupIds.length} dups)`);
console.log(`  All JSON valid:          ${errors.filter(e => e.includes("FATAL")).length === 0 ? "PASS" : "FAIL"}`);
console.log(`  Category matches file:   ${errors.filter(e => e.includes("category")).length === 0 ? "PASS" : "FAIL"}`);
console.log(`  Required fields present: ${errors.filter(e => e.includes("empty") || e.includes("missing")).length === 0 ? "PASS" : "FAIL"}`);

if (errors.length > 0) {
  console.log(`\n=== Errors (${errors.length}) ===`);
  for (const e of errors.slice(0, 20)) console.log(`  ${e}`);
  if (errors.length > 20) console.log(`  ... and ${errors.length - 20} more`);
  process.exit(1);
} else {
  console.log("\n  All validations PASSED.\n");
}
