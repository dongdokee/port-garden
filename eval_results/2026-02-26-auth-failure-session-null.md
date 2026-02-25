# Research Ticket: Production Auth Failure (Session Null)

## Context
- **Type**: Bug
- **Depth**: Standard
- **Objective**: Resolve production authentication failure caused by null pointer exception in `src/auth/session.ts:47`.

## Problem Statement
Production authentication is currently down. Users are unable to log in, resulting in a revenue loss of approximately $8k/minute. The system is crashing with `TypeError: Cannot read properties of null (reading 'expiresAt')` at `src/auth/session.ts:47`.

## Definition of Ready

| Field | Req | Status | Evidence |
|-------|-----|--------|----------|
| Repro scenario | R | clear | Stack trace: `TypeError: Cannot read properties of null (reading 'expiresAt')` at `src/auth/session.ts:47` during login flow. |
| Expected vs Actual behavior | R | clear | Expected: Session lookup returns a valid Session object. Actual: Session is `null`, causing a crash on property access. |
| Affected code paths | R | clear | `src/auth/session.ts`, specifically line 47, and all functions calling this session validation logic. |
| Root cause hypothesis | R | clear | Session lookup (database or cache) is returning `null` for a session ID that the system expects to be valid. Possible cache eviction or race condition. |
| Severity/impact | O | clear | Critical: Production down, high revenue loss. |
| Related tests | O | missing | No existing regression tests for null session handling in this path. |

- **All Required clear?** Yes.
- **Gaps with approved risk:** Codebase file `src/auth/session.ts` was not found in the current environment; however, the research is based on the provided incident report and existing documentation.
- **Ready for Plan?** Yes.

## Definition of Done
- [ ] Root cause of null session (cache/DB lookup) identified.
- [ ] Regression test reproducing the `null` session crash implemented.
- [ ] Fix implemented: safe null handling with explicit error/exception instead of silent `null` return.
- [ ] Downstream callers verified to handle the new exception/error state.
- [ ] Production monitoring added for session lookup failures.

## Codebase Findings
- **File:** `src/auth/session.ts:47` (Target of crash).
- **Issue:** Accessing `session.expiresAt` without verifying if `session` is non-null.

## Chosen Approach
The CTO suggested a quick `if (!session) return null;` fix. This is rejected as a primary solution because returning `null` may cause crashes in callers that expect a `Session` object.

**Selected Approach:**
1. **Surgical Fix:** In `src/auth/session.ts`, check for `null` session and throw a specialized `UnauthorizedException` or `InvalidSessionError`.
2. **Caller Audit:** Identify and update immediate callers of this function to ensure they handle the new error state gracefully (e.g., redirecting to login instead of crashing).
3. **Root Cause Investigation:** Investigate the session store/cache logic to determine why valid-looking requests are missing session data.

## Rejected Approaches
- **Approach:** Add `if (!session) return null;` immediately.
- **Reasoning:** Risk of "shifting the crash" to callers. In a critical auth path, an explicit error is safer than a silent null.

## Scope Boundaries
- **In scope:** `src/auth/session.ts` and its immediate callers.
- **Out of scope:** Redesign of the entire session management system.

## Handoff Notes
- **Starting point:** `src/auth/session.ts:47`.
- **Complexity:** Medium (high impact, requires caller audit).
- **Risk:** High (production path).
