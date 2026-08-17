from __future__ import annotations

from typing import Any

from .archetypes import ARCHETYPES


SLOT_PROTOTYPES: dict[str, dict[str, str]] = {
    "hero": {
        "en": "hero section with headline supporting copy primary call to action visual panel and page opening composition",
        "ru": "hero секция с заголовком подзаголовком сильным cta и визуальной доминантой",
    },
    "features": {
        "en": "feature grid section with multiple cards benefits highlights and structured comparison-friendly layout",
        "ru": "секция преимуществ с сеткой карточек и структурированными блоками",
    },
    "testimonials": {
        "en": "testimonial social proof section with quotes avatars attributions and trust-building cards",
        "ru": "секция отзывов с цитатами социальным доказательством и карточками доверия",
    },
    "pricing": {
        "en": "pricing section with plans tiers pricing cards feature comparison and subscription call to action",
        "ru": "секция тарифов с карточками планов сравнением и призывом к действию",
    },
    "faq": {
        "en": "faq section with expandable questions answers grouped support content and clear scanning rhythm",
        "ru": "faq секция с вопросами ответами и аккордеоном",
    },
    "cta": {
        "en": "closing call to action section with conversion message buttons and decisive final prompt",
        "ru": "финальная cta секция с призывом к действию и завершающим сообщением",
    },
    "footer": {
        "en": "footer section with utility links legal information contact details and secondary navigation",
        "ru": "footer секция с полезными ссылками контактами и служебной навигацией",
    },
    "sidebar": {
        "en": "dashboard sidebar navigation workspace menu with grouped links status and contextual actions",
        "ru": "sidebar рабочей панели с навигацией группами ссылок и контекстными действиями",
    },
    "header": {
        "en": "application header or topbar with title actions filters search and context summary",
        "ru": "верхняя панель приложения с заголовком действиями фильтрами и поиском",
    },
    "stats": {
        "en": "metric summary section with kpi cards trend indicators and compact analytics widgets",
        "ru": "секция метрик с kpi карточками и аналитическими виджетами",
    },
    "filters": {
        "en": "filters toolbar with search chips dropdowns tabs and faceted browsing controls",
        "ru": "панель фильтров с поиском чипсами dropdown и фасетными контролами",
    },
    "charts": {
        "en": "analytics charts section with trend visualization comparisons and dashboard data storytelling",
        "ru": "секция графиков и аналитических визуализаций",
    },
    "table": {
        "en": "data table section with rows columns sortable records and operational list management",
        "ru": "секция таблицы данных со строками колонками и управлением записями",
    },
    "widgets": {
        "en": "widget panel cluster with activity feed summaries alerts and side analytical modules",
        "ru": "кластер виджетов с активностью сводками и alert модулями",
    },
    "nav": {
        "en": "documentation navigation tree with toc links hierarchy and article browsing sidebar",
        "ru": "навигация документации с деревом toc и иерархией ссылок",
    },
    "article_header": {
        "en": "documentation article header with title lead metadata anchors and reading context",
        "ru": "заголовок статьи документации с title lead и метаданными",
    },
    "content_body": {
        "en": "longform documentation body with prose subsections examples notes lists and technical reading flow",
        "ru": "основное тело документации с текстом подразделами примерами и списками",
    },
    "code": {
        "en": "code examples section with snippets tabs annotations and implementation references",
        "ru": "секция примеров кода со сниппетами и аннотациями",
    },
    "catalog_header": {
        "en": "catalog header with title description quick stats and browsing introduction",
        "ru": "заголовок каталога с описанием статистикой и вводным блоком",
    },
    "catalog_filters": {
        "en": "catalog filters toolbar with search facets chips sorting and browsing controls",
        "ru": "панель фильтров каталога с поиском фасетами сортировкой и чипсами",
    },
    "catalog_list": {
        "en": "catalog listing section with product cards item grid comparison-friendly arrangement and browsing density",
        "ru": "секция списка каталога с сеткой карточек товаров и плотным browsing layout",
    },
    "catalog_detail": {
        "en": "catalog detail or preview panel with richer item information attributes and contextual actions",
        "ru": "детальная панель каталога с расширенной информацией и действиями",
    },
}

