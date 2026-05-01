from __future__ import annotations

from pathlib import Path
import sys


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT))
sys.path.insert(0, str(REPO_ROOT / "src" / "gateway"))

from src.gateway.core.runtime_contract import (
    EXECUTION_NETWORKS,
    OBSERVER_NETWORKS,
    PUBLIC_TOOL_NAMES,
    SUPPORT_MATRIX,
)

README_PATH = REPO_ROOT / "README.md"
SKILL_PATH = REPO_ROOT / "src" / "web_dashboard" / "public" / "docs" / "skill.md"
DOCS_CONTENT_PATH = REPO_ROOT / "src" / "web_dashboard" / "src" / "content" / "docsContent.ts"

SUPPORT_MARKERS = {
    "stable": [
        "Base and Ethereum transfers",
        "HITL approval enforcement",
        "dashboard telemetry",
        "MCP integration",
    ],
    "beta": [
        "Commerce search and browser-assisted checkout handover",
        "browser handover",
    ],
    "experimental": [
        "M-Pesa",
        "fiat-adjacent payment rails",
    ],
}


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _assert_contains(haystack: str, needle: str, source: str) -> None:
    if needle not in haystack:
        raise AssertionError(f"Missing `{needle}` in {source}.")


def main() -> None:
    readme = _read(README_PATH)
    skill = _read(SKILL_PATH)
    docs = _read(DOCS_CONTENT_PATH)
    combined_docs = "\n".join([readme, skill, docs])

    for tool_name in PUBLIC_TOOL_NAMES:
        _assert_contains(readme, tool_name, README_PATH.name)
        _assert_contains(skill, tool_name, SKILL_PATH.name)
        _assert_contains(combined_docs, tool_name, "public docs")

    for network in EXECUTION_NETWORKS + OBSERVER_NETWORKS:
        _assert_contains(combined_docs.lower(), network, "public docs")

    for tier_name, payload in SUPPORT_MATRIX.items():
        _assert_contains(readme, tier_name, README_PATH.name)
        _assert_contains(skill, tier_name, SKILL_PATH.name)
        _assert_contains(docs.lower(), tier_name, DOCS_CONTENT_PATH.name)
        for marker in SUPPORT_MARKERS[tier_name]:
            _assert_contains(combined_docs, marker, "public docs")

    _assert_contains(
        docs,
        "no public swap execution tool is exposed in the current gateway runtime",
        DOCS_CONTENT_PATH.name,
    )
    _assert_contains(
        readme,
        "The canonical docs experience lives at:",
        README_PATH.name,
    )


if __name__ == "__main__":
    main()
