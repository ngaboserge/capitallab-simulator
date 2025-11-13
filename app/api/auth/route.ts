import { NextRequest, NextResponse } from 'next/server';
import { userManagement } from '@/lib/user-management';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'login':
        return await handleLogin(data);
      case 'register':
        return await handleRegister(data);
      case 'demo':
        return await handleDemoLogin();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleLogin(data: { username: string; password?: string }) {
  try {
    const { username } = data;
    
    // For demo purposes, we'll do simple username-based auth
    // In production, implement proper password hashing and verification
    const users = await userManagement.getLeaderboard('xp', 100);
    const existingUser = users.find(u => u.username === username);

    if (existingUser) {
      const user = await userManagement.getUser(existingUser.userId);
      if (user) {
        // Update last login
        await userManagement.updateUser(user.id, { lastLogin: new Date() });
        
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            balance: user.balance,
            xp: user.xp,
            level: user.level,
            role: user.role,
            achievements: user.achievements
          }
        });
      }
    }

    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

async function handleRegister(data: { username: string; email: string; role?: string }) {
  try {
    const { username, email, role = 'student' } = data;

    const result = await userManagement.createUser({
      username,
      email,
      role: role as any,
      initialBalance: 10000
    });

    if (result.success && result.userId) {
      const user = await userManagement.getUser(result.userId);
      
      return NextResponse.json({
        success: true,
        user: {
          id: user!.id,
          username: user!.username,
          email: user!.email,
          balance: user!.balance,
          xp: user!.xp,
          level: user!.level,
          role: user!.role,
          achievements: user!.achievements
        }
      });
    }

    return NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}

async function handleDemoLogin() {
  try {
    // Create or get demo user
    const demoUsername = `demo_${Date.now()}`;
    const demoEmail = `${demoUsername}@demo.com`;

    const result = await userManagement.createUser({
      username: demoUsername,
      email: demoEmail,
      role: 'student',
      initialBalance: 10000
    });

    if (result.success && result.userId) {
      const user = await userManagement.getUser(result.userId);
      
      return NextResponse.json({
        success: true,
        user: {
          id: user!.id,
          username: user!.username,
          email: user!.email,
          balance: user!.balance,
          xp: user!.xp,
          level: user!.level,
          role: user!.role,
          achievements: user!.achievements
        }
      });
    }

    return NextResponse.json({ error: 'Demo login failed' }, { status: 500 });
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json({ error: 'Demo login failed' }, { status: 500 });
  }
}