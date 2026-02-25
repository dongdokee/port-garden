# Research Ticket: Performance Regression in GET /inventory

## Metadata
- **Type:** Bug (Regression)
- **Status:** Research Complete
- **Date:** 2026-02-27
- **Depth:** Standard

## Problem Statement
The `GET /inventory` endpoint has experienced a significant performance regression, increasing from a known-good response time of 200ms to approximately 2.1s following Wednesday's deployment.

### Expected vs Actual Behavior
- **Expected:** Response time < 250ms (consistent with historical baseline of 200ms).
- **Actual:** Response time ~2.1s (10x degradation).

### Repro Scenario
1. Deploy the current refactored version of the service.
2. Execute a GET request to the `/inventory` endpoint.
3. Observe the `X-Response-Time` header or use a timing tool to confirm the 2s+ delay.

## Research Findings
The regression was traced to a recent refactor (Commit ID: [REDACTED]) where high-level orchestration logic was modified.

### Root Cause Analysis
The original implementation utilized `Promise.all` to fetch inventory data from multiple downstream services in parallel. During the refactor, these parallel calls were replaced with sequential `await` statements. This caused the total latency to become the sum of all downstream request times rather than the maximum of the slowest request.

### Affected Code Paths
- `GET /inventory` controller/handler.
- Underlying service orchestration logic where sequential `await` calls are made for independent data sources.

## Proposed Approach
### Restore Parallelism (Primary)
Revert the sequential `await` calls back to `Promise.all` (or equivalent parallel orchestration). This restores the original performance profile while maintaining the structural improvements of the refactor.

**Trade-offs:**
- **Pros:** Immediate restoration of performance; low risk of side effects.
- **Cons:** Requires careful error handling within `Promise.all` to ensure one failed service doesn't unnecessarily tank the entire request (unless that was the previous behavior).

## Definition of Done (DoD)
- [ ] Root cause identified and documented (Completed)
- [ ] Sequential awaits reverted to `Promise.all` or similar parallel pattern
- [ ] Performance regression test added (timing check for `/inventory`)
- [ ] Regression test passes (< 300ms) with fix, fails without
- [ ] All existing unit/integration tests for inventory pass
- [ ] No unrelated structural or behavioral changes introduced

## Non-goals
- General refactoring of the inventory service beyond restoring performance.
- Optimization of individual downstream service response times.
- Introducing new caching layers at this stage.
