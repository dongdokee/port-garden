# Android Portfolio Rebalancing V1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
> **For Claude:** If this plan is AC/Gherkin mode, REQUIRED SUB-SKILL: Use atdd-domain-first.

**Goal:** Build an Android V1 app that computes KRW buy/sell rebalance guidance for stocks, ETFs, crypto, and cash using manual inputs and a global fee rate.

**Architecture:** Use Clean Architecture with MVVM and domain-first business logic. Keep allocation validation and rebalance math in `domain` use cases; keep UI thin and local persistence isolated behind a repository.

**Tech Stack:** Kotlin, Android Gradle Plugin, Jetpack Compose, ViewModel, Coroutines, Room, DataStore, JUnit, MockK (optional), AndroidX Test/Compose UI Test.

---

## Planning Mode

- Mode: `AC/Gherkin`
- Required execution skills: `@atdd-domain-first`, `@test-driven-development`, `@verification-before-completion`, `@requesting-code-review`

## Acceptance Criteria Source

- Source doc: `docs/plans/2026-02-21-android-portfolio-rebalancing-design.md`
- AC format: Gherkin

## AC Traceability Matrix

| AC ID | Gherkin Scenario | Test Layer | Planned Test File | Planned Task |
|---|---|---|---|---|
| AC-01 | Block calculation when target allocation sum is outside tolerance | Acceptance (UseCase/domain) | `app/src/test/java/com/portgarden/rebalance/domain/usecase/ValidateTargetAllocationUseCaseAcceptanceTest.kt` | Task 2 |
| AC-02 | Generate rebalance guidance from inputs and fee | Acceptance (UseCase/domain) | `app/src/test/java/com/portgarden/rebalance/domain/usecase/CalculateRebalancePlanUseCaseAcceptanceTest.kt` | Task 3 |
| AC-03 | Include cash in total allocation and rebalance | Acceptance (UseCase/domain) | `app/src/test/java/com/portgarden/rebalance/domain/usecase/CalculateRebalancePlanUseCaseAcceptanceTest.kt` | Task 3 |
| AC-04 | Present actionable guidance per asset | Acceptance (UseCase/domain) + UI smoke | `app/src/test/java/com/portgarden/rebalance/domain/usecase/CalculateRebalancePlanUseCaseAcceptanceTest.kt`, `app/src/androidTest/java/com/portgarden/rebalance/ui/RebalanceFlowSmokeTest.kt` | Task 3, Task 6 |
| AC-05 | Keep V1 guidance-only | UI smoke | `app/src/androidTest/java/com/portgarden/rebalance/ui/RebalanceFlowSmokeTest.kt` | Task 6 |

## Conventions Locked Before Coding

- Target allocation sum is valid only when in `[99.9, 100.1]`.
- `CASH` is treated as an asset in total portfolio value.
- Fee convention for deterministic tests:
  - Buy display amount: `baseTrade + baseTrade * feeRate`
  - Sell display amount: `baseTrade - baseTrade * feeRate`
  - `baseTrade` is `abs(targetAmount - currentAmount)`
  - Estimated quantity uses `baseTrade / price` (null when price is absent)
- KRW rounding: `HALF_UP` to 0 decimal places for displayed amounts.

### Task 1: Bootstrap Android Project Skeleton

**Covers AC:** `N/A (infrastructure)`

**Files:**
- Create: `settings.gradle.kts`
- Create: `build.gradle.kts`
- Create: `gradle.properties`
- Create: `app/build.gradle.kts`
- Create: `app/src/main/AndroidManifest.xml`
- Create: `app/src/main/java/com/portgarden/rebalance/MainActivity.kt`

**Step 1: Create minimal project files**

```kotlin
// settings.gradle.kts
rootProject.name = "port-garden"
include(":app")
```

```kotlin
// app/build.gradle.kts (key parts)
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.devtools.ksp")
}
android { namespace = "com.portgarden.rebalance" }
dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.activity:activity-compose:1.9.2")
    implementation("androidx.compose.material3:material3:1.3.0")
    testImplementation("junit:junit:4.13.2")
}
```

**Step 2: Verify project compiles**

