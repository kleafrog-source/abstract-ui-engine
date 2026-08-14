from __future__ import annotations

from time import perf_counter

from flask import Flask, jsonify, request
from flask_cors import CORS

from .assembly import assemble
from .config import CONFIG_SUMMARY, CORS_ORIGINS
from .embeddings import cache_stats
from .lexicon import add_custom_entry, custom_entry_id, lexicon_stats, load_lexicon
from .mmss_bridge import MMSSMetrics
from .search_engine import build_debug, build_index, rebuild_index, search


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": CORS_ORIGINS}})
    mmss = MMSSMetrics()

    build_index()

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
        query = str(body.get("q") or body.get("query") or "").strip()
        if not query:
            return jsonify({"error": "Missing 'q'."}), 400
        started = perf_counter()
        result = search(query, temperature=float(body.get("temperature", 0.4)), top_k=max(6, min(20, int(body.get("topK", 10)))))
        assembly_payload = assemble(
            result,
            build_index()["vectors"],
            locked=body.get("locked", []),
            prefer_family=body.get("preferFamily"),
        )
        result["tookMs"] = int((perf_counter() - started) * 1000)
        debug = build_debug(query, result["hits"])
        mmss_metrics = mmss.compute(assembly_payload["assembly"]["standalone"])
        return jsonify({"result": result, **assembly_payload, "debug": debug, "mmss": mmss_metrics})

    @app.post("/api/engine/metrics")
    def engine_metrics_route():
        response = engine_generate_route().get_json()
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
        response = engine_generate_route().get_json()
        standalone = response["assembly"]["standalone"]
        if (request.get_json(silent=True) or {}).get("download"):
            return app.response_class(
                standalone,
                mimetype="text/html",
                headers={"Content-Disposition": 'attachment; filename="genesis-export.html"'},
            )
        return jsonify({"standalone": standalone, "tree": response["assembly"]["tree"]})

    return app
