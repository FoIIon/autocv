#!/usr/bin/env python3
"""
screenshot_compare.py — Take screenshots of key pages and compare against baseline.

Uses Playwright for browser automation. Install with:
  pip install playwright
  playwright install chromium

Usage:
  python screenshot_compare.py --url http://localhost:3000 --capture-baseline
  python screenshot_compare.py --url http://localhost:3000 --compare
  python screenshot_compare.py --url http://localhost:3000 --baseline ./screenshots/baseline --output ./screenshots/current
"""

import argparse
import os
import sys
from datetime import datetime
from pathlib import Path


# Key sections to screenshot
SECTIONS_TO_CAPTURE = [
    {"name": "hero", "selector": "#about", "viewport": {"width": 1440, "height": 900}},
    {"name": "manifesto", "selector": "#manifesto", "viewport": {"width": 1440, "height": 900}},
    {"name": "projects", "selector": "#projects", "viewport": {"width": 1440, "height": 900}},
    {"name": "playground", "selector": "#playground", "viewport": {"width": 1440, "height": 900}},
    {"name": "skills", "selector": "#skills", "viewport": {"width": 1440, "height": 900}},
    {"name": "timeline", "selector": "#timeline", "viewport": {"width": 1440, "height": 900}},
    {"name": "contact", "selector": "#contact", "viewport": {"width": 1440, "height": 900}},
    # Mobile viewport
    {"name": "hero-mobile", "selector": "#about", "viewport": {"width": 375, "height": 812}},
    {"name": "projects-mobile", "selector": "#projects", "viewport": {"width": 375, "height": 812}},
]


def check_playwright_installed() -> bool:
    """Check if Playwright is available."""
    try:
        import playwright  # noqa: F401
        return True
    except ImportError:
        return False


def capture_screenshots(url: str, output_dir: str, wait_ms: int = 2000) -> list[str]:
    """
    Capture screenshots of key sections using Playwright.

    Returns list of saved file paths.
    """
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("ERROR: Playwright not installed. Run: pip install playwright && playwright install chromium", file=sys.stderr)
        sys.exit(1)

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    saved_files = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for section in SECTIONS_TO_CAPTURE:
            print(f"  Capturing: {section['name']} @ {section['viewport']['width']}px...")

            context = browser.new_context(
                viewport=section["viewport"],
                color_scheme="dark",
            )
            page = context.new_page()

            try:
                page.goto(url, wait_until="networkidle", timeout=30000)
                page.wait_for_timeout(wait_ms)  # Wait for animations

                # Scroll to section
                if section["selector"]:
                    el = page.query_selector(section["selector"])
                    if el:
                        el.scroll_into_view_if_needed()
                        page.wait_for_timeout(800)  # Wait for scroll animation

                filename = f"{section['name']}.png"
                filepath = output_path / filename
                page.screenshot(path=str(filepath), full_page=False)
                saved_files.append(str(filepath))
                print(f"    Saved: {filepath}")

            except Exception as e:
                print(f"    WARNING: Failed to capture {section['name']}: {e}", file=sys.stderr)
            finally:
                context.close()

        browser.close()

    return saved_files


def compare_screenshots(baseline_dir: str, current_dir: str, threshold_pct: float = 5.0) -> list[dict]:
    """
    Compare current screenshots against baseline.
    Returns list of diffs that exceed threshold.

    Note: Requires Pillow for pixel comparison.
    """
    try:
        from PIL import Image
        import numpy as np
    except ImportError:
        print("ERROR: Pillow and numpy required for comparison.", file=sys.stderr)
        print("Install: pip install Pillow numpy", file=sys.stderr)
        sys.exit(1)

    baseline_path = Path(baseline_dir)
    current_path = Path(current_dir)
    diffs = []

    baseline_files = list(baseline_path.glob("*.png"))

    if not baseline_files:
        print(f"WARNING: No baseline screenshots found in {baseline_dir}", file=sys.stderr)
        return []

    for baseline_file in baseline_files:
        current_file = current_path / baseline_file.name

        if not current_file.exists():
            diffs.append({
                "name": baseline_file.stem,
                "issue": "missing",
                "diff_pct": 100.0,
            })
            print(f"  MISSING: {baseline_file.name}")
            continue

        baseline_img = np.array(Image.open(baseline_file).convert("RGB"), dtype=float)
        current_img = np.array(Image.open(current_file).convert("RGB"), dtype=float)

        if baseline_img.shape != current_img.shape:
            diffs.append({
                "name": baseline_file.stem,
                "issue": f"size mismatch: {baseline_img.shape} vs {current_img.shape}",
                "diff_pct": 100.0,
            })
            print(f"  SIZE MISMATCH: {baseline_file.name}")
            continue

        diff = np.abs(baseline_img - current_img)
        diff_pct = (diff.mean() / 255.0) * 100.0

        status = "✓" if diff_pct <= threshold_pct else "✗"
        print(f"  {status} {baseline_file.name}: {diff_pct:.2f}% diff")

        if diff_pct > threshold_pct:
            diffs.append({
                "name": baseline_file.stem,
                "diff_pct": diff_pct,
                "issue": f"{diff_pct:.1f}% pixel difference exceeds {threshold_pct}% threshold",
            })

    return diffs


def main() -> None:
    parser = argparse.ArgumentParser(description="Screenshot capture and comparison tool.")
    parser.add_argument("--url", required=True, help="Target URL to screenshot")
    parser.add_argument(
        "--capture-baseline",
        action="store_true",
        help="Capture screenshots as new baseline",
    )
    parser.add_argument(
        "--compare",
        action="store_true",
        help="Capture current and compare against baseline",
    )
    parser.add_argument(
        "--baseline",
        default="./reports/screenshots/baseline",
        help="Baseline screenshots directory",
    )
    parser.add_argument(
        "--output",
        default="./reports/screenshots/current",
        help="Output directory for current screenshots",
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=5.0,
        help="Maximum acceptable pixel difference percentage (default: 5.0)",
    )
    parser.add_argument(
        "--wait-ms",
        type=int,
        default=2000,
        help="Milliseconds to wait after page load (default: 2000)",
    )

    args = parser.parse_args()

    if not args.capture_baseline and not args.compare:
        parser.error("Specify --capture-baseline or --compare (or both)")

    print(f"\nScreenshot Tool")
    print(f"  URL:      {args.url}")
    print(f"  Baseline: {args.baseline}")
    print(f"  Output:   {args.output}")
    print()

    if args.capture_baseline:
        print("Capturing baseline screenshots...")
        files = capture_screenshots(args.url, args.baseline, args.wait_ms)
        print(f"\nBaseline captured: {len(files)} screenshots saved to {args.baseline}")

    if args.compare:
        timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
        current_dir = f"{args.output}/{timestamp}"

        print(f"Capturing current screenshots...")
        files = capture_screenshots(args.url, current_dir, args.wait_ms)
        print(f"\nCurrent screenshots saved: {current_dir}")

        print(f"\nComparing against baseline ({args.baseline})...")
        diffs = compare_screenshots(args.baseline, current_dir, args.threshold)

        if diffs:
            print(f"\nFOUND {len(diffs)} visual regression(s):")
            for diff in diffs:
                print(f"  ✗ {diff['name']}: {diff['issue']}")
            print(f"\nReview the screenshots in: {current_dir}")
            sys.exit(1)
        else:
            print("\nNo visual regressions detected!")


if __name__ == "__main__":
    main()
