package com.portgarden.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.portgarden.domain.model.Portfolio
import com.portgarden.domain.repository.PortfolioRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class PortfolioState {
    object Loading : PortfolioState()
    data class Success(val portfolio: Portfolio) : PortfolioState()
    data class Error(val message: String) : PortfolioState()
}

class PortfolioViewModel(
    private val repository: PortfolioRepository
) : ViewModel() {
    private val _uiState = MutableStateFlow<PortfolioState>(PortfolioState.Loading)
    val uiState: StateFlow<PortfolioState> = _uiState.asStateFlow()

    init {
        loadPortfolio()
    }

    private fun loadPortfolio() {
        viewModelScope.launch {
            try {
                val portfolio = repository.getPortfolio()
                _uiState.value = PortfolioState.Success(portfolio)
            } catch (e: Exception) {
                _uiState.value = PortfolioState.Error(e.message ?: "Unknown error")
            }
        }
    }
}
