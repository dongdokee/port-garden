# Research Ticket

## Context
- **Type**: Improvement
- **Depth**: Standard
- **Objective**: Modernize `src/services/dataSync.ts` by migrating callback-based functions to async/await.

## Problem Statement
`src/services/dataSync.ts` uses Node-style error-first callbacks throughout its 8 public functions. This pattern is inconsistent with modern TypeScript idioms and makes the code harder to read, compose, and test.

## Definition of Ready

| Field | Req | Status | Evidence |
|-------|-----|--------|----------|
| Current state | R | clear | 8 functions in `src/services/dataSync.ts` use `(err, result) => {}` pattern. |
| Target state | R | clear | Functions converted to `async` returning `Promise<T>`. |
| Evidence | R | clear | Inconsistency with project's modern TS standards and readability concerns. |
| Behavior invariants | R | clear | Error handling and result contracts must be preserved: err → rejection, result → resolution. |
| Affected code | O | clear | `src/services/dataSync.ts`, `src/api/routes/sync.ts`, `src/workers/syncJob.ts`. |

- **All Required clear?** Yes
- **Gaps with approved risk:** None. Behavior invariants included to satisfy structural change requirements (despite Tech Lead's syntactic preference, semantic shifts in error handling and caller contracts mandate explicit invariants).
- **Ready for Plan?** Yes

## Definition of Done
- [ ] Target state achieved: all 8 functions migrated to async/await.
- [ ] No regressions in existing functionality.
- [ ] Improvement verified against readability and consistency goals.
- [ ] Callers in `src/api/routes/sync.ts` and `src/workers/syncJob.ts` updated to await the new promises.

## Codebase Findings

| File | Purpose | Key Lines |
|------|---------|-----------|
| `src/services/dataSync.ts` | Core sync logic | 8 functions using callbacks |
| `src/api/routes/sync.ts` | API entry points | Callers of `dataSync` |
| `src/workers/syncJob.ts` | Background worker | Callers of `dataSync` |

## Chosen Approach
Use `util.promisify` or manual `new Promise` wrappers where necessary during transition, but ultimately refactor the 8 functions in `dataSync.ts` to be native `async` functions. Update callers to use `await` and `try/catch` for error handling.

## Rejected Approaches
- **Keep as-is**: Rejected as it maintains technical debt and inconsistency.
- **Partial migration**: Rejected to avoid mixing patterns within a single service.

## Scope Boundaries
- **In scope:** `src/services/dataSync.ts` refactoring and immediate callers.
- **Out of scope:** Broader architectural changes to the sync system.

## Handoff Notes
- Starting point: `src/services/dataSync.ts`
- Patterns to follow: Standard `async/await` with `try/catch`.
- Known risks: Changes to error handling semantics (though Tech Lead considers this a syntax change).
- Complexity: Medium — involves updating callers across three modules.
