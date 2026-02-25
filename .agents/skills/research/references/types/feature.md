# Feature — Exploration Scope & DoD

| Field | Req | Why it matters |
|-------|-----|---------------|
| User goal | R | What problem this solves, for whom, and why |
| Current behavior | R* | What the system does today — baseline. *N/A for new features. |
| Target behavior | R | What the system should do — new or modified behavior |
| Acceptance criteria | R | Testable conditions for "done" — verifiable pass/fail |
| Entry point | R | Where in the codebase this hooks in. Must anchor to an existing integration point; "new file TBD" is not sufficient by itself. |
| Regression risk | O | What existing behavior could break — critical for modifications |
| Existing patterns | O | Similar features in the codebase that inform approach |
| External dependencies | O | Libraries, APIs, services needed |
| Constraints | O | Performance, security, compatibility requirements |
| Non-goals | O | Scope boundaries — what is explicitly excluded to prevent over-exploration |

## Depth Guardrail (Feature)

Default to **Deep** when any 2 are true:
- Entry point remains unresolved after initial exploration
- No existing subsystem/pattern supports the capability (greenfield)
- Capability crosses multiple layers (for example: scheduler + service + model)
- Integration mistakes would create high operational/security risk

## DoD Template

- [ ] Target behavior implemented and verified
- [ ] All acceptance criteria pass
- [ ] Regression risk areas tested — no unintended breakage (if applicable)
- [ ] Follows existing codebase patterns and conventions
- [ ] No regressions in existing functionality
