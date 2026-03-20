package com.portgarden

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.portgarden.data.repository.MockPortfolioRepository
import com.portgarden.presentation.PortfolioScreen
import com.portgarden.presentation.PortfolioViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: PortfolioViewModel by viewModels {
        object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return PortfolioViewModel(MockPortfolioRepository()) as T
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            PortfolioScreen(viewModel = viewModel)
        }
    }
}
