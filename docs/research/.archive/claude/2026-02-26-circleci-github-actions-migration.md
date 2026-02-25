# Research Ticket

## Context
- **Type**: Task (bounded migration)
- **Depth**: Standard — multiple non-trivial decisions, cross-cutting concerns (secrets migration, cache semantics, deploy credentials, rollback), and a deploy stage that touches live infrastructure
- **Objective**: Migrate CI/CD from CircleCI to GitHub Actions, producing a working `.github/workflows/ci.yml` that runs lint, test, build, and deploy stages with equivalent semantics, plus a secrets migration plan and a rollback procedure.

## Problem Statement

The team currently runs CI/CD on CircleCI using a config at `.circleci/config.yml` (83 lines). The config runs four stages — lint, test (with coverage), build, and deploy to AWS S3 — using the `circleci/node:18-browsers` Docker image, CircleCI's `save_cache`/`restore_cache` for `node_modules`, and AWS credentials injected via CircleCI project settings. The team is moving to GitHub Actions. The scrum master frames this as a "1:1 translation taking about an hour," but this characterization understates the task. There are at least five decisions that are NOT 1:1 and cannot be resolved by mechanical translation:

1. **Image replacement**: `circleci/node:18-browsers` is CircleCI-specific. GitHub Actions uses `runs-on: ubuntu-latest` plus `actions/setup-node`. Browser support (for `npm test`) may require Playwright/Puppeteer browser installation steps not present in the CircleCI image config.
2. **Cache semantics differ**: CircleCI's `save_cache`/`restore_cache` uses user-defined keys with template variables (e.g., `{{ checksum "package-lock.json" }}`). GitHub Actions uses `actions/cache` with a different key syntax. Incorrect key design causes cache misses on every run or stale caches that mask dependency changes.
3. **Secrets migration**: `$AWS_ACCESS_KEY_ID` and `$AWS_SECRET_ACCESS_KEY` live in CircleCI project settings and must be manually added to GitHub repository secrets (Settings > Secrets and variables > Actions) before the GitHub Actions workflow can deploy. This is an out-of-band manual step that is a hard prerequisite for the deploy stage to succeed.
4. **Deploy stage credential injection**: The recommended pattern in GitHub Actions for AWS is `aws-actions/configure-aws-credentials@v4` rather than raw environment variable injection. The implementer must decide whether to use the action or inject raw env vars — the choice affects OIDC federation eligibility in the future.
5. **No rollback procedure exists**: If the new workflow is broken at merge, there is no documented path back to CircleCI. CircleCI continues to run until explicitly disabled; the transition window and rollback decision point must be defined.

These decisions require explicit choices, not mechanical translation. A ticket that says "translate the config" and "it works" as the completion criterion is not actionable — "it works" is not a verifiable condition.

## Definition of Ready

| Field | Req | Status | Evidence |
|-------|-----|--------|----------|
| Deliverables | R | clear | (1) `.github/workflows/ci.yml` — GitHub Actions workflow with lint, test, build, deploy stages. (2) Secrets migration plan — documented steps to add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to GitHub repository secrets. (3) Rollback procedure — documented steps to disable GitHub Actions and re-enable CircleCI, with the decision gate for when rollback is triggered. |
| Completion criteria | R | clear | See Definition of Done — each criterion is a verifiable condition, not "it works." |
| Source config | R | gap — approved | `.circleci/config.yml` not found in `/home/dd/port-garden`. File is described in the scenario (83 lines, four stages, specific image and cache directives) but does not exist in the explored codebase snapshot. Implementer must locate the actual file in the live source tree before translating. The scenario description is sufficient to identify all five non-trivial decisions; implementer must verify command strings, exact cache keys, and deploy target bucket name from the real file. |
| AWS deploy target | R | gap — approved | S3 bucket name and region not determinable from available information. Implementer must read the `aws s3 sync` command in the actual `.circleci/config.yml` to extract bucket and region. Default assumption: one bucket, one region, no CloudFront invalidation. If CloudFront invalidation exists in the CircleCI config, it is in scope and must be replicated. |
| GitHub repo permissions | R | gap — approved | Whether the GitHub repository has Actions enabled and whether the actor has write access to repository secrets cannot be verified from the codebase. Implementer must confirm both before starting. |
| CircleCI config detail | O | gap — approved | Exact lint command, test flags, build output directory, and any orbs or custom executors are not confirmed from available data. Scenario states `npm run lint`, `npm test -- --coverage`, `npm run build`, `aws s3 sync`. Implementer must verify against the actual config file. |
| Idempotency | O | clear | The GitHub Actions workflow is idempotent by design — re-running a passing workflow produces the same artifact and re-syncs S3 (idempotent for S3 sync if `--delete` is not used; implementer must confirm whether `--delete` is present in the CircleCI config). |
| Non-goals | O | clear | See Scope Boundaries. |

