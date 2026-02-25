# Refactoring — Exploration Scope & DoD

| Field | Req | Why it matters |
|-------|-----|---------------|
| Pain points | R | What's wrong structurally — why this code is hard to work with |
| Target structure | R | What the code should look like after — the refactoring goal |
| Behavior invariants | R | What must NOT change — the contract that refactoring preserves |
| Target files | R | Which files/modules to refactor — scopes code-explorer |
| Downstream dependents | O | What depends on the code being changed — identifies blast radius |
| Success criteria | O | How to verify the refactoring worked — e.g., "same tests pass, reduced cyclomatic complexity" |
| Alternative approaches | O | Phase 4 requires 2-3 approaches — exploration must surface structural alternatives |

## DoD Template

- [ ] Target structure achieved
- [ ] All behavior invariants preserved — same tests pass
- [ ] Downstream dependents unaffected or updated
- [ ] Pain points addressed (verified against original complaints)
- [ ] No new technical debt introduced
