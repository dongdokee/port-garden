# MRI Matrix

Use this matrix to evaluate ticket completeness after type approval.

## Ticket Types and Minimum Required Information

| Ticket Type | Purpose | Minimum Required Information (MRI) |
| --- | --- | --- |
| Bug | Identify, replicate, and resolve root cause | Context, Repro script, Expected vs Actual, Artifacts (Logs/Stack trace), Edge cases, Related paths |
| Feature | Architect and integrate a new functional module | Context, User goal, Acceptance Criteria (AC), Non-goals, Entry point, Edge cases, Design specs |
| Change | Safely transition existing logic to a new state | Context, AS-IS vs TO-BE, Reasoning, Non-goals, Regression suite, Edge cases, Impacted modules |
| Security | Mitigate vulnerabilities and harden the system | Context, CVE or ID, Affected lib, Non-goals (Side-effects), Remediation guide, Security policy or Scan report |
| Incident | Mitigate impact and document root cause (RCA) | Context (Impacted users), Severity, Timeline, Non-goals (Risk avoidance), Log or Metric paths, Mitigation scripts |
| Improvement | Optimize non-functional traits (no behavior change) | Context (Business value), Current baseline, Target goal, Non-goals, Profiling data, Benchmarking script |
| Task | Execute specific, idempotent operations | Context, Specific deliverables, Definition of Done (DoD), Non-goals, Idempotency check script |
| Tech-Debt | Refactor code to reduce complexity and risk | Context, Pain points, Non-goals (Logical changes), Refactoring standards, Target files, Success metrics |
| Design-UI | Implement or update visual consistency and UX flow | Context, Artifacts (Figma/Assets), Edge cases (Responsive), Lib path, Token variables, Accessibility specs |
| Test | Ensure reliability by covering edge cases | Context, Edge case descriptions, Non-goals (Logic rewrite), Existing suite path, Coverage goal |
| Doc | Update knowledge base for better onboarding | Context (Target audience), Non-goals (Out-of-scope files), Doc template or location, Source code to be documented |
| Spike | Gather technical evidence for decision-making | Context, Research questions, Non-goals (Production code), Success criteria for decision, Reference links |

## Field Status Rules

- `clear`: Specific and actionable information is present.
- `unclear`: Information exists but is ambiguous, inconsistent, or not actionable.
- `missing`: Required information is absent.

## Feature Interpretation Rules

- User Stories are required for Feature handoff and should operationalize `User goal`.
- Acceptance Criteria must map back to User Stories.
- DoD is separate from AC.
- Exclusion statements (for example, fee or tax not included) belong in `Non-goals` or `Constraints`, not AC.
- Avoid numeric-only quality gates. Use risk and behavior coverage for quality evidence.
- `Design specs` can be marked clear only when at least one is explicit:
  - linked design artifact (Figma or equivalent)
  - textual interaction flow with success, empty, and error states
  - concrete screen list with navigation transitions

## Remaining Gaps and Risk Decisions Rules

For each unresolved field, always record:
- `why_needed`: Why this field materially affects correctness, safety, or scope.
- `risk_if_missing`: What can go wrong if this field remains unresolved.
- `user_approved_risk`: Whether the user accepted the residual risk.
