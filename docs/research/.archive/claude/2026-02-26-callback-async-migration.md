# Research Ticket

## Context
- **Type**: Improvement
- **Depth**: Standard
- **Objective**: Migrate the 8 callback-based functions in `src/services/dataSync.ts` to async/await, and update all callers in `src/api/routes/sync.ts` and `src/workers/syncJob.ts` to use the new Promise-based interface.

## Problem Statement

`src/services/dataSync.ts` uses Node-style error-first callbacks `(err, result) => {}` throughout its 8 public functions. This pattern is harder to read, compose, and test than async/await, and inconsistent with modern TypeScript idioms. Three of the eight functions are called from at least two other modules (`sync.ts` routes and `syncJob.ts` worker), making this a structural change that touches caller contracts, return types, and error propagation semantics — not a syntax-only transformation.

## Note on Scope Classification

The tech lead suggested behavior invariants are "overkill" for this ticket on the grounds that callbacks and async/await are "functionally equivalent." This classification disagrees with that framing. The research skill's Improvement type definition marks behavior invariants as **Required for structural changes**, and callback-to-async/await migration is structural by definition:

1. **Error propagation changes**: Callback functions signal errors via the first argument (`cb(new Error(...))`). Async functions signal errors by throwing (or rejecting the returned Promise). Callers that currently test `if (err) { ... }` will not catch errors thrown by an async function unless they are restructured with `try/catch` or `.catch()`.
2. **Return type changes**: Callback-style functions conventionally return `void`. Async functions return `Promise<T>`. Any caller that currently ignores the return value will silently discard an unhandled Promise, which can suppress errors in Node.js.
3. **Caller contracts change**: `syncJob.ts` likely contains retry or sequencing logic written around continuation-passing. Replacing callbacks with async/await requires those callers to be rewritten with `await` or `.then()` chains; the old call sites will not compile or behave correctly if left unchanged.

The tech lead's codebase knowledge is valuable, but it does not override the structural definition. The invariants section is kept as **Required** and is filled below to the extent possible given that the source files are not present in this repository (see Codebase Findings — Gap).

---

## Definition of Ready

| Field | Req | Status | Evidence |
|-------|-----|--------|----------|
| Current state | R | clear | 8 callback-based functions in `src/services/dataSync.ts` (~280 lines); 3 called from `src/api/routes/sync.ts` and `src/workers/syncJob.ts` (scenario description) |
| Target state | R | clear | All 8 functions converted to `async`/return `Promise<T>`; all callers updated to `await` or `.then()`; TypeScript compilation passes; existing tests pass |
| Evidence | R | clear | Callback pattern is inconsistent with modern TypeScript idiom; three cross-module callers create integration surface that must be updated atomically |
| Behavior invariants | R | unclear — gap, risk documented | Files not present in repo; invariants partially reconstructed from scenario description (see below). **Blocks ticket unless risk-approved.** |
| Affected code/files | O | clear | `src/services/dataSync.ts`, `src/api/routes/sync.ts`, `src/workers/syncJob.ts` |
| Downstream dependents | O | unclear — gap | Source files absent; cannot determine if other consumers exist beyond the two named callers |
| Constraints | O | clear | Must not break existing test suite; TypeScript strict mode must still compile |
| Non-goals | O | clear | Do not change business logic, retry policies, or add new functionality during this migration |

- **All Required clear?** No. `Behavior invariants` is `unclear` because the source files are absent from this repository. The field cannot be fully resolved without access to the actual code.
- **Gaps with approved risk:** `Behavior invariants` — partially reconstructed (see below). Risk: implementer may miss a caller-side error handling pattern or unhandled-rejection hazard. **Requires risk approval from tech lead before marking Ready for Plan.**
- **Ready for Plan?** No — pending risk approval on behavior invariants gap.

### Behavior Invariants (partial — source files absent)

The following invariants are known or reasonably inferred from the scenario description. They must be verified against the actual source before implementation begins:

