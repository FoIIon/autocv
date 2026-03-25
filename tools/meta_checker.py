#!/usr/bin/env python3
"""
meta_checker.py — Validate meta tags, Open Graph, Twitter Cards, and SEO elements.

Usage:
  python meta_checker.py --url http://localhost:3000
  python meta_checker.py --url https://alexmercer.dev --verbose
  python meta_checker.py --url http://localhost:3000 --output reports/meta-check.json
"""

import argparse
import json
import sys
from datetime import datetime
from urllib.parse import urljoin

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("ERROR: Required packages not installed.", file=sys.stderr)
    print("Run: pip install requests beautifulsoup4", file=sys.stderr)
    sys.exit(1)


# Required meta tags with validation rules
META_REQUIREMENTS = [
    {
        "id": "title",
        "label": "Page Title",
        "category": "Basic SEO",
        "selector": "title",
        "type": "tag",
        "min_length": 10,
        "max_length": 60,
    },
    {
        "id": "description",
        "label": "Meta Description",
        "category": "Basic SEO",
        "selector": 'meta[name="description"]',
        "type": "meta",
        "attr": "content",
        "min_length": 100,
        "max_length": 160,
    },
    {
        "id": "viewport",
        "label": "Viewport",
        "category": "Basic SEO",
        "selector": 'meta[name="viewport"]',
        "type": "meta",
        "attr": "content",
    },
    {
        "id": "charset",
        "label": "Charset",
        "category": "Basic SEO",
        "selector": "meta[charset]",
        "type": "exists",
    },
    # Open Graph
    {
        "id": "og:title",
        "label": "OG Title",
        "category": "Open Graph",
        "selector": 'meta[property="og:title"]',
        "type": "meta",
        "attr": "content",
        "min_length": 5,
    },
    {
        "id": "og:description",
        "label": "OG Description",
        "category": "Open Graph",
        "selector": 'meta[property="og:description"]',
        "type": "meta",
        "attr": "content",
        "min_length": 50,
    },
    {
        "id": "og:image",
        "label": "OG Image",
        "category": "Open Graph",
        "selector": 'meta[property="og:image"]',
        "type": "meta",
        "attr": "content",
    },
    {
        "id": "og:url",
        "label": "OG URL",
        "category": "Open Graph",
        "selector": 'meta[property="og:url"]',
        "type": "meta",
        "attr": "content",
    },
    {
        "id": "og:type",
        "label": "OG Type",
        "category": "Open Graph",
        "selector": 'meta[property="og:type"]',
        "type": "meta",
        "attr": "content",
    },
    # Twitter Card
    {
        "id": "twitter:card",
        "label": "Twitter Card",
        "category": "Twitter Card",
        "selector": 'meta[name="twitter:card"]',
        "type": "meta",
        "attr": "content",
        "expected_value": "summary_large_image",
    },
    {
        "id": "twitter:title",
        "label": "Twitter Title",
        "category": "Twitter Card",
        "selector": 'meta[name="twitter:title"]',
        "type": "meta",
        "attr": "content",
    },
    {
        "id": "twitter:description",
        "label": "Twitter Description",
        "category": "Twitter Card",
        "selector": 'meta[name="twitter:description"]',
        "type": "meta",
        "attr": "content",
    },
    {
        "id": "twitter:image",
        "label": "Twitter Image",
        "category": "Twitter Card",
        "selector": 'meta[name="twitter:image"]',
        "type": "meta",
        "attr": "content",
    },
    # Technical
    {
        "id": "canonical",
        "label": "Canonical URL",
        "category": "Technical",
        "selector": 'link[rel="canonical"]',
        "type": "link",
        "attr": "href",
    },
    {
        "id": "robots",
        "label": "Robots Meta",
        "category": "Technical",
        "selector": 'meta[name="robots"]',
        "type": "meta",
        "attr": "content",
        "optional": True,
    },
]


def fetch_page(url: str) -> BeautifulSoup:
    """Fetch a page and return BeautifulSoup object."""
    try:
        response = requests.get(
            url,
            timeout=15,
            headers={"User-Agent": "autocv-meta-checker/1.0"},
        )
        response.raise_for_status()
        return BeautifulSoup(response.text, "html.parser")
    except requests.RequestException as e:
        print(f"ERROR: Failed to fetch {url}: {e}", file=sys.stderr)
        sys.exit(1)


