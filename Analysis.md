# Abstract UI Engine Analysis

## Summary

Current generation quality is limited not by a single bug, but by a chain of weak decisions across retrieval, planning, slot assignment, and rendering.

The system already does some parts reasonably well:

- semantic search can often find relevant local entries
- Russian and mixed-language queries are at least partially recognized
- the new `Semantic Configurator` can infer parameters in a useful way
- MMSS reporting and debug export give enough visibility to inspect output quality

The weak point is the conversion from "good local hints" into "strong full-page assembly".

In practice, the engine often does this:

1. finds some relevant micro-components
2. over-trusts those micro-components as if they were full sections
3. reuses similar patterns across multiple slots
4. fills the rest with fallback structure
5. produces a page that is technically assembled, but visually weak and semantically shallow

## Main Reasons The Page Looks Weak

### 1. Retrieval returns many atomic fragments, not enough section-level building blocks

A large share of the lexicon is still composed of:

- button variants
- card variants
- accent modifiers
- size modifiers
- hover refinements

These are useful as enrichments, but they are not enough to build:

- a complete hero
- a complete feature grid
- a full pricing section
- a convincing catalog shell
- a documentation content flow

When the system promotes such fragments into primary slot winners, the result becomes "a page made of pieces" instead of "a page made of sections".

### 2. Slot planning is still too permissive

Even after recent fixes, the planner can still accept candidates that are semantically related but structurally too small for a major slot.

Examples:

- a CTA button can still be semantically close to a hero request
- a product card can still be semantically close to a catalog or feature request
- a testimonial card can still be semantically close to a social-proof block

This is a classic retrieval-to-assembly mismatch:

- retrieval asks: "is this related?"
- planner should ask: "is this large enough and structurally suitable?"

Right now the first question is stronger than the second.

### 3. The archetype decision is still weaker than it should be

The UI now stays in adaptive `Auto`, which is correct from a product standpoint.

However, the actual backend archetype decision is still mostly heuristic inside [backend/query_parser.py](D:\WORK\semantic-ui-genesis-engine\backend\query_parser.py):

- keyword-based
- phrase-based
- not truly ranked by BGE-M3 against archetype prototypes

So the system can still choose:

- `landing` when the query is closer to `catalog`
- `landing` when the query is closer to `docs`
- generic page flow when the query actually needs a specific information architecture

Once the wrong archetype is selected, the rest of the pipeline is already handicapped.

### 4. The lexicon is rich in style/detail, but not rich enough in complete page grammar

The project has many entries for:

- styles
- interactions
- utilities
- component variants

But it still lacks enough retrieval-friendly entries for:

- full hero families
- full feature section families
- full comparison sections
- full product rails
- full documentation article bodies
- full faceted catalog layouts
- full dashboard workspace patterns

In other words:

- the engine knows a lot about local surface treatment
- it knows less about complete page semantics

This creates nice-looking fragments inside weak page composition.

### 5. Fallbacks are still doing too much of the real work

Fallbacks are useful as safety nets, but currently they are often the true page backbone.

That creates two visible problems:

- many outputs share the same structural skeleton
- retrieved entries decorate the skeleton rather than define it

This is why pages can feel repetitive even when query wording changes.

### 6. No strong negative selection logic

The system recently improved positive scoring, but negative screening is still limited.

What is still missing:

- "this entry is relevant but too small"
- "this entry is relevant but belongs to another slot type"
- "this entry is a modifier, not a section"
- "this entry is too similar to something already used"
- "this entry conflicts with the chosen page grammar"

Without strong rejection logic, generic relevant entries keep leaking into major slots.

### 7. Reuse pressure is still too high

Even with recent penalties, the engine still has a tendency to reuse:

- the same family
- the same visual logic
- the same card grammar
- the same button language

That makes pages feel narrow and repetitive.

This is especially visible when:

- hero
- features
- pricing
- CTA

all feel like variations of the same retrieved source family.

### 8. Query understanding is broader than query grounding

The system often understands the *topic* of the query, but not the *build intent hierarchy*.

Example:

The query may clearly imply:

- page type
- information architecture
- section order
- density
- number of clusters
- color direction
- interaction tone

But the engine mainly uses the query to:

- rank entries
- extract some counts
- infer some motion hints

What is still weak is explicit grounding of the query into a structured page plan before assembly.

### 9. The engine lacks a true section-composition layer

Right now it mostly does:

- retrieve candidate
- use candidate or fallback

What it does not yet do strongly enough:

- retrieve section shell
- retrieve optional content pattern
- retrieve style layer
- retrieve interaction layer
- fuse them into a coherent section recipe

This missing composition layer is one of the biggest reasons pages feel shallow.

### 10. MMSS is observing more than controlling

MMSS is useful today as:

- debug feedback
- ranking signal
- quality visibility

But it still does not strongly drive assembly decisions.

So the system can generate something with decent MMSS numbers while still feeling weak as a product page.

This happens because:

- MMSS measures structural/semantic quality dimensions
- users judge page usefulness, hierarchy, visual richness, and completeness

These are overlapping, but not identical.

## Why Semantic Configurator Feels Better Than Final Generation

The configurator works relatively well because parameter inference is easier than section synthesis.

It solves:

- classification
- preference inference
- value selection

It does not solve:

- full-page structure
- section realism
- compositional depth
- retrieval-to-layout fusion

So it is normal that:

- `Semantic Configurator` looks smart
- final page output still looks weak