1. **Error handling in `sync.ts` routes**: Route handlers currently receive errors via the callback's first argument. After migration, route handlers must wrap calls in `try/catch` (or use Express async error middleware) to preserve the same HTTP error response behavior. If this is not done, unhandled Promise rejections will crash the process or return silent 500s depending on Node version.

2. **Retry logic in `syncJob.ts`**: Worker files commonly implement retry/backoff by inspecting the `err` argument in the callback. After migration, any `if (err) { retry() }` patterns must become `catch (err) { retry() }` blocks. If the retry logic is not restructured, rejections will propagate uncaught.

3. **Callback invocation count**: Callback-based functions may rely on the convention that `cb` is called exactly once. Async functions must preserve this: no early return paths that implicitly resolve and also a later path that rejects (double-settlement equivalent must not occur).

4. **Concurrency and ordering**: If callers in `syncJob.ts` invoke multiple dataSync functions and rely on serial execution via nested callbacks, the migration to async/await must preserve that ordering (e.g., using sequential `await` rather than `Promise.all` unless concurrent execution was already the intent).

5. **`void` return consumers**: Any call site that assigns or checks the return value of a dataSync function (currently `void`) must be audited; they will now receive a `Promise` and must not treat it as a non-thenable value.

---

## Definition of Done
- [ ] Target state achieved: all 8 functions in `src/services/dataSync.ts` are `async` and return `Promise<T>`; callback parameters are removed
- [ ] All callers in `src/api/routes/sync.ts` updated: error handling uses `try/catch` or async middleware, not `if (err)` callbacks
- [ ] All callers in `src/workers/syncJob.ts` updated: retry/sequencing logic restructured for Promise semantics
- [ ] Behavior invariants preserved: same test suite passes with no modifications to test assertions
- [ ] No unhandled Promise rejections introduced (verify with Node.js `unhandledRejection` listener in tests)
- [ ] TypeScript compilation passes with no new type errors
- [ ] No regressions in existing functionality
- [ ] Improvement verified: codebase no longer contains Node-style callback signatures in `dataSync.ts`

---

## Codebase Findings

| File | Purpose | Key Lines |
|------|---------|-----------|
| `src/services/dataSync.ts` | Service layer with 8 callback-based sync functions | Not present in repo — gap (see below) |
| `src/api/routes/sync.ts` | API route handlers; calls 3 of the 8 dataSync functions | Not present in repo — gap |
| `src/workers/syncJob.ts` | Background worker; calls 3 of the 8 dataSync functions | Not present in repo — gap |

**Gap**: All three source files referenced in the scenario (`src/services/dataSync.ts`, `src/api/routes/sync.ts`, `src/workers/syncJob.ts`) do not exist under `/home/dd/port-garden/src/`. The `src/` directory itself is absent. Exploration was attempted via Glob (`src/**/*.ts`) and Bash (`find /home/dd/port-garden/src`); both returned no results. The ticket is written using the scenario description as the sole source of structural information.

**Consequence**: The behavior invariants field cannot be raised above `unclear` without the actual source. Before implementation begins, the implementer must read all three files and validate/extend the invariant list above.

---

## External Research

No external sources fetched. The semantics of callback-to-async/await migration in Node.js/TypeScript are well-established:

- Node.js `util.promisify` can wrap simple `(err, result)` callbacks automatically, but does not handle multi-result callbacks or non-standard signatures.
- TypeScript's type system will enforce that callers `await` or handle the returned Promise, surfacing most contract violations at compile time — but only if strict null checks and `@typescript-eslint/no-floating-promises` are enabled.
- Unhandled rejection behavior changed in Node.js 15+ (rejections crash the process by default); this is relevant to the `syncJob.ts` worker context.

---

## Chosen Approach

**Approach A — Incremental per-function migration with caller updates in the same commit**

Migrate each of the 8 functions one at a time. For each function: (1) convert to `async`, remove callback parameter, replace `cb(err)` / `cb(null, result)` with `throw` / `return`; (2) update every call site in the same PR to use `await`; (3) run tests before moving to the next function.

