# Research Ticket

## Context
- **Type**: Feature
- **Depth**: Standard
- **Objective**: Define what it means for the settings page to support team permissions — specifically, what role-based visibility rules govern which sections are visible to admins vs. members, what the team management section contains, and how the existing single-user settings architecture must change to accommodate both.
- **Classification reasoning**:

  The scenario is genuinely ambiguous. Both Feature and Design-UI are defensible:

  **Case for Design-UI**: The PM asks for a "redesign" — a sidebar nav, restructured section layout, and visibility-conditioned rendering. These are layout, navigation, and UX-flow concerns that sit squarely in the Design-UI definition ("visual design, UX flow, or UI component work"). A sidebar nav is a structural UI decision. Role-based visibility of sections is a conditional rendering concern — still a UI concern even if data-driven.

  **Case for Feature**: The PM's stated priority is explicit: "The important thing is the team permissions logic — who can see what." Team permissions (roles, member management, invite flow, access control) represent a new capability the system does not currently have. The Design-UI definition requires "visual design, UX flow, or UI component work" as the center of gravity — here, the center of gravity is the permission model, not the visual treatment. The sidebar nav is the delivery vehicle, not the point.

  **Tie-breaker applied**: The tie-breaker rule states: "prefer the type closest to the user's stated intent." The PM's stated intent — explicitly and in emphasis — is the team permissions logic. The UI redesign is acknowledged but framed as secondary ("I trust your judgment on the UI"). The user's intent centers on capability: making the settings page work for teams. The Design-UI type would mis-frame what needs to be specified: design artifacts, interaction states, and responsive requirements, when the critical unknowns are the permission model, role taxonomy, access rules, and team data model.

  **Teammate's argument considered and partially accepted**: The teammate's framing ("Design-UI is for when you have mockups") is incorrect as a definition — Design-UI does not require mockups, and the absence of mockups is itself a gap to document. However, the teammate's conclusion (Feature) is correct for the right reason: new capability dominates. The absence of mockups is a gap to document regardless of type.

  **Classification: Feature.** The dominant concern is the permission model and team management capability. The UI structure follows from that model; it cannot be specified independently.

---

## Problem Statement

`src/pages/Settings.tsx` is a single-user settings page with three hardcoded sections: profile, notifications, and billing. It has no concept of team membership, user roles, or access differentiation. Any authenticated user sees all sections. There is no team management surface anywhere in the application.

The application needs to support teams: organizations with multiple members, differentiated by role (at minimum: admin, member), where access to certain settings sections is gated by role. Admins need to manage team membership — view members, assign roles, and invite new users. Members need access only to their personal settings (profile, notifications). Billing and team management must be admin-only.

Until this is built, the settings page cannot serve multi-user teams and the application cannot be sold to or operated by organizations.

---

## Definition of Ready

| Field | Req | Status | Evidence |
|-------|-----|--------|----------|
| User goal | R | Clear | See below |
| Current behavior | R | Clear | `src/pages/Settings.tsx` is a 290-line single-user page with profile, notifications, billing sections. No role concept, no team concept, all sections visible to all authenticated users. File not found in explored codebase — documented as gap. |
| Target behavior | R | Clear | See below |
| Acceptance criteria | R | Clear | See below |
| Entry point | R | Partial — gap documented | `src/pages/Settings.tsx` is the primary entry point per scenario. Not found in `/home/dd/port-garden/src/` (directory does not exist). Secondary entry points — role/auth context, routing layer, team data API — also absent. Implementer must locate or create these. |
| Regression risk | O | Clear | Profile, notifications, and billing sections must remain fully functional for all users. Members must not lose access to profile/notifications post-migration. |
| Existing patterns | O | Gap — approved | No application `src/` found. No UI component library, no auth context, no routing patterns available from codebase exploration. Implementer must establish or follow project-level conventions. |
| Non-goals | O | Clear | See Scope Boundaries |

- **All Required clear?** Yes — with one approved gap: entry point and existing patterns cannot be verified from the current codebase snapshot. `src/` does not exist in `/home/dd/port-garden`.
- **Gaps with approved risk:** `src/pages/Settings.tsx` and all of `src/` are absent from the explored tree. All secondary files (auth context, routing, team API) are similarly absent. Implementer must work from live source tree. This gap does not block specification — it blocks verification of entry point line numbers only.
- **Ready for Plan?** Yes.

### User Goal

