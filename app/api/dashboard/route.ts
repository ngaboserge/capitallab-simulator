import { NextRequest, NextResponse } from 'next/server';
import { enhancedTradingService } from '@/lib/enhanced-trading-service';
import { userManagement } from '@/lib/user-management';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'individual';

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    switch (type) {
      case 'individual':
        return await getIndividualDashboard(userId);
      case 'team':
        const teamId = searchParams.get('teamId');
        return await getTeamDashboard(userId, teamId);
      case 'platform':
        return await getPlatformDashboard(userId);
      default:
        return NextResponse.json({ error: 'Invalid dashboard type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

async function getIndividualDashboard(userId: string) {
  try {
    // Get user stats
    const userStats = await enhancedTradingService.getUserStats(userId);
    if (!userStats) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get portfolio
    const portfolio = await enhancedTradingService.getPortfolio(userId);

    // Get recent trades
    const recentTrades = await enhancedTradingService.getUserTrades(userId, 10);

    // Get recent activity
    const recentActivity = await userManagement.getUserActivity(userId, 10);

    // Get achievements
    const user = await userManagement.getUser(userId);
    const allAchievements = userManagement.getAchievements();
    const earnedAchievements = user?.achievements || [];

    // Get market data
    const marketData = await enhancedTradingService.getMarketData();

    // Get user rank
    const leaderboard = await userManagement.getLeaderboard('xp', 1000);
    const userRank = leaderboard.findIndex(entry => entry.userId === userId) + 1;

    return NextResponse.json({
      type: 'individual',
      user: userStats,
      portfolio,
      recentTrades,
      recentActivity,
      achievements: {
        earned: earnedAchievements.length,
        total: allAchievements.length,
        recent: earnedAchievements.slice(-3)
      },
      marketData: marketData?.slice(0, 5),
      rank: {
        position: userRank || null,
        total: leaderboard.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting individual dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch individual dashboard' }, { status: 500 });
  }
}

async function getTeamDashboard(userId: string, teamId?: string | null) {
  try {
    // Get user's teams if no specific team
    let teams;
    if (teamId) {
      const teamResult = await query(`
        SELECT t.*, tm.role
        FROM teams t
        LEFT JOIN team_members tm ON t.id = tm.team_id
        WHERE t.id = ? AND tm.user_id = ?
      `, [teamId, userId]);
      teams = teamResult;
    } else {
      const teamsResult = await query(`
        SELECT t.*, tm.role
        FROM teams t
        LEFT JOIN team_members tm ON t.id = tm.team_id
        WHERE tm.user_id = ?
        ORDER BY tm.joined_at DESC
      `, [userId]);
      teams = teamsResult;
    }

    if (!teams || (teams as any[]).length === 0) {
      return NextResponse.json({
        type: 'team',
        teams: [],
        message: 'No teams found'
      });
    }

    const teamData = await Promise.all((teams as any[]).map(async (team) => {
      // Get team members
      const membersResult = await query(`
        SELECT tm.*, u.username, u.xp, u.level
        FROM team_members tm
        LEFT JOIN users u ON tm.user_id = u.id
        WHERE tm.team_id = ?
      `, [team.id]);

      // Get team trades
      const tradesResult = await query(`
        SELECT * FROM team_trades
        WHERE team_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      `, [team.id]);

      // Get team activity
      const activityResult = await query(`
        SELECT al.*, u.username
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE al.team_id = ?
        ORDER BY al.created_at DESC
        LIMIT 10
      `, [team.id]);

      return {
        id: team.id.toString(),
        name: team.name,
        description: team.description,
        teamType: team.team_type,
        balance: parseFloat(team.balance),
        xp: team.xp,
        level: team.level,
        userRole: team.role,
        members: (membersResult as any[]).map(member => ({
          userId: member.user_id.toString(),
          username: member.username,
          role: member.role,
          xp: member.xp,
          level: member.level
        })),
        recentTrades: (tradesResult as any[]).map(trade => ({
          id: trade.id.toString(),
          symbol: trade.symbol,
          type: trade.type,
          quantity: trade.quantity,
          price: parseFloat(trade.price),
          totalValue: parseFloat(trade.total_value),
          createdAt: new Date(trade.created_at)
        })),
        recentActivity: (activityResult as any[]).map(activity => ({
          id: activity.id,
          username: activity.username,
          activityType: activity.activity_type,
          description: activity.description,
          createdAt: new Date(activity.created_at)
        }))
      };
    }));

    return NextResponse.json({
      type: 'team',
      teams: teamData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting team dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch team dashboard' }, { status: 500 });
  }
}

async function getPlatformDashboard(userId: string) {
  try {
    // Get user stats
    const userStats = await enhancedTradingService.getUserStats(userId);
    if (!userStats) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get portfolio
    const portfolio = await enhancedTradingService.getPortfolio(userId);

    // Get user's teams
    const userTeams = await query(`
      SELECT t.*, tm.role
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = ?
    `, [userId]);

    // Get CapitalLab progress
    const capitalLabProgress = await query(`
      SELECT * FROM capitallab_roles WHERE user_id = ?
    `, [userId]);

    // Get global leaderboards
    const xpLeaderboard = await userManagement.getLeaderboard('xp', 5);
    const portfolioLeaderboard = await enhancedTradingService.getLeaderboard('portfolio', 5);

    // Get platform stats
    const platformStats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM teams) as total_teams,
        (SELECT COUNT(*) FROM trades) as total_trades,
        (SELECT SUM(balance) FROM users) as total_balance
    `);

    const stats = (platformStats as any[])[0];

    // Get recent global activity
    const globalActivity = await query(`
      SELECT al.*, u.username
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 20
    `);

    return NextResponse.json({
      type: 'platform',
      user: userStats,
      portfolio,
      teams: (userTeams as any[]).map(team => ({
        id: team.id.toString(),
        name: team.name,
        teamType: team.team_type,
        userRole: team.role,
        balance: parseFloat(team.balance),
        xp: team.xp,
        level: team.level
      })),
      capitalLab: {
        roles: (capitalLabProgress as any[]).map(role => ({
          roleType: role.role_type,
          progress: role.progress,
          completed: role.completed
        })),
        totalCompleted: (capitalLabProgress as any[]).filter(r => r.completed).length,
        totalRoles: 8
      },
      leaderboards: {
        xp: xpLeaderboard,
        portfolio: portfolioLeaderboard
      },
      platformStats: {
        totalUsers: stats?.total_users || 0,
        totalTeams: stats?.total_teams || 0,
        totalTrades: stats?.total_trades || 0,
        totalBalance: parseFloat(stats?.total_balance || 0)
      },
      globalActivity: (globalActivity as any[]).map(activity => ({
        id: activity.id,
        username: activity.username,
        activityType: activity.activity_type,
        description: activity.description,
        createdAt: new Date(activity.created_at)
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting platform dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch platform dashboard' }, { status: 500 });
  }
}