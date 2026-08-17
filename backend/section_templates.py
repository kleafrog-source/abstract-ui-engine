from __future__ import annotations

import html


def _localized_labels(locale: str, en: list[str], ru: list[str]) -> list[str]:
    return ru if locale == "ru" else en


def render_docs_nav(buttons_count: int = 4, locale: str = "en", **_: object) -> str:
    labels = _localized_labels(
        locale,
        ["Overview", "Install", "Usage", "API", "Examples", "FAQ", "CLI", "Config", "Deploy", "Troubleshooting", "Auth", "Limits"],
        ["Обзор", "Установка", "Использование", "API", "Примеры", "FAQ", "CLI", "Конфиг", "Деплой", "Диагностика", "Авторизация", "Лимиты"],
    )
    items = "\n".join(
        f'<li><a href="#section-{index + 1}">{labels[index % len(labels)]}</a></li>'
        for index in range(buttons_count)
    )
    nav_label = "Documentation navigation" if locale == "en" else "Навигация по документации"
    return f'<nav class="docs-nav" aria-label="{nav_label}"><ul>{items}</ul></nav>'


def render_code_block(examples_count: int = 1, locale: str = "en", **_: object) -> str:
    label = "Example" if locale == "en" else "Пример"
    blocks = []
    for index in range(examples_count):
        blocks.append(
            f"""
            <section class="code-section">
              <div class="code-section__meta">
                <span class="code-pill">{label} {index + 1}</span>
                <span class="code-pill code-pill--muted">curl</span>
              </div>
              <h3>{label} {index + 1}</h3>
              <p>{"A deterministic example for the current endpoint." if locale == "en" else "Детерминированный пример для текущего эндпоинта."}</p>
              <pre><code>curl -X GET /api/example/{index + 1}</code></pre>
            </section>
            """
        )
    return "\n".join(blocks)


def render_stats(cards_count: int = 3, locale: str = "en", **_: object) -> str:
    titles = _localized_labels(
        locale,
        ["Users", "Revenue", "Conversion", "Orders", "Visitors", "Growth"],
        ["Пользователи", "Выручка", "Конверсия", "Заказы", "Посетители", "Рост"],
    )
    values = ["12,345", "$98k", "3.2%", "1,200", "56k", "+15%"]
    deltas = ["+12%", "+8%", "+0.7%", "+4%", "+11%", "+15%"]
    cards = []
    for index in range(cards_count):
        cards.append(
            f"""
            <article class="stat-card">
              <div class="stat-card__eyebrow">{titles[index % len(titles)]}</div>
              <h3>{values[index % len(values)]}</h3>
              <p>{"Compared to last period" if locale == "en" else "Сравнение с прошлым периодом"}</p>
              <span class="stat-card__delta">{deltas[index % len(deltas)]}</span>
            </article>
            """
        )
    return f"""
    <section class="stats-section">
      <div class="section-heading">
        <div>
          <span class="section-kicker">Dashboard</span>
          <h2>{"Performance overview" if locale == "en" else "Обзор производительности"}</h2>
        </div>
      </div>
      <div class="stats-grid">{''.join(cards)}</div>
    </section>
    """


def render_features(cards_count: int = 6, columns_count: int = 3, locale: str = "en", **_: object) -> str:
    columns = max(1, min(6, columns_count))
    count = max(cards_count, columns)
    title = "Feature" if locale == "en" else "Функция"
    description = (
        "Structured, deterministic UI generation with strong export guarantees."
        if locale == "en"
        else "Структурная детерминированная генерация UI с надежным standalone export."
    )
    cards = []
    for index in range(count):
        cards.append(
            f"""
            <article class="feature-card">
              <span class="feature-card__index">0{index + 1}</span>
              <h3>{title} {index + 1}</h3>
              <p>{description}</p>
            </article>
            """
        )
    return f"""
    <section class="features-section">
      <div class="section-heading">
        <div>
          <span class="section-kicker">Core blocks</span>
          <h2>{"Built for modern product pages" if locale == "en" else "Создано для современных продуктовых страниц"}</h2>
        </div>
        <p>{"Compose dense sections, clear hierarchy, and responsive cards without external dependencies." if locale == "en" else "Собирайте насыщенные секции, ясную иерархию и адаптивные карточки без внешних зависимостей."}</p>
      </div>
      <div class="features-grid columns-{columns}">{''.join(cards)}</div>
    </section>
    """


