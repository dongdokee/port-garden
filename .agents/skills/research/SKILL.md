---
name: research
description: Use when the user needs to investigate or understand a topic before planning or implementation.
---

# Research

Research topic: **the user's research topic, provided as the skill argument**

If no topic was provided, ask the user what to research.

## Hard Gate

No planning, implementation, or production code changes. Only output: the
research ticket.

## Depth Levels

| Depth | When | Scoping | What happens |
|-------|------|---------|--------------|
| **Light** | Clear bug, small config, typo | Entry point + direct imports/callers | Quick scan, short ticket |
| **Standard** | Most features, improvements | 2–3 import/call depth | Full codebase + optional web research |
| **Deep** | Greenfield, architectural, security | 2–3 parallel explorations by concern; cap 3 rounds | Multiple explorations, web research |

## Process

Every phase entered in order; phases may complete immediately if conditions met.

```
1 → 2 → 3 → 4 → 5 → Done
         ↑ Light: all R clear → skip to 4
         Gate fails → return to appropriate phase
```

### Phase 1: Intent Check

Infer **What**, **Why**, and **Type**: Bug, Feature, Improvement, Security,
Task, Design-UI.

Clear = all three inferred with one reasonable interpretation. Ambiguous = any
has multiple readings → ask one question.

If clear, present classification + proposed depth for confirmation. On
confirmation, read `references/types/{type}.md`.

**Exit → Phase 2**: User confirmed type and depth.

### Phase 2: Exploration

Explore the codebase scoped to depth level (see Scoping column). Research
external libs/APIs in parallel.

Present brief summary so user can redirect. Thin results (< 2 relevant files or
no question answered) → retry once. Still thin → document gap, proceed.

**Exit → Phase 3**: Results obtained or gaps documented.

### Phase 3: Informed Clarification

Classify each field per `references/exploration-scope.md`. Ask Required fields
first, then Optional.

- **Light**: All Required `clear` from Phases 1+2 → skip to Phase 4.
- **Standard**: Only ask `unclear`/`missing` fields.
- **Deep**: Confirm `clear` evidence sufficient. Ask all `unclear`/`missing`.

Batch related questions. After 2 returns on same blocker, ask for override.

**Exit → Phase 4**: All fields `clear` or user-approved gaps.

### Phase 4: Approach Selection

Light: state recommended approach, ask for confirmation. Standard/Deep: present
2–3 approaches with trade-offs and file:line refs.

After selection: build DoD from type template + ticket-specific criteria; present
for approval.

**Exit → Phase 5**: Approach selected, DoD approved.

### Phase 5: Research Ticket

Output using `references/research-ticket-template.md`. Must start with
`# Research Ticket`. Light: skip External Research, Rejected Approaches,
Anti-Patterns if N/A.

**Pre-write gate — ALL true:**
1. DoR passes (Required `clear`, Optional `clear` or gap-approved)
2. DoD approved
3. Approach confirmed
4. Scope boundaries explicit

Gate fails → return to appropriate phase. Quality self-check (not shown to
user): problem statement, testable requirements, file:line evidence, rationale.

Save to: `docs/research/YYYY-MM-DD-<topic>.md`. End skill after writing.

## Error Recovery

If the user rejects the phased process, explain that the research ticket is the
deliverable, ask which phases to abbreviate. Record skipped areas as gaps in the
ticket.
