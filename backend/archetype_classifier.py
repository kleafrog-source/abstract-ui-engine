from __future__ import annotations

from functools import lru_cache
from typing import Any

from .embeddings import create_provider


ARCHETYPE_PROTOTYPES: dict[str, list[str]] = {
    "landing": [
        "marketing landing page with hero features testimonials pricing faq call to action conversion oriented single page website",
        "продающий лендинг с hero секцией преимуществами отзывами pricing faq и сильным cta",
    ],
    "dashboard": [
        "analytics dashboard admin workspace with sidebar topbar metric cards charts tables filters widgets operational interface",
        "дашборд аналитики с sidebar topbar метриками графиками таблицами фильтрами и рабочими виджетами",
    ],
    "docs": [
        "documentation portal with navigation sidebar article header reading content code examples developer docs guide manual wiki",
        "портал документации с навигацией sidebar статьёй блоками кода и структурой developer docs",
    ],
    "catalog": [
        "catalog directory library product listing with filters search cards list detail panel facets browsing grid",
        "каталог с фильтрами поиском карточками списком detail panel и фасетной навигацией",
    ],
}

ARCHETYPE_KEYWORD_BOOSTS: dict[str, tuple[str, ...]] = {
    "landing": ("landing", "лендинг", "promo", "marketing", "cta", "hero"),
    "dashboard": ("dashboard", "дашборд", "admin", "analytics", "panel", "workspace", "kpi"),
    "docs": ("docs", "documentation", "guide", "manual", "wiki", "документация"),
    "catalog": ("catalog", "catalogue", "directory", "library", "каталог", "listing", "shop", "store"),
}


@lru_cache(maxsize=1)
def _prototype_vectors() -> dict[str, list[list[float]]]:
    provider = create_provider()
    vectors: dict[str, list[list[float]]] = {}
    for archetype, samples in ARCHETYPE_PROTOTYPES.items():
        vectors[archetype] = provider.embed_batch(samples)
    return vectors


def _cosine(left: list[float], right: list[float]) -> float:
    return sum(a * b for a, b in zip(left, right, strict=True))


def classify_archetype(query: str) -> dict[str, Any]:
    provider = create_provider()
    query_vector = provider.embed_batch([query])[0]
    lowered = query.lower()
    scores: dict[str, float] = {}

    for archetype, vectors in _prototype_vectors().items():
        base = max(_cosine(query_vector, vector) for vector in vectors)
        keyword_boost = 0.0
        for keyword in ARCHETYPE_KEYWORD_BOOSTS.get(archetype, ()):
            if keyword in lowered:
                keyword_boost += 0.025
        scores[archetype] = round(base + min(0.12, keyword_boost), 6)

    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    best = ranked[0][0] if ranked else "landing"
    return {
        "archetype": best,
        "scores": {name: score for name, score in ranked},
    }
