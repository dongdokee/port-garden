---
name: research
description: >-
  Use whenever the user starts new work — features, bug fixes, refactors,
  improvements, spikes, or any task that needs understanding before planning.
  Also use when the user says "research", "investigate", "explore", "look
  into", or invokes /research.
---

# Research

Research topic: **$ARGUMENTS**

## Overview

Convert a raw user request into a Research Ticket that the Plan step can act on
immediately. The ticket includes a Definition of Ready (DoR) proving all
required fields are resolved, and a Definition of Done (DoD) defining verifiable
completion criteria. This means understanding what the user wants, exploring the
codebase and external context, clarifying gaps, selecting an approach with user
approval, and documenting everything — including dead ends — so downstream steps
don't repeat the investigation.

The skill follows an explore-then-clarify pattern: ask one orienting question,
explore the codebase, then ask informed questions that you couldn't have asked
before seeing the code. This avoids blind interrogation and ensures questions
are grounded in what the codebase actually looks like.

## Required References

- Exploration scope, DoR fields, and DoD templates per ticket type: `references/exploration-scope.md`
- Final ticket format: `references/research-ticket-template.md`

## Hard Gate

Do NOT proceed to planning, implementation, or any code changes. The skill's
terminal output is a Research Ticket document. Stop there.

Exception: For **Spike** tickets, see Spike handling rules in
`references/exploration-scope.md` under "Spike" section.

## Depth Levels

Not every task needs the same investigation effort. After the initial intent
check, propose one of these depths and let the user override:

| Depth | When | What happens |
|-------|------|--------------|
| **Light** | Bug with clear repro, small config change, typo fix | Quick codebase scan, minimal clarification, short ticket |
| **Standard** | Most features, refactors, improvements | Full codebase + optional web research, thorough clarification, complete ticket |
| **Deep** | Greenfield features, architectural changes, security work | Multiple explorer agents, web research, extensive clarification, comprehensive ticket |

**Complexity signals** for auto-classification:
- Light: user provides specific file/line, single-file scope, known cause
- Standard: multiple files involved, unclear implementation path, some ambiguity
- Deep: no obvious starting point, cross-cutting concerns, external integrations, security implications

State your proposed depth explicitly: "This looks like a standard-depth
investigation — I'll scan the codebase for relevant patterns and ask a few
clarifying questions. Want me to go deeper or keep it light instead?"

## The Process

### Phase 1: Intent Check

Understand what the user wants before touching the codebase. Ask 1 quick
orienting question. The goal is just enough context to explore intelligently,
not to fully specify requirements.

Focus on:
- **What**: What are they trying to accomplish?
- **Why**: What problem does this solve?
- **Type**: Classify into one of the 11 ticket types:
  Bug, Feature, Change, Improvement, Refactoring, Security, Task, Doc, Test,
  Design-UI, Spike
- **Method** (Spike only): If Spike, also classify the method:
  Technical-PoC, Functional-PoC, Experiment, Literature-Review, Data-Analysis,
  Methodology

After the user responds:
1. Classify the work type — present your inference with rationale and let the
   user confirm or override. For Spike, also propose the method.
2. Load the type-specific exploration scope from `references/exploration-scope.md`.
   For Spike, load both the common Spike fields and the method-specific fields.
3. Propose a research depth.
4. Confirm type (and method, if Spike) and depth with the user before proceeding.

**Exit → Phase 2**: User has confirmed work type and depth.

### Phase 2: Exploration

Investigate the codebase and external context using a hybrid approach: dispatch
subagents for broad sweeps, then read key files inline for deep understanding.

**Codebase exploration:**

Dispatch the `code-explorer` agent to find relevant files, patterns, and
architecture:

```
Dispatch the `code-explorer` agent:

  "Find files and patterns related to [topic]. Goal: [user's purpose].

   Scope:
   - Light: entry point and immediate neighbors only
   - Standard: 2-3 levels out from entry points
   - Deep: full codebase sweep

   Success criterion: I should be able to proceed to Phase 3 without
   asking you follow-up questions about the codebase.

   Return format (all 5 sections required):
   1. Architecture overview — 2-3 sentences on how [topic] fits into the codebase
   2. Key files table:
      | File | Lines | Relevance |
      (cap: 10-15 files max; prioritize by relevance, not discovery order)
   3. Existing conventions — naming, patterns, idioms already in use
   4. Dependencies — internal modules and external packages involved
   5. Suggested reading order — numbered sequence for understanding the area

   If you find nothing relevant:
   - List what you searched for (terms, patterns, directories)
   - Explain why results are empty (missing feature? different naming? wrong area?)
   - Suggest alternative search angles or related areas to try"
```

For deep-depth research, dispatch 2-3 code-explorer agents targeting different
aspects in parallel. Split by **concern**, not by file path — each agent gets a
distinct exploration goal with no overlap.

