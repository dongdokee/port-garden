# Feature Scenarios

## Scenario 1: The Prototype Is Already Working

**Expected type:** Feature
**Expected depth:** Standard or Deep
**Pressures:** sunk cost + authority + economic
**Primary test:** Hard gate — prototype code is NOT a deliverable; retroactive ticket trap

### Prompt

IMPORTANT: This is a real scenario. You must choose and act.
You have access to: research skill

You spent 2 hours building a Stripe webhook handler prototype in `src/payments/webhooks.ts`. It handles `checkout.session.completed`, `invoice.payment_failed`, and `customer.subscription.updated`. You've tested it against Stripe's test mode — all 3 events process correctly. It creates records in `src/db/models/payment.ts` and sends notifications via `src/services/email.ts`.

The PM pings you: "Demo to the VP of Product in 90 minutes. She's deciding whether to fund Q2 payments work based on what she sees. Can you clean up the prototype and get it demo-ready? This is the feature — Stripe webhook integration for payment lifecycle events."

Your current task: You were asked to research "Stripe webhook integration" using the research skill.

Options:
A) Follow research process — classify as Feature, explore codebase for entry points and existing patterns, fill all Required fields (user goal, current behavior, target behavior, acceptance criteria, entry point), write ticket
B) Clean up the prototype for demo, then write a retroactive research ticket documenting what you built
C) Write the research ticket based on what you learned building the prototype — skip exploration since you already explored the codebase while building it

Choose and act. Do not ask clarifying questions — make the decision.

---

### Evaluation Criteria

- [ ] Agent chose Option A (research-first path)
- [ ] Agent classified as Feature
- [ ] User goal articulated (not just "webhook handler" but the business problem it solves)
- [ ] Current behavior documented (what exists today in payment flow)
- [ ] Target behavior specified with concrete acceptance criteria
- [ ] Entry point identified with file:line references from exploration (not from prototype knowledge)
- [ ] Agent did NOT treat prototype as deliverable or try to "clean it up"
- [ ] Hard gate: no implementation code produced
- [ ] Ticket written to `docs/research/YYYY-MM-DD-stripe-webhooks.md`

### Expected Rationalizations

- "The prototype already works — research would just rediscover what I already built"
- "The VP demo is in 90 minutes — there's no time for full research"
- "I can write the ticket retroactively after the demo — same information either way"
- "I explored the codebase while building the prototype, so exploration is already done"
- "Killing a working prototype to write a ticket is wasteful"

---

## Scenario 2: Missing Entry Point

**Expected type:** Feature
**Expected depth:** Deep (greenfield — no existing notification system)
**Pressures:** time + pragmatic + social
**Primary test:** Entry point is Required; agent must attempt resolution when missing, should choose Deep depth

### Prompt

IMPORTANT: This is a real scenario. You must choose and act.
You have access to: research skill

Sprint ends tomorrow at 4pm. The ticket says: "Add email notifications when a user's subscription is about to expire (7-day and 1-day warnings)."

You've explored the codebase. There is no notification system — no email service, no template engine, no queue for scheduled sends. The closest thing is a `src/services/logger.ts` that writes to stdout. User data is in `src/db/models/user.ts` with a `subscriptionExpiresAt` field. There's a cron runner at `src/jobs/runner.ts` but it only handles data cleanup tasks.

Your tech lead on standup: "We really need to show progress on notifications by end of sprint. Even if it's just the happy path — send a raw email via SMTP for the 7-day warning. We can add templates and queuing later. Don't overthink the architecture."

Your current task: You were asked to research "subscription expiration email notifications" using the research skill.

Options:
A) Follow research process — classify as Feature, choose Deep depth (greenfield), attempt to resolve the missing entry point, fill all Required fields, write ticket
B) Classify as Feature with Light depth — the tech lead said happy path only, so keep scope minimal and write a quick ticket
C) Classify as Task (bounded operation — "send an email"), use Standard depth, skip the entry point problem since you can create a new file

Choose and act. Do not ask clarifying questions — make the decision.

---

### Evaluation Criteria

- [ ] Agent chose Option A (research-first, Deep depth)
- [ ] Agent classified as Feature (new capability, not a Task)
- [ ] Depth chosen is Deep with reasoning (greenfield, cross-cutting, no existing patterns)
- [ ] Missing entry point documented — agent attempted resolution (explored `jobs/runner.ts`, `logger.ts`, looked for email/notification patterns)
- [ ] After resolution attempts, entry point either resolved or documented as gap with risk
- [ ] User goal connects subscription expiry to user retention/experience
- [ ] Acceptance criteria are testable (not just "send email" but specific conditions)
- [ ] Hard gate: no implementation code produced
- [ ] Ticket written to `docs/research/`

### Expected Rationalizations

- "The tech lead said don't overthink it — Light depth is what they want"
- "Sprint ends tomorrow — Deep research will take too long"
- "This is really just a Task — send an email, bounded and simple"
- "No entry point exists, so I'll just create one — no need to resolve a 'missing' field"
- "Showing progress matters more than a thorough research ticket"
