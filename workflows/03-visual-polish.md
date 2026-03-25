# 03 — Visual Polish

## Objective
Identify and fix visual regressions, improve animation quality, and ensure the dark theme
is consistent and professional across all viewport sizes.

## Prerequisites
- Site running locally
- Browser DevTools available
- Optional: Playwright for automated screenshot comparison

## Steps

### 1. Manual Visual Review Checklist

**Desktop (1440px wide):**
- [ ] Hero section: particle field visible, terminal animation runs cleanly
- [ ] Manifesto section: word-by-word reveal animates correctly on scroll
- [ ] Projects grid: 3 columns, cards align properly, hover glow works
- [ ] AI Playground: chat interface renders correctly, suggested prompts visible
- [ ] Skills orbital: animation runs smoothly (no jank), center nucleus pulses
- [ ] Timeline: alternating left/right layout, animated SVG line draws on scroll
- [ ] Contact section: form fields styled consistently, social links visible

**Tablet (768px wide):**
- [ ] Navigation collapses to hamburger
- [ ] Projects grid: 2 columns
- [ ] Timeline switches to single column
- [ ] Hero stats remain readable

**Mobile (375px wide):**
- [ ] All text is readable (no overflow)
- [ ] Buttons are tappable (minimum 44px touch target)
- [ ] Chat interface is usable on mobile keyboard
- [ ] Particle field doesn't impact scroll performance

### 2. Animation Quality Check
Open browser DevTools → Performance tab, record while scrolling through the site:
- Frame rate should stay ≥ 55fps during animations
- No long tasks > 50ms blocking main thread
- ParticleField should not cause layout thrash

If particles cause jank on mobile:
```tsx
// In ParticleField.tsx, reduce particle count on mobile:
const PARTICLE_COUNT = window.innerWidth < 768 ? 40 : 100
```

### 3. Color Contrast Verification
Use browser's accessibility checker or `axe` extension to verify:
- Body text (foreground-muted #94a3b8) on background (#0a0a0f) → ratio must be ≥ 4.5:1
- Cyan (#00d4ff) on background → check ratio for interactive elements
- White text on card backgrounds

### 4. Run Screenshot Comparison
```bash
cd /home/admin/Programmation/autocv
python tools/screenshot_compare.py \
  --url http://localhost:3000 \
  --baseline ./reports/screenshots/baseline \
  --output ./reports/screenshots/current
```

Review any sections with > 5% pixel difference.

### 5. Apply CSS Fixes
Make targeted edits to:
- `site/src/app/globals.css` — for global fixes
- Individual component files — for component-specific issues
- `site/tailwind.config.ts` — for theme adjustments

### 6. Cross-browser Check
- Chrome ✓
- Firefox: check backdrop-filter support (add `-webkit-` prefix if needed)
- Safari: check `clsx` usage, backdrop-filter, custom properties

## Success Criteria
- [ ] No horizontal overflow on any viewport
- [ ] All animations run at ≥ 55fps on desktop
- [ ] All text passes contrast ratio requirements
- [ ] No visual regressions from screenshot comparison
- [ ] No console errors related to CSS

## Common Issues and Fixes

| Issue | Fix |
|-------|-----|
| Orbital animation jank | Reduce particle count, use `will-change: transform` |
| Glassmorphism flicker | Add `backdrop-filter: blur(0)` as default, transition to blur |
| Font Flash (FOUT) | Use `font-display: optional` for non-critical fonts |
| CLS from particle canvas | Set explicit width/height on canvas before JS loads |
| Mobile overflow | Add `overflow-x: hidden` to `body` (already in globals.css) |