Run: `./gradlew :app:testDebugUnitTest`
Expected: `BUILD SUCCESSFUL` with zero or more skipped tests.

**Step 3: Commit**

```bash
git add settings.gradle.kts build.gradle.kts gradle.properties app
git commit -m "chore: bootstrap android app skeleton"
```

### Task 2: Implement AC-01 Validation Use Case via Acceptance Test First

**Covers AC:** `AC-01`

**Files:**
- Create: `app/src/test/java/com/portgarden/rebalance/domain/usecase/ValidateTargetAllocationUseCaseAcceptanceTest.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/domain/model/AllocationValidationResult.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/domain/usecase/ValidateTargetAllocationUseCase.kt`

**Step 1: Write the failing acceptance test**

```kotlin
@Test
fun ac_01_blocks_when_sum_outside_tolerance() {
    val useCase = ValidateTargetAllocationUseCase()
    val result = useCase(listOf(BigDecimal("50.0"), BigDecimal("49.8")))
    assertTrue(result is AllocationValidationResult.Invalid)
}
```

**Step 2: Run test to verify it fails**

Run: `./gradlew :app:testDebugUnitTest --tests "*ValidateTargetAllocationUseCaseAcceptanceTest*"`
Expected: FAIL due to missing `ValidateTargetAllocationUseCase` implementation.

**Step 3: Write minimal implementation**

```kotlin
class ValidateTargetAllocationUseCase {
    operator fun invoke(targetPercents: List<BigDecimal>): AllocationValidationResult {
        val sum = targetPercents.fold(BigDecimal.ZERO, BigDecimal::add)
        return if (sum >= BigDecimal("99.9") && sum <= BigDecimal("100.1")) {
            AllocationValidationResult.Valid
        } else {
            AllocationValidationResult.Invalid("Target allocation must be 100% +/- 0.1%")
        }
    }
}
```

**Step 4: Run test to verify it passes**

Run: `./gradlew :app:testDebugUnitTest --tests "*ValidateTargetAllocationUseCaseAcceptanceTest*"`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/src/test/java/com/portgarden/rebalance/domain/usecase/ValidateTargetAllocationUseCaseAcceptanceTest.kt app/src/main/java/com/portgarden/rebalance/domain/model/AllocationValidationResult.kt app/src/main/java/com/portgarden/rebalance/domain/usecase/ValidateTargetAllocationUseCase.kt
git commit -m "feat: add AC-01 target allocation validation use case"
```

### Task 3: Implement AC-02, AC-03, AC-04 Domain Rebalance Use Case via Acceptance Test First

**Covers AC:** `AC-02, AC-03, AC-04`

**Files:**
- Create: `app/src/test/java/com/portgarden/rebalance/domain/usecase/CalculateRebalancePlanUseCaseAcceptanceTest.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/domain/model/AssetType.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/domain/model/PortfolioAsset.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/domain/model/RebalanceInstruction.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/domain/usecase/CalculateRebalancePlanUseCase.kt`

**Step 1: Write the failing acceptance tests**

```kotlin
@Test
fun ac_02_03_04_returns_buy_sell_amount_and_estimated_quantity_including_cash() {
    val useCase = CalculateRebalancePlanUseCase()
    val assets = listOf(
        PortfolioAsset("STOCK_A", AssetType.STOCK, BigDecimal("300000"), BigDecimal("40"), BigDecimal("50000")),
        PortfolioAsset("ETF_B", AssetType.ETF, BigDecimal("400000"), BigDecimal("30"), BigDecimal("25000")),
        PortfolioAsset("CASH", AssetType.CASH, BigDecimal("300000"), BigDecimal("30"), null)
    )
    val result = useCase(assets, BigDecimal("0.01"))
    assertEquals(Action.BUY, result.first { it.symbol == "STOCK_A" }.action)
    assertEquals(Action.SELL, result.first { it.symbol == "ETF_B" }.action)
    assertEquals(BigDecimal("101000"), result.first { it.symbol == "STOCK_A" }.displayAmountKrw)
    assertEquals(BigDecimal("99000"), result.first { it.symbol == "ETF_B" }.displayAmountKrw)
}
```

**Step 2: Run test to verify it fails**

Run: `./gradlew :app:testDebugUnitTest --tests "*CalculateRebalancePlanUseCaseAcceptanceTest*"`
Expected: FAIL because model/use case classes do not exist yet.

**Step 3: Write minimal implementation**

```kotlin
class CalculateRebalancePlanUseCase {
    operator fun invoke(assets: List<PortfolioAsset>, feeRate: BigDecimal): List<RebalanceInstruction> {
        val total = assets.fold(BigDecimal.ZERO) { acc, a -> acc + a.currentValueKrw }
        return assets.map { asset ->
            val target = total * (asset.targetPercent / BigDecimal("100"))
            val baseTrade = (target - asset.currentValueKrw).abs()
            val fee = baseTrade * feeRate
            val action = when {
                target > asset.currentValueKrw -> Action.BUY
                target < asset.currentValueKrw -> Action.SELL
                else -> Action.HOLD
            }
            val display = when (action) {
                Action.BUY -> baseTrade + fee
                Action.SELL -> baseTrade - fee
                Action.HOLD -> BigDecimal.ZERO
            }
            val qty = asset.priceKrw?.takeIf { it > BigDecimal.ZERO }?.let { baseTrade / it }
            RebalanceInstruction(asset.symbol, action, display.setScale(0, RoundingMode.HALF_UP), qty)
        }
    }
}
```

**Step 4: Run test to verify it passes**

Run: `./gradlew :app:testDebugUnitTest --tests "*CalculateRebalancePlanUseCaseAcceptanceTest*"`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/src/test/java/com/portgarden/rebalance/domain/usecase/CalculateRebalancePlanUseCaseAcceptanceTest.kt app/src/main/java/com/portgarden/rebalance/domain/model app/src/main/java/com/portgarden/rebalance/domain/usecase/CalculateRebalancePlanUseCase.kt
git commit -m "feat: add AC-02 to AC-04 rebalance domain use case"
```

