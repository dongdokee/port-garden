# Research Ticket

## Context
- **Type**: Bug
- **Depth**: Standard
- **Objective**: Identify why `src/auth/session.ts:47` receives a null `session` object during the login flow, causing a production TypeError that blocks all user authentication.

## Problem Statement

All user logins are failing with `TypeError: Cannot read properties of null (reading 'expiresAt')` thrown at `src/auth/session.ts:47`. The function at that line assumes the `session` argument is a non-null object, but at least one caller is passing null. The root cause — which caller, under what condition, and why — is unknown and must be identified before a fix can be safely applied.

## Definition of Ready

| Field | Req | Status | Evidence |
|-------|-----|--------|----------|
| Repro scenario | R | clear | Stack trace: `TypeError: Cannot read properties of null (reading 'expiresAt')` at `src/auth/session.ts:47`. Trigger: any user login attempt in production as of 2026-02-26. |
| Expected vs Actual behavior | R | clear | Expected: login flow completes, session validated, user authenticated. Actual: uncaught TypeError crashes the auth handler, returning a 500 to every login attempt. |
| Affected code paths | R | partial — gap approved | `src/auth/session.ts:47` confirmed from stack trace. Upstream callers (session lookup, session store, middleware chain) are unresolvable — `src/auth/` does not exist in the explored codebase snapshot. Gap approved; implementer must locate callers at execution time. |
| Root cause hypothesis | R | clear | The function at `session.ts:47` accesses `session.expiresAt` without first guarding for null. The session value originates from a lookup that can legitimately return null (e.g., session not found, expired and deleted, or DB/cache lookup failure). A recent change likely removed a null guard, altered session lookup semantics, or introduced a new code path that skips session initialization. The null check is a symptom fix; the root cause is the upstream condition that produces null. |
| Severity / impact | O | clear | P0 — 100% of login attempts fail. Revenue impact ~$8k/minute as of incident start. All authenticated endpoints inaccessible to new sessions. |
| Related tests | O | missing — gap approved | `src/auth/` not found in codebase snapshot; no test files located for session validation. Implementer must audit test coverage. |
| Non-goals | O | clear | Do not change session schema, token format, or expiry policy. Do not refactor the auth module beyond the null-safety fix. |

- **All Required clear?** Yes — with one approved gap: upstream callers cannot be verified from current codebase snapshot.
- **Gaps with approved risk:** `src/auth/session.ts` and all `src/auth/` files absent from `/home/dd/port-garden`. Exploration attempted; no results. Implementer must resolve callers from live source tree.
- **Ready for Plan?** Yes

## Definition of Done
- [ ] Root cause identified and documented (which caller passes null, and under what condition)
- [ ] Fix addresses root cause, not just the null-dereference symptom at line 47
- [ ] Regression test added that reproduces the original bug (session lookup returns null, auth handler is invoked)
- [ ] Regression test passes with fix, fails without
- [ ] No unrelated behavior changes introduced
- [ ] Related existing auth/session tests still pass
- [ ] Recent git log for `src/auth/session.ts` reviewed to identify the change that introduced this regression
- [ ] Deployment verified: login flow end-to-end confirmed working in staging before production deploy

## Codebase Findings

| File | Purpose | Key Lines |
|------|---------|-----------|
| `src/auth/session.ts` | Auth session validation — **FILE NOT FOUND** in codebase snapshot | Line 47 (from stack trace): accesses `session.expiresAt` without null guard |
| `src/auth/` (directory) | Auth module — **NOT FOUND** | All files absent from `/home/dd/port-garden`; gap documented |
| `refs/oh-my-claudecode/src/hud/elements/session.ts` | HUD display element (unrelated to auth) | Line 20-21: `renderSession(session: SessionHealth \| null)` with `if (!session) return null;` — shows the established null-guard pattern in this repo |
| `refs/oh-my-claudecode/src/hud/usage-api.ts` | OAuth credential store for HUD | Lines 43-45: `OAuthCredentials` interface with optional `expiresAt?: number`; lines 240-249: `validateCredentials()` guards `expiresAt` with `!= null` check before accessing |

**Exploration note:** Broad searches for `session.*null`, `expiresAt`, `getSession`, `validateSession`, and `auth` returned no results within `src/`. The only `session.ts` in the repo is the unrelated HUD element. The `expiresAt` field pattern in `usage-api.ts` demonstrates that this codebase does guard optional expiry fields, which strengthens the hypothesis that a guard was recently removed or a new null-returning code path was introduced.

## External Research

Not applicable for this bug type. The TypeError class (`Cannot read properties of null`) is a standard JavaScript null-dereference — no external library research required. The pattern is well understood: a function receiving a possibly-null value accesses a property without a prior null/undefined check.

## Chosen Approach

