from __future__ import annotations

import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
LEXICON_DIR = DATA_DIR / "lexicon"
CACHE_DIR = DATA_DIR / "cache"
EMBEDDINGS_CACHE_FILE = CACHE_DIR / "embeddings.pkl"

EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "auto")
EMBEDDING_DIM = 1024
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
OLLAMA_EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "qllama/bge-m3:q8_0")
OLLAMA_EMBED_MODELS = tuple(
    model.strip()
    for model in os.getenv(
        "OLLAMA_EMBED_MODELS",
        f"{OLLAMA_EMBED_MODEL},qwen3-embedding:0.6b,embeddinggemma:300m,qwen3-embedding,embeddinggemma,all-minilm",
    ).split(",")
    if model.strip()
)
SENTENCE_TRANSFORMER_MODEL = os.getenv(
    "SENTENCE_TRANSFORMER_MODEL",
    "BAAI/bge-m3",
)

FLASK_HOST = os.getenv("FLASK_HOST", "127.0.0.1")
FLASK_PORT = int(os.getenv("FLASK_PORT", "8000"))
NEXT_PORT = int(os.getenv("NEXT_PORT", "3000"))
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        f"http://127.0.0.1:{NEXT_PORT},http://localhost:{NEXT_PORT}",
    ).split(",")
    if origin.strip()
]

LEXICON_CATEGORIES = (
    "layouts",
    "components",
    "styles",
    "typography",
    "interactions",
    "utilities",
)

SEARCH_CONFIG = {
    "default_top_k": 12,
    "max_top_k": 40,
    "strict_threshold": 0.55,
    "creative_threshold": 0.18,
}

CONFIG_SUMMARY = {
    "provider": EMBEDDING_PROVIDER,
    "dim": EMBEDDING_DIM,
    "ollama": OLLAMA_URL,
    "model": OLLAMA_EMBED_MODEL
    if EMBEDDING_PROVIDER in {"auto", "ollama"}
    else SENTENCE_TRANSFORMER_MODEL,
    "cache": str(EMBEDDINGS_CACHE_FILE),
}