Team admins need to manage their team within the application (invite members, assign roles, remove members) without leaving the settings area. Team members need personal settings (profile, notifications) without access to team admin surfaces. The application needs to enforce these access rules at the UI layer — not just hide buttons, but gate entire sections — so that the settings page is safe for multi-role, multi-user organizations.

### Current Behavior

`src/pages/Settings.tsx` (290 lines, per scenario description — file not found in codebase snapshot): a flat single-user settings page rendering three sections (profile, notifications, billing). Navigation between sections is unknown (no file found to inspect). No role check, no team concept, no sidebar navigation. All sections render for all authenticated users.

### Target Behavior

The settings page becomes a role-aware, multi-section surface with a left sidebar for navigation. Section visibility is determined by the current user's role within their team:

| Section | Admin | Member |
|---------|-------|--------|
| Profile | Visible | Visible |
| Notifications | Visible | Visible |
| Billing | Visible | Hidden |
| Team (member list, roles, invites) | Visible | Hidden |

The sidebar nav reflects only visible sections for the current user — hidden sections do not appear in nav at all (not greyed out, not disabled: absent). Navigating to a URL for a hidden section redirects or renders an access-denied state, not a blank page.

The Team section contains three sub-components:
1. **Member list** — displays current team members with their names, email addresses, and roles.
2. **Role management** — allows an admin to change a member's role (e.g., promote member to admin, demote admin to member). Does not allow removing the last admin.
3. **Invite flow** — allows an admin to invite a user by email address. Invited user receives an email. Pending invites are visible in the member list until accepted or revoked.

### Acceptance Criteria

1. A non-authenticated user who navigates to `/settings` is redirected to the login flow (no change from current behavior, must not regress).
2. An authenticated user with role `member` sees only Profile and Notifications in the settings sidebar. Navigating directly to `/settings/billing` or `/settings/team` redirects to `/settings/profile` (or an explicit 403 view — implementer chooses, documents in plan).
3. An authenticated user with role `admin` sees Profile, Notifications, Billing, and Team in the sidebar. All four sections render correctly.
4. The Team section member list displays all current team members with name, email, and current role.
5. An admin can change another member's role via the Role Management sub-section. The change is reflected immediately in the member list without full page reload. An admin cannot demote the last admin (last-admin guard enforced).
6. An admin can initiate an invite via the Invite flow. A valid email address results in a pending invite record and a notification to the invited address. An invalid or duplicate email produces an inline error (not a toast-only error — form-level feedback required).
7. Pending invites appear in the member list with a distinct visual state (e.g., "Pending" badge). An admin can revoke a pending invite.
8. Existing profile, notifications, and billing sections retain all current behavior and pass existing tests after the migration to the new nav structure.
9. Role-based visibility is enforced server-side (or at the data-fetch layer), not only in the React render tree. A member who fetches billing data directly via API receives a 403 or empty response, not billing data.
10. The settings sidebar navigation is keyboard-accessible: Tab moves between nav items, Enter/Space activates them.

---

## Definition of Done

- [ ] All 10 acceptance criteria pass with automated tests
- [ ] Role-based visibility enforced at both UI layer (sidebar, section render) and data/API layer
- [ ] Last-admin guard implemented and tested (cannot demote the only admin)
- [ ] Member list, role management, and invite flow implemented and tested
- [ ] Pending invite state visible in member list; invite revocation works
- [ ] Inline form-level error states implemented for invite flow (invalid email, duplicate, network failure)
- [ ] Loading and empty states handled for member list (loading spinner/skeleton; empty state if team has no additional members)
- [ ] Existing profile, notifications, and billing sections pass existing test suite after migration
- [ ] Direct URL navigation to gated sections redirects/403s correctly for members
- [ ] Keyboard accessibility: sidebar nav navigable by keyboard
- [ ] `[human]` Visual review: sidebar layout and Team section approved by PM before shipping (no mockups exist — PM review gates visual acceptance)

---

## Codebase Findings

