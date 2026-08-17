from __future__ import annotations

import hashlib
import pickle
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any

import requests

from .config import (
    CACHE_DIR,
    EMBEDDING_DIM,
    EMBEDDING_PROVIDER,
    EMBEDDINGS_CACHE_FILE,
    OLLAMA_EMBED_MODEL,
    OLLAMA_EMBED_MODELS,
    OLLAMA_URL,
    SENTENCE_TRANSFORMER_MODEL,
)


def l2normalize(vector: list[float]) -> list[float]:
    norm = sum(value * value for value in vector) ** 0.5
    if norm == 0:
        return vector
    return [value / norm for value in vector]


def text_hash(entry: dict[str, Any]) -> str:
    basis = "|".join(
        [
            entry.get("name", ""),
            entry.get("semantic_description", ""),
            ",".join(entry.get("tags", [])),
        ]
    )
    return hashlib.sha256(basis.encode("utf-8")).hexdigest()


def lexicon_digest(entries: list[dict[str, Any]]) -> str:
    payload = "||".join(
        f"{entry['id']}:{text_hash(entry)}"
        for entry in sorted(entries, key=lambda item: item["id"])
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


class EmbeddingProvider:
    kind: str
    dimension: int = EMBEDDING_DIM

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        raise NotImplementedError


class OllamaEmbeddingProvider(EmbeddingProvider):
    kind = "ollama"

    def __init__(self) -> None:
        base_url = OLLAMA_URL.rstrip("/")
        self.endpoints = (
            f"{base_url}/api/embeddings",
            f"{base_url}/api/embed",
            f"{base_url}/v1/embeddings",
        )
        self.model_name: str | None = None

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        last_error: Exception | None = None
        for model_name in OLLAMA_EMBED_MODELS:
            for endpoint in self.endpoints:
                try:
                    embeddings = self._request_embeddings(endpoint, model_name, texts)
                    self.model_name = model_name
                    return embeddings
                except (requests.RequestException, RuntimeError) as exc:
                    last_error = exc
                    continue
        raise RuntimeError(
            "Ollama embeddings request failed for all known endpoints/models. "
            f"Last error: {last_error}"
        )

    def _request_embeddings(
        self,
        endpoint: str,
        model_name: str,
        texts: list[str],
    ) -> list[list[float]]:
        if endpoint.endswith("/api/embeddings"):
            vectors: list[list[float]] = []
            for text in texts:
                response = requests.post(
                    endpoint,
                    json={"model": model_name, "prompt": text},
                    timeout=120,
                )
                response.raise_for_status()
                payload = response.json()
                if "embedding" not in payload:
                    raise RuntimeError("Ollama /api/embeddings returned malformed payload.")
                vectors.append(
                    l2normalize([float(value) for value in payload["embedding"]])
                )
            return vectors

        response = requests.post(
            endpoint,
            json={"model": model_name, "input": texts},
            timeout=120,
        )
        response.raise_for_status()
        payload = response.json()
        if isinstance(payload.get("embeddings"), list):
            embeddings = payload["embeddings"]
            if len(embeddings) != len(texts):
                raise RuntimeError("Ollama returned malformed embeddings payload.")
            return [
                l2normalize([float(value) for value in vector])
                for vector in embeddings
            ]
        if "embedding" in payload and len(texts) == 1:
            return [l2normalize([float(value) for value in payload["embedding"]])]
        raise RuntimeError("Ollama returned malformed embeddings payload.")


class SentenceTransformerProvider(EmbeddingProvider):
    kind = "sentence-transformers"

    def __init__(self) -> None:
        from sentence_transformers import SentenceTransformer

        self.model = SentenceTransformer(SENTENCE_TRANSFORMER_MODEL)

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        vectors = self.model.encode(texts, normalize_embeddings=True)
        return [[float(value) for value in vector] for vector in vectors.tolist()]


class AutoEmbeddingProvider(EmbeddingProvider):
    kind = "auto"

    def __init__(self) -> None:
        self._active_provider: EmbeddingProvider | None = None

    @property
    def active_provider(self) -> EmbeddingProvider:
        if self._active_provider is None:
            self._active_provider = self._resolve_provider()
        return self._active_provider

    def _resolve_provider(self) -> EmbeddingProvider:
        ollama_provider = OllamaEmbeddingProvider()
        try:
            ollama_provider.embed_batch(["healthcheck"])
            return ollama_provider
        except requests.RequestException as exc:
            print(
                "[embeddings] Ollama unavailable; "
                f"falling back to sentence-transformers. Reason: {exc}"
            )
            return SentenceTransformerProvider()
        except RuntimeError as exc:
            print(
                "[embeddings] Ollama embeddings failed; "
                f"falling back to sentence-transformers. Reason: {exc}"
            )
            return SentenceTransformerProvider()

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        return self.active_provider.embed_batch(texts)

    @property
    def resolved_kind(self) -> str:
        return self.active_provider.kind


def create_provider() -> EmbeddingProvider:
    if EMBEDDING_PROVIDER == "auto":
        return AutoEmbeddingProvider()
    if EMBEDDING_PROVIDER == "sentence-transformers":
        return SentenceTransformerProvider()
    if EMBEDDING_PROVIDER == "ollama":
        return OllamaEmbeddingProvider()
    raise RuntimeError(
        f"Unsupported EMBEDDING_PROVIDER={EMBEDDING_PROVIDER!r}. "
        "Use 'auto', 'ollama' or 'sentence-transformers'."
    )


@dataclass
class CacheBundle:
    vectors: dict[str, list[float]]
    provider: str
    dimension: int
    generated_at: str
    records: list[dict[str, Any]]
    source_digest: str | None
    version: int


def load_embedding_cache() -> CacheBundle | None:
    if not EMBEDDINGS_CACHE_FILE.exists():
        return None
    with EMBEDDINGS_CACHE_FILE.open("rb") as handle:
        payload = pickle.load(handle)
    accepted_providers = (
        {"ollama", "sentence-transformers"}
        if EMBEDDING_PROVIDER == "auto"
        else {EMBEDDING_PROVIDER}
    )
    if payload.get("provider") not in accepted_providers:
        return None
    if payload.get("dimension") != EMBEDDING_DIM:
        return None
    return CacheBundle(
        vectors={record["id"]: record["vector"] for record in payload["records"]},
        provider=payload["provider"],
        dimension=payload["dimension"],
        generated_at=payload["generatedAt"],
        records=payload["records"],
        source_digest=payload.get("sourceDigest"),
        version=int(payload.get("version", 1)),
    )


def cache_stats() -> dict[str, Any]:
    if not EMBEDDINGS_CACHE_FILE.exists():
        return {
            "exists": False,
            "path": str(EMBEDDINGS_CACHE_FILE.resolve()),
            "size": 0,
            "generatedAt": None,
            "count": 0,
        }
    bundle = load_embedding_cache()
    stat = EMBEDDINGS_CACHE_FILE.stat()
    return {
        "exists": True,
        "path": str(EMBEDDINGS_CACHE_FILE.resolve()),
        "size": stat.st_size,
        "generatedAt": bundle.generated_at if bundle else None,
        "count": len(bundle.records) if bundle else 0,
        "version": bundle.version if bundle else None,
        "sourceDigest": bundle.source_digest if bundle else None,
    }


def invalidate_cache() -> None:
    if EMBEDDINGS_CACHE_FILE.exists():
        EMBEDDINGS_CACHE_FILE.unlink()


def save_embedding_cache(
    records: list[dict[str, Any]],
    provider: str,
    source_digest: str | None = None,
    dimension: int = EMBEDDING_DIM,
) -> dict[str, Any]:
    payload = {
        "version": 2,
        "provider": provider,
        "dimension": dimension,
        "generatedAt": datetime.now(UTC).isoformat(),
        "sourceDigest": source_digest,
        "records": records,
    }
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    with EMBEDDINGS_CACHE_FILE.open("wb") as handle:
        pickle.dump(payload, handle, protocol=pickle.HIGHEST_PROTOCOL)
    return payload


def build_embedding_cache(entries: list[dict[str, Any]]) -> dict[str, Any]:
    provider = create_provider()
    resolved_kind = (
        provider.resolved_kind
        if isinstance(provider, AutoEmbeddingProvider)
        else provider.kind
    )
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    existing = load_embedding_cache()
    current_digest = lexicon_digest(entries)
    existing_by_id = {}
    if existing:
        existing_by_id = {record["id"]: record for record in existing.records}

    vectors: dict[str, list[float]] = {}
    to_embed: list[tuple[str, str, str]] = []

    for entry in entries:
        hash_value = text_hash(entry)
        cached = existing_by_id.get(entry["id"])
        if cached and cached.get("hash") == hash_value:
            vectors[entry["id"]] = cached["vector"]
        else:
            to_embed.append((entry["id"], hash_value, entry["semantic_description"]))

    chunk_size = 64
    embedded = 0
    for offset in range(0, len(to_embed), chunk_size):
        chunk = to_embed[offset : offset + chunk_size]
        texts = [item[2] for item in chunk]
        chunk_vectors = provider.embed_batch(texts)
        for (entry_id, _, _), vector in zip(chunk, chunk_vectors, strict=True):
            vectors[entry_id] = vector
        embedded += len(chunk)

    records = [
        {
            "id": entry["id"],
            "hash": text_hash(entry),
            "vector": vectors[entry["id"]],
        }
        for entry in entries
    ]
    save_embedding_cache(records, resolved_kind, current_digest, provider.dimension)

    status = "fresh"
    if existing:
        status = "rebuilt" if embedded else "loaded"

    return {
        "vectors": vectors,
        "status": status,
        "total": len(entries),
        "embedded": embedded,
        "cached": len(entries) - embedded,
        "sourceDigest": current_digest,
        "cacheMatchesLexicon": True,
    }
