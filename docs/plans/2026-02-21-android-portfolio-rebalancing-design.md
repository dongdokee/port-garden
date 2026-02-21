# Android Portfolio Rebalancing App V1 Design

Date: 2026-02-21
Status: Approved
Scope: V1 design (implementation not started)

## 1. Intent and CUJ

- Intent category: `behavioral-change:new-feature`
- Critical User Journey:
  1. User enters holdings (manual input or CSV upload).
  2. User sees current allocation in KRW.
  3. User sets target weights by ticker.
  4. App calculates rebalance actions with fees.
  5. User reviews buy/sell guidance (no in-app execution).

## 2. Requirements

### User story
As an individual investor, I want to compare current allocation with target allocation and see ticker-level buy/sell guidance, so I can rebalance my portfolio.

### In scope (V1)
- Android app
- Asset coverage: Korean/US stocks and ETFs, major cryptocurrencies
- Data input: manual input + CSV upload
- Market data: external API integration (prices + FX)
- Base currency: KRW only
- Target model: ticker-level target weights
- Rebalancing logic: fee-inclusive calculation
- Output: guidance only (no order placement)

### Out of scope (V1)
- Broker/exchange account auto-sync and direct order APIs
- Tax impact modeling
- Minimum order-size constraints

## 3. Acceptance Criteria (Gherkin)

```gherkin
Feature: Portfolio Rebalancing Guidance (Android V1)

  Background:
    Given the app base currency is KRW
    And V1 includes trading fees only
    And V1 excludes taxes and minimum order-size constraints
    And the app does not provide in-app order execution

  Scenario: Supported asset holdings input
    Given the user enters Korean/US stock, ETF, and major crypto tickers
    When the app validates the input
    Then only supported tickers are accepted and saved

  Scenario: Current allocation from manual input
    Given the user entered holding quantity and average price manually
    When the app fetches latest prices and FX rates from external APIs
    Then total portfolio value is calculated in KRW
    And current ticker-level allocation percentages are displayed

  Scenario: Current allocation from CSV upload
    Given the user uploads a valid CSV file
    When the app parses the file and fetches latest prices and FX rates
    Then total portfolio value is calculated in KRW
    And current ticker-level allocation percentages are displayed

  Scenario: Target-weight validation failure
    Given the user entered ticker-level target weights
    When the total target weight is not 100%
    Then rebalancing calculation is blocked
    And an error message is shown

  Scenario: Rebalance calculation success
    Given the user entered ticker-level target weights
    And the total target weight equals 100%
    When the user runs rebalance calculation
    Then the app calculates ticker-level buy/sell KRW amounts with fees
    And the app calculates ticker-level buy/sell quantities

  Scenario: Guidance-only output
    Given rebalance calculation is complete
    When the user views results
    Then ticker-level buy/sell guidance is shown
    And no in-app order execution action is available
```

## 4. Approach Options

### Option A (Recommended): On-device calculation
- App stores portfolio data and runs rebalance logic locally.
- External APIs provide prices and FX only.
- Pros: fastest V1 delivery, lower ops cost, lower data exposure.
- Cons: weaker multi-device sync and centralized control.

### Option B: Backend-for-Frontend centered
- Server performs portfolio and rebalance calculations.
- App handles UI and input.
- Pros: centralized business logic, easier future multi-client expansion.
- Cons: higher initial complexity, infra and ops overhead.

### Option C: Hybrid
- Local baseline calculation; server for enriched validation/logic.
- Pros: balanced long-term path.
- Cons: boundary complexity for V1.

Decision: Option A for V1.

## 5. Architecture

- Pattern: Clean Architecture + MVVM
- UI: Jetpack Compose
- Local storage: Room
- Background jobs: WorkManager
- Network: Retrofit/OkHttp
- Domain core: `RebalanceEngine` (pure Kotlin module)
- Secret handling: no hardcoded API keys, build-time injection

## 6. Components

- `PortfolioInputScreen`
  - Manual entry (ticker, asset type, quantity, avg price, trade currency)
  - CSV upload and parse review
- `AllocationOverviewScreen`
  - Total KRW value and current ticker allocation
- `TargetWeightScreen`
  - Ticker target-weight input and sum-to-100 validation
- `RebalanceResultScreen`
  - BUY/SELL side, recommended quantity, KRW amount, estimated fee
  - Guidance only; no order execution
- `PriceSyncService`
  - Price/FX fetch, cache refresh, stale-state markers
- `RebalanceEngine`
  - Target/current gap calculation and fee-inclusive recommendations
- Repositories
  - `HoldingsRepository`
  - `MarketDataRepository`
  - `RebalanceRepository`

## 7. Data Flow

1. User enters holdings manually or uploads CSV.
2. App persists holdings in Room.
3. `PriceSyncService` fetches prices and FX and updates cache.
4. Allocation overview computes current KRW values and weights.
5. User enters target weights by ticker.
6. App validates target sum equals 100.
7. `RebalanceEngine` runs:
   - total portfolio value (KRW)
   - per-ticker target value = total * target weight
   - per-ticker gap = target value - current value
   - fee-inclusive trade amount
   - recommended trade quantity from latest price
8. Result screen renders BUY/SELL guidance.
9. Last calculation result is stored locally for recall.

## 8. Error Handling

- Input validation
  - Invalid ticker format, negative quantity/price, missing fields
- Target-weight errors
  - If total is not 100, block calculation and show explicit message
- CSV ingestion errors
  - Row-level parsing errors; show error summary
  - Allow partial import decision (valid rows only)
- Price/FX fetch failures
  - If cache exists: compute using latest cached data and show timestamp
  - If no cache exists: block calculation and prompt retry
- Data freshness
  - Show stale badge when cache age exceeds threshold
- Numeric safety
  - Guard divide-by-zero, NaN, overflow
  - Asset-aware quantity rounding policy
- User protection
  - Results labeled as reference guidance
  - Warn that actual fills and fees can differ

## 9. Testing Strategy

### Unit tests
- `RebalanceEngine`
  - target sum behavior
  - gap and direction (BUY/SELL)
  - fee application
  - rounding behavior
- Edge cases
  - zero holdings
  - single-ticker 100%
  - extreme fee values

### Integration tests
- Room + repository + mocked network
- Flow: CSV parse -> persist -> price sync -> rebalance output

### UI tests (Compose)
- target-weight validation UX
- result rendering correctness
- API-failure fallback and stale indicators

### Contract tests
- API response schema checks for price and FX endpoints

### Non-functional tests
- Performance on medium portfolios (e.g., 200 tickers)
- Recovery behavior under unstable/offline network

## 10. Acceptance Tests (AC Traceability)

1. Holdings input (manual/CSV) produces KRW total and ticker allocation output.
2. Price and FX API data are applied to KRW valuation.
3. Target total not equal to 100 blocks calculation with explicit error.
4. Valid target total (100) produces fee-inclusive buy/sell amounts and quantities.
5. Results remain guidance-only with no order execution in app.
6. Taxes and minimum order-size constraints are excluded in V1.

## 11. Open Decisions Deferred to Implementation Planning

- Final API providers and fallback order
- Exact CSV schema and validation policy
- Rounding precision rules by asset type
- Cache TTL and stale-threshold values
- App-level state management library choice (if any)
