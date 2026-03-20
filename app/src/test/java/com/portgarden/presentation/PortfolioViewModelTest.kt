package com.portgarden.presentation

import com.portgarden.data.repository.MockPortfolioRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class PortfolioViewModelTest {

    private val testDispatcher = StandardTestDispatcher()

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `uiState initially emits Loading and then Success when portfolio is loaded`() = runTest {
        val repository = MockPortfolioRepository()
        val viewModel = PortfolioViewModel(repository)

        assertTrue("Should start in Loading state", viewModel.uiState.value is PortfolioState.Loading)

        advanceUntilIdle()

        assertTrue("Should transition to Success state", viewModel.uiState.value is PortfolioState.Success)
    }
}
