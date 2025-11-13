import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://demo.supabase.co' && supabaseAnonKey !== 'demo-key'
}

// Gamification service functions
export const gamificationService = {
  // Award XP to user or team
  async awardXP(userId: string | null, teamId: string | null, xpAmount: number, reason: string, referenceId?: string) {
    try {
      // Log XP transaction
      await supabase.from('xp_transactions').insert({
        user_id: userId,
        team_id: teamId,
        xp_amount: xpAmount,
        reason,
        transaction_type: 'earned',
        reference_id: referenceId
      })

      // Update user XP and level
      if (userId) {
        const { data: userGamification } = await supabase
          .from('user_gamification')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (userGamification) {
          const newXP = userGamification.xp + xpAmount
          const newLevel = Math.floor(newXP / 1000) + 1 // Level up every 1000 XP

          await supabase
            .from('user_gamification')
            .update({ 
              xp: newXP, 
              level: newLevel,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
        } else {
          // Create new user gamification record
          await supabase.from('user_gamification').insert({
            user_id: userId,
            xp: xpAmount,
            level: Math.floor(xpAmount / 1000) + 1
          })
        }
      }

      // Update team XP and level
      if (teamId) {
        const { data: teamGamification } = await supabase
          .from('team_gamification')
          .select('*')
          .eq('team_id', teamId)
          .single()

        if (teamGamification) {
          const newXP = teamGamification.xp + xpAmount
          const newLevel = Math.floor(newXP / 2500) + 1 // Team levels up every 2500 XP

          await supabase
            .from('team_gamification')
            .update({ 
              xp: newXP, 
              level: newLevel,
              updated_at: new Date().toISOString()
            })
            .eq('team_id', teamId)
        }
      }
    } catch (error) {
      console.error('Error awarding XP:', error)
    }
  },

  // Check and award achievements
  async checkAchievements(userId: string | null, teamId: string | null, eventData: any) {
    try {
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)

      if (!achievements) return

      for (const achievement of achievements) {
        const criteria = achievement.criteria as any
        let shouldAward = false

        // Check if achievement criteria is met
        if (criteria.trades_count && eventData.totalTrades >= criteria.trades_count) {
          shouldAward = true
        }
        if (criteria.daily_streak && eventData.dailyStreak >= criteria.daily_streak) {
          shouldAward = true
        }
        if (criteria.unique_stocks && eventData.uniqueStocks >= criteria.unique_stocks) {
          shouldAward = true
        }
        if (criteria.trade_value && eventData.tradeValue >= criteria.trade_value) {
          shouldAward = true
        }
        if (criteria.return_percentage && eventData.returnPercentage >= criteria.return_percentage) {
          shouldAward = true
        }

        if (shouldAward) {
          // Award to user
          if (userId && (achievement.achievement_type === 'individual' || achievement.achievement_type === 'both')) {
            const { data: existing } = await supabase
              .from('user_achievements')
              .select('id')
              .eq('user_id', userId)
              .eq('achievement_id', achievement.id)
              .single()

            if (!existing) {
              await supabase.from('user_achievements').insert({
                user_id: userId,
                achievement_id: achievement.id
              })
              
              // Award XP
              await this.awardXP(userId, null, achievement.xp_reward, `Achievement: ${achievement.name}`, achievement.id)
            }
          }

          // Award to team
          if (teamId && (achievement.achievement_type === 'team' || achievement.achievement_type === 'both')) {
            const { data: existing } = await supabase
              .from('team_achievements')
              .select('id')
              .eq('team_id', teamId)
              .eq('achievement_id', achievement.id)
              .single()

            if (!existing) {
              await supabase.from('team_achievements').insert({
                team_id: teamId,
                achievement_id: achievement.id
              })
              
              // Award XP
              await this.awardXP(null, teamId, achievement.xp_reward, `Team Achievement: ${achievement.name}`, achievement.id)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error)
    }
  },

  // Update daily streak
  async updateDailyStreak(userId: string | null, teamId: string | null) {
    try {
      const today = new Date().toISOString().split('T')[0]

      if (userId) {
        const { data: userGamification } = await supabase
          .from('user_gamification')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (userGamification) {
          const lastActivity = userGamification.last_activity_date
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split('T')[0]

          let newStreak = userGamification.daily_streak

          if (lastActivity === yesterdayStr) {
            // Consecutive day
            newStreak += 1
          } else if (lastActivity !== today) {
            // Streak broken
            newStreak = 1
          }

          await supabase
            .from('user_gamification')
            .update({
              daily_streak: newStreak,
              last_activity_date: today,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
        }
      }

      if (teamId) {
        const { data: teamGamification } = await supabase
          .from('team_gamification')
          .select('*')
          .eq('team_id', teamId)
          .single()

        if (teamGamification) {
          const lastActivity = teamGamification.last_activity_date
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split('T')[0]

          let newStreak = teamGamification.daily_streak

          if (lastActivity === yesterdayStr) {
            newStreak += 1
          } else if (lastActivity !== today) {
            newStreak = 1
          }

          await supabase
            .from('team_gamification')
            .update({
              daily_streak: newStreak,
              last_activity_date: today,
              updated_at: new Date().toISOString()
            })
            .eq('team_id', teamId)
        }
      }
    } catch (error) {
      console.error('Error updating daily streak:', error)
    }
  },

  // Update mission progress
  async updateMissionProgress(userId: string | null, teamId: string | null, eventData: any) {
    try {
      const { data: missions } = await supabase
        .from('missions')
        .select('*')
        .eq('is_active', true)

      if (!missions) return

      for (const mission of missions) {
        const criteria = mission.criteria as any
        let progressIncrement = 0

        // Calculate progress based on mission criteria
        if (criteria.trades_count) {
          progressIncrement = 1 // Each trade adds 1 to progress
        }
        if (criteria.unique_stocks && eventData.newStock) {
          progressIncrement = 1 // Each new stock adds 1 to progress
        }
        if (criteria.team_votes && eventData.teamVote) {
          progressIncrement = 1 // Each vote adds 1 to progress
        }

        if (progressIncrement > 0) {
          // Update user mission progress
          if (userId && (mission.mission_type === 'individual' || mission.mission_type === 'both')) {
            await this.updateUserMissionProgress(userId, mission.id, progressIncrement, mission.target_value)
          }

          // Update team mission progress
          if (teamId && (mission.mission_type === 'team' || mission.mission_type === 'both')) {
            await this.updateTeamMissionProgress(teamId, mission.id, progressIncrement, mission.target_value)
          }
        }
      }
    } catch (error) {
      console.error('Error updating mission progress:', error)
    }
  },

  // Helper function to update user mission progress
  async updateUserMissionProgress(userId: string, missionId: string, increment: number, target: number) {
    const { data: progress } = await supabase
      .from('user_mission_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .single()

    if (progress) {
      const newProgress = Math.min(progress.current_progress + increment, target)
      const isCompleted = newProgress >= target

      await supabase
        .from('user_mission_progress')
        .update({
          current_progress: newProgress,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('mission_id', missionId)
    } else {
      const newProgress = Math.min(increment, target)
      const isCompleted = newProgress >= target

      await supabase.from('user_mission_progress').insert({
        user_id: userId,
        mission_id: missionId,
        current_progress: newProgress,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      })
    }
  },

  // Helper function to update team mission progress
  async updateTeamMissionProgress(teamId: string, missionId: string, increment: number, target: number) {
    const { data: progress } = await supabase
      .from('team_mission_progress')
      .select('*')
      .eq('team_id', teamId)
      .eq('mission_id', missionId)
      .single()

    if (progress) {
      const newProgress = Math.min(progress.current_progress + increment, target)
      const isCompleted = newProgress >= target

      await supabase
        .from('team_mission_progress')
        .update({
          current_progress: newProgress,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('team_id', teamId)
        .eq('mission_id', missionId)
    } else {
      const newProgress = Math.min(increment, target)
      const isCompleted = newProgress >= target

      await supabase.from('team_mission_progress').insert({
        team_id: teamId,
        mission_id: missionId,
        current_progress: newProgress,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      })
    }
  },

  // Activate power-up
  async activatePowerUp(userId: string | null, teamId: string | null, powerUpId: string) {
    try {
      const { data: powerUp } = await supabase
        .from('power_ups')
        .select('*')
        .eq('id', powerUpId)
        .single()

      if (!powerUp) return { success: false, error: 'Power-up not found' }

      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + powerUp.duration_hours)

      if (userId) {
        // Check if user has enough XP
        const { data: userGamification } = await supabase
          .from('user_gamification')
          .select('xp')
          .eq('user_id', userId)
          .single()

        if (!userGamification || userGamification.xp < powerUp.cost_xp) {
          return { success: false, error: 'Insufficient XP' }
        }

        // Deduct XP and activate power-up
        await supabase
          .from('user_gamification')
          .update({ xp: userGamification.xp - powerUp.cost_xp })
          .eq('user_id', userId)

        await supabase.from('user_active_power_ups').insert({
          user_id: userId,
          power_up_id: powerUpId,
          expires_at: expiresAt.toISOString()
        })
      }

      if (teamId) {
        // Similar logic for team power-ups
        const { data: teamGamification } = await supabase
          .from('team_gamification')
          .select('xp')
          .eq('team_id', teamId)
          .single()

        if (!teamGamification || teamGamification.xp < powerUp.cost_xp) {
          return { success: false, error: 'Insufficient team XP' }
        }

        await supabase
          .from('team_gamification')
          .update({ xp: teamGamification.xp - powerUp.cost_xp })
          .eq('team_id', teamId)

        await supabase.from('team_active_power_ups').insert({
          team_id: teamId,
          power_up_id: powerUpId,
          expires_at: expiresAt.toISOString()
        })
      }

      return { success: true }
    } catch (error) {
      console.error('Error activating power-up:', error)
      return { success: false, error: 'Failed to activate power-up' }
    }
  }
}