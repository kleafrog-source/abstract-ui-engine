from __future__ import annotations

import re
from typing import Any

from .config import LEXICON_CATEGORIES, SEARCH_CONFIG
from .embeddings import build_embedding_cache, cache_stats, create_provider, invalidate_cache
from .lexicon import load_lexicon, lexicon_stats

INDEX: dict[str, Any] | None = None
STOPWORDS = {
    "a",
    "an",
    "and",
    "the",
    "with",
    "for",
    "from",
    "into",
    "over",
    "page",
    "section",
    "block",
    "modern",
    "style",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "by",
    "with",
    "для",
    "с",
    "и",
    "или",
    "на",
    "по",
    "из",
    "под",
    "без",
    "для",
    "это",
    "как",
    "что",
    "же",
    "but",
}
CATEGORY_HINTS = {
    "components": {
        "button",
        "buttons",
        "card",
        "cards",
        "menu",
        "drawer",
        "accordion",
        "slider",
        "carousel",
        "toggle",
        "modal",
        "tabs",
    },
    "styles": {
        "palette",
        "color",
        "colors",
        "gradient",
        "glass",
        "glassmorphism",
        "neon",
        "shadow",
        "border",
        "surface",
        "background",
    },
    "layouts": {
        "layout",
        "grid",
        "flex",
        "columns",
        "hero",
        "sidebar",
        "shell",
        "aspect",
        "ratio",
    },
    "typography": {
        "text",
        "heading",
        "headline",
        "font",
        "typography",
        "marker",
        "glyph",
        "letters",
    },
    "interactions": {
        "animation",
        "motion",
        "hover",
        "scroll",
        "reveal",
        "parallax",
        "interactive",
        "click",
        "progress",
        "stagger",
    },
    "utilities": {
        "utility",
        "helper",
        "spacing",
        "ratio",
        "sticky",
        "scrollbar",
        "truncate",
    },
}
GENERIC_QUERY_TOKENS = {
    "button",
    "buttons",
    "card",
    "cards",
    "cta",
    "actions",
    "action",
    "color",
    "colors",
    "accent",
    "background",
    "layout",
    "content",
    "grid",
    "hero",
    "section",
    "block",
    "surface",
    "hover",
    "interactive",
    "feature",
    "features",
    "tile",
    "tiles",
    "panel",
    "panels",
}
RU_QUERY_HINTS = {
    "дашборд": "dashboard analytics metrics kpi sidebar charts table widgets",
    "панель": "dashboard panel workspace sidebar widgets toolbar",
    "лендинг": "landing hero features testimonials pricing faq cta",
    "сайт": "website landing page hero sections footer navigation",
    "портал": "portal dashboard workspace navigation widgets content",
    "каталог": "catalog directory filters cards detail library grid",
    "документация": "docs documentation navigation article code examples footer",
    "обучения": "learning education courses progress calendar achievements dashboard",
    "курсов": "courses cards lessons progress education catalog",
    "карточками": "cards tiles grid panels",
    "карточек": "cards tiles grid panels",
    "виджетами": "widgets panels insights",
    "виджеты": "widgets panels insights",
    "фильтрами": "filters filter toolbar chips search controls",
    "фильтры": "filters filter toolbar chips search controls",
    "календарём": "calendar schedule planner date widget",
    "календарь": "calendar schedule planner date widget",
    "достижений": "achievements badges milestones progress",
    "кнопками": "buttons cta actions controls",
    "кнопки": "buttons cta actions controls",
    "стили": "styles palette gradient surface background border shadow aesthetic",
    "стиль": "style styling visual system aesthetic palette surface",
    "компоненты": "components ui blocks cards sections modules interface",
    "компонент": "component ui block module interface",
    "типографика": "typography heading headline font body text editorial scale",
    "шрифт": "font typography letters heading body text display",
    "текст": "text typography body copy prose editorial",
    "интеракции": "interactions hover motion animation behavior reveal transition",
    "интеракция": "interaction hover motion animation behavior",
    "анимации": "animation motion transition stagger reveal hover interactive",
    "анимация": "animation motion transition reveal interactive",
    "утилиты": "utilities helper spacing sticky ratio overflow scrollbar",
    "утилита": "utility helper spacing sticky ratio overflow scrollbar",
    "цвета": "colors palette gradient accent surface background contrast",
    "цвет": "color palette gradient accent surface background contrast",
    "градиент": "gradient blend aurora mesh color transition",
    "тени": "shadow soft diffuse elevation depth surface",
    "таблица": "table data rows columns records grid admin",
    "таблицы": "tables data rows columns records admin",
    "навигация": "navigation nav menu sidebar header links breadcrumbs",
    "меню": "menu navigation nav sidebar header actions",
    "герой": "hero opening statement visual lead headline showcase",
    "секция": "section block layout module composition",
    "секции": "sections layout modules composition",
    "фиолетовыми": "violet purple accent",
    "синими": "blue navy cobalt indigo",
    "оранжевыми": "orange amber tangerine cta accent",
    "зелёными": "green emerald mint success",
    "зелеными": "green emerald mint success",
    "розовыми": "pink rose blush accent",
    "песочными": "sand beige warm neutral surface",
    "аква": "aqua cyan teal ocean",
    "бирюзовыми": "teal aqua cyan ocean",
    "туманным": "mist fog soft surface",
    "светлым": "light bright soft neutral",
    "ярким": "vibrant colorful saturated",
    "красочный": "colorful vibrant rich gradient",
    "современный": "modern polished contemporary",
    "онлайн": "online web digital",
    "обучение": "learning education courses lessons",
}


