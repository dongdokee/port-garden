# Exploration Scope — Preamble

## Definition of Ready (DoR)

Type-specific fields ARE the DoR checklist:
- All **Required (R)** fields must be `clear`
- All **Optional (O)** fields must be `clear` or have user-approved gaps

If any Required field is not `clear`, the ticket CANNOT proceed. No exceptions.
DoD population is a separate gate checked in Phase 5.

## Field Status

- `clear`: Specific, actionable. → ready
- `unclear`: Ambiguous or inconsistent. Required → BLOCKS; Optional → gap + risk decision
- `missing`: Absent. Required → BLOCKS; Optional → gap + risk decision

## Gap Handling

For each unresolved field, record: `why_needed`, `risk_if_missing`, `user_approved_risk`.
Required fields the user skips are **risk overrides**.

## Ticket Types

| Type | Purpose |
|------|---------|
| Bug | Identify and resolve root cause of broken behavior |
| Feature | Architect and integrate new functionality |
| Change | Modify existing functional requirements |
| Improvement | Enhance non-functional quality attributes |
| Refactoring | Structural change, no behavior change |
| Security | Mitigate vulnerabilities and harden the system |
| Task | Execute specific, bounded operations |
| Doc | Create or update documentation |
| Test | Add or improve test coverage |
| Design-UI | Implement or update visual design and UX flow |
| Spike | Time-boxed uncertainty reduction |

## Spike Methods

| Method | When | Output |
|--------|------|--------|
| Technical-PoC | Evaluate feasibility of technology/approach | Prototype + findings |
| Functional-PoC | Evaluate user interaction/requirements | Mockup + feedback |
| Experiment | Test a measurable hypothesis | Protocol, data, analysis |
| Literature-Review | Survey existing knowledge | Bibliography + synthesis |
| Data-Analysis | Analyze data for insights | Analysis + conclusions |
| Methodology | Design/evaluate a method | Protocol + validation |

Type-specific scope and DoD: `types/{type}.md`
Spike-specific: `types/spike/common.md` + `types/spike/{method}.md`
