# Research Ticket

## Context
- **Type**: Feature
- **Depth**: Deep
- **Objective**: Design and scope the addition of automated email notifications to users whose subscription is expiring in 7 days and 1 day, from a codebase that has no existing notification infrastructure.

---

## Problem Statement

Users whose subscriptions are about to expire receive no advance warning, which causes involuntary churn when they miss the renewal window. The system has no email service, no template engine, and no scheduled notification dispatch mechanism. Delivering this feature requires introducing at minimum three new capabilities — an outbound email transport, a scheduled job that identifies at-risk users, and an idempotency mechanism to prevent duplicate sends — none of which are greenfield-safe to skip or defer without a deliberate, documented decision.

---

## Definition of Ready

| Field | Req | Status | Evidence |
|-------|-----|--------|----------|
| User goal | R | clear | Paying users need T-7 and T-1 warnings before `subscriptionExpiresAt` to avoid involuntary service interruption. Stated in sprint ticket. |
| Current behavior | R* | clear | N/A — no notification system exists. `src/services/logger.ts` writes to stdout only. No email path of any kind confirmed by codebase search. |
| Target behavior | R | clear | Cron job queries users approaching expiry; sends plain-text email at exactly T-7 days and T-1 day; each warning sent once per user per window. |
| Acceptance criteria | R | unclear | No test environment, sandbox SMTP, idempotency spec, or bounce-handling requirement defined. Promoted to `unclear` (not `missing`) because reasonable defaults exist — see Open Questions. Approved to proceed with documented defaults. |
| Entry point | R | unclear | `src/jobs/runner.ts` described in scenario as existing cron runner (data cleanup tasks only). File not present in repo at time of research (fictional/not-yet-created). Job registration mechanism unknown. Gap-approved: implementer will inspect runner on checkout and add a new job file following the existing cleanup job pattern. |
| Regression risk | O | clear | Entirely new code path. No existing notification surface to regress. Risk is low — confined to new files. |
| Existing patterns | O | missing | No email service, no template engine, no queue, no notification-adjacent service in `src/services/`. Only relevant file is `src/services/logger.ts` (stdout). Gap noted: implementer must establish patterns from scratch. |
| External dependencies | O | missing | No SMTP library (nodemailer or equivalent) present. No email provider configured. Gap noted: dependency selection and credential provisioning are open questions (see below). |
| Constraints | O | missing | No SMTP credentials, rate limits, bounce-handling policy, or unsubscribe compliance requirement defined. Gap noted: legal (CAN-SPAM / GDPR unsubscribe link) is a risk if skipped. |
| Non-goals | O | clear | In-app notifications, push notifications, Slack/webhook delivery, HTML email templates, a full queuing system, and a transactional email dashboard are all explicitly out of scope for this sprint per tech lead guidance. |

- **All Required clear?** No. Two Required fields are `unclear`: `acceptance criteria` and `entry point`. Both have been gap-approved for this ticket with the risks documented below.
- **Gaps with approved risk:**
  - `acceptance criteria` unclear — implementer should adopt defaults: sandbox SMTP for dev, idempotency via a boolean flag column (`expiryWarning7DaySentAt`, `expiryWarning1DaySentAt` timestamps) on the user record, integration test via nodemailer test account. Risk: without explicit AC, QA cannot sign off without negotiation.
  - `entry point` unclear — `src/jobs/runner.ts` not present in repo at research time. Risk: job registration mechanism may require changes beyond adding a new job file; runner may not support multiple jobs or scheduled intervals.
  - `existing patterns` missing — implementer establishes new patterns. Risk: inconsistent conventions with future notification work.
  - `external dependencies` missing — no library or provider chosen. Risk: credential provisioning and library selection take time that competes with sprint deadline.
  - `constraints` missing — no compliance requirements confirmed. Risk: shipping without an unsubscribe mechanism may violate CAN-SPAM / GDPR for transactional-adjacent emails.
- **Ready for Plan?** Yes, with gap-approved risks. Implementation should not begin until SMTP credentials are confirmed available and the runner's job registration mechanism is inspected.

---

## Definition of Done

- [ ] Target behavior implemented and verified: email is dispatched at T-7 days and T-1 day before `subscriptionExpiresAt` for all qualifying users
- [ ] All acceptance criteria pass (see Open Questions for defaults to ratify)
- [ ] Each warning is sent exactly once per user per window — no duplicate sends on repeated cron execution
- [ ] No regression in existing cron job behavior (`src/jobs/runner.ts` cleanup tasks unaffected)
- [ ] Follows codebase conventions established by existing job files
- [ ] SMTP transport is configurable via environment variable (not hardcoded credentials)
- [ ] Email contains user-identifiable context (name, expiry date) and at minimum a plain-text link to renew
- [ ] Unit test: user query returns correct users in each window
- [ ] Integration test: mock SMTP confirms email is sent with correct recipient and subject
- [ ] Idempotency test: running the job twice does not send duplicate emails
- [ ] Code reviewed and merged before sprint close

