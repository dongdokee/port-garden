# Research Ticket: Split src/utils/helpers.ts monolith into focused modules

**Type:** Improvement
**Depth:** Standard
**Status:** Ready

## Summary
The goal is to refactor the 412-line `src/utils/helpers.ts` file into six focused modules. The current file is a monolith containing six unrelated categories of utility functions. While the functions are self-contained, the file is heavily used (47 importers), making it a candidate for modularization to improve maintainability and reduce unintended coupling.

## Intent Classification
- **What:** Split `src/utils/helpers.ts` into six separate utility files.
- **Why:** Improve code organization and maintainability by grouping related utilities and reducing the size of the monolith.
- **Type Decision:** Improvement. This is a structural refactoring that does not change functional behavior but improves non-functional code quality.

## Exploration Findings
- **Source File:** `src/utils/helpers.ts` (412 lines).
- **Sections:**
  - String helpers
  - Date formatting
  - Validation
  - Array utilities
  - API response helpers
  - Config parsing
- **Usage:** 47 files import from `helpers.ts`.
- **Relationships:** No cross-references between sections; each is self-contained.

## Field Classification

| Field | Status | Evidence / Reasoning |
|-------|--------|----------------------|
| Current state | `clear` | 412-line monolith `src/utils/helpers.ts` with 6 sections and 47 importers. (Scenario prompt) |
| Target state | `clear` | 6 focused modules (`string.ts`, `date.ts`, `validation.ts`, `array.ts`, `api.ts`, `config.ts`) with updated imports. |
| Evidence | `clear` | High line count and import frequency indicate structural pain and poor modularity. |
| Behavior invariants | `clear` | Required (Structural Change). 47 importers must maintain identical behavior; no changes to function signatures or logic. |

## Approach & Implementation Plan
1. **Create 6 new utility files** in `src/utils/`:
   - `string.ts`
   - `date.ts`
   - `validation.ts`
   - `array.ts`
   - `api-response.ts`
   - `config-parsing.ts`
2. **Migrate functions** from `helpers.ts` to their respective new files, maintaining all export names.
3. **Update 47 importing files** to point to the new modules.
4. **Remove the original `helpers.ts` file** once all imports are migrated.

## Definition of Done
- [x] Target state achieved: 6 focused modules created and `helpers.ts` removed.
- [x] Behavior invariants preserved: All 47 importers successfully use the new modules without behavioral changes.
- [x] No regressions: Existing test suites pass for all affected modules and their callers.
- [x] Verified against baseline: Codebase reflects improved modularity and reduced file complexity.

## Risks & Constraints
- **Import churn:** Updating 47 files is a large surface area for mechanical errors.
- **Circular dependencies:** While currently self-contained, care must be taken during the split to ensure no new circular dependencies are introduced.
- **Downstream impact:** Any build or bundling tools relying on the specific file path `src/utils/helpers.ts` must be updated.
