# 06 — SEO Optimization

## Objective
Ensure the portfolio ranks well in search engines for relevant queries
("Alex Mercer developer", "AI engineer portfolio", etc.) and presents correctly
when shared on LinkedIn, Twitter, and Slack.

## Steps

### 1. Run Meta Checker
```bash
cd /home/admin/Programmation/autocv
python tools/meta_checker.py \
  --url http://localhost:3000 \
  --verbose
```

The script checks for:
- `<title>` tag (≤ 60 characters)
- `<meta name="description">` (100-160 characters)
- `og:title`, `og:description`, `og:image`, `og:url`
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- `<link rel="canonical">`
- Structured data (JSON-LD)
- `robots.txt` and `sitemap.xml`

### 2. Verify Metadata in layout.tsx
Open `site/src/app/layout.tsx` and verify:
- [ ] Title is compelling and includes target keywords
- [ ] Description is 120-160 characters and includes a CTA
- [ ] OG image path resolves to a real 1200x630 PNG in `/public`
- [ ] Twitter card type is `summary_large_image`
- [ ] `themeColor` is set to the background color
- [ ] `viewport` metadata is correct

### 3. Generate OG Image
The portfolio currently references `/og-image.png` which may not exist.
Options:
a) Create a static image in Figma and export to `site/public/og-image.png`
b) Add a dynamic OG image API route using `next/og`:
   - Create `site/src/app/api/og/route.tsx`
   - Use `ImageResponse` from `next/og`
   - Render Alex's name, title, and a dark background

### 4. Add JSON-LD Structured Data
Add structured data to `layout.tsx` for better rich results:

```tsx
// In layout.tsx <head>:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Alex Mercer",
      "jobTitle": "AI-Native Full-Stack Developer",
      "url": "https://alexmercer.dev",
      "sameAs": [
        "https://github.com/alexmercer-ai",
        "https://linkedin.com/in/alexmercer-dev",
        "https://twitter.com/alexmercer_ai"
      ],
      "knowsAbout": ["Artificial Intelligence", "Machine Learning", "React", "Next.js", "TypeScript"]
    })
  }}
/>
```

### 5. Add sitemap.xml
Create `site/src/app/sitemap.ts`:
```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://alexmercer.dev',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}
```

### 6. Add robots.txt
Create `site/src/app/robots.ts`:
```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://alexmercer.dev/sitemap.xml',
  }
}
```

### 7. Check Link Checker
```bash
python tools/link_checker.py \
  --url http://localhost:3000 \
  --verbose
```
Fix any 404s or broken external links.

### 8. Page Speed (SEO Signal)
Google uses Core Web Vitals as a ranking signal. Ensure:
- LCP < 2.5s (run Lighthouse from workflow 01)
- CLS < 0.1 (no unexpected layout shifts)
- FID/INP < 200ms

## Success Criteria
- [ ] `meta_checker.py` reports 100% compliance
- [ ] OG image renders correctly when URL is pasted in Slack/Twitter/LinkedIn
- [ ] JSON-LD structured data passes Google Rich Results Test
- [ ] `sitemap.xml` is accessible at `/sitemap.xml`
- [ ] `robots.txt` is accessible at `/robots.txt`
- [ ] All links pass `link_checker.py`
- [ ] Lighthouse SEO score = 100

## Tools for Manual Verification
- https://cards-dev.twitter.com/validator
- https://www.linkedin.com/post-inspector/
- https://search.google.com/test/rich-results
- https://developers.facebook.com/tools/debug/
