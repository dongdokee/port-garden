package com.portgarden.data.repository

import com.portgarden.domain.model.Asset
import com.portgarden.domain.model.Portfolio
import com.portgarden.domain.repository.PortfolioRepository

class MockPortfolioRepository : PortfolioRepository {
    override suspend fun getPortfolio(): Portfolio {
        val assets = listOf(
            Asset(symbol = "AAPL", name = "Apple Inc.", quantity = 10.0, pricePerUnit = 190.0),
            Asset(symbol = "CASH", name = "USD Cash", quantity = 1500.0, pricePerUnit = 1.0)
        )
        return Portfolio(assets)
    }
}
