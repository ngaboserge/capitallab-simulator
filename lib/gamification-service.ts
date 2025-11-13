import { supabase } from './supabase'

export interface GamificationEvent {
  type: 'trade_executed' | 'trade_profit' | 'daily_login' | 'streak_maintained' | 'team_vote' | 'watchlist_add'
  userId?: string
  teamId?: string
  data: any
}

export interface AchievementCriteria {
  trades_count?: number
  daily_streak?: number
  return_percentage?: number
  trade_value?: number
  unique_stocks?: number
  team_votes?: number
  profit_amount?: number
  consecutive_wins?: number
  xp_milestone?: number
  level?: number
}

export interface MissionCriteria {
  trades_count?: number
  unique_stocks?: number
  team_votes?: number
  return_percentage?: number
  timeframe?: 'day' | 'week' | 'month'
}

export class GamificationService {
  
  // Process gamification events
  static async processEvent(event: GamificationEvent) {
    try {
      console.log('Processing gamification event:', event)
      
      switch (event.type) {
        case 'trade_executed':
          await this.handleTradeExecuted(event)
          break
        case 'trade_profit':
          await this.handleTradeProfit(event)
          break
        case 'daily_login':
          await this.handleDailyLogin(event)
          break
        case 'streak_maintained':
          await this.handleStreakMaintained(event)
          break
        case 'team_vote':
          await this.handleTeamVote(event)
          break
        case 'watchlist_add':
          await this.handleWatchlistAdd(event)
          break
      }
    } catch (error) {
      console.error('Error processing gamification event:', error)
    }
  }

  // Handle trade execution events
  private static async handleTradeExecuted(event: GamificationEvent) {
    const { userId, teamId, data } = event
    const { tradeValue, stockSymbol } = data

    // Base XP for trade execution
    let xpAmount = 50
    
    // Bonus XP for large trades
    if (tradeValue > 10000) xpAmount += 25
    if (tradeValue > 50000) xpAmount += 50
    
    // Award XP
    if (userId) {
      await this.addUserXP(userId, xpAmount, 'Trade executed', data.tradeId)
      await this.updateUserMissionProgress(userId, 'trade_executed', 1)
      await this.checkUserAchievements(userId)
    }
    
    if (teamId) {
      await this.addTeamXP(teamId, Math.floor(xpAmount * 0.8), 'Team trade executed', data.tradeId)
      await this.updateTeamMissionProgress(teamId, 'trade_executed', 1)
      await this.checkTeamAchievements(teamId)
    }

    // Check for diversification achievements
    await this.checkDiversificationAchievements(userId, teamId, stockSymbol)
  }

  // Handle profitable trade events
  private static async handleTradeProfit(event: GamificationEvent) {
    const { userId, teamId, data } = event
    const { profitAmount, profitPercentage } = data

    // XP based on profit percentage
    let xpAmount = Math.floor(profitPercentage * 10)
    
    // Bonus for high profits
    if (profitPercentage > 10) xpAmount += 100
    if (profitPercentage > 25) xpAmount += 200
    
    if (userId) {
      await this.addUserXP(userId, xpAmount, `Profitable trade: ${profitPercentage.toFixed(1)}%`, data.tradeId)
      await this.updateUserMissionProgress(userId, 'profit_made', profitAmount)
    }
    
    if (teamId) {
      await this.addTeamXP(teamId, Math.floor(xpAmount * 0.8), `Team profitable trade: ${profitPercentage.toFixed(1)}%`, data.tradeId)
      await this.updateTeamMissionProgress(teamId, 'profit_made', profitAmount)
    }
  }

  // Handle daily login events
  private static async handleDailyLogin(event: GamificationEvent) {
    const { userId } = event
    if (!userId) return

    const today = new Date().toISOString().split('T')[0]
    
    // Get user gamification data
    const { data: userGamification } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!userGamification) return

    const lastActivityDate = userGamification.last_activity_date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    let newStreak = 1
    let streakBonus = 0

    // Calculate streak
    if (lastActivityDate === yesterdayStr) {
      newStreak = userGamification.daily_streak + 1
      streakBonus = Math.min(newStreak * 5, 100) // Max 100 XP bonus
    } else if (lastActivityDate !== today) {
      newStreak = 1
    } else {
      // Already logged in today
      return
    }

