# Research Ticket: CircleCI to GitHub Actions Migration

## Summary
The goal is to migrate the existing CircleCI pipeline to a GitHub Actions workflow while maintaining parity in functionality across lint, test, build, and deploy stages.

## Intent
- **What:** Translate `.circleci/config.yml` to `.github/workflows/ci.yml`.
- **Why:** Team is migrating from CircleCI to GitHub Actions.
- **Type:** Task
- **Type Decision:** Chosen as Task because this is a bounded infrastructure migration operation with specific setup and verification steps.

## Depth Reasoning
**Depth:** Standard
**Reasoning:** While the commands are 1:1, the underlying platform mechanics (caching, secrets, runners) differ. A Standard depth ensures that secrets management and rollback strategies are explicitly planned rather than assumed.

## Fields

### Deliverables (Required)
- **GitHub Actions Workflow File:** A complete `.github/workflows/ci.yml` implementing the 4 identified stages.
- **Secrets Migration Plan:** Documentation for transferring `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to GitHub Repository Secrets.
- **Rollback / Parallel-Run Procedure:** A plan to run both pipelines in parallel to verify parity before final decommissioning of CircleCI.

### Completion Criteria (Required)
- **Stage Parity:** All 4 stages (lint, test, build, deploy) pass successfully in GitHub Actions.
- **Cache Efficiency:** `node_modules` caching is verified to work, reducing build times.
- **Deployment Success:** `aws s3 sync` succeeds using the migrated secrets.
- **Secrets Security:** Credentials are never exposed in logs and are correctly masked by GitHub.

### Dependencies (Optional)
- **Repository Admin Access:** Required to set up GitHub Secrets.
- **AWS IAM Verification:** Ensuring the current IAM user has permissions for the target S3 bucket from a GitHub runner.

### Non-goals (Optional)
- **Script Refactoring:** No changes to `npm run lint`, `npm test`, or `npm run build`.
- **OIDC Migration:** Staying with secret-based authentication for this phase.

## Approach Selection

### Proposed Approach: Idiomatic GitHub Actions Migration
- **Setup:** Use `actions/setup-node@v3` with built-in `npm` caching.
- **Deployment:** Use `aws-actions/configure-aws-credentials@v2` for secure AWS session management.
- **Rationale:** This approach leverages community-standard actions which provide better security, logging, and performance than manual script translation.

## Definition of Done (DoD)
- [ ] `.github/workflows/ci.yml` drafted and validated against requirements.
- [ ] Secrets migration plan documented.
- [ ] Rollback procedure documented.
- [ ] Completion criteria approved by Scrum Master.
- [ ] `[human]` Final sign-off on the migration strategy.
