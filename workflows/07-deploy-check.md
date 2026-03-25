# 07 — Deploy & Smoke Test

## Objective
Build the site for production, deploy to Vercel (or target platform),
and run automated smoke tests to verify the deployment is healthy.

## Prerequisites
- Vercel CLI: `npm install -g vercel`
- Vercel project linked: `vercel link` (run once from `site/` directory)
- `ANTHROPIC_API_KEY` set as a Vercel environment variable
- All previous workflows passing

## Steps

### 1. Pre-Deploy Checks
```bash
cd /home/admin/Programmation/autocv/site

# TypeScript type check
npx tsc --noEmit
# Must output nothing (no errors)

# ESLint
npm run lint
# Must output nothing (or only warnings)

# Production build
npm run build
# Must exit 0
```

### 2. Check Bundle Sizes
```bash
cd /home/admin/Programmation/autocv
python tools/performance_budget.py \
  --stats-file site/.next/build-manifest.json \
  --budget-kb 200
```

Budget limits:
- `page.js` (main bundle): ≤ 80KB gzipped
- `layout.js`: ≤ 30KB gzipped
- Total initial JS: ≤ 200KB gzipped

If over budget, investigate with:
```bash
cd site && npx @next/bundle-analyzer
```

### 3. Deploy to Vercel
```bash
cd /home/admin/Programmation/autocv
python tools/deploy.py \
  --environment production \
  --project-dir site
```

Or manually:
```bash
cd site
vercel --prod
# Note the deployment URL
```

### 4. Smoke Tests
After deployment, run smoke tests against the live URL:

```bash
python tools/deploy.py \
  --smoke-test-only \
  --url https://autocv.vercel.app
```

Manual smoke test checklist:
- [ ] `GET /` returns 200
- [ ] `GET /api/chat` returns 405 (wrong method → means route exists)
- [ ] `POST /api/chat` with test message returns streaming response
- [ ] `POST /api/contact` with valid data returns `{"success": true}`
- [ ] Static assets load (check Network tab, no 404s)
- [ ] No console errors on page load
- [ ] Particle animation starts within 2 seconds
- [ ] Terminal boot animation runs correctly

### 5. E2E Chat Test
```bash
curl -X POST https://autocv.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "What is Alex Mercer good at?"}]}' \
  --no-buffer | head -20
```
Should return SSE stream starting with `data: {"text": "..."}`.

### 6. Performance Check on Live Site
Run Lighthouse against the deployed URL:
```bash
python tools/lighthouse_audit.py \
  --url https://autocv.vercel.app \
  --output-dir ./reports/lighthouse/production
```

### 7. Rollback Procedure (if needed)
```bash
# List recent deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

## Success Criteria
- [ ] Build completes with 0 TypeScript errors
- [ ] Bundle size within budget
- [ ] Deployment URL accessible (HTTP 200)
- [ ] API routes respond correctly
- [ ] AI chat produces a response on live site
- [ ] No 404 errors for static assets
- [ ] Lighthouse Performance ≥ 85 on production

## Environment Variables to Set in Vercel
```
ANTHROPIC_API_KEY=sk-ant-...
```

Verify via:
```bash
vercel env ls production
```

## Rollback Criteria
Immediately rollback if:
- Any API route returns 500
- Chat produces no response (likely API key issue)
- Build output references undefined variables
- Core Web Vitals regress more than 10 points from baseline
