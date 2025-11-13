import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      // Get specific user
      const user = await query('SELECT * FROM users WHERE id = ?', [userId]);
      return NextResponse.json((user as any[])[0] || null);
    } else {
      // Get all users (for leaderboard)
      const users = await query(`
        SELECT id, username, balance, xp, level, achievements, created_at
        FROM users 
        ORDER BY xp DESC 
        LIMIT 100
      `);
      return NextResponse.json(users);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, balance = 10000 } = body;

    const sql = `
      INSERT INTO users (username, email, balance, xp, level, created_at)
      VALUES (?, ?, ?, 0, 1, NOW())
    `;
    
    const result = await query(sql, [username, email, balance]);
    
    return NextResponse.json({ 
      success: true, 
      userId: (result as any).insertId 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, balance, xp, level, achievements } = body;

    const sql = `
      UPDATE users 
      SET balance = ?, xp = ?, level = ?, achievements = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await query(sql, [balance, xp, level, JSON.stringify(achievements), userId]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}