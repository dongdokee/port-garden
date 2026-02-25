# Research Ticket

## Context
- **Type**: Improvement
- **Depth**: Standard
- **Objective**: Split `src/utils/helpers.ts` (412 lines, 6 unrelated sections) into 6 focused single-concern modules, updating all 47 importers without breaking their runtime behavior.

---

## Problem Statement

`src/utils/helpers.ts` has grown into a 412-line grab-bag file containing six conceptually unrelated domains, separated only by comment headers:

```
// --- String helpers ---
// --- Date formatting ---
// --- Validation ---
// --- Array utilities ---
// --- API response helpers ---
// --- Config parsing ---
```

This structure creates discoverability friction (developers must scan the whole file to know what it contains), violates single-responsibility at the module level, makes tree-shaking less precise (bundlers may include unused sections), and makes future additions default to the same catch-all file. 47 files currently import from `helpers.ts`, meaning any structural mistake during the split would silently break a large surface area if not coordinated carefully.

The refactor appears mechanical at first glance because the six sections have no cross-references. However, the structural nature of the change — moving exports across module boundaries, altering import paths in 47 files — requires Standard depth. Behavior invariants are **Required** per the research skill definition for structural changes: all 47 importers must continue to receive the same exported symbols with identical signatures and semantics.

---

## Definition of Ready

| Field | Req | Status | Evidence |
|-------|-----|--------|----------|
| Current state | R | clear | 412-line monolith; 6 section headers; 47 confirmed importers |
| Target state | R | clear | 6 focused modules under `src/utils/`; one per domain |
| Evidence | R | clear | Line count, import count, section enumeration from scenario |
| Behavior invariants | R | clear | All 47 importers must resolve same named exports with same signatures post-split |
| Affected code/files | O | partial | `src/utils/helpers.ts` confirmed; importing files enumerated at 47 but not individually read (fictional codebase — see Codebase Findings) |
| Downstream dependents | O | partial | 47 importers noted; test coverage extent unknown |
| Constraints | O | noted | No barrel-re-export anti-pattern unless required for transition period |
| Non-goals | O | noted | No function-level behavior changes; no new tests beyond import-path updates |

- **All Required clear?** Yes — current state, target state, evidence, and behavior invariants are all sufficiently defined for planning.
- **Gaps with approved risk:** The specific 47 importing files were not individually read because `src/utils/helpers.ts` does not exist in this repository (fictional scenario). The gap is documented. An implementer must run the import-path audit step (see Handoff Notes) before starting work.
- **Ready for Plan?** Yes, contingent on completing the import audit (Step 0 in handoff).

---

## Definition of Done

- [ ] Target state achieved: 6 new module files exist under `src/utils/` with correct domain grouping, and `src/utils/helpers.ts` is deleted or marked deprecated
- [ ] Behavior invariants preserved: all 47 importing files compile and their tests pass with zero changes to function signatures, return types, or runtime behavior
- [ ] No regressions in existing functionality: full test suite passes (unit + integration)
- [ ] Improvement verified against evidence baseline: no file in `src/utils/` exceeds ~80 lines of exported logic; static analysis confirms no imports still reference `src/utils/helpers`

---

## Codebase Findings

| File | Purpose | Key Lines |
|------|---------|-----------|
| `src/utils/helpers.ts` | Target file to split — 412-line multi-domain utility grab-bag | NOT FOUND in repo (fictional); structure known from scenario description |
| `src/utils/` (47 importers) | Files importing from helpers.ts | NOT FOUND; must be audited by implementer |
| `refs/oh-my-claudecode/src/utils/string-width.ts` | Real-world example of a well-scoped single-concern utility module (analogous to target state) | Lines 1-253; single domain, clear exports, no cross-module dependencies |
| `refs/oh-my-claudecode/src/lib/job-state-db.ts` | Real-world example of the section-header pattern (`// --- DB Lifecycle ---`, `// --- CRUD Operations ---`, etc.) as a structural analog to helpers.ts | Lines 105, 282, 579, 640, 671 |

**Gap documentation:** `src/utils/helpers.ts` does not exist in `/home/dd/port-garden`. All 47 importing files are consequently unlocatable via search. The codebase is the fictional project described in the scenario. The research ticket is written from scenario-provided facts plus structural analogs observed in the `refs/` tree.

---

## Chosen Approach

**Approach A: Direct split with atomic import rewrites (recommended)**

