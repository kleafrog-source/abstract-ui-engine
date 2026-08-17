from __future__ import annotations

import os
import sys
from collections.abc import Iterable

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from tqdm import tqdm

from backend.embeddings import (
    AutoEmbeddingProvider,
    cache_stats,
    create_provider,
    lexicon_digest,
    load_embedding_cache,
    save_embedding_cache,
    text_hash,
)
from backend.lexicon import load_lexicon

CHECKPOINT_EVERY = 50
BATCH_SIZE = 16


def chunked[T](items: list[T], size: int) -> Iterable[list[T]]:
    for offset in range(0, len(items), size):
        yield items[offset : offset + size]


def main() -> None:
    entries = load_lexicon(force=True)
    current_digest = lexicon_digest(entries)
    provider = create_provider()
    resolved_kind = (
        provider.resolved_kind
        if isinstance(provider, AutoEmbeddingProvider)
        else provider.kind
    )
    cache = load_embedding_cache()
    cache_matches_lexicon = bool(cache and cache.source_digest == current_digest)
    cached_records = {
        record["id"]: record
        for record in (cache.records if cache else [])
    }

    records_by_id: dict[str, dict[str, object]] = {}
    pending: list[dict[str, object]] = []
    reused = 0

    for entry in entries:
        entry_hash = text_hash(entry)
        cached = cached_records.get(entry["id"])
        if cached and cached.get("hash") == entry_hash:
            records_by_id[entry["id"]] = cached
            reused += 1
        else:
            pending.append(
                {
                    "id": entry["id"],
                    "hash": entry_hash,
                    "text": entry["semantic_description"],
                    "label": entry.get("name") or entry["id"],
                }
            )

    print(
        f"Found {reused} existing embeddings in cache. "
        f"Generating {len(pending)} new ones..."
    )
    if cache:
        status = "matches" if cache_matches_lexicon else "differs from"
        print(
            f"Cache fingerprint {status} current lexicon. "
            f"cacheVersion={cache.version} cacheCount={len(cache.records)}"
        )

    embedded = 0
    progress = tqdm(total=len(pending), desc="Embedding lexicon", unit="item")
    try:
        for batch in chunked(pending, BATCH_SIZE):
            progress.set_description(f"Embedding {batch[0]['label']}")
            vectors = provider.embed_batch([item["text"] for item in batch])
            for item, vector in zip(batch, vectors, strict=True):
                records_by_id[str(item["id"])] = {
                    "id": item["id"],
                    "hash": item["hash"],
                    "vector": vector,
                }
                embedded += 1
                progress.update(1)
                progress.set_postfix_str(str(item["label"]))
                if embedded % CHECKPOINT_EVERY == 0:
                    save_embedding_cache(
                        build_records(entries, records_by_id),
                        resolved_kind,
                        current_digest,
                        provider.dimension,
                    )
    finally:
        progress.close()

    save_embedding_cache(
        build_records(entries, records_by_id),
        resolved_kind,
        current_digest,
        provider.dimension,
    )

    result = {
        "total": len(entries),
        "embedded": embedded,
        "cached": reused,
        "status": "fresh" if reused == 0 else "rebuilt" if embedded > 0 else "loaded",
    }
    stats = cache_stats()
    print(
        {
            "total": result["total"],
            "embedded": result["embedded"],
            "cached": result["cached"],
            "status": result["status"],
            "cache": stats,
        }
    )


def build_records(
    entries: list[dict[str, object]],
    records_by_id: dict[str, dict[str, object]],
) -> list[dict[str, object]]:
    return [
        {
            "id": entry["id"],
            "hash": records_by_id[str(entry["id"])]["hash"],
            "vector": records_by_id[str(entry["id"])]["vector"],
        }
        for entry in entries
        if str(entry["id"]) in records_by_id
    ]


if __name__ == "__main__":
    main()
