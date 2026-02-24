# ticket-intake Skill — Issue Analysis

Review of `ticket-intake` SKILL.md and reference files through the lens of agentic coding workflows.

## SKILL.md Issues

### Issue 1: No codebase grounding
**Status:** Deferred

The skill is purely conversational. An agent running this skill has access to the codebase but is never instructed to use it. Scanning for existing files, test patterns, module structure, or related code could pre-fill MRI fields (entry point, related paths, existing suite path) automatically, reduce clarification turns, and produce more actionable handoff notes.

### Issue 2: Clarification priority was a flat human-oriented list
**Status:** Fixed

The original single priority list put location fields (entry point, related paths) in tier 5. For agentic coding, knowing where to work is as important as knowing what to build. Restructured into two parallel tracks:
- **Track A — Intent**: what to build and why (safety → foundation → scope → quality)
- **Track B — Location**: where to build it (entry point → related paths → suite/artifacts)

The agent interleaves across tracks, picking the highest-impact gap from either.

### Issue 3: One question per turn is expensive
**Status:** Deferred (revisit after issue 1)

Each clarification turn is a full API round-trip. Batching related questions (e.g., multiple fields in the same track and tier) could reduce cost. However, the one-at-a-time rule also forces the agent to update field status after each answer, preventing stale reasoning. If codebase grounding (issue 1) significantly reduces clarification turns, this may not matter.

### Issue 4: No scope sizing or decomposition guidance
**Status:** Deferred (revisit after issue 1)

Nothing flags when a request is too broad for a single ticket. Agentic coders work best on focused, single-responsibility units. However, judging scope requires codebase knowledge that intake doesn't currently have. Premature splitting risks losing the user's holistic intent. Best addressed after codebase grounding is in place.

### Issue 7: SKILL.md never mentions Gherkin
**Status:** Open

The template references "Gherkin syntax" for AC but SKILL.md and `ac-dod-guidelines.md` both use the simpler `AC-x (US-y): [observable behavior]` format. The template contradicts the reference. For agentic coding, AC that maps directly to testable assertions (input → expected output) is more useful than formal Given/When/Then.

## Template Issues (`ticket-output-template.md`)

### Issue 5A: Current State / Target State placeholders are vague
**Status:** Open — ready to fix

Placeholder hints say "Baseline behavior today" and "Expected outcome after completion." For an agent, these should nudge toward code-grounded descriptions: specific file paths, current function signatures, concrete behavior with references.

### Issue 5B: AC placeholder says "Gherkin syntax"
**Status:** Open — ready to fix

Contradicts `ac-dod-guidelines.md` which uses `AC-x (US-y): [observable behavior]`. The template should align with the reference file.

### Issue 5C: DoD is hardcoded static checkboxes
**Status:** Open — pending decision on approach

The same four DoD items appear regardless of ticket type. A Bug ticket and a Feature ticket get identical DoD. Options: change to placeholder items like other sections, or keep defaults with a hint to adjust per ticket type.

### Issue 5D: Handoff Notes missing "suggested search terms/patterns"
**Status:** Open — ready to fix

The Research agent needs to grep/glob the codebase. Adding a field for starting keywords or regex patterns is cheap to produce during intake and high-leverage for downstream research.

## Reference File Status

| File | Status |
|------|--------|
| `references/mri-matrix.md` | No issues found |
| `references/ac-dod-guidelines.md` | No issues found (template contradicts it, not the other way around) |