def render_sidebar(buttons_count: int = 5, locale: str = "en", **_: object) -> str:
    labels = _localized_labels(
        locale,
        ["Overview", "Customers", "Reports", "Settings", "Billing", "Logs", "Team"],
        ["Обзор", "Клиенты", "Отчеты", "Настройки", "Платежи", "Логи", "Команда"],
    )
    items = "".join(
        f'<li><a href="#nav-{index + 1}">{labels[index % len(labels)]}</a></li>'
        for index in range(buttons_count)
    )
    aria_label = "Dashboard navigation" if locale == "en" else "Навигация панели"
    return f"""
    <aside class="dashboard-sidebar">
      <div class="dashboard-sidebar__brand">
        <strong>Abstract UI</strong>
        <span>{"Operations" if locale == "en" else "Операции"}</span>
      </div>
      <nav aria-label="{aria_label}">
        <ul>{items}</ul>
      </nav>
      <div class="dashboard-sidebar__footer">
        <p>{"Last sync 2 minutes ago" if locale == "en" else "Синхронизация 2 минуты назад"}</p>
      </div>
    </aside>
    """


def render_header(locale: str = "en", **_: object) -> str:
    title = "Operations Dashboard" if locale == "en" else "Операционная панель"
    subtitle = "Live overview of product performance" if locale == "en" else "Живой обзор производительности продукта"
    return f"""
    <header class="dashboard-header">
      <div>
        <span class="section-kicker">Workspace</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div class="dashboard-actions">
        <button class="btn btn--ghost">Export CSV</button>
        <a href="#" class="btn btn--primary">Create report</a>
      </div>
    </header>
    """


def render_table(locale: str = "en", **_: object) -> str:
    headers = ("ID", "Name", "Status", "Owner") if locale == "en" else ("ID", "Название", "Статус", "Владелец")
    rows = (
        [
            ("1", "Northwind rollout", "Active", "Alice"),
            ("2", "Metrics cleanup", "Review", "Bob"),
            ("3", "Q3 onboarding", "Queued", "Sofia"),
        ]
        if locale == "en"
        else [
            ("1", "Роллаут Northwind", "Активно", "Алиса"),
            ("2", "Очистка метрик", "Ревью", "Боб"),
            ("3", "Онбординг Q3", "В очереди", "София"),
        ]
    )
    body = "".join(
        f"<tr><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td></tr>"
        for row in rows
    )
    return f"""
    <section class="table-section">
      <div class="section-heading">
        <div>
          <span class="section-kicker">Pipeline</span>
          <h2>{"Recent activity" if locale == "en" else "Последняя активность"}</h2>
        </div>
        <p>{"High-signal items from the current workspace." if locale == "en" else "Ключевые элементы текущего workspace."}</p>
      </div>
      <div class="table-shell">
        <table class="data-table">
          <thead><tr><th>{headers[0]}</th><th>{headers[1]}</th><th>{headers[2]}</th><th>{headers[3]}</th></tr></thead>
          <tbody>{body}</tbody>
        </table>
      </div>
    </section>
    """


def render_widgets(locale: str = "en", **_: object) -> str:
    items = (
        [
            ("Alerts", "3 critical events require attention."),
            ("Uptime", "99.98% over the last 30 days."),
            ("Team load", "4 active owners across 12 initiatives."),
        ]
        if locale == "en"
        else [
            ("Алерты", "3 критических события требуют внимания."),
            ("Аптайм", "99.98% за последние 30 дней."),
            ("Нагрузка команды", "4 активных владельца на 12 инициативах."),
        ]
    )
    cards = "".join(
        f'<article class="widget-card"><h3>{title}</h3><p>{text}</p></article>'
        for title, text in items
    )
    return f"""
    <section class="widgets-section">
      <div class="section-heading">
        <div>
          <span class="section-kicker">Insights</span>
          <h2>{"Secondary widgets" if locale == "en" else "Дополнительные виджеты"}</h2>
        </div>
      </div>
      <div class="widgets-grid">{cards}</div>
    </section>
    """


