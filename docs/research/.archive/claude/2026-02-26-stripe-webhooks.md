# Research Ticket

## Context
- **Type**: Feature
- **Depth**: Deep
- **Objective**: Design the integration of Stripe webhook events into the application so that payment lifecycle events (`checkout.session.completed`, `invoice.payment_failed`, `customer.subscription.updated`) drive downstream system state — fulfillment records, subscription status, and transactional notifications.

**Depth rationale**: Greenfield on multiple axes simultaneously. No HTTP server exists to receive webhooks. No payment record model exists. No email or notification service exists. No existing patterns in the application codebase to follow. The feature is cross-cutting: it requires creating infrastructure (HTTP endpoint), a data layer (payment model), and an outbound service (email notification) all from zero.

---

## Problem Statement

The application has no mechanism to receive or act on Stripe payment events. When a customer completes checkout, fails a payment, or changes their subscription, the application has no awareness of these events. This means:

- Successful checkouts cannot trigger order fulfillment or confirmation.
- Failed payments cannot trigger recovery flows or access revocation.
- Subscription changes cannot be reflected in user entitlements or records.

The business cannot support a payments-driven product lifecycle until these events flow reliably into application state. This ticket defines what "done" looks like before any implementation begins.

---

## Definition of Ready

| Field | Req | Status | Evidence |
|-------|-----|--------|----------|
| User goal | R | Clear | Business needs to react to Stripe payment lifecycle events to fulfill orders, handle payment failures, and track subscription state changes in real time |
| Current behavior | R | Clear | No payment event processing exists anywhere in the codebase. No HTTP server, no payment model, no email service found at `/home/dd/port-garden/src/` (directory does not exist). System has zero awareness of Stripe events. |
| Target behavior | R | Clear | Three Stripe event types handled: `checkout.session.completed` creates a fulfillment record; `invoice.payment_failed` logs failure and sends user notification; `customer.subscription.updated` updates subscription state in the data layer. |
| Acceptance criteria | R | Clear | See section below |
| Entry point | R | Gap — approved risk | No HTTP server, no router, no routes directory, and no `src/` application directory exist. The entry point must be created. Gap documented; implementer must decide HTTP framework and server entrypoint before work begins. This is a pre-implementation decision that blocks coding but not research. |
| Regression risk | O | N/A | Greenfield — no existing payment or notification code to regress |
| Existing patterns | O | Gap | No application source files exist to establish patterns. Framework, ORM, and email library choices are open decisions. |
| External dependencies | O | Clear | Stripe SDK (`stripe` npm package), Stripe webhook signature verification (`stripe.webhooks.constructEvent`), chosen HTTP framework, chosen email delivery service |
| Constraints | O | Partial | Stripe requires webhook signature verification on every inbound request. Secret must be stored in environment config, not source. Event processing must be idempotent (Stripe may redeliver). |
| Non-goals | O | Clear | Retry logic for failed email sends, webhook event replay UI, Stripe dashboard configuration, multi-tenancy, and billing portal integration are out of scope. |

- **All Required clear?** No — entry point is a gap. All other Required fields are clear.
- **Gaps with approved risk:** Entry point gap is accepted. The implementer must select and establish an HTTP server before this feature can be coded. This decision should be made in the planning session and recorded as a constraint before work begins.
- **Ready for Plan?** Yes, with the entry point decision as the first planning action item.

### Acceptance Criteria

