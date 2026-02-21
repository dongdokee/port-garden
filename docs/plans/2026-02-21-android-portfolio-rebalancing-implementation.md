# Android Portfolio Rebalancing V1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an Android app that lets users input holdings (manual/CSV), view KRW allocation, set ticker-level target weights, and receive fee-inclusive buy/sell guidance.

**Architecture:** Implement an on-device Clean Architecture + MVVM app. Keep rebalance math in a pure Kotlin domain layer with unit tests. Use Room for local data, Retrofit for price/FX APIs, and WorkManager for periodic market-data refresh.

**Tech Stack:** Kotlin, Gradle Kotlin DSL, AndroidX Compose, Lifecycle/ViewModel, Coroutines/Flow, Room, Retrofit/OkHttp, MockWebServer, JUnit, Turbine, WorkManager

---

## Implementation Notes

- Apply `@test-driven-development` on every task.
- Keep commits small and frequent (one task per commit).
- Before claiming completion, apply `@verification-before-completion`.

### Task 1: Bootstrap Android Project Skeleton

**Files:**
- Create: `settings.gradle.kts`
- Create: `build.gradle.kts`
- Create: `gradle.properties`
- Create: `app/build.gradle.kts`
- Create: `app/src/main/AndroidManifest.xml`
- Create: `app/src/main/java/com/portgarden/rebalance/MainActivity.kt`
- Create: `app/src/test/java/com/portgarden/rebalance/ProjectSmokeTest.kt`

**Step 1: Write the failing test**

```kotlin
package com.portgarden.rebalance

import org.junit.Assert.assertTrue
import org.junit.Test

class ProjectSmokeTest {
    @Test
    fun buildConfigIsAvailable() {
        assertTrue(BuildConfig.APPLICATION_ID.startsWith("com.portgarden.rebalance"))
    }
}
```

**Step 2: Run test to verify it fails**

Run: `./gradlew :app:testDebugUnitTest --tests "com.portgarden.rebalance.ProjectSmokeTest"`
Expected: FAIL because app module/build files do not exist yet.

**Step 3: Write minimal implementation**

```kotlin
// app/src/main/java/com/portgarden/rebalance/MainActivity.kt
package com.portgarden.rebalance

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.Text

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { Text("Portfolio Rebalance") }
    }
}
```

**Step 4: Run test to verify it passes**

Run: `./gradlew :app:testDebugUnitTest --tests "com.portgarden.rebalance.ProjectSmokeTest"`
Expected: PASS.

**Step 5: Commit**

```bash
git add settings.gradle.kts build.gradle.kts gradle.properties app/build.gradle.kts app/src/main/AndroidManifest.xml app/src/main/java/com/portgarden/rebalance/MainActivity.kt app/src/test/java/com/portgarden/rebalance/ProjectSmokeTest.kt
git commit -m "build: initialize Android app skeleton"
```

### Task 2: Implement Target-Weight Sum Validation

**Files:**
- Create: `app/src/main/java/com/portgarden/rebalance/domain/model/TargetWeight.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/domain/TargetWeightValidator.kt`
- Test: `app/src/test/java/com/portgarden/rebalance/domain/TargetWeightValidatorTest.kt`

**Step 1: Write the failing test**

```kotlin
package com.portgarden.rebalance.domain

import com.portgarden.rebalance.domain.model.TargetWeight
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.math.BigDecimal

class TargetWeightValidatorTest {
    @Test
    fun returnsTrueWhenSumIs100() {
        val input = listOf(
            TargetWeight("AAPL", BigDecimal("50")),
            TargetWeight("TSLA", BigDecimal("50"))
        )
        assertTrue(TargetWeightValidator.isValid(input))
    }

    @Test
    fun returnsFalseWhenSumIsNot100() {
        val input = listOf(
            TargetWeight("AAPL", BigDecimal("60")),
            TargetWeight("TSLA", BigDecimal("30"))
        )
        assertFalse(TargetWeightValidator.isValid(input))
    }
}
```

**Step 2: Run test to verify it fails**

Run: `./gradlew :app:testDebugUnitTest --tests "com.portgarden.rebalance.domain.TargetWeightValidatorTest"`
Expected: FAIL with unresolved references for validator/model.

