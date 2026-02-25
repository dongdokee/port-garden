# Research Ticket

## Context
- **Type**: Bug
- **Depth**: Standard
- **Type Decision**: Bug chosen over Improvement. Candidate types: Bug, Improvement. A performance regression (200ms -> 2.1s) from a previously optimized state is a deviation from known-good behavior (regression), which is a bug. While performance is a non-functional quality, the 10x slowdown following a specific refactor makes it a regression bug rather than a proactive improvement.
- **Objective**: Restore performance of the `/api/dashboard` endpoint to its previous baseline of 200ms.

## Problem Statement
The `/api/dashboard` endpoint latency increased from 200ms to 2.1s after commit `a3f19bc`. This 10x slowdown is caused by parallel `Promise.all` calls being replaced with sequential awaits in `src/services/dashboard.ts:89`.

## Definition of Ready

| Field | Req | Status | Evidence |
|-------|-----|--------|----------|
| Repro scenario | R | clear | GET `/api/dashboard` endpoint |
| Expected vs Actual behavior | R | clear | Expected: 200ms. Actual: 2.1s (regression reported) |
| Affected code paths | R | clear | `src/services/dashboard.ts:89` |
| Root cause hypothesis | R | clear | Sequential awaits instead of `Promise.all` in commit `a3f19bc` |
| Severity/Impact | O | clear | 10x slowdown on a critical path dashboard endpoint |

- **All Required clear?** Yes
- **Gaps with approved risk:** none
- **Ready for Plan?** Yes

## Definition of Done
- [x] Root cause identified and documented
- [ ] Fix addresses root cause, not just symptoms
- [ ] Regression test added that reproduces the original bug (latency threshold check)
- [ ] Regression test passes with fix, fails without
- [ ] No unrelated behavior changes introduced
- [ ] Related existing tests still pass

## Codebase Findings

| File | Purpose | Key Lines |
|------|---------|-----------|
| `src/services/dashboard.ts` | Service logic for dashboard data aggregation | 89 (sequential awaits introduced in `a3f19bc`) |

## External Research
N/A - Internal regression.

## Chosen Approach
Revert the sequential awaits at `src/services/dashboard.ts:89` to use `Promise.all`. This will allow the independent data-fetching promises to execute in parallel, restoring the 200ms response time.

## Rejected Approaches
- **Caching**: Considered as a way to mask the slowdown, but rejected because the root cause is an inefficient refactor of parallel logic. Reverting is simpler and more correct.
- **Partial `Promise.all`**: Rejected to avoid unnecessary complexity; full restoration of parallelism is the direct fix.

## Anti-Patterns
- **Sequential Awaits for Independent Data**: Using `await` sequentially for promises that do not depend on each other increases total latency to the sum of all individual call times.

## Scope Boundaries
- **In scope**: `src/services/dashboard.ts` logic around line 89.
- **Out of scope**: General refactoring of the dashboard service or optimization of individual data fetching calls.

## Open Questions
- **Why was the refactor made?**: If there was a hidden dependency introduced, `Promise.all` might cause race conditions, though current findings suggest they are independent.

## Handoff Notes
- Starting point: `src/services/dashboard.ts:89`
- Patterns to follow: Use `Promise.all([p1, p2, ...])` for parallel execution.
- Known risks: None expected if data fetches are truly independent.
- Complexity: Low - straightforward revert of a code pattern.