### Task 4: Add Unit Coverage for Fee, Quantity, and Rounding Edge Cases

**Covers AC:** `AC-02, AC-03, AC-04`

**Files:**
- Create: `app/src/test/java/com/portgarden/rebalance/domain/usecase/RebalanceMathUnitTest.kt`
- Modify: `app/src/main/java/com/portgarden/rebalance/domain/usecase/CalculateRebalancePlanUseCase.kt`

**Step 1: Write the failing unit tests**

```kotlin
@Test fun quantity_is_null_when_price_missing() { /* ... */ }
@Test fun zero_fee_keeps_display_equal_to_base_trade() { /* ... */ }
@Test fun krw_display_rounds_half_up_to_integer() { /* ... */ }
```

**Step 2: Run test to verify it fails**

Run: `./gradlew :app:testDebugUnitTest --tests "*RebalanceMathUnitTest*"`
Expected: FAIL on one or more assertions.

**Step 3: Write minimal implementation updates**

```kotlin
private fun BigDecimal.krw() = setScale(0, RoundingMode.HALF_UP)
```

Adjust quantity and rounding branches in `CalculateRebalancePlanUseCase` to satisfy tests.

**Step 4: Run test to verify it passes**

Run: `./gradlew :app:testDebugUnitTest --tests "*RebalanceMathUnitTest*"`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/src/test/java/com/portgarden/rebalance/domain/usecase/RebalanceMathUnitTest.kt app/src/main/java/com/portgarden/rebalance/domain/usecase/CalculateRebalancePlanUseCase.kt
git commit -m "test: cover rebalance fee and rounding edge cases"
```

### Task 5: Implement Local Persistence with Integration Tests (Room + DataStore)

**Covers AC:** `N/A (infrastructure supporting AC-02/AC-04 data continuity)`

**Files:**
- Create: `app/src/test/java/com/portgarden/rebalance/data/LocalPortfolioRepositoryIntegrationTest.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/data/local/entity/PortfolioEntity.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/data/local/entity/AssetEntity.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/data/local/dao/PortfolioDao.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/data/local/AppDatabase.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/data/repository/PortfolioRepository.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/data/repository/LocalPortfolioRepository.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/data/settings/AppSettingsStore.kt`

**Step 1: Write the failing integration test**

```kotlin
@Test
fun save_then_load_returns_same_assets_and_fee_rate() = runTest {
    repository.save(samplePortfolio)
    val loaded = repository.load()
    assertEquals(samplePortfolio.assets.size, loaded.assets.size)
    assertEquals(samplePortfolio.feeRate, loaded.feeRate)
}
```

**Step 2: Run test to verify it fails**

Run: `./gradlew :app:testDebugUnitTest --tests "*LocalPortfolioRepositoryIntegrationTest*"`
Expected: FAIL because repository/db classes are missing.

**Step 3: Write minimal implementation**

```kotlin
interface PortfolioRepository {
    suspend fun save(input: PortfolioDraft)
    suspend fun load(): PortfolioDraft?
}
```

Implement Room DAO + mapper + DataStore-backed settings store and wire in `LocalPortfolioRepository`.

**Step 4: Run test to verify it passes**

Run: `./gradlew :app:testDebugUnitTest --tests "*LocalPortfolioRepositoryIntegrationTest*"`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/src/test/java/com/portgarden/rebalance/data/LocalPortfolioRepositoryIntegrationTest.kt app/src/main/java/com/portgarden/rebalance/data
git commit -m "feat: add local portfolio persistence with room and datastore"
```

