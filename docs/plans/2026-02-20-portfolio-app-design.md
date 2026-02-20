# Financial Portfolio App Design Document

## 1. Overview
This document outlines the design for a financial portfolio Android application. The primary Critical User Journey (CUJ) is allowing users to check their current asset allocation across stocks, ETFs, and cryptocurrencies, and providing a rebalancing guide to match their target allocations.

## 2. Goals & Scope
*   **Primary Goal:** Provide a clear, actionable guide for rebalancing a financial portfolio.
*   **Target Audience:** Individual investors managing a mix of assets (Stocks, Crypto, Cash).
*   **MVP Scope:**
    *   Manual entry for assets + API integration for crypto/key stocks.
    *   Target allocation setting by individual ticker.
    *   Standard rebalancing logic (Buy/Sell to match targets).
    *   Simple flat-rate fee calculation.

## 3. Technical Architecture
*   **Platform:** Native Android (Kotlin).
*   **UI Framework:** Jetpack Compose (Single Activity).
*   **Architecture Pattern:** MVVM (Model-View-ViewModel) + Clean Architecture principles.
*   **Data Persistence:** Room Database (local storage for portfolio/assets).
*   **Network:** Retrofit (for accessing financial APIs like CoinGecko/Yahoo Finance).

### High-Level Components
1.  **UI Layer:** Composable screens (Dashboard, Asset List, Rebalancing).
2.  **Domain Layer:** UseCases (`CalculateRebalancingPlanUseCase`, `UpdateAssetPriceUseCase`).
3.  **Data Layer:**
    *   `PortfolioRepository`: Mediator between local DB and remote APIs.
    *   `AssetDao`: Local CRUD operations.
    *   `FinancialApi`: Remote price fetching.

## 4. Data Models

### Asset
Represents a single holding in the portfolio.
```kotlin
enum class AssetType { STOCK, CRYPTO, CASH, ETF, OTHER }

data class Asset(
    val id: String,             // Unique ID (UUID)
    val ticker: String,         // e.g., "AAPL", "BTC", "KRW"
    val name: String,           // e.g., "Apple Inc.", "Bitcoin"
    val type: AssetType,
    val quantity: Double,       // Amount held
    val averagePrice: Double,   // Average buy price (for profit calc)
    val currentPrice: Double,   // Latest market price
    val targetWeight: Double    // Target allocation (0.0 - 1.0)
)
```

### Portfolio
Aggregates assets to calculate totals.
```kotlin
data class Portfolio(
    val assets: List<Asset>,
    val totalValue: Double,     // Sum(asset.quantity * asset.currentPrice)
    val cashBalance: Double     // Separate tracking for available cash if needed, or treated as AssetType.CASH
)
```

### RebalancingPlan
The output of the rebalancing calculation.
```kotlin
data class RebalancingPlan(
    val steps: List<RebalancingStep>,
    val projectedTotalValue: Double,
    val totalFees: Double
)

data class RebalancingStep(
    val asset: Asset,
    val action: ActionType,     // BUY, SELL, HOLD
    val amount: Double,         // Quantity to buy/sell
    val estimatedCost: Double,  // Price * Amount
    val fee: Double             // Transaction fee
)
```

## 5. Key Logic: Rebalancing Algorithm

1.  **Calculate Total Portfolio Value:**
    `TotalValue = Sum(Asset.quantity * Asset.currentPrice)` (including CASH).

2.  **Determine Target Value per Asset:**
    `TargetValue(Asset) = TotalValue * Asset.targetWeight`.

3.  **Calculate Gap:**
    `Gap = TargetValue - (Asset.quantity * Asset.currentPrice)`.

4.  **Determine Action:**
    *   If `Gap > Threshold` -> **BUY**.
    *   If `Gap < -Threshold` -> **SELL**.
    *   Otherwise -> **HOLD**.

5.  **Fee Calculation (Simple Flat Rate):**
    *   Apply a configurable flat rate (default 0.25%) to the transaction value.
    *   **Buy:** `Cost = Gap / (1 + FeeRate)`.
    *   **Sell:** `Proceeds = Abs(Gap) * (1 - FeeRate)`.

6.  **Rounding:**
    *   Stocks: Round to nearest integer (floor for buy, ceil for sell to be safe, or user preference). MVP: Integer rounding.
    *   Crypto: Allow fractional (e.g., up to 8 decimal places).

## 6. User Interface Design

### Screen 1: Dashboard (Home)
*   **Summary Card:** Total Portfolio Value, Day's Gain/Loss.
*   **Allocation Chart:** Donut chart showing Current vs. Target allocation.
*   **Action Button:** "Rebalance Now" (leads to Screen 3).

### Screen 2: Asset Management (List)
*   **List Item:** Ticker, Name, Current Value, Target %.
*   **Edit Mode:** Allow updating `quantity`, `averagePrice`, `targetWeight`.
*   **Add Button:** Search or manual entry dialog to add new assets.

### Screen 3: Rebalancing Guide
*   **Plan Overview:** "To match your target, execute the following trades:"
*   **Step List:** Ordered list of Buy/Sell orders.
    *   e.g., "SELL 5 AAPL (+ $900)", "BUY 0.01 BTC (- $450)".
*   **Impact Preview:** "After these trades, your allocation will be..." (Visual comparison).

## 7. Implementation Strategy (MVP)
1.  **Phase 1 (Skeleton):** Set up project, Room DB, and basic CRUD for Assets (Manual entry only).
2.  **Phase 2 (Logic):** Implement the Rebalancing Algorithm and Unit Tests.
3.  **Phase 3 (UI):** Build Dashboard and Rebalancing screens with dummy data.
4.  **Phase 4 (Integration):** Connect real data (CoinGecko API for crypto) and polish UI.