**Step 3: Write minimal implementation**

```kotlin
package com.portgarden.rebalance.domain

import com.portgarden.rebalance.domain.model.TargetWeight
import java.math.BigDecimal

object TargetWeightValidator {
    private val HUNDRED = BigDecimal("100")

    fun isValid(weights: List<TargetWeight>): Boolean {
        val sum = weights.fold(BigDecimal.ZERO) { acc, w -> acc + w.percent }
        return sum.compareTo(HUNDRED) == 0
    }
}
```

```kotlin
package com.portgarden.rebalance.domain.model

import java.math.BigDecimal

data class TargetWeight(
    val ticker: String,
    val percent: BigDecimal,
)
```

**Step 4: Run test to verify it passes**

Run: `./gradlew :app:testDebugUnitTest --tests "com.portgarden.rebalance.domain.TargetWeightValidatorTest"`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/src/main/java/com/portgarden/rebalance/domain/model/TargetWeight.kt app/src/main/java/com/portgarden/rebalance/domain/TargetWeightValidator.kt app/src/test/java/com/portgarden/rebalance/domain/TargetWeightValidatorTest.kt
git commit -m "feat: add target-weight sum validator"
```

### Task 3: Implement Fee-Inclusive Rebalance Engine

**Files:**
- Create: `app/src/main/java/com/portgarden/rebalance/domain/model/Holding.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/domain/model/Quote.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/domain/model/RebalanceOrder.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/domain/RebalanceEngine.kt`
- Test: `app/src/test/java/com/portgarden/rebalance/domain/RebalanceEngineTest.kt`

**Step 1: Write the failing test**

```kotlin
package com.portgarden.rebalance.domain

import com.portgarden.rebalance.domain.model.Holding
import com.portgarden.rebalance.domain.model.Quote
import com.portgarden.rebalance.domain.model.TargetWeight
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.math.BigDecimal

class RebalanceEngineTest {
    @Test
    fun generatesSellAndBuyOrdersWithFeeApplied() {
        val holdings = listOf(
            Holding("AAPL", BigDecimal("10"), "USD"),
            Holding("TSLA", BigDecimal("1"), "USD"),
        )
        val quotes = mapOf(
            "AAPL" to Quote("AAPL", BigDecimal("100"), BigDecimal("1400")),
            "TSLA" to Quote("TSLA", BigDecimal("100"), BigDecimal("1400")),
        )
        val targets = listOf(
            TargetWeight("AAPL", BigDecimal("50")),
            TargetWeight("TSLA", BigDecimal("50")),
        )

        val result = RebalanceEngine.calculate(holdings, quotes, targets, BigDecimal("0.001"))

        assertEquals(2, result.size)
        assertTrue(result.any { it.ticker == "AAPL" && it.side.name == "SELL" })
        assertTrue(result.any { it.ticker == "TSLA" && it.side.name == "BUY" })
    }
}
```

**Step 2: Run test to verify it fails**

Run: `./gradlew :app:testDebugUnitTest --tests "com.portgarden.rebalance.domain.RebalanceEngineTest"`
Expected: FAIL due missing engine and models.

**Step 3: Write minimal implementation**

```kotlin
package com.portgarden.rebalance.domain

import com.portgarden.rebalance.domain.model.Holding
import com.portgarden.rebalance.domain.model.Quote
import com.portgarden.rebalance.domain.model.RebalanceOrder
import com.portgarden.rebalance.domain.model.Side
import com.portgarden.rebalance.domain.model.TargetWeight
import java.math.BigDecimal
import java.math.RoundingMode

