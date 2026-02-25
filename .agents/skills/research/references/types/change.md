# Change — Exploration Scope & DoD

| Field | Req | Why it matters |
|-------|-----|---------------|
| AS-IS behavior | R | What the system does today — baseline for understanding the delta |
| TO-BE behavior | R | What the system should do after — defines the change boundary |
| Reasoning | R | Why this change is needed — prevents reversals later |
| Affected modules | R | Which parts of the codebase are impacted — scopes exploration |
| Regression risk | R | What existing behavior could break — informs test strategy |
| Non-goals | O | What should NOT change — prevents scope creep during exploration |
| Alternative approaches | O | Phase 4 requires 2-3 approaches — exploration must surface them |

## DoD Template

- [ ] AS-IS behavior no longer present where specified
- [ ] TO-BE behavior verified in all affected modules
- [ ] Regression risk areas tested — no unintended breakage
- [ ] Non-goals confirmed untouched
- [ ] Downstream consumers of changed behavior updated or notified
