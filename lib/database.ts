import mysql from 'mysql2/promise'
import type { RowDataPacket, ResultSetHeader, FieldPacket } from 'mysql2'

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trading_platform',
  port: parseInt(process.env.DB_PORT || '3306'),
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
}

// Create connection pool
let pool: mysql.Pool | null = null

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Check if database is properly configured
export const isDatabaseConfigured = () => {
  return !!(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME)
}

// Execute query helper
export const executeQuery = async (query: string, params: any[] = []) => {
  try {
    const connection = getPool()
    const [rows] = await connection.execute(query, params)
    return { data: rows as RowDataPacket[], error: null }
  } catch (error) {
    console.error('Database query error:', error)
    return { data: null, error: error instanceof Error ? error.message : 'Database error' }
  }
}

// Generate UUID for MySQL (since MySQL doesn't have UUID() by default in older versions)
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Database service functions (replacing Supabase client)
export const db = {
  // Generic select
  async select(table: string, columns = '*', where?: { [key: string]: any }, orderBy?: string) {
    let query = `SELECT ${columns} FROM ${table}`
    const params: any[] = []

    if (where) {
      const conditions = Object.keys(where).map(key => {
        params.push(where[key])
        return `${key} = ?`
      }).join(' AND ')
      query += ` WHERE ${conditions}`
    }

    if (orderBy) {
      query += ` ORDER BY ${orderBy}`
    }

    return executeQuery(query, params)
  },

  // Generic insert
  async insert(table: string, data: { [key: string]: any }) {
    const columns = Object.keys(data).join(', ')
    const placeholders = Object.keys(data).map(() => '?').join(', ')
    const values = Object.values(data)

    // Add UUID if id is not provided
    if (!data.id && table !== 'individual_users') {
      data.id = generateUUID()
      const query = `INSERT INTO ${table} (id, ${columns}) VALUES (?, ${placeholders})`
      return executeQuery(query, [data.id, ...values])
    }

    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`
    return executeQuery(query, values)
  },

  // Generic update
  async update(table: string, data: { [key: string]: any }, where: { [key: string]: any }) {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ')
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ')

    const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`
    const params = [...Object.values(data), ...Object.values(where)]

    return executeQuery(query, params)
  },

  // Generic delete
  async delete(table: string, where: { [key: string]: any }) {
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ')
    const query = `DELETE FROM ${table} WHERE ${whereClause}`
    const params = Object.values(where)

    return executeQuery(query, params)
  },

  // Get single record
  async findOne(table: string, where: { [key: string]: any }) {
    const result = await this.select(table, '*', where)
    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
      return { data: result.data[0] as RowDataPacket, error: null }
    }
    return { data: null, error: null }
  },

  // Custom query for complex operations
  async query(sql: string, params: any[] = []) {
    return executeQuery(sql, params)
  }
}

// Gamification service functions (adapted from Supabase version)
export const gamificationService = {
  // Award XP to user or team
  async awardXP(userId: string | null, teamId: string | null, xpAmount: number, reason: string, referenceId?: string) {
    try {
      // Log XP transaction
      await db.insert('xp_transactions', {
        user_id: userId,
        team_id: teamId,
        xp_amount: xpAmount,
        reason,
        transaction_type: 'earned',
        reference_id: referenceId
      })

      // Update user XP and level
      if (userId) {
        const { data: userGamification } = await db.findOne('user_gamification', { user_id: userId })

        if (userGamification) {
          const newXP = (userGamification as any).xp + xpAmount
          const newLevel = Math.floor(newXP / 1000) + 1 // Level up every 1000 XP

          await db.update('user_gamification', {
            xp: newXP,
            level: newLevel,
            updated_at: new Date()
          }, { user_id: userId })
        } else {
          // Create new user gamification record
          await db.insert('user_gamification', {
            user_id: userId,
            xp: xpAmount,
            level: Math.floor(xpAmount / 1000) + 1
          })
        }
      }

      // Update team XP and level
      if (teamId) {
        const { data: teamGamification } = await db.findOne('team_gamification', { team_id: teamId })

        if (teamGamification) {
          const newXP = (teamGamification as any).xp + xpAmount
          const newLevel = Math.floor(newXP / 2500) + 1 // Team levels up every 2500 XP

          await db.update('team_gamification', {
            xp: newXP,
            level: newLevel,
            updated_at: new Date()
          }, { team_id: teamId })
        }
      }
    } catch (error) {
      console.error('Error awarding XP:', error)
    }
  },

  // Check and award achievements
  async checkAchievements(userId: string | null, teamId: string | null, eventData: any) {
    try {
      const { data: achievements } = await db.select('achievements', '*', { is_active: true })

      if (!achievements || !Array.isArray(achievements)) return

      for (const achievement of achievements) {
        const criteria = JSON.parse((achievement as any).criteria as string)
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
          if (userId && ((achievement as any).achievement_type === 'individual' || (achievement as any).achievement_type === 'both')) {
            const { data: existing } = await db.findOne('user_achievements', {
              user_id: userId,
              achievement_id: (achievement as any).id
            })

            if (!existing) {
              await db.insert('user_achievements', {
                user_id: userId,
                achievement_id: (achievement as any).id
              })

              // Award XP
              await this.awardXP(userId, null, (achievement as any).xp_reward, `Achievement: ${(achievement as any).name}`, (achievement as any).id)
            }
          }

          // Award to team
          if (teamId && ((achievement as any).achievement_type === 'team' || (achievement as any).achievement_type === 'both')) {
            const { data: existing } = await db.findOne('team_achievements', {
              team_id: teamId,
              achievement_id: (achievement as any).id
            })

            if (!existing) {
              await db.insert('team_achievements', {
                team_id: teamId,
                achievement_id: (achievement as any).id
              })

              // Award XP
              await this.awardXP(null, teamId, (achievement as any).xp_reward, `Team Achievement: ${(achievement as any).name}`, (achievement as any).id)
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
        const { data: userGamification } = await db.findOne('user_gamification', { user_id: userId })

        if (userGamification) {
          const lastActivity = (userGamification as any).last_activity_date
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split('T')[0]

          let newStreak = (userGamification as any).daily_streak

          if (lastActivity === yesterdayStr) {
            // Consecutive day
            newStreak += 1
          } else if (lastActivity !== today) {
            // Streak broken
            newStreak = 1
          }

          await db.update('user_gamification', {
            daily_streak: newStreak,
            last_activity_date: today,
            updated_at: new Date()
          }, { user_id: userId })
        }
      }

      if (teamId) {
        const { data: teamGamification } = await db.findOne('team_gamification', { team_id: teamId })

        if (teamGamification) {
          const lastActivity = (teamGamification as any).last_activity_date
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split('T')[0]

          let newStreak = (teamGamification as any).daily_streak

          if (lastActivity === yesterdayStr) {
            newStreak += 1
          } else if (lastActivity !== today) {
            newStreak = 1
          }

          await db.update('team_gamification', {
            daily_streak: newStreak,
            last_activity_date: today,
            updated_at: new Date()
          }, { team_id: teamId })
        }
      }
    } catch (error) {
      console.error('Error updating daily streak:', error)
    }
  }
}