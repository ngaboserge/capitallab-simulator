import { NextRequest, NextResponse } from 'next/server';
import { userManagement } from '@/lib/user-management';
import { enhancedTradingService } from '@/lib/enhanced-trading-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'xp' | 'level' | 'balance' | 'portfolio' || 'xp';
    const limit = parseInt(searchParams.get('limit') || '10');

    let leaderboard;

    if (type === 'portfolio') {
      // Get portfolio-based leaderboard
      leaderboard = await enhancedTradingService.getLeaderboard('portfolio', limit);
    } else {
      // Get user-based leaderboard
      leaderboard = await userManagement.getLeaderboard(type, limit);
    }

    // Enhance with additional stats
    const enhancedLeaderboard = await Promise.all(
      leaderboard.map(async (entry) => {
        const userStats = await enhancedTradingService.getUserStats(entry.userId);
        const portfolio = await enhancedTradingService.getPortfolio(entry.userId);
        
        return {
          ...entry,
          totalTrades: userStats?.totalTrades || 0,
          portfolioValue: portfolio.totalValue,
          totalReturn: portfolio.totalReturn,
          returnPercentage: portfolio.returnPercentage
        };
      })
    );

    return NextResponse.json({
      type,
      leaderboard: enhancedLeaderboard,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, ...data } = body;

    switch (action) {
      case 'update_score':
        return await updateUserScore(userId, data);
      case 'get_user_rank':
        return await getUserRank(userId, data.type);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Leaderboard POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function updateUserScore(userId: string, data: { type: string; score: number }) {
  try {
    // This would typically update a leaderboard cache table
    // For now, we'll just return success as scores are calculated dynamically
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user score:', error);
    return NextResponse.json({ error: 'Failed to update score' }, { status: 500 });
  }
}

async function getUserRank(userId: string, type: 'xp' | 'level' | 'balance' | 'portfolio' = 'xp') {
  try {
    const leaderboard = type === 'portfolio' 
      ? await enhancedTradingService.getLeaderboard('portfolio', 1000)
      : await userManagement.getLeaderboard(type, 1000);

    const userRank = leaderboard.findIndex(entry => entry.userId === userId) + 1;
    const totalUsers = leaderboard.length;

    return NextResponse.json({
      userId,
      type,
      rank: userRank || null,
      totalUsers,
      percentile: userRank ? Math.round(((totalUsers - userRank) / totalUsers) * 100) : null
    });
  } catch (error) {
    console.error('Error getting user rank:', error);
    return NextResponse.json({ error: 'Failed to get user rank' }, { status: 500 });
  }
}