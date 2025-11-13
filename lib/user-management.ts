// User Management System
import { query } from './db';

export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  xp: number;
  level: number;
  achievements: string[];
  role: 'student' | 'educator' | 'professional' | 'admin';
  profileImage?: string;
  bio?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: string;
}

export class UserManagement {
  private achievements: Achievement[] = [
    {
      id: 'first_trade',
      name: 'First Trade',
      description: 'Complete your first trade',
      icon: '🎯',
      xpReward: 50,
      condition: 'trade_count >= 1'
    },
    {
      id: 'trader_10',
      name: 'Active Trader',
      description: 'Complete 10 trades',
      icon: '📈',
      xpReward: 100,
      condition: 'trade_count >= 10'
    },
    {
      id: 'profitable_week',
      name: 'Profitable Week',
      description: 'Make profit for 7 consecutive days',
      icon: '💰',
      xpReward: 200,
      condition: 'profitable_days >= 7'
    },
    {
      id: 'level_5',
      name: 'Rising Star',
      description: 'Reach level 5',
      icon: '⭐',
      xpReward: 150,
      condition: 'level >= 5'
    },
    {
      id: 'portfolio_10k',
      name: 'Portfolio Builder',
      description: 'Build a portfolio worth $10,000+',
      icon: '🏆',
      xpReward: 300,
      condition: 'portfolio_value >= 10000'
    }
  ];

