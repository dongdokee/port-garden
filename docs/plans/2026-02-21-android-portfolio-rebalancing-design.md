# Android Portfolio Rebalancing V1 Design

## Intent Classification

- Category: `behavioral-change:new-feature`

## Critical User Journey

1. User enters current assets across stocks, ETFs, crypto, and cash.
2. User enters target allocation percentages and a global fee rate.
3. User runs rebalance calculation.
4. App validates constraints and returns buy/sell guidance by asset.
5. User reviews KRW amount and estimated quantity for each asset.

## User Story

As a self-directed investor, I want to compare my current allocation with target allocation and get buy/sell guidance, so that I can rebalance quickly and consistently.

## Scope

### In Scope (V1)

- Android app for a single portfolio.
- Manual input only.
- KRW-only valuation and outputs.
- Two input modes:
  - Amount mode: user enters current value directly.
  - Quantity-price mode: user enters quantity and current price.
- Global single fee rate applied to calculations.
- Cash treated as an asset class in allocation and rebalance logic.
- Local-only persistence on device.
- Guidance-only output (no order execution).

### Out of Scope (V1)

- Broker or exchange account connections.
- Live market data fetching.
- Multi-currency FX conversion.
- Multiple portfolios or account aggregation.
- Real or paper order execution.

## Product Decisions (Approved)

- Portfolio count: one portfolio.
- Fee model: one global fee rate.
- Target allocation validation tolerance: 100% +/- 0.1%.
- Minimum trade filter: none (show very small recommendations too).
- Result format: amount + estimated quantity.

## Acceptance Criteria (Gherkin)

### AC-01 Target Allocation Validation

```gherkin
Scenario: Block calculation when target allocation sum is outside tolerance
  Given the user has entered target allocation percentages
  When the sum is below 99.9% or above 100.1%
  Then the app blocks calculation
  And the app shows a validation error
```

### AC-02 Rebalance Calculation

```gherkin
Scenario: Generate rebalance guidance from inputs and fee
  Given current assets are entered using amount mode or quantity-price mode
  And target allocations are entered
  And a global fee rate is entered
  When the user runs rebalance calculation
  Then the app returns buy or sell guidance for each asset
  And each guidance item includes KRW amount and estimated quantity
```

### AC-03 Cash-Inclusive Allocation

```gherkin
Scenario: Include cash in total allocation and rebalance
  Given cash is entered as an asset
  And cash has a target allocation percentage
  When the user runs rebalance calculation
  Then the app calculates differences against totals that include cash
```

### AC-04 Result Presentation

```gherkin
Scenario: Present actionable guidance per asset
  Given a successful rebalance calculation
  When the result view is shown
  Then each asset displays direction, KRW amount, and estimated quantity
```

### AC-05 No Order Execution

```gherkin
Scenario: Keep V1 guidance-only
  Given the user is reviewing rebalance results
  Then the app provides no order execution action
```

## Recommended Architecture

Use `Clean Architecture + MVVM` with domain-first business rules.

- `presentation`: Compose UI and ViewModel state orchestration.
- `domain`: entities, validation, rebalance use cases.
- `data`: local persistence and repository implementations.

Core rule: all allocation validation and rebalance math live in `domain`, not UI.

## Components

- `PortfolioInputScreen`
  - Asset entry and editing.
  - Input mode switch.
  - Target allocation and fee input.
- `RebalanceViewModel`
  - Form state, normalization, use case execution, and UI state emission.
- `ValidateTargetAllocationUseCase`
  - Enforces 100% +/- 0.1% rule.
- `CalculateRebalancePlanUseCase`
  - Computes total value including cash.
  - Computes target amounts and deltas.
  - Applies global fee rate to guidance amounts.
  - Computes estimated quantity when price is present.
- `PortfolioRepository`
  - Stores and loads the single portfolio.
- Persistence
  - `Room` for portfolio and asset rows.
  - `DataStore` for app settings such as default input mode and default fee rate.

## Data Flow

1. User enters assets and targets.
2. ViewModel normalizes inputs into valuation rows.
3. `ValidateTargetAllocationUseCase` runs.
4. On pass, `CalculateRebalancePlanUseCase` runs.
5. UI renders result cards per asset.
6. User can save the portfolio locally.

## Error Handling

- Validation errors:
  - Target sum outside tolerance.
  - Missing required fields.
  - Invalid numeric ranges.
- Calculation guards:
  - Prevent divide-by-zero and NaN propagation.
  - Use decimal-safe arithmetic and formatting boundaries.
- Persistence failures:
  - Show retry prompt on local save failure.
- Safety boundary:
  - No execution action in UI or data layer.

## Testing Strategy

- Acceptance tests at use case boundary first (AC-01 to AC-05).
- Unit tests for fee math, quantity estimation, and edge cases.
- Integration tests for repository and local storage mapping.
- Thin UI smoke tests for:
  - Input rendering.
  - Validation message display.
  - Result card rendering.
  - Absence of order execution controls.