1. A POST endpoint at a configurable path (e.g. `/webhooks/stripe`) receives raw request bodies and validates the `Stripe-Signature` header using `stripe.webhooks.constructEvent` with the webhook signing secret from environment config. Requests with invalid signatures return HTTP 400 and are not processed.
2. On `checkout.session.completed`: a payment record is created in the data layer with at minimum `stripeSessionId`, `customerId`, `amount`, `currency`, `status: "completed"`, and `createdAt`. The record is written before the endpoint responds HTTP 200.
3. On `invoice.payment_failed`: a payment failure record is created (or the existing record is updated) with `status: "failed"` and `failureReason`. A transactional notification email is sent to the customer email address present in the Stripe event payload. The endpoint responds HTTP 200 regardless of email delivery success (email failure must not cause a 5xx that triggers Stripe retry).
4. On `customer.subscription.updated`: the subscription record for the customer is updated to reflect the new `status`, `currentPeriodEnd`, and `planId` from the Stripe event. If no subscription record exists, one is created.
5. All three handlers are idempotent: re-delivering the same event ID produces no duplicate records and no duplicate emails.
6. Unrecognized event types are acknowledged with HTTP 200 and logged; they do not cause errors.
7. Integration tests exist for each of the three event types using Stripe test fixture payloads with valid signatures.

---

## Definition of Done

- [ ] Target behavior implemented and verified against all 7 acceptance criteria above
- [ ] All acceptance criteria pass with automated tests (unit + integration)
- [ ] Signature verification tested for both valid and invalid signatures
- [ ] Idempotency tested: replaying each event type produces no side-effect duplication
- [ ] Regression risk areas tested (N/A — greenfield, but existing test suite must remain green)
- [ ] Follows codebase patterns once established (HTTP framework, ORM, email service chosen in planning)
- [ ] Webhook signing secret loaded from environment config, not hardcoded
- [ ] No regressions in existing functionality

---

## Codebase Findings

| File | Purpose | Key Lines |
|------|---------|-----------|
| (none) | No application source directory exists at `/home/dd/port-garden/src/` | — |
| (none) | `src/payments/webhooks.ts` referenced in scenario — does not exist | — |
| (none) | `src/db/models/payment.ts` referenced in scenario — does not exist | — |
| (none) | `src/services/email.ts` referenced in scenario — does not exist | — |
| `/home/dd/port-garden/docs/research/evals/feature.md` | Eval scenario definition — confirms this is Scenario 1 of the research skill eval suite | Lines 1–49 |

**Exploration summary**: Searched for `*.ts`, `*.js`, `*.json` files, and patterns matching `payment`, `webhook`, `stripe`, `email`, `subscription`, `billing`, `route`, `router`, `server`, `app.post`, `app.get` across the entire `/home/dd/port-garden` tree. All matches belong exclusively to `refs/oh-my-claudecode` (a Claude tooling reference project) or `refs/rpikit`/`refs/superpowers`/`refs/hyperpowers` (other reference projects). None of these are the application under development. The application `src/` directory is entirely absent.

---

## External Research

**Stripe webhook verification**: Stripe requires raw request body (not parsed JSON) for `stripe.webhooks.constructEvent`. Express/Fastify must be configured with a raw body parser on the webhook route specifically.

**Stripe event types in scope**:
- `checkout.session.completed` — fired when a Checkout Session transitions to paid. Key fields: `id`, `customer`, `amount_total`, `currency`, `metadata`.
- `invoice.payment_failed` — fired when a payment attempt on an invoice fails. Key fields: `customer`, `customer_email`, `attempt_count`, `next_payment_attempt`.
- `customer.subscription.updated` — fired when any subscription attribute changes. Key fields: `customer`, `status`, `current_period_end`, `items.data[0].price.id`.

**Idempotency**: Stripe guarantees at-least-once delivery. Event IDs (`event.id`) should be stored and checked before processing to prevent duplicate side effects.

**Signature verification secret**: Must use `STRIPE_WEBHOOK_SECRET` from environment. Different secrets exist for test mode and live mode — must not mix.

---

## Chosen Approach

**Approach A: Dedicated webhook module within a new HTTP server layer**

Create a minimal HTTP server (Express or Fastify) as the application entry point. Register a single route `POST /webhooks/stripe` with a raw-body middleware scoped only to that route. Implement a dispatcher function that receives a verified `Stripe.Event` and routes to one of three handler functions, each responsible for its own data layer write and optional notification trigger. The payment model and email service are created as standalone modules with narrow interfaces.