def render_article_header(locale: str = "en", **_: object) -> str:
    title = "Documentation" if locale == "en" else "Документация"
    updated = "Last updated: Today" if locale == "en" else "Обновлено: сегодня"
    return f'<header class="article-header"><span class="section-kicker">Reference</span><h1>{title}</h1><p>{updated}</p></header>'


def render_content_body(locale: str = "en", **_: object) -> str:
    paragraphs = (
        [
            "This article explains the core workflow and the main integration points.",
            "Use the left navigation to move between sections, examples, and operational caveats.",
        ]
        if locale == "en"
        else [
            "Эта статья описывает основной workflow и ключевые точки интеграции.",
            "Используйте левую навигацию для перехода между разделами, примерами и operational caveats.",
        ]
    )
    return f'<article class="content-body">{"".join(f"<p>{paragraph}</p>" for paragraph in paragraphs)}</article>'


def render_hero(locale: str = "en", **_: object) -> str:
    eyebrow = "Deterministic interface engine" if locale == "en" else "Детерминированный движок интерфейсов"
    title = "Generate structured pages from semantic intent." if locale == "en" else "Генерируйте структурные страницы из семантического запроса."
    subtitle = (
        "Build rich landing pages, dashboards, and docs with slot-aware assembly, metrics, and standalone export."
        if locale == "en"
        else "Собирайте насыщенные лендинги, дашборды и docs через slot-aware assembly, метрики и standalone export."
    )
    return f"""
    <section class="hero">
      <div class="hero__inner">
        <div class="hero-copy">
          <span class="section-kicker">{eyebrow}</span>
          <h1 class="hero__title">{title}</h1>
          <p class="hero__subtitle">{subtitle}</p>
          <div class="hero-actions">
            <a href="#" class="btn btn--primary">Generate UI</a>
            <a href="#" class="btn btn--ghost">Inspect planner</a>
          </div>
        </div>
        <div class="hero-panel">
          <div class="hero-panel__card">
            <span class="hero-panel__label">Archetypes</span>
            <strong>Landing / Dashboard / Docs</strong>
            <p>Semantic retrieval + deterministic section composition.</p>
          </div>
          <div class="hero-panel__grid">
            <div><span>Sections</span><strong>5+</strong></div>
            <div><span>Export</span><strong>Standalone</strong></div>
            <div><span>Metrics</span><strong>MMSS</strong></div>
            <div><span>Planner</span><strong>Visible</strong></div>
          </div>
        </div>
      </div>
    </section>
    """


def render_testimonials(locale: str = "en", **_: object) -> str:
    quotes = (
        [
            ('"It finally outputs pages, not fragments."', "Frontend Lead"),
            ('"The planner makes generation debuggable."', "Design Systems Engineer"),
            ('"Standalone export is clean enough for handoff."', "Product Designer"),
        ]
        if locale == "en"
        else [
            ('"Теперь на выходе страницы, а не фрагменты."', "Frontend Lead"),
            ('"Planner делает генерацию наблюдаемой."', "Design Systems Engineer"),
            ('"Standalone export уже годится для handoff."', "Product Designer"),
        ]
    )
    cards = "".join(
        f'<article class="testimonial-card"><p>{quote}</p><cite>{author}</cite></article>'
        for quote, author in quotes
    )
    return f"""
    <section class="testimonials">
      <div class="section-heading">
        <div>
          <span class="section-kicker">Proof</span>
          <h2>{"Teams need explainable UI generation" if locale == "en" else "Командам нужна объяснимая UI-генерация"}</h2>
        </div>
      </div>
      <div class="testimonials-grid">{cards}</div>
    </section>
    """


def render_pricing(cards_count: int = 3, locale: str = "en", **_: object) -> str:
    count = max(2, min(6, cards_count))
    plans = _localized_labels(
        locale,
        ["Starter", "Growth", "Scale", "Enterprise", "Studio", "Pro"],
        ["Старт", "Рост", "Масштаб", "Энтерпрайз", "Студия", "Про"],
    )
    prices = ["$19", "$49", "$99", "$249", "$39", "$79"]
    cards = []
    for index in range(count):
        cards.append(
            f"""
            <article class="feature-card pricing-card">
              <span class="feature-card__index">{plans[index % len(plans)]}</span>
              <h3>{prices[index % len(prices)]}</h3>
              <p>{"per seat / month" if locale == "en" else "за место / месяц"}</p>
              <a href="#" class="btn btn--primary">Choose plan</a>
            </article>
            """
        )
    return f"""
    <section class="features-section pricing-section">
      <div class="section-heading">
        <div>
          <span class="section-kicker">Pricing</span>
          <h2>{"Clear plans for growing teams" if locale == "en" else "Понятные тарифы для растущих команд"}</h2>
        </div>
      </div>
      <div class="features-grid columns-{min(count, 4)}">{''.join(cards)}</div>
    </section>
    """


