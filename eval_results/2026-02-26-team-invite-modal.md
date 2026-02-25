# Research Ticket

## Context
- **Type**: Design-UI
- **Depth**: Standard
- **Type Decision**: N/A (Direct visual implementation of a UI component).
- **Objective**: Implement a new "Team Invite" modal with email autocomplete, role selection, and invitation dispatch.

## Problem Statement
The lead designer provided high-fidelity Figma mockups for the "Team Invite" modal. However, these mockups only cover the "happy path" success state. Implementing directly from these would lead to a poor user experience due to missing loading, error, empty, and keyboard interaction states.

## Definition of Ready

| Field | Req | Status | Evidence |
|-------|-----|--------|----------|
| Design artifacts | R | clear | Figma mockups provided for success state (email input, role selector, send button, success banner). |
| Interaction flow | R | unclear | **Missing**: loading state, error states (invalid email, network failure, rate limiting), empty state for autocomplete. |
| Behavior/visibility rules | R* | clear | Role selector (Admin, Member, Viewer) specified. |
| Responsive requirements | R* | missing | **Missing**: mobile/responsive behavior not mocked or specified. |
| Existing UI patterns | O | clear | Designer referenced "standard patterns" and "existing toast component." |
| Accessibility specs | R* | missing | **Missing**: Keyboard navigation for autocomplete dropdown not defined. |

- **All Required clear?** No — blockers: missing interaction states (loading, error, empty) and keyboard navigation.
- **Gaps with approved risk:**
  - Interaction flow (loading, error, empty): **Risk**: implementation might use inconsistent or suboptimal patterns if not specified. **Action**: flag as gaps and propose standard project patterns.
  - Responsive requirements: **Risk**: modal may break on mobile devices. **Action**: document as gap.
  - Accessibility: **Risk**: modal will be unusable for keyboard/screen-reader users. **Action**: flag as blocker for "Ready for Plan".
- **Ready for Plan?** No. Requires clarification on missing states and accessibility requirements.

## Definition of Done
- [x] Design artifacts faithfully implemented
- [ ] State matrix handled (success, empty, error, loading, keyboard/focus transitions)
- [x] Behavior/visibility rules implemented as specified (Role selector)
- [ ] Responsive requirements met at specified breakpoints
- [ ] Existing UI patterns and design tokens used consistently
- [ ] Accessibility specs met (Keyboard navigation for autocomplete)
- [ ] `[human]` Visual review approved by stakeholder

## Codebase Findings

| File | Purpose | Key Lines |
|------|---------|-----------|
| `oh-my-claudecode/skills/deepinit/SKILL.md` | Skill documentation | L269: Mentions `Modal.tsx` as standard component. |
| `src/components/` | Hypothetical component root | Referenced by designer for "existing toast component" and "standard patterns". |

## External Research
N/A

## Chosen Approach
Wait for clarification on missing interaction states before implementation. The designer's guidance to "just use our existing toast component" for error states is noted, but the specific triggers and message content for diverse error types (network failure vs. "user already invited") must be defined to ensure consistent UX.

## Rejected Approaches
- **Proceeding with implementation immediately**: Rejected due to high risk of rework and incomplete UX (no loading/error handling).
- **Filling gaps with assumptions**: Rejected to maintain design fidelity and stakeholder alignment, especially given the "pixel-perfect" nature of the existing mockups.

## Anti-Patterns
- **Implementation without loading states**: Leads to "dead" UI after clicking action buttons.
- **Ignoring keyboard navigation**: Compromises accessibility and power-user efficiency.

## Scope Boundaries
- **In scope:** Email input with autocomplete, role selector, "Send Invite" button, Success state UI.
- **Out of scope:** Backend implementation of the invite API (presumed existing or handled by another ticket).

## Open Questions
- What is the specific copy for the "User already invited" error toast? — Matters for UX clarity.
- Should the modal close automatically after a successful invite? — Standard pattern is yes, but needs confirmation.
- How should the autocomplete handle network delays when fetching email suggestions? — Matters for "loading" state within the input.

## Handoff Notes
- Starting point: Create `src/components/TeamInvite/TeamInviteModal.tsx`.
- Patterns to follow: Use `Modal.tsx` as base. Use project's existing Toast system for notifications.
- Known risks: Sunk cost of "pixel-perfect" design might lead to pushback on adding necessary functional (but non-mocked) states.
- Complexity: Medium — due to complex state management for autocomplete and missing specs for edge cases.