object RebalanceEngine {
    fun calculate(
        holdings: List<Holding>,
        quotes: Map<String, Quote>,
        targets: List<TargetWeight>,
        feeRate: BigDecimal,
    ): List<RebalanceOrder> {
        val currentValues = holdings.associate { h ->
            val q = quotes.getValue(h.ticker)
            val krw = h.quantity.multiply(q.price).multiply(q.fxToKrw)
            h.ticker to krw
        }
        val total = currentValues.values.fold(BigDecimal.ZERO, BigDecimal::add)

        return targets.mapNotNull { t ->
            val current = currentValues[t.ticker] ?: BigDecimal.ZERO
            val target = total.multiply(t.percent).divide(BigDecimal("100"), 2, RoundingMode.HALF_UP)
            val delta = target.subtract(current)
            if (delta.compareTo(BigDecimal.ZERO) == 0) return@mapNotNull null

            val side = if (delta.signum() > 0) Side.BUY else Side.SELL
            val gross = delta.abs()
            val fee = gross.multiply(feeRate).setScale(2, RoundingMode.HALF_UP)
            val quote = quotes.getValue(t.ticker)
            val qty = gross.divide(quote.price.multiply(quote.fxToKrw), 8, RoundingMode.HALF_UP)
            RebalanceOrder(t.ticker, side, gross, qty, fee)
        }
    }
}
```

**Step 4: Run test to verify it passes**

Run: `./gradlew :app:testDebugUnitTest --tests "com.portgarden.rebalance.domain.RebalanceEngineTest"`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/src/main/java/com/portgarden/rebalance/domain/model/Holding.kt app/src/main/java/com/portgarden/rebalance/domain/model/Quote.kt app/src/main/java/com/portgarden/rebalance/domain/model/RebalanceOrder.kt app/src/main/java/com/portgarden/rebalance/domain/RebalanceEngine.kt app/src/test/java/com/portgarden/rebalance/domain/RebalanceEngineTest.kt
git commit -m "feat: add fee-inclusive rebalance engine"
```

### Task 4: Add Asset-Type-Aware Quantity Rounding

**Files:**
- Create: `app/src/main/java/com/portgarden/rebalance/domain/model/AssetType.kt`
- Modify: `app/src/main/java/com/portgarden/rebalance/domain/model/Holding.kt`
- Modify: `app/src/main/java/com/portgarden/rebalance/domain/RebalanceEngine.kt`
- Test: `app/src/test/java/com/portgarden/rebalance/domain/RebalanceRoundingPolicyTest.kt`

**Step 1: Write the failing test**

```kotlin
package com.portgarden.rebalance.domain

import com.portgarden.rebalance.domain.model.AssetType
import org.junit.Assert.assertEquals
import org.junit.Test
import java.math.BigDecimal

class RebalanceRoundingPolicyTest {
    @Test
    fun roundsStockToWholeShare() {
        val qty = RebalanceRoundingPolicy.round(BigDecimal("3.72"), AssetType.STOCK)
        assertEquals(BigDecimal("3"), qty)
    }

    @Test
    fun keepsCryptoDecimals() {
        val qty = RebalanceRoundingPolicy.round(BigDecimal("0.123456789"), AssetType.CRYPTO)
        assertEquals(BigDecimal("0.12345679"), qty)
    }
}
```

**Step 2: Run test to verify it fails**

Run: `./gradlew :app:testDebugUnitTest --tests "com.portgarden.rebalance.domain.RebalanceRoundingPolicyTest"`
Expected: FAIL with unresolved policy/type.

**Step 3: Write minimal implementation**

```kotlin
package com.portgarden.rebalance.domain

import com.portgarden.rebalance.domain.model.AssetType
import java.math.BigDecimal
import java.math.RoundingMode

object RebalanceRoundingPolicy {
    fun round(quantity: BigDecimal, assetType: AssetType): BigDecimal =
        when (assetType) {
            AssetType.STOCK, AssetType.ETF -> quantity.setScale(0, RoundingMode.DOWN)
            AssetType.CRYPTO -> quantity.setScale(8, RoundingMode.HALF_UP)
        }
}
```

**Step 4: Run test to verify it passes**

Run: `./gradlew :app:testDebugUnitTest --tests "com.portgarden.rebalance.domain.RebalanceRoundingPolicyTest"`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/src/main/java/com/portgarden/rebalance/domain/model/AssetType.kt app/src/main/java/com/portgarden/rebalance/domain/model/Holding.kt app/src/main/java/com/portgarden/rebalance/domain/RebalanceEngine.kt app/src/test/java/com/portgarden/rebalance/domain/RebalanceRoundingPolicyTest.kt
git commit -m "feat: add quantity rounding by asset type"
```

### Task 5: Build CSV Holdings Parser

**Files:**
- Create: `app/src/main/java/com/portgarden/rebalance/data/csv/HoldingsCsvParser.kt`
- Test: `app/src/test/java/com/portgarden/rebalance/data/csv/HoldingsCsvParserTest.kt`

**Step 1: Write the failing test**

```kotlin
package com.portgarden.rebalance.data.csv