1. **Audit phase (Step 0):** Run `grep -r "from.*utils/helpers" src/ --include="*.ts"` to enumerate all 47 importers and capture exactly which named exports each file uses. Group by section.
2. **Create 6 new module files** under `src/utils/`:
   - `src/utils/string-helpers.ts`
   - `src/utils/date-formatting.ts`
   - `src/utils/validation.ts`
   - `src/utils/array-utils.ts`
   - `src/utils/api-response.ts`
   - `src/utils/config-parsing.ts`
3. **Move functions** — cut each section verbatim into its new file, add appropriate `export` keywords. No logic changes.
4. **Rewrite imports** in all 47 files — update each `import { x } from '../utils/helpers'` to target the correct new module path. Automated with `sed` or an AST-based codemod (e.g., `ts-morph`).
5. **Delete `src/utils/helpers.ts`** after all imports are resolved and tests pass.
6. **Verify:** TypeScript compilation clean; full test suite green.

**Trade-offs:**
- Pros: Clean cut, no residual coupling, correct target state from day one.
- Cons: All 47 import rewrites must land atomically in one PR or the codebase will be in a broken intermediate state. Any file missed during audit will produce a compile error.

**Behavior invariant checklist for this approach:**
- Function signatures must be copied verbatim (no parameter renaming, no default-value additions).
- Export names must be identical (no renaming during move).
- No imports added to the new modules that were not already in helpers.ts (risk: accidental side-effect from a new transitive dep).
- TypeScript `strict` compiler checks must stay satisfied without suppression comments.

---

## Rejected Approaches

**Approach B: Barrel re-export shim**

Create 6 new domain files, but keep `src/utils/helpers.ts` as a re-export barrel:
```typescript
// src/utils/helpers.ts (shim)
export * from './string-helpers';
export * from './date-formatting';
// ...
```
This means zero changes to the 47 importers.

Rejected because: it achieves only half the goal. The monolith path persists as a valid import target and will continue to accumulate new functions. Developers won't naturally discover the new modules. The structural benefit — clear module boundaries — is deferred indefinitely. Use only if a zero-importer-change constraint is imposed externally (e.g., published public API).

**Approach C: Incremental per-section migration (one PR per section)**

Split one section per PR, leaving remaining sections in helpers.ts and updating only that section's importers per PR.

Rejected because: creates a sustained intermediate state where helpers.ts is a partial monolith. Across 6 PRs, reviewers must track which sections have moved. Risk of a section being skipped. The per-section approach is only warranted if the import audit reveals that one section has a disproportionate importer count (e.g., 40 of 47 files import from String helpers) making atomic rewrite risky; in that case, revisit.

---

## Scope Boundaries

**In scope:**
- Moving the 6 sections of `src/utils/helpers.ts` into 6 new files with matching names
- Updating import paths in all 47 importing files
- Deleting `src/utils/helpers.ts` at completion
- Verifying TypeScript compilation and test suite after the move

**Out of scope:**
- Renaming any exported function or changing any function signature
- Adding new functions or new utility sections during this PR
- Changing the behavior of any function (pure structural move)
- Creating an `index.ts` barrel under `src/utils/` (consider separately if needed)
- Updating documentation or comments that reference helpers.ts locations (can follow in a separate task)

---

## Handoff Notes

- **Starting point:** Run the import audit first: `grep -rn "from.*utils/helpers" src/ --include="*.ts"` and `grep -rn "require.*utils/helpers" src/ --include="*.ts"`. Group results by which named exports each importer uses. This tells you exactly which functions belong to which new module file and lets you validate that the 6 sections are truly non-overlapping.
- **Known risks:**
  1. **Hidden cross-section dependencies:** The scenario states no cross-references, but verify with a grep for each exported function name used in another section before splitting. A single missed dependency causes a circular-import compile error.
  2. **Wildcard imports:** If any of the 47 importers use `import * as helpers from '../utils/helpers'`, a post-split barrel may be unavoidable for that importer. Audit for `import *` specifically.
  3. **Dynamic requires:** If any file uses `require('../utils/helpers')` at runtime (not statically), automated import rewriting may miss it.
  4. **Test files:** Test files may mock the `helpers` module at the path level (`jest.mock('../utils/helpers')`). These mock registrations must be updated per new module path or the mocks will silently fail to intercept calls.
  5. **CI type-check vs. emit:** Confirm the project runs `tsc --noEmit` in CI. If it only runs `ts-jest` or `esbuild`, a path error could pass CI and surface only at runtime.
- **Complexity:** Low-to-medium. The logic changes are zero; the risk surface is entirely in the import graph and toolchain. An hour of careful audit plus automated codemod should be sufficient for an experienced contributor. The 47-file import rewrite is the primary mechanical effort.
