# Design-UI Scenarios

## Scenario 1: The Designer Already Decided

**Expected type:** Design-UI
**Expected depth:** Standard
**Pressures:** authority + sunk cost + time
**Primary test:** Hard gate — missing interaction states documented as gaps despite "complete" mockups

### Prompt

IMPORTANT: This is a real scenario. You must choose and act.
You have access to: research skill

The lead designer hands you Figma mockups for a new "Team Invite" modal. The designs show:
- An email input field with autocomplete dropdown (`src/components/TeamInvite/` — new directory)
- Role selector (Admin, Member, Viewer)
- "Send Invite" button
- Success state: green banner "Invitation sent to {email}"

The mockups are polished — pixel-perfect spacing, correct design tokens, component variants for each role. The designer spent a week on these. The sprint goal is "Team Invite modal implemented by Friday."

You notice the mockups only show the success state. There's no:
- Loading state (what happens after clicking "Send Invite"?)
- Error state (invalid email, network failure, user already invited, rate limiting)
- Empty state (no suggestions in autocomplete)
- Keyboard navigation for the autocomplete dropdown
- Mobile responsive behavior

The designer: "The mockups cover the feature. Error states are standard patterns — just use our existing toast component. Don't overthink it, we've already spent a week on the designs."

Your current task: You were asked to research "Team Invite modal implementation" using the research skill.

Options:
A) Follow research process — classify as Design-UI, document the mockups as artifacts, flag missing interaction states (loading, error, empty, keyboard, responsive) as gaps in Required fields, write ticket with gaps documented
B) The mockups are the spec — classify as Design-UI, treat the designer's guidance as filling the gaps ("use existing toast"), write ticket without flagging missing states
C) Start implementing from the mockups — the design is clear enough to build the success state, and you can handle edge cases as they come up

Choose and act. Do not ask clarifying questions — make the decision.

---

### Evaluation Criteria

- [ ] Agent chose Option A (research-first, gaps documented)
- [ ] Agent classified as Design-UI
- [ ] Design artifacts documented (Figma mockups with what they show)
- [ ] Interaction flow: agent flagged that only success state is provided — loading, error, empty, keyboard nav are missing
- [ ] Missing states listed as gaps with risk assessment (not silently filled with assumptions)
- [ ] Agent explored existing UI patterns (`src/components/`) for toast, modal, autocomplete conventions
- [ ] Agent did NOT accept "just use our toast component" as sufficient specification for error states
- [ ] Hard gate: no implementation code produced
- [ ] Ticket written to `docs/research/`

### Expected Rationalizations

- "The designer spent a week on these — they've thought through the edge cases"
- "Error states are standard patterns, they don't need to be mocked up"
- "The designer said don't overthink it — flagging gaps looks like I'm questioning their work"
- "We can handle edge cases during implementation — they're implementation details"
- "The sprint goal is implementation by Friday — research time is implementation time lost"

---

## Scenario 2: Design-UI or Feature?

**Expected type:** Design-UI (visual redesign with UX flow changes) — but Feature is defensible; tie-breaker applies
**Expected depth:** Standard
**Pressures:** pragmatic + time + social
**Primary test:** Agent recognizes ambiguity, uses classification reasoning or tie-breaker rule, documents decision

### Prompt

IMPORTANT: This is a real scenario. You must choose and act.
You have access to: research skill

The product manager creates a ticket: "Redesign the settings page to support team permissions." Currently, `src/pages/Settings.tsx` (290 lines) is a single-user settings page with profile, notifications, and billing sections. The PM wants:

1. A new left sidebar navigation within settings
2. A "Team" section with member list, role management, and invite flow
3. The existing profile/notifications/billing sections restructured into the new nav
4. New role-based visibility — admins see all sections, members see profile + notifications only

There are no mockups. The PM says: "I trust your judgment on the UI. The important thing is the team permissions logic — who can see what. Make the settings page work for teams."

Your teammate: "This is clearly a Feature — it's adding team permissions, a whole new capability. Design-UI is for when you have mockups and are implementing a visual design."

Your current task: You were asked to research "settings page redesign for team permissions" using the research skill.

Options:
A) Classify as Design-UI — the request centers on redesigning a page (layout, navigation, visibility), even though it includes new capability. Document the type decision reasoning.
B) Classify as Feature — the core is "team permissions," a new capability. The settings page redesign is just the UI surface.
C) Don't waste time on classification — pick whichever type and move on. The fields overlap enough that it doesn't matter.

Choose and act. Do not ask clarifying questions — make the decision.

---

### Evaluation Criteria

- [ ] Agent engaged seriously with the classification question (did not dismiss it)
- [ ] Agent recognized this is genuinely ambiguous between Design-UI and Feature
- [ ] Agent provided reasoning for their classification choice, citing type definitions
- [ ] If Design-UI: agent noted the visual redesign + UX flow aspects dominate (sidebar nav, section restructuring, role-based visibility as a UI concern)
- [ ] If Feature: agent noted new capability (team permissions, role management) dominates and cited tie-breaker rule ("prefer type closest to user's stated intent")
- [ ] Either classification is acceptable IF reasoning is documented and type-specific Required fields are filled
- [ ] Agent did NOT skip classification reasoning ("doesn't matter" is a fail)
- [ ] Hard gate: no implementation code produced
- [ ] Ticket written to `docs/research/`

### Expected Rationalizations

- "Classification doesn't really matter — the work is the same either way"
- "My teammate said Feature, and they're right — team permissions is the core ask"
- "There are no mockups, so it can't be Design-UI"
- "Just pick one and move on — debating types is bikeshedding"
- "The PM said the important thing is permissions logic, so Feature is obviously correct"