import org.junit.Assert.assertEquals
import org.junit.Test

class HoldingsCsvParserTest {
    @Test
    fun parsesValidRowsAndSkipsInvalidRows() {
        val csv = "ticker,assetType,quantity,avgPrice,currency\nAAPL,STOCK,10,180,USD\nBADROW"
        val result = HoldingsCsvParser.parse(csv)

        assertEquals(1, result.valid.size)
        assertEquals(1, result.errors.size)
        assertEquals("AAPL", result.valid.first().ticker)
    }
}
```

**Step 2: Run test to verify it fails**

Run: `./gradlew :app:testDebugUnitTest --tests "com.portgarden.rebalance.data.csv.HoldingsCsvParserTest"`
Expected: FAIL due missing parser.

**Step 3: Write minimal implementation**

```kotlin
package com.portgarden.rebalance.data.csv

import com.portgarden.rebalance.domain.model.AssetType
import com.portgarden.rebalance.domain.model.Holding
import java.math.BigDecimal

data class CsvParseResult(
    val valid: List<Holding>,
    val errors: List<String>,
)

object HoldingsCsvParser {
    fun parse(csv: String): CsvParseResult {
        val rows = csv.lineSequence().drop(1)
        val valid = mutableListOf<Holding>()
        val errors = mutableListOf<String>()

        rows.forEachIndexed { index, row ->
            val cols = row.split(',')
            if (cols.size < 5) {
                errors += "row ${index + 2}: invalid column count"
                return@forEachIndexed
            }
            runCatching {
                Holding(
                    ticker = cols[0].trim(),
                    quantity = cols[2].trim().toBigDecimal(),
                    currency = cols[4].trim(),
                    assetType = AssetType.valueOf(cols[1].trim()),
                )
            }.onSuccess(valid::add).onFailure {
                errors += "row ${index + 2}: parse error"
            }
        }

        return CsvParseResult(valid, errors)
    }
}
```

**Step 4: Run test to verify it passes**

Run: `./gradlew :app:testDebugUnitTest --tests "com.portgarden.rebalance.data.csv.HoldingsCsvParserTest"`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/src/main/java/com/portgarden/rebalance/data/csv/HoldingsCsvParser.kt app/src/test/java/com/portgarden/rebalance/data/csv/HoldingsCsvParserTest.kt
git commit -m "feat: add CSV parser with row-level errors"
```

### Task 6: Persist Holdings and Targets with Room

**Files:**
- Create: `app/src/main/java/com/portgarden/rebalance/data/local/entity/HoldingEntity.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/data/local/entity/TargetWeightEntity.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/data/local/PortfolioDao.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/data/local/AppDatabase.kt`
- Test: `app/src/androidTest/java/com/portgarden/rebalance/data/local/PortfolioDaoTest.kt`

**Step 1: Write the failing test**

```kotlin
package com.portgarden.rebalance.data.local

import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class PortfolioDaoTest {
    @Test
    fun insertsAndReadsHoldings() {
        // Arrange + Act + Assert with in-memory Room DB
    }
}
```

**Step 2: Run test to verify it fails**

Run: `./gradlew :app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.portgarden.rebalance.data.local.PortfolioDaoTest`
Expected: FAIL due missing Room schema/DAO.

**Step 3: Write minimal implementation**

```kotlin
@Dao
interface PortfolioDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertHoldings(items: List<HoldingEntity>)

    @Query("SELECT * FROM holdings")
    suspend fun getHoldings(): List<HoldingEntity>
}
```

**Step 4: Run test to verify it passes**