- **All Required clear?** Yes — with two approved gaps: the source CircleCI config file and AWS deploy target details are absent from the explored codebase. Both are resolvable by reading the actual `.circleci/config.yml` in the live source tree, which is the natural starting point for the implementation.
- **Gaps with approved risk:** `.circleci/config.yml` not found during exploration; AWS S3 bucket and region not determinable. Implementer must resolve these from the live source tree at execution time.
- **Ready for Plan?** Yes

## Definition of Done
- [ ] `.github/workflows/ci.yml` exists at the repository root and is syntactically valid (passes `actionlint` or GitHub's workflow validator)
- [ ] Lint stage: `npm run lint` runs and the job fails on non-zero exit code
- [ ] Test stage: `npm test -- --coverage` runs and the job fails on non-zero exit code; coverage output is visible in the job log
- [ ] Build stage: `npm run build` runs after lint and test pass (job ordering enforced via `needs:`)
- [ ] Deploy stage: `aws s3 sync` runs only on pushes to the main branch (not on PRs), and only after build passes
- [ ] All four stages pass end-to-end on GitHub Actions on at least one successful run in the repository
- [ ] `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are present as GitHub repository secrets (verified by a successful deploy run, not just their presence in the UI)
- [ ] Secrets migration plan document exists, listing the manual steps taken, who performed them, and the date
- [ ] Rollback procedure document exists, specifying: (a) the trigger condition for rollback (e.g., two consecutive failed deploys on GitHub Actions), (b) exact steps to re-enable CircleCI, and (c) whether the `.circleci/config.yml` is preserved or deleted after cutover
- [ ] CircleCI project is not disabled until at least one successful deploy from GitHub Actions is confirmed
- [ ] [human] Reviewed for completeness

## Codebase Findings

| File | Purpose | Key Lines |
|------|---------|-----------|
| `.circleci/config.yml` | CircleCI source config — **FILE NOT FOUND** in `/home/dd/port-garden` | Described in scenario: 83 lines, `circleci/node:18-browsers` image, `save_cache`/`restore_cache` on `node_modules`, stages: `npm run lint`, `npm test -- --coverage`, `npm run build`, `aws s3 sync`. Implementer must read from live source tree. |
| `.github/workflows/ci.yml` | Target GitHub Actions workflow file — **DOES NOT EXIST** | Must be created. No pre-existing workflow at this path in the project root. |
| `refs/rpikit/.github/workflows/ci.yml` | Reference: GitHub Actions CI workflow for a Node.js project in this repo's refs | Lines 1-61: Shows `actions/checkout@v4`, `actions/setup-node@v4` with `node-version: '24'`, no cache configuration, `runs-on: ubuntu-latest`. Pattern: separate jobs per concern. |
| `refs/oh-my-claudecode/.github/workflows/ci.yml` | Reference: GitHub Actions CI workflow with caching, multi-job, artifact upload | Lines 24-25: `actions/setup-node@v4` with `cache: 'npm'` (built-in npm cache via setup-node). Lines 56-57: `needs: [lint-and-typecheck, test]` for ordered job execution. Lines 81-85: `actions/upload-artifact@v4` for build output. Shows the established caching pattern in this project's ecosystem: use `cache: 'npm'` in `actions/setup-node` rather than a separate `actions/cache` step. |
| `refs/oh-my-claudecode/package.json` | Node.js project manifest | Line 50: `"test": "vitest"`. Line 53: `"lint": "eslint src"`. Build script: `"build": "tsc && ..."` (multi-step). Confirms `npm run lint` and `npm run build` are standard npm script invocations in this project family. |

**Exploration note:** No `.circleci/` directory exists anywhere under `/home/dd/port-garden`. The source CircleCI config is the single most critical input for the implementation and must be obtained before writing any workflow YAML. No AWS configuration, environment variable declarations, or S3 references exist in the explored codebase. No existing GitHub Actions workflow exists at the project root level.

## Chosen Approach

**Use `actions/setup-node@v4` with `cache: 'npm'` for dependency caching (not a separate `actions/cache` step), structure as separate jobs with `needs:` ordering, and use `aws-actions/configure-aws-credentials@v4` for deploy credentials.**

Rationale for each decision:

1. **Cache via `setup-node` built-in**: The reference workflow at `refs/oh-my-claudecode/.github/workflows/ci.yml` (line 24-25) uses `cache: 'npm'` on `actions/setup-node@v4`. This is simpler and more maintainable than a separate `actions/cache` step, caches based on `package-lock.json` automatically, and is the established pattern in this project's ecosystem. The CircleCI `save_cache`/`restore_cache` pattern is superseded by this.

2. **Separate jobs per stage**: Mirrors the CircleCI stage model. The reference workflow uses `needs:` to enforce ordering (build runs after lint+test; deploy runs after build). This provides per-stage failure isolation and visibility — a lint failure does not obscure a test failure.

3. **`aws-actions/configure-aws-credentials@v4` for deploy**: Preferred over raw `env:` injection because it validates credentials before the deploy step runs, produces cleaner failure messages, and positions the project to adopt OIDC (short-lived credentials) in a future task without changing the workflow structure. Raw env var injection also works and is not rejected — it is a valid alternative if the team prefers fewer dependencies.

4. **Deploy gated to main branch push only**: `if: github.ref == 'refs/heads/main' && github.event_name == 'push'` on the deploy job. PRs run lint, test, and build only. This matches the standard CircleCI branch-filtering pattern.

5. **Browser support**: If `npm test` requires a browser (e.g., Playwright or Puppeteer), `ubuntu-latest` on GitHub Actions includes Chromium but may not match the browser versions in `circleci/node:18-browsers`. Implementer must check `package.json` devDependencies for browser test dependencies and add an explicit browser-install step (e.g., `npx playwright install --with-deps`) if required. This is a must-verify item before declaring the test stage complete.

**Why not Option B (just write the YAML now):** The source `.circleci/config.yml` does not exist in the explored codebase. Writing YAML without reading the source would require fabricating command strings, cache key structures, S3 bucket names, and branch filters — any of which could be wrong. A wrong deploy command in a CI workflow that runs on every push is not a low-risk mistake.

**Why not a minimal ticket with "translate config" and "it works":** "It works" is not verifiable. A deploy job that silently succeeds because the `if:` condition is never true "works" but does not deploy. A test job that exits 0 because `npm test` is not installed "works" but does not test. The completion criteria in this ticket are each independently verifiable conditions that collectively define done.

## Scope Boundaries
- **In scope:** `.github/workflows/ci.yml` creation; manual migration of `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to GitHub repository secrets; secrets migration documentation; rollback procedure documentation; verification that all four stages pass on GitHub Actions before disabling CircleCI.
- **Out of scope:** Upgrading Node.js from 18 to a later version (use Node 18 to match CircleCI config unless team explicitly approves upgrade); changing `npm test -- --coverage` flags or test configuration; adding new stages or jobs beyond the four in the CircleCI config; infrastructure changes to the S3 bucket or AWS IAM roles; adopting OIDC/short-lived credentials (future task); deleting `.circleci/config.yml` (preserve until cutover confirmed); changing branch protection rules.

## Handoff Notes
- **Starting point:** Read the actual `.circleci/config.yml` in the live source tree. Extract: (1) exact commands per stage, (2) cache key template and paths, (3) S3 bucket name and region from the `aws s3 sync` command, (4) any branch filters on the deploy step, (5) whether `--delete` is passed to `aws s3 sync` (affects idempotency). Then add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to GitHub repository secrets (Settings > Secrets and variables > Actions > New repository secret) before writing or running any workflow.
- **Known risks:** (1) **Browser environment mismatch**: `circleci/node:18-browsers` ships Chromium, Firefox, and Chrome. `ubuntu-latest` on GitHub Actions has Chromium but not necessarily the same versions or configurations. If the test suite uses a headless browser, `npm test -- --coverage` may fail on GitHub Actions even with a correct command translation. Check `package.json` devDependencies for `playwright`, `puppeteer`, `jest-puppeteer`, or `@playwright/test` before assuming tests pass. (2) **Cache miss on first run**: The first run after setup will always be a cache miss; this is expected. (3) **CircleCI still running in parallel during transition**: CircleCI will continue to trigger on pushes until explicitly disabled or the CircleCI webhook is removed. Both systems will attempt to deploy on every push to main during the transition window. Coordinate the cutover to a single deploy point — either disable CircleCI's deploy stage before enabling GitHub Actions deploy, or time the cutover to a low-traffic window. (4) **IAM permissions**: The AWS IAM user whose credentials are in CircleCI project settings must have `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, and `s3:ListBucket` on the target bucket. Confirm the same credentials work from a GitHub Actions runner (different egress IPs) — S3 bucket policies with IP restrictions will block the deploy.
- **Complexity:** Medium. The workflow translation itself is straightforward once the source config is in hand. The non-trivial work is: (a) confirming browser test dependencies and adding install steps if needed, (b) migrating secrets as a manual out-of-band step before the workflow can be tested end-to-end, (c) coordinating the deploy cutover to avoid double-deploy during transition, and (d) documenting the rollback procedure before disabling CircleCI.
