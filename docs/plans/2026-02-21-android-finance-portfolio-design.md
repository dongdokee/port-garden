# Android Financial Portfolio App Design

## 1. Intent And Scope

- Intent category: `behavioral-change:new-feature`
- Critical user journey (CUJ):
  - User syncs holdings across stock, ETF, and crypto accounts.
  - User checks current allocation against target allocation.
  - User runs rebalancing and receives buy/sell guidance.

### User Story
As an investor, I want to see my current portfolio allocation and get concrete rebalancing buy/sell guidance, so that I can manually execute trades to match my target allocation.

### Non-Goals (V1)

- In-app order execution (automatic or semi-automatic)
- Real-time tick data
- Cloud account sync across devices
- Multi-broker rollout beyond initial connectors

## 2. Product Requirements (Validated)

1. Data source strategy: API-first integration
2. Market scope: Korea-first
3. Rebalancing output: Guidance only
4. Target allocation setup: User-entered
5. Price data: Delayed quotes
6. Rebalancing cost model: Trading fees only
7. System boundary: Android app only (no backend)
8. API permission model: Read-only keys only
9. Rebalancing trigger: Manual only
10. User data storage: Local encrypted storage only
11. Initial integrations: 1 brokerage + 1 crypto exchange
12. Initial targets: Kiwoom Securities + Upbit

## 3. Recommended Approach

Use clean architecture with adapter-separated integrations.

- `Presentation`: Screens for portfolio, target allocation, and rebalancing results
- `Domain`: Allocation validation, rebalancing calculator, fee handling, rounding rules
- `Data`: Connector clients, normalization mappers, local encrypted persistence, cache
- `Use Cases`: `SyncHoldings`, `CalculateRebalancing`, `SaveTargetAllocation`
- `Connector Adapters`: `KiwoomAdapter`, `UpbitAdapter` implementing shared interfaces

### Why This Approach

- Keeps critical math logic independent from API and UI volatility
- Enables connector replacement/expansion with localized code changes
- Improves testability of CUJ-critical paths

## 4. Architecture And Components

### Core Domain Models

- `AssetType`: `STOCK`, `ETF`, `CRYPTO`
- `Holding`: symbol, quantity, averagePrice, currency, marketValue
- `TargetAllocationItem`: symbol (or bucket), targetWeightPercent
- `PortfolioSnapshot`: holdings + quote timestamp + source metadata
- `RebalancingAction`: symbol, side(BUY/SELL), quantity, amount, estimatedFee

### Layer Responsibilities

- Presentation layer
  - Renders sync state, allocation charts, and rebalancing actions
  - Collects user target weights
- Domain layer
  - Validates target weights sum to 100%
  - Computes current vs target deltas
  - Applies fee model and instrument rounding constraints
- Data layer
  - Pulls holdings from Kiwoom and Upbit read APIs
  - Normalizes provider-specific responses into shared domain models
  - Stores encrypted keys/settings/snapshots locally

## 5. Data Flow

1. User taps `Sync`.
2. `SyncHoldings` calls Kiwoom and Upbit connectors with read-only keys.
3. Responses are normalized into common holdings.
4. Delayed quotes are attached to update market value.
5. Snapshot is written to encrypted local storage.
6. User edits target allocation and taps `Calculate Rebalancing`.
7. `CalculateRebalancing` computes buy/sell guidance by delta and fee model.
8. UI shows guidance only (quantity and amount), with no execution endpoint.

### Runtime Rules

- Rebalancing runs only on explicit user action.
- If network fails, app falls back to last successful snapshot in read-only mode.
- If one connector fails, continue with partial data and explicit source-level error messages.

## 6. Error Handling And Security

### Security

- Store API credentials using Android Keystore-backed encryption.
- Reject non-read-only credentials at onboarding/validation.
- Mask API key material in UI and logs.

### Error Handling

- Connector isolation: Kiwoom and Upbit failures handled independently.
- Quote fallback: if quote refresh fails, show cached values and `last updated` timestamp.
- Validation guards:
  - target weights must total 100%
  - no negative or NaN quantities
  - type-specific minimum order unit and decimal precision

### User Disclosure

Always show: "Rebalancing guidance only. Place actual orders in your brokerage/exchange app."

## 7. Testing Strategy

### Unit Tests (Domain)

- Allocation sum and boundary validation
- Rebalancing math with and without fee impact
- Rounding and minimum-order constraints by instrument type

### Contract Tests (Adapters)

- Kiwoom/Upbit response-to-domain normalization
- Error mapping for auth errors, rate limits, and timeouts

### Integration Tests (Use Cases)

- `SyncHoldings` -> encrypted persistence -> `CalculateRebalancing` flow
- Partial failure scenarios with deterministic outputs

### UI Tests

- Sync status and last-updated rendering
- Target allocation editing and validation messages
- Rebalancing result list rendering and error-state behavior

### V1 Exit Criteria

- Domain unit tests for calculation logic pass
- Minimum integration scenarios for Kiwoom + Upbit pass
- CUJ UI flows for sync and manual rebalancing pass

## 8. Open Risks And Mitigations

- API policy variability by provider
  - Mitigation: isolate provider-specific auth and error handling inside adapters
- Delayed quote timing mismatch across sources
  - Mitigation: show per-source timestamps and stale-data warnings
- App-only architecture constraints for secret management and key rotation
  - Mitigation: strict Keystore use and reduced key scope (read-only only)

## 9. Next Step

Create an implementation plan with small TDD-first tasks and explicit file paths before coding.
