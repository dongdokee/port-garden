---
name: skill-porter
description: >-
  Convert a provider-specific agent skill (SKILL.md) into a
  provider-agnostic version by replacing tool names, API call patterns,
  and provider-locked expressions with intent-based descriptions. Use
  when the user says "port skill", "make skill portable", "remove
  provider dependencies from skill", or invokes /skill-porter.
---

# Skill Porter

Convert a provider-specific SKILL.md into a provider-agnostic version. This is
the inverse of `subagent-porter`: instead of fanning out one definition into N
provider files, this skill converges provider-locked language into a single
intent-based document.

## Required References

- Detection patterns: `references/provider-specific-patterns.md`
- Replacement rules: `references/replacement-guidelines.md`

## Workflow

### Step 1: Input

Ask the user for the path to the target SKILL.md. Read the file and every file
under its sibling `references/` directory. These are all in scope for
transformation.

### Step 2: Dependency Scan

Compare the content of every in-scope file against the pattern catalogue in
`references/provider-specific-patterns.md`. Identify all provider-specific
expressions.

Present findings to the user as a table:

```
| # | File | Line | Matched Pattern | Provider | Current Text |
|---|------|------|-----------------|----------|--------------|
| 1 | SKILL.md | 42 | Tool name: Read | Claude Code | "Use Read to..." |
| ...
```

If no matches are found, report that the skill is already provider-agnostic and
stop.

### Step 3: Conversion Plan

For each matched pattern, propose an intent-based replacement using the rules in
`references/replacement-guidelines.md`.

Present the plan as an extended table:

```
| # | Current Text | Proposed Replacement | Rule Applied |
|---|--------------|----------------------|--------------|
| 1 | "Use Read to open the file" | "Read the file" | File read |
| ...
```

Wait for user approval before proceeding. The user may override individual
replacements.

### Step 4: Execute Conversion

Apply all approved replacements. Follow the conversion principles documented in
`references/replacement-guidelines.md`.

### Step 5: Verify

Re-scan all modified files against `references/provider-specific-patterns.md`.
If any provider-specific patterns remain, report them and return to Step 3 for
those items.

### Step 6: Report

Output a change summary:

```
## Conversion Summary

| Metric | Value |
|--------|-------|
| Files scanned | N |
| Patterns detected | N |
| Replacements applied | N |
| Residual patterns | 0 |

### Changes by file

| File | Replacements |
|------|-------------|
| SKILL.md | N |
| references/exploration-scope.md | N |
```

## Key Principles

- **Preserve intent** — every replacement must keep the original meaning
- **Agent names are portable** — names like `code-explorer`, `web-researcher`
  are provider-agnostic and should not be changed
- **Scan references too** — `references/` files often contain tool names in
  examples and scope definitions
- **User approves all changes** — never apply replacements without confirmation
- **Idempotent** — running the skill twice on the same file produces no
  additional changes