def render_faq(locale: str = "en", **_: object) -> str:
    items = (
        [
            ("How does generation work?", "Semantic retrieval selects structural candidates, then deterministic assembly builds the page."),
            ("Can I export the result?", "Yes, standalone HTML export is built into the pipeline."),
            ("Can I force a page type?", "Yes, use the archetype selector or explicit API parameter."),
        ]
        if locale == "en"
        else [
            ("Как работает генерация?", "Семантический retrieval выбирает structural candidates, затем deterministic assembly собирает страницу."),
            ("Можно ли экспортировать результат?", "Да, standalone HTML export встроен в pipeline."),
            ("Можно ли зафиксировать тип страницы?", "Да, через archetype selector или явный API-параметр."),
        ]
    )
    blocks = "".join(
        f'<article class="widget-card faq-item"><h3>{question}</h3><p>{answer}</p></article>'
        for question, answer in items
    )
    return f"""
    <section class="widgets-section faq-section">
      <div class="section-heading">
        <div>
          <span class="section-kicker">FAQ</span>
          <h2>{"Questions teams usually ask" if locale == "en" else "Вопросы, которые чаще всего задают команды"}</h2>
        </div>
      </div>
      <div class="widgets-grid">{blocks}</div>
    </section>
    """


def render_cta(locale: str = "en", **_: object) -> str:
    title = "Ship cleaner structural output." if locale == "en" else "Отгружайте более чистый структурный output."
    subtitle = (
        "Move from component soup to page-level assembly with visible rules and validation."
        if locale == "en"
        else "Переходите от component soup к page-level assembly с видимыми правилами и валидацией."
    )
    return f"""
    <section class="cta">
      <div class="cta__inner">
        <div>
          <span class="section-kicker">Next step</span>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div class="cta-actions">
          <a href="#" class="btn btn--primary">Export standalone</a>
          <a href="#" class="btn btn--ghost">Open architect mode</a>
        </div>
      </div>
    </section>
    """


def render_footer(locale: str = "en", **_: object) -> str:
    text = (
        "Abstract UI Engine · Semantic retrieval · Slot-based assembly"
        if locale == "en"
        else "Abstract UI Engine · Семантический retrieval · Slot-based assembly"
    )
    return f'<footer class="footer"><div class="footer__inner"><p>{text}</p></div></footer>'


def render_charts(locale: str = "en", **_: object) -> str:
    labels = _localized_labels(locale, ["Traffic", "Revenue", "Activation"], ["Трафик", "Выручка", "Активация"])
    cards = "".join(
        f"""
        <article class="widget-card chart-card">
          <h3>{label}</h3>
          <div class="chart-bars">
            <span style="height:48%"></span>
            <span style="height:72%"></span>
            <span style="height:38%"></span>
            <span style="height:84%"></span>
            <span style="height:60%"></span>
          </div>
        </article>
        """
        for label in labels
    )
    return f"""
    <section class="widgets-section charts-section">
      <div class="section-heading">
        <div>
          <span class="section-kicker">Trends</span>
          <h2>{"Operational charts" if locale == "en" else "Операционные графики"}</h2>
        </div>
      </div>
      <div class="widgets-grid">{cards}</div>
    </section>
    """


def render_filters(locale: str = "en", **_: object) -> str:
    placeholders = _localized_labels(locale, ["Search", "Status", "Owner"], ["Поиск", "Статус", "Владелец"])
    return f"""
    <section class="widgets-section filters-section">
      <div class="filters-bar">
        <input class="filter-input" placeholder="{placeholders[0]}" />
        <button class="btn btn--ghost">{placeholders[1]}</button>
        <button class="btn btn--ghost">{placeholders[2]}</button>
        <a href="#" class="btn btn--primary">Apply</a>
      </div>
    </section>
    """


