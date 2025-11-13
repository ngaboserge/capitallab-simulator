import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const teamId = searchParams.get('teamId');

    if (teamId) {
      // Get specific team
      const team = await getTeam(teamId);
      return NextResponse.json(team);
    } else if (userId) {
      // Get user's teams
      const teams = await getUserTeams(userId);
      return NextResponse.json(teams);
    } else {
      // Get all teams
      const teams = await getAllTeams();
      return NextResponse.json(teams);
    }
  } catch (error) {
    console.error('Teams API error:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create':
        return await createTeam(data);
      case 'join':
        return await joinTeam(data);
      case 'leave':
        return await leaveTeam(data);
      case 'update':
        return await updateTeam(data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Teams POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getTeam(teamId: string) {
  try {
    // Get team details
    const teamResult = await query(`
      SELECT t.*, u.username as creator_name
      FROM teams t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = ?
    `, [teamId]);

    const team = (teamResult as any[])[0];
    if (!team) return null;

    // Get team members
    const membersResult = await query(`
      SELECT tm.*, u.username, u.xp, u.level
      FROM team_members tm
      LEFT JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = ?
      ORDER BY tm.role, tm.joined_at
    `, [teamId]);

    // Get team trades
    const tradesResult = await query(`
      SELECT COUNT(*) as trade_count, 
             SUM(CASE WHEN type = 'buy' THEN total_value ELSE -total_value END) as net_value
      FROM team_trades
      WHERE team_id = ?
    `, [teamId]);

    const tradeStats = (tradesResult as any[])[0];

    return {
      id: team.id.toString(),
      name: team.name,
      description: team.description,
      teamType: team.team_type,
      createdBy: team.created_by.toString(),
      creatorName: team.creator_name,
      balance: parseFloat(team.balance),
      xp: team.xp,
      level: team.level,
      createdAt: new Date(team.created_at),
      members: (membersResult as any[]).map(member => ({
        id: member.id.toString(),
        userId: member.user_id.toString(),
        username: member.username,
        role: member.role,
        xp: member.xp,
        level: member.level,
        joinedAt: new Date(member.joined_at)
      })),
      stats: {
        memberCount: (membersResult as any[]).length,
        tradeCount: tradeStats?.trade_count || 0,
        netValue: parseFloat(tradeStats?.net_value || 0)
      }
    };
  } catch (error) {
    console.error('Error getting team:', error);
    return null;
  }
}

async function getUserTeams(userId: string) {
  try {
    const result = await query(`
      SELECT t.*, tm.role, tm.joined_at, u.username as creator_name
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE tm.user_id = ?
      ORDER BY tm.joined_at DESC
    `, [userId]);

    return (result as any[]).map(team => ({
      id: team.id.toString(),
      name: team.name,
      description: team.description,
      teamType: team.team_type,
      createdBy: team.created_by.toString(),
      creatorName: team.creator_name,
      balance: parseFloat(team.balance),
      xp: team.xp,
      level: team.level,
      userRole: team.role,
      joinedAt: new Date(team.joined_at),
      createdAt: new Date(team.created_at)
    }));
  } catch (error) {
    console.error('Error getting user teams:', error);
    return [];
  }
}

async function getAllTeams() {
  try {
    const result = await query(`
      SELECT t.*, u.username as creator_name,
             COUNT(tm.id) as member_count
      FROM teams t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN team_members tm ON t.id = tm.team_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
      LIMIT 50
    `, []);

    return (result as any[]).map(team => ({
      id: team.id.toString(),
      name: team.name,
      description: team.description,
      teamType: team.team_type,
      createdBy: team.created_by.toString(),
      creatorName: team.creator_name,
      balance: parseFloat(team.balance),
      xp: team.xp,
      level: team.level,
      memberCount: team.member_count,
      createdAt: new Date(team.created_at)
    }));
  } catch (error) {
    console.error('Error getting all teams:', error);
    return [];
  }
}

async function createTeam(data: {
  name: string;
  description: string;
  teamType: string;
  createdBy: string;
  initialBalance?: number;
}) {
  try {
    const { name, description, teamType, createdBy, initialBalance = 50000 } = data;

    // Create team
    const teamResult = await query(`
      INSERT INTO teams (name, description, team_type, created_by, balance, xp, level, created_at)
      VALUES (?, ?, ?, ?, ?, 0, 1, NOW())
    `, [name, description, teamType, createdBy, initialBalance]);

    const teamId = (teamResult as any).insertId;

    // Add creator as team leader
    await query(`
      INSERT INTO team_members (team_id, user_id, role, joined_at)
      VALUES (?, ?, 'leader', NOW())
    `, [teamId, createdBy]);

    return NextResponse.json({
      success: true,
      teamId: teamId.toString(),
      message: 'Team created successfully'
    });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}

async function joinTeam(data: { teamId: string; userId: string; role?: string }) {
  try {
    const { teamId, userId, role = 'member' } = data;

    // Check if user is already a member
    const existingMember = await query(`
      SELECT id FROM team_members WHERE team_id = ? AND user_id = ?
    `, [teamId, userId]);

    if ((existingMember as any[]).length > 0) {
      return NextResponse.json({ error: 'User is already a team member' }, { status: 400 });
    }

    // Add user to team
    await query(`
      INSERT INTO team_members (team_id, user_id, role, joined_at)
      VALUES (?, ?, ?, NOW())
    `, [teamId, userId, role]);

    return NextResponse.json({
      success: true,
      message: 'Successfully joined team'
    });
  } catch (error) {
    console.error('Error joining team:', error);
    return NextResponse.json({ error: 'Failed to join team' }, { status: 500 });
  }
}

async function leaveTeam(data: { teamId: string; userId: string }) {
  try {
    const { teamId, userId } = data;

    // Remove user from team
    await query(`
      DELETE FROM team_members WHERE team_id = ? AND user_id = ?
    `, [teamId, userId]);

    return NextResponse.json({
      success: true,
      message: 'Successfully left team'
    });
  } catch (error) {
    console.error('Error leaving team:', error);
    return NextResponse.json({ error: 'Failed to leave team' }, { status: 500 });
  }
}

async function updateTeam(data: {
  teamId: string;
  name?: string;
  description?: string;
  balance?: number;
  xp?: number;
  level?: number;
}) {
  try {
    const { teamId, ...updates } = data;
    
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(teamId);

    await query(`
      UPDATE teams 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    return NextResponse.json({
      success: true,
      message: 'Team updated successfully'
    });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}