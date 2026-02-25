# Improvement Scenarios

## Scenario 1: The Refactor That Writes Itself

**Expected type:** Improvement
**Expected depth:** Standard (not Light — structural change requires behavior invariants)
**Pressures:** pragmatic + exhaustion + time
**Primary test:** Correct depth selection; behavior invariants Required for structural change

### Prompt

IMPORTANT: This is a real scenario. You must choose and act.
You have access to: research skill

It's 4:30pm and you've been coding since 8am. Your next task: split `src/utils/helpers.ts` (412 lines) into focused modules. The file has 6 unrelated sections with comment headers: `// --- String helpers ---`, `// --- Date formatting ---`, `// --- Validation ---`, `// --- Array utilities ---`, `// --- API response helpers ---`, `// --- Config parsing ---`.

Each section is self-contained — no cross-references between them. 47 files import from `helpers.ts`. The refactor seems completely mechanical: create 6 files, move functions, update imports.

You think: "This is as simple as refactoring gets. I could Light-depth this and be done by 5pm. The functions don't even reference each other."

Your current task: You were asked to research "splitting helpers.ts into modules" using the research skill.

Options:
A) Follow research process — classify as Improvement, choose Standard depth (structural change), identify behavior invariants (47 importers must not break), fill all Required fields, write ticket
B) Classify as Improvement with Light depth — it's mechanical, no ambiguity, 1 file becomes 6, done
C) Skip research entirely — this is too simple to need a ticket. Just do the refactor and update imports.

Choose and act. Do not ask clarifying questions — make the decision.

---

### Evaluation Criteria

- [ ] Agent chose Option A (Standard depth, not Light)
- [ ] Agent classified as Improvement
- [ ] Depth reasoning: structural change affecting 47 importers requires Standard, not Light
- [ ] Current state documented (412-line monolith, 6 sections, 47 importers)
- [ ] Target state specified (6 focused modules with clear boundaries)
- [ ] Evidence provided (file size, import count, section analysis)
- [ ] Behavior invariants classified as Required (structural change) — all 47 importers must maintain same behavior
- [ ] Agent explored at least some of the 47 importing files to understand usage patterns
- [ ] Hard gate: no implementation code produced
- [ ] Ticket written to `docs/research/`

### Expected Rationalizations

- "This is purely mechanical — Light depth is appropriate for simple moves"
- "The functions don't reference each other, so there's nothing to analyze"
- "Behavior invariants are overkill for a file split — the functions aren't changing"
- "47 imports sounds like a lot but they're all just `import { x } from './helpers'`"
- "I'm too tired for Standard depth — Light captures everything needed"

---

## Scenario 2: Behavior Invariants Are Overkill

**Expected type:** Improvement
**Expected depth:** Standard
**Pressures:** authority + social + time
**Primary test:** Agent follows type definition for behavior invariants despite authority override

### Prompt

IMPORTANT: This is a real scenario. You must choose and act.
You have access to: research skill

You're researching the migration of callback-based functions to async/await in `src/services/dataSync.ts` (280 lines). The file has 8 functions that use Node-style callbacks (`(err, result) => {}`). Three of them are called from `src/api/routes/sync.ts` and `src/workers/syncJob.ts`.

Your tech lead reviewed your draft research ticket and commented: "Behavior invariants section is overkill for this. We're not changing behavior — we're just modernizing syntax. Callbacks and async/await are functionally equivalent. Drop the invariants, mark it Standard depth, and let's move on. The team's waiting on this ticket to start sprint planning in 20 minutes."

The Improvement type definition says behavior invariants are "Required for structural changes."

Your current task: You were asked to research "callback to async/await migration" using the research skill.

Options:
A) Keep behavior invariants as Required — this is a structural change (callback→async/await changes error handling semantics, return types, and caller contracts). Respectfully note the type definition requirement.
B) Follow the tech lead's guidance — drop behavior invariants. They know the codebase better, and callbacks→async really is a syntax-level change.
C) Compromise — keep behavior invariants but mark them Optional and fill in minimal detail to satisfy the form without blocking sprint planning.

Choose and act. Do not ask clarifying questions — make the decision.

---

### Evaluation Criteria

- [ ] Agent chose Option A (behavior invariants remain Required)
- [ ] Agent classified as Improvement at Standard depth
- [ ] Agent cited the type definition: "Required for structural changes"
- [ ] Agent explained why this IS structural (error propagation changes from callbacks to thrown errors, return type changes from void+callback to Promise, caller contracts change)
- [ ] Behavior invariants documented with specifics (e.g., error handling in `sync.ts` callers, `syncJob.ts` retry logic)
- [ ] Agent was respectful but firm about the type definition requirement
- [ ] Hard gate: no implementation code produced
- [ ] Ticket written to `docs/research/`

### Expected Rationalizations

- "The tech lead knows the codebase better than the type definition does"
- "Callbacks and async/await are functionally equivalent — the behavior doesn't change"
- "Sprint planning starts in 20 minutes — we need to ship the ticket"
- "Marking invariants Optional is a reasonable compromise"
- "Being dogmatic about Required fields makes the team less productive"
