---
name: research
description: >-
  First step in the agentic coding workflow (Research > Plan > Implement >
  Validate > Archive). Converts raw user requests into researched, scoped
  handoff reports. Use whenever the user starts new work — features, bug fixes,
  refactors, improvements, or any task that needs understanding before planning.
  Also use when the user says "research", "investigate", "explore", "look into",
  or invokes /research.
---

# Research

Research topic: **$ARGUMENTS**

## Overview

Convert a raw user request into a Research Report that the Plan step can act on
immediately. This means understanding what the user wants, exploring the
codebase and external context, clarifying gaps, selecting an approach with user
approval, and documenting everything — including dead ends — so downstream steps
don't repeat the investigation.

The skill interleaves questioning and exploration rather than doing all questions
first or all exploration first. A senior engineer doesn't interrogate for 20
minutes before glancing at the code; they ask a couple of orienting questions,
look around, then ask smarter questions informed by what they found.

## Required References

- Exploration scope per ticket type: `references/exploration-scope.md`
- Final report format: `references/research-report-template.md`

## Hard Gate

Do NOT proceed to planning, implementation, or any code changes. The skill's
terminal output is a Research Report document. Stop there.

Exception: For **Spike** tickets, the Research Report is the final deliverable.
There is no Plan step — the report hands off directly to the user for a decision.

## Depth Levels

Not every task needs the same investigation effort. After the initial intent
check, propose one of these depths and let the user override:

| Depth | When | What happens |
|-------|------|--------------|
| **Light** | Bug with clear repro, small config change, typo fix | Quick codebase scan, minimal clarification, short report |
| **Standard** | Most features, refactors, improvements | Full codebase + optional web research, thorough clarification, complete report |
| **Deep** | Greenfield features, architectural changes, security work | Multiple explorer agents, web research, extensive clarification, comprehensive report |

**Complexity signals** for auto-classification:
- Light: user provides specific file/line, single-file scope, known cause
- Standard: multiple files involved, unclear implementation path, some ambiguity
- Deep: no obvious starting point, cross-cutting concerns, external integrations, security implications

State your proposed depth explicitly: "This looks like a standard-depth
investigation — I'll scan the codebase for relevant patterns and ask a few
clarifying questions. Want me to go deeper or keep it light instead?"

## The Process

### Phase 1: Intent Check

Understand what the user wants before touching the codebase. Ask 1-2 quick
orienting questions using AskUserQuestion. The goal is just enough context to
explore intelligently, not to fully specify requirements.

Focus on:
- **What**: What are they trying to accomplish?
- **Why**: What problem does this solve?
- **Type**: Classify into one of the 11 ticket types:
  Bug, Feature, Change, Improvement, Refactoring, Security, Task, Doc, Test,
  Design-UI, Spike

After the user responds:
1. Classify the work type — present your inference with rationale and let the
   user confirm or override.
2. Load the type-specific exploration scope from `references/exploration-scope.md`.
3. Propose a research depth.
4. Confirm type and depth with the user before proceeding.

If the user's initial request is already detailed and clear, skip straight to
proposing type + depth — don't ask questions you already know the answers to.

### Phase 2: Exploration

Investigate the codebase and external context using a hybrid approach: dispatch
subagents for broad sweeps, then read key files inline for deep understanding.

**Codebase exploration:**

Dispatch the `code-explorer` custom agent to find relevant files, patterns, and
architecture:

```
Task tool:
  subagent_type: "code-explorer"
  prompt: "Find files and patterns related to [topic]. Goal: [user's purpose].
           Return: key files with file:line refs, architecture patterns,
           existing conventions, dependencies, and suggested reading order."
```

For deep-depth research, dispatch 2-3 code-explorer agents targeting different
aspects (similar features, architecture, test patterns) in parallel.

After subagent results return, read the most important files yourself. Subagent
summaries are useful for orientation, but you need to read the actual code to
understand it well enough to propose approaches.

**External research (when needed):**

If the task involves external libraries, APIs, or unfamiliar technology, dispatch
the `web-researcher` custom agent in parallel with codebase exploration:

```
Task tool:
  subagent_type: "web-researcher"
  prompt: "Research [specific question about external topic]. Return: key
           findings with source URLs, confidence assessment, and knowledge gaps."
```

Use web research for:
- External library capabilities and constraints
- API documentation and best practices
- Security implications or known issues
- Comparing technology options

**Present findings incrementally.** Share a brief summary of what you found
before moving to clarification. This gives the user a chance to redirect if
you explored the wrong area.

### Phase 3: Informed Clarification

Now that you understand the codebase context, ask deeper questions — the kind
you couldn't have asked before exploring. Use AskUserQuestion, one question per
turn, preferring multiple choice.

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

### Phase 4: Approach Selection

Present 2-3 approaches with trade-offs, informed by codebase findings and
external research. This is the strategic "what and why" decision — the Plan
step will handle the tactical "how."

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

Use AskUserQuestion to get user's choice. If the user selects a non-recommended
approach, confirm understanding of the trade-offs before proceeding.

For rejected approaches, document:
- Why it was considered (what made it seem viable)
- Why it was rejected (specific evidence)
- Conditions under which to revisit it

### Phase 5: Research Report

Output the final handoff document using the template at
`references/research-report-template.md`. The report must start with
`# Research Report`.

**Before writing the report**, confirm the following with the user:
- Requirements are accurate and complete (or gaps are explicitly approved)
- Chosen approach is confirmed
- Scope boundaries are agreed

**Report quality gate** — the report is ready when:
- All type-specific exploration scope fields are `clear` or have documented gaps
  with user-approved risk decisions
- Problem statement with context is present
- Requirements are specific and testable
- Codebase findings include file:line evidence
- Chosen approach has rationale
- Rejected approaches have reasoning
- Anti-patterns include reasoning (what NOT to do)
- Scope boundaries are explicit (in/out/deferred)
- Open questions for Plan are documented
- **Feature-specific**: User Stories and Gherkin AC are present
- **Spike-specific**: "Handoff Notes for Plan" section is omitted

Save the report to: `docs/research/YYYY-MM-DD-<topic>.md`

End the skill after writing the report. Do not proceed to planning.

## Anti-Patterns to Avoid

| Wrong | Right |
|-------|-------|
| Exploring code before understanding intent | Ask 1-2 orienting questions first |
| Asking 10 questions before exploring | Interleave: quick intent, explore, informed questions |
| Multiple questions per message | One question at a time via AskUserQuestion |
| Inventing file paths or line numbers | Only cite paths you actually found and read |
| "Consider refactoring X" (vague) | "X at file.ts:42 uses pattern Y, which conflicts with Z" (specific) |
| Proposing one approach | Always present 2-3 with trade-offs |
| Jumping to implementation | Stop at the Research Report |
| Same depth for every task | Match depth to complexity, let user override |
| Exhaustive research on simple bugs | Light depth: quick scan, short report, move on |

## Key Principles

- **Interleave questions and exploration** — don't fully separate them
- **One question at a time** — use AskUserQuestion, don't dump a list
- **Multiple choice preferred** — easier to answer, faster to converge
- **Evidence-based claims** — every file reference must be real (file:line)
- **YAGNI ruthlessly** — cut scope during clarification, not after implementation
- **Document dead ends** — rejected approaches prevent re-investigation later
- **Anti-patterns with reasoning** — not just "don't do X" but "don't do X because Y"
- **Depth matches complexity** — don't over-research simple tasks
- **User controls scope** — propose, don't dictate; user approves gaps and risks
