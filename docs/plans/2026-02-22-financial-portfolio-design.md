# Financial Portfolio Android App Design Document

**Date:** 2026-02-22
**Status:** Approved

## 1. Overview
A native Android application designed to help users track their current asset allocation across Stocks, ETFs, and Crypto, and provide actionable "Buy/Sell" rebalancing recommendations to match their target portfolio strategy. The app emphasizes privacy (local-only data) and simplicity (MVP focus).

## 2. Goals & Requirements

### 2.1. Core Goals
*   **Track Allocation:** Visualize current portfolio distribution.
*   **Rebalance Guidance:** Calculate precise Buy/Sell amounts to align with user-defined targets.
*   **Privacy First:** All data stored locally on the device; no external servers for user data.
*   **Multi-Currency:** Support global assets (e.g., USD stocks, KRW cash) normalized to a base currency.

### 2.2. Functional Requirements
*   **Input:** Manual entry of holdings (Symbol, Quantity).
*   **Targets:** User defines target % for each specific asset (e.g., AAPL: 5%, VTI: 40%).
*   **Data Source:** Real-time/delayed asset prices via unofficial Yahoo Finance API integration.
*   **Rebalancing Logic:** "Sell to Buy" (Tax-neutral rebalancing within current portfolio value).
*   **Currency Handling:** User selects a Base Currency (e.g., KRW, USD). Foreign assets are converted using real-time exchange rates.
*   **Cash Management:** specific "Cash" asset type to simulate buying power.
*   **Crypto Support:** Treated as standard tickers (e.g., "BTC-USD") via the same data source.

### 2.3. Non-Functional Requirements
*   **Architecture:** Clean Architecture with MVVM (Model-View-ViewModel).
*   **UI/UX:** Jetpack Compose implementing Material Design 3 (Material You).
*   **Persistence:** Room Database (SQLite) for structured data.
*   **Network:** Retrofit/OkHttp for API calls.

## 3. System Architecture

### 3.1. High-Level Layers
The app follows the recommended Android app architecture:
1.  **UI Layer (Presentation):** Jetpack Compose screens, ViewModels, StateFlow.
2.  **Domain Layer (Business Logic):** UseCases, Pure Kotlin Data Models, Repository Interfaces.
3.  **Data Layer (Implementation):** Room Database, Retrofit/OkHttp, DataStore.

### 3.2. Data Models (Domain)

**Asset**
*   `id`: Unique identifier
*   `symbol`: Ticker symbol (e.g., "AAPL", "BTC-USD")
*   `type`: AssetType (STOCK, ETF, CRYPTO, CASH)
*   `name`: Display name

**Holding**
*   `assetId`: Reference to Asset
*   `quantity`: Amount owned
*   `costBasis`: (Optional) Original purchase price per unit

**Target**
*   `assetId`: Reference to Asset
*   `targetPercentage`: Desired allocation (0.0 - 1.0)

**MarketData**
*   `symbol`: Ticker
*   `price`: Current market price
*   `currency`: Currency code of the price (e.g., "USD")
*   `timestamp`: Last update time

### 3.3. Key Components

*   **Database (Room):**
    *   `AppDatabase`: Main entry point.
    *   `AssetDao`: CRUD for assets and holdings.
    *   `MarketDataDao`: Caching prices.
*   **Network (Retrofit):**
    *   `YahooFinanceApi`: Interface for fetching quotes and exchange rates.
    *   `YahooFinanceRepository`: Implementation that decides when to fetch from network vs. cache.
*   **Rebalancing Engine (Domain Logic):**
    *   `CalculateRebalanceUseCase`: Pure function.
        1.  Fetch all holdings and current prices.
        2.  Convert all values to Base Currency.
        3.  Sum total portfolio value.
        4.  For each asset:
            *   `TargetValue = TotalPortfolioValue * TargetPercentage`
            *   `Diff = TargetValue - CurrentValue`
            *   `Action = if (Diff > 0) BUY else SELL`
            *   `Quantity = Abs(Diff) / CurrentPrice`

## 4. UI Design (Material 3)

### 4.1. Screens
1.  **Dashboard (Home):**
    *   **Summary Card:** Total Portfolio Value (in Base Currency), Daily Change (Amount/%), Last Updated timestamp.
    *   **Allocation Chart:** Donut chart (Current vs. Target).
    *   **Top Movers:** Brief list of assets with significant price changes.
2.  **Holdings (List):**
    *   List of all assets.
    *   Each item shows: Symbol, Quantity, Current Value, Allocation %.
    *   FAB (Floating Action Button) to "Add Asset".
3.  **Rebalance (Action):**
    *   List of recommended actions (Buy/Sell).
    *   Grouped by "Sell" (to raise cash) and "Buy" (to deploy cash).
    *   "Apply" button (simulates execution, updates holdings - optional for MVP).
4.  **Settings:**
    *   Base Currency selector.
    *   Theme toggle (System/Light/Dark).

## 5. Implementation Plan (Phased)

### Phase 1: Core Foundation & Data
*   Setup Project (Gradle, Hilt, Room, Retrofit).
*   Implement Domain Models.
*   Implement Room Database & DAOs.
*   Implement Basic Yahoo Finance API Client.

### Phase 2: UI Skeleton & Input
*   Create basic Navigation structure (Compose).
*   Implement "Add Asset" screen (Manual entry).
*   Implement "Holdings List" screen.

### Phase 3: Logic & Rebalancing
*   Implement `CalculateRebalanceUseCase`.
*   Implement "Rebalance" screen to display recommendations.
*   Connect Live Data (Price updates).

### Phase 4: Polish & Refinement
*   Add Material 3 styling (Dynamic Colors).
*   Implement Base Currency conversion logic.
*   Unit Testing & Bug Fixes.
