# Task — Exploration Scope & DoD

| Field | Req | Why it matters |
|-------|-----|---------------|
| Deliverables | R | Concrete outputs — what "done" produces |
| Completion criteria | R | How to verify task completion — prevents ambiguous endpoints |
| Dependencies | O | What must exist before this task can start |
| Idempotency | O | Can this be safely re-run? — matters for migrations, scripts, ops tasks |

### Guidance for Common Task Types

**Documentation tasks:** Deliverables should specify target audience, source material,
doc location, and coverage scope.

**Testing tasks:** Deliverables should specify target code, test strategy
(unit/integration/e2e), and edge cases to cover.

## DoD Template

- [ ] All deliverables produced
- [ ] Completion criteria met
- [ ] Dependencies satisfied (if applicable)
- [ ] Idempotency verified (if applicable)
- [ ] `[human]` Reviewed for completeness (documentation tasks)