def render_catalog_header(locale: str = "en", **_: object) -> str:
    title = "Universal Catalog" if locale == "en" else "Универсальный каталог"
    subtitle = (
        "A searchable index of reusable patterns, components, interactions, and design surfaces."
        if locale == "en"
        else "Поисковый индекс переиспользуемых паттернов, компонентов, интеракций и дизайн-поверхностей."
    )
    return f"""
    <section class="hero catalog-hero">
      <div class="hero__inner">
        <div class="hero-copy">
          <span class="section-kicker">Catalog mode</span>
          <h1 class="hero__title">{title}</h1>
          <p class="hero__subtitle">{subtitle}</p>
        </div>
        <div class="hero-panel">
          <div class="hero-panel__card">
            <span class="hero-panel__label">Inventory</span>
            <strong>Patterns, cards, motions</strong>
            <p>{"Structured browsing with semantic grouping." if locale == "en" else "Структурный просмотр с семантической группировкой."}</p>
          </div>
        </div>
      </div>
    </section>
    """


def render_catalog_filters(locale: str = "en", **_: object) -> str:
    search_label = "Search patterns" if locale == "en" else "Поиск паттернов"
    return f"""
    <section class="widgets-section catalog-filters-section">
      <div class="filters-bar">
        <input class="filter-input" placeholder="{search_label}" />
        <button class="btn btn--ghost">Components</button>
        <button class="btn btn--ghost">Styles</button>
        <button class="btn btn--ghost">Interactions</button>
        <a href="#" class="btn btn--primary">Apply filters</a>
      </div>
    </section>
    """


def render_catalog_list(cards_count: int = 6, locale: str = "en", **_: object) -> str:
    count = max(4, min(12, cards_count))
    titles = _localized_labels(
        locale,
        ["Warm Sand Cards", "Glass Overlay Panels", "Offset Stack Tiles", "Metric Ribbon", "Reveal Headers", "Dense Filter Rail"],
        ["Карточки Warm Sand", "Glass Overlay Panels", "Offset Stack Tiles", "Лента метрик", "Reveal Headers", "Dense Filter Rail"],
    )
    cards = []
    for index in range(count):
        title = titles[index % len(titles)]
        cards.append(
            f"""
            <article class="feature-card catalog-card">
              <span class="feature-card__index">#{index + 1}</span>
              <h3>{title}</h3>
              <p>{"Semantic design entry with tags, preview metadata, and reusable surface behavior." if locale == "en" else "Семантическая запись дизайна с тегами, preview-метаданными и переиспользуемым поведением поверхности."}</p>
              <div class="code-section__meta">
                <span class="code-pill">component</span>
                <span class="code-pill code-pill--muted">catalog</span>
              </div>
            </article>
            """
        )
    return f"""
    <section class="features-section catalog-list-section">
      <div class="section-heading">
        <div>
          <span class="section-kicker">Library</span>
          <h2>{"Reusable entries" if locale == "en" else "Переиспользуемые записи"}</h2>
        </div>
      </div>
      <div class="features-grid columns-3">{''.join(cards)}</div>
    </section>
    """


def render_catalog_detail(locale: str = "en", **_: object) -> str:
    title = "Focused preview" if locale == "en" else "Фокусный просмотр"
    description = (
        "Inspect semantic tags, source tokens, motion presets, and structural notes for the selected entry."
        if locale == "en"
        else "Просматривайте semantic tags, source tokens, motion presets и структурные заметки для выбранной записи."
    )
    return f"""
    <section class="widgets-section catalog-detail-section">
      <div class="widget-card">
        <span class="section-kicker">Detail</span>
        <h3>{title}</h3>
        <p>{description}</p>
        <div class="code-section__meta">
          <span class="code-pill">semantic-tag</span>
          <span class="code-pill">source-tokens</span>
          <span class="code-pill code-pill--muted">motion</span>
        </div>
      </div>
    </section>
    """


def _escape(value: object) -> str:
    return html.escape(str(value))


def _shorten(value: str, limit: int = 160) -> str:
    compact = " ".join(str(value).split())
    if len(compact) <= limit:
        return compact
    return compact[: max(0, limit - 1)].rstrip() + "..."


