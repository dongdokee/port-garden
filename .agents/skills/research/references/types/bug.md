# Bug — Exploration Scope & DoD

| Field | Req | Why it matters |
|-------|-----|---------------|
| Repro scenario | R | Can't explore the right code without knowing how to trigger the bug |
| Expected vs Actual behavior | R | Defines what "fixed" means |
| Affected code paths | R | Where to focus exploration |
| Root cause hypothesis | R | Research should attempt to identify the cause, not just document symptoms |
| Severity/impact | O | Determines research depth (light vs standard) |
| Related tests | O | Existing test coverage tells you what's already validated |
| Non-goals | O | Scope boundaries — what is explicitly excluded to prevent over-exploration |

## DoD Template

- [ ] Root cause identified and documented
- [ ] Fix addresses root cause, not just symptoms
- [ ] Regression test added that reproduces the original bug
- [ ] Regression test passes with fix, fails without
- [ ] No unrelated behavior changes introduced
- [ ] Related existing tests still pass
