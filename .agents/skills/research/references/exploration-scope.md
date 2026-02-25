# Exploration Scope by Ticket Type

Use this matrix to determine what information to gather during research.
After classifying the ticket type in Phase 1, load the corresponding exploration
scope. Each field should be resolved to `clear`, `unclear`, or `missing` during
Phases 2-3. Unresolved fields at ticket time must be documented as gaps with
risk decisions.

## Definition of Ready (DoR)

The exploration scope fields ARE the Definition of Ready checklist. A ticket is
"ready for planning" when:

- All **Required (R)** fields are `clear`
- All **Optional (O)** fields are `clear`, or have user-approved gaps with
  documented risk

If any Required field is not `clear`, the ticket CANNOT proceed to Plan.
No exceptions — escalate to the user.

Note: DoD population is a separate pre-write gate item checked in Phase 5
of SKILL.md, not part of the field-based DoR check.

## Definition of Done (DoD)

Each ticket type has a **DoD template** — baseline verification criteria that
always apply for that type. During research, the skill generates additional
**ticket-specific DoD criteria** based on discovered requirements.

The combined DoD (template + ticket-specific) travels downstream:
- **Plan** uses it to design verification steps
- **Implement** uses it to validate completion
- A ticket is "done" when ALL DoD criteria are verified

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
| Spike | Time-boxed uncertainty reduction — investigation that produces knowledge, prototypes, or recommendations (may include throwaway code, but no production code) |

### Spike Methods

Spike tickets require a **method** that determines their exploration scope and DoD:

| Method | When | Output |
|--------|------|--------|
| Technical-PoC | Evaluate feasibility of a technology or approach | Throwaway prototype + findings |
| Functional-PoC | Evaluate user interaction or requirements | Wireframe/mockup + stakeholder feedback |
| Experiment | Test a measurable hypothesis with controlled variables | Protocol, data, statistical analysis |
| Literature-Review | Survey existing knowledge to inform a decision | Annotated bibliography + synthesis |
| Data-Analysis | Analyze existing data to extract actionable insights | Dataset, analysis, conclusions |
| Methodology | Design or evaluate a research/measurement method | Protocol definition + validation |

## Exploration Scope per Type

### Bug

| Field | Req | Why it matters |
|-------|-----|---------------|
| Repro scenario | R | Can't explore the right code without knowing how to trigger the bug |
| Expected vs Actual behavior | R | Defines what "fixed" means |
| Affected code paths | R | Where to point the code-explorer agent |
| Root cause hypothesis | R | Research should attempt to identify the cause, not just document symptoms |
| Severity/impact | O | Determines research depth (light vs standard) |
| Related tests | O | Existing test coverage tells you what's already validated |

**DoD Template (Bug):**
- [ ] Root cause identified and documented
- [ ] Fix addresses root cause, not just symptoms
- [ ] Regression test added that reproduces the original bug
- [ ] Regression test passes with fix, fails without
- [ ] No unrelated behavior changes introduced
- [ ] Related existing tests still pass

### Feature

| Field | Req | Why it matters |
|-------|-----|---------------|
| User goal | R | The underlying need — what problem this solves and for whom |
| User Stories | R | Explicit stories in "As a [user], I want [capability], so that [outcome]" form |
| Acceptance Criteria | R | Gherkin-format AC mapped to User Stories — verifiable conditions for done |
| Success criteria | R | What "done" looks like in testable terms |
| Non-goals | R | Explicit scope boundaries prevent over-exploration |
| Entry point | R | Where in the codebase this feature hooks in — critical for code-explorer |
| Existing patterns | O | Similar features already in the codebase that inform approach |
| External dependencies | O | Libraries, APIs, services needed — triggers web-researcher |
| Constraints | O | Performance, security, compatibility requirements |
| Alternative approaches | O | Phase 4 requires 2-3 approaches — exploration must surface them |

**DoD Template (Feature):**
- [ ] All User Stories implemented
- [ ] All Acceptance Criteria (Gherkin) pass
- [ ] Success criteria met and verified
- [ ] Non-goals confirmed untouched
- [ ] Follows existing codebase patterns and conventions
- [ ] External dependencies integrated and documented
- [ ] No regressions in existing functionality

### Change

| Field | Req | Why it matters |
|-------|-----|---------------|
| AS-IS behavior | R | What the system does today — baseline for understanding the delta |
| TO-BE behavior | R | What the system should do after — defines the change boundary |
| Reasoning | R | Why this change is needed — prevents reversals later |
| Affected modules | R | Which parts of the codebase are impacted — scopes exploration |
| Regression risk | R | What existing behavior could break — informs test strategy |
| Non-goals | O | What should NOT change — prevents scope creep during exploration |
| Alternative approaches | O | Phase 4 requires 2-3 approaches — exploration must surface them |

