# Research Report

## Context
- **Work Type**: [Bug | Feature | Change | Improvement | Refactoring | Security | Task | Doc | Test | Design-UI | Spike]
- **Research Depth**: [Light | Standard | Deep]
- **Objective**: [What the user wants to accomplish]
- **Primary Users**: [Who is affected]

## Problem Statement

[1-3 sentences: what problem this solves, why the status quo is insufficient]

## Exploration Scope Audit

[For each field in the type-specific exploration scope from
`references/exploration-scope.md`, report status and findings.]

| Field | Status | Findings |
|-------|--------|----------|
| [field name] | clear / unclear / missing | [what was found or why it's unresolved] |

## Type-Specific Details

[Include the section that matches the ticket type. Omit the rest.]

### Bug Details

- **Repro scenario**: [steps to reproduce]
- **Expected behavior**: [what should happen]
- **Actual behavior**: [what happens instead]
- **Root cause hypothesis**: [best understanding of why]
- **Severity/impact**: [who is affected and how badly]
- **Related tests**: [existing test coverage]

### Feature Details

- **User goal**: [underlying need]

**User Stories:**
- US-1: As a [user], I want [capability], so that [outcome].

**Acceptance Criteria (Gherkin):**
- AC-1 (US-1):
  - Given [context]
  - When [action]
  - Then [expected result]

- **Success criteria**: [testable definition of done]
- **Non-goals**: [what this feature should NOT do]
- **Entry point**: [where this hooks into the codebase]
- **Existing patterns**: [similar features found]
- **External dependencies**: [libraries, APIs, services]
- **Constraints**: [performance, security, compatibility]

### Change Details

- **AS-IS behavior**: [current behavior]
- **TO-BE behavior**: [desired behavior]
- **Reasoning**: [why this change is needed]
- **Affected modules**: [impacted parts of codebase]
- **Regression risk**: [what could break]
- **Non-goals**: [what should NOT change]

### Improvement Details

- **Current state**: [measured baseline OR qualitative description]
- **Target state**: [measurable goal OR quality attribute with rationale]
- **Evidence**: [profiling data, logical analysis, or architectural concern]
- **Non-goals**: [what behavior must NOT change]
- **Affected code paths**: [where to focus]
- **Constraints**: [limits on the approach]

### Refactoring Details

- **Pain points**: [what's wrong structurally]
- **Target structure**: [what the code should look like after]
- **Behavior invariants**: [what must NOT change]
- **Target files**: [files/modules to refactor]
- **Downstream dependents**: [what depends on this code]
- **Success criteria**: [how to verify the refactoring worked]

### Security Details

- **Vulnerability description**: [CVE, advisory, or discovered weakness]
- **Affected components**: [exposed code, libraries, services]
- **Threat model**: [who, how, impact]
- **Remediation options**: [known fixes, patches, mitigations]
- **Non-goals**: [side-effects to avoid]
- **Verification method**: [how to confirm resolution]

### Task Details

- **Deliverables**: [concrete outputs]
- **Definition of Done**: [how to verify completion]
- **Dependencies**: [what must exist first]
- **Non-goals**: [what's out of scope]
- **Idempotency**: [can this be safely re-run?]

### Doc Details

- **Target audience**: [who will read this]
- **Source material**: [code, APIs, systems to document]
- **Doc location**: [where docs live or should live]
- **Coverage scope**: [what to document and what to skip]
- **Existing docs**: [what already exists]

### Test Details

- **Target code**: [what needs coverage]
- **Current coverage**: [what's already tested]
- **Edge cases**: [specific scenarios to cover]
- **Test strategy**: [unit, integration, e2e, acceptance, or combination]
- **Existing test patterns**: [conventions to follow]
- **Non-goals**: [what NOT to test or rewrite]

### Design-UI Details

- **Design artifacts**: [Figma, mockups, wireframes, specs]
- **Interaction flow**: [success, empty, error, loading states]
- **Responsive requirements**: [breakpoints, device targets]
- **Existing UI patterns**: [component library, design tokens, styling]
- **Accessibility specs**: [WCAG level, aria, keyboard nav]
- **Non-goals**: [what NOT to redesign]

### Spike Details

- **Research questions**: [specific questions to answer]
- **Decision criteria**: [how findings will be evaluated]
- **Time box**: [effort budget]
- **Non-goals**: [no production code]
- **Reference material**: [starting points]

## Codebase Findings

### Relevant Files

| File | Purpose | Key Lines |
|------|---------|-----------|
| path/to/file.ts | Description | 42-87 |

### Existing Patterns

[Patterns discovered that inform the approach. Include file:line refs.]

### Dependencies

[External and internal dependencies relevant to this work]

### Technical Constraints

[Limitations discovered during exploration]

## External Research

[Findings from web research, if conducted. Include source URLs.]

- N/A if no external research was needed.

## Chosen Approach

### Summary

[2-3 paragraph description of the selected approach]

### Rationale

[Why this approach was chosen, linking to codebase patterns and requirements]

### Evidence

[file:line references and external sources supporting this choice]

## Rejected Approaches

### [Approach Name]

**What it is:** [2-3 sentence description]

**Why considered:** [What made this seem viable]

**Why rejected:** [Specific evidence-based reasoning]

**Do not revisit unless:** [Specific condition that would change this decision]

## Anti-Patterns

[Explicitly forbidden implementation paths with reasoning. These prevent
the implementing agent from rationalizing shortcuts when blocked.]

- Do not [pattern] — [reasoning, e.g., "breaks existing convention at file.ts:42"]

## Scope Boundaries

**In scope:**
- [explicit inclusions]

**Out of scope (deferred or never):**
- [explicit exclusions with reasoning]

## Remaining Gaps and Risk Decisions

[For each unresolved exploration scope field:]

- [field name]
  - why_needed: [why this matters]
  - risk_if_missing: [what can go wrong]
  - user_approved_risk: [yes/no]

## Open Questions

[Questions to resolve during planning or implementation]

- [question] — [why it matters, suggested default if any]

## Handoff Notes for Plan

[Omit this section entirely for Spike tickets.]

- Suggested starting point: [file or module]
- Key patterns to follow: [conventions discovered]
- Known risks: [things that could go wrong]
- Complexity estimate: [low | medium | high] — [brief justification]