def _catalog_pills(values: list[str], *, muted: bool = False) -> str:
    if not values:
        return '<span class="code-pill code-pill--muted">none</span>'
    class_name = "code-pill code-pill--muted" if muted else "code-pill"
    return "".join(f'<span class="{class_name}">{_escape(value)}</span>' for value in values)


def render_catalog_header(
    locale: str = "en",
    catalog_query: str = "",
    catalog_counts: dict[str, int] | None = None,
    catalog_families: list[dict[str, object]] | None = None,
    catalog_tags: list[str] | None = None,
    **_: object,
) -> str:
    title = "Universal Catalog" if locale == "en" else "РЈРЅРёРІРµСЂСЃР°Р»СЊРЅС‹Р№ РєР°С‚Р°Р»РѕРі"
    subtitle = (
        "A searchable index of reusable patterns, components, interactions, and design surfaces."
        if locale == "en"
        else "РџРѕРёСЃРєРѕРІС‹Р№ РёРЅРґРµРєСЃ РїРµСЂРµРёСЃРїРѕР»СЊР·СѓРµРјС‹С… РїР°С‚С‚РµСЂРЅРѕРІ, РєРѕРјРїРѕРЅРµРЅС‚РѕРІ, РёРЅС‚РµСЂР°РєС†РёР№ Рё РґРёР·Р°Р№РЅ-РїРѕРІРµСЂС…РЅРѕСЃС‚РµР№."
    )
    counts = catalog_counts or {}
    family_labels = [
        f"{item.get('name', 'general')} x{item.get('count', 0)}"
        for item in (catalog_families or [])[:3]
    ]
    stats = "".join(
        f"<div><span>{_escape(label)}</span><strong>{count}</strong></div>"
        for label, count in (
            ("Components", counts.get("components", 0)),
            ("Styles", counts.get("styles", 0)),
            ("Interactions", counts.get("interactions", 0)),
            ("Utilities", counts.get("utilities", 0)),
        )
    )
    return f"""
    <section class="hero catalog-hero">
      <div class="hero__inner">
        <div class="hero-copy">
          <span class="section-kicker">Catalog mode</span>
          <h1 class="hero__title">{title}</h1>
          <p class="hero__subtitle">{subtitle}</p>
          <div class="code-section__meta">
            <span class="code-pill">query</span>
            <span class="code-pill code-pill--muted">{_escape(_shorten(catalog_query or "semantic browsing", 84))}</span>
          </div>
          <div class="code-section__meta">{_catalog_pills((catalog_tags or [])[:5], muted=True)}</div>
        </div>
        <div class="hero-panel">
          <div class="hero-panel__card">
            <span class="hero-panel__label">Inventory</span>
            <strong>Patterns, cards, motions</strong>
            <p>{"Structured browsing with semantic grouping." if locale == "en" else "РЎС‚СЂСѓРєС‚СѓСЂРЅС‹Р№ РїСЂРѕСЃРјРѕС‚СЂ СЃ СЃРµРјР°РЅС‚РёС‡РµСЃРєРѕР№ РіСЂСѓРїРїРёСЂРѕРІРєРѕР№."}</p>
          </div>
          <div class="hero-panel__grid">{stats}</div>
          <div class="hero-panel__card">
            <span class="hero-panel__label">Families</span>
            <div class="code-section__meta">{_catalog_pills(family_labels, muted=True)}</div>
          </div>
        </div>
      </div>
    </section>
    """


def render_catalog_filters(
    locale: str = "en",
    catalog_tags: list[str] | None = None,
    catalog_query_tokens: list[str] | None = None,
    catalog_counts: dict[str, int] | None = None,
    **_: object,
) -> str:
    search_label = "Search patterns" if locale == "en" else "РџРѕРёСЃРє РїР°С‚С‚РµСЂРЅРѕРІ"
    counts = catalog_counts or {}
    filter_buttons = "".join(
        f'<button class="btn btn--ghost">{_escape(category.title())} {count}</button>'
        for category, count in (
            ("components", counts.get("components", 0)),
            ("styles", counts.get("styles", 0)),
            ("interactions", counts.get("interactions", 0)),
        )
    )
    return f"""
    <section class="widgets-section catalog-filters-section">
      <div class="filters-bar">
        <input class="filter-input" placeholder="{search_label}" />
        {filter_buttons}
        <a href="#" class="btn btn--primary">Apply filters</a>
      </div>
      <div class="code-section__meta">{_catalog_pills((catalog_query_tokens or [])[:6], muted=True)}</div>
      <div class="code-section__meta">{_catalog_pills((catalog_tags or [])[:6])}</div>
    </section>
    """


