from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from backend import create_app


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run a local generation request and save the full debug payload.")
    parser.add_argument("--query", "-q", required=True, help="Query to send into /api/engine/generate")
    parser.add_argument("--archetype", choices=["auto", "landing", "dashboard", "docs", "catalog"], default="auto")
    parser.add_argument("--temperature", type=float, default=0.4)
    parser.add_argument("--top-k", type=int, default=24, dest="top_k")
    parser.add_argument("--media-strategy", choices=["mobile-first", "desktop-first"], default="desktop-first")
    parser.add_argument("--animation-mode", choices=["auto", "none", "simple", "medium", "complex"], default="auto")
    parser.add_argument("--debug-tips", action="store_true")
    parser.add_argument(
        "--output",
        "-o",
        default=str(PROJECT_ROOT / "tmp" / "last-debug-generate.json"),
        help="Where to write the full JSON payload",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    app = create_app()
    payload = {
        "q": args.query,
        "temperature": args.temperature,
        "topK": args.top_k,
        "mediaStrategy": args.media_strategy,
        "animationMode": args.animation_mode,
        "debugTips": args.debug_tips,
    }
    if args.archetype != "auto":
        payload["archetype"] = args.archetype

    with app.test_client() as client:
        response = client.post("/api/engine/generate", json=payload)
        if response.status_code != 200:
            print(response.get_data(as_text=True), file=sys.stderr)
            raise SystemExit(response.status_code)
        data = response.get_json()

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    summary = {
        "output": str(output_path),
        "archetype": data.get("archetype"),
        "warnings": data.get("warnings", []),
        "metrics": data.get("metrics"),
        "mmss": data.get("mmss"),
        "completeness": data.get("completeness", {}),
        "selection": {
            "layout": data["assembly"]["selection"]["layout"]["entry"]["id"]
            if data["assembly"]["selection"].get("layout")
            else None,
            "typography": len(data["assembly"]["selection"].get("typography", [])),
            "styles": len(data["assembly"]["selection"].get("styles", [])),
            "components": len(data["assembly"]["selection"].get("components", [])),
            "interactions": len(data["assembly"]["selection"].get("interactions", [])),
            "utilities": len(data["assembly"]["selection"].get("utilities", [])),
        },
        "plan": [
            {
                "slot": step.get("slot"),
                "source": step.get("source"),
                "componentId": step.get("componentId"),
                "bundle": {
                    "base": ((step.get("bundle") or {}).get("base") or {}).get("id"),
                    "layouts": [item.get("id") for item in ((step.get("bundle") or {}).get("layouts") or [])],
                    "sections": [item.get("id") for item in ((step.get("bundle") or {}).get("sections") or [])],
                    "support": [item.get("id") for item in ((step.get("bundle") or {}).get("support") or [])],
                },
            }
            for step in data.get("plan", [])
        ],
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
