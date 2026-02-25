# Research Ticket

## Context
- **Type**: Design-UI
- **Depth**: Standard (new component directory, bounded scope, multiple unknowns in interaction flow)
- **Objective**: Define what "done" looks like for implementing the Team Invite modal before any code is written — specifically to surface and resolve the missing interaction states that the Figma mockups do not cover, so the implementer is not forced to make undocumented UX decisions mid-sprint.

---

## Problem Statement

The lead designer has delivered Figma mockups for a new "Team Invite" modal. The mockups are polished and cover the happy path: email input with autocomplete dropdown, role selector (Admin / Member / Viewer), Send Invite button, and a success banner. The component directory (`src/components/TeamInvite/`) does not yet exist.

The mockups do not specify four of the five required interaction states: loading, error (three distinct error categories), empty autocomplete, and keyboard navigation for the dropdown. The designer has verbally indicated that error states should use "the existing toast component." That guidance is insufficient specification: it does not name which errors trigger a toast versus an inline message, what the message copy should be for each error condition, or how the component recovers after an error. These gaps, if left unresolved, will force the implementer to make ad-hoc UX decisions during the sprint that may contradict the designer's intent and create debt that survives the Friday deadline.

The sprint goal is "Team Invite modal implemented by Friday." This ticket's purpose is to make that goal achievable without rework — not to slow it down.

---

## Definition of Ready

| Field | Req | Status | Evidence |
|-------|-----|--------|----------|
| Design artifacts | R | **partial** | Figma mockups confirmed by designer. Mockups cover: email input field with autocomplete dropdown, role selector with three variants (Admin, Member, Viewer), Send Invite button (default state only), success state (green banner: "Invitation sent to {email}"). No Figma frames exist for loading, error, empty autocomplete, or mobile viewports. Artifact URL not provided to researcher — implementer must obtain link from designer. |
| Interaction flow | R | **unclear — gap documented** | Success state: specified. Loading state (post-click, pre-response): **not specified**. Error states (invalid email format, network failure, user already invited, rate limit exceeded): **not specified** — designer said "use our existing toast component" but did not specify which errors trigger a toast, which trigger inline feedback, what the message copy is, or how the component recovers. Empty state (no autocomplete suggestions): **not specified**. Keyboard navigation for autocomplete (arrow keys, Enter, Escape, Tab): **not specified**. See gap risk assessment below. |
| Responsive requirements | O | **not specified** | No mobile or tablet mockups exist. No breakpoints named by designer. Gap documented; see risk assessment below. |
| Existing UI patterns | O | **not found in codebase** | `src/components/` does not exist at `/home/dd/port-garden`. No toast component, modal component, autocomplete component, design token file, or CSS convention was found during exploration. The refs directory (`refs/oh-my-claudecode/src/`) contains a CLI tool codebase with no browser UI components — it is not a source of UI patterns for this feature. Implementer must establish what component library, token system, and styling conventions the application uses before writing any code. |
| Accessibility specs | O | **not specified** | No ARIA requirements, WCAG level, or keyboard accessibility spec was provided. Keyboard navigation for the autocomplete dropdown is a practical gap (see interaction flow), not just an optional accessibility spec. |
| Non-goals | O | **not specified** | No explicit scope boundaries were stated. See Scope Boundaries section below for defaults. |

- **All Required clear?** No. Both Required fields (Design artifacts, Interaction flow) have gaps.
- **Gaps with approved risk:**
  - **Interaction flow — loading state**: Risk is low-medium. If not specified, implementer will default to disabling the button and showing a spinner inline. This is a reasonable default, but if the designer intends a different pattern (e.g., optimistic UI, full modal overlay), the gap produces a mismatch that requires rework.
  - **Interaction flow — error states**: Risk is **high**. Three distinct error categories have different appropriate UX treatments. Invalid email format is typically caught client-side before submission and shown inline. Network failure and rate limiting are server-side errors with different recovery actions. "User already invited" may warrant a persistent inline message rather than a transient toast. Conflating all errors into a single toast treatment may produce confusing UX (e.g., a transient toast for "already invited" disappears before the user reads it, and they attempt to send again). Without message copy, the implementer must write UX copy — a design decision, not an engineering decision.
  - **Interaction flow — empty autocomplete state**: Risk is low-medium. If the autocomplete query returns no results, the dropdown must either close, show a "No results" message, or show suggested alternatives. The default behavior (close the dropdown) is acceptable but undocumented.
  - **Interaction flow — keyboard navigation**: Risk is **high** from an accessibility standpoint. A custom autocomplete dropdown without keyboard support violates WCAG 2.1 AA (SC 2.1.1). If the application has any accessibility requirement, this is a blocker. If it does not, it is still a likely source of QA failure.
  - **Responsive requirements**: Risk is medium. A modal with an autocomplete dropdown has distinct layout challenges on mobile (virtual keyboard overlap, dropdown positioning). No mobile breakpoint spec means the implementer chooses, and the result may not match what the designer would have specified.
  - **Existing UI patterns**: Risk is **high**. Because no component library, token system, or styling conventions were found in the codebase during exploration, the implementer has no source of truth for how to style the modal, what spacing values to use, or what the "existing toast component" actually is. If the implementer builds from scratch, it may diverge from the rest of the application. If the designer's mockups reference specific design tokens that exist in a tool (Figma variables, a separate design system repo) but not in the codebase, those tokens must be mapped to code before implementation begins.