    // Update streak and award XP
    await supabase
      .from('user_gamification')
      .update({
        daily_streak: newStreak,
        last_activity_date: today,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    const totalXP = 25 + streakBonus
    await this.addUserXP(userId, totalXP, `Daily login (${newStreak} day streak)`)

    // Check streak achievements
    await this.checkStreakAchievements(userId, newStreak)
  }

  // Handle streak maintenance events
  private static async handleStreakMaintained(event: GamificationEvent) {
    const { userId, data } = event
    if (!userId) return

    const streak = data.streak || 0
    const bonusXP = Math.min(streak * 2, 50) // Max 50 XP bonus

    await this.addUserXP(userId, bonusXP, `Streak maintained: ${streak} days`)
    await this.checkStreakAchievements(userId, streak)
  }

  // Handle watchlist addition events
  private static async handleWatchlistAdd(event: GamificationEvent) {
    const { userId, teamId, data } = event
    
    if (userId) {
      await this.addUserXP(userId, 10, `Added ${data.stockSymbol} to watchlist`)
      await this.updateUserMissionProgress(userId, 'watchlist_add', 1)
    }
    
    if (teamId) {
      await this.addTeamXP(teamId, 8, `Team watchlist: ${data.stockSymbol}`)
      await this.updateTeamMissionProgress(teamId, 'watchlist_add', 1)
    }
  }

  // Handle team voting events
  private static async handleTeamVote(event: GamificationEvent) {
    const { userId, teamId, data } = event
    
    if (userId) {
      await this.addUserXP(userId, 15, 'Team vote participation', data.voteId)
      await this.updateUserMissionProgress(userId, 'team_votes', 1)
    }
    
    if (teamId) {
      await this.addTeamXP(teamId, 10, 'Team collaboration', data.voteId)
      await this.updateTeamMissionProgress(teamId, 'team_votes', 1)
    }
  }

  // Add XP with transaction logging
  private static async addUserXP(userId: string, amount: number, reason: string, referenceId?: string) {
    try {
      // Log transaction
      await supabase
        .from('xp_transactions')
        .insert({
          user_id: userId,
          xp_amount: amount,
          reason,
          transaction_type: 'earned',
          reference_id: referenceId
        })

      // Update user gamification
      const { data: current } = await supabase
        .from('user_gamification')
        .select('xp, level')
        .eq('user_id', userId)
        .single()

      if (current) {
        const newXP = current.xp + amount
        const newLevel = this.calculateLevel(newXP)

        await supabase
          .from('user_gamification')
          .update({
            xp: newXP,
            level: newLevel,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        // Check for level-up achievements
        if (newLevel > current.level) {
          await this.checkLevelAchievements(userId, newLevel)
        }

        // Always check for achievements after XP gain
        await this.checkUserAchievements(userId)
      }
    } catch (error) {
      console.error('Error adding user XP:', error)
    }
  }

  private static async addTeamXP(teamId: string, amount: number, reason: string, referenceId?: string) {
    try {
      await supabase
        .from('xp_transactions')
        .insert({
          team_id: teamId,
          xp_amount: amount,
          reason,
          transaction_type: 'earned',
          reference_id: referenceId
        })

      const { data: current } = await supabase
        .from('team_gamification')
        .select('xp, level')
        .eq('team_id', teamId)
        .single()

      if (current) {
        const newXP = current.xp + amount
        const newLevel = this.calculateLevel(newXP)

        await supabase
          .from('team_gamification')
          .update({
            xp: newXP,
            level: newLevel,
            updated_at: new Date().toISOString()
          })
          .eq('team_id', teamId)
      }
    } catch (error) {
      console.error('Error adding team XP:', error)
    }
  }

  // Achievement checking functions
  static async checkUserAchievements(userId: string) {
    try {
      // Get user stats
      const [userGamification, userTrades, earnedAchievements] = await Promise.all([
        supabase.from('user_gamification').select('*').eq('user_id', userId).single(),
        supabase.from('individual_trades').select('*').eq('user_id', userId),
        supabase.from('user_achievements').select('achievement_id').eq('user_id', userId)
      ])

      const earnedIds = earnedAchievements.data?.map(a => a.achievement_id) || []
      
      // Get available achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .in('achievement_type', ['individual', 'both'])

      if (!achievements || !userGamification.data || !userTrades.data) return

      // Check each achievement
      for (const achievement of achievements) {
        if (earnedIds.includes(achievement.id)) continue

        const criteria: AchievementCriteria = achievement.criteria
        let earned = false

        // Check XP milestone achievements FIRST (most important)
        if (criteria.xp_milestone && userGamification.data.xp >= criteria.xp_milestone) {
          earned = true
        }

        // Check level-based achievements
        if (criteria.level && userGamification.data.level >= criteria.level) {
          earned = true
        }

        // Check XP-based achievements (simple level check)
        if (criteria.trades_count === 1 && userGamification.data.xp >= 50) {
          // "First Trade" achievement - award if user has any XP from trading
          earned = true
        }

        // Check trade count (if user has actual trades)
        if (criteria.trades_count && criteria.trades_count > 1 && userTrades.data && userTrades.data.length >= criteria.trades_count) {
          earned = true
        }

        // Check daily streak
        if (criteria.daily_streak && userGamification.data.daily_streak >= criteria.daily_streak) {
          earned = true
        }

        // Check return percentage
        if (criteria.return_percentage) {
          const totalInvested = userTrades.data
            .filter(t => t.type === 'buy')
            .reduce((sum, t) => sum + t.total, 0)
          const totalReturned = userTrades.data
            .filter(t => t.type === 'sell')
            .reduce((sum, t) => sum + t.total, 0)
          
          if (totalInvested > 0) {
            const returnPercentage = ((totalReturned - totalInvested) / totalInvested) * 100
            if (returnPercentage >= criteria.return_percentage) {
              earned = true
            }
          }
        }

        // Check unique stocks
        if (criteria.unique_stocks) {
          const uniqueStocks = new Set(userTrades.data.map(t => t.stock)).size
          if (uniqueStocks >= criteria.unique_stocks) {
            earned = true
          }
        }

        // Check high value trade
        if (criteria.trade_value && typeof criteria.trade_value === 'number' && criteria.trade_value > 0) {
          const hasHighValueTrade = userTrades.data.some(t => t.total >= criteria.trade_value!)
          if (hasHighValueTrade) {
            earned = true
          }
        }

        if (earned) {
          await this.awardAchievement(userId, achievement.id, achievement.xp_reward, achievement.name)
        }
      }
    } catch (error) {
      console.error('Error checking user achievements:', error)
    }
  }

  private static async checkTeamAchievements(teamId: string) {
    try {
      const [teamGamification, teamTrades, earnedAchievements] = await Promise.all([
        supabase.from('team_gamification').select('*').eq('team_id', teamId).single(),
        supabase.from('trades').select('*').eq('team_id', teamId),
        supabase.from('team_achievements').select('achievement_id').eq('team_id', teamId)
      ])

      const earnedIds = earnedAchievements.data?.map(a => a.achievement_id) || []
      
      // Get available team achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .in('achievement_type', ['team', 'both'])

      if (!achievements || !teamGamification.data || !teamTrades.data) return

      // Check each achievement (similar logic to user achievements)
      for (const achievement of achievements) {
        if (earnedIds.includes(achievement.id)) continue

        const criteria: AchievementCriteria = achievement.criteria
        let earned = false

        // Check team-specific criteria
        if (criteria.trades_count && teamTrades.data.length >= criteria.trades_count) {
          earned = true
        }

        if (earned) {
          await this.awardTeamAchievement(teamId, achievement.id, achievement.xp_reward, achievement.name)
        }
      }
    } catch (error) {
      console.error('Error checking team achievements:', error)
    }
  }

  private static async awardTeamAchievement(teamId: string, achievementId: string, xpReward: number, achievementName: string) {
    try {
      // Award achievement
      await supabase
        .from('team_achievements')
        .insert({
          team_id: teamId,
          achievement_id: achievementId
        })

      // Award XP
      await this.addTeamXP(teamId, xpReward, `Achievement: ${achievementName}`, achievementId)

      // Update achievement count
      const { data: currentStats } = await supabase
        .from('team_gamification')
        .select('total_achievements')
        .eq('team_id', teamId)
        .single()

      if (currentStats) {
        await supabase
          .from('team_gamification')
          .update({
            total_achievements: currentStats.total_achievements + 1
          })
          .eq('team_id', teamId)
      }
    } catch (error) {
      console.error('Error awarding team achievement:', error)
    }
  }

  private static async awardAchievement(userId: string, achievementId: string, xpReward: number, achievementName: string) {
    try {
      // Award achievement
      await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId
        })

      // Award XP
      await this.addUserXP(userId, xpReward, `Achievement: ${achievementName}`, achievementId)

      // Update achievement count
      const { data: currentStats } = await supabase
        .from('user_gamification')
        .select('total_achievements')
        .eq('user_id', userId)
        .single()

      if (currentStats) {
        await supabase
          .from('user_gamification')
          .update({
            total_achievements: currentStats.total_achievements + 1
          })
          .eq('user_id', userId)
      }

    } catch (error) {
      console.error('Error awarding achievement:', error)
    }
  }

  // Mission progress tracking
  private static async updateUserMissionProgress(userId: string, missionType: string, increment: number) {
    try {
      // Get active missions of this type
      const { data: missions } = await supabase
        .from('missions')
        .select('*')
        .eq('is_active', true)
        .eq('mission_type', 'individual')
        .or(`mission_type.eq.both`)

      if (!missions) return

      for (const mission of missions) {
        const criteria: MissionCriteria = mission.criteria
        
        // Check if this mission type matches
        let shouldUpdate = false
        if (missionType === 'trade_executed' && criteria.trades_count) shouldUpdate = true
        if (missionType === 'team_votes' && criteria.team_votes) shouldUpdate = true
        if (missionType === 'profit_made' && criteria.return_percentage) shouldUpdate = true

        if (!shouldUpdate) continue

        // Update or create progress
        const { data: existing } = await supabase
          .from('user_mission_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('mission_id', mission.id)
          .single()

        const newProgress = (existing?.current_progress || 0) + increment
        const isCompleted = newProgress >= mission.target_value

        if (existing) {
          await supabase
            .from('user_mission_progress')
            .update({
              current_progress: newProgress,
              is_completed: isCompleted,
              completed_at: isCompleted ? new Date().toISOString() : null,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
        } else {
          await supabase
            .from('user_mission_progress')
            .insert({
              user_id: userId,
              mission_id: mission.id,
              current_progress: newProgress,
              is_completed: isCompleted,
              completed_at: isCompleted ? new Date().toISOString() : null
            })
        }

        // Award mission completion XP
        if (isCompleted && !existing?.is_completed) {
          await this.addUserXP(userId, mission.xp_reward, `Mission completed: ${mission.name}`, mission.id)
        }
      }
    } catch (error) {
      console.error('Error updating mission progress:', error)
    }
  }

  private static async updateTeamMissionProgress(teamId: string, missionType: string, increment: number) {
    try {
      // Get active team missions of this type
      const { data: missions } = await supabase
        .from('missions')
        .select('*')
        .eq('is_active', true)
        .eq('mission_type', 'team')

      if (!missions) return

      for (const mission of missions) {
        const criteria: MissionCriteria = mission.criteria
        
        // Check if this mission type matches
        let shouldUpdate = false
        if (missionType === 'trade_executed' && criteria.trades_count) shouldUpdate = true
        if (missionType === 'team_votes' && criteria.team_votes) shouldUpdate = true
        if (missionType === 'profit_made' && criteria.return_percentage) shouldUpdate = true
        if (missionType === 'watchlist_add' && criteria.unique_stocks) shouldUpdate = true

        if (!shouldUpdate) continue

        // Update or create progress
        const { data: existing } = await supabase
          .from('team_mission_progress')
          .select('*')
          .eq('team_id', teamId)
          .eq('mission_id', mission.id)
          .single()

        const newProgress = (existing?.current_progress || 0) + increment
        const isCompleted = newProgress >= mission.target_value

        if (existing) {
          await supabase
            .from('team_mission_progress')
            .update({
              current_progress: newProgress,
              is_completed: isCompleted,
              completed_at: isCompleted ? new Date().toISOString() : null,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
        } else {
          await supabase
            .from('team_mission_progress')
            .insert({
              team_id: teamId,
              mission_id: mission.id,
              current_progress: newProgress,
              is_completed: isCompleted,
              completed_at: isCompleted ? new Date().toISOString() : null
            })
        }

        // Award mission completion XP
        if (isCompleted && !existing?.is_completed) {
          await this.addTeamXP(teamId, mission.xp_reward, `Mission completed: ${mission.name}`, mission.id)
        }
      }
    } catch (error) {
      console.error('Error updating team mission progress:', error)
    }
  }

  // Specialized achievement checks
  private static async checkDiversificationAchievements(userId?: string, teamId?: string, stockSymbol?: string) {
    if (userId && stockSymbol) {
      const { data: trades } = await supabase
        .from('individual_trades')
        .select('stock')
        .eq('user_id', userId)

      const uniqueStocks = new Set(trades?.map(t => t.stock) || []).size
      
      // Check diversification achievements
      const diversificationMilestones = [
        { stocks: 3, xp: 100, name: 'Getting Diverse' },
        { stocks: 5, xp: 200, name: 'Diversification Master' },
        { stocks: 10, xp: 500, name: 'Portfolio Wizard' }
      ]

      for (const milestone of diversificationMilestones) {
        if (uniqueStocks >= milestone.stocks) {
          // Check if already earned
          const { data: existing } = await supabase
            .from('user_achievements')
            .select('id')
            .eq('user_id', userId)
            .eq('achievement_id', `diversification_${milestone.stocks}`)
            .single()

          if (!existing) {
            await this.addUserXP(userId, milestone.xp, milestone.name)
          }
        }
      }
    }

    if (teamId && stockSymbol) {
      const { data: trades } = await supabase
        .from('trades')
        .select('stock')
        .eq('team_id', teamId)

      const uniqueStocks = new Set(trades?.map(t => t.stock) || []).size
      
      // Similar logic for team diversification
      if (uniqueStocks >= 5) {
        await this.addTeamXP(teamId, 200, 'Team Diversification Achievement')
      }
    }
  }

  private static async checkStreakAchievements(userId: string, streak: number) {
    const streakMilestones = [3, 7, 14, 30, 60, 100]
    
    for (const milestone of streakMilestones) {
      if (streak === milestone) {
        // Award streak achievement
        const xpReward = milestone * 10
        await this.addUserXP(userId, xpReward, `${milestone}-day streak achievement`)
      }
    }
  }

  private static async checkLevelAchievements(userId: string, level: number) {
    const levelMilestones = [5, 10, 25, 50, 100]
    
    for (const milestone of levelMilestones) {
      if (level === milestone) {
        const xpReward = milestone * 50
        await this.addUserXP(userId, xpReward, `Level ${milestone} achievement`)
      }
    }
  }

  // Utility functions
  private static calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1
  }

  static getXPForNextLevel(level: number): number {
    return (level * level) * 100
  }

  // Power-up management
  static async activatePowerUp(userId: string, powerUpId: string) {
    try {
      const { data: powerUp } = await supabase
        .from('power_ups')
        .select('*')
        .eq('id', powerUpId)
        .single()

      if (!powerUp) throw new Error('Power-up not found')

      // Check if user already has this power-up active
      const { data: existingPowerUp } = await supabase
        .from('user_active_power_ups')
        .select('*')
        .eq('user_id', userId)
        .eq('power_up_id', powerUpId)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (existingPowerUp) {
        return { success: false, message: `${powerUp.name} is already active!` }
      }

      const { data: userGamification } = await supabase
        .from('user_gamification')
        .select('xp')
        .eq('user_id', userId)
        .single()

      if (!userGamification || userGamification.xp < powerUp.cost_xp) {
        return { success: false, message: `Insufficient XP! Need ${powerUp.cost_xp} XP, have ${userGamification?.xp || 0} XP` }
      }

      // Deduct XP
      await supabase
        .from('xp_transactions')
        .insert({
          user_id: userId,
          xp_amount: -powerUp.cost_xp,
          reason: `Power-up: ${powerUp.name}`,
          transaction_type: 'spent',
          reference_id: powerUpId
        })

      await supabase
        .from('user_gamification')
        .update({
          xp: userGamification.xp - powerUp.cost_xp
        })
        .eq('user_id', userId)

      // Activate power-up
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + powerUp.duration_hours)

      await supabase
        .from('user_active_power_ups')
        .insert({
          user_id: userId,
          power_up_id: powerUpId,
          expires_at: expiresAt.toISOString()
        })

      return { success: true, message: `${powerUp.name} activated for ${powerUp.duration_hours} hours!` }
    } catch (error) {
      console.error('Error activating power-up:', error)
      return { success: false, message: error instanceof Error ? error.message : 'Failed to activate power-up' }
    }
  }

  // Clean up expired power-ups
  static async cleanupExpiredPowerUps() {
    try {
      const now = new Date().toISOString()
      
      await Promise.all([
        supabase
          .from('user_active_power_ups')
          .delete()
          .lt('expires_at', now),
        supabase
          .from('team_active_power_ups')
          .delete()
          .lt('expires_at', now)
      ])
    } catch (error) {
      console.error('Error cleaning up expired power-ups:', error)
    }
  }

  // Get leaderboard data
  static async getUserLeaderboard(limit: number = 10) {
    try {
      const { data } = await supabase
        .from('user_gamification')
        .select(`
          user_id,
          level,
          xp,
          daily_streak,
          total_achievements
        `)
        .order('xp', { ascending: false })
        .limit(limit)

      return data || []
    } catch (error) {
      console.error('Error getting user leaderboard:', error)
      return []
    }
  }

  static async getTeamLeaderboard(limit: number = 10) {
    try {
      const { data } = await supabase
        .from('team_gamification')
        .select(`
          team_id,
          level,
          xp,
          daily_streak,
          total_achievements,
          teams (name)
        `)
        .order('xp', { ascending: false })
        .limit(limit)

      return data || []
    } catch (error) {
      console.error('Error getting team leaderboard:', error)
      return []
    }
  }
}