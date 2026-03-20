package com.portgarden.domain.repository

import com.portgarden.domain.model.Portfolio

interface PortfolioRepository {
    suspend fun getPortfolio(): Portfolio
}
