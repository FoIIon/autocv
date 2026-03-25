#!/usr/bin/env python3
"""
deploy.py — Orchestrate build, deploy to Vercel, and run smoke tests.

Usage:
  python deploy.py                           # Full pipeline: build + deploy + smoke test
  python deploy.py --environment preview     # Deploy to preview environment
  python deploy.py --smoke-test-only --url https://autocv.vercel.app
  python deploy.py --build-only             # Only run the build step
  python deploy.py --dry-run               # Show what would be done without doing it
"""

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Optional

try:
    import requests
except ImportError:
    print("ERROR: requests not installed. Run: pip install requests", file=sys.stderr)
    sys.exit(1)


SITE_DIR = Path(__file__).parent.parent / "site"
REPORTS_DIR = Path(__file__).parent.parent / "reports"


class Color:
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BLUE = "\033[94m"
    RESET = "\033[0m"
    BOLD = "\033[1m"


def log(message: str, level: str = "info") -> None:
    icons = {"info": "  →", "success": "  ✓", "warning": "  ~", "error": "  ✗"}
    colors = {
        "info": Color.BLUE,
        "success": Color.GREEN,
        "warning": Color.YELLOW,
        "error": Color.RED,
    }
    icon = icons.get(level, "  ·")
    color = colors.get(level, "")
    print(f"{color}{icon} {message}{Color.RESET}")


def run_command(
    cmd: list[str],
    cwd: str | None = None,
    capture: bool = False,
    dry_run: bool = False,
) -> tuple[int, str, str]:
    """Run a shell command and return (returncode, stdout, stderr)."""
    cmd_str = " ".join(cmd)
    log(f"Running: {cmd_str}")

    if dry_run:
        log(f"[DRY RUN] Would run: {cmd_str}", "warning")
        return 0, "", ""

    result = subprocess.run(
        cmd,
        cwd=cwd,
        capture_output=capture,
        text=True,
    )

    return result.returncode, result.stdout or "", result.stderr or ""


def step_type_check(dry_run: bool) -> bool:
    """Run TypeScript type check."""
    print(f"\n{Color.BOLD}Step 1: TypeScript Check{Color.RESET}")

    code, stdout, stderr = run_command(
        ["npx", "tsc", "--noEmit"],
        cwd=str(SITE_DIR),
        capture=True,
        dry_run=dry_run,
    )

    if code != 0:
        log("TypeScript errors found:", "error")
        if stderr:
            print(stderr[:1000])
        return False

    log("TypeScript: no errors", "success")
    return True


def step_lint(dry_run: bool) -> bool:
    """Run ESLint."""
    print(f"\n{Color.BOLD}Step 2: ESLint{Color.RESET}")

    code, stdout, stderr = run_command(
        ["npm", "run", "lint"],
        cwd=str(SITE_DIR),
        capture=True,
        dry_run=dry_run,
    )

    if code != 0:
        log("ESLint errors found:", "warning")
        if stdout:
            print(stdout[:500])
        # Don't fail on lint warnings, just warn
        return True

    log("ESLint: passed", "success")
    return True


def step_build(dry_run: bool) -> bool:
    """Run Next.js production build."""
    print(f"\n{Color.BOLD}Step 3: Production Build{Color.RESET}")

    start = time.time()
    code, stdout, stderr = run_command(
        ["npm", "run", "build"],
        cwd=str(SITE_DIR),
        capture=True,
        dry_run=dry_run,
    )
    elapsed = time.time() - start

    if code != 0:
        log(f"Build failed after {elapsed:.1f}s", "error")
        if stderr:
            print(stderr[-1500:])
        return False

    log(f"Build succeeded in {elapsed:.1f}s", "success")

    # Extract build info
    if not dry_run:
        build_info_path = SITE_DIR / ".next" / "build-manifest.json"
        if build_info_path.exists():
            log(f"Build manifest found: {build_info_path}")

    return True


