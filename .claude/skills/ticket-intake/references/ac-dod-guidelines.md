# AC and DoD Guidelines

Use this guide to prevent mixing user-facing acceptance with engineering completion checks.

## Acceptance Criteria (AC)

- Define user-observable outcomes.
- Derive from user stories.
- Express pass/fail behavior, not implementation detail.
- Prefer format: `AC-x (US-y): [observable behavior]`.

Examples:
- `AC-1 (US-1): User can view current allocation percentages for all tracked assets.`
- `AC-2 (US-1): System shows suggested buy/sell quantities to reach target allocation.`

## Definition of Done (DoD)

- Define engineering completion standards.
- Include test and reliability checks.
- Avoid numeric-only gates (for example, test count only).
- Use behavior and risk coverage.

Examples:
- Automated tests cover all ticket-defined edge cases.
- Automated tests cover success and failure paths for each core user story.
- Core invariants are validated (input validation, domain constraints, error handling).

## Classification Rules

- If the statement describes visible user behavior, classify as AC.
- If the statement describes implementation quality or process completion, classify as DoD.
- If the statement describes explicit exclusion or boundary, classify as Non-goals.
- If the statement describes environmental or policy limits, classify as Constraints.
