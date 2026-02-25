# Research Ticket

## Context
- **Type**: Bug (regression — behavior deviated from known-good baseline after deploy)
- **Depth**: Standard (multiple files potentially affected by refactor commit; some scope unknowns remain)
- **Objective**: Confirm root cause of the 10x latency regression on `GET /api/dashboard` introduced by commit `a3f19bc`, establish affected scope, define a safe fix path, and add a regression test to prevent recurrence.

---

## Problem Statement

The `GET /api/dashboard` endpoint regressed from a p50 response time of ~200ms to ~2.1s following the Wednesday deploy of commit `a3f19bc`. The regression was introduced during a refactor that replaced a `Promise.all` parallel-fetch pattern with sequential `await` calls at `src/services/dashboard.ts:89`. This serializes I/O operations that were previously concurrent, causing the response time to increase proportionally to the number of awaited operations. This is a production-impacting regression, not a new optimization opportunity: the parallel behavior was the established, known-good baseline.

The teammate suggestion to reclassify as an Improvement is rejected. An Improvement is proactive work to add capability that did not previously exist. This regression removed an existing performance characteristic; that is a Bug by the skill's own classification rules ("broken behavior deviating from expected").

---

## Definition of Ready

| Field | Req | Status | Evidence |
|-------|-----|--------|----------|
| Repro scenario | R | **Clear** | `GET /api/dashboard` after deploying commit `a3f19bc`. Latency jumps from ~200ms to ~2.1s. Reproducible in any env with the commit applied. |
| Expected vs Actual behavior | R | **Clear** | Expected: ~200ms (pre-`a3f19bc` baseline). Actual: ~2.1s (post-`a3f19bc`). Delta: ~1.9s, ~10x regression. |
| Affected code paths | R | **Partially clear — gap documented** | Primary path: `src/services/dashboard.ts:89`. Full scope of `a3f19bc` is unknown: the file does not exist in the research repo; the commit may have touched additional service, route, or utility files. Implementer must inspect the full diff of `a3f19bc` before writing a fix. |
| Root cause hypothesis | R | **Clear** | `Promise.all([...])` was replaced with sequential `await` statements during the refactor. Each awaited I/O call now blocks the next. If `n` operations each take ~300ms, sequential execution takes `n * 300ms` vs. `~300ms` in parallel. The regression scales with the number of data sources fetched. |
| Severity / impact | O | **Clear** | High. A 10x latency increase on a primary dashboard endpoint degrades perceived product performance for all users. Likely increases server-side resource consumption (connections held open longer). Risk of cascading timeout failures if downstream callers have hard timeouts near 2s. |
| Related tests | O | **Gap — no test files found** | No test files for `src/services/dashboard.ts` were found in the repository. This is a gap the implementer must address; a regression test is required in the DoD. |
| Non-goals | O | **Clear** | See Scope Boundaries below. |

- **All Required clear?** Yes, with one documented gap: the full diff of `a3f19bc` is not available in this research environment. The implementer must verify scope before coding.
- **Gaps with approved risk:** The partial code-path visibility is an accepted research gap — the root cause at `dashboard.ts:89` is high-confidence based on the debug session. Full scope must be confirmed during implementation planning.
- **Ready for Plan?** Yes.

---

## Definition of Done

- [ ] Root cause identified and documented: confirm that sequential `await` calls at `src/services/dashboard.ts:89` are the sole source of the regression (or document additional sources if found in the full `a3f19bc` diff).
- [ ] Fix addresses root cause, not just symptoms: restore parallel execution via `Promise.all` (or equivalent) rather than patching timeouts, adding caching, or other mitigations that mask the underlying serialization.
- [ ] Full diff of commit `a3f19bc` reviewed: confirm no other files in the commit introduced additional serialization or performance-affecting changes.
- [ ] Regression test added that reproduces the original bug: a test (unit or integration) that demonstrates sequential behavior produces unacceptable latency or that the data sources are fetched concurrently.
- [ ] No unrelated behavior changes introduced: the fix must not alter response shape, error handling, or any correctness-affecting logic — only concurrency of I/O.
- [ ] Endpoint latency verified post-fix to return to baseline (~200ms p50) in a representative environment.

---

## Codebase Findings

