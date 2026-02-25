# Exploration Scope — Preamble

## Definition of Ready (DoR)

Type-specific fields ARE the DoR checklist:
- All **Required (R)** fields must be `clear`
- All **Optional (O)** fields must be `clear` or have user-approved gaps

If any Required field is not `clear`, the ticket CANNOT proceed. No exceptions.
DoD population is a separate gate checked in Phase 5.

## Field Status

| Status | Meaning | How to determine |
|--------|---------|-----------------|
| `clear` | Specific, actionable → ready | You can write a concrete implementation step or test from it. No reasonable person would interpret differently. Source: explicit user statement, unambiguous code evidence, or confirmed inference. |
| `unclear` | Ambiguous → R: BLOCKS, O: gap + risk | Information exists but contradictory, vague, or multi-interpretable. Cannot confidently act without clarification. |
| `missing` | Absent → R: BLOCKS, O: gap + risk | No information from user, codebase, or external research. Field not addressed at all. |

Start every field at `missing`. Promote to `unclear` when partial evidence
appears. Promote to `clear` only when criteria fully met. Never downgrade
`clear` unless new contradictory evidence surfaces.

## Field Lifecycle

Type files define fields as `Field | Req | Why it matters`. During Phase 3,
classify each into a status above. In the final ticket, report as
`Field | Req | Status | Evidence` per the template. The type file is the source
of truth for which fields exist and their requirement level.

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

**Ambiguous types:** If uncertain between two types, prefer the one with fewer
Required fields. Change vs Improvement: if behavior changes, it's a Change; if
only quality attributes change, it's an Improvement.

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
