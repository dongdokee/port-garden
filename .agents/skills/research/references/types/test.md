# Test — Exploration Scope & DoD

| Field | Req | Why it matters |
|-------|-----|---------------|
| Target code | R | What code needs test coverage — scopes exploration |
| Current coverage | R | What's already tested — identifies gaps vs. redundancy |
| Edge cases | R | Specific scenarios to cover — the core value of a Test ticket |
| Test strategy | R | Unit, integration, e2e, acceptance, or combination — affects approach selection |
| Existing test patterns | O | How the codebase already writes tests — conventions to follow |
| Non-goals | O | What NOT to test or rewrite — prevents scope creep into refactoring |

## DoD Template

- [ ] All identified edge cases covered
- [ ] Tests follow existing test patterns and conventions
- [ ] Tests pass consistently (no flakiness)
- [ ] Coverage gaps addressed per test strategy
- [ ] Non-goals confirmed untouched — no refactoring disguised as testing
- [ ] Test names clearly describe what they verify