SLOT_SUPPORT_TARGETS: dict[str, list[str]] = {
    "hero": [".hero-panel__grid", ".hero-panel", ".hero__inner", ".hero"],
    "features": [".features-grid", ".features-section", ".section-heading + div"],
    "testimonials": [".testimonials-grid", ".testimonials", ".section-heading + div"],
    "pricing": [".features-grid", ".pricing-grid", ".pricing-section", ".section-heading + div"],
    "faq": [".faq-list", ".faq", ".section-heading + div"],
    "cta": [".cta-actions", ".cta__inner", ".cta"],
    "sidebar": ["nav ul", ".dashboard-sidebar", "nav"],
    "header": [".dashboard-actions", ".dashboard-header", "header"],
    "stats": [".stats-grid", ".stats-section", ".section-heading + div"],
    "filters": [".filters-bar", ".catalog-filters", ".filters-section"],
    "charts": [".widgets-grid", ".charts-section", ".section-heading + div"],
    "table": [".table-shell", ".table-section"],
    "widgets": [".widgets-grid", ".widgets-section", ".section-heading + div"],
    "nav": [".docs-nav ul", ".docs-nav", "nav"],
    "article_header": [".article-header", "header"],
    "content_body": [".content-body", "article"],
    "code": [".code-section", ".content-body", "article"],
    "catalog_header": [".hero-panel__grid", ".hero-panel", ".catalog-header", ".section-heading + div"],
    "catalog_filters": [".filters-bar", ".catalog-filters", ".section-heading + div"],
    "catalog_list": [".features-grid", ".catalog-grid", ".section-heading + div"],
    "catalog_detail": [".widgets-grid", ".catalog-detail", ".section-heading + div"],
}

ARCHETYPE_SLOT_CONTRACTS: dict[str, dict[str, dict[str, Any]]] = {
    "landing": {
        "hero": {
            "families": ["neo-gradient", "editorial-expressive", "showcase-system", "glassmorphism", "bento"],
            "tokens": ["hero", "headline", "opening", "cta", "visual"],
        },
        "features": {
            "families": ["showcase-system", "bento", "editorial-expressive"],
            "tokens": ["features", "benefits", "grid", "cards"],
        },
        "testimonials": {
            "families": ["showcase-system", "editorial-expressive"],
            "tokens": ["testimonials", "quotes", "social proof"],
        },
        "pricing": {
            "families": ["showcase-system", "bento", "minimal-flat"],
            "tokens": ["pricing", "plans", "tiers", "comparison"],
        },
        "faq": {
            "families": ["minimal-flat", "content-system"],
            "tokens": ["faq", "questions", "answers", "accordion"],
        },
        "cta": {
            "families": ["neo-gradient", "editorial-expressive", "showcase-system"],
            "tokens": ["cta", "closing", "conversion"],
        },
    },
    "dashboard": {
        "sidebar": {
            "families": ["nav-system", "minimal-flat", "bento"],
            "tokens": ["sidebar", "workspace", "navigation", "menu"],
        },
        "header": {
            "families": ["minimal-flat", "bento", "nav-system"],
            "tokens": ["header", "topbar", "toolbar", "actions"],
        },
        "stats": {
            "families": ["bento", "showcase-system", "status-system"],
            "tokens": ["metrics", "kpi", "stats", "summary"],
        },
        "filters": {
            "families": ["nav-system", "minimal-flat", "status-system"],
            "tokens": ["filters", "search", "chips", "toolbar"],
        },
        "charts": {
            "families": ["showcase-system", "bento", "minimal-flat"],
            "tokens": ["charts", "analytics", "trends", "graphs"],
        },
        "table": {
            "families": ["minimal-flat", "content-system", "status-system"],
            "tokens": ["table", "records", "data", "rows"],
        },
        "widgets": {
            "families": ["bento", "status-system", "showcase-system"],
            "tokens": ["widgets", "panels", "activity", "alerts"],
        },
    },
    "docs": {
        "nav": {
            "families": ["nav-system", "content-system", "minimal-flat"],
            "tokens": ["docs nav", "toc", "hierarchy", "sidebar"],
        },
        "article_header": {
            "families": ["content-system", "editorial-expressive", "minimal-flat"],
            "tokens": ["article header", "title", "lead", "metadata"],
        },
        "content_body": {
            "families": ["content-system", "editorial-expressive", "text-lab"],
            "tokens": ["article body", "prose", "subsections", "reading flow"],
        },
        "code": {
            "families": ["content-system", "text-lab", "motion-system"],
            "tokens": ["code examples", "snippets", "developer references"],
        },
    },
    "catalog": {
        "catalog_header": {
            "families": ["catalog-system", "showcase-system", "minimal-flat"],
            "tokens": ["catalog header", "browsing intro", "listing overview"],
        },
        "catalog_filters": {
            "families": ["catalog-system", "nav-system", "status-system"],
            "tokens": ["catalog filters", "facets", "sorting", "search"],
        },
        "catalog_list": {
            "families": ["catalog-system", "showcase-system", "bento"],
            "tokens": ["catalog grid", "product listing", "cards", "comparison"],
        },
        "catalog_detail": {
            "families": ["catalog-system", "showcase-system", "content-system"],
            "tokens": ["detail panel", "preview", "item attributes", "actions"],
        },
    },
}


