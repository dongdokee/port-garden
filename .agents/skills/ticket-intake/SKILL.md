---
name: ticket-intake
description: Build high-quality implementation tickets from raw requests for agentic coding workflows. Use when starting a Ticket to Research to Plan to Implement to Validate to Archive flow, when you must infer one of the defined ticket types, audit MRI completeness, ask clarifying questions one at a time, and produce an approved handoff ticket with explicit gaps and rationale.
---

# Ticket Intake

## Overview
Convert ambiguous user requests into approved, high-quality tickets that reduce back-and-forth and prevent incorrect assumptions. Infer ticket type, audit minimum required information (MRI), close gaps through controlled clarification, and output a structured handoff ticket for the Research step.

## Required References
- MRI definitions: `references/mri-matrix.md`
- AC and DoD guidance: `references/ac-dod-guidelines.md`
- Final handoff format: `references/ticket-output-template.md`

## Operating Rules
- Infer ticket type from user input, then request explicit approval before continuing.
- Present `top1` inferred type with short rationale and provide re-selection options.
- Audit MRI fields for the approved type and classify each field as `clear`, `unclear`, or `missing`.
- Report MRI audit results and get approval before asking clarifying questions.
- Ask exactly one clarifying question per turn while unresolved fields remain.
- Prefer closed questions with 2-4 options; switch to open-ended only when required.
- For evaluative multiple-choice questions, include one recommended option with a one-line rationale.
- For pure preference questions, provide neutral options without recommendation.
- If a user response conflicts with option semantics, ask one resolving question before recording the field.
- Explain why each unclear or missing field matters before asking about it.
- Apply soft gate progression: unresolved fields may remain, but require explicit final approval of gaps before handoff.
- Record every unresolved field with `why_needed`, `risk_if_missing`, and `user_approved_risk`.
- Keep AC and DoD separate whenever both apply.
- For Feature tickets, require User Stories and derive AC from them.
- Never use numeric-only quality gates (for example, "at least N tests") as evidence of completion.
- Final output must follow the template exactly; do not add extra sections unless the user asks.
- The final document must start with `# Ticket Intake Report`.
- In template sections with no concrete data, use a single `- N/A` bullet instead of explanatory prose.
- In the final handoff, exclude approval history and intermediate MRI audit breakdown sections.
- Stop at ticket output. Do not run research, planning, implementation, validation, or archive work in this skill.

## State Machine
1. `TYPE_PROPOSED`
- Infer `top1` ticket type and list 1-2 alternatives.
- Show concise evidence from the prompt.
- Ask user to approve or override.

2. `TYPE_APPROVED`
- Lock the selected type.
- Load type-specific MRI requirements from `references/mri-matrix.md`.

3. `MRI_AUDITED`
- Build lists for `clear`, `unclear`, and `missing` fields.
- For each `unclear` field, state ambiguity reason.
- For each `missing` field, state risk introduced by omission.
- For `Feature`, keep `Design specs` unresolved until interaction specs are explicit.
- Ask user to approve the audit summary before clarification.

4. `CLARIFYING`
- Ask one question per turn for the highest-impact unresolved field.
- After each answer, update field status and report short delta.
- Continue until all fields are `clear` or user confirms intentional gaps.

5. `READY_FOR_FINAL_REVIEW`
- Summarize confirmed information and unresolved gaps with risk decisions.
- Ask for final approval before producing handoff ticket.

6. `FINAL_APPROVED`
- Emit ticket using `references/ticket-output-template.md`.
- Keep unresolved fields visible in `Remaining Gaps and Risk Decisions`.
- End the skill response after ticket output.

## Clarification Priority
When multiple fields are unresolved, ask in this order:
1. Safety and impact-critical fields (security scope, affected users, severity, regression risk)
2. Feature foundation fields (User Stories, AC boundaries, expected outcome, entry point)
3. Scope control fields (`non-goals`, constraints)
4. Interaction and quality fields (`design specs`, `edge cases`)
5. Execution support fields (artifacts, scripts, related paths, references)

## High-Quality Ticket Gate
Treat a ticket as high quality only when it covers:
- Context and affected audience
- Current behavior or baseline
- Expected outcome
- Explicit non-goals and constraints
- Edge cases
- Artifacts or references

Additional requirements for `Feature`:
- User Stories are explicit
- Acceptance Criteria map to User Stories
- Definition of Done is separate from Acceptance Criteria
- Design specs are explicit (linked artifact or textual interaction spec)

If any area remains unresolved, include it in the final handoff with rationale and explicit user-approved risk.

## Output Requirements
- Output final handoff as structured Markdown from `references/ticket-output-template.md`.
- Keep claims evidence-based; do not invent paths, artifacts, logs, metrics, or IDs.
- If requirements conflict, ask one resolving question.
- If user declines to provide required data, preserve the decision as a documented gap.
