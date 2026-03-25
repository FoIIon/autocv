# 05 — AI Demo Improvement

## Objective
Evaluate the quality of the AI chat demo and improve the system prompt, suggested prompts,
and streaming UX to maximize the "wow factor" for visitors.

## Why This Matters
The AI Playground is the most differentiating feature of this portfolio.
A mediocre AI demo weakens the portfolio; an impressive one is itself proof of the claim
"I build AI-native systems."

## Steps

### 1. Evaluate Current AI Responses
Run each of the 5 suggested prompts and evaluate the response quality:

**Prompt 1: "Generate a cover letter"**
Expected: Professional, specific cover letter mentioning real numbers and achievements.
Red flags: Generic, no specific numbers, doesn't ask for company/role context.

**Prompt 2: "What are his key strengths?"**
Expected: 3-5 specific strengths with evidence (not just "he's a great engineer").
Red flags: Vague, doesn't reference specific projects or metrics.

**Prompt 3: "Generate a React component"**
Expected: Production-quality TypeScript React component with proper types and error handling.
Red flags: Toy `function Hello()` example, no types, no real logic.

**Prompt 4: "Why should we hire him?"**
Expected: Compelling, data-backed pitch tailored to what hiring managers care about.
Red flags: Sounds like a self-promotion template, no specifics.

**Prompt 5: "Prove this site was built with AI"**
Expected: Meta answer about the Claude Code workflow, specific technical insights.
Red flags: Vague "yes I used AI" response.

### 2. System Prompt Review
Open `site/src/lib/prompts.ts` and review `SYSTEM_PROMPT` for:
- [ ] All key metrics are present (50M+ tokens, 62% cost reduction, etc.)
- [ ] Personality is well-defined (direct, curious, warm, opinionated)
- [ ] Code generation instructions are specific enough
- [ ] Cover letter instructions specify asking for company context if missing
- [ ] The meta point (portfolio itself is proof) is explicitly prompted

### 3. Improve System Prompt
Use `tools/content_generator.py` to get suggestions:
```bash
python tools/content_generator.py \
  --section system-prompt-analysis \
  --input site/src/lib/prompts.ts
```

Or manually iterate: test → identify weakness → improve → test again.

### 4. Add More Suggested Prompts
Consider adding:
- "What would Alex build in the first 30 days at my company?"
- "Explain the RAG pipeline he built"
- "Write a technical blog post about AI-native development"
- "What's his biggest technical failure and what did he learn?"
- "Compare Alex to a typical senior engineer"

Update `site/src/components/ai/SuggestedPrompts.tsx`.

### 5. Streaming UX Improvements
Current streaming implementation is functional but could be improved:
- [ ] Add syntax highlighting for code blocks in responses
- [ ] Render markdown: `**bold**`, `# headers`, bullet lists
- [ ] Copy button on code blocks
- [ ] "Regenerate" button on AI messages
- [ ] Show "Claude is thinking..." with estimated wait time

### 6. Rate Limit UX
Currently: flat "10 messages used" counter.
Better options:
- Show remaining count prominently while there are < 3 remaining
- Offer email signup to get more messages (lead capture!)
- Show a "Session ended — schedule a call" CTA when limit reached

### 7. Test with Real Users
If possible, get 2-3 people to try the AI chat and observe:
- What's the first thing they type?
- Do they use suggested prompts?
- What's their reaction to the response?
- Where do they get confused or disappointed?

## Success Criteria
- [ ] All 5 suggested prompts produce impressive responses
- [ ] Code generation produces TypeScript with proper types
- [ ] Cover letter generation asks for company context
- [ ] Streaming feels smooth (no lag, characters appear fast)
- [ ] Rate limit UX is clear and doesn't feel punitive
- [ ] The meta response ("prove it used AI") is genuinely impressive

## System Prompt Version Control
Save system prompt versions:
```bash
cp site/src/lib/prompts.ts reports/prompts/prompt-v{N}-{date}.ts
```
Compare performance across versions using consistent test prompts.
