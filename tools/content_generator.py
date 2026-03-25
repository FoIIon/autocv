#!/usr/bin/env python3
"""
content_generator.py — Use Anthropic API to generate content variations for the portfolio.

Usage:
  python content_generator.py --section tagline --count 5
  python content_generator.py --section bio --count 3
  python content_generator.py --section project-description --project-id nexus-orchestrator
  python content_generator.py --section system-prompt-analysis --input ../site/src/lib/prompts.ts
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path


def load_cv() -> dict:
    """Load CV data from data/cv.json."""
    cv_path = Path(__file__).parent.parent / "data" / "cv.json"
    with open(cv_path) as f:
        return json.load(f)


def load_projects() -> list:
    """Load projects data from data/projects.json."""
    projects_path = Path(__file__).parent.parent / "data" / "projects.json"
    with open(projects_path) as f:
        return json.load(f)


def get_anthropic_client():
    """Initialize Anthropic client."""
    try:
        import anthropic
    except ImportError:
        print("ERROR: anthropic package not installed. Run: pip install anthropic", file=sys.stderr)
        sys.exit(1)

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        # Try loading from .env file
        env_path = Path(__file__).parent.parent / ".env"
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                if line.startswith("ANTHROPIC_API_KEY="):
                    api_key = line.split("=", 1)[1].strip()
                    break

    if not api_key or api_key == "your_api_key_here":
        print("ERROR: ANTHROPIC_API_KEY not set or is placeholder.", file=sys.stderr)
        print("Set it in .env or as an environment variable.", file=sys.stderr)
        sys.exit(1)

    return anthropic.Anthropic(api_key=api_key)


def generate_taglines(client, cv: dict, count: int) -> list[str]:
    """Generate tagline variations."""
    prompt = f"""Generate {count} different taglines for {cv['name']}'s portfolio website.

Context:
- Name: {cv['name']}
- Title: {cv['title']}
- Current tagline: "{cv['tagline']}"
- Bio: {cv['bio']}
- Key facts: Principal engineer at AI lab, ex-Stripe, ex-Vercel, 8+ years experience

Requirements for each tagline:
- Maximum 15 words
- Must convey AI-native developer philosophy
- Should be memorable and differentiated
- No clichés like "passionate developer" or "problem solver"
- Can be provocative, bold, or slightly philosophical

Return ONLY a JSON array of {count} tagline strings, nothing else.
Example: ["tagline 1", "tagline 2", ...]"""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}],
    )

    response_text = message.content[0].text.strip()
    # Strip markdown code block if present
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        response_text = "\n".join(lines[1:-1])

    return json.loads(response_text)


def generate_bio(client, cv: dict, count: int) -> list[str]:
    """Generate bio paragraph variations."""
    prompt = f"""Generate {count} bio paragraph variations for {cv['name']}'s portfolio.

Context:
- Current bio: "{cv['bio']}"
- Title: {cv['title']}
- Experience: 8+ years, Nexus AI Labs (current), Stripe, Vercel
- Key strengths: LLM integration, RAG systems, full-stack, human-AI collaboration

Requirements:
- 2-3 sentences maximum (60-90 words)
- First person voice
- Specific and concrete, avoid vague claims
- Should make a hiring manager want to read more
- Can reference the AI-native development philosophy

Return ONLY a JSON array of {count} bio strings."""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=800,
        messages=[{"role": "user", "content": prompt}],
    )

    response_text = message.content[0].text.strip()
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        response_text = "\n".join(lines[1:-1])

    return json.loads(response_text)


def generate_project_description(client, projects: list, project_id: str, count: int) -> list[str]:
    """Generate project description variations."""
    project = next((p for p in projects if p["id"] == project_id), None)
    if not project:
        available = [p["id"] for p in projects]
        print(f"ERROR: Project '{project_id}' not found. Available: {available}", file=sys.stderr)
        sys.exit(1)

    prompt = f"""Generate {count} description variations for this project:

Project: {project['title']}
Current description: "{project['description']}"
Highlights: {json.dumps(project['highlights'])}
Tech: {', '.join(project['tech'])}

Requirements:
- 2-3 sentences (40-70 words)
- Lead with the impact/outcome, not the technology
- Include at least one specific metric from the highlights
- Make it clear why this project is impressive
- Avoid passive voice

Return ONLY a JSON array of {count} description strings."""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=600,
        messages=[{"role": "user", "content": prompt}],
    )

    response_text = message.content[0].text.strip()
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        response_text = "\n".join(lines[1:-1])

    return json.loads(response_text)


def analyze_system_prompt(client, input_file: str) -> str:
    """Analyze the system prompt and suggest improvements."""
    if not os.path.exists(input_file):
        print(f"ERROR: Input file not found: {input_file}", file=sys.stderr)
        sys.exit(1)

    with open(input_file) as f:
        content = f.read()

    prompt = f"""You are an expert prompt engineer. Analyze this system prompt used in a portfolio chatbot:

{content}

Provide:
1. Strengths (what works well)
2. Weaknesses (what could be improved)
3. 3 specific improvements with examples
4. A rating out of 10 with justification

Be specific and actionable. Focus on:
- Does it enable impressive code generation?
- Does the personality come through clearly?
- Are the factual details complete enough?
- Is the instruction for different query types clear?"""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}],
    )

    return message.content[0].text


def save_output(content: list | str, output_path: str | None, section: str) -> None:
    """Save generated content to file or print to stdout."""
    if output_path:
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)

        if isinstance(content, list):
            output = {
                "generated_at": datetime.utcnow().isoformat(),
                "section": section,
                "variations": content,
            }
            path.write_text(json.dumps(output, indent=2))
        else:
            path.write_text(content)

        print(f"Saved to: {output_path}")
    else:
        if isinstance(content, list):
            print(f"\nGenerated {len(content)} variation(s) for '{section}':\n")
            for i, item in enumerate(content, 1):
                print(f"{i}. {item}")
                print()
        else:
            print(content)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate portfolio content using Claude.")
    parser.add_argument(
        "--section",
        required=True,
        choices=["tagline", "bio", "project-description", "system-prompt-analysis"],
        help="Which section to generate content for",
    )
    parser.add_argument("--count", type=int, default=5, help="Number of variations (default: 5)")
    parser.add_argument("--project-id", help="Project ID (required for project-description section)")
    parser.add_argument("--input", help="Input file path (required for system-prompt-analysis)")
    parser.add_argument("--output", help="Output file path (optional; prints to stdout if omitted)")

    args = parser.parse_args()

    cv = load_cv()
    projects = load_projects()
    client = get_anthropic_client()

    print(f"Generating content for section: {args.section}")
    print(f"Using model: claude-sonnet-4-6\n")

    if args.section == "tagline":
        result = generate_taglines(client, cv, args.count)
        save_output(result, args.output, "tagline")

    elif args.section == "bio":
        result = generate_bio(client, cv, args.count)
        save_output(result, args.output, "bio")

    elif args.section == "project-description":
        if not args.project_id:
            parser.error("--project-id is required for project-description section")
        result = generate_project_description(client, projects, args.project_id, args.count)
        save_output(result, args.output, f"project-description-{args.project_id}")

    elif args.section == "system-prompt-analysis":
        if not args.input:
            parser.error("--input is required for system-prompt-analysis section")
        result = analyze_system_prompt(client, args.input)
        save_output(result, args.output, "system-prompt-analysis")


if __name__ == "__main__":
    main()