- **Ready for Plan?** No. The two Required fields must be resolved before implementation begins. The risk assessment above is offered to prioritize which gaps to resolve first — error states and keyboard navigation carry the highest risk.

---

## Definition of Done

- [ ] Design artifacts faithfully implemented — all Figma frames (including any added after this ticket) are reflected in the component
- [ ] All interaction states handled: success (green banner), loading (post-click, pre-response), error (invalid email format, network failure, user already invited, rate limit exceeded — each with specified copy and recovery), empty autocomplete (no suggestions returned)
- [ ] Keyboard navigation implemented for autocomplete dropdown (arrow up/down to navigate, Enter to select, Escape to close, Tab to leave)
- [ ] Responsive requirements met at specified breakpoints (pending designer input on mobile behavior)
- [ ] Existing UI patterns and design tokens used consistently — no ad-hoc color values or spacing that diverges from the application's established system
- [ ] Accessibility: ARIA roles applied to autocomplete dropdown (`role="combobox"`, `role="listbox"`, `aria-expanded`, `aria-activedescendant`)
- [ ] [human] Visual review approved by designer for all states (not just success state)
- [ ] [human] QA pass on all error states with real API calls (not just mocked responses)

---

## Codebase Findings

| File | Purpose | Key Lines |
|------|---------|-----------|
| `src/components/TeamInvite/` | Target directory for new component — **does not exist** | No files found; new directory required |
| `src/components/` | Application component library — **does not exist** | No `src/` directory found at `/home/dd/port-garden`; no existing modal, toast, autocomplete, or form components to reference |
| Design token files (CSS, JS, JSON) | Design system tokens — **not found** | No `.css`, `.scss`, or token files found in project root or `refs/` |
| Toast component | Referenced by designer as error state pattern — **not found** | No toast component exists in the explored codebase; "use our existing toast component" cannot be verified against actual code |
| `refs/oh-my-claudecode/src/hud/elements/session.ts` | CLI HUD element — unrelated to browser UI | Line 20-21: `renderSession(session: SessionHealth \| null)` with `if (!session) return null` — documents null-guard convention in this repo, not a UI component pattern |
| `refs/oh-my-claudecode/src/notifications/types.ts` | CLI notification system — unrelated to browser UI | Defines Discord/Slack/webhook notification types; no browser toast or modal patterns |

**Exploration summary:** The project at `/home/dd/port-garden` contains no `src/` directory. Searches for `components`, `toast`, `modal`, `autocomplete`, `design tokens`, `.css`, `.scss`, and `styled` returned no hits within the application source. The only source code present is the `refs/oh-my-claudecode/` CLI tool, which uses terminal rendering (ANSI escape codes) rather than browser UI components. The designer's reference to "our existing toast component" cannot be verified from the current codebase snapshot. The implementer must locate the application's actual source tree before writing any code.

---

## External Research

Not conducted for this ticket. The interaction patterns for accessible autocomplete dropdowns (ARIA combobox pattern), modal focus trapping, and email validation are well-established and do not require research. They do require specification of which patterns the application uses — that is a codebase question, not an external research question.

---

## Chosen Approach

**Approach A: Resolve Required gaps before sprint work begins (recommended)**

Before implementation starts, the implementer schedules a 30-minute sync with the designer to walk through the four missing interaction states. The designer either:
1. Creates Figma frames for loading, error (per error type), and empty autocomplete, or
2. Explicitly approves a specific default for each (documented in writing, added to this ticket as an amendment).

Keyboard navigation and ARIA spec are confirmed against the application's existing accessibility standard (if one exists). The component library and toast component are located in the actual source tree.

Trade-offs:
- **Pro:** Eliminates all high-risk gaps before a line of code is written. Avoids the most common sprint failure mode: building the wrong thing and reworking it.
- **Pro:** The designer's week of work is protected — the mockups cover the happy path well, and resolving gaps does not redo that work.
- **Con:** Requires 30 minutes of designer time before Friday, which may feel like a delay. In practice, discovering these gaps during QA on Thursday costs far more time.

**Approach B: Implement from mockups with documented defaults**

Begin implementation from the existing mockups. Document the default chosen for each missing state in a brief ADR (Architecture Decision Record) comment in the component file, flagged for designer review. Implementation proceeds in this order: (1) success state from mockups, (2) loading state with inline spinner, (3) inline error for invalid email, (4) toast for server errors (network, rate limit, already-invited — all treated identically), (5) empty autocomplete closes dropdown, (6) keyboard navigation per WCAG ARIA combobox pattern.

Trade-offs:
- **Pro:** Unblocks implementation immediately. The sprint goal is met for the happy path.
- **Con:** The error state decisions (one toast for all server errors) are likely wrong for "user already invited" — that error is not transient and a toast is the wrong affordance. Rework is probable after stakeholder review.
- **Con:** If the application's toast component is not the same component the implementer builds or imports, the error UI will be visually inconsistent.
- **Con:** If the application has an accessibility requirement, the keyboard navigation must be implemented regardless — it is not optional.

