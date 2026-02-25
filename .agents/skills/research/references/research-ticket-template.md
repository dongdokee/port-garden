# Research Ticket

<!-- Light depth: sections marked [Light: omit if N/A] may be replaced with
"[Omitted — Light depth, N/A]" when genuinely not applicable. -->

## Context
- **Work Type**: [type]
- **Spike Method** (if Spike): [method]
- **Research Depth**: [Light | Standard | Deep]
- **Objective**: [What the user wants to accomplish]
- **Primary Users**: [Who is affected]

## Problem Statement

[1-3 sentences: what problem this solves, why the status quo is insufficient]

## Definition of Ready

[For each field in the type-specific exploration scope, report status and
findings. This table IS the type-specific details — do not duplicate fields
elsewhere.]

| Field | Req | Status | Evidence |
|-------|-----|--------|----------|
| [field name] | R/O | clear / unclear / missing | [what was found, with file:line refs where applicable] |

**Readiness Verdict:**
- **All Required fields clear?** [Yes / No — if No, list blockers]
- **Gaps with approved risk:** [list any O fields left unclear/missing, with risk decision]
- **Ready for Plan?** [Yes / No]

## Definition of Done

### Type Template Criteria

- [ ] [criterion from type template in exploration-scope.md]

### Ticket-Specific Criteria

- [ ] [criterion specific to this ticket's requirements and chosen approach]

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

## External Research [Light: omit if N/A]

[Findings from web research, if conducted. Include source URLs.
N/A if no external research was needed.]

## Chosen Approach

### Summary

[2-3 paragraph description of the selected approach]

### Rationale

[Why this approach was chosen, linking to codebase patterns and requirements]

### Evidence

[file:line references and external sources supporting this choice]

## Rejected Approaches [Light: omit if N/A]

### [Approach Name]

**What it is:** [2-3 sentence description]

**Why considered:** [What made this seem viable]

**Why rejected:** [Specific evidence-based reasoning]

**Do not revisit unless:** [Specific condition that would change this decision]

## Anti-Patterns [Light: omit if N/A]

- Do not [pattern] — [reasoning, e.g., "breaks existing convention at file.ts:42"]

## Scope Boundaries

**In scope:**
- [explicit inclusions]

**Out of scope (deferred or never):**
- [explicit exclusions with reasoning]

## Open Questions

[Questions to resolve during planning or implementation]

- [question] — [why it matters, suggested default if any]

## Handoff Notes for Plan

[Omit this section entirely for Spike tickets.]

- Suggested starting point: [file or module]
- Key patterns to follow: [conventions discovered]
- Known risks: [things that could go wrong]
- Complexity estimate: [low | medium | high] — [brief justification]
