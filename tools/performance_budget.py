#!/usr/bin/env python3
"""
performance_budget.py — Check Next.js build output against bundle size budgets.

Usage:
  python performance_budget.py
  python performance_budget.py --stats-file site/.next/build-manifest.json
  python performance_budget.py --budget-kb 250 --verbose
"""

import argparse
import gzip
import json
import os
import sys
from pathlib import Path


# Default budgets in KB (uncompressed)
DEFAULT_BUDGETS = {
    "total_initial_js": 300,    # Total JS loaded on first page visit
    "total_initial_css": 50,    # Total CSS loaded on first page visit
    "largest_chunk": 150,       # Largest single JS chunk
    "layout_js": 80,            # layout.js (shared across all pages)
    "page_js": 100,             # page.js (main page bundle)
}


def get_file_size_kb(filepath: str) -> float:
    """Get file size in KB."""
    try:
        return os.path.getsize(filepath) / 1024
    except OSError:
        return 0.0


def estimate_gzip_size_kb(filepath: str) -> float:
    """Estimate gzipped file size in KB."""
    try:
        with open(filepath, "rb") as f:
            content = f.read()
        compressed = gzip.compress(content, compresslevel=9)
        return len(compressed) / 1024
    except OSError:
        return 0.0


def find_next_build_dir(start_dir: str = ".") -> Path | None:
    """Find .next build directory by walking up from start_dir."""
    path = Path(start_dir).resolve()
    for _ in range(5):  # Walk up 5 levels max
        next_dir = path / ".next"
        if next_dir.exists():
            return next_dir
        parent = path.parent
        if parent == path:
            break
        path = parent

    # Also try common locations
    for candidate in [
        Path("/home/admin/Programmation/autocv/site/.next"),
        Path("site/.next"),
        Path(".next"),
    ]:
        if candidate.exists():
            return candidate

    return None


def load_build_manifest(next_dir: Path) -> dict | None:
    """Load Next.js build manifest."""
    manifest_path = next_dir / "build-manifest.json"
    if not manifest_path.exists():
        return None
    with open(manifest_path) as f:
        return json.load(f)


def load_app_paths_manifest(next_dir: Path) -> dict | None:
    """Load app paths manifest for App Router."""
    manifest_path = next_dir / "app-paths-manifest.json"
    if not manifest_path.exists():
        manifest_path = next_dir / "server" / "app-paths-manifest.json"
    if not manifest_path.exists():
        return None
    with open(manifest_path) as f:
        return json.load(f)


def analyze_chunks(next_dir: Path, verbose: bool) -> dict:
    """Analyze all JS/CSS chunks in the build output."""
    static_dir = next_dir / "static"
    chunks_dir = static_dir / "chunks"

    if not static_dir.exists():
        return {"error": f"Static dir not found: {static_dir}"}

    js_files = []
    css_files = []

    # Walk all static subdirectories
    for root, dirs, files in os.walk(static_dir):
        for filename in files:
            filepath = Path(root) / filename
            if filename.endswith(".js"):
                size_kb = get_file_size_kb(str(filepath))
                gzip_kb = estimate_gzip_size_kb(str(filepath))
                js_files.append({
                    "name": filename,
                    "path": str(filepath.relative_to(next_dir)),
                    "size_kb": round(size_kb, 2),
                    "gzip_kb": round(gzip_kb, 2),
                })
            elif filename.endswith(".css"):
                size_kb = get_file_size_kb(str(filepath))
                css_files.append({
                    "name": filename,
                    "path": str(filepath.relative_to(next_dir)),
                    "size_kb": round(size_kb, 2),
                })

    # Sort by size descending
    js_files.sort(key=lambda x: x["size_kb"], reverse=True)
    css_files.sort(key=lambda x: x["size_kb"], reverse=True)

    total_js = sum(f["size_kb"] for f in js_files)
    total_js_gzip = sum(f["gzip_kb"] for f in js_files)
    total_css = sum(f["size_kb"] for f in css_files)

    return {
        "js_files": js_files,
        "css_files": css_files,
        "total_js_kb": round(total_js, 2),
        "total_js_gzip_kb": round(total_js_gzip, 2),
        "total_css_kb": round(total_css, 2),
        "largest_js_kb": js_files[0]["size_kb"] if js_files else 0,
        "largest_js_name": js_files[0]["name"] if js_files else "N/A",
    }


def check_budgets(analysis: dict, budgets: dict) -> list[dict]:
    """Check analysis against budget limits."""
    violations = []

    checks = [
        ("total_initial_js", analysis.get("total_js_kb", 0), "Total JS"),
        ("total_initial_css", analysis.get("total_css_kb", 0), "Total CSS"),
        ("largest_chunk", analysis.get("largest_js_kb", 0), "Largest JS chunk"),
    ]

    for budget_key, actual_kb, label in checks:
        budget_kb = budgets.get(budget_key, float("inf"))
        if actual_kb > budget_kb:
            violations.append({
                "label": label,
                "actual_kb": actual_kb,
                "budget_kb": budget_kb,
                "over_by_kb": round(actual_kb - budget_kb, 1),
            })

    return violations