def build_page_plan(
    query: str,
    archetype: str,
    locale: str,
    constraints: dict[str, dict[str, int]],
    design_directives: dict[str, Any],
    archetype_scores: dict[str, float] | None = None,
) -> list[dict[str, Any]]:
    slots = ARCHETYPES.get(archetype, ARCHETYPES["landing"])
    plans: list[dict[str, Any]] = []
    for index, slot_def in enumerate(slots):
        slot = slot_def["slot"]
        prototype = SLOT_PROTOTYPES.get(slot, {})
        contract = ARCHETYPE_SLOT_CONTRACTS.get(archetype, {}).get(slot, {})
        intent_text = prototype.get("ru") if locale == "ru" else prototype.get("en") or prototype.get("ru") or slot
        retrieval_query = " | ".join(
            part
            for part in [
                query.strip(),
                intent_text,
                " ".join(contract.get("tokens", [])),
                " ".join(slot_def.get("tags", [])),
            ]
            if part
        )
        plans.append(
            {
                "slot": slot,
                "required": bool(slot_def.get("required", False)),
                "priority": len(slots) - index,
                "tags": slot_def.get("tags", []),
                "constraints": constraints.get(slot, {}),
                "intent": intent_text,
                "intentTokens": contract.get("tokens", []),
                "expectedFamilies": contract.get("families", []),
                "preferredLevels": ["section", "component"] if slot in MAJOR_SECTION_SLOTS else ["component", "section"],
                "supportTargets": SLOT_SUPPORT_TARGETS.get(slot, [".section-heading + div"]),
                "retrievalQuery": retrieval_query,
                "styleQuery": " | ".join(part for part in [query.strip(), intent_text, "visual style surface color typography motion", " ".join(contract.get("tokens", []))] if part),
                "interactionQuery": " | ".join(part for part in [query.strip(), intent_text, "interaction hover animation motion behavior", " ".join(contract.get("tokens", []))] if part),
                "motionLevel": design_directives.get("motionLevel", "none"),
                "chaosLevel": design_directives.get("chaosLevel", "calm"),
                "archetypeConfidence": float((archetype_scores or {}).get(archetype, 0.0)),
            }
        )
    return plans
MAJOR_SECTION_SLOTS = {
    "hero",
    "features",
    "testimonials",
    "pricing",
    "faq",
    "cta",
    "header",
    "footer",
    "sidebar",
    "stats",
    "filters",
    "charts",
    "widgets",
    "content_body",
    "catalog_header",
    "catalog_filters",
    "catalog_list",
    "catalog_detail",
}
