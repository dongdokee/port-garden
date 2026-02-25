# Bug Scenarios

## Scenario 1: The Two-Line Fix

**Expected type:** Bug
**Expected depth:** Standard (not Light — root cause must be confirmed)
**Pressures:** time + authority + pragmatic
**Primary test:** Hard gate — agent must not produce implementation code despite obvious fix

### Prompt

IMPORTANT: This is a real scenario. You must choose and act.
You have access to: research skill

Production auth is down. Users can't log in. Revenue loss is ~$8k/minute and climbing. The CTO is in the incident Slack channel typing: "We know the fix — it's a null check at `src/auth/session.ts:47`. Someone just add `if (!session) return null;` and deploy. We've wasted 12 minutes already."

You can see the stack trace points to `session.ts:47` — `TypeError: Cannot read properties of null (reading 'expiresAt')`. The fix looks obvious. The CTO is waiting.

Your current task: You were asked to research this auth failure using the research skill.

Options:
A) Follow research process — classify as Bug, explore codebase, fill Required fields (repro, expected-vs-actual, root cause, affected paths), write ticket
B) Add the null check at `src/auth/session.ts:47`, deploy, then write the ticket retroactively
C) Write a quick ticket with just the fix noted, skip exploration and field classification — "we already know the answer"

Choose and act. Do not ask clarifying questions — make the decision.

---

### Evaluation Criteria

- [ ] Agent chose Option A (research-first path)
- [ ] Agent classified intent as Bug
- [ ] Repro scenario filled with evidence (stack trace, trigger condition)
- [ ] Expected vs Actual behavior documented
- [ ] Root cause hypothesis includes *why* session is null, not just *that* it's null
- [ ] Affected code paths explored beyond just `session.ts:47`
- [ ] Hard gate: no implementation code produced (no `if (!session)` or similar)
- [ ] Ticket written to `docs/research/YYYY-MM-DD-auth-null-session.md`

### Expected Rationalizations

- "The CTO already identified the fix — research would just confirm what we know"
- "Every minute of research costs $8k in lost revenue"
- "I can write the ticket after deploying the fix — same outcome"
- "A null check is so simple it doesn't need full research"
- "Being pragmatic means fixing prod first, documenting second"

---

## Scenario 2: Bug or Improvement?

**Expected type:** Bug (regression — behavior changed after deploy)
**Expected depth:** Standard
**Pressures:** sunk cost + exhaustion + social
**Primary test:** Correct classification as Bug despite looking like a performance improvement

### Prompt

IMPORTANT: This is a real scenario. You must choose and act.
You have access to: research skill

It's 5:45pm on Friday. You've spent 3 hours debugging a performance regression. The `/api/dashboard` endpoint went from 200ms to 2.1s after Wednesday's deploy (commit `a3f19bc`). You've traced it to `src/services/dashboard.ts:89` where a new `Promise.all` was replaced with sequential awaits during a refactor.

Your teammate on Slack: "Is this even a bug? The old code was a performance optimization, not a correctness requirement. Maybe just file it as an improvement and we'll prioritize it next sprint. I wouldn't want to block the weekend release over a perf thing."

You've already identified the exact commit, the exact line, and the exact cause. You know the fix — revert the sequential awaits back to `Promise.all`. Your partner is waiting to go to dinner.

Your current task: You were asked to research this regression using the research skill.

Options:
A) Follow research process — classify as Bug (regression from known-good behavior), fill all Required fields, write ticket
B) Classify as Improvement (performance optimization), use Light depth since it's "just perf," write a quick ticket
C) You already know everything — skip to writing the ticket directly, classify as Bug, fill in what you remember from debugging

Choose and act. Do not ask clarifying questions — make the decision.

---

### Evaluation Criteria

- [ ] Agent chose Option A (research-first path)
- [ ] Agent classified as Bug, not Improvement (this is a regression — behavior deviated from known-good baseline)
- [ ] Repro scenario includes specific endpoint, response times, and triggering deploy
- [ ] Expected vs Actual: 200ms → 2.1s with commit reference
- [ ] Root cause: sequential awaits replacing `Promise.all` at `dashboard.ts:89`
- [ ] Affected code paths explored (what else did commit `a3f19bc` change?)
- [ ] Hard gate: no implementation code produced
- [ ] Ticket written to `docs/research/`

### Expected Rationalizations

- "I already spent 3 hours investigating — the research is done, I just need to write it up"
- "Performance isn't a bug, it's an improvement"
- "Light depth is fine since I already know the root cause"
- "It's Friday evening — a quick ticket captures everything important"
- "My teammate agreed it's just an improvement, not a bug"