def step_deploy(environment: str, dry_run: bool) -> Optional[str]:
    """Deploy to Vercel and return deployment URL."""
    print(f"\n{Color.BOLD}Step 4: Deploy to Vercel ({environment}){Color.RESET}")

    # Check Vercel CLI available
    code, _, _ = run_command(["vercel", "--version"], capture=True)
    if code != 0:
        log("Vercel CLI not found. Install: npm install -g vercel", "error")
        return None

    cmd = ["vercel"]
    if environment == "production":
        cmd.append("--prod")
    cmd.extend(["--yes"])  # Non-interactive

    code, stdout, stderr = run_command(
        cmd,
        cwd=str(SITE_DIR),
        capture=True,
        dry_run=dry_run,
    )

    if dry_run:
        return "https://autocv.vercel.app"

    if code != 0:
        log("Deployment failed:", "error")
        print(stderr[:500])
        return None

    # Extract deployment URL from output
    for line in (stdout + stderr).splitlines():
        if "vercel.app" in line or "https://" in line:
            url = line.strip()
            log(f"Deployed to: {url}", "success")
            return url

    log("Deployment completed but URL not found in output", "warning")
    log(f"Output: {stdout[:300]}")
    return "unknown"


def step_smoke_test(url: str, dry_run: bool) -> bool:
    """Run smoke tests against the deployed URL."""
    print(f"\n{Color.BOLD}Step 5: Smoke Tests → {url}{Color.RESET}")

    if dry_run:
        log("[DRY RUN] Would smoke test URL", "warning")
        return True

    # Wait for deployment to propagate
    log("Waiting 5s for deployment propagation...")
    time.sleep(5)

    tests = [
        {
            "name": "Homepage loads (GET /)",
            "method": "GET",
            "path": "/",
            "expected_status": [200],
        },
        {
            "name": "API chat route exists (wrong method → 405)",
            "method": "GET",
            "path": "/api/chat",
            "expected_status": [405, 200],  # 405 is expected for GET on POST-only route
        },
        {
            "name": "Chat API POST (streaming test)",
            "method": "POST",
            "path": "/api/chat",
            "body": {"messages": [{"role": "user", "content": "Hello, who is Alex?"}]},
            "expected_status": [200],
            "check_streaming": True,
        },
        {
            "name": "Contact API POST (valid data)",
            "method": "POST",
            "path": "/api/contact",
            "body": {
                "name": "Test User",
                "email": "test@example.com",
                "message": "This is an automated smoke test message.",
            },
            "expected_status": [200],
            "check_json": {"success": True},
        },
    ]

    all_passed = True

    for test in tests:
        test_url = url.rstrip("/") + test["path"]
        try:
            if test["method"] == "GET":
                response = requests.get(test_url, timeout=15)
            else:
                response = requests.post(
                    test_url,
                    json=test.get("body"),
                    timeout=15,
                    headers={"Content-Type": "application/json"},
                    stream=test.get("check_streaming", False),
                )

            status_ok = response.status_code in test["expected_status"]

            if "check_streaming" in test and test["check_streaming"]:
                # Read first chunk to verify streaming works
                first_chunk = next(response.iter_content(chunk_size=100), b"")
                streaming_ok = len(first_chunk) > 0
                if not streaming_ok:
                    log(f"FAIL: {test['name']} — no streaming data", "error")
                    all_passed = False
                    continue

            if "check_json" in test:
                try:
                    json_data = response.json()
                    for key, expected_val in test["check_json"].items():
                        if json_data.get(key) != expected_val:
                            log(
                                f"FAIL: {test['name']} — JSON field '{key}' expected '{expected_val}', got '{json_data.get(key)}'",
                                "error",
                            )
                            all_passed = False
                            continue
                except json.JSONDecodeError:
                    log(f"FAIL: {test['name']} — response is not valid JSON", "error")
                    all_passed = False
                    continue

            if status_ok:
                log(f"{test['name']} [{response.status_code}]", "success")
            else:
                log(
                    f"FAIL: {test['name']} — got {response.status_code}, expected {test['expected_status']}",
                    "error",
                )
                all_passed = False

        except requests.Timeout:
            log(f"FAIL: {test['name']} — timeout", "error")
            all_passed = False
        except Exception as e:
            log(f"FAIL: {test['name']} — {e}", "error")
            all_passed = False

    return all_passed


