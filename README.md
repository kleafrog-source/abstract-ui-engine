# Abstract UI Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Semantic search driven UI generation engine built around a modular design lexicon, local embeddings, and standalone HTML export.

## Overview

Abstract UI Engine turns natural-language prompts into structured UI compositions. It combines:

- semantic retrieval over a curated lexicon of UI patterns;
- local embedding generation with BGE-M3-compatible providers;
- deterministic assembly of layouts, typography, styles, components, interactions, and utilities;
- export to a single self-contained HTML document.

The current implementation uses a `Next.js` frontend for the interactive UI and a `Flask` backend for lexicon loading, embedding generation, search, assembly, metrics, and export.

## Features

- Dual-mode workflow:
  - `Architect` mode for search inspection, lock-based tuning, metrics, and debug visibility.
  - `Genesis` mode for fast generation and export.
- Standalone export:
  - produces a self-contained HTML file with inline CSS and JS.
- Modular lexicon:
  - `layouts`, `components`, `styles`, `typography`, `interactions`, `utilities`.
- Local embedding support:
  - Ollama-first workflow with compatible fallback to `sentence-transformers`.
- Incremental embedding cache:
  - resumable cache generation with progress reporting and checkpoint writes.

## Architecture Codemap

### Directory Structure

```text
backend/
  app.py                 Flask API
  assembly.py            UI selection, conflict resolution, standalone HTML generation
  config.py              runtime configuration
  embeddings.py          embedding providers and cache persistence
  lexicon.py             lexicon loading and custom entry persistence
  search_engine.py       semantic retrieval and debug helpers

data/
  lexicon/               source lexicon JSON files
  cache/                 generated embedding cache (ignored by git)
  lexicon_backup/        optional local backup for trimming experiments (ignored by git)

scripts/
  build_lexicon_embeddings.py
  generate-lexicon.ts
  validate-lexicon.ts

src/
  app/                   Next.js app entrypoints
  components/            builder UI and shared UI primitives
  lib/engine/            frontend API client, store, shared TS types
  hooks/

public/
  static public assets

run_app.py               local bootstrap for backend + frontend
trim_lexicon.py          optional local helper for reduced test lexicon
```

### Data Flow

1. `run_app.py` launches embedding preparation, Flask, and optionally the Next.js dev server.
2. `scripts/build_lexicon_embeddings.py` loads lexicon entries, resumes cached vectors if available, and writes checkpoints to `data/cache/embeddings.pkl`.
3. The frontend calls the Flask API at `http://127.0.0.1:8000/api`.
4. The backend embeds the query, retrieves lexicon matches, assembles a coherent page, computes metrics, and returns generation artifacts.
5. The frontend renders preview, debug data, and exports standalone HTML.

## Quick Start

### Requirements

- Python 3.13+
- Node.js 20+ recommended
- npm
- Optional: Ollama for local embedding generation

### Install

```bash
python -m pip install -r requirements.txt
npm install
```

### Run

```bash
python run_app.py
```

Default local endpoints:

- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:8000`

## Configuration

Configuration is environment-driven.

### Default mode

The project defaults to:

- `EMBEDDING_PROVIDER=auto`

This mode tries Ollama first, then falls back to `sentence-transformers` if Ollama is unavailable or incompatible.

### Ollama

Example `.env.example` values:

```env
EMBEDDING_PROVIDER=auto
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_EMBED_MODEL=qllama/bge-m3:q8_0
OLLAMA_EMBED_MODELS=qllama/bge-m3:q8_0,qwen3-embedding:0.6b,embeddinggemma:300m
```

If you want to force Ollama only:

```env
EMBEDDING_PROVIDER=ollama
```

### HuggingFace / sentence-transformers

To force local HuggingFace inference:

```env
EMBEDDING_PROVIDER=sentence-transformers
SENTENCE_TRANSFORMER_MODEL=BAAI/bge-m3
```

### Frontend / backend runtime

```env
FLASK_HOST=127.0.0.1
FLASK_PORT=8000
NEXT_PORT=3000
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
START_FRONTEND=1
REPLACE_FRONTEND_ON_PORT=1
```

## Dependency Notes

Current dependency sets are intentionally minimal for the present architecture:

- Python:
  - `Flask`
  - `flask-cors`
  - `requests`
  - `sentence-transformers`
  - `tqdm`
- Node:
  - Next.js app runtime, UI primitives, form/input helpers, charts, and frontend state.

No MMSS, hotkey automation, or extra orchestration layers are added in this publication pass.

## License

MIT