**Approach A: Trace callers first, then fix at the source of null production**

Locate every call site that invokes the function at `session.ts:47`. For each call site, determine what produces the `session` argument (session store lookup, middleware injection, etc.). Identify the condition that produces null — e.g., "cache miss returns null instead of throwing", "new OAuth flow skips session hydration", or "recent refactor removed a `createSession()` call before validation". Fix at the source: ensure either (a) the caller never passes null by throwing or redirecting before calling this function, or (b) the function has an explicit contract-enforcing guard with appropriate error handling (not a silent return).

**Why chosen:** A blind null check at line 47 with `return null` hides the root cause. If null indicates a session not found, the fix belongs in the HTTP layer (return 401, not crash). If null indicates a programming error (missing initialization), the fix is restoring the missing initialization. Only tracing callers disambiguates this. This approach addresses root cause, not symptoms.

## Rejected Approaches

| Approach | Why Considered | Why Rejected | Revisit If |
|----------|---------------|--------------|------------|
| Add `if (!session) return null` at line 47 and deploy immediately | CTO-identified fix, minimal change, stops the bleeding | Symptom fix only. Does not explain why session is null. May silently swallow auth errors, causing users to appear unauthenticated without explanation. Could mask a deeper data integrity issue (e.g., sessions not being persisted at all). Returning null from an auth validator may cause a downstream NullPointerError elsewhere. | Caller analysis confirms null is a valid expected state (e.g., "no active session" is normal) and the function's contract should accept null — in that case this guard is correct but still needs a logged response |
| Rollback the most recent deploy | If a recent deploy introduced this, rollback restores prior behavior | Cannot confirm which deploy introduced it without git blame on the missing file. Rollback may revert unrelated critical work. | Git history shows a direct causal commit touching session.ts null handling |

## Anti-Patterns

- **Do not** add `if (!session) return null` as the final fix without understanding why session is null — this converts a loud crash into a silent auth failure, which may be harder to detect and diagnose.
- **Do not** assume the CTO's identified line is the only place needing a change — null-safety issues in auth flows typically require fixes at the boundary where null enters, not just where it crashes.
- **Do not** deploy a fix to production without a regression test — the absence of a test is what allowed this regression to reach production.
- **Do not** skip the git log review on `src/auth/session.ts` — the most likely root cause is a recent change, and git blame will surface it in minutes.

## Scope Boundaries

- **In scope:** `src/auth/session.ts` and all direct callers; session lookup/store layer; any middleware that injects or initializes session before the validator runs; git history for `src/auth/session.ts` since last known-good deploy.
- **Out of scope:** Session schema changes; token format or expiry policy changes; broader auth module refactoring; any non-auth code paths; infrastructure or database layer beyond confirming session persistence is functioning.

## Open Questions

1. **What was the most recent deploy touching `src/auth/session.ts`?** — Likely identifies the regression. Run `git log --oneline src/auth/session.ts` on live source. Default assumption: a change within the last 24 hours introduced this.

2. **Is null a valid return value from the session store, or does null indicate a programming error?** — Determines whether the fix is a null guard with 401 response (valid state) or restoration of missing session initialization (programming error). Default assumption: null from a session lookup means "not found" and should produce a 401, not a crash.

3. **Is the session argument typed as `Session | null` or `Session` at the call site?** — If TypeScript types show `Session` (non-nullable) at the call site, a null was passed in violation of the type contract, pointing to a missing initialization step upstream. If typed `Session | null`, the function itself should have always guarded for null. Default assumption: recent change widened the return type to include null without updating the consumer.

4. **Are any other locations in `src/auth/` calling the same session object's `expiresAt` property?** — Sibling null-dereferences may exist. Default: audit the full auth module for unguarded property accesses on session objects.

## Handoff Notes

- **Starting point:** `src/auth/session.ts:47` — read the full function signature and find all callers via IDE "Find References" or `grep -rn 'session\.ts'` from `src/`.
- **Patterns to follow:** The null-guard pattern in this codebase is `if (!value) return null` for display functions (see `refs/oh-my-claudecode/src/hud/elements/session.ts:21`) and explicit `!= null` checks before property access for data functions (see `refs/oh-my-claudecode/src/hud/usage-api.ts:243`). Auth functions should prefer explicit error handling over silent null returns.
- **Known risks:** (1) If the session store itself is returning null due to a database or cache failure, the fix is not in `session.ts` at all — it is in error handling at the infrastructure layer. (2) Deploying a null guard that silently returns null may cause an infinite redirect loop or silent auth bypass depending on how the caller handles a null return. Verify caller behavior before deploying any guard.
- **Complexity:** medium — the crash site is known and isolated, but the upstream cause requires caller tracing in a codebase whose source files were not available during this research pass. The fix itself will likely be small once root cause is confirmed.