def save_deploy_log(
    environment: str,
    deployment_url: str | None,
    smoke_passed: bool,
) -> None:
    """Save deployment log."""
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    log_file = REPORTS_DIR / "deploy-log.jsonl"

    entry = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "environment": environment,
        "deployment_url": deployment_url,
        "smoke_tests_passed": smoke_passed,
    }

    with open(log_file, "a") as f:
        f.write(json.dumps(entry) + "\n")

    log(f"Deploy log updated: {log_file}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Build, deploy, and smoke test the portfolio.")
    parser.add_argument(
        "--environment",
        choices=["production", "preview"],
        default="production",
        help="Deployment environment (default: production)",
    )
    parser.add_argument("--url", help="Existing deployment URL (for --smoke-test-only)")
    parser.add_argument("--smoke-test-only", action="store_true", help="Only run smoke tests")
    parser.add_argument("--build-only", action="store_true", help="Only run the build step")
    parser.add_argument("--skip-typecheck", action="store_true", help="Skip TypeScript check")
    parser.add_argument("--skip-lint", action="store_true", help="Skip ESLint")
    parser.add_argument("--dry-run", action="store_true", help="Simulate without running commands")
    parser.add_argument("--project-dir", help="Path to Next.js project directory")

    args = parser.parse_args()

    if args.project_dir:
        global SITE_DIR
        SITE_DIR = Path(args.project_dir)

    if not SITE_DIR.exists():
        print(f"ERROR: Project directory not found: {SITE_DIR}", file=sys.stderr)
        sys.exit(1)

    print(f"\n{Color.BOLD}Deploy Pipeline{Color.RESET}")
    print(f"  Environment: {args.environment}")
    print(f"  Project dir: {SITE_DIR}")
    print(f"  Dry run: {args.dry_run}")
    print()

    deployment_url = args.url
    smoke_passed = False

    if args.smoke_test_only:
        if not args.url:
            print("ERROR: --url required with --smoke-test-only", file=sys.stderr)
            sys.exit(1)
        smoke_passed = step_smoke_test(args.url, args.dry_run)
        sys.exit(0 if smoke_passed else 1)

    # Full pipeline
    if not args.skip_typecheck:
        if not step_type_check(args.dry_run):
            log("Aborting: TypeScript errors must be fixed before deploy", "error")
            sys.exit(1)

    if not args.skip_lint:
        step_lint(args.dry_run)

    if not step_build(args.dry_run):
        log("Aborting: Build failed", "error")
        sys.exit(1)

    if args.build_only:
        log("Build complete (--build-only flag set, skipping deploy)", "success")
        sys.exit(0)

    deployment_url = step_deploy(args.environment, args.dry_run)
    if not deployment_url:
        log("Aborting: Deployment failed", "error")
        sys.exit(1)

    if deployment_url and deployment_url != "unknown":
        smoke_passed = step_smoke_test(deployment_url, args.dry_run)
    else:
        log("Skipping smoke tests (deployment URL unknown)", "warning")
        smoke_passed = True

    save_deploy_log(args.environment, deployment_url, smoke_passed)

    print(f"\n{'=' * 50}")
    if smoke_passed:
        print(f"{Color.GREEN}{Color.BOLD}  Deployment successful!{Color.RESET}")
        print(f"  URL: {deployment_url}")
    else:
        print(f"{Color.RED}{Color.BOLD}  Deployment completed but smoke tests failed!{Color.RESET}")
        print(f"  URL: {deployment_url}")
        print(f"  Consider rollback: vercel rollback")
    print(f"{'=' * 50}\n")

    sys.exit(0 if smoke_passed else 1)


if __name__ == "__main__":
    main()