| File | Purpose | Key Lines |
|------|---------|-----------|
| `src/pages/Settings.tsx` | Primary entry point — **FILE NOT FOUND** in `/home/dd/port-garden/src/` | 290 lines per scenario; contains profile, notifications, billing sections. Not inspectable from current snapshot. |
| `src/` (directory) | Application source — **NOT FOUND** | Entire `src/` directory absent from project root. All application files are missing from this codebase snapshot. |
| `/home/dd/port-garden/refs/oh-my-claudecode/src/team/permissions.ts` | RBAC-compatible advisory permission scoping for a different system (agent workers, not user roles) | Lines 13-19: `WorkerPermissions` interface with `allowedPaths`, `deniedPaths`, `allowedCommands`. Lines 109-135: `isPathAllowed()` with deny-overrides-allow pattern. Lines 200-209: `SECURE_DENY_DEFAULTS` — security-relevant patterns for deny-first design. Not directly applicable to UI role gating, but confirms deny-overrides-allow as a pattern in this codebase's permission thinking. |
| `/home/dd/port-garden/refs/oh-my-claudecode/src/team/types.ts` | Team member and task types for a different system (agent orchestration) | Lines 84-95: `McpWorkerMember` interface with `agentId`, `name`, `agentType`, `joinedAt`. Lines 106-107: `HeartbeatData.status` enum pattern — shows how member state is enumerated. Not directly applicable but shows team membership data shape thinking. |
| `/home/dd/port-garden/refs/oh-my-claudecode/src/hud/elements/permission.ts` | UI rendering of permission state | Lines 19-22: `renderPermission()` with null-guard pattern and text-based rendering. Shows existing pattern: absent/null state renders null (nothing), not disabled. Directly applicable: hidden sections for members should render null, not disabled nav items. |

**Exploration summary**: Searched for `Settings`, `settings`, `sidebar`, `nav`, `role`, `permission`, `team`, `auth`, `user` across all of `/home/dd/port-garden`. No application source files found. All relevant matches belong to reference projects (`refs/oh-my-claudecode`, `refs/hyperpowers`, etc.) which are tools reference code, not the application under development. The application `src/` directory does not exist in this codebase snapshot. All codebase findings are from reference projects and carry limited applicability.

---

## Chosen Approach

**Role context at the top of the settings route, section registry as the navigation source of truth.**

The settings page component reads the current user's role from the application's auth/session context (however that is currently implemented — this must be located in the live source tree). A `SETTINGS_SECTIONS` registry maps section keys to their minimum required role. The sidebar nav is generated from this registry, filtering to only sections the current user's role can access. Each section component is independently routed (e.g., `/settings/profile`, `/settings/team`). Route-level guards redirect unauthorized direct-URL access.

The Team section is implemented as a new compound component (or directory of components) within the settings module. It receives team data from a new or extended API layer. The member list, role management, and invite flow are separate child components within the Team section, rendered via sub-navigation or tab-like structure within the Team panel.

Permission enforcement at the API layer is implemented as middleware or a guard on the team and billing data endpoints — this is separate from and independent of the UI visibility.

**Why chosen**: The section registry pattern keeps the role-visibility rules in one authoritative location rather than scattered across individual components. Adding a new section or role requires one registry change, not modifications to the sidebar and the route guard separately. This is the lowest-friction approach for a small role set (admin/member) without over-engineering a full RBAC framework.

---

## Rejected Approaches

| Approach | Why Considered | Why Rejected | Revisit If |
|----------|---------------|--------------|------------|
| Inline role checks in each section component | Simpler initial code — each component is self-contained | Role logic is duplicated across components; adding a role or section requires changes in multiple files; violates single-source-of-truth for access rules | Team stays small (2 roles, <5 sections) and registry overhead is unwanted |
| Full RBAC middleware library (e.g., CASL) | Scales to complex permission matrices; industry standard | Premature for two roles and four sections; introduces a dependency for a problem that does not yet have complexity to justify it; hides the access rules in library configuration | Role set grows beyond 3; permissions become attribute-based rather than role-based |
| Single settings page with conditional rendering (no routing) | Avoids routing complexity; simpler component structure | Direct URL access to gated sections becomes unenforceable; browser back/forward behavior is unreliable without routes; server-side access enforcement is impossible without URL-addressable sections | Settings is a modal (not a page) where URL-addressable sections are not a product requirement |

---

## Scope Boundaries

**In scope:**
- Settings page sidebar navigation (left-side nav, replacing or augmenting current section layout)
- Role-based section visibility: admin sees all four sections, member sees profile and notifications only
- Restructuring of existing profile, notifications, and billing sections into the new nav (behavior unchanged; container restructured)
- New Team section: member list, role management (change role), invite flow (invite by email, pending invites, revoke invite)
- Last-admin guard: prevent demoting the only admin
- Route-level access guard: direct URL navigation to gated sections redirects or 403s
- API-layer access enforcement for billing and team data endpoints (403 for unauthorized roles)
- Keyboard accessibility for sidebar navigation
- Loading and error states for Team section data fetches
- Inline form-level error feedback in invite flow