---

## Codebase Findings

| File | Purpose | Key Lines |
|------|---------|-----------|
| `src/services/logger.ts` | Stdout-only logger — only service in `src/services/`. Confirms absence of any email or notification abstraction. | N/A — file referenced in scenario; not present in repo at research time |
| `src/db/models/user.ts` | User model containing `subscriptionExpiresAt` field. ORM and field type unknown. | N/A — file referenced in scenario; not present in repo at research time |
| `src/jobs/runner.ts` | Cron runner — handles data cleanup tasks. Entry point for new notification job. Job registration pattern unknown. | N/A — file referenced in scenario; not present in repo at research time |

**Gap summary:** All three files named in the scenario are absent from the repository at the time of this research (`/home/dd/port-garden/src/` does not exist). The codebase contains only documentation, skill definitions, and third-party references under `refs/`. The findings above are sourced from the scenario description, not from live file reads. This is recorded explicitly — the implementer must verify all three files exist and read them before writing a line of code.

---

## External Research

No live web research performed for this ticket. The following are established external facts relevant to the approach:

- **nodemailer** (https://nodemailer.com): de facto Node.js SMTP library. Supports SMTP, SMTP-SES, and test accounts via Ethereal (https://ethereal.email) for dev/CI sandboxing with zero credential risk. MIT license. No vendor lock-in.
- **CAN-SPAM Act**: Transactional emails (account status) are exempt from opt-out requirements but must include a physical mailing address and honest subject lines. Renewal reminders may blur the transactional/commercial boundary — legal review recommended before shipping.
- **GDPR Article 6(1)(b)**: Sending subscription expiry notices is defensible as "necessary for the performance of a contract" — no separate consent required, but the email must not be used for marketing.
- **Nodemailer test accounts** (Ethereal): `nodemailer.createTestAccount()` provisions a free throwaway SMTP account that captures outbound mail without delivering it. Appropriate for CI and dev environments.

---

## Chosen Approach

**Approach A — New cron job with direct nodemailer SMTP send**

Add a new job file (e.g., `src/jobs/subscriptionExpiryNotifier.ts`) that:
1. Queries the user model for records where `subscriptionExpiresAt` is within [now+6d, now+7d] and `expiryWarning7DaySentAt IS NULL`, and separately within [now, now+1d] and `expiryWarning1DaySentAt IS NULL`.
2. For each qualifying user, sends a plain-text email via nodemailer using SMTP credentials from environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`).
3. On successful send, stamps the user record with the sent timestamp (`expiryWarning7DaySentAt` or `expiryWarning1DaySentAt`) to guarantee idempotency.
4. Registers this job in `src/jobs/runner.ts` on a daily schedule (or twice-daily for margin).

**Why chosen:**
- Directly follows the tech lead's direction: minimal infrastructure, no vendor contract, immediate deliverability.
- Idempotency via timestamp columns is simple, inspectable, and requires no queue infrastructure.
- nodemailer is the established zero-dependency SMTP option for Node.js; Ethereal provides a free sandbox for dev/CI.
- Keeps new code in the existing jobs directory, following whatever conventions `runner.ts` already establishes.
- Reversible and replaceable: once a proper email service (Approach B) is ready, the transport layer can be swapped without touching the job logic.

**Risk acknowledged at this depth:** The job registration mechanism in `runner.ts` is unknown. If the runner uses a static import list, adding a new job is trivial. If it uses a plugin registry or dynamic loading, there may be a non-trivial registration contract to satisfy.

---

## Rejected Approaches

**Approach B — Third-party email platform (SendGrid / Postmark / AWS SES)**
- What: Replace the SMTP transport with an API client to a managed email delivery service.
- Why considered: Better deliverability, built-in bounce/unsubscribe handling, analytics, and HTML template management.
- Why rejected: Requires vendor contract, credential provisioning, and potentially billing approval — none of which can be completed within the current sprint. Adds a hard external dependency before the feature has been validated.
- Revisit if: The happy-path SMTP approach reaches a deliverability problem in production, or when templating becomes a requirement.

**Approach C — Event-driven notification on subscription record update**
- What: Fire a notification event whenever `subscriptionExpiresAt` is written, compute the delay, and schedule a future send.
- Why considered: Low latency, no polling overhead, closer to a "proper" event-driven architecture.
- Why rejected: Requires a durable job scheduler or message queue (Bull, BullMQ, pg-boss, etc.) — significant infrastructure that does not exist and cannot be introduced safely in one sprint. Also fails for existing users already approaching expiry who never trigger a future write event.
- Revisit if: A job queue is introduced for other reasons and the team wants to consolidate notification dispatch into an event bus.

---

## Anti-Patterns

- **Do not hardcode SMTP credentials** — all transport configuration must come from environment variables. Credentials in source code constitute a security incident.
- **Do not send without idempotency** — a cron job that runs daily without idempotency will send duplicate emails on every execution. The timestamp-column approach must be implemented before the job is deployed to any environment with real users.
- **Do not skip the compliance minimum** — even transactional emails must include a sender address and honest subject line under CAN-SPAM. Shipping a raw SMTP send without these fields risks legal exposure.
- **Do not run against production SMTP in development** — use Ethereal or a local mail catcher (Mailhog, MailPit). Accidental sends to real users during testing are a support incident.
- **Do not treat "happy path only" as license to omit error handling** — if the SMTP send fails, the job must log the failure (via `src/services/logger.ts`) and continue processing other users rather than crashing the entire cron run. Silent failures leave users unnotified with no audit trail.
- **Do not expand scope to templating this sprint** — HTML templates, template engines (Handlebars, MJML), and a template management system are the next natural evolution but are explicitly deferred. Plain text is the correct output for this ticket.

---

## Scope Boundaries

- **In scope:**
  - New job file: `src/jobs/subscriptionExpiryNotifier.ts` (or equivalent)
  - Registration of the new job in `src/jobs/runner.ts`
  - Two new timestamp columns on the user model: `expiryWarning7DaySentAt`, `expiryWarning1DaySentAt` (and the associated migration)
  - Plain-text email content: subject, body with user name and expiry date, renewal link placeholder
  - nodemailer as SMTP transport library
  - Environment variable configuration for SMTP transport
  - Unit and integration tests for the job and idempotency logic
  - Error logging via existing `src/services/logger.ts`

- **Out of scope:**
  - HTML email templates or a template engine
  - A message queue or durable job scheduler
  - In-app, push, or Slack notifications
  - Email open/click tracking
  - Unsubscribe preference management
  - Third-party email API integration (SendGrid, Postmark, SES)
  - Notifications for any event other than subscription expiry
  - Admin dashboard or reporting on sent notifications
  - Retry logic beyond what nodemailer provides natively (deferred to a future queue-based approach)

---

## Open Questions

1. **What SMTP credentials are available, and for which environments?** — Determines whether the feature can be deployed beyond dev this sprint. Without production SMTP credentials, the job cannot send real emails. Suggested default: use Ethereal for dev/CI; block deployment to staging/production until credentials are provisioned. *Needs answer from infrastructure/ops before deployment.*

2. **What is the job registration contract in `src/jobs/runner.ts`?** — Unknown until the file is read. If it is a static list of imports with a `schedule` export, adding the new job is trivial. If it is a discovery-based system, there may be a convention to follow. *Needs answer on first day of implementation.*

3. **What ORM is used for `src/db/models/user.ts`, and how are migrations managed?** — The two new timestamp columns require a migration. If the project uses Prisma, the migration is `prisma migrate dev`. If it uses Sequelize or TypeORM, migration tooling differs. *Needs answer before touching the user model.*

4. **What is the canonical renewal URL to include in the email?** — The email body needs a link. Without a confirmed URL, use a placeholder (`{{RENEWAL_URL}}`). *Needs answer from product before final copy review.*

5. **Has legal reviewed the email copy for CAN-SPAM / GDPR compliance?** — Even transactional emails have minimum legal requirements (physical address, honest subject). Suggested default: include `[Company Name] — [Physical Address]` footer and route through legal review before first production send. *Needs answer before production deployment.*

6. **Should the T-7 window be exactly 7 days (e.g., query within [now+6d23h, now+7d1h]) or calendar-day-aligned?** — A strict window risks missing users if the cron runs slightly late. Suggested default: query users where `subscriptionExpiresAt` is between `now + 6 days` and `now + 8 days` for the 7-day send, to give the job a 24-hour tolerance window. Same principle for T-1. *Implementer decision; document chosen window in code.*

---

## Handoff Notes

- **Starting point:** `src/jobs/runner.ts` — read this file first to understand job registration, scheduling mechanism, and conventions before creating the new job file. Then read `src/db/models/user.ts` to confirm the `subscriptionExpiresAt` field name, type, and ORM in use.
- **Patterns to follow:** Mirror the structure of existing cleanup jobs in `src/jobs/`. Use `src/services/logger.ts` for all error and audit logging. Follow whatever module export convention `runner.ts` expects for job registration.
- **Known risks:**
  - SMTP credentials may not be provisioned for staging/production before the sprint ends — the job may be merged but remain inert in upper environments.
  - The runner's scheduling mechanism may not support per-job cron expressions; it may run all jobs on a single global interval. If so, the notification logic must be self-contained in its own timestamp-gating logic (which the idempotency column approach already provides).
  - The user model migration adds columns — if other migrations are in flight, there may be a merge conflict in the migration history.
  - Sprint deadline pressure is a risk to the idempotency implementation. The timestamp-column approach must ship with the job; deploying the job without idempotency is worse than not deploying the job at all.
- **Complexity:** High — not because any individual piece is complex, but because this is fully greenfield infrastructure (new transport, new job, new schema changes) with no existing patterns to follow, and a sprint deadline that creates pressure to skip correctness safeguards. The idempotency constraint and the unknown `runner.ts` registration mechanism are the two highest implementation risks.
