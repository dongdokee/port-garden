# Research Ticket: Subscription Expiration Email Notifications

## Metadata
- **Type:** Feature
- **Depth:** Deep
- **Topic:** Subscription Expiration Email Notifications
- **Status:** Research Complete

## Summary
Implement a "happy path" email notification system to warn users 7 days and 1 day before their subscription expires. The implementation will focus on speed and simplicity to meet the sprint deadline, using raw SMTP for delivery and integrating with the existing cron runner.

## Exploration Results

### Database Context
- **File:** `src/db/models/user.ts`
- **Field:** `subscriptionExpiresAt` (Date/Timestamp)
- **Insight:** Primary source for determining which users are approaching expiry.

### Execution Context
- **File:** `src/jobs/runner.ts`
- **Current State:** Handles only data cleanup.
- **Integration Plan:** Add a daily job to scan the user table for `subscriptionExpiresAt` values falling within the 7-day and 1-day windows.

### Notification Context
- **File:** `src/services/logger.ts`
- **Current State:** Standard output logging only.
- **Requirement:** New `src/services/emailService.ts` using raw SMTP (e.g., `nodemailer`) to send text-based warnings.

## Approach: Minimal SMTP Integration
1. **Service Layer:** Create `src/services/emailService.ts`. Use a basic SMTP client to send raw text emails. No template engine or queue system for this iteration.
2. **Job Integration:** Update `src/jobs/runner.ts` to include a `notifyExpiringSubscriptions` task. This task will:
    - Query users expiring in exactly 7 days.
    - Query users expiring in exactly 1 day.
    - Iterate and call the email service.
3. **Configuration:** Use environment variables for SMTP credentials (HOST, PORT, USER, PASS).

### Trade-offs
- **Pros:** Extremely fast to implement; meets "happy path" requirement; provides immediate value.
- **Cons:** No retry logic (queuing); difficult to scale to high volumes; hardcoded email text (no templates).

## Definition of Done (DoD)
- [ ] `src/services/emailService.ts` created with SMTP transport.
- [ ] Subscription check logic added to `src/jobs/runner.ts`.
- [ ] Notifications triggered correctly for 7-day and 1-day windows.
- [ ] Credentials managed via environment variables.
- [ ] Verification: Emails logged to `src/services/logger.ts` and sent successfully in development.

## Scope Boundaries (Non-goals)
- No email template engine (raw text only).
- No message queue or background worker (direct send from cron job).
- No notification history/audit log in DB.
- No "unsubscribe" or preference management in this iteration.

## Risks & Gaps
- **Cron Performance:** Scanning a large user table daily might become slow. Indexing `subscriptionExpiresAt` is recommended.
- **Delivery Reliability:** Without a queue, a failed SMTP connection will lose the notification.
