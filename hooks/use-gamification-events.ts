import { useCallback } from 'react'
import { GamificationService, GamificationEvent } from '@/lib/gamification-service'
import { useGamification } from '@/contexts/gamification-context'

export function useGamificationEvents() {
  const gamification = useGamification()

  // Trigger gamification events
  const triggerEvent = useCallback(async (event: GamificationEvent) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'
      
      if (supabaseUrl === 'https://demo.supabase.co' || supabaseKey === 'demo-key') {
        // In demo mode, just log the event
        console.log('Demo mode: Gamification event triggered:', event.type, event.data)
        return
      }
      
      await GamificationService.processEvent(event)
      
      // Refresh gamification data after event processing
      if (event.userId) {
        await gamification.initializeUserGamification(event.userId)
      }
      if (event.teamId) {
        await gamification.initializeTeamGamification(event.teamId)
      }
    } catch (error) {
      console.error('Error triggering gamification event:', error)
    }
  }, []) // Remove gamification dependency to prevent infinite re-renders

  // Specific event triggers for common actions
  const onTradeExecuted = useCallback(async (
    userId: string | undefined,
    teamId: string | undefined,
    tradeData: {
      tradeId: string
      tradeValue: number
      stockSymbol: string
      tradeType: 'buy' | 'sell'
      quantity: number
      price: number
    }
  ) => {
    await triggerEvent({
      type: 'trade_executed',
      userId,
      teamId,
      data: tradeData
    })
  }, [])

  const onTradeProfit = useCallback(async (
    userId: string | undefined,
    teamId: string | undefined,
    profitData: {
      tradeId: string
      profitAmount: number
      profitPercentage: number
      stockSymbol: string
    }
  ) => {
    await triggerEvent({
      type: 'trade_profit',
      userId,
      teamId,
      data: profitData
    })
  }, [])

  const onDailyLogin = useCallback(async (userId: string) => {
    await triggerEvent({
      type: 'daily_login',
      userId,
      data: { loginTime: new Date().toISOString() }
    })
  }, [])

  const onTeamVote = useCallback(async (
    userId: string,
    teamId: string,
    voteData: {
      voteId: string
      tradeId: string
      voteType: 'for' | 'against'
    }
  ) => {
    await triggerEvent({
      type: 'team_vote',
      userId,
      teamId,
      data: voteData
    })
  }, [])

  const onWatchlistAdd = useCallback(async (
    userId: string | undefined,
    teamId: string | undefined,
    watchlistData: {
      stockSymbol: string
      stockName: string
    }
  ) => {
    await triggerEvent({
      type: 'watchlist_add',
      userId,
      teamId,
      data: watchlistData
    })
  }, [])

  // Power-up activation
  const activatePowerUp = useCallback(async (userId: string, powerUpId: string) => {
    try {
      const result = await GamificationService.activatePowerUp(userId, powerUpId)
      
      if (result.success) {
        await gamification.initializeUserGamification(userId)
      }
      
      return result
    } catch (error) {
      console.error('Error activating power-up:', error)
      return { success: false, message: 'Failed to activate power-up' }
    }
  }, [])

  // Get leaderboards
  const getUserLeaderboard = useCallback(async (limit?: number) => {
    return await GamificationService.getUserLeaderboard(limit)
  }, [])

  const getTeamLeaderboard = useCallback(async (limit?: number) => {
    return await GamificationService.getTeamLeaderboard(limit)
  }, [])

  return {
    triggerEvent,
    onTradeExecuted,
    onTradeProfit,
    onDailyLogin,
    onTeamVote,
    onWatchlistAdd,
    activatePowerUp,
    getUserLeaderboard,
    getTeamLeaderboard
  }
}