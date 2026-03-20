package com.portgarden.domain

import com.portgarden.domain.model.Asset
import com.portgarden.domain.model.Portfolio
import org.junit.Assert.assertEquals
import org.junit.Test

class PortfolioDomainTest {

    @Test
    fun `totalValue should be sum of asset values`() {
        val assets = listOf(
            Asset(symbol = "AAPL", name = "Apple", quantity = 2.0, pricePerUnit = 150.0),
            Asset(symbol = "GOOGL", name = "Alphabet", quantity = 1.0, pricePerUnit = 2800.0)
        )
        val portfolio = Portfolio(assets = assets)

        assertEquals(3100.0, portfolio.totalValue, 0.01)
    }

    @Test
    fun `totalValue of empty portfolio should be zero`() {
        val portfolio = Portfolio(assets = emptyList())
        assertEquals(0.0, portfolio.totalValue, 0.01)
    }
}
