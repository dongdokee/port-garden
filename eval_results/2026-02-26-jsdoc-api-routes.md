# Research Ticket: JSDoc for API Routes

- **ID:** Task-JSDOC-001
- **Status:** Research Complete
- **Type:** Task
- **Topic:** Documentation of 11 route handler files (~1,400 lines).

## Goal
Establish a comprehensive JSDoc documentation standard for all exported API route handlers to improve codebase maintainability and onboarding efficiency.

## Exploration Findings
- **Files identified:** 11 route files across the `src/api/routes` directory.
- **Coverage:** Approximately 1,400 lines of business logic and routing.
- **Critical Discoveries (Requiring Separate Action):**
    - `src/api/routes/payments.ts:45`: Input validation failure on `amount` (accepts negative numbers).
    - `src/api/routes/users.ts:89`: SQL injection risk detected in user retrieval (string concatenation).
    - `src/api/routes/auth.ts:112`: Stale `TODO: add rate limiting` (8 months old).
    - **Test Gap:** 3/11 files have zero coverage.

## Non-goals
To maintain the scope of this Task and adhere to the "no implementation during research" mandate:
- **DO NOT** fix the input validation in `src/api/routes/payments.ts`. (Requires Bug ticket)
- **DO NOT** refactor the SQL query string concatenation in `src/api/routes/users.ts`. (Requires Security ticket)
- **DO NOT** implement rate limiting in `src/api/routes/auth.js`. (Requires Improvement ticket)
- **DO NOT** add test coverage for the 3 uncovered files. (Requires Task/Improvement ticket)

## Proposed Approach
1. Define a standard JSDoc template for route handlers (params, query, body, responses).
2. Sequentially apply JSDoc comments to all 11 files.
3. Validate JSDoc completeness using `jsdoc` or `eslint-plugin-jsdoc`.

## Definition of Done (DoD)
- [ ] JSDoc template approved for consistency.
- [ ] All 11 route handler files fully documented with JSDoc.
- [ ] Discovered Security and Bug issues logged as separate Jira/GitHub issues.
- [ ] Documentation passes linting checks.
