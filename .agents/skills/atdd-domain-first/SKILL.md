---
name: atdd-domain-first
description: Use when creating implementation plans or implementing features with explicit acceptance criteria (especially Gherkin), where business-rule correctness is critical and full UI-first end-to-end testing would be slow or brittle.
---

# ATDD Domain First

## Overview

Write acceptance tests first, but place the first automation layer at the UseCase or domain boundary instead of full UI end-to-end.
Lock requirements early with fast, stable tests, then add minimal UI smoke coverage.

## When To Use

- Financial, pricing, billing, policy, eligibility, or allocation logic
- Features with clear AC/Gherkin and high risk of requirement mismatch
- Projects where UI tests are expensive, flaky, or slow
- Teams needing AC-to-test traceability for release decisions
- `writing-plans` runs where design docs already contain Gherkin Acceptance Criteria

Do not use as the only strategy when behavior is primarily UI interaction (navigation, gestures, animation timing). Add UI-level acceptance tests early for those cases.

## Planning Integration

When invoked during `writing-plans`:

1. Add AC ids (`AC-01`, `AC-02`, ...) in design/plan traceability context.
2. Build an AC Traceability Matrix in the plan.
3. Treat AC ids as document-local identifiers used only for design/plan traceability.
4. Do not propagate AC ids into non-traceability artifacts; name those artifacts by behavior or scenario.
5. Put acceptance-test-first tasks at the UseCase/domain boundary ahead of implementation tasks.
6. Keep compatibility with non-AC planning by applying this workflow only when explicit AC/Gherkin exists.

## Core Rules

1. Freeze acceptance criteria before implementation.
2. Map each AC scenario to at least one acceptance test case id.
3. Write acceptance tests first at UseCase/domain boundary.
4. Run tests and watch them fail for the expected reason.
5. Implement minimal code to pass acceptance tests.
6. Add lower-level unit tests for algorithmic and edge-case detail.
7. Add UI smoke tests for wiring and critical user path only.
8. Keep AC-to-test traceability updated.

## Workflow

### Step 1: Normalize AC Into Test Cases

- Assign stable local ids such as `AC-01`, `AC-02`.
- Convert each Given/When/Then into setup/action/assertion.
- Define explicit pass criteria and expected error messages.

Example mapping:

| AC ID | Scenario | Boundary |
|---|---|---|
| AC-03 | Target sum not 100 blocks calculation | UseCase |
| AC-04 | Valid target computes fee-inclusive buy/sell guidance | UseCase |
| AC-05 | Guidance only, no order execution action | UI smoke |

### Step 2: Choose First Automation Boundary

Default to UseCase/domain when:
- The rule is business logic
- Input and output can be modeled without UI

Escalate to UI-first acceptance only when:
- UI interaction is the behavior under test
- Domain-level tests cannot prove the requirement

### Step 3: Write Failing Acceptance Tests First

- Name tests by observable behavior using BDD style (`should_<outcome>_when_<condition>` or `given_<state>_when_<action>_then_<outcome>`).
- Keep tests black-box at the selected boundary.
- Avoid asserting internal implementation details.

Template:

```kotlin
@Test
fun should_block_calculation_when_target_sum_is_out_of_tolerance() {
    val input = sampleInput(targetSum = 90.toBigDecimal())
    val result = calculateRebalanceUseCase(input)
    assertTrue(result is ValidationError)
    assertEquals("목표 비중 합계는 100%여야 합니다", result.message)
}
```

### Step 4: Implement Minimal Code To Pass

- Implement only behavior needed for failing AC tests.
- Keep domain logic deterministic and side-effect-light.
- Re-run acceptance tests after each small change.

### Step 5: Add Unit and Integration Depth

- Add unit tests for edge math and rounding.
- Add integration tests for adapters (CSV parsing, API mapping, persistence).
- Keep these tests subordinate to AC behavior, not a replacement.

### Step 6: Add Thin UI Smoke Coverage

- Verify critical wiring for the CUJ:
  - Input exists
  - Validation errors render
  - Results render
  - Forbidden actions (e.g., order execution) are absent
- Keep UI assertions minimal and stable.

## Test Layer Policy

| Layer | Primary purpose | Scope |
|---|---|---|
| Acceptance (UseCase/domain) | Prove AC behavior | First and mandatory |
| Unit (domain) | Edge conditions and formulas | Deep detail |
| Integration (data/adapters) | External mapping reliability | Focused |
| UI smoke | Wiring and key text/actions | Thin |

## Definition Of Done

- Every AC id has at least one automated test
- AC tests pass on CI
- Required UI smoke tests pass
- No uncovered high-risk AC remains
- Traceability table is current in PR or plan document

## Anti-Patterns

- Writing all acceptance tests only at the end
- Writing only UI E2E tests for business rules
- Treating AC text as documentation only, not executable checks
- Losing AC id mapping during refactor

## Quick Start Checklist

- [ ] List AC ids from approved Gherkin
- [ ] Decide boundary per AC (UseCase default)
- [ ] Write failing AC tests first
- [ ] Implement minimal code to pass
- [ ] Add unit/integration depth
- [ ] Add UI smoke for CUJ wiring
- [ ] Verify AC traceability before completion
