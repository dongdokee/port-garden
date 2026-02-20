# Portfolio Rebalancing Implementation Plan

> **For Gemini:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the core rebalancing engine for the portfolio app, allowing users to input assets/targets and calculate buy/sell orders with fee awareness.

**Architecture:** Pure Kotlin domain module for the logic (Clean Architecture). This plan focuses on the *Domain Layer* first to validate the core algorithm before touching UI/Android specifics.

**Tech Stack:** Kotlin, JUnit 5.

---

### Task 1: Define Domain Entities

**Files:**
- Create: `app/src/main/java/com/example/portfolio/domain/model/Asset.kt`
- Create: `app/src/main/java/com/example/portfolio/domain/model/RebalanceResult.kt`

**Step 1: Create Asset Data Class**

Define the core `Asset` structure.

```kotlin
package com.example.portfolio.domain.model

enum class AssetType { STOCK, CRYPTO, CASH }
enum class AssetSource { MANUAL, API }

data class Asset(
    val id: String,
    val symbol: String,
    val type: AssetType,
    val currentPrice: Double,
    val quantity: Double,
    val targetAllocation: Double, // 0.0 to 1.0
    val feeRate: Double = 0.0 // 0.0 to 1.0 (e.g., 0.001 for 0.1%)
) {
    val currentValue: Double
        get() = currentPrice * quantity
}
```

**Step 2: Create RebalanceResult Data Class**

Define the output of the calculation.

```kotlin
package com.example.portfolio.domain.model

data class RebalanceResult(
    val asset: Asset,
    val difference: Double, // targetValue - currentValue
    val amountToTrade: Double, // Positive = Buy, Negative = Sell (Net of fees)
    val estimatedFee: Double
)
```

**Step 3: Commit**

```bash
git add app/src/main/java/com/example/portfolio/domain/model/
git commit -m "feat(domain): add Asset and RebalanceResult models"
```

---

### Task 2: Implement Rebalancing Algorithm (TDD)

**Files:**
- Create: `app/src/test/java/com/example/portfolio/domain/usecase/CalculateRebalancingUseCaseTest.kt`
- Create: `app/src/main/java/com/example/portfolio/domain/usecase/CalculateRebalancingUseCase.kt`

**Step 1: Write Test for "Buy" Scenario**

```kotlin
package com.example.portfolio.domain.usecase

import com.example.portfolio.domain.model.*
import org.junit.Assert.assertEquals
import org.junit.Test

class CalculateRebalancingUseCaseTest {

    private val useCase = CalculateRebalancingUseCase()

    @Test
    fun `calculate buy amount with fee`() {
        val asset = Asset(
            id = "1", symbol = "BTC", type = AssetType.CRYPTO,
            currentPrice = 100.0, quantity = 8.0, // Value = 800
            targetAllocation = 1.0, feeRate = 0.001 // 0.1%
        )
        // Target = 1000 (implied, single asset for simplicity)
        // Diff = 200
        // Buy = 200 / 1.001 = 199.8002...

        val result = useCase(listOf(asset), totalTargetValue = 1000.0).first()

        assertEquals(200.0, result.difference, 0.001)
        assertEquals(199.80, result.amountToTrade, 0.01)
        assertEquals(0.20, result.estimatedFee, 0.01)
    }
}
```

**Step 2: Create UseCase Class (Skeleton)**

```kotlin
package com.example.portfolio.domain.usecase

import com.example.portfolio.domain.model.*

class CalculateRebalancingUseCase {
    operator fun invoke(assets: List<Asset>, totalTargetValue: Double): List<RebalanceResult> {
        return emptyList()
    }
}
```

**Step 3: Run Test (Fail)**

Run: `./gradlew test` (or equivalent JUnit runner)
Expected: Fail

**Step 4: Implement Logic**

```kotlin
package com.example.portfolio.domain.usecase

import com.example.portfolio.domain.model.*
import kotlin.math.abs

class CalculateRebalancingUseCase {
    operator fun invoke(assets: List<Asset>, totalTargetValue: Double): List<RebalanceResult> {
        return assets.map { asset ->
            val targetValue = totalTargetValue * asset.targetAllocation
            val diff = targetValue - asset.currentValue
            
            val amountToTrade: Double
            val fee: Double

            if (diff > 0) {
                // Buy: cost + fee = diff -> cost * (1 + rate) = diff
                amountToTrade = diff / (1 + asset.feeRate)
                fee = diff - amountToTrade
            } else {
                // Sell: proceeds - fee = diff (negative) 
                // We want to sell enough to reduce value by 'diff'.
                // Sell Amount = Diff / (1 - rate)
                // Note: Diff is negative here. 
                amountToTrade = diff / (1 - asset.feeRate)
                fee = abs(amountToTrade * asset.feeRate)
            }

            RebalanceResult(
                asset = asset,
                difference = diff,
                amountToTrade = amountToTrade,
                estimatedFee = fee
            )
        }
    }
}
```

**Step 5: Run Test (Pass)**

Run: `./gradlew test`
Expected: Pass

**Step 6: Add "Sell" Scenario Test**

```kotlin
    @Test
    fun `calculate sell amount with fee`() {
        val asset = Asset(
            id = "1", symbol = "BTC", type = AssetType.CRYPTO,
            currentPrice = 100.0, quantity = 12.0, // Value = 1200
            targetAllocation = 0.5, feeRate = 0.001 // Target = 500 (if total=1000)
        )
        // Diff = 500 - 1200 = -700
        // Sell = -700 / (1 - 0.001) = -700 / 0.999 = -700.7007...

        val result = useCase(listOf(asset), totalTargetValue = 1000.0).first()

        assertEquals(-700.0, result.difference, 0.001)
        assertEquals(-700.70, result.amountToTrade, 0.01)
        assertEquals(0.70, result.estimatedFee, 0.01)
    }
```

**Step 7: Run All Tests**

Expected: Pass

**Step 8: Commit**

```bash
git add app/src/main/java/com/example/portfolio/domain/usecase/
git add app/src/test/java/com/example/portfolio/domain/usecase/
git commit -m "feat(domain): implement CalculateRebalancingUseCase with fee logic"
```

---

### Task 3: Automatic Total Value Calculation

**Files:**
- Modify: `app/src/main/java/com/example/portfolio/domain/usecase/CalculateRebalancingUseCase.kt`
- Modify: `app/src/test/java/com/example/portfolio/domain/usecase/CalculateRebalancingUseCaseTest.kt`

**Step 1: Update UseCase to calculate total value internally**

We usually want to rebalance based on the *current* total portfolio value (unless user injects cash).

```kotlin
    // Overload or modify to accept just assets
    operator fun invoke(assets: List<Asset>, cashInjection: Double = 0.0): List<RebalanceResult> {
        val currentTotalValue = assets.sumOf { it.currentValue }
        val finalTotalValue = currentTotalValue + cashInjection

        return assets.map { asset ->
             val targetValue = finalTotalValue * asset.targetAllocation
             // ... rest of logic
        }
    }
```

**Step 2: Update Tests**

Refactor tests to remove `totalTargetValue` parameter and let it be derived.

**Step 3: Commit**

```bash
git commit -am "refactor(domain): auto-calculate total portfolio value"
```