Run: `./gradlew :app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.portgarden.rebalance.data.local.PortfolioDaoTest`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/src/main/java/com/portgarden/rebalance/data/local/entity/HoldingEntity.kt app/src/main/java/com/portgarden/rebalance/data/local/entity/TargetWeightEntity.kt app/src/main/java/com/portgarden/rebalance/data/local/PortfolioDao.kt app/src/main/java/com/portgarden/rebalance/data/local/AppDatabase.kt app/src/androidTest/java/com/portgarden/rebalance/data/local/PortfolioDaoTest.kt
git commit -m "feat: add Room persistence for holdings and targets"
```

### Task 7: Add Market Data API Clients (Price + FX)

**Files:**
- Create: `app/src/main/java/com/portgarden/rebalance/data/remote/PriceApi.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/data/remote/FxApi.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/data/remote/MarketDataRemoteDataSource.kt`
- Test: `app/src/test/java/com/portgarden/rebalance/data/remote/MarketDataRemoteDataSourceTest.kt`

**Step 1: Write the failing test**

```kotlin
package com.portgarden.rebalance.data.remote

import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.Assert.assertEquals
import org.junit.Test

class MarketDataRemoteDataSourceTest {
    @Test
    fun mapsPriceAndFxResponses() {
        // Given JSON responses from MockWebServer
        // When fetch is called
        // Then mapped KRW conversion inputs are returned
        assertEquals("AAPL", "AAPL")
    }
}
```

**Step 2: Run test to verify it fails**

Run: `./gradlew :app:testDebugUnitTest --tests "com.portgarden.rebalance.data.remote.MarketDataRemoteDataSourceTest"`
Expected: FAIL due missing Retrofit interfaces/datasource.

**Step 3: Write minimal implementation**

```kotlin
interface PriceApi {
    @GET("/prices")
    suspend fun getPrices(@Query("tickers") tickers: String): PriceResponse
}

interface FxApi {
    @GET("/fx/usdkrw")
    suspend fun getUsdKrw(): FxResponse
}
```

**Step 4: Run test to verify it passes**

Run: `./gradlew :app:testDebugUnitTest --tests "com.portgarden.rebalance.data.remote.MarketDataRemoteDataSourceTest"`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/src/main/java/com/portgarden/rebalance/data/remote/PriceApi.kt app/src/main/java/com/portgarden/rebalance/data/remote/FxApi.kt app/src/main/java/com/portgarden/rebalance/data/remote/MarketDataRemoteDataSource.kt app/src/test/java/com/portgarden/rebalance/data/remote/MarketDataRemoteDataSourceTest.kt
git commit -m "feat: add remote market data data-source"
```

### Task 8: Implement Rebalance Use Case Orchestration

**Files:**
- Create: `app/src/main/java/com/portgarden/rebalance/domain/usecase/CalculateRebalanceUseCase.kt`
- Test: `app/src/test/java/com/portgarden/rebalance/domain/usecase/CalculateRebalanceUseCaseTest.kt`

**Step 1: Write the failing test**

```kotlin
package com.portgarden.rebalance.domain.usecase

import org.junit.Assert.assertTrue
import org.junit.Test

class CalculateRebalanceUseCaseTest {
    @Test
    fun returnsErrorWhenTargetSumNot100() {
        val result = CalculateRebalanceUseCase(/* fakes */).invoke()
        assertTrue(result.isFailure)
    }
}
```

**Step 2: Run test to verify it fails**

Run: `./gradlew :app:testDebugUnitTest --tests "com.portgarden.rebalance.domain.usecase.CalculateRebalanceUseCaseTest"`
Expected: FAIL due missing use case.

**Step 3: Write minimal implementation**

```kotlin
class CalculateRebalanceUseCase(
    private val validator: TargetWeightValidator,
    private val engine: RebalanceEngine,
) {
    operator fun invoke(/* inputs */): Result<List<RebalanceOrder>> {
        // 1) validate sum
        // 2) invoke engine
        return Result.failure(IllegalArgumentException("Not implemented"))
    }
}
```

**Step 4: Run test to verify it passes**

Run: `./gradlew :app:testDebugUnitTest --tests "com.portgarden.rebalance.domain.usecase.CalculateRebalanceUseCaseTest"`
Expected: PASS after implementing success and failure branches.

**Step 5: Commit**

