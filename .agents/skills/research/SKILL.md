---
name: research
description: >-
  Triggers on /research, "investigate", "explore", "look into", or any new work
  needing understanding before planning.
---

# Research

Research topic: **$ARGUMENTS**

If `$ARGUMENTS` is empty, ask the user what to research.

## Overview

Convert a raw user request into a Research Ticket that the Plan step can act on
immediately. The ticket includes a Definition of Ready (DoR) and Definition of
Done (DoD). Understand the request, explore the codebase and external context,
clarify gaps, select an approach with user approval, and document everything —
including dead ends — so downstream steps don't repeat the investigation.

## Required References

- DoR rules, field status, gap handling, type/method tables: `references/exploration-scope.md`
- Type-specific scope and DoD: `references/types/{type}.md`
- Spike common fields and rules: `references/types/spike/common.md`
- Spike method-specific scope: `references/types/spike/{method}.md`
- Final ticket format: `references/research-ticket-template.md`

## Hard Gate

Do NOT proceed to planning, implementation, or any code changes. The skill's
terminal output is a Research Ticket document. Stop there.

Exception: For **Spike** tickets, see Spike handling rules in
`references/types/spike/common.md`.

## Depth Levels

After the initial intent check, propose one of these depths and let the user override:

| Depth | When | What happens |
|-------|------|--------------|
| **Light** | Bug with clear repro, small config change, typo fix | Quick codebase scan, minimal clarification, short ticket |
| **Standard** | Most features, refactors, improvements | Full codebase + optional web research, thorough clarification, complete ticket |
| **Deep** | Greenfield features, architectural changes, security work | Multiple explorer agents, web research, extensive clarification, comprehensive ticket |

State your proposed depth explicitly and let the user override.

## Mid-Process Redirects

If the user changes direction: acknowledge, summarize what changes. Type change
→ return to Phase 1. Scope change → return to earliest affected phase. Carry
forward applicable findings; document discarded work as dead ends.

## The Process

### Phase 1: Intent Check

Infer **What** (goal), **Why** (problem it solves), and **Type** from the request.
Classify into: Bug, Feature, Change, Improvement, Refactoring, Security, Task,
Doc, Test, Design-UI, or Spike. For Spike, also classify the **Method**.

If everything is clear from the request, present your classification with
rationale and proposed depth — no question needed. If something is genuinely
ambiguous, ask 1 orienting question.

After the user confirms:
1. Load `references/types/{type}.md` (for Spike: also `references/types/spike/common.md`
   and `references/types/spike/{method}.md`).
2. Confirm type (and method, if Spike) and depth with the user.

**Exit → Phase 2**: User has confirmed work type and depth.

### Phase 2: Exploration

**Present findings incrementally** — share a brief summary before moving to
clarification so the user can redirect if you explored the wrong area.

**Codebase exploration:** Dispatch `code-explorer` with a prompt describing what
to find, scoped to the depth level (Light: entry point and neighbors; Standard:
2-3 levels out; Deep: full sweep). Request architecture overview, key files
table, conventions, dependencies, and suggested reading order. After results
return, read the most important files yourself — subagent summaries orient but
you need to read actual code to propose approaches.

For deep-depth, dispatch 2-3 code-explorer agents targeting different concerns
in parallel (e.g., data flow vs. integration points vs. error handling). Split
by concern, not file path.

**External research:** If the task involves external libraries, APIs, or
unfamiliar technology, dispatch `web-researcher` in parallel with codebase
exploration. Request key findings with source URLs, confidence levels, knowledge
gaps, and contradictions. Cap at 5-8 authoritative sources.

**Weak results:** If a subagent returns thin or empty results, retry once with
an adjusted prompt. If retry also fails, document the gap and present it to the
user.

**Exit → Phase 3**: Exploration produced results (or gaps documented after
retry), and the user has not redirected.

### Phase 3: Informed Clarification

Ask deeper questions grounded in codebase findings — one question per turn,
preferring multiple choice.

**Depth modulation:**
- **Light**: If all Required fields are `clear` from Phases 1+2, skip to Phase 4.
- **Standard**: Only ask about `unclear`/`missing` fields.
- **Deep**: Confirm each `clear` field's evidence is sufficient. Ask about all
  `unclear`/`missing` fields in priority order.

Use the type-specific scope as your checklist. Classify each field as `clear`,
`unclear`, or `missing`. Ask about unresolved fields in priority order:
1. Fields that block exploration or approach selection
2. Fields that affect scope boundaries
3. Fields that affect quality or edge cases
4. Nice-to-have context

Also clarify gaps between request and codebase reality, ambiguous requirements
the code makes concrete, and non-goals.

Continue until all critical gaps are resolved or user explicitly approves
remaining gaps with documented risk.

**Exit → Phase 4**: All scope fields are `clear` or have user-approved gaps.

### Phase 4: Approach Selection

Present 2-3 approaches with trade-offs informed by codebase findings and
external research. For each approach, describe it in 2-3 sentences, list pros,
cons, best-when conditions, and evidence (file:line refs, external sources).
Include a recommendation with specific reasoning. For Light depth with an
obvious single approach, state it directly and ask for confirmation.

Ask the user to choose. For rejected approaches, document why considered, why
rejected, and conditions to revisit.

**DoD generation:** After the user selects an approach:
1. Start with the type template DoD from `references/types/{type}.md`
   (or method-specific template for Spike).
2. Add ticket-specific criteria based on the chosen approach and requirements
   from Phases 1-3 — concrete and verifiable.
3. Present the combined DoD for user approval.

**Exit → Phase 5**: User has selected an approach, rejected approaches
documented, DoD approved.

### Phase 5: Research Ticket

Output the final handoff using `references/research-ticket-template.md`.
The ticket must start with `# Research Ticket`.

**Template usage:**
- The DoR Field Status table replaces type-specific detail sections — populate
  each field's Evidence column with findings (including file:line refs).
- For Spike tickets, include both common and method-specific fields in the DoR table.
- Omit "Handoff Notes for Plan" for Spike tickets (except Technical-PoC /
  Functional-PoC that proceed to Plan).

**Pre-write gate — ALL must be true:**
1. **DoR passes**: All Required fields `clear`. Optional fields `clear` or user-approved gaps.
2. **DoD populated**: Type template + ticket-specific criteria, approved by user.
3. **Approach confirmed**: User selected an approach in Phase 4.
4. **Scope boundaries explicit**: In/out/deferred agreed.

If any gate fails, present the blocker and return to the appropriate phase.

**Quality checklist** (verify silently):
- Problem statement with context present
- Requirements specific and testable
- Codebase findings include file:line evidence
- Chosen approach has rationale; rejected approaches have reasoning
- Anti-patterns include reasoning
- Open questions for Plan documented
- Feature-specific: User Stories and Gherkin AC present
- Spike-specific: follows Spike handling rules

Save to: `docs/research/YYYY-MM-DD-<topic>.md` (create directory if needed).
End the skill after writing the ticket.
