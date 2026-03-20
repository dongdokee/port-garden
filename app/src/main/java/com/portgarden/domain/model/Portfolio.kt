package com.portgarden.domain.model

data class Portfolio(
    val assets: List<Asset>
) {
    val totalValue: Double get() = assets.sumOf { it.totalValue }
}
