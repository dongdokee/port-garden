# Design-UI — Exploration Scope & DoD

| Field | Req | Why it matters |
|-------|-----|---------------|
| Design artifacts | R | Figma, mockups, wireframes, or textual specs — the source of truth for what to build |
| Interaction flow | R | Success, empty, error, and loading states — prevents incomplete implementations |
| Responsive requirements | O | Breakpoints, device targets — scopes how much to explore |
| Existing UI patterns | O | Component library, design tokens, styling conventions already in the codebase |
| Accessibility specs | O | WCAG level, aria requirements, keyboard navigation — non-negotiable constraints |
| Non-goals | O | What NOT to redesign — prevents scope creep into adjacent UI |

## DoD Template

- [ ] Design artifacts faithfully implemented
- [ ] All interaction states handled (success, empty, error, loading)
- [ ] Responsive requirements met at specified breakpoints
- [ ] Existing UI patterns and design tokens used consistently
- [ ] Accessibility specs met (keyboard nav, aria, WCAG level)
- [ ] Non-goals confirmed untouched — no adjacent UI changes
- [ ] Visual review approved by stakeholder
