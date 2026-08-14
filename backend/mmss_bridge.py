from __future__ import annotations

import math
from dataclasses import asdict, dataclass

import numpy as np
from bs4 import BeautifulSoup


CONTENT_TAGS = {
    "p",
    "span",
    "a",
    "button",
    "label",
    "li",
    "dt",
    "dd",
    "strong",
    "em",
    "small",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "img",
    "input",
    "textarea",
    "select",
    "option",
    "video",
    "canvas",
    "svg",
}

STRUCTURE_TAGS = {
    "div",
    "section",
    "article",
    "main",
    "aside",
    "nav",
    "header",
    "footer",
    "form",
    "ul",
    "ol",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
}

SUSPICIOUS_ATTR_PREFIXES = ("data-", "aria-")
SUSPICIOUS_ATTR_NAMES = {
    "style",
    "onclick",
    "onchange",
    "oninput",
    "onmouseover",
    "onmouseout",
    "onfocus",
    "onblur",
}


def _clamp(value: float, minimum: float = 0.0, maximum: float = 1.0) -> float:
    return max(minimum, min(maximum, value))


@dataclass(slots=True)
class MMSSDetails:
    N_total: int
    N_content: int
    N_structure: int
    mu_depth: float
    sigma_depth: float
    N_empty_wrappers: int
    C_total: int
    C_unique: int
    A_total: int
    A_suspicious: int
    N_levels: int
    N_nodes: int


class MMSSMetrics:
    def compute(self, html: str) -> dict[str, float | dict[str, float | int]]:
        soup = BeautifulSoup(html or "", "lxml")
        root = soup.body or soup
        nodes = [node for node in root.find_all(True)]

        if not nodes:
            details = MMSSDetails(
                N_total=0,
                N_content=0,
                N_structure=0,
                mu_depth=0.0,
                sigma_depth=0.0,
                N_empty_wrappers=0,
                C_total=0,
                C_unique=0,
                A_total=0,
                A_suspicious=0,
                N_levels=0,
                N_nodes=0,
            )
            return {
                "V": 0.0,
                "S": 0.0,
                "N": 1.0,
                "Df": 0.0,
                "QEC": 0.0,
                "details": asdict(details),
            }

        depths = [len(node.find_parents()) for node in nodes]
        class_tokens: list[str] = []
        suspicious_attrs = 0
        total_attrs = 0
        content_nodes = 0
        structure_nodes = 0
        empty_wrappers = 0

        for node in nodes:
            name = node.name.lower()
            text = node.get_text(strip=True)
            children = node.find_all(True, recursive=False)

            if name in CONTENT_TAGS or text:
                content_nodes += 1
            if name in STRUCTURE_TAGS:
                structure_nodes += 1
                if not text and not children and not node.attrs:
                    empty_wrappers += 1

            class_values = node.get("class", [])
            if isinstance(class_values, str):
                class_tokens.extend(class_values.split())
            else:
                class_tokens.extend(class_values)

            for attr_name in node.attrs:
                total_attrs += 1
                lowered = attr_name.lower()
                if lowered in SUSPICIOUS_ATTR_NAMES or lowered.startswith(SUSPICIOUS_ATTR_PREFIXES):
                    suspicious_attrs += 1

        total_nodes = len(nodes)
        mu_depth = float(np.mean(depths)) if depths else 0.0
        sigma_depth = float(np.std(depths)) if depths else 0.0
        class_total = len(class_tokens)
        class_unique = len(set(class_tokens))
        levels = len(set(depths))

        details = MMSSDetails(
            N_total=total_nodes,
            N_content=content_nodes,
            N_structure=structure_nodes,
            mu_depth=mu_depth,
            sigma_depth=sigma_depth,
            N_empty_wrappers=empty_wrappers,
            C_total=class_total,
            C_unique=class_unique,
            A_total=total_attrs,
            A_suspicious=suspicious_attrs,
            N_levels=levels,
            N_nodes=total_nodes,
        )

        volume = _clamp((content_nodes + 0.5 * structure_nodes) / max(total_nodes, 1))
        stability = 1 - (
            0.6 * (sigma_depth / max(mu_depth, 1.0))
            + 0.4 * (empty_wrappers / max(structure_nodes, 1))
        )
        noise = 1 - (
            0.7 * (class_unique / max(class_total, 1))
            + 0.3 * (1 - suspicious_attrs / max(total_attrs, 1))
        )

        if total_nodes > 1 and levels > 1:
            fractal_dimension = math.log(levels) / math.log(total_nodes)
        else:
            fractal_dimension = 0.0

        stability = _clamp(stability)
        noise = _clamp(noise)
        fractal_dimension = _clamp(fractal_dimension)
        qec = _clamp(0.2 * volume + 0.35 * stability + 0.35 * (1 - noise) + 0.1 * fractal_dimension)

        return {
            "V": round(volume, 4),
            "S": round(stability, 4),
            "N": round(noise, 4),
            "Df": round(fractal_dimension, 4),
            "QEC": round(qec, 4),
            "details": asdict(details),
        }
