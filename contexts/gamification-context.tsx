'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedAt?: Date
  xpReward: number
}

interface GamificationState {
  xp: number
  level: number
  streak: number
  achievements: Achievement[]
  totalTrades: number
  profitableTrades: number
  badges: string[]
  nextLevelXP: number
  currentLevelXP: number
}

type GamificationAction =
  | { type: 'ADD_XP'; payload: number }
  | { type: 'COMPLETE_TRADE'; payload: { profitable: boolean } }
  | { type: 'EARN_ACHIEVEMENT'; payload: string }
  | { type: 'UPDATE_STREAK'; payload: number }

const achievements: Achievement[] = [
  {
    id: 'first_trade',
    name: 'First Trade',
    description: 'Complete your first trade',
    icon: '🎯',
    earned: false,
    xpReward: 50
  },
  {
    id: 'profitable_trader',
    name: 'Profitable Trader',
    description: 'Make 5 profitable trades',
    icon: '💰',
    earned: false,
    xpReward: 100
  },
  {
    id: 'diversified_portfolio',
    name: 'Diversified Portfolio',
    description: 'Hold 5 different stocks',
    icon: '📊',
    earned: false,
    xpReward: 75
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 7-day trading streak',
    icon: '🔥',
    earned: false,
    xpReward: 150
  },
  {
    id: 'big_trader',
    name: 'Big Trader',
    description: 'Complete 50 trades',
    icon: '🚀',
    earned: false,
    xpReward: 200
  }
]

const initialState: GamificationState = {
  xp: 0,
  level: 1,
  streak: 0,
  achievements,
  totalTrades: 0,
  profitableTrades: 0,
  badges: [],
  nextLevelXP: 100,
  currentLevelXP: 0
}

function calculateLevel(xp: number): { level: number; currentLevelXP: number; nextLevelXP: number } {
  const level = Math.floor(xp / 100) + 1
  const currentLevelXP = xp % 100
  const nextLevelXP = 100
  return { level, currentLevelXP, nextLevelXP }
}

function gamificationReducer(
  state: GamificationState,
  action: GamificationAction
): GamificationState {
  switch (action.type) {
    case 'ADD_XP': {
      const newXP = state.xp + action.payload
      const { level, currentLevelXP, nextLevelXP } = calculateLevel(newXP)
      
      return {
        ...state,
        xp: newXP,
        level,
        currentLevelXP,
        nextLevelXP
      }
    }

    case 'COMPLETE_TRADE': {
      const newTotalTrades = state.totalTrades + 1
      const newProfitableTrades = action.payload.profitable 
        ? state.profitableTrades + 1 
        : state.profitableTrades

      let updatedAchievements = [...state.achievements]
      let xpToAdd = 10 // Base XP for completing a trade

      // Check for achievements
      if (newTotalTrades === 1) {
        const firstTradeIndex = updatedAchievements.findIndex(a => a.id === 'first_trade')
        if (!updatedAchievements[firstTradeIndex].earned) {
          updatedAchievements[firstTradeIndex] = {
            ...updatedAchievements[firstTradeIndex],
            earned: true,
            earnedAt: new Date()
          }
          xpToAdd += updatedAchievements[firstTradeIndex].xpReward
        }
      }

      if (newProfitableTrades === 5) {
        const profitableIndex = updatedAchievements.findIndex(a => a.id === 'profitable_trader')
        if (!updatedAchievements[profitableIndex].earned) {
          updatedAchievements[profitableIndex] = {
            ...updatedAchievements[profitableIndex],
            earned: true,
            earnedAt: new Date()
          }
          xpToAdd += updatedAchievements[profitableIndex].xpReward
        }
      }

      if (newTotalTrades === 50) {
        const bigTraderIndex = updatedAchievements.findIndex(a => a.id === 'big_trader')
        if (!updatedAchievements[bigTraderIndex].earned) {
          updatedAchievements[bigTraderIndex] = {
            ...updatedAchievements[bigTraderIndex],
            earned: true,
            earnedAt: new Date()
          }
          xpToAdd += updatedAchievements[bigTraderIndex].xpReward
        }
      }

      const newXP = state.xp + xpToAdd
      const { level, currentLevelXP, nextLevelXP } = calculateLevel(newXP)

      return {
        ...state,
        xp: newXP,
        level,
        currentLevelXP,
        nextLevelXP,
        totalTrades: newTotalTrades,
        profitableTrades: newProfitableTrades,
        achievements: updatedAchievements
      }
    }

    case 'EARN_ACHIEVEMENT': {
      const achievementIndex = state.achievements.findIndex(a => a.id === action.payload)
      if (achievementIndex !== -1 && !state.achievements[achievementIndex].earned) {
        const updatedAchievements = [...state.achievements]
        updatedAchievements[achievementIndex] = {
          ...updatedAchievements[achievementIndex],
          earned: true,
          earnedAt: new Date()
        }

        const xpReward = updatedAchievements[achievementIndex].xpReward
        const newXP = state.xp + xpReward
        const { level, currentLevelXP, nextLevelXP } = calculateLevel(newXP)

        return {
          ...state,
          xp: newXP,
          level,
          currentLevelXP,
          nextLevelXP,
          achievements: updatedAchievements
        }
      }
      return state
    }

    case 'UPDATE_STREAK': {
      let updatedAchievements = [...state.achievements]
      let xpToAdd = 0

      if (action.payload === 7) {
        const streakIndex = updatedAchievements.findIndex(a => a.id === 'streak_master')
        if (!updatedAchievements[streakIndex].earned) {
          updatedAchievements[streakIndex] = {
            ...updatedAchievements[streakIndex],
            earned: true,
            earnedAt: new Date()
          }
          xpToAdd = updatedAchievements[streakIndex].xpReward
        }
      }

      const newXP = state.xp + xpToAdd
      const { level, currentLevelXP, nextLevelXP } = calculateLevel(newXP)

      return {
        ...state,
        xp: newXP,
        level,
        currentLevelXP,
        nextLevelXP,
        streak: action.payload,
        achievements: updatedAchievements
      }
    }

    default:
      return state
  }
}

const GamificationContext = createContext<{
  state: GamificationState
  dispatch: React.Dispatch<GamificationAction>
} | null>(null)

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gamificationReducer, initialState)

  return (
    <GamificationContext.Provider value={{ state, dispatch }}>
      {children}
    </GamificationContext.Provider>
  )
}

export function useGamification() {
  const context = useContext(GamificationContext)
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider')
  }
  return context
}