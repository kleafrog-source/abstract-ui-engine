from __future__ import annotations

import math
import re
from typing import Any

from .config import LEXICON_CATEGORIES, SEARCH_CONFIG
from .embeddings import build_embedding_cache, cache_stats, create_provider, invalidate_cache
from .lexicon import load_lexicon, lexicon_stats

INDEX: dict[str, Any] | None = None


def tokenize(text: str) -> list[str]:
    return [token for token in re.sub(r"[^a-z0-9\s]", " ", text.lower()).split() if len(token) > 1]


def simple_stem(token: str) -> str:
    if len(token) <= 3:
        return token
    for suffix in ("ing", "ies", "es", "ed", "s"):
        if token.endswith(suffix):
            return token[: -len(suffix)]
    return token


def cosine(left: list[float], right: list[float]) -> float:
    return sum(a * b for a, b in zip(left, right, strict=True))


def build_index(force: bool = False) -> dict[str, Any]:
    global INDEX
    if INDEX is not None and not force:
        return INDEX
    entries = load_lexicon(force=force)
    build = build_embedding_cache(entries)
    by_category = {category: [] for category in LEXICON_CATEGORIES}
    for entry in entries:
        by_category.setdefault(entry["category"], []).append(entry)
    INDEX = {
        "entries": entries,
        "vectors": build["vectors"],
        "byCategory": by_category,
        "cacheStatus": build["status"],
    }
    return INDEX


def rebuild_index(invalidate_embeddings: bool = False) -> dict[str, Any]:
    if invalidate_embeddings:
        invalidate_cache()
    return build_index(force=True)


def _matched_tokens(query_tokens: list[str], entry: dict[str, Any]) -> list[str]:
    haystack = set()
    for tag in entry.get("tags", []):
        haystack.update(tokenize(tag))
    haystack.update(tokenize(entry.get("semantic_description", "")))
    haystack.update(tokenize(entry.get("name", "")))

    matches: list[str] = []
    for token in query_tokens:
        if token in haystack:
            matches.append(token)
            continue
        stem = simple_stem(token)
        if any(word == stem or word.startswith(stem) for word in haystack):
            matches.append(token)
    return list(dict.fromkeys(matches))


def search(
    query: str,
    *,
    temperature: float = 0.4,
    top_k: int | None = None,
    category: str | None = None,
    locked: list[str] | None = None,
) -> dict[str, Any]:
    index = build_index()
    provider = create_provider()
    top_limit = min(top_k or SEARCH_CONFIG["default_top_k"], SEARCH_CONFIG["max_top_k"])
    q_tokens = list(dict.fromkeys(tokenize(query)))
    q_vector = provider.embed_batch([query])[0]

    alpha = 0.78 - max(0.0, min(1.0, temperature)) * 0.28
    beta = 1 - alpha
    pool = index["byCategory"].get(category, []) if category else index["entries"]

    hits: list[dict[str, Any]] = []
    for entry in pool:
        vector = index["vectors"].get(entry["id"])
        if not vector:
            continue
        matched = _matched_tokens(q_tokens, entry)
        keyword_score = min(1.0, len(matched) / max(3, len(q_tokens)) + 0.15) if matched else 0.0
        score = alpha * cosine(q_vector, vector) + beta * keyword_score
        if locked and entry["id"] in locked:
            score = max(score, 0.9)
        hits.append(
            {
                "entry": entry,
                "score": score,
                "confidence": "high" if score >= 0.7 else "medium" if score >= 0.45 else "low",
                "matchedTokens": matched,
            }
        )

    hits.sort(key=lambda item: item["score"], reverse=True)
    return {
        "query": query,
        "provider": provider.kind,
        "temperature": temperature,
        "hits": hits[:top_limit],
        "tookMs": 0,
    }


def build_debug(query: str, hits: list[dict[str, Any]]) -> dict[str, Any]:
    q_tokens = list(dict.fromkeys(tokenize(query)))
    index = build_index()
    token_matches = []
    for token in q_tokens:
        hit_ids = [hit["entry"]["id"] for hit in hits if token in hit["matchedTokens"]][:8]
        token_matches.append({"token": token, "hitIds": hit_ids})
    return {
        "queryTokens": q_tokens,
        "tokenMatches": token_matches,
        "provider": create_provider().kind,
        "cacheStatus": index["cacheStatus"],
        "lexiconStats": lexicon_stats()["byCategory"],
    }


def mean_pairwise_cosine(vectors: list[list[float]]) -> float:
    if len(vectors) < 2:
        return 1.0
    total = 0.0
    count = 0
    for index, left in enumerate(vectors):
        for right in vectors[index + 1 :]:
            total += cosine(left, right)
            count += 1
    return total / count if count else 1.0