**DoD Template (Change):**
- [ ] AS-IS behavior no longer present where specified
- [ ] TO-BE behavior verified in all affected modules
- [ ] Regression risk areas tested — no unintended breakage
- [ ] Non-goals confirmed untouched
- [ ] Downstream consumers of changed behavior updated or notified

### Improvement

| Field | Req | Why it matters |
|-------|-----|---------------|
| Current state | R | What the situation is today — either measured baseline OR qualitative description of the problem |
| Target state | R | What improvement looks like — either measurable goal OR quality attribute to enhance with rationale |
| Evidence | R | What supports the improvement need — profiling data, logical analysis, threat model, code smell pattern, or architectural concern |
| Non-goals | R | What behavior must NOT change — improvement shouldn't alter functionality |
| Affected code paths | O | Where to focus exploration based on evidence |
| Constraints | O | Budget, compatibility, or architectural limits on the approach |
| Alternative approaches | O | Phase 4 requires 2-3 approaches — exploration must surface them |

**DoD Template (Improvement):**
- [ ] Target state achieved (measured or demonstrated)
- [ ] Improvement verified against evidence baseline
- [ ] Non-goals confirmed untouched — no functional behavior changes
- [ ] No regressions in existing functionality
- [ ] Improvement is sustainable (not a temporary workaround)

### Refactoring

| Field | Req | Why it matters |
|-------|-----|---------------|
| Pain points | R | What's wrong structurally — why this code is hard to work with |
| Target structure | R | What the code should look like after — the refactoring goal |
| Behavior invariants | R | What must NOT change — the contract that refactoring preserves |
| Target files | R | Which files/modules to refactor — scopes code-explorer |
| Downstream dependents | O | What depends on the code being changed — identifies blast radius |
| Success criteria | O | How to verify the refactoring worked — e.g., "same tests pass, reduced cyclomatic complexity" |
| Alternative approaches | O | Phase 4 requires 2-3 approaches — exploration must surface structural alternatives |

**DoD Template (Refactoring):**
- [ ] Target structure achieved
- [ ] All behavior invariants preserved — same tests pass
- [ ] Downstream dependents unaffected or updated
- [ ] Pain points addressed (verified against original complaints)
- [ ] No new technical debt introduced

### Security

| Field | Req | Why it matters |
|-------|-----|---------------|
| Vulnerability description | R | What the security issue is — CVE, advisory, or discovered weakness |
| Affected components | R | Which code, libraries, or services are exposed — scopes exploration |
| Threat model | R | Who could exploit this, how, and what's the impact — prioritizes severity |
| Remediation options | R | Known fixes, patches, or mitigation strategies — triggers web-researcher for advisories |
| Verification method | R | How to confirm the vulnerability is resolved — e.g., scan passes, exploit no longer works |
| Non-goals | O | Side-effects to avoid — e.g., "don't break backward compatibility for API consumers" |
| Alternative approaches | O | Phase 4 requires 2-3 approaches — exploration must surface them |

**DoD Template (Security):**
- [ ] Vulnerability remediated per chosen approach
- [ ] Verification method executed — vulnerability no longer exploitable
- [ ] No new attack surface introduced
- [ ] Non-goals confirmed untouched
- [ ] Security advisory documented (if applicable)
- [ ] Dependent systems notified (if applicable)

### Task

| Field | Req | Why it matters |
|-------|-----|---------------|
| Deliverables | R | Specific, concrete outputs — what "done" produces |
| Completion criteria | R | How to verify task completion — prevents ambiguous endpoints |
| Dependencies | O | What must exist before this task can start |
| Non-goals | O | What's explicitly out of scope — keeps chores bounded |
| Idempotency | O | Can this be safely re-run? — matters for migrations, scripts, ops tasks |

**DoD Template (Task):**
- [ ] All deliverables produced
- [ ] Completion criteria met
- [ ] Dependencies satisfied before execution
- [ ] Non-goals confirmed untouched
- [ ] Idempotency verified (if applicable)

### Doc

| Field | Req | Why it matters |
|-------|-----|---------------|
| Target audience | R | Who will read this — developers, end users, operators? Determines depth and tone |
| Source material | R | Code, APIs, or systems to document — scopes what to explore |
| Doc location | R | Where the documentation lives or should live — existing docs site, README, wiki |
| Coverage scope | R | What to document and what to skip — prevents unbounded writing |
| Existing docs | O | What documentation already exists — avoids duplication, identifies gaps |