def render_catalog_list(
    cards_count: int = 6,
    locale: str = "en",
    catalog_entries: list[dict[str, object]] | None = None,
    **_: object,
) -> str:
    entries = catalog_entries or []
    if entries:
        cards = []
        for index, entry in enumerate(entries[: max(4, min(12, cards_count))]):
            tokens = [str(token) for token in entry.get("matchedTokens", [])][:4]
            tags = [str(tag) for tag in entry.get("tags", [])][:4]
            cards.append(
                f"""
                <article class="feature-card catalog-card">
                  <span class="feature-card__index">#{index + 1}</span>
                  <h3>{_escape(entry.get("name", "Catalog entry"))}</h3>
                  <p>{_escape(str(entry.get("summary", "")))}</p>
                  <div class="code-section__meta">
                    <span class="code-pill">{_escape(entry.get("category", "component"))}</span>
                    <span class="code-pill code-pill--muted">{_escape(entry.get("family", "general"))}</span>
                    <span class="code-pill code-pill--muted">score {entry.get("score", 0)}</span>
                  </div>
                  <div class="code-section__meta">{_catalog_pills(tokens or tags, muted=True)}</div>
                  <pre class="catalog-code"><code>{_escape(str(entry.get("payload", "")) or "semantic payload")}</code></pre>
                </article>
                """
            )
        return f"""
        <section class="features-section catalog-list-section">
          <div class="section-heading">
            <div>
              <span class="section-kicker">Library</span>
              <h2>{"Retrieved entries" if locale == "en" else "РќР°Р№РґРµРЅРЅС‹Рµ Р·Р°РїРёСЃРё"}</h2>
            </div>
          </div>
          <div class="features-grid columns-3">{''.join(cards)}</div>
        </section>
        """

    count = max(4, min(12, cards_count))
    titles = _localized_labels(
        locale,
        ["Warm Sand Cards", "Glass Overlay Panels", "Offset Stack Tiles", "Metric Ribbon", "Reveal Headers", "Dense Filter Rail"],
        ["РљР°СЂС‚РѕС‡РєРё Warm Sand", "Glass Overlay Panels", "Offset Stack Tiles", "Р›РµРЅС‚Р° РјРµС‚СЂРёРє", "Reveal Headers", "Dense Filter Rail"],
    )
    cards = []
    for index in range(count):
        title = titles[index % len(titles)]
        cards.append(
            f"""
            <article class="feature-card catalog-card">
              <span class="feature-card__index">#{index + 1}</span>
              <h3>{title}</h3>
              <p>{"Semantic design entry with tags, preview metadata, and reusable surface behavior." if locale == "en" else "РЎРµРјР°РЅС‚РёС‡РµСЃРєР°СЏ Р·Р°РїРёСЃСЊ РґРёР·Р°Р№РЅР° СЃ С‚РµРіР°РјРё, preview-РјРµС‚Р°РґР°РЅРЅС‹РјРё Рё РїРµСЂРµРёСЃРїРѕР»СЊР·СѓРµРјС‹Рј РїРѕРІРµРґРµРЅРёРµРј РїРѕРІРµСЂС…РЅРѕСЃС‚Рё."}</p>
              <div class="code-section__meta">
                <span class="code-pill">component</span>
                <span class="code-pill code-pill--muted">catalog</span>
              </div>
            </article>
            """
        )
    return f"""
    <section class="features-section catalog-list-section">
      <div class="section-heading">
        <div>
          <span class="section-kicker">Library</span>
          <h2>{"Reusable entries" if locale == "en" else "РџРµСЂРµРёСЃРїРѕР»СЊР·СѓРµРјС‹Рµ Р·Р°РїРёСЃРё"}</h2>
        </div>
      </div>
      <div class="features-grid columns-3">{''.join(cards)}</div>
    </section>
    """


