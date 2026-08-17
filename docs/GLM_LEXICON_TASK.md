# GLM Lexicon Enrichment Task

## Repository

- GitHub: `https://github.com/kleafrog-source/abstract-ui-engine`
- Branch target: `main` unless a separate working branch is created

## Objective

Expand and improve the semantic lexicon for **Abstract UI Engine** without breaking the current retrieval and assembly pipeline.

The current system already contains:

- BGE-M3/Ollama semantic retrieval
- archetype auto-classification
- page planning per slot
- section-first retrieval for major slots
- `retrieved_fused` section recipes
- lexicon quality metadata:
  - `meta.entity_level`
  - `meta.section_capable`
  - `meta.section_richness`
  - `meta.low_value_fragment`
  - `meta.micro_fragment`
  - `meta.retrieval_weight`

The next task is **not** to rewrite the engine.  
The task is to make the lexicon substantially more useful for full-page generation.

## Current Problem

The lexicon is large, but a significant part of it is still weak for major-slot retrieval.

Common problems:

- too many atomic fragments
- too many placeholders and low-value entries like skeletons / empty states / tiny controls
- too few rich section-scale HTML blocks
- many entries are visually interesting but structurally weak
- many component entries do not help assemble full hero/features/pricing/catalog/docs sections

As a result:

- retrieval can find relevant things
- but section assembly still falls back too often
- or `retrieved_fused` relies on small fragments instead of strong section blocks

## High-Priority Goal

Increase the amount and quality of **retrieval-friendly section-capable entries**.

This means adding and improving entries for:

- hero sections
- feature grids
- pricing sections
- testimonial/social-proof sections
- dashboard stats areas
- filter toolbars
- chart sections
- table/list sections
- docs article bodies
- docs nav / table-of-contents sections
- catalog headers
- catalog listing grids
- catalog detail panels
- dashboard sidebars / headers

## Hard Constraints

Do not remove or break:

- `backend/assembly.py`
- `backend/page_planner.py`
- `backend/search_engine.py`
- `backend/semantic_config.py`
- `backend/mmss_bridge.py`
- `run_app.py`

Do not revert the current architecture back to:

- keyword-only selection
- simple fallback-only assembly
- direct component-only slot filling

Do not generate more noisy lexicon mass like:

- repeated tiny button variants
- repeated empty-state permutations
- repeated skeleton permutations
- repeated placeholder permutations
- trivial hover/focus/selected clones with no section value

## What To Add

### 1. Rich Section Entries

Add real HTML section entries with meaningful internal structure:

- heading/subheading rhythm
- grouped content blocks
- CTA clusters where appropriate
- nested cards / lists / info groups
- realistic section density
- real semantic tags when useful, but not dogmatic

Each section entry should be usable as a major slot candidate.

### 2. Strong Families

Expand coherent families such as:

- `showcase-system`
- `catalog-system`
- `content-system`
- `nav-system`
- `bento`
- `minimal-flat`
- `editorial-expressive`
- other high-value families only if they are internally coherent

The family should help cross-slot composition, not create chaos.

### 3. Retrieval-Friendly Descriptions

Every added entry must have:

- strong `semantic_description`
- useful `tags`
- a real `family`
- realistic HTML
- optional CSS if needed

Descriptions must mention:

- purpose
- structure
- visual direction
- usage context

Example:

- not just “card grid”
- but “feature comparison grid with 6 benefit cards, eyebrow label, concise descriptions, two-column tablet collapse, and product-marketing rhythm”

### 4. Better Coverage For Russian / Mixed Queries

The engine already expands Russian queries, but the lexicon should help more.

When creating semantic descriptions and tags:

- preserve strong English retrieval wording
- add enough concept clarity so mixed Russian/English user queries still retrieve the right section

Do not translate all descriptions to Russian.  
Keep semantic retrieval quality first.

## What To Reduce / Avoid

Mark or avoid adding entries that are primarily:

- placeholder UI
- command palette variations
- chip-only snippets
- badge-only snippets
- tiny icon-only controls
- single button variants
- single-line toggles
- decorative-only wrappers with no structural content

If such entries exist and are obviously low-value, prefer:

- removing them from future additions
- or moving them into lower-priority enrichment usage

## Desired Output Shape

The lexicon should become stronger in this direction:

- fewer atomic primary candidates
- more section-level primary candidates
- more meaningful section-to-section family continuity
- more useful support modules for `retrieved_fused`

The end result should improve:

- `majorRetrievedSlots`
- `fusedSlots`
- `sectionFirstSlots`
- reduced fallback pressure

## Files Most Likely To Be Edited

- `data/lexicon/components.json`
- `data/lexicon/layouts.json`
- `data/lexicon/styles.json` only if genuinely needed
- `data/lexicon/typography.json` only if genuinely needed
- `data/lexicon/interactions.json` only if genuinely needed
- `data/lexicon/utilities.json` only if genuinely needed

Prefer improving `components.json` and `layouts.json` first.

## Validation Requirements

After lexicon edits:

1. Rebuild embeddings cache if needed.
2. Run local generation checks with several queries:
   - landing
   - dashboard
   - docs
   - catalog
   - mixed Russian/English query
3. Confirm that retrieval now surfaces more section-scale candidates.
4. Confirm that generated pages show less repetition and less fallback dependence.

## Suggested Test Queries

- `Create travel booking page with 6 destination cards, 3 filters, orange CTA buttons, aqua chips, sand panels`
- `Сделай dashboard для онлайн-обучения с календарём, блоком достижений, 4 KPI карточками и двумя таблицами`
- `Build docs portal with 5 navigation groups, 3 code examples, release notes sidebar, calm graphite + sky palette`
- `Сделай catalog page с 8 product cards, sidebar filters, compact comparison panel и выразительным hero-intro`

## Deliverable Format

When done, provide:

1. Short summary of what was added to the lexicon
2. Which files were changed
3. Which families/section types were expanded
4. Which low-value patterns were intentionally avoided
5. Example queries that improved after the update

## Important Note

Do not optimize for raw lexicon count.  
Optimize for **retrieval usefulness per entry** and **section assembly quality**.