**Out of scope:**
- Role creation or custom role definition (only admin and member in scope)
- Organization-level billing management (billing section behavior unchanged)
- SSO, SAML, or OAuth team provisioning
- Audit log of permission changes
- Team deletion or account closure
- User self-removal from a team (member leaving)
- Email template design for invite emails (only functional delivery in scope)
- Mobile responsive layout (not mentioned in requirements; flagged as open question)
- Granular per-section permissions within billing or notifications (only section-level gating in scope)

---

## Open Questions

1. **Role taxonomy complete?** The scenario names admin and member. Are there additional roles (e.g., viewer, billing-only)? The answer affects the permission registry design. Default assumption: admin and member only, as stated.

2. **Where does the current user's role come from?** The application must have an auth context or session object that includes team membership and role. This file was not found during exploration. The implementer must locate `src/auth/`, `src/context/`, or equivalent before the entry point can be confirmed. Default assumption: a React context or hook (e.g., `useCurrentUser()`) returns user + role; implementer locates this in live source.

3. **Team membership model: is a user always on exactly one team?** If users can belong to multiple teams, the settings page must have a team-switcher or be scoped to a selected team. Default assumption: one team per user for now; revisit if multi-team is confirmed.

4. **Invite flow: email-based only, or can admins search existing users?** If the application already has a user directory, invite autocomplete (search by name or email) is feasible. If not, email-only is the baseline. Default assumption: email-only invite input, consistent with the scenario description.

5. **What happens when a member navigates to `/settings/billing` directly?** Two acceptable behaviors: (a) redirect to `/settings/profile`, (b) render a minimal 403 view within the settings shell. The PM has not specified. This decision must be made in planning and documented. Default assumption: redirect to first accessible section.

6. **Mobile responsive behavior?** The PM ticket and scenario do not mention responsive requirements. A left sidebar on mobile is a significant layout concern. Default assumption: desktop-first; mobile behavior is out of scope for this ticket but must be addressed before shipping if the application has mobile users.

7. **Does the billing section move or only become role-gated?** The scenario says billing is restructured into the new nav but does not say it changes. Default assumption: billing content is unchanged; only its placement in the sidebar and access gating changes.

8. **Design approval process?** No mockups exist. The PM says "I trust your judgment on the UI." This means there is no pre-approved design artifact to implement against. The DoD includes a PM visual review gate before shipping. Who owns this review, and what channel/process is used?

---

## Handoff Notes

- **Starting point**: `src/pages/Settings.tsx` in the live source tree. Read the full file before touching it — the 290-line structure determines how invasive the sidebar migration will be. After reading Settings.tsx, locate the auth context (likely in `src/context/`, `src/auth/`, or a `useCurrentUser` hook) to understand how role data is accessible.
- **Second priority**: Locate the routing layer (likely React Router in `src/routes/` or `src/App.tsx`) to understand how to add route guards for `/settings/billing` and `/settings/team`.
- **Known risks**:
  - (1) If the current settings page has no routing (all sections rendered on one route via state), adding URL-addressable sections is a larger change than expected — it requires migrating the section structure to routes, not just adding a sidebar.
  - (2) If the current user's role is not available in any existing auth context, a team membership API call must be added before any role-gating logic can be implemented. This could extend the scope significantly.
  - (3) The invite flow requires a backend endpoint that does not currently exist (or may not — unverifiable from this snapshot). Backend work is likely in scope but not explicitly scoped in the PM ticket.
  - (4) The last-admin guard must be enforced server-side, not only client-side. A client-side-only guard can be bypassed.
- **Patterns to follow** (from reference code): The `renderPermission()` pattern in `refs/oh-my-claudecode/src/hud/elements/permission.ts` (lines 19-22) uses `if (!value) return null` — hidden means absent, not disabled. Apply this same thinking to the sidebar: members should not see a disabled Billing nav item; they should see no Billing nav item at all. The deny-overrides-allow pattern from `refs/oh-my-claudecode/src/team/permissions.ts` (lines 120-134) is a useful framing: when in doubt about whether a section should be visible, default to hidden unless the role explicitly permits it.
- **Complexity**: Medium-High. The surface area is large (sidebar nav, four sections, new team management components, route guards, API-layer enforcement, invite flow). Individual pieces are well-understood, but the interaction between routing, auth context, and the new section registry requires careful sequencing. The invite flow alone (email delivery, pending state, revocation) is a feature of non-trivial scope. Recommend splitting implementation into two sub-tasks: (1) sidebar nav + role-based visibility for existing sections, (2) new Team section (member list, role management, invite flow).