def _expand_query(query: str) -> tuple[str, list[str]]:
    lowered = query.lower()
    expansions: list[str] = []
    for source, expansion in RU_QUERY_HINTS.items():
        if source in lowered:
            expansions.append(expansion)
    unique_expansions = list(dict.fromkeys(expansions))
    if not unique_expansions:
        return query, []
    return f"{query} {' '.join(unique_expansions)}", unique_expansions


def tokenize(text: str) -> list[str]:
    normalized = re.sub(r"[^\w\s]", " ", text.lower(), flags=re.UNICODE)
    return [
        token
        for token in (part.strip("_") for part in normalized.split())
        if len(token) > 1 and token not in STOPWORDS
    ]


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
        "cacheMatchesLexicon": build.get("cacheMatchesLexicon", False),
        "sourceDigest": build.get("sourceDigest"),
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


def _field_tokens(entry: dict[str, Any]) -> dict[str, set[str]]:
    return {
        "name": set(tokenize(entry.get("name", ""))),
        "tags": set(tokenize(" ".join(entry.get("tags", [])))),
        "payload": set(tokenize(entry.get("payload", ""))),
        "semantic": set(tokenize(entry.get("semantic_description", ""))),
        "family": set(tokenize(entry.get("family", ""))),
    }


def _keyword_score(query: str, query_tokens: list[str], entry: dict[str, Any], matched: list[str]) -> float:
    if not query_tokens:
        return 0.0

    fields = _field_tokens(entry)
    weights = {
        "name": 1.2,
        "tags": 1.1,
        "payload": 0.9,
        "semantic": 0.55,
        "family": 0.35,
    }
    total_weight = sum(weights.values())
    coverage = 0.0
    for field_name, tokens in fields.items():
        overlap = sum(1 for token in query_tokens if token in tokens)
        coverage += (overlap / max(1, len(query_tokens))) * weights[field_name]

    phrase_bonus = 0.0
    lowered_query = query.lower()
    name_lower = str(entry.get("name", "")).lower()
    semantic_lower = str(entry.get("semantic_description", "")).lower()
    tags_lower = [str(tag).lower() for tag in entry.get("tags", [])]
    if len(query_tokens) >= 2:
        for width in (3, 2):
            if len(query_tokens) < width:
                continue
            for start in range(0, len(query_tokens) - width + 1):
                phrase = " ".join(query_tokens[start : start + width])
                if phrase in name_lower or phrase in semantic_lower or any(phrase in tag for tag in tags_lower):
                    phrase_bonus = max(phrase_bonus, 0.1 if width == 2 else 0.16)

    category_boost = 0.0
    for category_name, hints in CATEGORY_HINTS.items():
        if entry.get("category") == category_name and any(token in hints for token in query_tokens):
            category_boost = 0.08
            break

    exact_token_bonus = min(0.12, len(matched) * 0.025)
    query_hint_bonus = 0.04 if lowered_query in semantic_lower or lowered_query in name_lower else 0.0
    specific_matches = [token for token in matched if token not in GENERIC_QUERY_TOKENS]
    generic_matches = [token for token in matched if token in GENERIC_QUERY_TOKENS]
    specificity_bonus = min(0.14, len(specific_matches) * 0.035)
    generic_penalty = 0.0
    meta = entry.get("meta") or {}
    low_value_penalty = 0.0
    if meta.get("low_value_fragment"):
        low_value_penalty += 0.14 if not specific_matches else 0.08
    if meta.get("micro_fragment") and str(meta.get("entity_level") or "component") != "section":
        low_value_penalty += 0.06
    if generic_matches and not specific_matches:
        generic_penalty += min(0.16, len(generic_matches) * 0.03)
    if len(generic_matches) >= max(3, len(matched)) and len(specific_matches) <= 1:
        generic_penalty += 0.06
    return min(
        1.0,
        max(
            0.0,
            coverage / total_weight
            + phrase_bonus
            + category_boost
            + exact_token_bonus
            + query_hint_bonus
            + specificity_bonus
            - generic_penalty
            - low_value_penalty,
        ),
    )


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
    expanded_query, expansion_hints = _expand_query(query)
    q_tokens = list(dict.fromkeys(tokenize(expanded_query)))
    q_vector = provider.embed_batch([expanded_query])[0]

    alpha = 0.68 - max(0.0, min(1.0, temperature)) * 0.18
    beta = 1 - alpha
    pool = index["byCategory"].get(category, []) if category else index["entries"]

    hits: list[dict[str, Any]] = []
    for entry in pool:
        vector = index["vectors"].get(entry["id"])
        if not vector:
            continue
        matched = _matched_tokens(q_tokens, entry)
        keyword_score = _keyword_score(expanded_query, q_tokens, entry, matched)
        meta = entry.get("meta") or {}
        retrieval_weight = float(meta.get("retrieval_weight") or 1.0)
        structural_bonus = 0.0
        if str(meta.get("entity_level") or "component") == "section":
            structural_bonus += min(0.08, float(meta.get("section_richness") or 0.0) * 0.08)
        score = (alpha * cosine(q_vector, vector) + beta * keyword_score + structural_bonus) * retrieval_weight
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
        "expandedQuery": expanded_query,
        "expansionHints": expansion_hints,
        "hits": hits[:top_limit],
        "tookMs": 0,
    }


def build_debug(query: str, hits: list[dict[str, Any]]) -> dict[str, Any]:
    expanded_query, expansion_hints = _expand_query(query)
    q_tokens = list(dict.fromkeys(tokenize(expanded_query)))
    index = build_index()
    token_matches = []
    for token in q_tokens:
        hit_ids = [hit["entry"]["id"] for hit in hits if token in hit["matchedTokens"]][:8]
        token_matches.append({"token": token, "hitIds": hit_ids})
    return {
        "queryTokens": q_tokens,
        "expandedQuery": expanded_query,
        "expansionHints": expansion_hints,
        "tokenMatches": token_matches,
        "provider": create_provider().kind,
        "cacheStatus": index["cacheStatus"],
        "cacheMatchesLexicon": index.get("cacheMatchesLexicon", False),
        "sourceDigest": index.get("sourceDigest"),
        "cache": cache_stats(),
        "lexiconStats": lexicon_stats()["byCategory"],
        "lexiconQuality": lexicon_stats().get("quality", {}),
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
