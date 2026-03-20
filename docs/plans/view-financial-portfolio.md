# Plan: View Financial Portfolio

## Objective
Implement the user story: "As an app user, I can view my financial portfolio." The app will be an Android application built using Kotlin, Jetpack Compose, and the MVVM architecture.

## Scope & Impact
This is the foundational feature of the app. It will establish the base Android project structure and implement the core layers (Domain, Data, Presentation) needed to display a mock financial portfolio.

## Execution Mode

Execution Mode: ralph

Ralph Contract:
- Keep exactly one active Task at a time in `Depends on:` order.
- Independent sub-work inside the active Task may be delegated in parallel, but no downstream Task may start early.
- For the active Task, follow `Implementation:` and then run `Verification:`.
- If any verification step fails or any acceptance criterion is still unmet, remain on the same Task and continue.
- Do not start the next Task until the active Task's acceptance criteria are satisfied, any required independent review is green, and the `Commit:` step is complete.
- On retry, carry forward explicit failure evidence instead of relying on hidden intermediate reasoning.
- Do not declare whole-plan completion until all Tasks are committed and the final regression verification passes.

## Tasks

### Task 1: Scaffold Base Android Project
Depends on: none

Why separate: A clean base project must compile and run before we add domain logic or UI.

Acceptance criteria:
- Project compiles with Gradle.
- Basic `AndroidManifest.xml`, `settings.gradle.kts`, and `build.gradle.kts` are present.
- An empty `MainActivity` can be launched.
- Gradle wrapper is present.

Implementation:
- `TDD exception: project scaffolding before any stable behavior exists.`
- Step 1: Generate the gradle wrapper using a local gradle installation or standard script.
- Step 2: Create `settings.gradle.kts` and root `build.gradle.kts`.
- Step 3: Create `app/build.gradle.kts` configuring Kotlin, Jetpack Compose, and Android defaults.
- Step 4: Create `app/src/main/AndroidManifest.xml`.
- Step 5: Create a minimal `MainActivity.kt` in the root package.

Verification:
- Run `./gradlew :app:assembleDebug` to ensure the project compiles successfully.

Failure loop:
- If any verification step fails or any acceptance criterion is unmet, remain on this Task, fix the issue, and re-run the targeted verification before broader regression.

Commit:
- Commit this Task after verification with a message such as: `chore: scaffold base Android Compose project`

### Task 2: Domain Layer (Models & Repository Interface)
Depends on: Task 1

Why separate: Domain logic (models and interfaces) is independent of UI and data sources, allowing it to be tested in isolation.

Acceptance criteria:
- `Asset` and `Portfolio` data classes exist.
- `Portfolio` correctly calculates the total value of its assets.
- `PortfolioRepository` interface is defined.
- Domain unit tests pass.

Implementation:
- Step 1: Write a failing unit test for `Portfolio.totalValue` calculation.
- Step 2: Confirm the failure.
- Step 3: Implement `Asset` and `Portfolio` data classes.
- Step 4: Implement `PortfolioRepository` interface with a suspend function to fetch the portfolio.
- Step 5: Run the targeted verification and ensure tests pass.

Verification:
- Run `./gradlew :app:testDebugUnitTest --tests "*DomainTest*"` (or equivalent specific test target).

Failure loop:
- If any verification step fails or any acceptance criterion is unmet, remain on this Task, fix the issue, and re-run the targeted verification before broader regression.

Commit:
- Commit this Task after verification with a message such as: `feat: implement domain models for portfolio`

### Task 3: Data Layer (Mock Repository)
Depends on: Task 2

Why separate: The data source implementation can be swapped later (e.g., to a network or database source); isolating it ensures clean architectural boundaries.

Acceptance criteria:
- `MockPortfolioRepository` implements `PortfolioRepository`.
- The mock repository returns a predefined `Portfolio` with at least 2 `Asset`s.
- Data layer unit tests pass.

Implementation:
- Step 1: Write a failing unit test for `MockPortfolioRepository` fetching data.
- Step 2: Confirm the failure.
- Step 3: Implement `MockPortfolioRepository` returning hardcoded assets (e.g., AAPL, Cash).
- Step 4: Run the targeted verification and ensure tests pass.

Verification:
- Run `./gradlew :app:testDebugUnitTest --tests "*RepositoryTest*"`

Failure loop:
- If any verification step fails or any acceptance criterion is unmet, remain on this Task, fix the issue, and re-run the targeted verification before broader regression.

Commit:
- Commit this Task after verification with a message such as: `feat: implement mock portfolio repository`

### Task 4: Presentation Layer (ViewModel & Compose UI)
Depends on: Task 3

Why separate: The UI binds to the domain/data layers and needs to translate raw domain data into view states via the ViewModel.

Acceptance criteria:
- `PortfolioViewModel` exposes a state flow of the portfolio data.
- `PortfolioScreen` composable exists and displays the total portfolio value and a list of assets.
- ViewModel unit tests pass.

Implementation:
- Step 1: Write a failing unit test for `PortfolioViewModel` state emission (e.g., verifying it emits a loading state followed by a success state).
- Step 2: Confirm the failure.
- Step 3: Implement `PortfolioViewModel` taking `PortfolioRepository` as a dependency.
- Step 4: Implement `PortfolioScreen` using Jetpack Compose to observe the ViewModel's state.
- Step 5: Run the targeted verification and ensure tests pass.

Verification:
- Run `./gradlew :app:testDebugUnitTest --tests "*ViewModelTest*"`

Failure loop:
- If any verification step fails or any acceptance criterion is unmet, remain on this Task, fix the issue, and re-run the targeted verification before broader regression.

Commit:
- Commit this Task after verification with a message such as: `feat: implement portfolio viewmodel and compose screen`

### Task 5: Application Wiring
Depends on: Task 4

Why separate: Hooking up the UI to the Activity is the final integration step and is separated from the pure logic of the ViewModel and UI components.

Acceptance criteria:
- `MainActivity` instantiates the repository and ViewModel (or uses a simple Service Locator / DI).
- `MainActivity` sets its content to `PortfolioScreen`.
- The app builds and runs without crashing.

Implementation:
- `TDD exception: pure integration and visual polish where the primary proof is manual review and compilation.`
- Step 1: In `MainActivity`, instantiate `MockPortfolioRepository` and `PortfolioViewModel`.
- Step 2: Call `PortfolioScreen` from the `setContent` block.
- Step 3: Verify the build succeeds.

Verification:
- Run `./gradlew :app:assembleDebug`

Failure loop:
- If any verification step fails or any acceptance criterion is unmet, remain on this Task, fix the issue, and re-run the targeted verification before broader regression.

Commit:
- Commit this Task after verification with a message such as: `feat: wire portfolio screen to main activity`

## Final Regression Verification
After all Tasks are committed, verify the complete application state:
1. Run `./gradlew build` to compile the entire project and run all unit tests.
2. Ensure the output shows BUILD SUCCESSFUL and all tests across Domain, Data, and Presentation layers pass.