  async createUser(userData: {
    username: string;
    email: string;
    password?: string;
    role?: 'student' | 'educator' | 'professional' | 'admin';
    initialBalance?: number;
  }): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      const { username, email, password, role = 'student', initialBalance = 10000 } = userData;

      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email]
      );

      if ((existingUser as any[]).length > 0) {
        return { success: false, error: 'User already exists' };
      }

      // Create user
      const result = await query(`
        INSERT INTO users (username, email, password_hash, balance, xp, level, role, achievements, created_at)
        VALUES (?, ?, ?, ?, 0, 1, ?, '[]', NOW())
      `, [username, email, password || null, initialBalance, role]);

      const userId = (result as any).insertId.toString();

      // Log activity
      await this.logActivity(userId, 'user_created', 'User account created');

      return { success: true, userId };
    } catch (error) {
      console.error('Error creating user:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      const result = await query('SELECT * FROM users WHERE id = ?', [userId]);
      const user = (result as any[])[0];

      if (!user) return null;

      return {
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        balance: parseFloat(user.balance),
        xp: user.xp,
        level: user.level,
        achievements: user.achievements ? JSON.parse(user.achievements) : [],
        role: user.role,
        profileImage: user.profile_image,
        bio: user.bio,
        createdAt: new Date(user.created_at),
        lastLogin: user.last_login ? new Date(user.last_login) : undefined
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.username) {
        updateFields.push('username = ?');
        updateValues.push(updates.username);
      }
      if (updates.email) {
        updateFields.push('email = ?');
        updateValues.push(updates.email);
      }
      if (updates.balance !== undefined) {
        updateFields.push('balance = ?');
        updateValues.push(updates.balance);
      }
      if (updates.xp !== undefined) {
        updateFields.push('xp = ?');
        updateValues.push(updates.xp);
      }
      if (updates.level !== undefined) {
        updateFields.push('level = ?');
        updateValues.push(updates.level);
      }
      if (updates.achievements) {
        updateFields.push('achievements = ?');
        updateValues.push(JSON.stringify(updates.achievements));
      }
      if (updates.profileImage) {
        updateFields.push('profile_image = ?');
        updateValues.push(updates.profileImage);
      }
      if (updates.bio) {
        updateFields.push('bio = ?');
        updateValues.push(updates.bio);
      }

      if (updateFields.length === 0) return false;

      updateFields.push('updated_at = NOW()');
      updateValues.push(userId);

      await query(`
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  async addXP(userId: string, xpAmount: number, reason?: string): Promise<boolean> {
    try {
      // Get current user data
      const user = await this.getUser(userId);
      if (!user) return false;

      const newXP = user.xp + xpAmount;
      const newLevel = Math.floor(newXP / 100) + 1;
      const leveledUp = newLevel > user.level;

      // Update XP and level
      await query(`
        UPDATE users 
        SET xp = ?, level = ?, updated_at = NOW()
        WHERE id = ?
      `, [newXP, newLevel, userId]);

      // Log activity
      await this.logActivity(userId, 'xp_gained', `Gained ${xpAmount} XP${reason ? ` for ${reason}` : ''}`, {
        xpAmount,
        newXP,
        newLevel,
        leveledUp
      });

      // Check for achievements
      await this.checkAchievements(userId);

      return true;
    } catch (error) {
      console.error('Error adding XP:', error);
      return false;
    }
  }

  async checkAchievements(userId: string): Promise<string[]> {
    try {
      const user = await this.getUser(userId);
      if (!user) return [];

      // Get user stats
      const tradeCount = await this.getUserTradeCount(userId);
      const portfolioValue = await this.getUserPortfolioValue(userId);

      const newAchievements: string[] = [];

      for (const achievement of this.achievements) {
        if (user.achievements.includes(achievement.id)) continue;

        let earned = false;

        switch (achievement.condition) {
          case 'trade_count >= 1':
            earned = tradeCount >= 1;
            break;
          case 'trade_count >= 10':
            earned = tradeCount >= 10;
            break;
          case 'level >= 5':
            earned = user.level >= 5;
            break;
          case 'portfolio_value >= 10000':
            earned = portfolioValue >= 10000;
            break;
        }

        if (earned) {
          newAchievements.push(achievement.id);
          user.achievements.push(achievement.id);

          // Award XP for achievement
          await this.addXP(userId, achievement.xpReward, `earning ${achievement.name} achievement`);

          // Log achievement
          await this.logActivity(userId, 'achievement_earned', `Earned achievement: ${achievement.name}`, {
            achievementId: achievement.id,
            xpReward: achievement.xpReward
          });
        }
      }

      if (newAchievements.length > 0) {
        await query(`
          UPDATE users 
          SET achievements = ?, updated_at = NOW()
          WHERE id = ?
        `, [JSON.stringify(user.achievements), userId]);
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  async getUserTradeCount(userId: string): Promise<number> {
    try {
      const result = await query('SELECT COUNT(*) as count FROM trades WHERE user_id = ?', [userId]);
      return (result as any[])[0]?.count || 0;
    } catch (error) {
      console.error('Error getting trade count:', error);
      return 0;
    }
  }

  async getUserPortfolioValue(userId: string): Promise<number> {
    try {
      const result = await query('SELECT balance FROM users WHERE id = ?', [userId]);
      return parseFloat((result as any[])[0]?.balance || 0);
    } catch (error) {
      console.error('Error getting portfolio value:', error);
      return 0;
    }
  }

  async logActivity(userId: string, activityType: string, description: string, metadata?: any): Promise<void> {
    try {
      await query(`
        INSERT INTO activity_logs (user_id, activity_type, description, metadata, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `, [userId, activityType, description, metadata ? JSON.stringify(metadata) : null]);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  async getUserActivity(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const result = await query(`
        SELECT * FROM activity_logs 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `, [userId, limit]);

      return (result as any[]).map(log => ({
        id: log.id,
        activityType: log.activity_type,
        description: log.description,
        metadata: log.metadata ? JSON.parse(log.metadata) : null,
        createdAt: new Date(log.created_at)
      }));
    } catch (error) {
      console.error('Error getting user activity:', error);
      return [];
    }
  }

  async getLeaderboard(type: 'xp' | 'level' | 'balance' = 'xp', limit: number = 10): Promise<any[]> {
    try {
      const orderBy = type === 'xp' ? 'xp DESC' : type === 'level' ? 'level DESC, xp DESC' : 'balance DESC';
      
      const result = await query(`
        SELECT id, username, balance, xp, level, profile_image
        FROM users 
        ORDER BY ${orderBy}
        LIMIT ?
      `, [limit]);

      return (result as any[]).map((user, index) => ({
        rank: index + 1,
        userId: user.id.toString(),
        username: user.username,
        balance: parseFloat(user.balance),
        xp: user.xp,
        level: user.level,
        profileImage: user.profile_image
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  getAchievements(): Achievement[] {
    return this.achievements;
  }

  getAchievement(achievementId: string): Achievement | undefined {
    return this.achievements.find(a => a.id === achievementId);
  }
}

export const userManagement = new UserManagement();