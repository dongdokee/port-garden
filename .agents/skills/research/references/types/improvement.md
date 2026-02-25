# Improvement — Exploration Scope & DoD

| Field | Req | Why it matters |
|-------|-----|---------------|
| Current state | R | What the situation is today — measured baseline, qualitative description, or structural pain points |
| Target state | R | What improvement looks like — measurable goal, quality attribute, or target structure |
| Evidence | R | What supports the need — profiling data, code smell pattern, architectural concern |
| Behavior invariants | R* | What must NOT change — contracts the improvement preserves. *Required for structural changes, Optional otherwise. |
| Affected code/files | O | Where to focus exploration |
| Downstream dependents | O | What depends on the code being changed |
| Constraints | O | Budget, compatibility, architectural limits |

## DoD Template

- [ ] Target state achieved (measured or demonstrated)
- [ ] Behavior invariants preserved — same tests pass (if applicable)
- [ ] No regressions in existing functionality
- [ ] Improvement verified against evidence baseline
