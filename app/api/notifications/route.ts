import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let sql = 'SELECT * FROM notifications WHERE user_id = ?';
    const params: any[] = [userId];

    if (unreadOnly) {
      sql += ' AND read_status = FALSE';
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const notifications = await query(sql, params);

    // Get unread count
    const unreadCountResult = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_status = FALSE',
      [userId]
    );
    const unreadCount = (unreadCountResult as any[])[0]?.count || 0;

    return NextResponse.json({
      notifications: (notifications as any[]).map(notification => ({
        id: notification.id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        readStatus: notification.read_status,
        createdAt: new Date(notification.created_at)
      })),
      unreadCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create':
        return await createNotification(data);
      case 'markRead':
        return await markNotificationRead(data);
      case 'markAllRead':
        return await markAllNotificationsRead(data);
      case 'delete':
        return await deleteNotification(data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Notifications POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  message: string;
}) {
  try {
    const { userId, type, title, message } = data;

    await query(`
      INSERT INTO notifications (user_id, type, title, message, read_status, created_at)
      VALUES (?, ?, ?, ?, FALSE, NOW())
    `, [userId, type, title, message]);

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

async function markNotificationRead(data: { notificationId: string; userId: string }) {
  try {
    const { notificationId, userId } = data;

    await query(`
      UPDATE notifications 
      SET read_status = TRUE 
      WHERE id = ? AND user_id = ?
    `, [notificationId, userId]);

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
  }
}

async function markAllNotificationsRead(data: { userId: string }) {
  try {
    const { userId } = data;

    await query(`
      UPDATE notifications 
      SET read_status = TRUE 
      WHERE user_id = ? AND read_status = FALSE
    `, [userId]);

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json({ error: 'Failed to mark all notifications as read' }, { status: 500 });
  }
}

async function deleteNotification(data: { notificationId: string; userId: string }) {
  try {
    const { notificationId, userId } = data;

    await query(`
      DELETE FROM notifications 
      WHERE id = ? AND user_id = ?
    `, [notificationId, userId]);

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}

// Utility functions for creating common notifications
export class NotificationService {
  static async notifyTradeExecuted(userId: string, trade: any) {
    await query(`
      INSERT INTO notifications (user_id, type, title, message, read_status, created_at)
      VALUES (?, 'trade', 'Trade Executed', ?, FALSE, NOW())
    `, [userId, `${trade.type.toUpperCase()} ${trade.quantity} ${trade.symbol} at $${trade.price}`]);
  }

  static async notifyAchievementEarned(userId: string, achievement: any) {
    await query(`
      INSERT INTO notifications (user_id, type, title, message, read_status, created_at)
      VALUES (?, 'achievement', 'Achievement Unlocked!', ?, FALSE, NOW())
    `, [userId, `You earned "${achievement.name}" and gained ${achievement.xpReward} XP!`]);
  }

  static async notifyLevelUp(userId: string, newLevel: number) {
    await query(`
      INSERT INTO notifications (user_id, type, title, message, read_status, created_at)
      VALUES (?, 'level_up', 'Level Up!', ?, FALSE, NOW())
    `, [userId, `Congratulations! You reached level ${newLevel}!`]);
  }

  static async notifyTeamInvite(userId: string, teamName: string, inviterName: string) {
    await query(`
      INSERT INTO notifications (user_id, type, title, message, read_status, created_at)
      VALUES (?, 'team_invite', 'Team Invitation', ?, FALSE, NOW())
    `, [userId, `${inviterName} invited you to join "${teamName}"`]);
  }

  static async notifyMarketAlert(userId: string, symbol: string, price: number, alertType: string) {
    await query(`
      INSERT INTO notifications (user_id, type, title, message, read_status, created_at)
      VALUES (?, 'market_alert', 'Market Alert', ?, FALSE, NOW())
    `, [userId, `${symbol} ${alertType} $${price}`]);
  }
}