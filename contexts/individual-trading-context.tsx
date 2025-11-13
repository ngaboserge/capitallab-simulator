'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'

interface Trade {
  id: string
  symbol: string
  type: 'buy' | 'sell'
  quantity: number
  price: number
  timestamp: Date
  total: number
}

interface Holding {
  symbol: string
  quantity: number
  averagePrice: number
  currentPrice: number
  totalValue: number
  profitLoss: number
  profitLossPercent: number
}

interface IndividualTradingState {
  cash: number
  portfolio: number
  holdings: Holding[]
  trades: Trade[]
  watchlist: string[]
  totalValue: number
  profitLoss: number
  profitLossPercent: number
}

type IndividualTradingAction =
  | { type: 'EXECUTE_TRADE'; payload: Omit<Trade, 'id' | 'timestamp'> }
  | { type: 'ADD_TO_WATCHLIST'; payload: string }
  | { type: 'REMOVE_FROM_WATCHLIST'; payload: string }
  | { type: 'UPDATE_PRICES'; payload: { [symbol: string]: number } }

const initialState: IndividualTradingState = {
  cash: 100000,
  portfolio: 0,
  holdings: [],
  trades: [],
  watchlist: ['AAPL', 'GOOGL', 'MSFT'],
  totalValue: 100000,
  profitLoss: 0,
  profitLossPercent: 0
}

function individualTradingReducer(
  state: IndividualTradingState,
  action: IndividualTradingAction
): IndividualTradingState {
  switch (action.type) {
    case 'EXECUTE_TRADE': {
      const trade: Trade = {
        ...action.payload,
        id: `trade_${Date.now()}`,
        timestamp: new Date()
      }

      const newTrades = [trade, ...state.trades]
      let newCash = state.cash
      let newHoldings = [...state.holdings]

      if (trade.type === 'buy') {
        newCash -= trade.total
        const existingHolding = newHoldings.find(h => h.symbol === trade.symbol)
        if (existingHolding) {
          const totalQuantity = existingHolding.quantity + trade.quantity
          const totalCost = (existingHolding.averagePrice * existingHolding.quantity) + trade.total
          existingHolding.averagePrice = totalCost / totalQuantity
          existingHolding.quantity = totalQuantity
        } else {
          newHoldings.push({
            symbol: trade.symbol,
            quantity: trade.quantity,
            averagePrice: trade.price,
            currentPrice: trade.price,
            totalValue: trade.total,
            profitLoss: 0,
            profitLossPercent: 0
          })
        }
      } else {
        newCash += trade.total
        const holdingIndex = newHoldings.findIndex(h => h.symbol === trade.symbol)
        if (holdingIndex !== -1) {
          newHoldings[holdingIndex].quantity -= trade.quantity
          if (newHoldings[holdingIndex].quantity <= 0) {
            newHoldings.splice(holdingIndex, 1)
          }
        }
      }

      const portfolioValue = newHoldings.reduce((sum, holding) => sum + holding.totalValue, 0)
      const totalValue = newCash + portfolioValue
      const profitLoss = totalValue - 100000
      const profitLossPercent = (profitLoss / 100000) * 100

      return {
        ...state,
        cash: newCash,
        portfolio: portfolioValue,
        holdings: newHoldings,
        trades: newTrades,
        totalValue,
        profitLoss,
        profitLossPercent
      }
    }

    case 'ADD_TO_WATCHLIST': {
      if (!state.watchlist.includes(action.payload)) {
        return {
          ...state,
          watchlist: [...state.watchlist, action.payload]
        }
      }
      return state
    }

    case 'REMOVE_FROM_WATCHLIST': {
      return {
        ...state,
        watchlist: state.watchlist.filter(symbol => symbol !== action.payload)
      }
    }

    case 'UPDATE_PRICES': {
      const updatedHoldings = state.holdings.map(holding => {
        const newPrice = action.payload[holding.symbol] || holding.currentPrice
        const totalValue = holding.quantity * newPrice
        const profitLoss = totalValue - (holding.quantity * holding.averagePrice)
        const profitLossPercent = ((profitLoss / (holding.quantity * holding.averagePrice)) * 100)

        return {
          ...holding,
          currentPrice: newPrice,
          totalValue,
          profitLoss,
          profitLossPercent
        }
      })

      const portfolioValue = updatedHoldings.reduce((sum, holding) => sum + holding.totalValue, 0)
      const totalValue = state.cash + portfolioValue
      const profitLoss = totalValue - 100000
      const profitLossPercent = (profitLoss / 100000) * 100

      return {
        ...state,
        holdings: updatedHoldings,
        portfolio: portfolioValue,
        totalValue,
        profitLoss,
        profitLossPercent
      }
    }

    default:
      return state
  }
}

const IndividualTradingContext = createContext<{
  state: IndividualTradingState
  dispatch: React.Dispatch<IndividualTradingAction>
} | null>(null)

export function IndividualTradingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(individualTradingReducer, initialState)

  return (
    <IndividualTradingContext.Provider value={{ state, dispatch }}>
      {children}
    </IndividualTradingContext.Provider>
  )
}

export function useIndividualTrading() {
  const context = useContext(IndividualTradingContext)
  if (!context) {
    throw new Error('useIndividualTrading must be used within IndividualTradingProvider')
  }
  return context
}