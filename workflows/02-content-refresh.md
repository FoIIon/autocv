# 02 — Content Refresh

## Objective
Use the Anthropic API to generate fresh content variations for key sections of the portfolio.
Update `data/cv.json` and `data/projects.json` with improved copy where beneficial.

## Prerequisites
- `ANTHROPIC_API_KEY` set in `.env`
- Python packages: `anthropic`, `json`

## Steps

### 1. Identify Stale Content
Review the following for content that could be stronger:
- Hero tagline in `cv.json` (field: `tagline`)
- Project descriptions in `projects.json` (field: `description`, `longDescription`)
- Bio copy (field: `bio`)
- Achievement bullet points in experience entries

### 2. Run Content Generator
```bash
cd /home/admin/Programmation/autocv
python tools/content_generator.py \
  --section tagline \
  --count 5 \
  --output reports/content/taglines-{date}.json
```

Available sections:
- `tagline` — hero section tagline
- `bio` — about section bio paragraph
- `project-description [id]` — description for a specific project
- `achievement [company]` — achievement bullets for a role
- `cover-letter-template` — base cover letter template for the AI

### 3. Review Generated Options
The script outputs N variations. Review them and select the strongest option.
Look for:
- Specific, quantified claims
- Active voice
- Unique angle that differentiates Alex from other engineers
- Appropriate length (tagline ≤ 15 words, bio ≤ 80 words)

### 4. Update Data Files
Edit `data/cv.json` or `data/projects.json` with the chosen content.
The changes will be automatically reflected on the next build.

```bash
# Verify JSON is valid after editing
python -m json.tool data/cv.json > /dev/null && echo "Valid JSON"
python -m json.tool data/projects.json > /dev/null && echo "Valid JSON"
```

### 5. Rebuild and Verify
```bash
cd site
npm run build
# Check the section visually
```

### 6. Optional — A/B Test Copy
If you have analytics set up, run two versions of the tagline for one week each
and compare engagement metrics (time on site, contact form submissions).

## Success Criteria
- [ ] At least one section has improved copy
- [ ] JSON files remain valid after updates
- [ ] Site builds successfully with new content
- [ ] New copy passes a "would a senior engineer be proud of this?" review

## Notes
- Keep a backup of the original content before making changes
- The `content_generator.py` script logs all generated variants for future reference
- Never use AI-generated content that contains factual claims you can't verify