### Task 6: Implement UI Smoke Coverage and Presentation for AC-04 and AC-05

**Covers AC:** `AC-04, AC-05`

**Files:**
- Create: `app/src/androidTest/java/com/portgarden/rebalance/ui/RebalanceFlowSmokeTest.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/presentation/RebalanceUiState.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/presentation/RebalanceViewModel.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/presentation/PortfolioInputScreen.kt`
- Create: `app/src/main/java/com/portgarden/rebalance/presentation/RebalanceResultScreen.kt`
- Modify: `app/src/main/java/com/portgarden/rebalance/MainActivity.kt`

**Step 1: Write the failing UI smoke tests**

```kotlin
@Test fun shows_validation_error_for_invalid_target_sum() { /* ... */ }
@Test fun shows_result_rows_with_direction_amount_and_quantity() { /* ... */ }
@Test fun ac_05_no_execute_order_action_is_rendered() {
    composeRule.onNodeWithText("Execute Order").assertDoesNotExist()
}
```

**Step 2: Run test to verify it fails**

Run: `./gradlew :app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.portgarden.rebalance.ui.RebalanceFlowSmokeTest`
Expected: FAIL on missing UI/viewmodel behavior.

**Step 3: Write minimal implementation**

```kotlin
data class RebalanceUiState(
    val validationError: String? = null,
    val instructions: List<RebalanceInstruction> = emptyList()
)
```

Implement input form, calculate action, result list rendering, and intentionally omit all order execution buttons/actions.

**Step 4: Run test to verify it passes**

Run: `./gradlew :app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.portgarden.rebalance.ui.RebalanceFlowSmokeTest`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/src/androidTest/java/com/portgarden/rebalance/ui/RebalanceFlowSmokeTest.kt app/src/main/java/com/portgarden/rebalance/presentation app/src/main/java/com/portgarden/rebalance/MainActivity.kt
git commit -m "feat: add rebalance ui flow and guidance-only smoke coverage"
```

### Task 7: Final Verification Before Completion

**Covers AC:** `AC-01, AC-02, AC-03, AC-04, AC-05`

**Files:**
- Modify: `README.md`

**Step 1: Run full unit and instrumentation tests**

Run: `./gradlew :app:testDebugUnitTest :app:connectedDebugAndroidTest`
Expected: All tests PASS.

**Step 2: Run lint and assemble**

Run: `./gradlew :app:lintDebug :app:assembleDebug`
Expected: `BUILD SUCCESSFUL`.

**Step 3: Update README with test commands and current V1 limitations**

```markdown
## V1
- Manual input only
- KRW only
- Guidance only, no order execution
```

**Step 4: Re-run targeted AC suite**

Run: `./gradlew :app:testDebugUnitTest --tests "*AcceptanceTest*"`
Expected: PASS for all AC-mapped domain tests.

**Step 5: Commit**

```bash
git add README.md
git commit -m "docs: document v1 scope and verification commands"
```

