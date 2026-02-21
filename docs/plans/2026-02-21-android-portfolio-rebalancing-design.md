# Android Portfolio Rebalancing App Design (V1)

## 1. Intent And Scope

- Intent category: `behavioral-change:new-feature`
- Core user journey (CUJ):
  - User enters stock, ETF, crypto, and cash holdings.
  - User sets target weights by ticker.
  - User runs rebalancing and reviews buy/sell guidance.

### User Story
As an investor, I want to see current allocation and concrete rebalancing buy/sell guidance so that I can place orders manually in external trading apps.

### Non-Goals (V1)
- Broker or exchange API integration
- In-app order execution
- Live or delayed quote API integration
- Multi-currency conversion
- Cloud sync or user accounts

## 2. Validated Product Requirements

1. Data entry is fully manual.
2. Target allocation is set per ticker.
3. Fee model includes trading fee only.
4. Cash is part of total assets.
5. Currency scope is single currency only.
6. Current prices are entered manually.
7. Data is stored on device only.
8. Rebalancing output targets maximum allocation accuracy.

## 3. Recommended Approach

Use a calculation-engine-first MVP.

- `UI Layer`: input forms, validation messages, result rendering
- `Domain Layer`: pure Kotlin rebalancing logic and validation
- `Persistence Layer`: local storage of portfolio and settings
- `App Service Layer`: use cases that connect UI, domain, and storage

### Why This Approach
- Delivers the core CUJ quickly.
- Keeps critical calculation logic testable and isolated.
- Leaves a clean path for future data-source expansion.

## 4. Architecture And Components

### Core Domain Models
- `AssetHolding`: `ticker`, `name`, `assetType`, `quantity`, `price`, `marketValue`
- `TargetWeight`: `ticker`, `targetPercent`
- `PortfolioSnapshot`: `holdings`, `totalValue`, `currency`, `updatedAt`
- `RebalanceAction`: `ticker`, `side`, `quantity`, `unitPrice`, `grossAmount`, `fee`, `netAmount`

### Layer Responsibilities
- Presentation
  - Manage form input and validation state.
  - Show allocation summary and action list.
- Domain
  - Validate constraints.
  - Compute deltas and recommended actions.
  - Enforce cash and fee constraints.
- Persistence
  - Save and restore last user state on device.
- Service
  - Coordinate `LoadPortfolio`, `SavePortfolio`, and `CalculateRebalance`.

## 5. Data Flow

1. User enters holdings, prices, cash, and target weights.
2. App validates numeric fields and target sum.
3. User enters fee rate and taps calculate.
4. Domain computes total assets, target values, deltas, and actions.
5. App scales buy actions if cash plus fee is exceeded.
6. App shows recommended actions and post-trade expected allocation.
7. App saves the latest state locally.

## 6. Rebalancing Rules

### Inputs
- Holdings with quantity and price
- Cash amount
- Target weights by ticker
- Trading fee rate

### Calculation Rules
1. `totalAssets = cash + sum(position market values)`
2. `targetValue[ticker] = totalAssets * targetWeight[ticker]`
3. `deltaValue[ticker] = targetValue - currentValue`
4. `deltaValue > 0` => buy, `deltaValue < 0` => sell
5. `rawQuantity = abs(deltaValue) / price`
6. Apply fee to compute executable amounts.
7. Ensure total buy cost plus fee does not exceed available cash.
8. Recompute expected allocation and show residual error.

### Validation Rules
- Target weights must sum to 100.
- Quantity, price, fee rate, and cash must be non-negative.
- Currency is fixed to one configured unit (V1).

## 7. Error Handling And UX Guardrails

- Show inline errors for invalid or missing numeric input.
- Disable calculate action until validation passes.
- Show calculation timestamp and applied fee rate.
- Display guidance disclaimer:
  - "Guidance only. Place actual orders in your brokerage or exchange app."

## 8. Testing Strategy

### Domain Unit Tests
- Target sum validation
- Buy/sell direction correctness
- Fee-aware amount and quantity calculations
- Cash-cap scaling behavior
- Edge-case numeric precision scenarios

### Use Case Tests
- Save and restore portfolio state
- Recalculate after input changes

### UI Tests
- Form validation and button enablement
- Error message visibility
- Result list rendering and summary values

## 9. Open Risks And Mitigations

- Manual data entry errors
  - Mitigation: strong inline validation and summary checks
- User trust in calculation outputs
  - Mitigation: transparent formulas, fee disclosure, and timestamp display
- Precision and rounding differences by asset type
  - Mitigation: define deterministic rounding policy and test extremes

## 10. Next Step
Create a detailed implementation plan with TDD-first, file-specific tasks.
