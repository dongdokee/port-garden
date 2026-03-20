package com.portgarden.data.repository

import com.portgarden.domain.repository.PortfolioRepository
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertTrue
import org.junit.Test

class MockPortfolioRepositoryTest {

    @Test
    fun getPortfolio_returnsPortfolioWithAtLeastTwoAssets() = runTest {
        // This will fail to compile until MockPortfolioRepository is implemented
        val repository: PortfolioRepository = MockPortfolioRepository()
        val portfolio = repository.getPortfolio()

        assertTrue("Portfolio should have at least 2 assets", portfolio.assets.size >= 2)
    }
}
