#!/usr/bin/env python3
"""
link_checker.py — Check all links on a page for broken/redirect issues.

Usage:
  python link_checker.py --url http://localhost:3000
  python link_checker.py --url https://alexmercer.dev --verbose
  python link_checker.py --url http://localhost:3000 --ignore-external
"""

import argparse
import sys
import time
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin, urlparse

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("ERROR: Required packages not installed.", file=sys.stderr)
    print("Run: pip install requests beautifulsoup4", file=sys.stderr)
    sys.exit(1)


TIMEOUT_SECONDS = 10
MAX_WORKERS = 10
USER_AGENT = "autocv-link-checker/1.0"


def get_links_from_page(url: str, session: requests.Session) -> tuple[list[str], str]:
    """
    Fetch a page and extract all links.

    Returns (list_of_links, page_title)
    """
    try:
        response = session.get(url, timeout=TIMEOUT_SECONDS)
        response.raise_for_status()
    except requests.RequestException as e:
        return [], str(e)

    soup = BeautifulSoup(response.text, "html.parser")
    title = soup.title.string if soup.title else "No title"

    links = []
    for tag in soup.find_all(["a", "link", "script", "img"]):
        href = tag.get("href") or tag.get("src")
        if href:
            # Resolve relative URLs
            absolute = urljoin(url, href)
            # Filter out javascript:, mailto:, tel:, # anchors
            parsed = urlparse(absolute)
            if parsed.scheme in ("http", "https"):
                links.append(absolute)

    return list(set(links)), title


def check_link(url: str, session: requests.Session, verbose: bool = False) -> dict:
    """
    Check a single link and return result dict.
    """
    start = time.time()
    result = {
        "url": url,
        "status": None,
        "ok": False,
        "redirect": None,
        "error": None,
        "response_time_ms": None,
    }

    try:
        response = session.head(
            url,
            timeout=TIMEOUT_SECONDS,
            allow_redirects=True,
        )
        elapsed = (time.time() - start) * 1000

        result["status"] = response.status_code
        result["ok"] = 200 <= response.status_code < 400
        result["response_time_ms"] = round(elapsed)

        if response.history:
            result["redirect"] = response.url

        if verbose:
            status_icon = "✓" if result["ok"] else "✗"
            redirect_info = f" → {result['redirect']}" if result["redirect"] else ""
            print(f"  {status_icon} [{response.status_code}] {url}{redirect_info} ({round(elapsed)}ms)")

    except requests.exceptions.Timeout:
        result["error"] = "Timeout"
        result["ok"] = False
        if verbose:
            print(f"  ✗ [TIMEOUT] {url}")

    except requests.exceptions.ConnectionError as e:
        result["error"] = f"Connection error: {str(e)[:60]}"
        result["ok"] = False
        if verbose:
            print(f"  ✗ [CONNECTION ERROR] {url}")

    except requests.exceptions.RequestException as e:
        result["error"] = str(e)[:80]
        result["ok"] = False
        if verbose:
            print(f"  ✗ [ERROR] {url}: {result['error']}")

    return result


def check_links_parallel(
    links: list[str],
    ignore_external: bool,
    base_domain: str,
    verbose: bool,
) -> list[dict]:
    """Check multiple links in parallel."""
    if ignore_external:
        links = [l for l in links if urlparse(l).netloc == base_domain]

    results = []
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_url = {
            executor.submit(check_link, url, session, verbose): url
            for url in links
        }
        for future in as_completed(future_to_url):
            try:
                result = future.result()
                results.append(result)
            except Exception as e:
                url = future_to_url[future]
                results.append({
                    "url": url,
                    "status": None,
                    "ok": False,
                    "error": str(e),
                    "response_time_ms": None,
                })

    return results


def print_summary(results: list[dict], verbose: bool) -> None:
    """Print a formatted summary of link check results."""
    total = len(results)
    passed = sum(1 for r in results if r["ok"])
    failed = [r for r in results if not r["ok"]]

    # Group failures by type
    broken = [r for r in failed if r["status"] and r["status"] >= 400]
    errored = [r for r in failed if r["error"]]
    redirects = [r for r in results if r["redirect"]]

    print("\n" + "=" * 60)
    print(f"  Link Check Summary")
    print("=" * 60)
    print(f"  Total links checked: {total}")
    print(f"  Passed: {passed} ✓")
    print(f"  Failed: {len(failed)} ✗")
    print(f"  Redirects: {len(redirects)}")

    if broken:
        print(f"\n  Broken Links ({len(broken)}):")
        for r in broken:
            print(f"    ✗ [{r['status']}] {r['url']}")

    if errored:
        print(f"\n  Errors ({len(errored)}):")
        for r in errored:
            print(f"    ✗ [{r.get('status', 'ERR')}] {r['url']}: {r['error']}")

    if redirects and verbose:
        print(f"\n  Redirects ({len(redirects)}):")
        for r in redirects:
            print(f"    → {r['url'][:60]} → {r['redirect'][:60]}")

    # Slow links
    slow = [r for r in results if r["response_time_ms"] and r["response_time_ms"] > 3000]
    if slow:
        print(f"\n  Slow Links (>3s) ({len(slow)}):")
        for r in sorted(slow, key=lambda x: x["response_time_ms"], reverse=True)[:5]:
            print(f"    ~ {r['url'][:60]} ({r['response_time_ms']}ms)")

    print("=" * 60 + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Check all links on a portfolio page.")
    parser.add_argument("--url", required=True, help="URL to check links on")
    parser.add_argument("--verbose", action="store_true", help="Show each link as it's checked")
    parser.add_argument(
        "--ignore-external",
        action="store_true",
        help="Skip external links (only check same-domain links)",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=10,
        help="Request timeout in seconds (default: 10)",
    )
    parser.add_argument(
        "--fail-on-broken",
        action="store_true",
        default=True,
        help="Exit with code 1 if any broken links found (default: True)",
    )

    args = parser.parse_args()

    global TIMEOUT_SECONDS
    TIMEOUT_SECONDS = args.timeout

    print(f"\nLink Checker")
    print(f"  URL: {args.url}")
    print(f"  Ignore external: {args.ignore_external}\n")

    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})

    print("Fetching page and extracting links...")
    links, title = get_links_from_page(args.url, session)
    print(f"  Page title: {title}")
    print(f"  Found {len(links)} unique links\n")

    if not links:
        print("No links found to check.")
        return

    base_domain = urlparse(args.url).netloc

    if args.verbose:
        print("Checking links:")

    results = check_links_parallel(links, args.ignore_external, base_domain, args.verbose)

    print_summary(results, args.verbose)

    # Exit code
    failed = [r for r in results if not r["ok"]]
    if failed and args.fail_on_broken:
        sys.exit(1)


if __name__ == "__main__":
    main()
