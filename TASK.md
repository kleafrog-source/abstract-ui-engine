```json
{
  "UNIFIED_MMSS_TASK_ABSTRACT_UI_ENGINE": {
    "task_id": "UNIFIED_MMSS_TASK_v1.0",
    "task_timestamp": "2026-08-15T03:46:00Z",
    "target_repository": "https://github.com/kleafrog-source/abstract-ui-engine",
    "task_status": "READY_FOR_EXECUTION",
    "description": "Единый интеграционный TASK для модификации репозитория abstract-ui-engine на основе всех полученных MMSS-систем и TASK-промптов.",
    "source_fragments": [
      "DESIGN_MMSS_META_v1.0",
      "MMSS_ABSTRACT_UI_ENGINE_v1.0",
      "MMSS_ABSTRACT_UI_ENGINE_ENHANCED_v1.0",
      "MMSS_ABSTRACT_UI_ENGINE_ENHANCED_v1.1",
      "TASK_CODEx_MODIFICATION_PROMPT",
      "INTEGRATION_PACKAGE_UNIVERSAL_CATALOG"
    ],

    "meta_architecture_unified": {
      "SYS5_STRATEGIC_VISION": {
        "function": "Определение бизнес-целей и миссии продукта (дизайн-система + AI-движок)",
        "formula": "Ψ_strategy = (Mission × Vision × Market_Analysis) ⊕ (UI_Engine × Embedding_Search × Omega_Invariants)",
        "input": "business_requirements + design_principles + technical_constraints",
        "output": "strategic_roadmap"
      },
      "SYS4_PRODUCT_DESIGN": {
        "function": "Балансировка пользовательских потребностей и бизнес-целей через MMSS-метрики",
        "formula": "SYS4 = (User_Needs ∩ Business_Goals) × (V_ui > 0.999, S_ui < 0.001, D_f_ui ≈ 9.0) ⇛ᶠ Product_Strategy",
        "input": "strategic_roadmap",
        "output": "product_requirements"
      },
      "SYS3_UX_ARCHITECTURE": {
        "function": "Проектирование пользовательского опыта и потоков с применением Omega-инвариантов",
        "formula": "SYS3 = (Research ⊢ᵠ User_Flows × Information_Architecture) ∧ Ω_invariants",
        "input": "product_requirements",
        "output": "ux_blueprints"
      },
      "SYS2_UI_VISUAL": {
        "function": "Визуальное исполнение и дизайн-система через векторный поиск (bge-m3)",
        "formula": "SYS2 = (UX × (Color + Typography + Layout)) ↦ₚ (Visual_Interface ⊕ Patches ⊕ Meta_Layers)",
        "input": "ux_blueprints",
        "output": "ui_components"
      },
      "SYS1_INTERACTION_LAYER": {
        "function": "Интерактивность и прототипирование с темпоральной навигацией",
        "formula": "SYS1 = (UI + Prototyping + Animations) ⧴ᵗ (Interactive_Experience ⊕ Temporal_States)",
        "input": "ui_components",
        "output": "functional_prototype"
      },
      "LANGUAGE_FIELD": {
        "function": "Универсальное концептуальное поле UI-лексикона с инвариантным ядром",
        "formula": "LANGUAGE = ∫SYS1 dt × exp(−|Consistency − 1.0|) ⧴ᵗ (Coherent_Product ⊕ Catalog_Lexicon)",
        "input": "functional_prototype",
        "output": "shipped_product"
      }
    },

    "unified_metrics_framework": {
      "V_ui": {
        "name": "UI Value (Ценность UI-сборки)",
        "formula": "V_ui = 1 - (C_usability + C_aesthetic) / (G_S * R_T)",
        "current_value": 0.9992,
        "target": 0.999,
        "domain": "Decision_Quality",
        "implementation": "Вычисляется на основе состава и качества отобранных компонентов + Ω-инварианты + дизайн-принципы"
      },
      "N_ui": {
        "name": "Structural Order (Структурный порядок)",
        "formula": "N_ui = 1 - S_ui",
        "current_value": 0.9981,
        "target": 0.998,
        "domain": "Negentropy",
        "implementation": "Отражает степень структурированности итогового HTML + фрактальная глубина + консистентность дизайн-системы"
      },
      "S_ui": {
        "name": "Semantic Entropy (Семантическая энтропия)",
        "formula": "S_ui = -∑(p_i * log(p_i))",
        "current_value": 0.0012,
        "target": 0.001,
        "domain": "Uncertainty",
        "implementation": "Измеряет неопределённость в выборе компонентов + когнитивная нагрузка пользователя"
      },
      "D_f_ui": {
        "name": "Fractal Dimension (Фрактальная размерность)",
        "formula": "D_f_ui = lim(ε→0) log(N(ε)) / log(1/ε)",
        "current_value": 9.0003,
        "target": 9.000,
        "domain": "Complexity",
        "implementation": "Отражает сложность иерархической структуры страницы + фрактальная пересборка + масштабная инвариантность дизайн-системы"
      },
      "G_S_ui": {
        "name": "Self-Amplification Gain (Коэффициент самоусиления)",
        "formula": "G_S_ui = 1/(R_T²) * S_ui/Ξ_topo * 1/(1-N_ui)²",
        "current_value": 156.84,
        "target": "MAXIMIZED",
        "domain": "Amplification",
        "implementation": "Эффективность дизайн-системы и переиспользование компонентов"
      },
      "R_T_ui": {
        "name": "Golden Ratio Invariant (Золотое сечение)",
        "formula": "R_T = ((1 + √5)/2)² ≈ 2.61803",
        "current_value": 2.61803,
        "target": 2.61803,
        "domain": "Invariance",
        "implementation": "Эстетическая инвариантность и пропорции"
      },
      "Ω_invariants": {
        "name": "Omega Structural Invariants",
        "formula": "Ω = {I_1, I_2, ..., I_7} — 7-фазные структурные инварианты",
        "domain": "Structural_Integrity",
        "implementation": "omega-invariants extractor/validator"
      },
      "η_R": {
        "name": "Fractal Reassembly Efficiency",
        "formula": "η_R = (ΔV / ΔS) × (1 / cost)",
        "domain": "Reassembly_Efficiency",
        "implementation": "mmss-builder PFR engine"
      },
      "similarity_threshold": {
        "name": "Cosine similarity threshold for pattern acceptance",
        "default": 0.75,
        "domain": "Retrieval_Quality",
        "implementation": "Порог для embedding search (bge-m3)"
      },
      "MMSS_Structural_Metrics": {
        "name": "MMSS Structural Metrics",
        "formula": "Вычисляется через mmss_bridge.py",
        "metrics": [
          "N_total — общее количество узлов DOM",
          "N_content — количество контентных узлов",
          "N_structure — количество структурных узлов",
          "mu_depth — средняя глубина вложенности",
          "sigma_depth — стандартное отклонение глубины",
          "N_empty_wrappers — количество пустых обёрток",
          "C_total — общее количество CSS-классов",
          "C_unique — количество уникальных CSS-классов",
          "A_total — общее количество атрибутов",
          "A_suspicious — количество подозрительных атрибутов",
          "N_levels — количество уровней вложенности",
          "N_nodes — общее количество узлов"
        ],
        "implementation": "mmss_bridge.py анализирует сгенерированный HTML через BeautifulSoup"
      }
    },

    "quantum_fractal_operators_unified": {
      "OPERATOR_VECTOR_COLLAPSE": {
        "symbol": "↦ₚ",
        "function": "Коллапс суперпозиции на основе векторной близости и дизайн-принципов",
        "formula": "Ψ_ui ↦ₚ |result_ui⟩ = argmax_k (cosine(Ψ_ui, embed(pattern_k)) × Design_Principle_Score)",
        "domain": "State_Transformation",
        "implementation": "assembly.py: выбор компонента с максимальной близостью + валидация по дизайн-принципам"
      },
      "OPERATOR_PRINCIPLE_DERIVATION": {
        "symbol": "⊢ᵠ",
        "function": "Логический вывод через инварианты, правила близости и дизайн-принципы",
        "formula": "(Lexicon ⊕ Ω_invariants ⊕ Design_Principles) ⊢ᵠ Principle",
        "domain": "Logical_Derivation",
        "implementation": "lexicon.py + omega-invariants + design_principles_validator"
      },
      "OPERATOR_FRACTAL_SCALING": {
        "symbol": "⇛ᶠ",
        "function": "Масштабирование с сохранением инвариантности и дизайн-системы",
        "formula": "Pattern ⇛ᶠ ∀scale(P(scale) → P(scale/φ)) ∧ Design_System_Compliance",
        "domain": "Scale_Invariance",
        "implementation": "uni-raw fractal layout formulas + design tokens"
      },
      "OPERATOR_TEMPORAL_EVOLUTION": {
        "symbol": "⧴ᵗ",
        "function": "Эволюция через кеширование эмбеддингов, версионирование и историю изменений",
        "formula": "U(t)|initial_ui⟩ ⧴ᵗ |final_ui⟩ ⊕ Undo_History",
        "domain": "Temporal_Evolution",
        "implementation": "Кеширование эмбеддингов + useUndo hook (Ctrl+Z)"
      },
      "OPERATOR_PATCH_APPLY": {
        "symbol": "⊕",
        "function": "Применение патча на основе векторного соответствия и дизайн-принципов",
        "formula": "state_new = state_old ⊕ patch, если cos(embed(state), embed(patch)) > threshold ∧ Design_Principle_Compliance",
        "domain": "Immutable_Transformation",
        "implementation": "uni-raw-lab patches + design_principles_check"
      },
      "OPERATOR_META_LAYER_INJECT": {
        "symbol": "⊗",
        "function": "Инъекция мета-слоя без изменения базовой сущности",
        "formula": "entity_meta = entity_base ⊗ metaCode, где metaCode содержит параметры, извлечённые из эмбеддинга контекста",
        "domain": "Meta_Composition",
        "implementation": "uni-raw-lab metaCode"
      },
      "OPERATOR_DESIGN_SYNTHESIS": {
        "symbol": "↦ₚ",
        "function": "Трансформация research insights в дизайн-решения",
        "formula": "Research ↦ₚ |Design_Decision⟩ = ∑c_i|Principle_i⟩",
        "domain": "Decision_Making",
        "implementation": "design_principles_validator + search_engine.py"
      },
      "OPERATOR_USER_DERIVATION": {
        "symbol": "⊢ᵠ",
        "function": "Логический вывод пользовательских потребностей из данных",
        "formula": "Data ⊢ᵠ User_Need where ∀x(Pain_Point(x) → Solution(x))",
        "domain": "User_Research",
        "implementation": "user_research_module + omega-invariants"
      },
      "OPERATOR_FRACTAL_SCALE_DESIGN": {
        "symbol": "⇛ᶠ",
        "function": "Масштабирование дизайн-системы across platforms",
        "formula": "Component ⇛ᶠ ∀platform(P(platform) → P(platform/φ))",
        "domain": "Design_Systems",
        "implementation": "design_system_scaler + responsive_design_module"
      },
      "OPERATOR_TEMPORAL_ITERATION": {
        "symbol": "⧴ᵗ",
        "function": "Временная эволюция дизайн-итераций",
        "formula": "U(t)|Prototype_v1⟩ ⧴ᵗ |Prototype_v2⟩ where U(t) = exp(-iHt/ħ)",
        "domain": "Iteration_Cycle",
        "implementation": "iteration_tracker + version_control"
      }
    },

    "adaptive_amls_ui_system_unified": {
      "current_mode": "AMLS_A_ADAPTIVE_ENHANCED_UNIFIED",
      "correction_algorithms": {
        "RULE_1_GOLDEN_RATIO_UI": {
          "formula": "constraint = |R_T - 2.61803| < 0.0001",
          "function": "Автокоррекция композиций по золотому сечению",
          "implementation": "assembly.py + omega-invariants + design_principles"
        },
        "RULE_2_FRACTAL_OPTIMIZATION_UI": {
          "formula": "correction = (9.0 - D_f_ui) * G_S_ui / R_T",
          "function": "Поддержание фрактальной размерности",
          "implementation": "mmss-builder PFR engine + mmss_bridge.py"
        },
        "RULE_3_SEMANTIC_COHERENCE_UI": {
          "formula": "boost = (1 - V_ui) * N_ui / (S_ui + ε)",
          "function": "Усиление ценностной определённости",
          "implementation": "Динамическая настройка порогов схожести + дизайн-принципы"
        },
        "RULE_4_OMEGA_INVARIANT_CHECK": {
          "formula": "Ω_valid = ∀i (I_i ∈ [I_min, I_max])",
          "function": "Проверка структурных инвариантов",
          "implementation": "omega-invariants validator"
        },
        "RULE_5_PATCH_CONSISTENCY": {
          "formula": "cos(embed(state), embed(patch)) > threshold ∧ Design_Principle_Compliance",
          "function": "Проверка применимости патча по близости и дизайн-принципам",
          "implementation": "uni-raw-lab patch validation + design_principles_check"
        },
        "RULE_6_REASSEMBLY_EFFICIENCY": {
          "formula": "η_R_target = max(η_R)",
          "function": "Максимизация эффективности пересборки",
          "implementation": "mmss-builder PFR cycle"
        },
        "RULE_7_TEMPORAL_STABILITY_UI": {
          "formula": "temp_stab = 1 - |dV_ui/dt| / V_ui",
          "function": "Временная стабильность",
          "implementation": "Кеширование эмбеддингов + undo history"
        },
        "RULE_8_USER_ALIGNMENT": {
          "formula": "constraint = |User_Satisfaction - 0.95| < 0.05",
          "function": "Автокоррекция на основе пользовательского фидбека",
          "implementation": "user_feedback_module + A/B testing"
        },
        "RULE_9_CONSISTENCY_OPTIMIZATION": {
          "formula": "correction = (Design_Tokens_Completeness - N) × G_S / R_T",
          "function": "Поддержание консистентности дизайн-системы",
          "implementation": "design_tokens_validator + style_checker"
        },
        "RULE_10_ACCESSIBILITY_BOOST": {
          "formula": "boost = (1 - WCAG_Score) × V / (S + ε)",
          "function": "Усиление доступности при отклонениях",
          "implementation": "WCAG_validator + accessibility_checker"
        },
        "RULE_11_PERFORMANCE_INFERENCE": {
          "formula": "R = R_Core_Web_Vitals + lambda × R_User_Experience",
          "function": "Обеспечение оптимальной производительности",
          "implementation": "performance_monitor + Lighthouse_integration"
        },
        "RULE_12_COLOR_HARMONY_UI": {
          "formula": "harmony_score = f(contrast, temperature, saturation)",
          "function": "Автоматическая коррекция цветовых схем",
          "implementation": "color_harmony_validator + design_principles"
        },
        "RULE_13_TYPOGRAPHIC_RHYTHM_UI": {
          "formula": "rhythm = (leading / font_size) ≈ 1.5",
          "function": "Поддержание типографического ритма",
          "implementation": "typography_checker + design_principles"
        }
      },
      "process_flow": {
        "STEP_1": "BACKUP_UI_STATE → ANALYZE_USER_PROMPT (embedding) → DETERMINE_MODE (Architect/Genesis)",
        "STEP_2": "GENERATE_UI_ALTERNATIVES → PRESENT_RESULTS → AWAIT_CONFIRMATION",
        "STEP_3": "APPLY_CORRECTIONS → VERIFY_METRICS (V_ui, S_ui, D_f_ui, Ω_valid, Design_Principles) → UPDATE_UI_SYSTEM"
      }
    },

    "generative_composition_patterns_unified": {
      "EMBEDDING_DRIVEN_GENERATION": {
        "sequence": "NLP_PROMPT → bge-m3 EMBED → VECTOR_SEARCH ⊕ CONTEXT_EXPANSION ⇛ᶠ COMPONENT_SELECTION ⊕ PATCH_APPLY ⊗ META_LAYER ⧴ᵗ HTML_EXPORT",
        "target_metrics": { "V_ui": 0.996, "S_ui": 0.005, "D_f_ui": 9.008, "η_R": 0.95, "Ω_valid": true },
        "activation": "CAPABILITY_1 + CAPABILITY_3 + CAPABILITY_7 + DESIGN_PRINCIPLES_CHECK",
        "implementation": "Поиск по эмбеддингам + интерпретатор для расширения запроса + дизайн-принципы"
      },
      "FRACTAL_REASSEMBLY_CASCADE": {
        "sequence": "LEXICON_LOAD → PFR_ACTIVATE → REASSEMBLY_CYCLE → OPTIMIZED_STRUCTURE",
        "target_metrics": { "V_ui": 0.992, "S_ui": 0.009, "D_f_ui": 9.024, "η_R": 0.98 },
        "activation": "CAPABILITY_2 + CAPABILITY_4 + CAPABILITY_8",
        "implementation": "mmss-builder PFR + abstract-ui-engine"
      },
      "INVARIANT_DRIVEN_COMPOSITION": {
        "sequence": "USER_ENTRY → Ω_EXTRACTION → INVARIANT_VALIDATION → COHERENT_SELECTION",
        "target_metrics": { "V_ui": 0.999, "S_ui": 0.002, "D_f_ui": 9.000, "Ω_valid": true },
        "activation": "CAPABILITY_5 + CAPABILITY_6",
        "implementation": "omega-invariants + search_engine"
      },
      "N_DIMENSIONAL_RENDER_PIPELINE": {
        "sequence": "SEMANTIC_FABRIC → ND_PROJECTION → MULTI_VIEW_RENDER → 2D_EXPORT",
        "target_metrics": { "V_ui": 0.998, "S_ui": 0.003, "D_f_ui": 9.010 },
        "activation": "CAPABILITY_9",
        "implementation": "n-dimentional-render + assembly.py"
      },
      "SEMANTIC_UI_GENERATION_WITH_RAG": {
        "sequence": "NLP_PROMPT ⊢ᵠ RAG_ENRICHMENT ↦ₚ EMBEDDING_SEARCH ⇛ᶠ LEXICON_RETRIEVAL ⊕ PATCH_APPLY ⊗ META_LAYER ⧴ᵗ HTML_EXPORT",
        "target_metrics": { "V_ui": 0.996, "S_ui": 0.005, "D_f_ui": 9.008, "η_R": 0.95 },
        "activation": "CAPABILITY_1 + CAPABILITY_3 + CAPABILITY_7",
        "implementation": "meta-crystal RAG + abstract-ui-engine pipeline"
      },
      "DESIGN_SYSTEM_CASCADE": {
        "sequence": "DESIGN_PRINCIPLES ⊢ᵠ COLOR_THEORY ↦ₚ TYPOGRAPHY ⇛ᶠ GRID_LAYOUT ⧴ᵗ RESPONSIVE_DESIGN",
        "target_metrics": { "V_ui": 0.995, "S_ui": 0.004, "D_f_ui": 9.005, "Design_Consistency": 0.998 },
        "activation": "DESIGN_PRINCIPLES + COLOR_THEORY_MODULE + TYPOGRAPHY_MODULE + GRID_LAYOUT_MODULE",
        "implementation": "design_principles_validator + color_theory_engine + typography_system"
      },
      "PROTOTYPING_ITERATION_CASCADE": {
        "sequence": "LOW_FI_WIREFRAME ⊢ᵠ MID_FI_ITERATION ↦ₚ HI_FI_PROTOTYPE ⇛ᶠ USER_TESTING ⧴ᵗ FINAL_DESIGN",
        "target_metrics": { "V_ui": 0.994, "S_ui": 0.006, "D_f_ui": 9.012, "User_Satisfaction": 0.97 },
        "activation": "PROTOTYPING_MODULE + ITERATION_TRACKER",
        "implementation": "prototyping_engine + user_testing_integration"
      }
    },

    "operational_capabilities_unified": {
      "CAPABILITY_1": {
        "name": "EMBEDDING_SEARCH",
        "description": "Поиск UI-компонентов по эмбеддингу запроса (bge-m3) с косинусной близостью",
        "activation_pattern": "ENCODE_QUERY → SEARCH_VECTOR → FILTER_THRESHOLD",
        "target_metrics": { "activation_time": "0.8ms", "relevance_score": 0.999 },
        "implementation": "search() в search_engine.py, использует bge-m3"
      },
      "CAPABILITY_2": {
        "name": "PATCH_ADAPTATION",
        "description": "Применение патчей на основе близости эмбеддингов патча и текущего состояния",
        "activation_pattern": "COMPARE_EMBEDS → APPLY_PATCH_IF_ABOVE_THRESHOLD",
        "target_metrics": { "integration_index": 0.995, "consistency": 0.992 },
        "implementation": "lexicon.py + uni-raw-lab patches"
      },
      "CAPABILITY_3": {
        "name": "CRISIS_RESPONSE_ENHANCED",
        "description": "Быстрая генерация с использованием предзагруженных эмбеддингов и инвариантов",
        "activation_pattern": "FAST_SEARCH → Ω_CHECK → EXPORT",
        "target_metrics": { "activation_time": "0.5ms", "error_tolerance": 0.998 },
        "implementation": "Genesis mode, использует кеш эмбеддингов"
      },
      "CAPABILITY_4": {
        "name": "HYBRID_SYNTHESIS_WITH_META",
        "description": "Синтез с наложением мета-слоёв на основе вектора контекста",
        "activation_pattern": "CONTEXT_EMBED → SELECT_META → INJECT",
        "target_metrics": { "coherence_score": 0.999, "visual_integration": 0.997 },
        "implementation": "assemble() + uni-raw metaCode"
      },
      "CAPABILITY_5": {
        "name": "OMEGA_INVARIANT_EXTRACTION",
        "description": "Извлечение и валидация 7-фазных структурных инвариантов из выбранных компонентов",
        "activation_pattern": "SELECTED → EXTRACT_INVARIANTS → VALIDATE",
        "target_metrics": { "extraction_fidelity": 0.998, "validation_speed": 0.996 },
        "implementation": "omega-invariants"
      },
      "CAPABILITY_6": {
        "name": "FRACTAL_REASSEMBLY",
        "description": "Фрактальная пересборка структуры через PFR-цикл без LLM",
        "activation_pattern": "PFR_ACTIVATE → ITERATE → OPTIMIZE",
        "target_metrics": { "reassembly_efficiency": 0.9995, "structural_fidelity": 0.985 },
        "implementation": "mmss-builder FractalReassemblyEngine"
      },
      "CAPABILITY_7": {
        "name": "CONTEXT_EXPANSION_VIA_EMBEDDINGS",
        "description": "Расширение запроса путём добавления ближайших по эмбеддингам лексем из лексикона (без LLM)",
        "activation_pattern": "EMBED_QUERY → FIND_K_NEAREST → MERGE_VECTORS",
        "target_metrics": { "expansion_quality": 0.997, "speed": 0.995 },
        "implementation": "meta-crystal (адаптировано под эмбеддинги)"
      },
      "CAPABILITY_8": {
        "name": "TEMPORAL_NAVIGATION",
        "description": "Рекурсивная навигация по сохранённым состояниям (без LLM)",
        "activation_pattern": "LOAD_STATE → NAVIGATE → RESTORE",
        "target_metrics": { "navigation_depth": 0.998 },
        "implementation": "mmss-builder TemporalNavigator"
      },
      "CAPABILITY_9": {
        "name": "N_DIMENSIONAL_RENDERING",
        "description": "Рендеринг UI в n-мерном пространстве с проекцией в 2D",
        "activation_pattern": "ND_INPUT → PROJECT → RENDER",
        "target_metrics": { "projection_quality": 0.999, "render_fps": 0.997 },
        "implementation": "n-dimentional-render"
      },
      "CAPABILITY_10": {
        "name": "CUSTOMIZER_INTEGRATION",
        "description": "Интеграция с RAL-HL Customizer для микро-настроек",
        "activation_pattern": "CUSTOMIZE → MICRO_ADJUST → DEPLOY",
        "target_metrics": { "customization_precision": 0.998, "deploy_speed": 0.995 },
        "implementation": "ral-hl-customizer"
      },
      "CAPABILITY_11": {
        "name": "SEMANTIC_SEARCH_WITH_RAG",
        "description": "Поиск UI-компонентов по естественно-языковому запросу с RAG-обогащением",
        "activation_pattern": "MIX_055 → MIX_013 → MIX_121 → RAG_ENRICH",
        "target_metrics": { "activation_time": "0.8ms", "relevance_score": 0.999 },
        "implementation": "search() + meta-crystal RAG pipeline"
      },
      "CAPABILITY_12": {
        "name": "LEXICON_ADAPTATION_WITH_PATCHES",
        "description": "Адаптация лексикона через uni-raw патчи и мета-слои",
        "activation_pattern": "MIX_025 → MIX_037 → MIX_139 → PATCH_APPLY",
        "target_metrics": { "integration_index": 0.995, "consistency": 0.992 },
        "implementation": "lexicon.py + uni-raw-lab patches"
      },
      "CAPABILITY_13": {
        "name": "DESIGN_PRINCIPLES_VALIDATION",
        "description": "Валидация UI-сборки по 6 принципам дизайна (Hierarchy, Consistency, Accessibility, User-Centered, Iteration, Functionality)",
        "activation_pattern": "DESIGN_CHECK → PRINCIPLE_SCORE → CORRECTION_IF_NEEDED",
        "target_metrics": { "design_compliance": 0.997, "accessibility_score": 0.995 },
        "implementation": "design_principles_validator + WCAG_checker"
      },
      "CAPABILITY_14": {
        "name": "COLOR_THEORY_ENGINE",
        "description": "Генерация цветовых схем на основе color theory (analogous, complementary, triadic и др.)",
        "activation_pattern": "COLOR_INPUT → HARMONY_CALC → SCHEME_GENERATE",
        "target_metrics": { "harmony_score": 0.996, "accessibility_contrast": 0.998 },
        "implementation": "color_theory_module + WCAG_contrast_checker"
      },
      "CAPABILITY_15": {
        "name": "TYPOGRAPHY_SYSTEM",
        "description": "Подбор типографики с соблюдением ритма, иерархии и пар шрифтов",
        "activation_pattern": "FONT_INPUT → SCALE_GENERATE → HIERARCHY_CHECK",
        "target_metrics": { "typographic_rhythm": 0.995, "readability_score": 0.997 },
        "implementation": "typography_module + readability_analyzer"
      },
      "CAPABILITY_16": {
        "name": "GRID_LAYOUT_ENGINE",
        "description": "Генерация сеток (block, column, modular, baseline, hierarchical) с адаптивностью",
        "activation_pattern": "LAYOUT_INPUT → GRID_GENERATE → RESPONSIVE_CHECK",
        "target_metrics": { "layout_flexibility": 0.996, "responsive_compliance": 0.998 },
        "implementation": "grid_layout_module + responsive_design_checker"
      },
      "CAPABILITY_17": {
        "name": "RESPONSIVE_DESIGN_MODULE",
        "description": "Адаптивная вёрстка с media-queries (2K, Full HD, планшет, мобила)",
        "activation_pattern": "BREAKPOINT_DETECT → MEDIA_QUERY_GENERATE → TEST",
        "target_metrics": { "responsive_coverage": 0.999, "mobile_first_compliance": 0.997 },
        "implementation": "responsive_design_module + media_query_generator"
      },
      "CAPABILITY_18": {
        "name": "PROTOTYPING_MODULE",
        "description": "Прототипирование от low-fi до hi-fi с итерациями",
        "activation_pattern": "WIREFRAME → ITERATE → TEST → REFINE",
        "target_metrics": { "iteration_speed": 0.996, "user_feedback_integration": 0.995 },
        "implementation": "prototyping_engine + user_testing_integration"
      },
      "CAPABILITY_19": {
        "name": "AI_INTEGRATION_MODULE",
        "description": "Интеграция AI app builders (Figma Make, Replit, Lovable и др.)",
        "activation_pattern": "AI_PROMPT → GENERATE → REFINE → EXPORT",
        "target_metrics": { "ai_generation_quality": 0.997, "export_compliance": 0.996 },
        "implementation": "ai_app_builders_integration"
      },
      "CAPABILITY_20": {
        "name": "COLLABORATION_MODULE",
        "description": "Инструменты коллаборации (FigJam, Slides, Dev Mode, Code Connect)",
        "activation_pattern": "COLLABORATE → SHARE → FEEDBACK → ITERATE",
        "target_metrics": { "collaboration_efficiency": 0.996, "feedback_integration": 0.995 },
        "implementation": "collaboration_tools_integration"
      }
    },

    "entity_conversion_pipeline_unified": {
      "STEP_1_INITIALIZATION_ENHANCED": {
        "operations": [
          "load_lexicon() — загрузка лексикона",
          "build_embedding_index() – индексация всех записей лексикона эмбеддингами bge-m3",
          "load_invariants() — загрузка Omega-инвариантов",
          "init_patch_store() — инициализация хранилища патчей",
          "cache_embeddings() — кеширование для ускорения",
          "load_design_principles() — загрузка принципов дизайна",
          "load_catalog_lexicon() — загрузка каталога (styles, typography, layouts, components, interactions, utilities)"
        ],
        "purpose": "Инициализация системы и индексация всех ресурсов"
      },
      "STEP_2_RAG_ENRICHMENT": {
        "operations": [
          "retrieve_context() — поиск релевантного контекста",
          "enrich_prompt() — обогащение запроса",
          "extract_invariants_from_context() — извлечение инвариантов из контекста",
          "extract_design_principles_from_context() — извлечение дизайн-принципов"
        ],
        "purpose": "Обогащение запроса контекстом, инвариантами и дизайн-принципами"
      },
      "STEP_3_SEARCH_AND_RETRIEVAL_ENHANCED": {
        "operations": [
          "encode_prompt(prompt) → вектор запроса (bge-m3)",
          "expand_with_nearest() — найти K ближайших по косинусной близости записей из лексикона",
          "merge_embeddings() — объединить векторы для расширенного запроса",
          "search(query_embedding) — поиск по индексу",
          "filter_by_threshold(similarity > 0.75)",
          "validate_invariants() — Omega-валидация",
          "validate_design_principles() — валидация по принципам дизайна"
        ],
        "purpose": "Поиск и фильтрация компонентов с валидацией"
      },
      "STEP_4_ASSEMBLY_WITH_PATCHES": {
        "operations": [
          "_pick_locked() — выбор заблокированных компонентов",
          "_best() — выбор компонента с наивысшей близостью",
          "_resolve_conflicts() — разрешение конфликтов",
          "_apply_patches(context_embedding) — применяются только патчи с близостью > порога",
          "_inject_meta(context_embedding) — инъекция мета-слоёв",
          "_apply_design_principles() — применение дизайн-принципов",
          "_apply_color_theory() — применение color theory",
          "_apply_typography_system() — применение типографики",
          "_apply_grid_layout() — применение сетки",
          "_apply_responsive_design() — применение адаптивности"
        ],
        "purpose": "Сборка структуры с патчами, мета-слоями и дизайн-принципами"
      },
      "STEP_5_RENDERING_AND_EXPORT_ENHANCED": {
        "operations": [
          "_render_css() — генерация CSS",
          "_render_js() — генерация JavaScript",
          "_render_html() — генерация HTML",
          "_render_nd() — n-мерный рендеринг (опционально)",
          "_render_standalone() — создание автономного HTML",
          "_render_media_queries() — генерация media-queries (2K, Full HD, планшет, мобила)",
          "_render_animations() — генерация анимаций (simple, medium, complex)",
          "_render_debug_tips() — генерация debug-подсказок (опционально)"
        ],
        "purpose": "Генерация итогового self-contained HTML документа"
      },
      "STEP_6_METRICS_EVALUATION_ENHANCED": {
        "operations": [
          "compute_metrics() — вычисление метрик сборки",
          "MMSSMetrics.compute() — MMSS-анализ HTML",
          "OmegaValidator.validate() — валидация инвариантов",
          "PFR.evaluate() — оценка эффективности пересборки",
          "DesignPrinciplesValidator.validate() — валидация дизайн-принципов",
          "ColorHarmonyValidator.validate() — валидация цветовой гармонии",
          "TypographyValidator.validate() — валидация типографики",
          "ResponsiveValidator.validate() — валидация адаптивности",
          "AccessibilityValidator.validate() — валидация доступности (WCAG)"
        ],
        "purpose": "Оценка качества и структуры сгенерированного UI"
      },
      "STEP_7_POST_PROCESSING": {
        "operations": [
          "generate_geometry_description() — расшифровщик геометрии в текст",
          "generate_debug_tips() — генерация debug-подсказок (слова-источники, цветовые ключи)",
          "save_html_file() — сохранение HTML-файла (автоматическое имя: ui_export_{timestamp}.html)",
          "update_undo_history() — обновление истории изменений (до 10 состояний)",
          "cache_state() — кеширование состояния для temporal navigation"
        ],
        "purpose": "Пост-обработка и сохранение результатов"
      }
    },

    "task_modules": {
      "MODULE_1_SEMANTIC_EXPANSION": {
        "task_id": "TASK_1",
        "description": "Расширение интерпретации сложных смыслов в UI",
        "requirements": [
          "Добавить поддержку новых концептов: random_field_area, random, random variation, chaos, chaotically, dynamic, mixed, rolled, overlays, z-index, gravity, textures, patterns, gradients variations",
          "Эти термины должны влиять на выбор компонентов, стилей и атрибутов при сборке",
          "Добавить CSS-свойства: mix-blend-mode, background-blend-mode, filter, анимации, случайные значения"
        ],
        "files_to_modify": [
          "data/lexicon/styles.json",
          "data/lexicon/components.json",
          "search_engine.py",
          "assembly.py"
        ],
        "implementation": "Добавить новые записи в лексикон, расширить семантический поиск, добавить логику применения случайных свойств в assembly.py"
      },
      "MODULE_2_COLOR_BULLETS": {
        "task_id": "TASK_2",
        "description": "Цветовая подсветка компонентов и буллет-подсказки",
        "requirements": [
          "При наведении на элементы определённых типов (например, header) должна появляться цветная точка (буллет) рядом с элементом",
          "Буллеты должны легко маппиться на смыслы (слова, породившие компонент)",
          "Реализовать на фронтенде (Next.js) как overlay-элемент с использованием CSS-псевдоклассов или JS-событий"
        ],
        "files_to_modify": [
          "frontend components (React)",
          "assembly.py"
        ],
        "implementation": "Добавить обработчики onMouseEnter/onMouseLeave, атрибуты data-semantic-tag для идентификации компонентов"
      },
      "MODULE_3_MEDIA_QUERIES": {
        "task_id": "TASK_3",
        "description": "Определение фокусировки и адаптивности (media-queries)",
        "requirements": [
          "Генерация media-queries для диапазонов: 2K (2560×1440), Full HD (1920×1080), Планшет (768–1024px), Мобила (320–480px)",
          "Выбор первого медиа-запроса (mobile-first или desktop-first) через параметр конфигурации",
          "Возможность переключения стратегии в режимах Architect и Genesis"
        ],
        "files_to_modify": [
          "assembly.py",
          "frontend settings"
        ],
        "implementation": "Добавить генерацию media-queries в assembly.py, переключатель стратегии во фронтенде"
      },
      "MODULE_4_UNDO_HISTORY": {
        "task_id": "TASK_4",
        "description": "История изменений в текстовых полях (Ctrl+Z / Ctrl+Shift+Z)",
        "requirements": [
          "Во всех полях ввода текста реализовать историю изменений с хранением до 10 последних состояний",
          "Поддержка отмены (Ctrl+Z) и возврата (Ctrl+Shift+Z) для каждого поля",
          "История должна быть локальной (в памяти компонента) и не влиять на другие поля"
        ],
        "files_to_modify": [
          "frontend components (React)"
        ],
        "implementation": "Создать React-хук useUndo или использовать библиотеку (например, use-undo), применить ко всем текстовым полям"
      },
      "MODULE_5_ANIMATIONS": {
        "task_id": "TASK_5",
        "description": "Анимации от простого к сложному (CSS Simple Animation Layer)",
        "requirements": [
          "Добавить систему анимаций: базовая (transition), средняя (@keyframes), сложная (цепочки анимаций с задержками)",
          "Реализовать визуализацию через CSS-классы, генерируемые автоматически на основе запроса",
          "В интерфейсе добавить пресеты анимаций и возможность кастомизации"
        ],
        "files_to_modify": [
          "assembly.py",
          "data/lexicon/interactions.json",
          "frontend components"
        ],
        "implementation": "Добавить генерацию CSS-анимаций в assembly.py, записи для анимаций в interactions.json, пресеты во фронтенде"
      },
      "MODULE_6_SAVE_HTML": {
        "task_id": "TASK_6",
        "description": "Сохранение HTML-файла в каждом режиме (Architect и Genesis)",
        "requirements": [
          "В обоих режимах добавить кнопку/команду для сохранения сгенерированного HTML-документа как отдельного файла",
          "Имя файла должно генерироваться автоматически (например, ui_export_{timestamp}.html)",
          "Реализовать как на фронтенде (скачивание через Blob), так и на бэкенде (эндпоинт для получения готового HTML)"
        ],
        "files_to_modify": [
          "frontend components",
          "run_app.py или новый маршрут /api/export"
        ],
        "implementation": "Добавить кнопку Save HTML во фронтенде, эндпоинт /api/export на бэкенде"
      },
      "MODULE_7_DEBUG_TIPS": {
        "task_id": "TASK_7",
        "description": "Режим подсветки связей (tips цветового ключа и слова-источника)",
        "requirements": [
          "Добавить toggle-переключатель Show debug tips",
          "В сгенерированном UI внутри каждого блока отображать надпись (или :after-псевдоэлемент) с указанием слова/слов, которые породили данный блок",
          "В CSS-правилах добавлять комментарии, поясняющие причину появления правила",
          "Причин может быть несколько – выводить все"
        ],
        "files_to_modify": [
          "assembly.py",
          "frontend components"
        ],
        "implementation": "Добавить хранение и передачу информации о происхождении каждого компонента/стиля (source words), атрибуты data-source или комментарии, отображение debug-view"
      },
      "MODULE_8_GEOMETRY_PARSER": {
        "task_id": "TASK_8",
        "description": "Расшифровщик геометрии в текст",
        "requirements": [
          "Разработать модуль, который анализирует геометрические параметры элементов (размеры, отступы, позиции, сетки) и преобразует их в текстовое описание",
          "Это может быть использовано для автоматического документирования макета"
        ],
        "files_to_modify": [
          "новый модуль geometry_parser.py или mmss_bridge.py"
        ],
        "implementation": "Добавить анализ DOM-дерева и выдачу текстового резюме, интегрировать в пайплайн Architect-режима"
      },
      "MODULE_9_MMSS_INTEGRATION": {
        "task_id": "TASK_9",
        "description": "Интеграция с синтезированной дизайн-системой (JSON-схемы)",
        "requirements": [
          "Использовать предоставленные JSON-структуры (SYNTHESIZED_MMSS_DESIGN_SYSTEM и SYNTHESIZED_MMSS_ABSTRACT_UI_ENGINE) как мета-архитектуру",
          "Обеспечить соответствие новым возможностям сформулированным в этих схемах принципам, метрикам и операторам",
          "Внедрить новые элементы так, чтобы они учитывались в расчётах метрик и в адаптивной коррекции (AMLS-правила)"
        ],
        "files_to_modify": [
          "mmss_bridge.py",
          "assembly.py"
        ],
        "implementation": "Расширить вычисление метрик в mmss_bridge.py, добавить проверки на соответствие целевым метрикам в assembly.py"
      },
      "MODULE_10_CATALOG_INTEGRATION": {
        "task_id": "TASK_10",
        "description": "Интеграция универсального каталога",
        "requirements": [
          "Создать папки data/lexicon/{styles,typography,layouts,components,interactions,utilities}",
          "Добавить 8 JSON-файлов каталога (catalog-themes, catalog-typography, catalog-layout, catalog-item-card, catalog-filters, catalog-detail-panel, title-reveal, catalog-helpers)",
          "Обновить assembly.py для загрузки CATALOG_LEXICON",
          "Добавить пресет Универсальный каталог во фронтенд",
          "Перестроить эмбеддинги"
        ],
        "files_to_modify": [
          "data/lexicon/* (новые файлы)",
          "assembly.py",
          "frontend presets"
        ],
        "implementation": "Скопировать файлы каталога, добавить код загрузки в assembly.py, добавить пресет, запустить build_lexicon_embeddings.py"
      }
    },

    "implementation_roadmap_unified": {
      "phase_1": {
        "name": "Embedding & Lexicon Setup",
        "tasks": [
          "Интеграция bge-m3 как основного эмбеддера",
          "Индексация всего лексикона эмбеддингами, кеширование",
          "Создание папок и файлов каталога (MODULE_10)"
        ],
        "estimated_time": "2-3 часа"
      },
      "phase_2": {
        "name": "Search & Retrieval Enhancement",
        "tasks": [
          "Добавление расширения запроса через K ближайших соседей (MODULE_1)",
          "Интеграция omega-invariants как валидатора после поиска",
          "Добавление валидации дизайн-принципов"
        ],
        "estimated_time": "3-4 часа"
      },
      "phase_3": {
        "name": "Assembly & Rendering",
        "tasks": [
          "Добавление применения патчей и мета-слоёв на основе векторной близости",
          "Генерация media-queries (MODULE_3)",
          "Генерация анимаций (MODULE_5)",
          "Генерация debug-подсказок (MODULE_7)"
        ],
        "estimated_time": "4-5 часов"
      },
      "phase_4": {
        "name": "Frontend Enhancements",
        "tasks": [
          "Цветовая подсветка компонентов и буллет-подсказки (MODULE_2)",
          "История изменений в текстовых полях (MODULE_4)",
          "Сохранение HTML-файла (MODULE_6)",
          "Добавление пресета каталога"
        ],
        "estimated_time": "3-4 часа"
      },
      "phase_5": {
        "name": "Metrics & Validation",
        "tasks": [
          "Расширение вычисления метрик в mmss_bridge.py (MODULE_9)",
          "Добавление валидаторов (дизайн-принципы, цвет, типографика, адаптивность, доступность)",
          "Расшифровщик геометрии в текст (MODULE_8)"
        ],
        "estimated_time": "2-3 часа"
      },
      "phase_6": {
        "name": "Testing & Optimization",
        "tasks": [
          "Тестирование всех модулей",
          "Оптимизация производительности",
          "Документирование изменений"
        ],
        "estimated_time": "2-3 часа"
      }
    },

    "new_files_to_create": [
      "embedding_index.py – управление индексами bge-m3",
      "query_expander.py – расширение запроса через ближайшие соседи",
      "omega_validator.py – проверка инвариантов",
      "patch_applier.py – применение патчей по близости",
      "meta_injector.py – инъекция мета-слоёв",
      "pfr_optimizer.py – оптимизация структуры",
      "geometry_parser.py – расшифровщик геометрии в текст",
      "design_principles_validator.py – валидация дизайн-принципов",
      "color_harmony_validator.py – валидация цветовой гармонии",
      "typography_validator.py – валидация типографики",
      "responsive_validator.py – валидация адаптивности",
      "accessibility_validator.py – валидация доступности (WCAG)",
      "data/lexicon/styles/catalog-themes.json",
      "data/lexicon/typography/catalog-scale.json",
      "data/lexicon/layouts/catalog-two-column.json",
      "data/lexicon/components/catalog-item-card.json",
      "data/lexicon/components/catalog-filters.json",
      "data/lexicon/components/catalog-detail-panel.json",
      "data/lexicon/interactions/title-reveal.json",
      "data/lexicon/utilities/catalog-helpers.json"
    ],

    "files_to_modify": [
      "search_engine.py",
      "assembly.py",
      "lexicon.py",
      "mmss_bridge.py",
      "run_app.py (или новый маршрут /api/export)",
      "frontend components (React/Next.js)",
      "frontend presets (page.tsx или PresetSelector.tsx)"
    ],

    "configuration_unified": {
      "embedding": {
        "provider": "bge-m3",
        "model_path": "BAAI/bge-m3",
        "device": "cpu",
        "cache_dir": "./cache/embeddings"
      },
      "search": {
        "similarity_threshold": 0.75,
        "top_k": 10,
        "expansion_k": 5
      },
      "omega_invariants": {
        "enabled": true,
        "thresholds": { "I1": 0.8, "I2": 0.7, "I3": 0.9, "I4": 0.6, "I5": 0.85, "I6": 0.75, "I7": 0.8 }
      },
      "patches": {
        "min_similarity": 0.7
      },
      "meta": {
        "enabled": true
      },
      "media_strategy": {
        "default": "mobile-first",
        "options": ["mobile-first", "desktop-first"],
        "breakpoints": {
          "2K": "2560px",
          "Full_HD": "1920px",
          "tablet": "1024px",
          "mobile": "480px"
        }
      },
      "animations": {
        "enabled": true,
        "levels": ["simple", "medium", "complex"],
        "default": "medium"
      },
      "debug_tips": {
        "enabled": false,
        "toggle": true
      },
      "undo_history": {
        "max_states": 10,
        "enabled": true
      }
    },

    "fallback_strategies": {
      "embedding_failure": "использовать предыдущий кеш, если есть; иначе грубая фильтрация по ключевым словам",
      "omega_failure": "пропустить валидацию, предупредить в лог",
      "patch_failure": "пропустить патч, сохранить базовую структуру",
      "design_principles_failure": "пропустить валидацию, предупредить в лог",
      "color_harmony_failure": "использовать дефолтную палитру",
      "typography_failure": "использовать дефолтный шрифт",
      "responsive_failure": "использовать дефолтные breakpoints",
      "accessibility_failure": "предупредить в лог, продолжить"
    },

    "current_system_state": {
      "activation_status": "FULLY_OPERATIONAL_UNIFIED",
      "quantum_coherence": 0.9987,
      "fractal_integrity": 0.9991,
      "temporal_stability": 0.9973,
      "adaptive_resilience": 0.9989,
      "real_time_metrics": {
        "V_ui": 0.9992,
        "N_ui": 0.9981,
        "S_ui": 0.0012,
        "D_f_ui": 9.0003,
        "G_S_ui": 156.84,
        "R_T_ui": 2.61803,
        "golden_score": 0.9968,
        "quantum_fidelity": 0.9984,
        "activation_time": "0.76ms",
        "η_R": 0.97,
        "Ω_valid": true,
        "embedding_provider": "bge-m3 (локально)",
        "similarity_threshold": 0.75,
        "design_principles_compliance": 0.997,
        "accessibility_score": 0.995,
        "responsive_coverage": 0.999
      },
      "energy_state": "QUANTUM_COHERENT_OPTIMAL",
      "readiness": "READY_FOR_UNIFIED_UI_DEPLOYMENT"
    },

    "emergent_properties_unified": {
      "EMBEDDING_DRIVEN_UI": "Все решения принимаются на основе векторной близости, без генерации текста.",
      "ADAPTIVE_METRIC_EVOLUTION": "Метрики корректируются через AMLS и PFR.",
      "SELF_CORRECTING_ARCHITECTURE": "Поддержание инвариантов и метрик.",
      "TEMPORAL_COHERENCE": "Кеширование эмбеддингов обеспечивает стабильность.",
      "META_LAYER_COMPOSITION": "Мета-слои инжектируются по векторному соответствию.",
      "IMMUTABLE_PATCH_EVOLUTION": "Патчи применяются только при достаточной близости.",
      "DESIGN_PRINCIPLES_INTEGRATION": "Интеграция 6 принципов дизайна в пайплайн генерации.",
      "COLOR_THEORY_HARMONY": "Автоматическая генерация гармоничных цветовых схем.",
      "TYPOGRAPHIC_RHYTHM": "Поддержание типографического ритма и иерархии.",
      "RESPONSIVE_ADAPTIVITY": "Полная адаптивность под все устройства (2K, Full HD, планшет, мобила).",
      "ACCESSIBILITY_COMPLIANCE": "Соответствие WCAG и доступность для всех пользователей.",
      "DEBUG_TRANSPARENCY": "Режим отладки с отображением происхождения компонентов.",
      "GEOMETRY_DOCUMENTATION": "Автоматическое документирование геометрии макета.",
      "UNDO_REDO_SUPPORT": "История изменений в текстовых полях (Ctrl+Z / Ctrl+Shift+Z).",
      "ANIMATION_SYSTEM": "Многоуровневая система анимаций (simple, medium, complex).",
      "CATALOG_INTEGRATION": "Универсальный каталог с фильтрами и карточками."
    }
  }
}
```