**DoD Template (Doc):**
- [ ] Documentation written for target audience (appropriate depth and tone)
- [ ] All coverage scope items addressed
- [ ] Documentation placed in correct location
- [ ] No contradictions with existing docs
- [ ] Technical accuracy verified against source material
- [ ] Reviewed for clarity and completeness

### Test

| Field | Req | Why it matters |
|-------|-----|---------------|
| Target code | R | What code needs test coverage — scopes exploration |
| Current coverage | R | What's already tested — identifies gaps vs. redundancy |
| Edge cases | R | Specific scenarios to cover — the core value of a Test ticket |
| Test strategy | R | Unit, integration, e2e, acceptance, or combination — affects approach selection |
| Existing test patterns | O | How the codebase already writes tests — conventions to follow |
| Non-goals | O | What NOT to test or rewrite — prevents scope creep into refactoring |

**DoD Template (Test):**
- [ ] All identified edge cases covered
- [ ] Tests follow existing test patterns and conventions
- [ ] Tests pass consistently (no flakiness)
- [ ] Coverage gaps addressed per test strategy
- [ ] Non-goals confirmed untouched — no refactoring disguised as testing
- [ ] Test names clearly describe what they verify

### Design-UI

| Field | Req | Why it matters |
|-------|-----|---------------|
| Design artifacts | R | Figma, mockups, wireframes, or textual specs — the source of truth for what to build |
| Interaction flow | R | Success, empty, error, and loading states — prevents incomplete implementations |
| Responsive requirements | O | Breakpoints, device targets — scopes how much to explore |
| Existing UI patterns | O | Component library, design tokens, styling conventions already in the codebase |
| Accessibility specs | O | WCAG level, aria requirements, keyboard navigation — non-negotiable constraints |
| Non-goals | O | What NOT to redesign — prevents scope creep into adjacent UI |

**DoD Template (Design-UI):**
- [ ] Design artifacts faithfully implemented
- [ ] All interaction states handled (success, empty, error, loading)
- [ ] Responsive requirements met at specified breakpoints
- [ ] Existing UI patterns and design tokens used consistently
- [ ] Accessibility specs met (keyboard nav, aria, WCAG level)
- [ ] Non-goals confirmed untouched — no adjacent UI changes
- [ ] Visual review approved by stakeholder

### Spike

Spike tickets require selecting a **method** during Phase 1. Each method has its
own exploration scope and DoD. The method determines what "done" looks like.

**Common fields (all Spike methods):**

| Field | Req | Why it matters |
|-------|-----|---------------|
| Research questions | R | Specific questions to answer — defines what "done" looks like |
| Decision criteria | R | How findings will be evaluated — what makes one answer better than another |
| Time box | R | How much effort to invest — spikes without bounds become projects |
| Method | R | Which of the 6 methods applies — determines scope and DoD |
| Non-goals | R | No production code — output is knowledge, prototypes, or recommendations (throwaway PoC code is acceptable for Technical-PoC and Functional-PoC methods) |
| Reference material | O | Known starting points — docs, links, prior art to build from |

**Spike handling rules (authoritative — referenced from SKILL.md):**
- The ticket IS the final deliverable. There is no Plan step.
- The ticket hands off directly to the user for a decision.
- Exception: Technical-PoC and Functional-PoC MAY hand off to Plan — but ONLY
  if the PoC validates the approach AND the user explicitly decides to proceed.
- Omit "Handoff Notes for Plan" unless handing off to Plan per the exception.

#### Spike Method: Technical-PoC

| Field | Req | Why it matters |
|-------|-----|---------------|
| Technology/approach to evaluate | R | What's being tested — specific library, framework, pattern, or architecture |
| Feasibility criteria | R | What "works" means — performance thresholds, compatibility, integration effort |
| Integration context | O | How the PoC relates to the existing system — what it must connect to |
| Known risks | O | Anticipated failure modes — what could make this infeasible |

**DoD Template (Spike: Technical-PoC):**
- [ ] Throwaway prototype demonstrates the approach
- [ ] Feasibility criteria evaluated with evidence
- [ ] Research questions answered with findings
- [ ] Go/no-go recommendation with rationale
- [ ] Integration risks documented
- [ ] Time box respected

#### Spike Method: Functional-PoC

| Field | Req | Why it matters |
|-------|-----|---------------|
| User interaction to evaluate | R | What user behavior or workflow is being tested |
| Evaluation method | R | How feedback will be gathered — walkthrough, survey, observation |
| Target users/stakeholders | R | Who will evaluate the prototype |
| Fidelity level | O | How realistic the prototype needs to be — wireframe vs. interactive mockup |

**DoD Template (Spike: Functional-PoC):**
- [ ] Prototype/wireframe/mockup produced at specified fidelity
- [ ] Stakeholder feedback gathered via evaluation method
- [ ] Research questions answered with findings
- [ ] Usability issues documented
- [ ] Recommendation for next steps with rationale
- [ ] Time box respected