def render_catalog_detail(
    locale: str = "en",
    catalog_primary: dict[str, object] | None = None,
    catalog_motion_level: str = "none",
    **_: object,
) -> str:
    if catalog_primary:
        tags = [str(tag) for tag in catalog_primary.get("tags", [])][:6]
        tokens = [str(tag) for tag in catalog_primary.get("matchedTokens", [])][:6]
        meta = [
            f"category: {catalog_primary.get('category', 'component')}",
            f"family: {catalog_primary.get('family', 'general')}",
            f"motion: {catalog_motion_level}",
            f"score: {catalog_primary.get('score', 0)}",
        ]
        return f"""
        <section class="widgets-section catalog-detail-section">
          <div class="widget-card">
            <span class="section-kicker">Detail</span>
            <h3>{_escape(catalog_primary.get("name", "Focused preview"))}</h3>
            <p>{_escape(str(catalog_primary.get("summary", "")))}</p>
            <div class="code-section__meta">{_catalog_pills(meta, muted=True)}</div>
            <div class="code-section__meta">{_catalog_pills(tokens or tags)}</div>
            <pre class="catalog-code"><code>{_escape(str(catalog_primary.get("payload", "")) or "semantic payload")}</code></pre>
          </div>
        </section>
        """

    title = "Focused preview" if locale == "en" else "Р¤РѕРєСѓСЃРЅС‹Р№ РїСЂРѕСЃРјРѕС‚СЂ"
    description = (
        "Inspect semantic tags, source tokens, motion presets, and structural notes for the selected entry."
        if locale == "en"
        else "РџСЂРѕСЃРјР°С‚СЂРёРІР°Р№С‚Рµ semantic tags, source tokens, motion presets Рё СЃС‚СЂСѓРєС‚СѓСЂРЅС‹Рµ Р·Р°РјРµС‚РєРё РґР»СЏ РІС‹Р±СЂР°РЅРЅРѕР№ Р·Р°РїРёСЃРё."
    )
    return f"""
    <section class="widgets-section catalog-detail-section">
      <div class="widget-card">
        <span class="section-kicker">Detail</span>
        <h3>{title}</h3>
        <p>{description}</p>
        <div class="code-section__meta">
          <span class="code-pill">semantic-tag</span>
          <span class="code-pill">source-tokens</span>
          <span class="code-pill code-pill--muted">motion</span>
        </div>
      </div>
    </section>
    """


STATIC_TEMPLATES = {
    "hero_default": render_hero(),
    "cta_default": render_cta(),
    "footer_default": render_footer(),
    "sidebar_default": render_sidebar(),
    "header_default": render_header(),
    "table_default": render_table(),
    "widgets_default": render_widgets(),
    "article_header_default": render_article_header(),
    "content_body_default": render_content_body(),
    "testimonials_default": render_testimonials(),
    "pricing_default": render_pricing(),
    "faq_default": render_faq(),
    "docs_nav_default": render_docs_nav(),
    "code_block_default": render_code_block(),
    "stats_default": render_stats(),
    "features_default": render_features(),
    "charts_default": render_charts(),
    "filters_default": render_filters(),
    "catalog_header_default": render_catalog_header(),
    "catalog_filters_default": render_catalog_filters(),
    "catalog_list_default": render_catalog_list(),
    "catalog_detail_default": render_catalog_detail(),
}

SECTION_TEMPLATES = {
    **STATIC_TEMPLATES,
    "hero_render": render_hero,
    "docs_nav_render": render_docs_nav,
    "code_block_render": render_code_block,
    "stats_render": render_stats,
    "features_render": render_features,
    "sidebar_render": render_sidebar,
    "header_render": render_header,
    "table_render": render_table,
    "widgets_render": render_widgets,
    "article_header_render": render_article_header,
    "content_body_render": render_content_body,
    "testimonials_render": render_testimonials,
    "pricing_render": render_pricing,
    "faq_render": render_faq,
    "cta_render": render_cta,
    "footer_render": render_footer,
    "charts_render": render_charts,
    "filters_render": render_filters,
    "catalog_header_render": render_catalog_header,
    "catalog_filters_render": render_catalog_filters,
    "catalog_list_render": render_catalog_list,
    "catalog_detail_render": render_catalog_detail,
}
