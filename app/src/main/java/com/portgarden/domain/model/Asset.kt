package com.portgarden.domain.model

data class Asset(
    val symbol: String,
    val name: String,
    val quantity: Double,
    val pricePerUnit: Double
) {
    val totalValue: Double get() = quantity * pricePerUnit
}
