#!/usr/bin/env python3
"""
lighthouse_audit.py — Run Lighthouse against a URL and parse/report results.

Usage:
  python lighthouse_audit.py --url http://localhost:3000
  python lighthouse_audit.py --url https://alexmercer.dev --output-dir ./reports/lighthouse
  python lighthouse_audit.py --url http://localhost:3000 --threshold-performance 90
"""

import argparse
import json
import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path


CATEGORIES = {
    "performance": "Performance",
    "accessibility": "Accessibility",
    "best-practices": "Best Practices",
    "seo": "SEO",
}

SCORE_COLORS = {
    "pass": "\033[92m",   # Green
    "average": "\033[93m",  # Yellow
    "fail": "\033[91m",   # Red
    "reset": "\033[0m",
}


def color_score(score: int) -> str:
    """Return colored score string based on value."""
    if score >= 90:
        color = SCORE_COLORS["pass"]
        icon = "✓"
    elif score >= 50:
        color = SCORE_COLORS["average"]
        icon = "~"
    else:
        color = SCORE_COLORS["fail"]
        icon = "✗"
    return f"{color}{icon} {score}{SCORE_COLORS['reset']}"


def check_lighthouse_installed() -> bool:
    """Check if Lighthouse CLI is available."""
    try:
        result = subprocess.run(
            ["lighthouse", "--version"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def run_lighthouse(url: str, output_path: str) -> dict:
    """
    Run Lighthouse CLI and return parsed JSON results.

    Args:
        url: Target URL to audit
        output_path: Path (without extension) to write JSON/HTML reports

    Returns:
        Parsed Lighthouse results dict
    """
    cmd = [
        "lighthouse",
        url,
        "--output=json",
        "--output=html",
        f"--output-path={output_path}",
        "--chrome-flags=--headless --no-sandbox --disable-gpu",
        "--quiet",
    ]

    print(f"  Running: lighthouse {url} ...")
    start = time.time()

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120,
        )
    except subprocess.TimeoutExpired:
        print("ERROR: Lighthouse timed out after 120 seconds.", file=sys.stderr)
        sys.exit(1)
    except FileNotFoundError:
        print("ERROR: 'lighthouse' command not found. Install with: npm install -g lighthouse", file=sys.stderr)
        sys.exit(1)

    elapsed = time.time() - start
    print(f"  Completed in {elapsed:.1f}s")

    # Lighthouse writes files like output_path.report.json and output_path.report.html
    json_file = f"{output_path}.report.json"

    if not os.path.exists(json_file):
        # Try the plain path
        json_file = f"{output_path}.json"

    if not os.path.exists(json_file):
        print(f"ERROR: Lighthouse JSON output not found at {json_file}", file=sys.stderr)
        print(f"Lighthouse stdout: {result.stdout[:500]}", file=sys.stderr)
        print(f"Lighthouse stderr: {result.stderr[:500]}", file=sys.stderr)
        sys.exit(1)

    with open(json_file) as f:
        return json.load(f)


def extract_scores(lh_data: dict) -> dict[str, int]:
    """Extract category scores from Lighthouse JSON."""
    scores = {}
    categories = lh_data.get("categories", {})
    for key in CATEGORIES:
        cat = categories.get(key, {})
        score = cat.get("score")
        if score is not None:
            scores[key] = round(score * 100)
        else:
            scores[key] = -1
    return scores


def extract_metrics(lh_data: dict) -> dict[str, str]:
    """Extract key performance metrics."""
    audits = lh_data.get("audits", {})
    metrics = {}

    metric_keys = {
        "first-contentful-paint": "FCP",
        "largest-contentful-paint": "LCP",
        "total-blocking-time": "TBT",
        "cumulative-layout-shift": "CLS",
        "speed-index": "Speed Index",
        "interactive": "TTI",
    }

    for key, label in metric_keys.items():
        audit = audits.get(key, {})
        display_value = audit.get("displayValue", "N/A")
        metrics[label] = display_value

    return metrics


def check_thresholds(scores: dict[str, int], thresholds: dict[str, int]) -> list[str]:
    """Return list of failed threshold checks."""
    failures = []
    for key, min_score in thresholds.items():
        actual = scores.get(key, -1)
        if actual < min_score:
            label = CATEGORIES.get(key, key)
            failures.append(f"{label}: {actual} < {min_score} (threshold)")
    return failures


def append_to_history(output_dir: str, url: str, scores: dict[str, int]) -> None:
    """Append scores to CSV history file."""
    history_file = Path(output_dir) / "scores-history.csv"
    timestamp = datetime.utcnow().isoformat()

    if not history_file.exists():
        header = "timestamp,url,performance,accessibility,best-practices,seo\n"
        history_file.write_text(header)

    row = (
        f"{timestamp},{url},"
        f"{scores.get('performance', -1)},"
        f"{scores.get('accessibility', -1)},"
        f"{scores.get('best-practices', -1)},"
        f"{scores.get('seo', -1)}\n"
    )

    with open(history_file, "a") as f:
        f.write(row)

    print(f"  Score history updated: {history_file}")


def print_summary(url: str, scores: dict[str, int], metrics: dict[str, str]) -> None:
    """Print a formatted summary table."""
    print("\n" + "=" * 52)
    print(f"  Lighthouse Audit: {url}")
    print("=" * 52)

    print("\n  Category Scores:")
    for key, label in CATEGORIES.items():
        score = scores.get(key, -1)
        if score >= 0:
            bar = "█" * (score // 10) + "░" * (10 - score // 10)
            print(f"    {label:<20} {bar} {color_score(score)}")

    print("\n  Performance Metrics:")
    for label, value in metrics.items():
        print(f"    {label:<20} {value}")

    print("=" * 52 + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Run Lighthouse audit and parse results."
    )
    parser.add_argument("--url", required=True, help="URL to audit")
    parser.add_argument(
        "--output-dir",
        default="./reports/lighthouse",
        help="Directory to save reports (default: ./reports/lighthouse)",
    )
    parser.add_argument(
        "--threshold-performance",
        type=int,
        default=85,
        help="Minimum performance score (default: 85)",
    )
    parser.add_argument(
        "--threshold-accessibility",
        type=int,
        default=95,
        help="Minimum accessibility score (default: 95)",
    )
    parser.add_argument(
        "--threshold-best-practices",
        type=int,
        default=90,
        help="Minimum best-practices score (default: 90)",
    )
    parser.add_argument(
        "--threshold-seo",
        type=int,
        default=90,
        help="Minimum SEO score (default: 90)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Skip actual Lighthouse run, use mock data (for testing)",
    )

    args = parser.parse_args()

    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    output_path = output_dir / f"report-{timestamp}"

    print(f"\nLighthouse Audit")
    print(f"  URL:        {args.url}")
    print(f"  Output dir: {output_dir}")

    if args.dry_run:
        print("  [DRY RUN] Using mock scores...")
        scores = {"performance": 88, "accessibility": 97, "best-practices": 92, "seo": 100}
        metrics = {"FCP": "1.2s", "LCP": "2.1s", "TBT": "45ms", "CLS": "0.02"}
    else:
        if not check_lighthouse_installed():
            print("ERROR: Lighthouse is not installed.", file=sys.stderr)
            print("Install with: npm install -g lighthouse", file=sys.stderr)
            sys.exit(1)

        lh_data = run_lighthouse(args.url, str(output_path))
        scores = extract_scores(lh_data)
        metrics = extract_metrics(lh_data)

    print_summary(args.url, scores, metrics)

    thresholds = {
        "performance": args.threshold_performance,
        "accessibility": args.threshold_accessibility,
        "best-practices": args.threshold_best_practices,
        "seo": args.threshold_seo,
    }

    failures = check_thresholds(scores, thresholds)

    append_to_history(str(output_dir), args.url, scores)

    if failures:
        print("THRESHOLD FAILURES:")
        for f in failures:
            print(f"  ✗ {f}")
        print()
        sys.exit(1)
    else:
        print("All threshold checks passed!\n")


if __name__ == "__main__":
    main()