The right split depends on the research topic; decide it per-task. Common
patterns (examples only, not a fixed list):
- *Data flow vs. integration points vs. error handling* — for understanding a feature end-to-end
- *Current implementation vs. similar prior art vs. test coverage* — for refactoring or improvement work
- *Core logic vs. configuration/deployment vs. external API surface* — for cross-cutting concerns

After subagent results return, read the most important files yourself. Subagent
summaries are useful for orientation, but you need to read the actual code to
understand it well enough to propose approaches.

**External research (when needed):**

If the task involves external libraries, APIs, or unfamiliar technology, dispatch
the `web-researcher` agent in parallel with codebase exploration:

```
Dispatch the `web-researcher` agent:

  "Research [specific question about external topic].

   Search scope: [library docs / API reference / security advisories /
   technology comparison — pick the most relevant]

   Cap: 5-8 sources max. Prefer authoritative sources (official docs,
   RFCs, peer-reviewed) over blog posts or forums.

   Source evaluation — for each source, briefly assess:
   - Authority: official docs > known expert > community post
   - Currency: publication date, still applicable?
   - Consensus: do independent sources agree?

   Return format (all 4 sections required):
   1. Key findings — bulleted, with source URL inline per finding
   2. Confidence — high / medium / low for each finding, with reasoning
   3. Knowledge gaps — what you couldn't find or verify
   4. Contradictions — where sources disagree and your assessment of which
      is more credible

   If search yields insufficient results:
   - List the search queries you tried
   - Explain why results are thin (niche topic? too new? behind paywall?)
   - Suggest rephrased questions or alternative angles to try"
```

Use web research for:
- External library capabilities and constraints
- API documentation and best practices
- Security implications or known issues
- Comparing technology options

**Handling weak or empty results:**

If a subagent returns thin, off-target, or empty results:

1. **Diagnose** — was the prompt too narrow (over-specific terms), too broad
   (vague goal), or pointed in the wrong direction (wrong area of codebase)?
2. **Retry once** — adjust the prompt based on the diagnosis and re-dispatch.
   One retry only; two rounds of exploration then stop.
3. **If retry also fails** — document the gap: what was searched, why it came
   up empty, and what this means for the research. Present the gap to the user
   in the Phase 2 findings summary so they can redirect if needed.

**Present findings incrementally.** Share a brief summary of what you found
before moving to clarification. This gives the user a chance to redirect if
you explored the wrong area.

**Exit → Phase 3**: Exploration produced results (or gaps are documented after
retry), and the user has not redirected to a different area.

### Phase 3: Informed Clarification

Now that you understand the codebase context, ask deeper questions — the kind
you couldn't have asked before exploring. One question per turn, preferring
multiple choice.

**Depth modulation:**
- **Light**: If all Required fields are already `clear` from Phase 1+2, skip
  to Phase 4 with a brief summary: "All required fields are clear — moving to
  approach selection." No field-by-field confirmation needed.
- **Standard**: Present field status summary. Only ask about `unclear`/`missing`
  fields. If all fields are `clear`, confirm briefly and move on.
- **Deep**: Present full field status. Confirm each `clear` field's evidence
  is sufficient. Ask about all `unclear`/`missing` fields in priority order.

**What to clarify:**

Use the type-specific exploration scope from `references/exploration-scope.md`
as your checklist. For each field in the scope, classify it as `clear`,
`unclear`, or `missing` based on what you learned in Phase 1 and Phase 2.
Ask about `unclear` and `missing` fields in priority order:

1. Fields that block exploration or approach selection
2. Fields that affect scope boundaries
3. Fields that affect quality or edge cases
4. Fields that are nice-to-have context

Also clarify:
- Gaps between the user's request and what the codebase reveals
- Ambiguous requirements that the code context makes concrete
- Non-goals: what should this explicitly NOT do

**Questioning techniques:**

*Assumption surfacing* — make implicit assumptions explicit:
"The codebase uses Express middleware for auth. I'm assuming you want to follow
that pattern. Correct?"

*Trade-off questions* — when codebase evidence points to a choice:
"There are two existing patterns for this: [A] at file.ts:42 and [B] at
other.ts:88. Which should we follow?"

*Example-based clarity* — when requirements are vague:
"Can you give me an example of what should happen when [edge case]?"

Continue until all critical gaps are resolved or the user explicitly approves
remaining gaps. For each approved gap, record why it matters and the risk of
leaving it unresolved.

**Exit → Phase 4**: All exploration scope fields are `clear` or have
user-approved gaps with documented risk.

### Phase 4: Approach Selection

Present 2-3 approaches with trade-offs, informed by codebase findings and
external research. This is the strategic "what and why" decision — the Plan
step will handle the tactical "how."

**Depth modulation:**
- **Light**: If the fix/change is obvious and there's only one reasonable
  approach, state it directly and ask for confirmation. No need to fabricate
  alternatives.
