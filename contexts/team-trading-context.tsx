"use client"

import { createContext, useContext, useReducer, ReactNode, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export interface Trade {
  id: string
  type: "buy" | "sell"
  stock: string
  quantity: number
  price: number
  total: number
  time: string
  status: "completed" | "pending"
  proposedBy: string
  initials: string
  votes: { for: number; against: number }
  consensus: "approved" | "unanimous" | "voting"
  orderType: "market" | "limit" | "stop"
}

export interface TeamMember {
  id: string
  name: string
  initials: string
  portfolio: number
  return: number
  trades: number
}

export interface WatchlistItem {
  symbol: string
  name: string
  price: number
  changePercent: number
  addedBy: string
  votes: number
  totalMembers: number
}

interface TeamTradingState {
  trades: Trade[]
  members: TeamMember[]
  watchlist: WatchlistItem[]
  teamPortfolio: number
  teamCash: number
  teamReturn: number
  totalTrades: number
}

type TeamTradingAction =
  | { type: "SET_TRADES"; payload: Trade[] }
  | { type: "ADD_TRADE"; payload: Trade }
  | { type: "UPDATE_TRADE"; payload: { id: string; updates: Partial<Trade> } }
  | { type: "SET_MEMBERS"; payload: TeamMember[] }
  | { type: "SET_WATCHLIST"; payload: WatchlistItem[] }
  | { type: "ADD_TO_WATCHLIST"; payload: WatchlistItem }
  | { type: "REMOVE_FROM_WATCHLIST"; payload: string }
  | { type: "UPDATE_MEMBER_STATS"; payload: { memberId: string; updates: Partial<TeamMember> } }
  | { type: "SET_TEAM_STATS"; payload: { portfolio: number; cash: number; return: number; totalTrades: number } }
  | { type: "RESET_TEAM_PORTFOLIO" }

const initialState: TeamTradingState = {
  trades: [
    {
      id: "TXN001",
      type: "buy",
      stock: "BK",
      quantity: 50,
      price: 285.5,
      total: 14275,
      time: "10:30 AM",
      status: "completed",
      proposedBy: "Sarah K.",
      initials: "SK",
      votes: { for: 4, against: 1 },
      consensus: "approved",
      orderType: "market"
    },
    {
      id: "TXN002",
      type: "sell",
      stock: "MTN",
      quantity: 30,
      price: 198.7,
      total: 5961,
      time: "09:15 AM",
      status: "completed",
      proposedBy: "Alex M.",
      initials: "AM",
      votes: { for: 5, against: 0 },
      consensus: "unanimous",
      orderType: "market"
    },
    {
      id: "TXN003",
      type: "buy",
      stock: "EQTY",
      quantity: 100,
      price: 156.3,
      total: 15630,
      time: "Yesterday",
      status: "completed",
      proposedBy: "John D.",
      initials: "JD",
      votes: { for: 3, against: 2 },
      consensus: "approved",
      orderType: "limit"
    },
    {
      id: "TXN004",
      type: "buy",
      stock: "I&M",
      quantity: 25,
      price: 342.8,
      total: 8570,
      time: "Yesterday",
      status: "pending",
      proposedBy: "Emma R.",
      initials: "ER",
      votes: { for: 2, against: 1 },
      consensus: "voting",
      orderType: "market"
    },
  ],
  members: [
    { id: "1", name: "Sarah K.", initials: "SK", portfolio: 125000, return: 15.2, trades: 12 },
    { id: "2", name: "Alex M.", initials: "AM", portfolio: 98000, return: 12.8, trades: 8 },
    { id: "3", name: "John D.", initials: "JD", portfolio: 110000, return: 18.5, trades: 15 },
    { id: "4", name: "Emma R.", initials: "ER", portfolio: 87000, return: 9.3, trades: 6 },
    { id: "5", name: "You", initials: "YU", portfolio: 67320, return: 21.83, trades: 4 },
  ],
  watchlist: [
    { 
      symbol: "BK", 
      name: "Bank of Kigali", 
      price: 285.5, 
      changePercent: 0.81,
      addedBy: "Sarah K.",
      votes: 4,
      totalMembers: 5
    },
    { 
      symbol: "MTN", 
      name: "MTN Rwanda", 
      price: 198.7, 
      changePercent: 2.32,
      addedBy: "John D.",
      votes: 5,
      totalMembers: 5
    },
  ],
  teamPortfolio: 400000, // Starting with 400k total value
  teamCash: 400000,     // Starting with 400k cash (all liquid)
  teamReturn: 0,        // Starting return is 0%
  totalTrades: 0        // Reset trade count
}

function teamTradingReducer(state: TeamTradingState, action: TeamTradingAction): TeamTradingState {
  switch (action.type) {
    case "SET_TRADES":
      return { ...state, trades: action.payload }
    
    case "ADD_TRADE": {
      const newTrade = action.payload
      const updatedTrades = [newTrade, ...state.trades]
      
      // Update cash balance based on the trade
      const cashChange = newTrade.type === "buy" ? -newTrade.total : newTrade.total
      const newCash = state.teamCash + cashChange
      
      // Calculate holdings value from all trades
      const holdingsMap = new Map<string, { shares: number, totalCost: number }>()
      
      // Process all trades to get current holdings
      updatedTrades.forEach(trade => {
        const existing = holdingsMap.get(trade.stock) || { shares: 0, totalCost: 0 }
        
        if (trade.type === 'buy') {
          existing.shares += trade.quantity
          existing.totalCost += trade.total
        } else {
          // For sells, reduce cost based on average cost per share
          const avgCostPerShare = existing.shares > 0 ? existing.totalCost / existing.shares : 0
          const costToRemove = trade.quantity * avgCostPerShare
          existing.shares = Math.max(0, existing.shares - trade.quantity)
          existing.totalCost = Math.max(0, existing.totalCost - costToRemove)
        }
        
        holdingsMap.set(trade.stock, existing)
      })
      
      // Calculate current market value of holdings
      let holdingsValue = 0
      const currentPrices: Record<string, number> = {
        "BK": 268, "MTN": 195, "BRALIRWA": 305, "EQUITY": 228, 
        "COGEBANQUE": 162, "AAPL": 150, "TSLA": 250, "MSFT": 300, "GOOGL": 120
      }
      
      holdingsMap.forEach((holding, symbol) => {
        if (holding.shares > 0) {
          const currentPrice = currentPrices[symbol] || (holding.totalCost / holding.shares)
          holdingsValue += holding.shares * currentPrice
        }
      })
      
      // Total portfolio value = cash + holdings value
      const totalPortfolioValue = newCash + holdingsValue
      const initialValue = 400000 // Starting value
      
      return {
        ...state,
        trades: updatedTrades,
        teamPortfolio: totalPortfolioValue,
        teamCash: newCash,
        totalTrades: state.totalTrades + 1,
        teamReturn: ((totalPortfolioValue - initialValue) / initialValue) * 100
      }
    }
    
    case "UPDATE_TRADE": {
      const updatedTrades = state.trades.map(trade =>
        trade.id === action.payload.id
          ? { ...trade, ...action.payload.updates }
          : trade
      )
      return { ...state, trades: updatedTrades }
    }

    case "SET_MEMBERS":
      return { ...state, members: action.payload }

    case "SET_WATCHLIST":
      return { ...state, watchlist: action.payload }
    
    case "ADD_TO_WATCHLIST": {
      const exists = state.watchlist.find(item => item.symbol === action.payload.symbol)
      if (exists) return state
      
      return {
        ...state,
        watchlist: [...state.watchlist, action.payload]
      }
    }
    
    case "REMOVE_FROM_WATCHLIST": {
      return {
        ...state,
        watchlist: state.watchlist.filter(item => item.symbol !== action.payload)
      }
    }
    
    case "UPDATE_MEMBER_STATS": {
      const updatedMembers = state.members.map(member =>
        member.id === action.payload.memberId
          ? { ...member, ...action.payload.updates }
          : member
      )
      return { ...state, members: updatedMembers }
    }

    case "SET_TEAM_STATS":
      return {
        ...state,
        teamPortfolio: action.payload.portfolio,
        teamCash: action.payload.cash,
        teamReturn: action.payload.return,
        totalTrades: action.payload.totalTrades
      }
    
    case "RESET_TEAM_PORTFOLIO":
      return {
        ...state,
        trades: [],
        teamPortfolio: 400000,
        teamCash: 400000,
        teamReturn: 0,
        totalTrades: 0
      }
    
    default:
      return state
  }
}

interface TeamTradingContextType {
  state: TeamTradingState
  addTrade: (trade: Omit<Trade, "id" | "time" | "status" | "votes" | "consensus">) => Promise<Trade | undefined>
  updateTrade: (id: string, updates: Partial<Trade>) => Promise<void>
  addToWatchlist: (item: WatchlistItem) => Promise<void>
  removeFromWatchlist: (symbol: string) => Promise<void>
  updateMemberStats: (memberId: string, updates: Partial<TeamMember>) => Promise<void>
  resetPortfolio: () => void
  loading: boolean
}

const TeamTradingContext = createContext<TeamTradingContextType | undefined>(undefined)

export function TeamTradingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(teamTradingReducer, initialState)
  const [loading, setLoading] = useState(true)
  const teamId = '550e8400-e29b-41d4-a716-446655440000' // Default team ID

  // Load initial data from Supabase
  useEffect(() => {
    loadInitialData()
    setupRealtimeSubscriptions()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      // Load trades
      const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })

      if (trades) {
        const formattedTrades: Trade[] = trades.map(trade => ({
          id: trade.id,
          type: trade.type as 'buy' | 'sell',
          stock: trade.stock,
          quantity: trade.quantity,
          price: trade.price,
          total: trade.total,
          time: trade.time,
          status: trade.status as 'completed' | 'pending',
          proposedBy: trade.proposed_by,
          initials: trade.initials,
          votes: { for: trade.votes_for, against: trade.votes_against },
          consensus: trade.consensus as 'approved' | 'unanimous' | 'voting',
          orderType: trade.order_type as 'market' | 'limit' | 'stop'
        }))
        dispatch({ type: "SET_TRADES", payload: formattedTrades })
      }

      // Load team members
      const { data: members } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)

      if (members) {
        const formattedMembers: TeamMember[] = members.map(member => ({
          id: member.id,
          name: member.name,
          initials: member.initials,
          portfolio: member.portfolio,
          return: member.return,
          trades: member.trades
        }))
        dispatch({ type: "SET_MEMBERS", payload: formattedMembers })
      }

      // Load watchlist
      const { data: watchlist } = await supabase
        .from('watchlist')
        .select('*')
        .eq('team_id', teamId)

      if (watchlist) {
        const formattedWatchlist: WatchlistItem[] = watchlist.map(item => ({
          symbol: item.symbol,
          name: item.name,
          price: item.price,
          changePercent: item.change_percent,
          addedBy: item.added_by,
          votes: item.votes,
          totalMembers: item.total_members
        }))
        dispatch({ type: "SET_WATCHLIST", payload: formattedWatchlist })
      }

      // Load team stats
      const { data: team } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single()

      if (team) {
        dispatch({ 
          type: "SET_TEAM_STATS", 
          payload: { 
            portfolio: team.portfolio, 
            cash: team.cash || 150000, // Default cash if not in database
            return: team.return, 
            totalTrades: team.total_trades 
          } 
        })
      }

    } catch (error) {
      console.error('Error loading initial data:', error)
      // If there's an error, use initial state so the app still works
      dispatch({ type: "SET_TRADES", payload: initialState.trades })
      dispatch({ type: "SET_MEMBERS", payload: initialState.members })
      dispatch({ type: "SET_WATCHLIST", payload: initialState.watchlist })
      dispatch({ 
        type: "SET_TEAM_STATS", 
        payload: { 
          portfolio: initialState.teamPortfolio, 
          cash: initialState.teamCash,
          return: initialState.teamReturn, 
          totalTrades: initialState.totalTrades 
        } 
      })
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscriptions = () => {
    // Temporarily disabled real-time subscriptions to prevent conflicts
    // Will re-enable after fixing the trade execution flow
    return () => {}
  }

  const addTrade = async (tradeData: Omit<Trade, "id" | "time" | "status" | "votes" | "consensus">) => {

    try {

      const newTrade = {
        type: tradeData.type,
        stock: tradeData.stock,
        quantity: tradeData.quantity,
        price: tradeData.price,
        total: tradeData.total,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'completed' as const,
        proposed_by: tradeData.proposedBy,
        initials: tradeData.initials,
        votes_for: 5,
        votes_against: 0,
        consensus: 'unanimous' as const,
        order_type: tradeData.orderType,
        team_id: teamId
      }

      const { data: insertedTrade, error } = await supabase
        .from('trades')
        .insert([newTrade])
        .select()
        .single()

      if (error) throw error

      // Update team portfolio in database
      const portfolioChange = tradeData.type === "buy" ? -tradeData.total : tradeData.total
      const newPortfolio = state.teamPortfolio + portfolioChange
      const newReturn = ((newPortfolio - 400000) / 400000) * 100

      await supabase
        .from('teams')
        .update({ 
          portfolio: newPortfolio, 
          return: newReturn,
          total_trades: state.totalTrades + 1
        })
        .eq('id', teamId)

      // Update local state immediately
      if (insertedTrade) {
        const formattedTrade: Trade = {
          id: insertedTrade.id,
          type: insertedTrade.type as 'buy' | 'sell',
          stock: insertedTrade.stock,
          quantity: insertedTrade.quantity,
          price: insertedTrade.price,
          total: insertedTrade.total,
          time: insertedTrade.time,
          status: insertedTrade.status as 'completed' | 'pending',
          proposedBy: insertedTrade.proposed_by,
          initials: insertedTrade.initials,
          votes: { for: insertedTrade.votes_for, against: insertedTrade.votes_against },
          consensus: insertedTrade.consensus as 'approved' | 'unanimous' | 'voting',
          orderType: insertedTrade.order_type as 'market' | 'limit' | 'stop'
        }
        dispatch({ type: "ADD_TRADE", payload: formattedTrade })
        return formattedTrade
      }

    } catch (error) {
      console.error('Error adding trade:', error)
      // Re-throw the error so the UI can handle it
      throw error
    }
  }

  const updateTrade = async (id: string, updates: Partial<Trade>) => {
    try {
      const { error } = await supabase
        .from('trades')
        .update({
          votes_for: updates.votes?.for,
          votes_against: updates.votes?.against,
          consensus: updates.consensus,
          status: updates.status
        })
        .eq('id', id)

      if (error) throw error
      dispatch({ type: "UPDATE_TRADE", payload: { id, updates } })
    } catch (error) {
      console.error('Error updating trade:', error)
    }
  }

  const addToWatchlist = async (item: WatchlistItem) => {
    try {
      const { error } = await supabase
        .from('watchlist')
        .insert([{
          symbol: item.symbol,
          name: item.name,
          price: item.price,
          change_percent: item.changePercent,
          added_by: item.addedBy,
          votes: item.votes,
          total_members: item.totalMembers,
          team_id: teamId
        }])

      if (error) throw error
      dispatch({ type: "ADD_TO_WATCHLIST", payload: item })
    } catch (error) {
      console.error('Error adding to watchlist:', error)
    }
  }

  const removeFromWatchlist = async (symbol: string) => {
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('symbol', symbol)
        .eq('team_id', teamId)

      if (error) throw error
      dispatch({ type: "REMOVE_FROM_WATCHLIST", payload: symbol })
    } catch (error) {
      console.error('Error removing from watchlist:', error)
    }
  }

  const updateMemberStats = async (memberId: string, updates: Partial<TeamMember>) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          portfolio: updates.portfolio,
          return: updates.return,
          trades: updates.trades
        })
        .eq('id', memberId)

      if (error) throw error
      dispatch({ type: "UPDATE_MEMBER_STATS", payload: { memberId, updates } })
    } catch (error) {
      console.error('Error updating member stats:', error)
    }
  }

  return (
    <TeamTradingContext.Provider
      value={{
        state,
        addTrade,
        updateTrade,
        addToWatchlist,
        removeFromWatchlist,
        updateMemberStats,
        resetPortfolio: () => dispatch({ type: "RESET_TEAM_PORTFOLIO" }),
        loading,
      }}
    >
      {children}
    </TeamTradingContext.Provider>
  )
}

export function useTeamTrading() {
  const context = useContext(TeamTradingContext)
  if (context === undefined) {
    throw new Error("useTeamTrading must be used within a TeamTradingProvider")
  }
  return context
}