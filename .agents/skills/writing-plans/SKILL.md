---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

# Writing Plans

## Overview

Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. Assume they don't know good test design very well.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Context:** This should be run in a dedicated worktree (created by brainstorming skill).

**Save plans to:** `docs/plans/YYYY-MM-DD-<feature-name>.md`

## Compatibility Branching (Mandatory)

Before writing any plan, classify the input spec into one of two modes:

1. **AC/Gherkin mode**
   - Use when the approved design/spec contains explicit Acceptance Criteria (especially Gherkin scenarios).
   - **REQUIRED SUB-SKILL:** Use `atdd-domain-first`.
2. **Standard mode**
   - Use when no explicit Acceptance Criteria are defined.
   - Continue with default TDD-first planning in this skill.

If unclear whether AC exists, ask one direct clarification question and then choose a mode.

## Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step

## Plan Document Header

**Every plan MUST start with this header:**

```markdown
# [Feature Name] Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
> **For Claude:** If this plan is AC/Gherkin mode, REQUIRED SUB-SKILL: Use atdd-domain-first.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

---
```

## AC/Gherkin Mode Requirements

When in AC/Gherkin mode, include the following sections before task breakdown.

```markdown
## Acceptance Criteria Source

- Source doc: `docs/plans/<design-doc>.md`
- AC format: Gherkin

## AC Traceability Matrix

| AC ID | Gherkin Scenario | Test Layer | Planned Test File | Planned Task |
|---|---|---|---|---|
| AC-01 | ... | Acceptance (UseCase/domain) | ... | Task 1 |
```

Task ordering rules in AC/Gherkin mode:

1. First tasks MUST establish AC ids in plan traceability and failing acceptance tests at UseCase/domain boundary.
2. Implementation tasks come only after failing acceptance tests are defined.
3. UI acceptance coverage is thin smoke unless the requirement is UI-native behavior.
4. Every task must include `Covers AC:` with either AC ids or `N/A (infrastructure)`.
5. AC ids are document-local and traceability-only identifiers.
6. Do not propagate AC ids into non-traceability artifacts; use behavior/scenario naming there.

## Task Structure

````markdown
### Task N: [Component Name]

**Covers AC:** `AC-01, AC-02` or `N/A (infrastructure)`

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

**Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

**Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

## Remember
- Exact file paths always
- Complete code in plan (not "add validation")
- Exact commands with expected output
- Reference relevant skills with @ syntax
- DRY, YAGNI, TDD, frequent commits
- In AC/Gherkin mode, no plan is complete without AC-to-test traceability
- Keep AC ids in traceability fields (AC matrix, Covers AC) only; use behavior-based names elsewhere.

## Completion Check (Mode-Aware)

Before finalizing the plan:

1. Confirm selected mode (`AC/Gherkin` or `Standard`) is explicit in the document.
2. If AC/Gherkin mode:
   - Confirm `atdd-domain-first` is declared as required sub-skill.
   - Confirm AC Traceability Matrix exists and each AC has automated test coverage.
   - Confirm acceptance-test-first ordering is reflected in task sequence.
3. If Standard mode:
   - Confirm default TDD task ordering is preserved without AC-specific forced sections.

## Execution Handoff

After saving the plan, offer execution choice:

**"Plan complete and saved to `docs/plans/<filename>.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?"**

**If Subagent-Driven chosen:**
- **REQUIRED SUB-SKILL:** Use superpowers:subagent-driven-development
- Stay in this session
- Fresh subagent per task + code review

**If Parallel Session chosen:**
- Guide them to open new session in worktree
- **REQUIRED SUB-SKILL:** New session uses superpowers:executing-plans
