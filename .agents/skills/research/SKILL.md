---
name: research
description: Use when scoping a bug, feature, or change — investigating unfamiliar code, evaluating approaches, or assessing impact before planning.
---

# Research

Research topic: **the user's research topic, provided as the skill argument**

If no topic was provided, ask the user what to research.

## Hard Gate

No planning, implementation, or production code changes. Only output: the research ticket.

### Step 1: Intent Check

Infer **What**, **Why**, and **Type**:

| If... | Type |
|-------|------|
| Broken behavior deviating from expected | Bug |
| New capability or modifying existing behavior | Feature |
| Non-functional quality or structural refactoring | Improvement |
| Vulnerability, hardening, or compliance | Security |
| Bounded operation (migration, docs, testing, setup) | Task |
| Visual design, UX flow, or UI component work | Design-UI |

Tie-breaker: prefer the type with fewer Required fields. Clear = all three have one reasonable interpretation. Ambiguous = ask one question.
When clear, present classification for confirmation. On confirmation, read `references/types/{type}.md`. Do NOT select depth yet.

**Exit:** User confirmed type.

### Step 2: Initial Exploration

Explore from the entry point + direct callers/imports. Research external libs/APIs in parallel if relevant. Present brief summary so user can redirect.
Thin results (< 2 relevant files or core question unanswered): retry once broader. Still thin — document gap, proceed.

**Exit:** Results obtained or gaps documented.

### Step 3: Depth Decision

| Depth | Select when | Next |
|-------|------------|------|
| **Light** | Fix obvious, 1-2 files, no ambiguity | Skip to Step 6 |
| **Standard** | Multiple files, some unknowns, bounded | Step 4 |
| **Deep** | Architectural, greenfield, cross-cutting, security | Expand exploration (2-3 parallel by concern, cap 3 rounds), then Step 4 |

Present chosen depth with reasoning. User may override.

**Exit:** Depth confirmed.

### Step 4: Clarification (Standard/Deep only)

Classify each field from the type file. Start every field at `missing`; promote only with evidence:

| Status | Meaning | Action |
|--------|---------|--------|
| `clear` | Specific, actionable — one interpretation | Ready |
| `unclear` | Ambiguous or contradictory | R: blocks. O: gap + risk |
| `missing` | No information found | R: blocks. O: gap + risk |

All types share one common Optional field: **Non-goals** (scope boundaries preventing over-exploration).
Ask Required `unclear`/`missing` first, then Optional. Batch related questions. After 2 attempts on same blocker, ask for risk override. For unresolved fields record: why needed, risk if missing, user-approved risk. Deep: confirm `clear` evidence is sufficient.

**Exit:** All fields `clear` or gaps user-approved.

### Step 5: Approach Selection (Standard/Deep only)

Present 2-3 approaches with trade-offs and file:line refs. After selection, build DoD from type template + ticket-specific criteria; present for approval.

**Exit:** Approach selected, DoD approved.

### Step 6: Write Ticket

Output using `references/research-ticket-template.md`. Must start with `# Research Ticket`. Light: omit N/A sections.

**Pre-write gate — ALL true:**
1. DoR passes (Required `clear`, Optional `clear` or gap-approved)
2. DoD approved (Standard/Deep) or stated inline (Light)
3. Approach confirmed
4. Scope boundaries explicit

Gate fails — return to appropriate step. Self-check: problem statement, testable requirements, file:line evidence, rationale.
Save to: `docs/research/YYYY-MM-DD-<topic>.md`. End skill after writing.

**Examples:** Light — crash on button click, null-ref found in one file, skip to ticket. Standard — add CSV export, data layer + two UI points, clarify format, present approaches. Deep — replace auth system, multiple subsystems + security, parallel explorations, full classification.

## Error Recovery

If user rejects the process, explain the research ticket is the deliverable, ask which steps to abbreviate. Record skipped areas as gaps.