The difficult part is not selecting settings.
The difficult part is turning those settings into strong assembled HTML sections.

## Most Important Improvement Directions

### 1. Move from entry retrieval to section retrieval

The engine needs more first-class entries for:

- heroes
- feature grids
- pricing sections
- testimonials sections
- dashboards
- docs content sections
- catalogs
- sidebars
- search/filter panels

Each such entry should be a real section candidate, not a modifier or local component.

This is the single highest-value improvement.

### 2. Split lexicon into explicit levels

Introduce hard semantic levels:

- `section`
- `component`
- `modifier`
- `interaction`
- `utility`

Then planner rules become much cleaner:

- major slots prefer `section`
- secondary slots allow `component`
- enrichments use `modifier` / `interaction`

This would remove a large amount of accidental weak assembly.

### 3. Replace heuristic archetype selection with embedding-based archetype classification

Instead of only keyword inference, create archetype prototypes and compare the query against:

- landing
- dashboard
- docs
- catalog
- settings
- profile
- commerce

This can be done with BGE-M3 directly.

Expected benefit:

- better slot plan
- better fallback template choice
- better retrieval hinting

### 4. Add a section planner before retrieval

Do not immediately jump from query to slot filling.

Insert an intermediate plan:

- detected page type
- target sections
- section order
- density per section
- expected content counts
- style direction
- interaction direction

Then retrieval should be constrained by that plan.

This is likely the second highest-value architectural change after section-level lexicon enrichment.

### 5. Add hard disqualification rules for major slots

For large slots, reject candidates if they are:

- single button fragments
- single card variants
- accent-only variants
- size-only variants
- entries without enough semantic depth

This should be stricter than current heuristics.

### 6. Add family diversity rules

The system should avoid building the whole page from one narrow family.

Useful constraints:

- limit same-family dominance across major slots
- prefer complementary families
- penalize repeated atomics
- prefer layout variety with stylistic coherence

### 7. Build section fusion explicitly

Instead of selecting one winner per slot, try:

- base section shell
- content pattern
- style enhancement
- interaction enhancement

This is not the same as current fallback hybrid mode.

It should be an explicit structured merge pipeline.

### 8. Strengthen multilingual grounding

Russian query support improved, but it still should be more robust in:

- archetype classification
- section-type classification
- color/style semantics
- content intent extraction

This likely needs:

- more Russian synonym expansion
- more bilingual prototype texts
- more mixed-language training texts in the lexicon descriptions

### 9. Introduce quality gates for completeness, not only relevance

A page should not be accepted as "good enough" only because entries are semantically related.

Add assembly-level completeness checks:

- does the page have enough content mass
- do major sections feel section-sized
- is there visual hierarchy progression
- is there variation between slots
- is the page closer to a product page than a component showcase

### 10. Make MMSS part of candidate rejection, not only scoring

MMSS should help reject:

- structurally thin candidates
- noisy fragments
- weak wrappers
- unstable markup patterns

But it must not become another rigid stereotype gate.

Best use:

- MMSS as quality-aware penalty/rejection layer
- not as a semantic-definition layer

## Recommended Implementation Roadmap

### Phase 1: Stabilize Retrieval and Slot Semantics

Do next:

1. Introduce explicit lexicon levels (`section`, `component`, `modifier`, `interaction`, `utility`)
2. Enforce section-only preference for major slots
3. Add stronger atomic-fragment rejection
4. Add family diversity penalties
5. Add repeated-component penalties in debug output

Expected result:

- fewer weak buttons/cards in hero/features slots
- less repetitive page structure

### Phase 2: Improve Page-Type and Section Planning

Do next:

1. Replace keyword archetype parser with BGE-based prototype classification
2. Add intermediate page plan generation
3. Map query counts and intent to specific section plan objects
4. Use that plan to guide retrieval

Expected result:

- better matching between query intent and page skeleton
- fewer wrong `landing` outputs for catalog/docs/dashboard intent

### Phase 3: Enrich Lexicon with Section-Scale Entries

Do next:

1. Add complete hero entries
2. Add complete feature-section entries
3. Add complete pricing entries
4. Add complete docs body entries
5. Add complete catalog list/detail/filter entries
6. Add dashboard workspace shells and data sections

Expected result:

- much stronger page realism
- less dependence on fallback structure

### Phase 4: Compose Sections Instead of Replacing Them

Do next:

1. implement section shell + enrichment composition
2. allow style/interactions to decorate a strong section base
3. keep slot-specific composition rules

Expected result:

- richer but still coherent pages
- less brittle retrieval

## What To Watch In Debug Reports

When testing future changes, track these indicators:

- top hits should include more `layouts` and section-sized `components`
- `hero`, `features`, `catalog_list`, `pricing` should not resolve to single-button or tiny-card fragments
- repeated `componentId` across major slots should become rare
- fallback usage should decrease for strong query types
- retrieved candidates should show more slot-specific relevance, less generic overlap

## Final Conclusion

The current weakness is not that the engine "does not understand the query".

The deeper problem is:

- it retrieves many semantically related items
- but it still lacks a strong model of page-scale composition

So the next major quality jump will not come from small UI tweaks.
It will come from:

- stronger section-level lexicon design
- better archetype classification
- explicit page planning
- stricter slot semantics
- composition-aware assembly

Until those are improved, the engine will continue to produce pages that are "technically plausible" but "visually underdeveloped".
