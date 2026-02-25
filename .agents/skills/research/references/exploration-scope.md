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

## Common Fields (all types)

These fields apply to every ticket type. Do not duplicate in type-specific files.

| Field | Req | Why it matters |
|-------|-----|---------------|
| Non-goals | O | Explicit scope boundaries prevent over-exploration and scope creep |

Note: Alternative approaches are a Phase 4 process concern, not a field.
The agent surfaces approaches during exploration; they are not tracked as a DoR field.

## Gap Handling

For each unresolved field, record: `why_needed`, `risk_if_missing`, `user_approved_risk`.
Required fields the user skips are **risk overrides**.

## Ticket Types

| Type | Purpose |
|------|---------|
| Bug | Identify and resolve root cause of broken behavior |
| Feature | Architect and integrate new or modified functionality |
| Improvement | Enhance non-functional quality attributes or structural refactoring |
| Security | Mitigate vulnerabilities and harden the system |
| Task | Execute specific, bounded operations (including documentation and testing) |
| Design-UI | Implement or update visual design and UX flow |

### Disambiguation Rules

| If... | Then type is... |
|-------|----------------|
| Broken behavior deviating from expected | Bug |
| New capability OR modifying existing behavior | Feature |
| Non-functional quality enhancement OR structural refactoring | Improvement |
| Vulnerability, hardening, or compliance | Security |
| Bounded operation (migration, documentation, testing, setup) | Task |
| Visual design, UX flow, or UI component work | Design-UI |

Tie-breaker: prefer the type with fewer Required fields.

Type-specific scope and DoD: `types/{type}.md`
