from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path
from time import perf_counter

from flask import Flask, jsonify, request
from flask_cors import CORS

from .assembly import assemble
from .config import CONFIG_SUMMARY, CORS_ORIGINS
from .embeddings import cache_stats
from .lexicon import add_custom_entry, custom_entry_id, lexicon_stats, load_lexicon
from .mmss_bridge import MMSSMetrics
from .search_engine import build_debug, build_index, rebuild_index, search
from .semantic_config import build_semantic_retrieval_query, load_parameter_schema, recommend_semantic_config


DEBUG_RESULTS_DIR = Path(__file__).resolve().parent / "debug_results"


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": CORS_ORIGINS}})
    mmss = MMSSMetrics()
    DEBUG_RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    build_index()

    def build_generation_payload(body: dict[str, object], *, save_debug_result: bool) -> dict[str, object]:
        raw_query = str(body.get("q") or body.get("query") or "").strip()
        if not raw_query:
            raise ValueError("Missing 'q'.")
        semantic_config = body.get("semanticConfig") if isinstance(body.get("semanticConfig"), dict) else None
        retrieval_query = build_semantic_retrieval_query(raw_query, semantic_config) if semantic_config else raw_query

        started = perf_counter()
        result = search(
            retrieval_query,
            temperature=float(body.get("temperature", 0.4)),
            top_k=max(18, min(40, int(body.get("topK", 24)))),
        )
        assembly_result = dict(result)
        assembly_result["query"] = raw_query
        assembly_result["retrievalQuery"] = retrieval_query
        assembly_payload = assemble(
            assembly_result,
            build_index()["vectors"],
            locked=body.get("locked", []),
            prefer_family=body.get("preferFamily"),
            archetype_override=body.get("archetype") or _map_config_archetype(semantic_config),
            media_strategy=body.get("mediaStrategy") or _map_config_media_strategy(semantic_config),
            debug_tips=bool(body.get("debugTips", False) or _map_config_debug_tips(semantic_config)),
            animation_mode=body.get("animationMode") or _map_config_animation_mode(semantic_config),
        )
        result["tookMs"] = int((perf_counter() - started) * 1000)
        result["query"] = raw_query
        result["retrievalQuery"] = retrieval_query
        debug = build_debug(raw_query, result["hits"])
        mmss_metrics = mmss.compute(assembly_payload["assembly"]["standalone"])
        payload: dict[str, object] = {
            "result": result,
            **assembly_payload,
            "debug": debug,
            "mmss": mmss_metrics,
        }
        if semantic_config:
            payload["semanticConfig"] = semantic_config
        if save_debug_result:
            payload["debugArtifacts"] = persist_debug_artifacts(payload)
        return payload

    def _map_config_archetype(semantic_config: dict[str, object] | None) -> str | None:
        if not semantic_config:
            return None
        page_type = str(semantic_config.get("page_type") or "").lower()
        mapping = {
            "landing": "landing",
            "dashboard": "dashboard",
            "docs": "docs",
            "documentation": "docs",
            "catalog": "catalog",
            "ecommerce": "catalog",
            "settings": "dashboard",
            "admin": "dashboard",
        }
        return mapping.get(page_type)

    def _map_config_media_strategy(semantic_config: dict[str, object] | None) -> str:
        if not semantic_config:
            return "mobile-first"
        responsive_strategy = str(semantic_config.get("responsive_strategy") or "").lower()
        if responsive_strategy in {"desktop_first", "desktop-first"}:
            return "desktop-first"
        return "mobile-first"

    def _map_config_animation_mode(semantic_config: dict[str, object] | None) -> str:
        if not semantic_config:
            return "auto"
        animation_complexity = str(semantic_config.get("animation_complexity") or "").lower()
        if animation_complexity in {"none", "simple", "medium", "complex"}:
            return animation_complexity
        return "auto"

    def _map_config_debug_tips(semantic_config: dict[str, object] | None) -> bool:
        if not semantic_config:
            return False
        return bool(semantic_config.get("debug_tips", False))

    def persist_debug_artifacts(payload: dict[str, object]) -> dict[str, object]:
        timestamp = datetime.now(UTC)
        stamp = str(int(timestamp.timestamp() * 1000))
        full_path = DEBUG_RESULTS_DIR / f"abstract-ui-debug-{stamp}.json"
        summary_path = DEBUG_RESULTS_DIR / f"abstract-ui-debug-{stamp}.summary.json"

        full_path.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

        response = payload
        assembly = response["assembly"]
        selection = assembly["selection"]
        plan = response["plan"]
        summary = {
            "generatedAt": timestamp.isoformat(),
            "query": response["result"]["query"],
            "archetype": response["archetype"],
            "locale": response["locale"],
            "pagePlan": response.get("pagePlan", []),
            "provider": response["result"]["provider"],
            "tookMs": response["result"]["tookMs"],
            "warnings": response["warnings"],
            "metrics": response["metrics"],
            "mmss": response["mmss"],
            "completeness": response.get("completeness", {}),
            "selection": {
                "layout": selection["layout"]["entry"]["id"] if selection.get("layout") else None,
                "typography": [hit["entry"]["id"] for hit in selection.get("typography", [])],
                "styles": [hit["entry"]["id"] for hit in selection.get("styles", [])],
                "components": [hit["entry"]["id"] for hit in selection.get("components", [])],
                "interactions": [hit["entry"]["id"] for hit in selection.get("interactions", [])],
                "utilities": [hit["entry"]["id"] for hit in selection.get("utilities", [])],
            },
            "topHits": [
                {
                    "id": hit["entry"]["id"],
                    "category": hit["entry"]["category"],
                    "score": round(float(hit["score"]), 4),
                    "matchedTokens": hit.get("matchedTokens", []),
                }
                for hit in response["result"]["hits"][:12]
            ],
            "plan": [
                {
                    "slot": step["slot"],
                    "source": step["source"],
                    "componentId": step["componentId"],
                    "valid": step["valid"],
                    "constraints": step["constraints"],
                    "sourceTokens": step["sourceTokens"],
                    "bundle": step.get("bundle", {}),
                    "rejected": step["rejectedCandidates"][:8],
                }
                for step in plan
            ],
            "paths": {
                "full": str(full_path),
                "summary": str(summary_path),
            },
        }
        summary_path.write_text(
            json.dumps(summary, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

        return {
            "generatedAt": timestamp.isoformat(),
            "full": str(full_path),
            "summary": str(summary_path),
        }

    @app.get("/")
    def index():
        return jsonify(
            {
                "ok": True,
                "service": "semantic-ui-genesis-engine-backend",
                "health": "/api/health",
                "frontend": CORS_ORIGINS,
            }
        )

    @app.get("/api/health")
    def health() -> tuple[dict[str, str], int]:
        return {"ok": "true"}, 200

    @app.get("/api/lexicon/stats")
    def lexicon_stats_route():
        return jsonify({**lexicon_stats(), "cache": cache_stats(), "config": CONFIG_SUMMARY})

    @app.get("/api/semantic-config/schema")
    def semantic_config_schema_route():
        return jsonify(load_parameter_schema())

    @app.post("/api/semantic-config/recommend")
    def semantic_config_recommend_route():
        body = request.get_json(silent=True) or {}
        query = str(body.get("q") or body.get("query") or "").strip()
        if not query:
            return jsonify({"error": "Missing 'q'."}), 400
        current_values = body.get("currentValues") if isinstance(body.get("currentValues"), dict) else None
        return jsonify(recommend_semantic_config(query, current_values))

    @app.post("/api/lexicon/reload")
    def lexicon_reload_route():
        body = request.get_json(silent=True) or {}
        load_lexicon(force=True)
        index = rebuild_index(invalidate_embeddings=bool(body.get("invalidateCache")))
        by_category = {key: len(value) for key, value in index["byCategory"].items()}
        return jsonify(
            {
                "ok": True,
                "total": len(index["entries"]),
                "byCategory": by_category,
                "cacheStatus": index["cacheStatus"],
                "cacheInvalidated": bool(body.get("invalidateCache")),
            }
        )

    @app.post("/api/lexicon/add")
    def lexicon_add_route():
        body = request.get_json(silent=True) or {}
        required = ("category", "name", "semantic_description", "payload")
        missing = [field for field in required if not body.get(field)]
        if missing:
            return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

        entry = {
            "id": body.get("id") or custom_entry_id(body["category"], body["name"]),
            "category": body["category"],
            "name": str(body["name"]),
            "semantic_description": str(body["semantic_description"]),
            "tags": [str(tag) for tag in body.get("tags", [])],
            "payload": str(body["payload"]),
            "css": body.get("css"),
            "html": body.get("html"),
            "js": body.get("js"),
            "responsive": body.get("responsive"),
            "accessibility": body.get("accessibility"),
            "conflicts": [str(value) for value in body.get("conflicts", [])],
            "family": body.get("family") or "custom",
            "meta": body.get("meta") or {"source": "user"},
        }
        add_custom_entry(entry)
        index = rebuild_index()
        return jsonify({"ok": True, "id": entry["id"], "total": len(index["entries"])})

    @app.route("/api/engine/search", methods=["GET", "POST"])
    def engine_search_route():
        body = request.get_json(silent=True) or {}
        args = request.args if request.method == "GET" else body
        query = str(args.get("q") or args.get("query") or "").strip()
        if not query:
            return jsonify({"error": "Missing 'q'."}), 400
        started = perf_counter()
        result = search(
            query,
            temperature=float(args.get("temperature", 0.4)),
            top_k=int(args.get("topK", 12)),
            category=args.get("category") or None,
            locked=args.get("locked") if isinstance(args.get("locked"), list) else body.get("locked", []),
        )
        result["tookMs"] = int((perf_counter() - started) * 1000)
        return jsonify(result)

    @app.post("/api/engine/generate")
    def engine_generate_route():
        body = request.get_json(silent=True) or {}
        try:
            payload = build_generation_payload(body, save_debug_result=True)
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400
        return jsonify(payload)

    @app.post("/api/engine/metrics")
    def engine_metrics_route():
        body = request.get_json(silent=True) or {}
        try:
            response = build_generation_payload(body, save_debug_result=False)
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400
        return jsonify({"metrics": response["metrics"], "selection": response["assembly"]["selection"]})

    @app.route("/api/engine/debug", methods=["GET", "POST"])
    def engine_debug_route():
        body = request.get_json(silent=True) or {}
        query = str(body.get("q") or request.args.get("q") or "").strip()
        if not query:
            index = build_index()
            return jsonify(
                {
                    "config": CONFIG_SUMMARY,
                    "cache": cache_stats(),
                    "lexiconStats": {key: len(value) for key, value in index["byCategory"].items()},
                    "total": len(index["entries"]),
                    "cacheStatus": index["cacheStatus"],
                }
            )
        result = search(query, temperature=float(body.get("temperature", 0.4)), top_k=int(body.get("topK", 12)))
        return jsonify(
            {
                "debug": build_debug(query, result["hits"]),
                "config": CONFIG_SUMMARY,
                "cache": cache_stats(),
                "hits": [
                    {
                        "id": hit["entry"]["id"],
                        "name": hit["entry"]["name"],
                        "score": hit["score"],
                        "confidence": hit["confidence"],
                        "matchedTokens": hit["matchedTokens"],
                    }
                    for hit in result["hits"]
                ],
            }
        )

    @app.post("/api/engine/export")
    def engine_export_route():
        body = request.get_json(silent=True) or {}
        try:
            response = build_generation_payload(body, save_debug_result=False)
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400
        standalone = response["assembly"]["standalone"]
        if body.get("download"):
            return app.response_class(
                standalone,
                mimetype="text/html",
                headers={"Content-Disposition": 'attachment; filename="genesis-export.html"'},
            )
        return jsonify({"standalone": standalone, "tree": response["assembly"]["tree"]})

    return app