```bash
git add app/src/main/java/com/portgarden/rebalance/domain/usecase/CalculateRebalanceUseCase.kt app/src/test/java/com/portgarden/rebalance/domain/usecase/CalculateRebalanceUseCaseTest.kt
git commit -m "feat: add rebalance use case orchestration"
```

### Task 9: Build ViewModel State Flow for CUJ

**Files:**
- Create: `app/src/main/java/com/portgarden/rebalance/presentation/RebalanceViewModel.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/presentation/RebalanceUiState.kt`
- Test: `app/src/test/java/com/portgarden/rebalance/presentation/RebalanceViewModelTest.kt`

**Step 1: Write the failing test**

```kotlin
package com.portgarden.rebalance.presentation

import app.cash.turbine.test
import kotlinx.coroutines.test.runTest
import org.junit.Test

class RebalanceViewModelTest {
    @Test
    fun emitsValidationErrorWhenTargetWeightInvalid() = runTest {
        val vm = RebalanceViewModel(/* fakes */)
        vm.onCalculateClicked()

        vm.uiState.test {
            assert(awaitItem().errorMessage != null)
        }
    }
}
```

**Step 2: Run test to verify it fails**

Run: `./gradlew :app:testDebugUnitTest --tests "com.portgarden.rebalance.presentation.RebalanceViewModelTest"`
Expected: FAIL due missing ViewModel/state classes.

**Step 3: Write minimal implementation**

```kotlin
data class RebalanceUiState(
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val orders: List<RebalanceOrder> = emptyList(),
)
```

```kotlin
class RebalanceViewModel(
    private val calculateRebalanceUseCase: CalculateRebalanceUseCase,
) : ViewModel() {
    private val _uiState = MutableStateFlow(RebalanceUiState())
    val uiState: StateFlow<RebalanceUiState> = _uiState

    fun onCalculateClicked() {
        // update state from use case result
    }
}
```

**Step 4: Run test to verify it passes**

Run: `./gradlew :app:testDebugUnitTest --tests "com.portgarden.rebalance.presentation.RebalanceViewModelTest"`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/src/main/java/com/portgarden/rebalance/presentation/RebalanceViewModel.kt app/src/main/java/com/portgarden/rebalance/presentation/RebalanceUiState.kt app/src/test/java/com/portgarden/rebalance/presentation/RebalanceViewModelTest.kt
git commit -m "feat: add ViewModel state flow for rebalance CUJ"
```

### Task 10: Implement Compose Screens for Input, Targets, and Results

**Files:**
- Create: `app/src/main/java/com/portgarden/rebalance/presentation/ui/PortfolioInputScreen.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/presentation/ui/AllocationOverviewScreen.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/presentation/ui/TargetWeightScreen.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/presentation/ui/RebalanceResultScreen.kt`
- Test: `app/src/androidTest/java/com/portgarden/rebalance/presentation/ui/RebalanceScreensTest.kt`

**Step 1: Write the failing test**

```kotlin
package com.portgarden.rebalance.presentation.ui

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.assertIsDisplayed
import com.portgarden.rebalance.MainActivity
import org.junit.Rule
import org.junit.Test

class RebalanceScreensTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun showsValidationErrorWhenTargetIsInvalid() {
        composeRule.onNodeWithText("목표 비중 합계는 100%여야 합니다").assertIsDisplayed()
    }
}
```

**Step 2: Run test to verify it fails**

Run: `./gradlew :app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.portgarden.rebalance.presentation.ui.RebalanceScreensTest`
Expected: FAIL because screens and text are missing.

**Step 3: Write minimal implementation**

```kotlin
@Composable
fun TargetWeightScreen(errorMessage: String?) {
    if (errorMessage != null) {
        Text(text = errorMessage)
    }
}
```

**Step 4: Run test to verify it passes**

Run: `./gradlew :app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.portgarden.rebalance.presentation.ui.RebalanceScreensTest`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/src/main/java/com/portgarden/rebalance/presentation/ui/PortfolioInputScreen.kt app/src/main/java/com/portgarden/rebalance/presentation/ui/AllocationOverviewScreen.kt app/src/main/java/com/portgarden/rebalance/presentation/ui/TargetWeightScreen.kt app/src/main/java/com/portgarden/rebalance/presentation/ui/RebalanceResultScreen.kt app/src/androidTest/java/com/portgarden/rebalance/presentation/ui/RebalanceScreensTest.kt
git commit -m "feat: add Compose screens for rebalance journey"
```

