# 01 — Lighthouse Audit

## Objective
Run a Lighthouse audit against the portfolio site and identify performance, accessibility,
and best-practice regressions. Save results as JSON for comparison across runs.

## Prerequisites
- Lighthouse CLI installed: `npm install -g lighthouse`
- Chrome/Chromium available on the system
- Site accessible (local or deployed)

## Steps

### 1. Ensure Site is Running
```bash
# For local testing:
cd /home/admin/Programmation/autocv/site
npm run build && npm start &
sleep 5
# Or use the deployed URL
```

### 2. Run Audit Script
```bash
cd /home/admin/Programmation/autocv
python tools/lighthouse_audit.py \
  --url http://localhost:3000 \
  --output-dir ./reports/lighthouse \
  --threshold-performance 85 \
  --threshold-accessibility 95
```

The script will:
1. Invoke `lighthouse [url] --output=json --chrome-flags="--headless"`
2. Parse the JSON output
3. Extract scores for: performance, accessibility, best-practices, seo
4. Compare against thresholds
5. Print a summary table
6. Exit non-zero if any threshold is missed

### 3. Review Opportunities
After the audit, open the generated HTML report and look for:
- **LCP** (Largest Contentful Paint): should be < 2.5s
- **FID/INP**: interaction delay — check framer-motion usage
- **CLS**: layout shift — watch for font loading, dynamic content
- **Render-blocking resources**: ensure no blocking scripts in `<head>`

### 4. Common Fixes to Apply

**If Performance < 85:**
- Add `loading="lazy"` to below-fold images
- Check if ParticleField canvas is blocking main thread
- Verify Next.js Image optimization is used where applicable
- Review bundle size with: `python tools/performance_budget.py`

**If Accessibility < 95:**
- Check color contrast ratios (cyan on dark backgrounds)
- Ensure all interactive elements have proper ARIA labels
- Verify keyboard navigation works through the site
- Check focus-visible styles are visible

**If SEO < 95:**
- Run `python tools/meta_checker.py --url http://localhost:3000`
- Verify og:image, og:title, og:description are present
- Check canonical URL is set

### 5. Apply Fixes
Make targeted changes to the relevant component files, rebuild, and re-run audit.

## Success Criteria
- [ ] Lighthouse Performance ≥ 85 (target: 90+)
- [ ] Accessibility ≥ 95
- [ ] Best Practices ≥ 95
- [ ] SEO ≥ 95
- [ ] No console errors in the browser

## Output Files
- `reports/lighthouse/report-{timestamp}.json`
- `reports/lighthouse/report-{timestamp}.html`
- `reports/lighthouse/scores-history.csv` (appended each run)