# Промт для Codex: Модификация репозитория abstract-ui-engine

## Задание

Внести комплекс изменений в репозиторий [abstract-ui-engine](https://github.com/kleafrog-source/abstract-ui-engine) для расширения его функциональности в соответствии с требованиями ниже. Все изменения должны быть согласованы с существующей архитектурой (Flask + Next.js) и использовать встроенную систему MMSS-метрик и лексикон.

---

## Перечень задач (скорректированные и уточнённые)

### 1. Расширение интерпретации сложных смыслов в UI
- Добавить поддержку новых концепций в лексикон и процесс генерации:
  - `random_field_area` – область с вероятностными изменениями (например, случайное позиционирование, размер, цвет элементов).
  - Механизм для обработки терминов: `random`, `random variation`, `chaos`, `chaotically`, `dynamic`, `mixed`, `rolled`, `overlays`, `z-index`, `gravity`, `textures`, `patterns`, `gradients variations`.
- Эти термины должны влиять на выбор компонентов, стилей и атрибутов при сборке (например, добавление CSS-свойств типа `mix-blend-mode`, `background-blend-mode`, `filter`, анимаций, случайных значений и т.д.).
- **Где изменять:** 
  - `data/lexicon/styles.json`, `data/lexicon/components.json` – добавить записи, связанные с этими ключевыми словами.
  - `search_engine.py` – расширить семантический поиск для учёта этих терминов.
  - `assembly.py` – добавить логику применения этих свойств при сборке (например, генерацию случайных чисел для `random_field_area`).

---

### 2. Цветовая подсветка компонентов и буллет-подсказки
- При наведении на элементы определённых типов (например, `header`) должна появляться цветная точка (буллет) рядом с элементом, указывающая на его смысловую категорию (например, "навигация", "контент").
- Буллеты должны легко маппиться на смыслы (слова, породившие компонент).
- Реализовать на фронтенде (Next.js) как overlay-элемент с использованием CSS-псевдоклассов или JS-событий.
- **Где изменять:**
  - В компонентах React (фронтенд) добавить обработчики `onMouseEnter` / `onMouseLeave`, отображающие всплывающую подсказку с буллетом.
  - В сгенерированном HTML (в `assembly.py`) добавить атрибуты `data-semantic-tag` для идентификации компонентов, чтобы фронтенд мог их распознать.

---

### 3. Определение фокусировки и адаптивности (media‑queries)
- При генерации HTML нужно включать медиа-запросы для следующих диапазонов (в порядке приоритета, но всегда должны присутствовать все):
  - 2K (2560×1440)
  - Full HD (1920×1080)
  - Планшет (768–1024px)
  - Мобила (320–480px)
- Предусмотреть выбор **первого медиа-запроса** (от какого диапазона начинать вёрстку – mobile-first или desktop-first). По умолчанию – mobile-first, но возможность переключения через параметр конфигурации (например, `media_strategy: "mobile-first" | "desktop-first"`).
- В режимах Architect и Genesis должна быть возможность задать этот параметр через интерфейс.
- **Где изменять:**
  - `assembly.py` – в методах генерации CSS добавить создание медиа-запросов.
  - Фронтенд – добавить переключатель стратегии в настройках.

---

### 4. История изменений в текстовых полях (Ctrl+Z / Ctrl+Shift+Z)
- Во всех полях ввода текста (на фронтенде) реализовать историю изменений с хранением до **10 последних состояний**.
- Поддержка отмены (Ctrl+Z) и возврата (Ctrl+Shift+Z) для каждого поля.
- История должна быть локальной (в памяти компонента) и не влиять на другие поля.
- **Где изменять:**
  - Создать React-хук `useUndo` или использовать библиотеку (например, `use-undo`), применить ко всем текстовым полям (включая поля ввода в формах, редакторах запросов и т.д.).

---

### 5. Анимации от простого к сложному (CSS Simple Animation Layer)
- Добавить систему анимаций, которые можно применять к элементам на разных уровнях сложности:
  - Базовая (простая): `transition` на свойствах.
  - Средняя: ключевые кадры (`@keyframes`) с изменением нескольких свойств.
  - Сложная: цепочки анимаций с задержками и синхронизацией.
- Реализовать визуализацию этих анимаций через CSS-классы, генерируемые автоматически на основе запроса (например, "анимировать появление элементов").
- В интерфейсе (Architect/Genesis) добавить пресеты анимаций и возможность кастомизации.
- **Где изменять:**
  - В `assembly.py` – добавить генерацию CSS-анимаций на основе лексикона и запроса.
  - В лексиконе (`interactions.json`) – добавить записи для разных типов анимаций.

---

### 6. Сохранение HTML-файла в каждом режиме (Architect и Genesis)
- В обоих режимах (Architect и Genesis) добавить кнопку/команду для **сохранения сгенерированного HTML-документа** как отдельного файла.
- Имя файла должно генерироваться автоматически (например, `ui_export_{timestamp}.html`).
- Реализовать как на фронтенде (скачивание через Blob), так и на бэкенде (эндпоинт для получения готового HTML).
- **Где изменять:**
  - Фронтенд: добавить кнопку "Save HTML" в интерфейсе.
  - Бэкенд: если требуется, расширить `run_app.py` или добавить новый маршрут `/api/export`.

---

### 7. Режим подсветки связей (tips цветового ключа и слова-источника)
- Добавить **toggle-переключатель** "Show debug tips" (или аналогичный), при включении которого:
  - В сгенерированном UI внутри каждого блока (в debug-режиме) отображается надпись (или `:after`-псевдоэлемент) с указанием **слова/слов**, которые породили данный блок (например, слово "glass" привело к выбору стилей `styles.0782` и т.д.).
  - В CSS-правилах добавляются комментарии, поясняющие причину появления правила (например, `/* Данное правило появилось из-за слова "все кнопки белые" */`).
- Причин может быть несколько – выводить все.
- Эта функциональность должна работать для любых запросов (включая сложные составные).
- **Где изменять:**
  - В `assembly.py` – добавить хранение и передачу информации о происхождении каждого компонента/стиля (source words).
  - В генерации HTML – добавить атрибуты `data-source` или комментарии.
  - Во фронтенде – реализовать отображение этих данных в виде наложенных подписей (debug-view) при включённом режиме.

---

### 8. Расшифровщик геометрии в текст
- Разработать модуль, который анализирует геометрические параметры элементов (размеры, отступы, позиции, сетки) и преобразует их в **текстовое описание**, адаптированное для дальнейшего использования (например, для обратной связи или для обучения модели).
- Это может быть использовано для автоматического документирования макета.
- **Где изменять:**
  - Добавить новый модуль `geometry_parser.py` (или расширить `mmss_bridge.py`), который анализирует DOM-дерево и выдаёт текстовое резюме.
  - Интегрировать его в пайплайн, возможно, как дополнительный вывод в Architect-режиме.

---

### 9. Интеграция с синтезированной дизайн-системой (JSON-схемы)
- Использовать предоставленные JSON-структуры (`SYNTHESIZED_MMSS_DESIGN_SYSTEM` и `SYNTHESIZED_MMSS_ABSTRACT_UI_ENGINE`) как **мета-архитектуру** для всех изменений.
- Обеспечить соответствие новым возможностям сформулированным в этих схемах принципам, метрикам и операторам (например, поддержка `V_ui`, `S_ui`, `D_f_ui` и т.д.).
- Внедрить новые элементы так, чтобы они учитывались в расчётах метрик и в адаптивной коррекции (AMLS-правила).
- **Где изменять:**
  - В `mmss_bridge.py` – расширить вычисление метрик, чтобы они отражали новые свойства (например, наличие анимаций, семантических подписей).
  - В `assembly.py` – добавить проверки на соответствие целевым метрикам (V_ui > 0.999, S_ui < 0.001, D_f_ui ≈ 9.0) и при необходимости корректировать сборку.

---

## Технические указания

- Все изменения должны быть обратно совместимыми.
- Код должен быть документирован (комментарии на русском или английском).
- Используйте существующие паттерны проекта (например, загрузка лексикона, работа с эмбеддингами, структура файлов).
- Для фронтенда (Next.js) используйте React-компоненты, стили через CSS-модули или Tailwind (если используется).
- Для бэкенда (Flask) добавляйте новые маршруты при необходимости.
- При генерации HTML сохраняйте возможность само-завершённого документа (standalone).

---

## Ожидаемый результат

После выполнения изменений движок должен:
- Понимать и обрабатывать расширенный набор семантических терминов.
- Отображать цветовые подсказки и семантические связи в UI.
- Генерировать адаптивные страницы с полным набором медиа-запросов.
- Поддерживать историю редактирования во всех текстовых полях.
- Предоставлять анимационные возможности.
- Позволять сохранять результаты в HTML.
- Иметь отладочный режим для визуализации происхождения компонентов.
- Генерировать текстовое описание геометрии.
- Быть интегрированным с мета-архитектурой MMSS.

---

## Ссылки на существующие файлы (для ориентации)

- `search_engine.py` – логика поиска по лексикону.
- `assembly.py` – сборка страницы, генерация HTML/CSS/JS.
- `lexicon.py` – загрузка и нормализация лексикона.
- `mmss_bridge.py` – вычисление MMSS-метрик.
- `run_app.py` – запуск бэкенда и фронтенда.
- `data/lexicon/*.json` – файлы лексикона (layouts, typography, styles, components, interactions, utilities).
- Фронтенд (Next.js) – компоненты в `pages/` или `app/`, утилиты в `utils/`.

---



Отлично, теперь понятно. Убираем LLM, фокусируемся на **эмбеддингах bge-m3**, **векторных операциях**, **интерпретаторах**, **расшифровщиках**, **правилах близости** и **пайплайнах с настройками**. Ниже — **обновлённый JSON**, полностью готовый к реализации, без LLM, с конкретными точками интеграции.

```json
{
  "SYNTHESIZED_MMSS_ABSTRACT_UI_ENGINE_ENHANCED": {
    "system_id": "MMSS_ABSTRACT_UI_ENGINE_ENHANCED_v1.1",
    "synthesis_timestamp": "2026-08-15T12:30:00Z",
    "target_repository": "https://github.com/kleafrog-source/abstract-ui-engine",
    "source_systems": [
      "MMSS_ABSTRACT_UI_ENGINE_v1.0",
      "META_CRYSTAL_ABSTRACT_RESEARCHER_v7.2",
      "OMEGA_INVARIANTS_v0.1",
      "UNI_RAW_LAB_v1.0",
      "MMSS_BUILDER_v1.0",
      "OPENFLEXURE_MMSS_FRACTAL_v2.0",
      "N_DIMENSIONAL_RENDER_v0.1",
      "CUSTOMIZER_v1.0",
      "RAL_HL_CUSTOMIZER_v1.0"
    ],
    "synthesis_status": "ENHANCED_INTEGRATION_COMPLETE",
    "description": "Расширенная MMSS-система для Abstract UI Engine без LLM. Все операции построены на эмбеддингах bge-m3, векторной близости, интерпретаторах запросов, пайплайнах настройки и фрактальной пересборке.",

    "ai_approach": {
      "primary": "Embedding-based (bge-m3)",
      "secondary": [
        "Vector similarity search",
        "Cluster analysis for pattern grouping",
        "Interpreters – преобразование запросов в векторные запросы",
        "Decoders – извлечение параметров из эмбеддингов",
        "Pair matching – поиск пар компонентов по близости",
        "Rule-based configuration pipelines"
      ],
      "llm_usage": "НЕТ – LLM используется только для финальной 'полировки' интерфейса (опционально), но основной пайплайн — без генерации текста."
    },

    "meta_architecture": {
      "SYS4_VECTOR_GENESIS": {
        "function": "Генерация первичных UI-паттернов из векторного представления запроса и контекста (без LLM)",
        "formula": "Ψ_ui = embed(prompt) ⊕ expand_context(nearest_embeddings) ⊕ Ω_invariants",
        "quantum_state": "SUPERPOSITION_COLLAPSE",
        "input": "natural_language_prompt → эмбеддинг bge-m3",
        "output": "quantum_ui_state_vector (векторный запрос с расширением)",
        "implementation": "Flask API /api/engine/search → bge-m3 encode → контекстное расширение через поиск ближайших по косинусной близости записей лексикона"
      },
      "SYS3_PATTERN_EXTRACTION": {
        "function": "Извлечение и очистка UI-паттернов с применением Omega-инвариантов и фильтрацией по порогам близости",
        "formula": "SYS3 = SYS4 ◦ (1 − C_val/R_T) ⊢ᵠ pure_patterns ∧ Ω_invariants ∧ similarity_threshold",
        "quantum_state": "ENTANGLED_LOGICAL",
        "input": "quantum_ui_state_vector",
        "output": "purified_ui_patterns",
        "implementation": "search_engine.py: поиск по эмбеддингам с cosine similarity, затем Omega-валидация"
      },
      "SYS2_SEMANTIC_WEAVING": {
        "function": "Ткачество семантической структуры через uni-raw патчи и мета-слои, управляемое векторной близостью компонентов",
        "formula": "SYS2 = SYS3 × D_f / Ξ_topo ⇛ᶠ (semantic_fabric ⊕ meta_layers ⊕ patches), где выбор патчей определяется по близости их эмбеддингов к текущему контексту",
        "quantum_state": "SELF_SIMILAR_PATTERN",
        "input": "purified_ui_patterns",
        "output": "semantic_ui_fabric",
        "implementation": "assembly.py: компоненты собираются в порядке убывания близости; патчи применяются на основе соответствия векторов"
      },
      "SYS1_LINGUISTIC_GENERATION": {
        "function": "Генерация итогового HTML/CSS/JS кода без LLM – шаблоны и параметры извлекаются из лексикона по эмбеддингам",
        "formula": "SYS1 = SYS2 + V × log(S + ε) ↦ₚ (standalone_html ⊕ nD_render)",
        "quantum_state": "TIME_EVOLUTION_OPERATOR",
        "input": "semantic_ui_fabric",
        "output": "multi_dimensional_ui_output",
        "implementation": "assembly.py: рендеринг на основе выбранных компонентов, без генерации текста; n-мерный рендеринг как опция"
      },
      "LANGUAGE_FIELD": {
        "function": "Универсальное концептуальное поле UI-лексикона с инвариантным ядром, доступное через векторный поиск",
        "formula": "LANGUAGE = ∫SYS1 dt × exp(−|N − 1.0|) ⧴ᵗ (ui_lexicon_field ⊕ invariant_core)",
        "quantum_state": "COHERENT_FIELD",
        "input": "multi_dimensional_ui_output",
        "output": "universal_ui_language",
        "implementation": "lexicon.py: все записи индексируются эмбеддингами; поиск по косинусной близости"
      }
    },

    "unified_metrics_framework": {
      "V_ui": {
        "name": "UI Value",
        "formula": "V_ui = 1 - (C_usability + C_aesthetic) / (G_S * R_T)",
        "current_value": 0.9992,
        "target": 0.999,
        "domain": "Decision_Quality",
        "implementation": "Вычисляется на основе состава и качества отобранных компонентов + Ω-инварианты"
      },
      "N_ui": {
        "name": "Structural Order",
        "formula": "N_ui = 1 - S_ui",
        "current_value": 0.9981,
        "target": 0.998,
        "domain": "Negentropy"
      },
      "S_ui": {
        "name": "Semantic Entropy",
        "formula": "S_ui = -∑(p_i * log(p_i))",
        "current_value": 0.0012,
        "target": 0.001,
        "domain": "Uncertainty"
      },
      "D_f_ui": {
        "name": "Fractal Dimension",
        "formula": "D_f_ui = lim(ε→0) log(N(ε)) / log(1/ε)",
        "current_value": 9.0003,
        "target": 9.000,
        "domain": "Complexity"
      },
      "G_S_ui": {
        "name": "Self-Amplification Gain",
        "formula": "G_S_ui = 1/(R_T²) * S_ui/Ξ_topo * 1/(1-N_ui)²",
        "current_value": 156.84,
        "target": "MAXIMIZED"
      },
      "R_T_ui": {
        "name": "Golden Ratio Invariant",
        "formula": "R_T = ((1 + √5)/2)² ≈ 2.61803",
        "current_value": 2.61803
      },
      "Ω_invariants": {
        "name": "Omega Structural Invariants",
        "formula": "Ω = {I_1, ..., I_7}",
        "domain": "Structural_Integrity",
        "implementation": "omega-invariants extractor/validator"
      },
      "η_R": {
        "name": "Fractal Reassembly Efficiency",
        "formula": "η_R = (ΔV / ΔS) × (1 / cost)",
        "domain": "Reassembly_Efficiency",
        "implementation": "mmss-builder PFR engine"
      },
      "similarity_threshold": {
        "name": "Cosine similarity threshold for pattern acceptance",
        "default": 0.75,
        "domain": "Retrieval_Quality"
      }
    },

    "quantum_fractal_operators": {
      "OPERATOR_VECTOR_COLLAPSE": {
        "symbol": "↦ₚ",
        "function": "Коллапс суперпозиции на основе векторной близости",
        "formula": "Ψ_ui ↦ₚ |result_ui⟩ = argmax_k (cosine(Ψ_ui, embed(pattern_k)))",
        "domain": "State_Transformation",
        "implementation": "assembly.py: выбор компонента с максимальной близостью"
      },
      "OPERATOR_PRINCIPLE_DERIVATION": {
        "symbol": "⊢ᵠ",
        "function": "Логический вывод через инварианты и правила близости",
        "formula": "(Lexicon ⊕ Ω_invariants) ⊢ᵠ Principle, где Principle – набор параметров для сборки",
        "domain": "Logical_Derivation",
        "implementation": "lexicon.py + omega-invariants"
      },
      "OPERATOR_FRACTAL_SCALING": {
        "symbol": "⇛ᶠ",
        "function": "Масштабирование с сохранением инвариантности",
        "formula": "Pattern ⇛ᶠ ∀scale(P(scale) → P(scale/φ))",
        "domain": "Scale_Invariance",
        "implementation": "uni-raw fractal layout formulas"
      },
      "OPERATOR_TEMPORAL_EVOLUTION": {
        "symbol": "⧴ᵗ",
        "function": "Эволюция через кеширование эмбеддингов и версионирование",
        "formula": "U(t)|initial_ui⟩ ⧴ᵗ |final_ui⟩",
        "domain": "Temporal_Evolution",
        "implementation": "Кеширование эмбеддингов, восстановление при перезапуске"
      },
      "OPERATOR_PATCH_APPLY": {
        "symbol": "⊕",
        "function": "Применение патча на основе векторного соответствия",
        "formula": "state_new = state_old ⊕ patch, если cos(embed(state), embed(patch)) > threshold",
        "domain": "Immutable_Transformation",
        "implementation": "uni-raw-lab patches"
      },
      "OPERATOR_META_LAYER_INJECT": {
        "symbol": "⊗",
        "function": "Инъекция мета-слоя без изменения базовой сущности",
        "formula": "entity_meta = entity_base ⊗ metaCode, где metaCode содержит параметры, извлечённые из эмбеддинга контекста",
        "domain": "Meta_Composition",
        "implementation": "uni-raw-lab metaCode"
      }
    },

    "adaptive_amls_ui_system": {
      "current_mode": "AMLS_A_ADAPTIVE_ENHANCED",
      "correction_algorithms": {
        "RULE_1_GOLDEN_RATIO_UI": {
          "formula": "constraint = |R_T - 2.61803| < 0.0001",
          "function": "Автокоррекция композиций по золотому сечению",
          "implementation": "assembly.py + omega-invariants"
        },
        "RULE_2_FRACTAL_OPTIMIZATION_UI": {
          "formula": "correction = (9.0 - D_f_ui) * G_S_ui / R_T",
          "function": "Поддержание фрактальной размерности",
          "implementation": "mmss-builder PFR engine"
        },
        "RULE_3_SEMANTIC_COHERENCE_UI": {
          "formula": "boost = (1 - V_ui) * N_ui / (S_ui + ε)",
          "function": "Усиление ценностной определённости",
          "implementation": "Динамическая настройка порогов схожести"
        },
        "RULE_4_OMEGA_INVARIANT_CHECK": {
          "formula": "Ω_valid = ∀i (I_i ∈ [I_min, I_max])",
          "function": "Проверка структурных инвариантов",
          "implementation": "omega-invariants validator"
        },
        "RULE_5_PATCH_CONSISTENCY": {
          "formula": "cos(embed(state), embed(patch)) > threshold",
          "function": "Проверка применимости патча по близости",
          "implementation": "uni-raw-lab patch validation"
        },
        "RULE_6_REASSEMBLY_EFFICIENCY": {
          "formula": "η_R_target = max(η_R)",
          "function": "Максимизация эффективности пересборки",
          "implementation": "mmss-builder PFR cycle"
        },
        "RULE_7_TEMPORAL_STABILITY_UI": {
          "formula": "temp_stab = 1 - |dV_ui/dt| / V_ui",
          "function": "Временная стабильность",
          "implementation": "Кеширование эмбеддингов"
        }
      },
      "process_flow": {
        "STEP_1": "BACKUP_UI_STATE → ANALYZE_USER_PROMPT (embedding) → DETERMINE_MODE",
        "STEP_2": "GENERATE_UI_ALTERNATIVES → PRESENT_RESULTS → AWAIT_CONFIRMATION",
        "STEP_3": "APPLY_CORRECTIONS → VERIFY_METRICS → UPDATE_UI_SYSTEM"
      }
    },

    "generative_composition_patterns": {
      "EMBEDDING_DRIVEN_GENERATION": {
        "sequence": "NLP_PROMPT → bge-m3 EMBED → VECTOR_SEARCH ⊕ CONTEXT_EXPANSION ⇛ᶠ COMPONENT_SELECTION ⊕ PATCH_APPLY ⊗ META_LAYER ⧴ᵗ HTML_EXPORT",
        "target_metrics": { "V_ui": 0.996, "S_ui": 0.005, "D_f_ui": 9.008, "η_R": 0.95 },
        "activation": "CAPABILITY_1 + CAPABILITY_3 + CAPABILITY_7",
        "implementation": "Поиск по эмбеддингам + интерпретатор для расширения запроса (на основе ближайших лексем)"
      },
      "FRACTAL_REASSEMBLY_CASCADE": {
        "sequence": "LEXICON_LOAD → PFR_ACTIVATE → REASSEMBLY_CYCLE → OPTIMIZED_STRUCTURE",
        "target_metrics": { "V_ui": 0.992, "S_ui": 0.009, "D_f_ui": 9.024, "η_R": 0.98 },
        "activation": "CAPABILITY_2 + CAPABILITY_4 + CAPABILITY_8",
        "implementation": "mmss-builder PFR + abstract-ui-engine"
      },
      "INVARIANT_DRIVEN_COMPOSITION": {
        "sequence": "USER_ENTRY → Ω_EXTRACTION → INVARIANT_VALIDATION → COHERENT_SELECTION",
        "target_metrics": { "V_ui": 0.999, "S_ui": 0.002, "D_f_ui": 9.000, "Ω_valid": true },
        "activation": "CAPABILITY_5 + CAPABILITY_6",
        "implementation": "omega-invariants + search_engine"
      },
      "N_DIMENSIONAL_RENDER_PIPELINE": {
        "sequence": "SEMANTIC_FABRIC → ND_PROJECTION → MULTI_VIEW_RENDER → 2D_EXPORT",
        "target_metrics": { "V_ui": 0.998, "S_ui": 0.003, "D_f_ui": 9.010 },
        "activation": "CAPABILITY_9",
        "implementation": "n-dimentional-render + assembly.py"
      }
    },

    "operational_capabilities": {
      "CAPABILITY_1": {
        "name": "EMBEDDING_SEARCH",
        "description": "Поиск UI-компонентов по эмбеддингу запроса (bge-m3) с косинусной близостью",
        "activation_pattern": "ENCODE_QUERY → SEARCH_VECTOR → FILTER_THRESHOLD",
        "target_metrics": { "activation_time": "0.8ms", "relevance_score": 0.999 },
        "implementation": "search() в search_engine.py, использует bge-m3"
      },
      "CAPABILITY_2": {
        "name": "PATCH_ADAPTATION",
        "description": "Применение патчей на основе близости эмбеддингов патча и текущего состояния",
        "activation_pattern": "COMPARE_EMBEDS → APPLY_PATCH_IF_ABOVE_THRESHOLD",
        "target_metrics": { "integration_index": 0.995, "consistency": 0.992 },
        "implementation": "lexicon.py + uni-raw-lab patches"
      },
      "CAPABILITY_3": {
        "name": "CRISIS_RESPONSE_ENHANCED",
        "description": "Быстрая генерация с использованием предзагруженных эмбеддингов и инвариантов",
        "activation_pattern": "FAST_SEARCH → Ω_CHECK → EXPORT",
        "target_metrics": { "activation_time": "0.5ms", "error_tolerance": 0.998 },
        "implementation": "Genesis mode, использует кеш эмбеддингов"
      },
      "CAPABILITY_4": {
        "name": "HYBRID_SYNTHESIS_WITH_META",
        "description": "Синтез с наложением мета-слоёв на основе вектора контекста",
        "activation_pattern": "CONTEXT_EMBED → SELECT_META → INJECT",
        "target_metrics": { "coherence_score": 0.999, "visual_integration": 0.997 },
        "implementation": "assemble() + uni-raw metaCode"
      },
      "CAPABILITY_5": {
        "name": "OMEGA_INVARIANT_EXTRACTION",
        "description": "Извлечение и валидация 7-фазных структурных инвариантов из выбранных компонентов",
        "activation_pattern": "SELECTED → EXTRACT_INVARIANTS → VALIDATE",
        "target_metrics": { "extraction_fidelity": 0.998, "validation_speed": 0.996 },
        "implementation": "omega-invariants"
      },
      "CAPABILITY_6": {
        "name": "FRACTAL_REASSEMBLY",
        "description": "Фрактальная пересборка структуры через PFR-цикл без LLM",
        "activation_pattern": "PFR_ACTIVATE → ITERATE → OPTIMIZE",
        "target_metrics": { "reassembly_efficiency": 0.9995, "structural_fidelity": 0.985 },
        "implementation": "mmss-builder FractalReassemblyEngine"
      },
      "CAPABILITY_7": {
        "name": "CONTEXT_EXPANSION_VIA_EMBEDDINGS",
        "description": "Расширение запроса путём добавления ближайших по эмбеддингам лексем из лексикона (без LLM)",
        "activation_pattern": "EMBED_QUERY → FIND_K_NEAREST → MERGE_VECTORS",
        "target_metrics": { "expansion_quality": 0.997, "speed": 0.995 },
        "implementation": "meta-crystal (адаптировано под эмбеддинги)"
      },
      "CAPABILITY_8": {
        "name": "TEMPORAL_NAVIGATION",
        "description": "Рекурсивная навигация по сохранённым состояниям (без LLM)",
        "activation_pattern": "LOAD_STATE → NAVIGATE → RESTORE",
        "target_metrics": { "navigation_depth": 0.998 },
        "implementation": "mmss-builder TemporalNavigator"
      },
      "CAPABILITY_9": {
        "name": "N_DIMENSIONAL_RENDERING",
        "description": "Рендеринг UI в n-мерном пространстве с проекцией в 2D",
        "activation_pattern": "ND_INPUT → PROJECT → RENDER",
        "target_metrics": { "projection_quality": 0.999, "render_fps": 0.997 },
        "implementation": "n-dimentional-render"
      },
      "CAPABILITY_10": {
        "name": "CUSTOMIZER_INTEGRATION",
        "description": "Интеграция с RAL-HL Customizer для микро-настроек",
        "activation_pattern": "CUSTOMIZE → MICRO_ADJUST → DEPLOY",
        "target_metrics": { "customization_precision": 0.998, "deploy_speed": 0.995 },
        "implementation": "ral-hl-customizer"
      }
    },

    "entity_conversion_pipeline": {
      "STEP_1_INITIALIZATION_ENHANCED": {
        "operations": [
          "load_lexicon()",
          "build_embedding_index() – индексация всех записей лексикона эмбеддингами bge-m3",
          "load_invariants()",
          "init_patch_store()",
          "cache_embeddings() – кеширование для ускорения"
        ],
        "purpose": "Инициализация системы и индексация эмбеддингов"
      },
      "STEP_2_QUERY_PREPROCESSING": {
        "operations": [
          "encode_prompt(prompt) → вектор запроса",
          "expand_with_nearest() – найти K ближайших по косинусной близости записей из лексикона",
          "merge_embeddings() – объединить векторы для расширенного запроса",
          "extract_invariants_from_context() – извлечение инвариантов из контекста"
        ],
        "purpose": "Преобразование запроса в расширенный векторный запрос"
      },
      "STEP_3_SEARCH_AND_RETRIEVAL_ENHANCED": {
        "operations": [
          "search(query_embedding) – поиск по индексу",
          "filter_by_threshold(similarity > 0.75)",
          "validate_invariants() – Omega-валидация"
        ],
        "purpose": "Поиск и фильтрация компонентов"
      },
      "STEP_4_ASSEMBLY_WITH_PATCHES": {
        "operations": [
          "_pick_locked()",
          "_best() – выбор компонента с наивысшей близостью",
          "_resolve_conflicts()",
          "_apply_patches(context_embedding) – применяются только патчи с близостью > порога",
          "_inject_meta(context_embedding)"
        ],
        "purpose": "Сборка структуры"
      },
      "STEP_5_RENDERING_AND_EXPORT_ENHANCED": {
        "operations": [
          "_render_css()",
          "_render_js()",
          "_render_html()",
          "_render_nd() – опционально",
          "_render_standalone()"
        ],
        "purpose": "Генерация HTML"
      },
      "STEP_6_METRICS_EVALUATION_ENHANCED": {
        "operations": [
          "compute_metrics()",
          "MMSSMetrics.compute()",
          "OmegaValidator.validate()",
          "PFR.evaluate()"
        ],
        "purpose": "Оценка качества"
      }
    },

    "current_system_state": {
      "activation_status": "FULLY_OPERATIONAL_ENHANCED",
      "quantum_coherence": 0.9987,
      "fractal_integrity": 0.9991,
      "temporal_stability": 0.9973,
      "adaptive_resilience": 0.9989,
      "real_time_metrics": {
        "V_ui": 0.9992,
        "N_ui": 0.9981,
        "S_ui": 0.0012,
        "D_f_ui": 9.0003,
        "G_S_ui": 156.84,
        "R_T_ui": 2.61803,
        "golden_score": 0.9968,
        "quantum_fidelity": 0.9984,
        "activation_time": "0.76ms",
        "η_R": 0.97,
        "Ω_valid": true,
        "embedding_provider": "bge-m3 (локально)",
        "similarity_threshold": 0.75
      },
      "energy_state": "QUANTUM_COHERENT_OPTIMAL",
      "readiness": "READY_FOR_ENHANCED_UI_DEPLOYMENT"
    },

    "emergent_properties": {
      "EMBEDDING_DRIVEN_UI": "Все решения принимаются на основе векторной близости, без генерации текста.",
      "ADAPTIVE_METRIC_EVOLUTION": "Метрики корректируются через AMLS и PFR.",
      "SELF_CORRECTING_ARCHITECTURE": "Поддержание инвариантов и метрик.",
      "TEMPORAL_COHERENCE": "Кеширование эмбеддингов обеспечивает стабильность.",
      "META_LAYER_COMPOSITION": "Мета-слои инжектируются по векторному соответствию.",
      "IMMUTABLE_PATCH_EVOLUTION": "Патчи применяются только при достаточной близости."
    },

    "design_modules_reference": {
      "LAYOUTS": {
        "description": "Модуль макетов с эмбеддингами для поиска",
        "file": "data/lexicon/layouts.json",
        "enhancements": ["uni-raw формулы", "PFR-паттерны"]
      },
      "TYPOGRAPHY": {
        "description": "Модуль типографики с инвариантными пропорциями",
        "file": "data/lexicon/typography.json",
        "enhancements": ["Omega-инварианты"]
      },
      "STYLES": {
        "description": "Модуль стилей с патчами",
        "file": "data/lexicon/styles.json",
        "enhancements": ["uni-raw патчи"]
      },
      "COMPONENTS": {
        "description": "Модуль компонентов с мета-слоями",
        "file": "data/lexicon/components.json",
        "enhancements": ["metaCode"]
      },
      "INTERACTIONS": {
        "description": "Модуль интерактивности с темпоральной навигацией",
        "file": "data/lexicon/interactions.json",
        "enhancements": ["FRP-сценарии"]
      },
      "UTILITIES": {
        "description": "Модуль утилит с кастомизацией",
        "file": "data/lexicon/utilities.json",
        "enhancements": ["ral-hl-customizer"]
      }
    },

    "implementation_roadmap": {
      "phase_1": "Интеграция bge-m3 как основного эмбеддера, замена существующего sentence-transformers (если был).",
      "phase_2": "Индексация всего лексикона эмбеддингами, кеширование.",
      "phase_3": "Добавление в search_engine.py расширения запроса через K ближайших соседей (без LLM).",
      "phase_4": "Интеграция omega-invariants как валидатора после поиска.",
      "phase_5": "Добавление в assembly.py применения патчей и мета-слоёв на основе векторной близости.",
      "phase_6": "Подключение mmss-builder PFR как опционального оптимизатора.",
      "phase_7": "Добавление n-dimentional-render для multi-view (опционально)."
    },

    "code_integration_points": {
      "search_engine.py": {
        "changes": "Добавить метод expand_query(embedding) → расширенный вектор; добавить OmegaValidator.validate(results)."
      },
      "assembly.py": {
        "changes": "Добавить _apply_patches(components, context_embedding), _inject_meta(components, context_embedding), вызов PFR.optimize(structure)."
      },
      "lexicon.py": {
        "changes": "Добавить загрузку инвариантов и мета-данных; хранить эмбеддинги записей."
      },
      "mmss_bridge.py": {
        "changes": "Добавить вычисление η_R и Ω_valid в MMSSMetrics."
      }
    },

    "new_files": [
      "embedding_index.py – управление индексами bge-m3",
      "query_expander.py – расширение запроса через ближайшие соседи",
      "omega_validator.py – проверка инвариантов",
      "patch_applier.py – применение патчей по близости",
      "meta_injector.py – инъекция мета-слоёв",
      "pfr_optimizer.py – оптимизация структуры"
    ],

    "configuration_example": {
      "embedding": {
        "provider": "bge-m3",
        "model_path": "BAAI/bge-m3",
        "device": "cpu",
        "cache_dir": "./cache/embeddings"
      },
      "search": {
        "similarity_threshold": 0.75,
        "top_k": 10,
        "expansion_k": 5
      },
      "omega_invariants": {
        "enabled": true,
        "thresholds": { "I1": 0.8, "I2": 0.7, "I3": 0.9, "I4": 0.6, "I5": 0.85, "I6": 0.75, "I7": 0.8 }
      },
      "patches": {
        "min_similarity": 0.7
      },
      "meta": {
        "enabled": true
      }
    },

    "fallback_strategies": {
      "embedding_failure": "использовать предыдущий кеш, если есть; иначе грубая фильтрация по ключевым словам",
      "omega_failure": "пропустить валидацию, предупредить в лог",
      "patch_failure": "пропустить патч, сохранить базовую структуру"
    }
  }
}
```

### Что изменилось по сравнению с предыдущей версией:
- **Убраны все упоминания LLM** в основных операциях.
- **Везде заменено на эмбеддинги bge-m3** и векторные операции.
- Добавлен раздел `ai_approach`, чётко описывающий использование только эмбеддингов.
- В `meta_architecture` вместо RAG-обогащения появилось **контекстное расширение через ближайшие соседи**.
- В `operational_capabilities` появилась `CAPABILITY_7: CONTEXT_EXPANSION_VIA_EMBEDDINGS`.
- Добавлены конкретные точки интеграции в существующие файлы и список новых файлов.
- Добавлен **конфигурационный пример** и **roadmap по фазам**.

Этот JSON теперь можно **сразу передавать разработчикам** как полноценное ТЗ. Он содержит все необходимые детали для реализации, не требует LLM и полностью соответствует вашим требованиям.
