import { supabase } from './supabase'

export interface CreateAchievementData {
  name: string
  description: string
  icon: string
  xp_reward: number
  achievement_type: 'individual' | 'team' | 'both'
  criteria: any
}

export interface CreateMissionData {
  name: string
  description: string
  mission_type: 'individual' | 'team'
  target_value: number
  xp_reward: number
  badge_reward?: string
  criteria: any
  end_date?: string
}

export interface CreatePowerUpData {
  name: string
  description: string
  icon: string
  duration_hours: number
  effect_type: 'xp_boost' | 'market_intel' | 'trade_discount' | 'streak_protection'
  effect_value: number
  cost_xp: number
}

export class GamificationAPI {
  
  // Achievement Management
  static async createAchievement(data: CreateAchievementData) {
    try {
      const { data: achievement, error } = await supabase
        .from('achievements')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return { success: true, data: achievement }
    } catch (error) {
      console.error('Error creating achievement:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async updateAchievement(id: string, data: Partial<CreateAchievementData>) {
    try {
      const { data: achievement, error } = await supabase
        .from('achievements')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data: achievement }
    } catch (error) {
      console.error('Error updating achievement:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async deleteAchievement(id: string) {
    try {
      const { error } = await supabase
        .from('achievements')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting achievement:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async getAchievements(type?: 'individual' | 'team' | 'both') {
    try {
      let query = supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (type) {
        query = query.in('achievement_type', [type, 'both'])
      }

      const { data, error } = await query

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error getting achievements:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Mission Management
  static async createMission(data: CreateMissionData) {
    try {
      const { data: mission, error } = await supabase
        .from('missions')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return { success: true, data: mission }
    } catch (error) {
      console.error('Error creating mission:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async updateMission(id: string, data: Partial<CreateMissionData>) {
    try {
      const { data: mission, error } = await supabase
        .from('missions')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data: mission }
    } catch (error) {
      console.error('Error updating mission:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async getMissions(type?: 'individual' | 'team') {
    try {
      let query = supabase
        .from('missions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (type) {
        query = query.eq('mission_type', type)
      }

      const { data, error } = await query

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error getting missions:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Power-up Management
  static async createPowerUp(data: CreatePowerUpData) {
    try {
      const { data: powerUp, error } = await supabase
        .from('power_ups')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return { success: true, data: powerUp }
    } catch (error) {
      console.error('Error creating power-up:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async updatePowerUp(id: string, data: Partial<CreatePowerUpData>) {
    try {
      const { data: powerUp, error } = await supabase
        .from('power_ups')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data: powerUp }
    } catch (error) {
      console.error('Error updating power-up:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async getPowerUps() {
    try {
      const { data, error } = await supabase
        .from('power_ups')
        .select('*')
        .eq('is_active', true)
        .order('cost_xp', { ascending: true })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error getting power-ups:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // User Gamification Data
  static async getUserGamificationStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { success: true, data: data || null }
    } catch (error) {
      console.error('Error getting user gamification stats:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async getUserAchievements(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements (*)
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error getting user achievements:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async getUserActivePowerUps(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_active_power_ups')
        .select(`
          *,
          power_ups (*)
        `)
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('activated_at', { ascending: false })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error getting user active power-ups:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async getUserMissionProgress(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_mission_progress')
        .select(`
          *,
          missions (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error getting user mission progress:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Team Gamification Data
  static async getTeamGamificationStats(teamId: string) {
    try {
      const { data, error } = await supabase
        .from('team_gamification')
        .select('*')
        .eq('team_id', teamId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { success: true, data: data || null }
    } catch (error) {
      console.error('Error getting team gamification stats:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async getTeamAchievements(teamId: string) {
    try {
      const { data, error } = await supabase
        .from('team_achievements')
        .select(`
          *,
          achievements (*)
        `)
        .eq('team_id', teamId)
        .order('earned_at', { ascending: false })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error getting team achievements:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async getTeamActivePowerUps(teamId: string) {
    try {
      const { data, error } = await supabase
        .from('team_active_power_ups')
        .select(`
          *,
          power_ups (*)
        `)
        .eq('team_id', teamId)
        .gt('expires_at', new Date().toISOString())
        .order('activated_at', { ascending: false })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error getting team active power-ups:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async getTeamMissionProgress(teamId: string) {
    try {
      const { data, error } = await supabase
        .from('team_mission_progress')
        .select(`
          *,
          missions (*)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error getting team mission progress:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // XP Transactions
  static async getXPTransactions(userId?: string, teamId?: string, limit: number = 50) {
    try {
      let query = supabase
        .from('xp_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (userId) {
        query = query.eq('user_id', userId)
      }
      if (teamId) {
        query = query.eq('team_id', teamId)
      }

      const { data, error } = await query

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error getting XP transactions:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Leaderboards
  static async getGlobalLeaderboard(type: 'user' | 'team' = 'user', limit: number = 10) {
    try {
      const table = type === 'user' ? 'user_gamification' : 'team_gamification'
      const { data, error } = await supabase
        .from(table)
        .select(type === 'user' ? 
          'user_id, level, xp, daily_streak, total_achievements' :
          'team_id, level, xp, daily_streak, total_achievements, teams(name)'
        )
        .order('xp', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Analytics
  static async getGamificationAnalytics(userId?: string, teamId?: string) {
    try {
      const analytics: any = {}

      // XP earned over time
      const { data: xpData } = await supabase
        .from('xp_transactions')
        .select('xp_amount, created_at, transaction_type')
        .eq(userId ? 'user_id' : 'team_id', userId || teamId)
        .eq('transaction_type', 'earned')
        .order('created_at', { ascending: true })

      analytics.xpOverTime = xpData || []

      // Achievement distribution
      const achievementTable = userId ? 'user_achievements' : 'team_achievements'
      const idField = userId ? 'user_id' : 'team_id'
      
      const { data: achievementData } = await supabase
        .from(achievementTable)
        .select(`
          achievements (achievement_type, xp_reward)
        `)
        .eq(idField, userId || teamId)

      analytics.achievementDistribution = achievementData || []

      // Mission completion rate
      const missionTable = userId ? 'user_mission_progress' : 'team_mission_progress'
      
      const { data: missionData } = await supabase
        .from(missionTable)
        .select('is_completed, missions(name)')
        .eq(idField, userId || teamId)

      const totalMissions = missionData?.length || 0
      const completedMissions = missionData?.filter(m => m.is_completed).length || 0
      
      analytics.missionStats = {
        total: totalMissions,
        completed: completedMissions,
        completionRate: totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0
      }

      return { success: true, data: analytics }
    } catch (error) {
      console.error('Error getting gamification analytics:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Bulk operations
  static async bulkAwardXP(awards: Array<{ userId?: string; teamId?: string; amount: number; reason: string }>) {
    try {
      const transactions = awards.map(award => ({
        user_id: award.userId,
        team_id: award.teamId,
        xp_amount: award.amount,
        reason: award.reason,
        transaction_type: 'earned' as const
      }))

      const { error } = await supabase
        .from('xp_transactions')
        .insert(transactions)

      if (error) throw error

      // Update gamification stats for each user/team
      for (const award of awards) {
        if (award.userId) {
          const { data: current } = await supabase
            .from('user_gamification')
            .select('xp, level')
            .eq('user_id', award.userId)
            .single()

          if (current) {
            const newXP = current.xp + award.amount
            const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1

            await supabase
              .from('user_gamification')
              .update({
                xp: newXP,
                level: newLevel,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', award.userId)
          }
        }

        if (award.teamId) {
          const { data: current } = await supabase
            .from('team_gamification')
            .select('xp, level')
            .eq('team_id', award.teamId)
            .single()

          if (current) {
            const newXP = current.xp + award.amount
            const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1

            await supabase
              .from('team_gamification')
              .update({
                xp: newXP,
                level: newLevel,
                updated_at: new Date().toISOString()
              })
              .eq('team_id', award.teamId)
          }
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error bulk awarding XP:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}