**Approach C: Partial implementation (success state only) with explicit scope reduction**

Formally narrow the Friday sprint goal to "success state only" with explicit product and designer sign-off. Treat the missing states as a follow-on ticket. This is only appropriate if the team explicitly agrees that a partially-functional invite flow (no error handling) is acceptable to ship.

Trade-offs:
- **Pro:** Guaranteed to meet the scoped Friday deadline.
- **Con:** Ships a form with no error handling, which will fail silently for users who submit an invalid email or hit a rate limit. This is a poor user experience and likely unacceptable for a production feature.

---

## Rejected Approaches

| Approach | Why Considered | Why Rejected |
|----------|---------------|--------------|
| Accept "use existing toast component" as filling the error state gap | Designer authority, time pressure, sunk cost in mockups | The research skill explicitly states this is insufficient specification. It does not identify which errors, what message copy, or how the component recovers. Three of the four error categories (invalid email, rate limiting, already invited) have meaningfully different appropriate treatments. Filling this with a single toast decision during implementation produces rework. |
| Start implementing immediately from mockups | Sprint pressure, "clear enough" design | The application's `src/components/` directory does not exist in the explored codebase. The implementer cannot write consistent UI code without knowing what component library, design tokens, and styling conventions are in use. This is a blocker independent of the missing interaction states. |

---

## Scope Boundaries

- **In scope:** `src/components/TeamInvite/` — new directory with modal component, email autocomplete sub-component, role selector sub-component, success state, loading state, all specified error states, empty autocomplete state, keyboard navigation for dropdown
- **In scope:** Integration with the application's existing API endpoint for sending invitations (endpoint URL, request shape, and response shape must be confirmed with backend team)
- **In scope:** Visual review by designer for all states, not just success state
- **Out of scope:** Backend API implementation for the invite endpoint
- **Out of scope:** Email delivery confirmation or invitation acceptance flow (what happens when the invitee clicks the link)
- **Out of scope:** Bulk invite (multiple emails in one submission)
- **Out of scope:** Invitation management (viewing, canceling, or resending existing invitations)
- **Out of scope:** Role permission enforcement — this ticket covers the UI for role selection only, not the backend permission model

---

## Open Questions

1. **Where is the application's actual source tree?** The `src/` directory does not exist at `/home/dd/port-garden`. The implementer must locate the correct working directory before writing any code. Default assumption: the application source lives in a sibling repository or subdirectory not present in this research environment.

2. **What is "the existing toast component"?** The designer referenced it by name. The implementer must locate it (file path, import name, API) in the actual source tree before using it. If it does not exist, the error state design must be reconsidered.

3. **What is the API endpoint for sending invitations?** Request shape (email, role), response shape (success payload, error codes), and rate limit behavior must be confirmed before implementing error state handling.

4. **Does the application have an established accessibility standard (WCAG level)?** If yes, keyboard navigation and ARIA roles are required. If no formal standard exists, keyboard navigation is still strongly recommended for the autocomplete dropdown.

5. **What are the mobile/responsive requirements?** The modal contains an autocomplete dropdown — on mobile, the virtual keyboard will affect viewport height and dropdown positioning. The designer must specify whether the modal collapses, scrolls, or adapts on small screens.

6. **What error does the API return for "user already invited"?** The error code (HTTP status, response body field) must be known to distinguish this case from a network failure and apply the correct UX treatment.

7. **Is there a rate limit on invite sending, and if so, what is the limit and the error response?** Rate-limit UX (e.g., "You've sent too many invitations. Try again in 10 minutes.") requires knowing the limit and the API's error response shape.

8. **What is the autocomplete data source?** Does the dropdown suggest existing team members, all application users, or organization members? What triggers the autocomplete query — on keystroke, after N characters, or on focus? What is the debounce interval?

---

## Handoff Notes

- **Starting point:** Before writing any code — (1) locate the actual application source tree, (2) schedule the 30-minute gap-resolution sync with the designer, (3) confirm the API endpoint with backend. After those three inputs are resolved, implementation can begin at `src/components/TeamInvite/` with the success state from the Figma mockups.
- **Known risks:** (1) The error state gap is the highest-risk gap — if left unresolved, the implementer will make UX decisions that the designer will likely want to change after visual review, and the rework will occur on Thursday or Friday. (2) The missing component library reference means the first implementation task may be non-trivial setup (finding or establishing styling conventions) rather than the modal itself — budget time accordingly. (3) "User already invited" is the error most likely to be treated incorrectly as a toast — it warrants a persistent inline message.
- **Complexity:** Medium. The happy-path component (email input, role selector, send button, success banner) is straightforward. The complexity is in the autocomplete interaction (keyboard navigation, debouncing, empty state), the differentiated error states, and the unknown styling baseline. If the component library and toast component are easy to locate, complexity is low-medium. If the implementer must establish styling conventions from scratch, complexity is medium-high.
