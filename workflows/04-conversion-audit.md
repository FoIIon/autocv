# 04 — Conversion Audit

## Objective
Optimize the portfolio's ability to convert visitors into contacts or job opportunities.
Analyze user journey, CTA effectiveness, and friction points.

## Definition of Conversion
A "conversion" in this context is one of:
1. Visitor sends a message via the contact form
2. Visitor clicks "Download CV"
3. Visitor clicks an email/LinkedIn link
4. Visitor sends 3+ messages to the AI chat (high engagement signal)

## Steps

### 1. Review the User Journey

Walk through the site as a hiring manager would:
1. Land on Hero — does the value proposition land in < 5 seconds?
2. See the manifesto — is the philosophy compelling?
3. Browse projects — are the technical accomplishments credible and specific?
4. Try the AI chat — is it impressive and useful?
5. Review skills — is the skill level believable?
6. Read the timeline — is the career progression logical?
7. Reach contact — is there a strong reason to reach out?

For each step, ask: "What would make a senior hiring manager close this tab?"

### 2. CTA Analysis

**Primary CTAs:**
- "View Projects" (Hero) → Does it work? Does it scroll smoothly?
- "Chat with my AI" (Hero) → Is this compelling enough to be a primary CTA?
- "Let's talk" (Navbar) → Is it visible enough?
- "Send Message" (Contact form) → Is the form friction appropriate?

**Secondary CTAs:**
- "Download CV" → Placeholder currently — add a real PDF in production
- GitHub links on project cards → Do they open correctly?
- Social links in contact section → All functional?

**Improvements to consider:**
- Add a "Schedule a call" button linking to Calendly
- Make the AI chat a more prominent "try me" experience
- Add a sticky "Available for hire" badge that stays visible while scrolling

### 3. Trust Signal Review
Check that these trust signals are visible and credible:
- [ ] Company logos (Nexus AI, Stripe, Vercel) are named in the timeline
- [ ] Specific numbers: "50M+ tokens/day", "340% increase", "62% cost reduction"
- [ ] GitHub star counts are visible
- [ ] "Available for opportunities" badge is green and prominent
- [ ] The AI chat itself demonstrates capability (the meta-portfolio effect)

### 4. Form UX Review
Test the contact form:
- [ ] Error messages are clear and actionable
- [ ] Success state is satisfying and clear
- [ ] Form submits correctly to `/api/contact`
- [ ] Loading state prevents double submission
- [ ] No required fields are confusing (why do you need phone number?)

### 5. Mobile Conversion
On mobile, conversion paths are often broken. Check:
- [ ] "Let's talk" button is in hamburger menu — is that good enough?
- [ ] Contact form is easily scrollable on mobile keyboard
- [ ] Phone number is a `tel:` link
- [ ] Email address is a `mailto:` link

### 6. Speed-to-Value
Time how long it takes to:
- See Alex's name and title: should be < 1 second
- Read the first project card: < 10 seconds of scrolling
- Start a chat conversation: < 15 seconds from landing

If any of these feel slow, simplify the animation or reduce content.

## Success Criteria
- [ ] Primary CTA is immediately visible on landing
- [ ] Contact form submits successfully in < 2 seconds
- [ ] CV download returns a valid PDF (or shows appropriate placeholder)
- [ ] All external links open in new tab
- [ ] No broken links (run `link_checker.py`)
- [ ] Time-to-value < 10 seconds for a skeptical user

## Recommended Improvements (Priority Order)
1. Add a real CV PDF to `/public/alex-mercer-cv.pdf`
2. Add a Calendly or similar booking widget
3. Add a "social proof" section (testimonials from colleagues)
4. Consider adding an interactive code demo to the hero
5. Add UTM tracking for different entry points
