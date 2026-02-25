---
name: research
description: >-
  Use when the user needs to investigate or understand a topic before planning.
  Converts a raw request into a Research Ticket with DoR/DoD.
---

# Research

Research topic: **$ARGUMENTS**

If `$ARGUMENTS` is empty, ask the user what to research.

## Hard Gate

No planning, implementation, or production code changes. Only output: the
research ticket. Exception: Spike tickets per `references/types/spike/common.md`.

## Depth Levels

| Depth | When | What happens |
|-------|------|--------------|
| **Light** | Clear repro bug, small config, typo | Quick scan, minimal clarification, short ticket |
| **Standard** | Most features, refactors, improvements | Full codebase + optional web research, complete ticket |
| **Deep** | Greenfield, architectural, security | Multiple explorer agents, web research, comprehensive ticket |

## Process

### Phase 1: Intent Check

Infer **What**, **Why**, and **Type**. Types: Bug, Feature, Change, Improvement,
Refactoring, Security, Task, Doc, Test, Design-UI, Spike (+Method if Spike).

If clear, present classification + proposed depth. If ambiguous, ask 1 question.
After confirmation, load `references/types/{type}.md` (Spike: also common.md +
method.md).

**Exit → Phase 2**: User confirmed type and depth.

### Phase 2: Exploration

Dispatch `code-explorer` scoped to depth (Light: entry point + neighbors;
Standard: 2-3 levels; Deep: 2-3 parallel agents by concern). For external
libs/APIs, dispatch `web-researcher` in parallel.

Read key files yourself after results return. Present brief summary so user can
redirect. Thin results → retry once; still thin → document gap.

**Exit → Phase 3**: Results obtained or gaps documented.

### Phase 3: Informed Clarification

Use type-specific scope as checklist. Classify each field per
`references/exploration-scope.md`.

**Example (Bug):**
| Field | Status | Reasoning |
|-------|--------|-----------|
| Repro Steps | `clear` | User provided steps, confirmed at `api/handler.ts:42` |
| Root Cause | `unclear` | Two candidates: race condition vs. stale cache |
| Affected Area | `missing` | No info on other modules touching this path |

Ask unresolved fields in priority order: blocking → scope → quality → nice-to-have.

**Depth modulation:**
- **Light**: All Required `clear` from Phases 1+2 → skip to Phase 4.
- **Standard**: Only ask `unclear`/`missing` fields.
- **Deep**: Confirm `clear` evidence sufficient. Ask all `unclear`/`missing`.

Batch related fields into one question with multiple-choice options. After 2
returns on same blocker, ask user for explicit override.

**Exit → Phase 4**: All fields `clear` or user-approved gaps.

### Phase 4: Approach Selection

Present 2-3 approaches with trade-offs (pros, cons, best-when, file:line
evidence). Light depth with obvious approach → state directly, ask confirmation.

After selection: build DoD from type template + ticket-specific criteria, present
for approval. Document rejections.

**Exit → Phase 5**: Approach selected, DoD approved.

### Phase 5: Research Ticket

Output using `references/research-ticket-template.md`. Must start with
`# Research Ticket`.

**Light depth:** skip External Research, Rejected Approaches, Anti-Patterns if N/A.

**Pre-write gate — ALL true:**
1. DoR passes (Required `clear`, Optional `clear` or gap-approved)
2. DoD populated and approved
3. Approach confirmed
4. Scope boundaries explicit

Gate fails → return to appropriate phase. After 2 returns on same blocker, ask
user for explicit override.

**Quality checklist** (silent): problem statement, testable requirements,
file:line evidence, approach rationale, rejected approaches, open questions,
type-specific criteria.

Save to: `docs/research/YYYY-MM-DD-<topic>.md`. End skill after writing.

<!-- TODO: Add eval test cases — at minimum: 1 Light Bug, 1 Standard Feature,
1 Deep Spike. Verify token usage stays under budget. -->