**Trade-offs**:
- Cleanest separation of concerns: verification, dispatch, and handling are independent units
- Each handler is independently testable with fixture payloads
- Raw body requirement is isolated to one route, not global middleware
- Requires creating HTTP server infrastructure from scratch (expected given greenfield state)
- Slightly more files to create initially, but avoids entangling concerns

This approach is selected because it matches the likely future shape of the application (more routes will exist) and makes the three handlers independently testable and reviewable.

---

## Rejected Approaches

**Approach B: Single monolithic handler function**

All event processing in one function with a large switch statement, no separate handler modules. Simpler initial code, but makes testing, error isolation, and future extension harder. Rejected because the three event types have meaningfully different side effects that warrant separation.

**Approach C: Serverless function (AWS Lambda / Vercel function)**

Deploy the webhook handler as a standalone function rather than within an HTTP server. Eliminates server management overhead. Rejected at this stage because: (a) the deployment target is unknown, (b) it would make the handler harder to co-locate with the rest of the application's data layer, and (c) it is a premature infrastructure decision before the application's deployment model is established. Can be revisited if the application architecture moves in that direction.

---

## Scope Boundaries

**In scope:**
- HTTP endpoint to receive Stripe webhook POST requests
- Stripe signature verification on every request
- Handler for `checkout.session.completed` — create payment record
- Handler for `invoice.payment_failed` — create/update payment record, send email notification
- Handler for `customer.subscription.updated` — create/update subscription record
- Idempotency via event ID deduplication
- Environment-based webhook secret configuration
- Unit and integration tests for all three handlers

**Out of scope:**
- Stripe dashboard configuration (webhook endpoint registration)
- Retry logic for failed email delivery
- Webhook event replay or administrative UI
- Any Stripe event types beyond the three listed
- Billing portal, customer portal, or subscription management UI
- Multi-tenancy or per-tenant Stripe account support
- Refund or dispute handling

---

## Open Questions

1. **HTTP framework**: Express, Fastify, or another? This decision must be made before implementation begins and recorded as an ADR or equivalent. It determines middleware patterns for the rest of the application.

2. **ORM / database**: What database and ORM will the payment and subscription models use? No database layer exists. This must be decided before the data model can be designed.

3. **Email delivery service**: Which service (SendGrid, Resend, SES, SMTP, etc.)? The `src/services/email.ts` interface shape depends on this choice.

4. **Event ID deduplication store**: Should processed event IDs be stored in the primary database or in a separate cache (Redis)? Answer affects the payment/subscription schema design.

5. **Prototype status**: A prototype was reportedly built and tested in Stripe test mode. What is its status — should it be treated as a reference implementation, discarded, or reviewed? It must not be promoted to production without the planning process completing first.

6. **Demo / VP presentation**: The scenario mentions a VP demo in 90 minutes. This research ticket is not a demo artifact. The demo should use Stripe test mode against the prototype in an isolated environment, explicitly labeled as a prototype, not production-ready code. The ticket governs what gets built for production.

---

## Handoff Notes

- **Starting point**: No application source code exists. The implementer must initialize the project structure (HTTP server entry point, directory layout, package.json with dependencies) before any feature code can be written. This is the first action item for the planning session.
- **Patterns to follow**: None established yet. The HTTP framework, ORM, and email library chosen in planning become the patterns for this and all future features.
- **Known risks**:
  - Raw body requirement for Stripe signature verification is a common integration mistake. Must be explicitly handled in middleware configuration, not assumed.
  - Idempotency is not optional — Stripe will redeliver events. A missing deduplication check will cause duplicate payment records and duplicate emails in production.
  - Test mode vs. live mode webhook secrets are different. CI/CD pipeline must use test secrets; production config must use live secrets.
  - The prototype's code must not be assumed to be correct or complete. It was built under time pressure without a design specification. It may not handle idempotency, error cases, or raw body parsing correctly.
- **Complexity**: Medium-High. Greenfield on three layers (HTTP, data, notification) simultaneously. The individual handler logic is straightforward once infrastructure is in place, but the infrastructure setup decisions have downstream consequences for the entire application.