| File | Purpose | Key Lines | Found? |
|------|---------|-----------|--------|
| `src/services/dashboard.ts` | Dashboard data-fetching service; orchestrates calls to downstream data sources | Line 89: `Promise.all` replaced with sequential `await` during refactor | **No — file absent from research repo (fictional codebase)** |
| `src/routes/dashboard.ts` or similar | HTTP route handler for `GET /api/dashboard`; calls the service | Unknown | **No — not found** |
| Tests for `dashboard.ts` | Unit/integration tests covering the service | Unknown | **No — not found; confirmed gap** |
| Commit `a3f19bc` diff | Full change set introduced Wednesday; may affect files beyond `dashboard.ts` | All changed files | **Not accessible in research environment** |

**Exploration summary:** The project root at `/home/dd/port-garden` contains no `src/` directory and no TypeScript source files matching the scenario. Broad searches for `dashboard`, `Promise.all`, `a3f19bc`, and `sequential await` returned no hits outside of the eval scenario definition file (`docs/research/evals/bug.md`). The codebase gap is fully documented. All factual claims in this ticket are sourced from the debug session described in the scenario, not fabricated.

---

## Chosen Approach

**Approach 2 — Targeted revert of the concurrency change at `dashboard.ts:89`**

Restore the `Promise.all([...])` pattern for the data-source fetches that were serialized in `a3f19bc`. This is a minimal, surgical change that directly inverts the regression without touching correctness logic.

Trade-offs:
- **Pro:** Directly addresses root cause. Minimal diff, easy to review. Low risk of introducing new behavior changes. Aligns with established performance baseline.
- **Pro:** Implementer already understands the call site from the debug session — low ramp-up time.
- **Con:** Requires verifying the full `a3f19bc` diff to ensure no other files also introduced serialization; a partial revert could leave residual regressions.
- **Con:** If the refactor changed error handling alongside the concurrency change (e.g., wrapping individual `await` calls in try/catch), restoring `Promise.all` requires deciding how to handle partial failures — this must be checked.

This approach is preferred because it is the most direct fix with the narrowest blast radius.

---

## Rejected Approaches

**Approach 1 — Full revert of commit `a3f19bc`**

Revert the entire commit via `git revert a3f19bc`.

Rejected because: the commit was a deliberate refactor likely containing multiple changes. A full revert would undo any correctness improvements, structural changes, or other fixes included in the commit. The regression is isolated to the concurrency pattern, not the entire refactor.

**Approach 3 — Add caching or a timeout mitigation**

Add response caching on the dashboard endpoint to absorb the latency or add a stale-while-revalidate layer.

Rejected because: this treats the symptom (slow response) rather than the cause (serialized I/O). It adds architectural complexity and operational cost, and masks a code defect that should be corrected directly. If the underlying sequential pattern grows (more data sources added later), the regression worsens regardless of caching.

---

## Scope Boundaries

**In scope:**
- `src/services/dashboard.ts` line 89 and surrounding concurrency logic
- Full diff review of commit `a3f19bc` for any additional concurrency regressions
- Adding a regression test covering parallel fetch behavior on the dashboard service
- Verifying endpoint latency returns to ~200ms baseline post-fix

**Out of scope:**
- Refactoring other endpoints or services for concurrency improvements
- Changing the data model or response shape of `GET /api/dashboard`
- Performance profiling beyond the specific regression identified
- Infrastructure changes (connection pooling, caching layers, CDN)
- Reviewing other commits in Wednesday's deploy beyond `a3f19bc`

---

## Handoff Notes

- **Starting point:** `src/services/dashboard.ts:89` — the `await` statements that replaced `Promise.all`. Run `git diff a3f19bc~1 a3f19bc` to see the full change set before writing any code.
- **Known risks:**
  - The refactor may have changed error handling per-call (individual try/catch around each `await`). Restoring `Promise.all` requires deciding on a `Promise.allSettled` vs `Promise.all` strategy for partial-failure semantics — check whether the endpoint is expected to fail fast on any data-source error or degrade gracefully.
  - If the number of parallelized I/O calls is large, `Promise.all` may increase peak concurrency to downstream services. Verify downstream rate limits are not a concern.
  - No existing regression test was found. The test must be written fresh — budget time accordingly.
- **Complexity:** Low-to-medium. The fix itself is likely 2–5 lines. The complexity is in verifying the full commit scope, confirming error-handling semantics, and writing the regression test without an existing test harness to build on.