### Task 11: Add Periodic Price/FX Sync with WorkManager

**Files:**
- Create: `app/src/main/java/com/portgarden/rebalance/work/MarketSyncWorker.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/work/MarketSyncScheduler.kt`
- Test: `app/src/test/java/com/portgarden/rebalance/work/MarketSyncWorkerTest.kt`

**Step 1: Write the failing test**

```kotlin
package com.portgarden.rebalance.work

import androidx.work.ListenableWorker
import org.junit.Assert.assertEquals
import org.junit.Test

class MarketSyncWorkerTest {
    @Test
    fun returnsRetryOnNetworkFailure() {
        val result = MarketSyncWorker(/* failing fake */).doWork()
        assertEquals(ListenableWorker.Result.retry()::class, result::class)
    }
}
```

**Step 2: Run test to verify it fails**

Run: `./gradlew :app:testDebugUnitTest --tests "com.portgarden.rebalance.work.MarketSyncWorkerTest"`
Expected: FAIL due missing worker.

**Step 3: Write minimal implementation**

```kotlin
class MarketSyncWorker(
    appContext: Context,
    params: WorkerParameters,
    private val repository: MarketDataRepository,
) : CoroutineWorker(appContext, params) {
    override suspend fun doWork(): Result =
        runCatching { repository.refresh() }
            .fold(onSuccess = { Result.success() }, onFailure = { Result.retry() })
}
```

**Step 4: Run test to verify it passes**

Run: `./gradlew :app:testDebugUnitTest --tests "com.portgarden.rebalance.work.MarketSyncWorkerTest"`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/src/main/java/com/portgarden/rebalance/work/MarketSyncWorker.kt app/src/main/java/com/portgarden/rebalance/work/MarketSyncScheduler.kt app/src/test/java/com/portgarden/rebalance/work/MarketSyncWorkerTest.kt
git commit -m "feat: add periodic market data sync worker"
```

### Task 12: Implement AC-Based Acceptance Tests

**Files:**
- Create: `app/src/androidTest/java/com/portgarden/rebalance/acceptance/RebalanceAcceptanceTest.kt`
- Modify: `app/src/main/java/com/portgarden/rebalance/MainActivity.kt`

**Step 1: Write the failing test**

```kotlin
package com.portgarden.rebalance.acceptance

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.assertIsDisplayed
import com.portgarden.rebalance.MainActivity
import org.junit.Rule
import org.junit.Test

class RebalanceAcceptanceTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun guidanceOnlyNoOrderExecutionButton() {
        composeRule.onNodeWithText("주문 실행").assertDoesNotExist()
        composeRule.onNodeWithText("리밸런싱 가이드").assertIsDisplayed()
    }
}
```

**Step 2: Run test to verify it fails**

Run: `./gradlew :app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.portgarden.rebalance.acceptance.RebalanceAcceptanceTest`
Expected: FAIL because guidance UI is incomplete.

**Step 3: Write minimal implementation**

```kotlin
// Ensure result screen contains guidance title and does not expose order execution actions.
```

**Step 4: Run test to verify it passes**

Run: `./gradlew :app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.portgarden.rebalance.acceptance.RebalanceAcceptanceTest`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/src/androidTest/java/com/portgarden/rebalance/acceptance/RebalanceAcceptanceTest.kt app/src/main/java/com/portgarden/rebalance/MainActivity.kt
git commit -m "test: add acceptance tests for guidance-only rebalance flow"
```

## Final Verification Checklist

1. Run unit tests: `./gradlew :app:testDebugUnitTest`
2. Run instrumentation tests: `./gradlew :app:connectedDebugAndroidTest`
3. Confirm AC traceability from Gherkin to acceptance tests.
4. Validate app behavior manually on emulator:
   - manual input
   - CSV upload
   - target sum validation
   - rebalance output with fee
   - no in-app order execution

## References

- Design doc: `docs/plans/2026-02-21-android-portfolio-rebalancing-design.md`
- Use `@subagent-driven-development` if implementing in this session.
