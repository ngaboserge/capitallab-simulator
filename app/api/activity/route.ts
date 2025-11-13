import { NextRequest, NextResponse } from 'next/server';
import { userManagement } from '@/lib/user-management';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const teamId = searchParams.get('teamId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    let activities;

    if (userId) {
      // Get user-specific activity
      activities = await userManagement.getUserActivity(userId, limit);
    } else if (teamId) {
      // Get team-specific activity
      activities = await getTeamActivity(teamId, limit);
    } else {
      // Get global activity feed
      activities = await getGlobalActivity(type, limit);
    }

    return NextResponse.json({
      activities,
      count: activities.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Activity API error:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, teamId, activityType, description, metadata } = body;

    if (userId) {
      await userManagement.logActivity(userId, activityType, description, metadata);
    } else if (teamId) {
      await logTeamActivity(teamId, activityType, description, metadata);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Activity POST error:', error);
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
  }
}

async function getTeamActivity(teamId: string, limit: number) {
  try {
    const result = await query(`
      SELECT al.*, u.username, t.name as team_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN teams t ON al.team_id = t.id
      WHERE al.team_id = ?
      ORDER BY al.created_at DESC
      LIMIT ?
    `, [teamId, limit]);

    return (result as any[]).map(log => ({
      id: log.id,
      userId: log.user_id?.toString(),
      username: log.username,
      teamId: log.team_id?.toString(),
      teamName: log.team_name,
      activityType: log.activity_type,
      description: log.description,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
      createdAt: new Date(log.created_at)
    }));
  } catch (error) {
    console.error('Error getting team activity:', error);
    return [];
  }
}

async function getGlobalActivity(type?: string | null, limit: number = 50) {
  try {
    let sql = `
      SELECT al.*, u.username, t.name as team_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN teams t ON al.team_id = t.id
    `;
    
    const params: any[] = [];
    
    if (type) {
      sql += ' WHERE al.activity_type = ?';
      params.push(type);
    }
    
    sql += ' ORDER BY al.created_at DESC LIMIT ?';
    params.push(limit);

    const result = await query(sql, params);

    return (result as any[]).map(log => ({
      id: log.id,
      userId: log.user_id?.toString(),
      username: log.username,
      teamId: log.team_id?.toString(),
      teamName: log.team_name,
      activityType: log.activity_type,
      description: log.description,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
      createdAt: new Date(log.created_at)
    }));
  } catch (error) {
    console.error('Error getting global activity:', error);
    return [];
  }
}

async function logTeamActivity(teamId: string, activityType: string, description: string, metadata?: any) {
  try {
    await query(`
      INSERT INTO activity_logs (team_id, activity_type, description, metadata, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [teamId, activityType, description, metadata ? JSON.stringify(metadata) : null]);
  } catch (error) {
    console.error('Error logging team activity:', error);
  }
}