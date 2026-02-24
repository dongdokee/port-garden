# Research Report

## Context
- **Work Type**: [Feature | Bug | Refactor | Improvement | Security | Task | etc.]
- **Research Depth**: [Light | Standard | Deep]
- **Objective**: [What the user wants to accomplish]
- **Primary Users**: [Who is affected]

## Problem Statement

[1-3 sentences: what problem this solves, why the status quo is insufficient]

## Requirements

[Specific, testable requirements gathered during research. Each should be
concrete enough that you can write a pass/fail check for it.]

- Requirement 1: [concrete requirement]
- Requirement 2: [concrete requirement]
- Requirement 3: [concrete requirement]

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

## Edge Cases

- [edge case and how it should be handled]

## Non-goals

- [what this work explicitly should NOT do]

## Remaining Gaps and Risk Decisions

- [unresolved field]
  - why_needed: [why this matters]
  - risk_if_missing: [what can go wrong]
  - user_approved_risk: [yes/no]

## Open Questions

[Questions to resolve during planning or implementation]

- [question] — [why it matters, suggested default if any]

## Handoff Notes for Plan

- Suggested starting point: [file or module]
- Key patterns to follow: [conventions discovered]
- Known risks: [things that could go wrong]
- Complexity estimate: [low | medium | high] — [brief justification]