- **Standard/Deep**: Always present 2-3 approaches with trade-offs.

```
Based on [research findings], here are the approaches:

## Approach 1: [Name] (recommended)
[2-3 sentences describing the approach]

**Pros**: [benefits, especially codebase consistency]
**Cons**: [drawbacks]
**Best when**: [conditions]
**Evidence**: [file:line refs, external sources]

## Approach 2: [Name]
[2-3 sentences]

**Pros**: [benefits]
**Cons**: [drawbacks]
**Best when**: [conditions]

## Approach 3: [Name] (if applicable)
...

## Recommendation
I recommend Approach 1 because [specific reasoning linking to codebase
patterns and user requirements].
```

Ask the user to choose. If the user selects a non-recommended
approach, confirm understanding of the trade-offs before proceeding.

For rejected approaches, document:
- Why it was considered (what made it seem viable)
- Why it was rejected (specific evidence)
- Conditions under which to revisit it

**DoD generation:** After the user selects an approach, generate the Definition
of Done for this ticket:

1. Start with the **type template** DoD from `references/exploration-scope.md`
   (or the method-specific template for Spike tickets).
2. Add **ticket-specific criteria** based on the chosen approach and
   requirements discovered during Phases 1-3. These should be concrete and
   verifiable — tied to the specific user stories, acceptance criteria,
   constraints, or success metrics identified during research.
3. Present the combined DoD to the user for approval. The user may add, remove,
   or modify criteria.

**Exit → Phase 5**: User has selected an approach, rejected approaches are
documented, and DoD is approved by the user.

### Phase 5: Research Ticket

Output the final handoff document using the template at
`references/research-ticket-template.md`. The ticket must start with
`# Research Ticket`.

**Template usage:**
- The DoR Field Status table replaces type-specific detail sections — populate
  each field's Evidence column with findings (including file:line refs). Do NOT
  create a separate type-details section.
- For Spike tickets, include both common Spike fields and method-specific fields
  in the DoR table.
- Omit "Handoff Notes for Plan" for Spike tickets (except Technical-PoC /
  Functional-PoC that proceed to Plan).

**Pre-write gate — verify before writing:**

The ticket CANNOT be written unless ALL of the following are true:

1. **DoR passes**: All Required (R) fields are `clear`. All Optional (O) fields
   are `clear` or have user-approved gaps.
2. **DoD is populated**: Type template + ticket-specific criteria, approved by user.
3. **Approach is confirmed**: User selected an approach in Phase 4.
4. **Scope boundaries are explicit**: In/out/deferred are agreed.

If any gate item fails, STOP. Present the blocker to the user and return to
the appropriate phase to resolve it. Do not write an incomplete ticket.

**Ticket quality checklist** (verify silently — do not re-confirm with user):
- Problem statement with context is present
- Requirements are specific and testable
- Codebase findings include file:line evidence
- Chosen approach has rationale
- Rejected approaches have reasoning
- Anti-patterns include reasoning (what NOT to do)
- Open questions for Plan are documented
- **Feature-specific**: User Stories and Gherkin AC are present
- **Spike-specific**: follows Spike handling rules in exploration-scope.md

Save the ticket to: `docs/research/YYYY-MM-DD-<topic>.md`
Create the `docs/research/` directory if it doesn't exist.

End the skill after writing the ticket. Do not proceed to planning.

## Anti-Patterns to Avoid

| Wrong | Right |
|-------|-------|
| Exploring code before understanding intent | Ask 1 orienting question first |
| Asking 10 questions before exploring | Orient first, explore, then ask informed questions |
| Multiple questions per message | One question at a time |
| Inventing file paths or line numbers | Only cite paths you actually found and read |
| "Consider refactoring X" (vague) | "X at file.ts:42 uses pattern Y, which conflicts with Z" (specific) |
| Proposing one approach (Standard/Deep) | Present 2-3 with trade-offs unless Light depth with obvious fix |
| Jumping to implementation | Stop at the Research Ticket |
| Writing ticket with unresolved Required fields | DoR gate must pass — all R fields clear |
| Generic DoD criteria | DoD must include ticket-specific criteria, not just type template |
| Same depth for every task | Match depth to complexity, let user override |
| Exhaustive research on simple bugs | Light depth: quick scan, short ticket, move on |

## Key Principles

- **Explore then clarify** — orient, explore code, ask informed questions
- **One question at a time** — don't dump a list
- **Multiple choice preferred** — easier to answer, faster to converge
- **Evidence-based claims** — every file reference must be real (file:line)
- **YAGNI ruthlessly** — cut scope during clarification, not after implementation
- **Document dead ends** — rejected approaches prevent re-investigation later
- **Anti-patterns with reasoning** — not just "don't do X" but "don't do X because Y"
- **Depth matches complexity** — don't over-research simple tasks
- **User controls scope** — propose, don't dictate; user approves gaps and risks
