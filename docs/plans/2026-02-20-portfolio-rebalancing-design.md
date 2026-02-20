# Portfolio Rebalancing App Design

## Overview

This document outlines the design for the core Critical User Journey (CUJ) of a new Android financial portfolio application. The primary goal is to allow users to view their current asset allocation across manual and API-connected sources and receive actionable buy/sell recommendations to rebalance their portfolio to target percentages.

## Goals

*   **Unified View:** Combine manually entered assets (e.g., specific stocks, cash) with API-synced assets (e.g., crypto exchanges).
*   **Target-Based Rebalancing:** Users define target allocation percentages for each asset.
*   **Actionable Guidance:** The app calculates exact buy/sell amounts to reach targets.
*   **Fee Awareness:** Rebalancing calculations account for transaction fees to ensure precise target values.

## User Stories

1.  **Asset Management:**
    *   "As an investor, I want to manually add assets that don't have API support."
    *   "As an investor, I want to connect my exchange accounts (e.g., Upbit, Binance) to auto-sync balances."
2.  **Target Setting:**
    *   "As an investor, I want to set a target percentage (e.g., BTC: 20%) for each asset."
3.  **Rebalancing:**
    *   "As an investor, I want to see a clear list of trades (Buy/Sell) to align my portfolio with my targets."
    *   "As an investor, I want the rebalancing calculation to subtract estimated fees so I don't over-buy."

## Architecture

We will use **Native Android (Kotlin)** with **Jetpack Compose** for the UI.

*   **Pattern:** MVVM (Model-View-ViewModel) with Clean Architecture principles.
*   **Language:** Kotlin.
*   **UI Framework:** Jetpack Compose (Material 3).
*   **Local Database:** Room (SQLite) for storing assets, targets, and manual holdings.
*   **Networking:** Retrofit for fetching market prices (and later exchange APIs).
*   **Dependency Injection:** Hilt.

### Data Model

**Asset Entity** (`assets` table)
*   `id`: String (UUID)
*   `symbol`: String (e.g., "BTC", "AAPL")
*   `name`: String
*   `type`: Enum (CRYPTO, STOCK, ETF, CASH)
*   `source`: Enum (MANUAL, API)
*   `current_price`: Double (Updated via API)
*   `quantity`: Double (User input or API sync)
*   `target_allocation`: Double (0.0 - 1.0)
*   `fee_rate`: Double (e.g., 0.001 for 0.1%)

### Logic: Rebalancing Algorithm

1.  **Total Portfolio Value** = Sum of (`current_price` * `quantity`) for all assets.
2.  **Target Value (per asset)** = `Total Portfolio Value` * `target_allocation`.
3.  **Difference** = `Target Value` - (`current_price` * `quantity`).
4.  **Fee Adjustment:**
    *   **Buy:** `Amount = Difference / (1 + fee_rate)`
    *   **Sell:** `Amount = Difference / (1 - fee_rate)`

## UI Design

### 1. Dashboard
*   **Summary Card:** Total Portfolio Value, Day Change %.
*   **Allocation Chart:** Donut chart visualising Current vs. Target allocation.
*   **Asset List:** Scrollable list of assets with current value and allocation %.
*   **FAB:** "+ Add Asset" (opens modal to select Manual or API).

### 2. Rebalancing Screen ("The Plan")
*   **Action List:** A prioritized list of required trades.
    *   *Green Row:* "Buy 0.15 BTC ($5,000) @ $33,000"
    *   *Red Row:* "Sell 10 AAPL ($1,500) @ $150"
*   **Fee Info:** Displays estimated fee for each trade based on the asset's `fee_rate`.
*   **Execute Button:** (Mock) Marks trade as "Done" in local history (updates `quantity`).

### 3. Asset Details / Edit
*   Input/Update `quantity` (for Manual assets).
*   Set `target_allocation` %.
*   Set `fee_rate` %.

## Milestones

1.  **Project Setup:** Scaffold Android app with Hilt, Room, Compose.
2.  **Data Layer:** Implement `Asset` entity, DAO, and Repository.
3.  **UI - Dashboard:** Build Asset List and Total Value display.
4.  **UI - Add Asset:** Manual entry form.
5.  **Logic - Rebalancing:** Implement the calculation engine (with unit tests).
6.  **UI - Rebalancing:** Display the calculated Buy/Sell recommendations.