def check_meta_requirement(soup: BeautifulSoup, req: dict, base_url: str) -> dict:
    """Check a single meta requirement."""
    result = {
        "id": req["id"],
        "label": req["label"],
        "category": req["category"],
        "passed": False,
        "value": None,
        "issue": None,
        "optional": req.get("optional", False),
    }

    tag = soup.select_one(req["selector"])

    if req["type"] == "exists":
        result["passed"] = tag is not None
        if not result["passed"]:
            result["issue"] = "Tag not found"
        return result

    if not tag:
        result["issue"] = "Tag not found"
        return result

    if req["type"] == "tag":
        value = tag.get_text(strip=True)
    elif req["type"] in ("meta", "link"):
        value = tag.get(req.get("attr", "content"), "")
    else:
        value = ""

    result["value"] = value

    if not value:
        result["issue"] = "Empty value"
        return result

    # Length checks
    if "min_length" in req and len(value) < req["min_length"]:
        result["issue"] = f"Too short: {len(value)} chars (min: {req['min_length']})"
        return result

    if "max_length" in req and len(value) > req["max_length"]:
        result["issue"] = f"Too long: {len(value)} chars (max: {req['max_length']})"
        result["passed"] = True  # Warning, not failure
        result["warning"] = result["issue"]
        result["issue"] = None
        return result

    # Expected value check
    if "expected_value" in req and value != req["expected_value"]:
        result["issue"] = f"Expected '{req['expected_value']}', got '{value}'"
        return result

    result["passed"] = True
    return result


def check_structured_data(soup: BeautifulSoup) -> dict:
    """Check for JSON-LD structured data."""
    scripts = soup.find_all("script", type="application/ld+json")
    if not scripts:
        return {"found": False, "valid": False, "types": []}

    types = []
    all_valid = True

    for script in scripts:
        try:
            data = json.loads(script.string or "{}")
            schema_type = data.get("@type", "Unknown")
            types.append(schema_type)
        except json.JSONDecodeError:
            all_valid = False

    return {"found": True, "valid": all_valid, "types": types}


def print_results(results: list[dict], structured_data: dict, url: str, verbose: bool) -> None:
    """Print formatted results."""
    categories = {}
    for r in results:
        cat = r["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(r)

    total = len(results)
    passed = sum(1 for r in results if r["passed"] or r.get("optional", False))
    required_failed = [r for r in results if not r["passed"] and not r.get("optional", False)]

    print("\n" + "=" * 60)
    print(f"  Meta Tag Checker: {url}")
    print("=" * 60)
    print(f"  Score: {passed}/{total} checks passed")

    for cat_name, cat_results in categories.items():
        print(f"\n  {cat_name}:")
        for r in cat_results:
            if r["passed"]:
                icon = "✓"
                value_display = f" = \"{r['value'][:50]}\"" if r["value"] and verbose else ""
                warning = f" (WARNING: {r.get('warning')})" if r.get("warning") else ""
                print(f"    {icon} {r['label']}{value_display}{warning}")
            elif r.get("optional"):
                print(f"    ~ {r['label']} (optional, missing)")
            else:
                print(f"    ✗ {r['label']}: {r['issue']}")

    # Structured data
    print(f"\n  Structured Data:")
    if structured_data["found"]:
        types_str = ", ".join(structured_data["types"])
        valid_str = "✓ valid" if structured_data["valid"] else "✗ invalid JSON"
        print(f"    ✓ JSON-LD found: {types_str} ({valid_str})")
    else:
        print(f"    ~ JSON-LD not found (recommended)")

    print("\n" + "=" * 60)

    if required_failed:
        print(f"\n  REQUIRED FAILURES ({len(required_failed)}):")
        for r in required_failed:
            print(f"    ✗ {r['label']}: {r['issue']}")
        print()
    else:
        print(f"\n  All required checks passed!\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate meta tags and SEO elements.")
    parser.add_argument("--url", required=True, help="URL to check")
    parser.add_argument("--verbose", action="store_true", help="Show tag values in output")
    parser.add_argument("--output", help="Save results as JSON to this file")
    parser.add_argument(
        "--no-fail",
        action="store_true",
        help="Don't exit with error code on failures",
    )

    args = parser.parse_args()

    print(f"\nMeta Tag Checker")
    print(f"  URL: {args.url}\n")
    print("Fetching page...")

    soup = fetch_page(args.url)

    print("Checking meta requirements...")
    results = [
        check_meta_requirement(soup, req, args.url)
        for req in META_REQUIREMENTS
    ]

    structured_data = check_structured_data(soup)

    print_results(results, structured_data, args.url, args.verbose)

    # Save to JSON if requested
    if args.output:
        output_data = {
            "url": args.url,
            "checked_at": datetime.utcnow().isoformat(),
            "summary": {
                "total": len(results),
                "passed": sum(1 for r in results if r["passed"]),
                "failed": sum(1 for r in results if not r["passed"] and not r.get("optional")),
            },
            "results": results,
            "structured_data": structured_data,
        }
        with open(args.output, "w") as f:
            json.dump(output_data, f, indent=2)
        print(f"Results saved to: {args.output}\n")

    # Exit code
    required_failed = [r for r in results if not r["passed"] and not r.get("optional")]
    if required_failed and not args.no_fail:
        sys.exit(1)


if __name__ == "__main__":
    main()
