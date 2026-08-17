from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from backend.lexicon import load_lexicon


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Audit lexicon quality metadata and export noisy candidates.")
    parser.add_argument(
        "--output",
        "-o",
        default=str(PROJECT_ROOT / "tmp" / "lexicon-quality-audit.json"),
        help="Where to write the audit JSON",
    )
    parser.add_argument("--limit", type=int, default=200, help="Max noisy entries to export")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    entries = load_lexicon(force=True)

    quality = {
        "total": len(entries),
        "sectionCapable": 0,
        "lowValue": 0,
        "microFragments": 0,
        "richSections": 0,
    }
    by_category: dict[str, dict[str, int]] = {}
    noisy: list[dict[str, object]] = []

    for entry in entries:
        category = str(entry.get("category", "components"))
        meta = entry.get("meta") or {}
        bucket = by_category.setdefault(
            category,
            {"total": 0, "sectionCapable": 0, "lowValue": 0, "microFragments": 0, "richSections": 0},
        )
        bucket["total"] += 1

        if meta.get("section_capable"):
            quality["sectionCapable"] += 1
            bucket["sectionCapable"] += 1
        if meta.get("low_value_fragment"):
            quality["lowValue"] += 1
            bucket["lowValue"] += 1
        if meta.get("micro_fragment"):
            quality["microFragments"] += 1
            bucket["microFragments"] += 1
        if float(meta.get("section_richness") or 0.0) >= 0.4:
            quality["richSections"] += 1
            bucket["richSections"] += 1

        if meta.get("low_value_fragment") or (
            meta.get("micro_fragment") and float(meta.get("section_richness") or 0.0) < 0.2
        ):
            noisy.append(
                {
                    "id": entry.get("id"),
                    "category": category,
                    "name": entry.get("name"),
                    "family": entry.get("family"),
                    "entityLevel": meta.get("entity_level"),
                    "sectionRichness": meta.get("section_richness"),
                    "retrievalWeight": meta.get("retrieval_weight"),
                    "lowValue": bool(meta.get("low_value_fragment")),
                    "microFragment": bool(meta.get("micro_fragment")),
                }
            )

    noisy.sort(
        key=lambda item: (
            0 if item["lowValue"] else 1,
            item["sectionRichness"],
            str(item["category"]),
            str(item["id"]),
        )
    )

    payload = {
        "quality": quality,
        "byCategory": by_category,
        "noisyCandidates": noisy[: max(1, args.limit)],
    }

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"output": str(output_path), "quality": quality}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
