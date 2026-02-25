# Feature — Exploration Scope & DoD

| Field | Req | Why it matters |
|-------|-----|---------------|
| User goal | R | The underlying need — what problem this solves and for whom |
| User Stories | R | Explicit stories in "As a [user], I want [capability], so that [outcome]" form |
| Acceptance Criteria | R | Gherkin-format AC mapped to User Stories — verifiable conditions for done |
| Success criteria | R | What "done" looks like in testable terms |
| Non-goals | R | Explicit scope boundaries prevent over-exploration |
| Entry point | R | Where in the codebase this feature hooks in — critical for code-explorer |
| Existing patterns | O | Similar features already in the codebase that inform approach |
| External dependencies | O | Libraries, APIs, services needed — triggers web-researcher |
| Constraints | O | Performance, security, compatibility requirements |
| Alternative approaches | O | Phase 4 requires 2-3 approaches — exploration must surface them |

## DoD Template

- [ ] All User Stories implemented
- [ ] All Acceptance Criteria (Gherkin) pass
- [ ] Success criteria met and verified
- [ ] Non-goals confirmed untouched
- [ ] Follows existing codebase patterns and conventions
- [ ] External dependencies integrated and documented
- [ ] No regressions in existing functionality