def print_report(analysis: dict, violations: list[dict], budgets: dict, verbose: bool) -> None:
    """Print formatted performance budget report."""
    print("\n" + "=" * 60)
    print("  Performance Budget Report")
    print("=" * 60)

    # Summary
    total_js = analysis.get("total_js_kb", 0)
    total_js_gzip = analysis.get("total_js_gzip_kb", 0)
    total_css = analysis.get("total_css_kb", 0)
    largest_js = analysis.get("largest_js_kb", 0)

    def budget_icon(actual: float, limit: float) -> str:
        ratio = actual / limit if limit > 0 else 1
        if ratio <= 0.7:
            return "\033[92m✓\033[0m"
        elif ratio <= 1.0:
            return "\033[93m~\033[0m"
        else:
            return "\033[91m✗\033[0m"

    print(f"\n  Bundle Sizes:")
    print(f"    {budget_icon(total_js, budgets['total_initial_js'])} Total JS:        {total_js:.1f} KB ({total_js_gzip:.1f} KB gzipped) / {budgets['total_initial_js']} KB budget")
    print(f"    {budget_icon(total_css, budgets['total_initial_css'])} Total CSS:       {total_css:.1f} KB / {budgets['total_initial_css']} KB budget")
    print(f"    {budget_icon(largest_js, budgets['largest_chunk'])} Largest chunk:   {largest_js:.1f} KB [{analysis.get('largest_js_name', 'N/A')}] / {budgets['largest_chunk']} KB budget")

    if verbose:
        print(f"\n  Top 10 JS Chunks:")
        for chunk in analysis.get("js_files", [])[:10]:
            bar_width = min(int(chunk["size_kb"] / 5), 30)
            bar = "█" * bar_width
            print(f"    {chunk['size_kb']:>7.1f} KB  {bar} {chunk['name'][:40]}")

        if analysis.get("css_files"):
            print(f"\n  CSS Files:")
            for css in analysis.get("css_files", []):
                print(f"    {css['size_kb']:>7.1f} KB  {css['name'][:40]}")

    if violations:
        print(f"\n  BUDGET VIOLATIONS ({len(violations)}):")
        for v in violations:
            print(f"    ✗ {v['label']}: {v['actual_kb']:.1f} KB (over by {v['over_by_kb']:.1f} KB)")
        print("\n  Suggested fixes:")
        print("    - Run: cd site && npx @next/bundle-analyzer")
        print("    - Check for large dependencies with no tree-shaking")
        print("    - Verify 'use client' is not overused (adds to client bundle)")
        print("    - Consider dynamic imports for heavy components")
    else:
        print(f"\n  All budget checks passed!")

    print("=" * 60 + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Check Next.js build against performance budget.")
    parser.add_argument("--stats-file", help="Path to build-manifest.json (optional)")
    parser.add_argument("--next-dir", help="Path to .next directory (auto-detected if omitted)")
    parser.add_argument(
        "--budget-kb",
        type=int,
        default=300,
        help="Total JS budget in KB (default: 300)",
    )
    parser.add_argument("--verbose", action="store_true", help="Show individual chunk sizes")
    parser.add_argument(
        "--no-fail",
        action="store_true",
        help="Don't exit with error code on budget violations",
    )

    args = parser.parse_args()

    # Find .next directory
    if args.next_dir:
        next_dir = Path(args.next_dir)
    else:
        next_dir = find_next_build_dir()

    if not next_dir or not next_dir.exists():
        print("ERROR: .next directory not found.", file=sys.stderr)
        print("Run 'npm run build' in the site directory first.", file=sys.stderr)
        sys.exit(1)

    print(f"\nPerformance Budget Check")
    print(f"  .next dir: {next_dir}\n")

    budgets = {**DEFAULT_BUDGETS, "total_initial_js": args.budget_kb}

    analysis = analyze_chunks(next_dir, args.verbose)

    if "error" in analysis:
        print(f"ERROR: {analysis['error']}", file=sys.stderr)
        sys.exit(1)

    js_count = len(analysis.get("js_files", []))
    css_count = len(analysis.get("css_files", []))
    print(f"  Found {js_count} JS files, {css_count} CSS files")

    violations = check_budgets(analysis, budgets)
    print_report(analysis, violations, budgets, args.verbose)

    if violations and not args.no_fail:
        sys.exit(1)


if __name__ == "__main__":
    main()
