# Design-UI — Exploration Scope & DoD

| Field | Req | Why it matters |
|-------|-----|---------------|
| Design artifacts | R | Figma, mockups, wireframes, or textual specs — source of truth |
| Interaction flow | R | State matrix for success, empty, error, loading, and transition behavior (including keyboard/focus states) |
| Behavior/visibility rules | R* | Required when role-based visibility or conditional sections are involved |
| Responsive requirements | R* | Required for new layouts/navigation changes; optional for pure copy/style updates |
| Existing UI patterns | O | Component library, design tokens, styling conventions |
| Accessibility specs | R* | Required for interactive UI; optional for static visual-only changes |
| Non-goals | O | Scope boundaries — what is explicitly excluded to prevent over-exploration |

`R*` means conditionally required. If condition does not apply, mark `N/A` with reason.
When Design-UI vs Feature is ambiguous, include a Type Decision rationale in the ticket Context.

## DoD Template

- [ ] Design artifacts faithfully implemented
- [ ] State matrix handled (success, empty, error, loading, keyboard/focus transitions)
- [ ] Behavior/visibility rules implemented as specified (if applicable)
- [ ] Responsive requirements met at specified breakpoints (if applicable)
- [ ] Existing UI patterns and design tokens used consistently
- [ ] Accessibility specs met (if applicable)
- [ ] `[human]` Visual review approved by stakeholder