#### Spike Method: Experiment

| Field | Req | Why it matters |
|-------|-----|---------------|
| Hypothesis | R | Testable claim in "If X, then Y" form — defines what's being tested |
| Variables | R | Independent (what you change), dependent (what you measure), controlled (what stays fixed) |
| Protocol | R | Step-by-step procedure to execute the experiment — must be reproducible |
| Success/failure criteria | R | Statistical or practical thresholds for accepting/rejecting the hypothesis |
| Data collection method | O | How data will be gathered and stored |
| Sample size / iterations | O | How many runs or data points are needed for confidence |

**DoD Template (Spike: Experiment):**
- [ ] Protocol executed as specified
- [ ] Data collected per data collection method
- [ ] Statistical/practical analysis completed
- [ ] Hypothesis accepted or rejected with evidence and confidence level
- [ ] Research questions answered with findings
- [ ] Threats to validity documented
- [ ] Results reproducible (protocol + data available)
- [ ] Time box respected

#### Spike Method: Literature-Review

| Field | Req | Why it matters |
|-------|-----|---------------|
| Search scope | R | Databases, sources, and keywords to search — bounds the review |
| Inclusion/exclusion criteria | R | What makes a source relevant or irrelevant — prevents unbounded reading |
| Synthesis goal | R | What the review should produce — comparison matrix, best-practice summary, gap analysis |
| Recency requirements | O | How recent sources must be — e.g., "last 3 years" or "seminal works of any age" |

**DoD Template (Spike: Literature-Review):**
- [ ] Search executed across specified scope
- [ ] Sources evaluated against inclusion/exclusion criteria
- [ ] Annotated bibliography produced (source, relevance, key findings)
- [ ] Synthesis produced per synthesis goal
- [ ] Research questions answered with findings
- [ ] Knowledge gaps identified
- [ ] Source quality assessed (authority, currency, consensus)
- [ ] Time box respected

#### Spike Method: Data-Analysis

| Field | Req | Why it matters |
|-------|-----|---------------|
| Dataset description | R | What data exists, where it lives, format and size — scopes the analysis |
| Analysis questions | R | Specific questions the data should answer — focuses the work |
| Analysis method | R | Statistical, exploratory, comparative, or other — determines tools and approach |
| Data quality concerns | O | Known issues with the data — missing values, biases, staleness |
| Visualization needs | O | What charts, plots, or reports are expected |

**DoD Template (Spike: Data-Analysis):**
- [ ] Dataset accessed and validated
- [ ] Data quality issues documented and handled
- [ ] Analysis executed per specified method
- [ ] Analysis questions answered with evidence
- [ ] Research questions answered with findings
- [ ] Visualizations produced (if specified)
- [ ] Conclusions supported by data (not speculation)
- [ ] Limitations and caveats documented
- [ ] Time box respected

#### Spike Method: Methodology

| Field | Req | Why it matters |
|-------|-----|---------------|
| Methodology goal | R | What the methodology should measure, evaluate, or produce — its purpose |
| Domain constraints | R | Rules, standards, or norms the methodology must satisfy |
| Validation approach | R | How to verify the methodology works — pilot study, expert review, comparison to existing |
| Existing methodologies | O | Known approaches to compare against or build upon |

**DoD Template (Spike: Methodology):**
- [ ] Methodology defined with clear steps, inputs, and outputs
- [ ] Domain constraints satisfied
- [ ] Validation executed per specified approach
- [ ] Comparison to existing methodologies documented (if applicable)
- [ ] Research questions answered with findings
- [ ] Strengths and limitations documented
- [ ] Methodology is reproducible by others
- [ ] Time box respected

## Field Status Rules

- `clear`: Specific and actionable information is present.
- `unclear`: Information exists but is ambiguous, inconsistent, or not actionable.
- `missing`: Required information is absent.

For **Required (R)** fields:
- `clear` → ready
- `unclear` or `missing` → BLOCKS readiness. Must be resolved or escalated.

For **Optional (O)** fields:
- `clear` → ready
- `unclear` or `missing` → document as gap with risk decision. Does NOT block
  readiness if user approves the risk.

## Gap Handling

For each unresolved field at ticket time, record:
- `why_needed`: Why this field materially affects correctness, safety, or scope.
- `risk_if_missing`: What can go wrong if this field remains unresolved.
- `user_approved_risk`: Whether the user accepted the residual risk.

Required fields with unresolved gaps that the user insists on skipping must be
explicitly recorded as **risk overrides** — the user is accepting the risk that
planning may fail or produce incomplete results.
