# Improvement — Exploration Scope & DoD

| Field | Req | Why it matters |
|-------|-----|---------------|
| Current state | R | What the situation is today — either measured baseline OR qualitative description of the problem |
| Target state | R | What improvement looks like — either measurable goal OR quality attribute to enhance with rationale |
| Evidence | R | What supports the improvement need — profiling data, logical analysis, threat model, code smell pattern, or architectural concern |
| Non-goals | R | What behavior must NOT change — improvement shouldn't alter functionality |
| Affected code paths | O | Where to focus exploration based on evidence |
| Constraints | O | Budget, compatibility, or architectural limits on the approach |
| Alternative approaches | O | Phase 4 requires 2-3 approaches — exploration must surface them |

## DoD Template

- [ ] Target state achieved (measured or demonstrated)
- [ ] Improvement verified against evidence baseline
- [ ] Non-goals confirmed untouched — no functional behavior changes
- [ ] No regressions in existing functionality
- [ ] Improvement is sustainable (not a temporary workaround)
