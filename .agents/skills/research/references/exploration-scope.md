# Exploration Scope by Ticket Type

Use this matrix to determine what information to gather during research.
After classifying the ticket type in Phase 1, load the corresponding exploration
scope. Each field should be resolved to `clear`, `unclear`, or `missing` during
Phases 2-3. Unresolved fields at report time must be documented as gaps with
risk decisions.

## Ticket Types

| Type | Purpose |
|------|---------|
| Bug | Identify, replicate, and resolve root cause of broken behavior |
| Feature | Architect and integrate new functionality |
| Change | Modify existing functional requirements (behavioral change) |
| Improvement | Enhance non-functional quality attributes (performance, security, etc.) |
| Refactoring | Structural change with no behavior change |
| Security | Mitigate vulnerabilities and harden the system |
| Task | Execute specific, bounded operations (chores, migrations, ops) |
| Doc | Create or update documentation |
| Test | Add or improve test coverage |
| Design-UI | Implement or update visual design and UX flow |
| Spike | Research-only investigation to inform a decision (no implementation) |

## Exploration Scope per Type

### Bug

| Field | Why it matters |
|-------|---------------|
| Repro scenario | Can't explore the right code without knowing how to trigger the bug |
| Expected vs Actual behavior | Defines what "fixed" means |
| Affected code paths | Where to point the code-explorer agent |
| Root cause hypothesis | Research should attempt to identify the cause, not just document symptoms |
| Severity/impact | Determines research depth (light vs standard) |
| Related tests | Existing test coverage tells you what's already validated |

### Feature

| Field | Why it matters |
|-------|---------------|
| User goal | The underlying need — what problem this solves and for whom |
| User Stories | Explicit stories in "As a [user], I want [capability], so that [outcome]" form |
| Acceptance Criteria | Gherkin-format AC mapped to User Stories — verifiable conditions for done |
| Success criteria | What "done" looks like in testable terms |
| Non-goals | Explicit scope boundaries prevent over-exploration |
| Entry point | Where in the codebase this feature hooks in — critical for code-explorer |
| Existing patterns | Similar features already in the codebase that inform approach |
| External dependencies | Libraries, APIs, services needed — triggers web-researcher |
| Constraints | Performance, security, compatibility requirements |

### Change

| Field | Why it matters |
|-------|---------------|
| AS-IS behavior | What the system does today — baseline for understanding the delta |
| TO-BE behavior | What the system should do after — defines the change boundary |
| Reasoning | Why this change is needed — prevents reversals later |
| Affected modules | Which parts of the codebase are impacted — scopes exploration |
| Regression risk | What existing behavior could break — informs test strategy |
| Non-goals | What should NOT change — prevents scope creep during exploration |

### Improvement

| Field | Why it matters |
|-------|---------------|
| Current state | What the situation is today — either measured baseline OR qualitative description of the problem |
| Target state | What improvement looks like — either measurable goal OR quality attribute to enhance with rationale |
| Evidence | What supports the improvement need — profiling data, logical analysis, threat model, code smell pattern, or architectural concern |
| Non-goals | What behavior must NOT change — improvement shouldn't alter functionality |
| Affected code paths | Where to focus exploration based on evidence |
| Constraints | Budget, compatibility, or architectural limits on the approach |

### Refactoring

| Field | Why it matters |
|-------|---------------|
| Pain points | What's wrong structurally — why this code is hard to work with |
| Target structure | What the code should look like after — the refactoring goal |
| Behavior invariants | What must NOT change — the contract that refactoring preserves |
| Target files | Which files/modules to refactor — scopes code-explorer |
| Downstream dependents | What depends on the code being changed — identifies blast radius |
| Success criteria | How to verify the refactoring worked — e.g., "same tests pass, reduced cyclomatic complexity" |

### Security

| Field | Why it matters |
|-------|---------------|
| Vulnerability description | What the security issue is — CVE, advisory, or discovered weakness |
| Affected components | Which code, libraries, or services are exposed — scopes exploration |
| Threat model | Who could exploit this, how, and what's the impact — prioritizes severity |
| Remediation options | Known fixes, patches, or mitigation strategies — triggers web-researcher for advisories |
| Non-goals | Side-effects to avoid — e.g., "don't break backward compatibility for API consumers" |
| Verification method | How to confirm the vulnerability is resolved — e.g., scan passes, exploit no longer works |

### Task

| Field | Why it matters |
|-------|---------------|
| Deliverables | Specific, concrete outputs — what "done" produces |
| Definition of Done | How to verify completion — prevents ambiguous endpoints |
| Dependencies | What must exist before this task can start |
| Non-goals | What's explicitly out of scope — keeps chores bounded |
| Idempotency | Can this be safely re-run? — matters for migrations, scripts, ops tasks |

### Doc

| Field | Why it matters |
|-------|---------------|
| Target audience | Who will read this — developers, end users, operators? Determines depth and tone |
| Source material | Code, APIs, or systems to document — scopes what to explore |
| Doc location | Where the documentation lives or should live — existing docs site, README, wiki |
| Coverage scope | What to document and what to skip — prevents unbounded writing |
| Existing docs | What documentation already exists — avoids duplication, identifies gaps |

### Test

| Field | Why it matters |
|-------|---------------|
| Target code | What code needs test coverage — scopes exploration |
| Current coverage | What's already tested — identifies gaps vs. redundancy |
| Edge cases | Specific scenarios to cover — the core value of a Test ticket |
| Test strategy | Unit, integration, e2e, acceptance, or combination — affects approach selection |
| Existing test patterns | How the codebase already writes tests — conventions to follow |
| Non-goals | What NOT to test or rewrite — prevents scope creep into refactoring |

### Design-UI

| Field | Why it matters |
|-------|---------------|
| Design artifacts | Figma, mockups, wireframes, or textual specs — the source of truth for what to build |
| Interaction flow | Success, empty, error, and loading states — prevents incomplete implementations |
| Responsive requirements | Breakpoints, device targets — scopes how much to explore |
| Existing UI patterns | Component library, design tokens, styling conventions already in the codebase |
| Accessibility specs | WCAG level, aria requirements, keyboard navigation — non-negotiable constraints |
| Non-goals | What NOT to redesign — prevents scope creep into adjacent UI |

### Spike

| Field | Why it matters |
|-------|---------------|
| Research questions | Specific questions to answer — defines what "done" looks like |
| Decision criteria | How the findings will be evaluated — what makes one answer better than another |
| Time box | How much effort to invest — spikes without bounds become projects |
| Non-goals | No production code — the output is a decision or recommendation, not implementation |
| Reference material | Known starting points — docs, links, prior art to build from |

**Note:** For Spike tickets, the Research Report is the final deliverable. Skip
the "Handoff Notes for Plan" section — there is no Plan step.

## Field Status Rules

- `clear`: Specific and actionable information is present.
- `unclear`: Information exists but is ambiguous, inconsistent, or not actionable.
- `missing`: Required information is absent.

## Gap Handling

For each unresolved field at report time, record:
- `why_needed`: Why this field materially affects correctness, safety, or scope.
- `risk_if_missing`: What can go wrong if this field remains unresolved.
- `user_approved_risk`: Whether the user accepted the residual risk.