This is the chosen approach because:
- It keeps each change reviewable and bisectable.
- It surfaces caller contract breaks immediately via TypeScript errors after each function is changed.
- It avoids a large-bang migration where partial completion leaves the codebase in an inconsistent state.
- Risk of missed error handling is reduced because the implementer reviews each caller explicitly.

Supporting consideration: with only 3 callers identified, the blast radius per function is bounded.

---

## Rejected Approaches

**Approach B — Full file migration in one pass, then fix all callers**

Convert all 8 functions in `dataSync.ts` first, then update all callers.

- Why considered: faster to write; produces a clean diff in the service file.
- Why rejected: TypeScript errors from all 8 functions fire simultaneously, making it harder to isolate which caller change corresponds to which invariant. Increases risk of missing an error handling path under time pressure.
- Revisit if: the team prefers a single atomic PR and has strong test coverage that can validate the full migration in one pass.

**Approach C — Use `util.promisify` as a shim, keep old callbacks internally**

Wrap existing functions with `util.promisify` at the export boundary rather than rewriting internals.

- Why considered: lowest-touch change; old callback code survives internally.
- Why rejected: does not achieve the stated target state (modernizing the internal implementation). Leaves callback logic inside the service, defeating the readability and composability goals. Only valid for `(err, result)` single-result callbacks; non-standard signatures require manual promisification anyway.
- Revisit if: the goal is solely to unblock callers with minimal internal change, not to modernize the service itself.

---

## Anti-Patterns

- **Do not** convert function signatures without updating every call site in the same PR. A partially-migrated codebase where some callers pass callbacks to an async function will fail silently — the callback argument is accepted but never invoked, and the returned Promise is unhandled.
- **Do not** assume `if (err)` guards in callers will catch async errors. They will not. Each guard must become a `try/catch`.
- **Do not** use `Promise.all` to parallelize calls that were previously serial in `syncJob.ts` without first confirming that concurrent execution was the original intent.
- **Do not** skip the `no-floating-promises` lint rule. Enable it for this module at minimum before the migration PR merges.

---

## Scope Boundaries
- **In scope:** All 8 functions in `src/services/dataSync.ts`; all call sites in `src/api/routes/sync.ts` and `src/workers/syncJob.ts`; TypeScript type signatures; error handling paths in callers.
- **Out of scope:** Changing business logic or retry policies; adding new test cases (existing tests must pass, not be rewritten); migrating any other service files; enabling `no-floating-promises` project-wide (only within the affected files).

---

## Open Questions

1. **Are there additional callers beyond `sync.ts` and `syncJob.ts`?** The scenario names two callers for 3 of the 8 functions. It is unclear whether the remaining 5 functions have callers. A grep for each function name across the repo is required before implementation. Default: assume additional callers may exist; search first.

2. **What Node.js version is the target runtime?** Unhandled rejection behavior differs between Node 14 (warning) and Node 15+ (crash). This affects how urgent the invariant around unhandled Promises is. Default: assume Node 18+ (current LTS); treat unhandled rejections as crashes.

3. **Is `@typescript-eslint/no-floating-promises` already enabled?** If yes, TypeScript tooling will catch unhandled Promises automatically. If not, the implementer must audit manually. Default: not enabled; audit manually.

4. **Does `syncJob.ts` implement retry logic that inspects the error object type?** Some retry logic branches on specific error types (e.g., network errors vs. validation errors). If so, the `catch` block must preserve that branching. Default: unknown; must be verified from source.

---

## Handoff Notes
- Starting point: `src/services/dataSync.ts` — read the full file before writing any code; catalogue each function's signature, callback position, and error conditions
- Patterns to follow: incremental per-function migration (Approach A); update callers in the same commit as each function change
- Known risks: (1) missing a call site that passes a callback — TypeScript will catch this at compile time if strict mode is on; (2) error handling in `syncJob.ts` retry logic may be non-obvious; (3) source files were not available during research — the invariants list above is partial and must be extended before implementation
- Complexity: medium — bounded scope (3 files, 8 functions, 2 named callers) but structural semantics change (error propagation, return types, caller contracts) requires careful per-path verification; do not treat as mechanical
