/**
 * Feedback Service
 * Handles IB Advisor feedback to Issuers and communication
 */

import { createClient } from '@/lib/supabase/client';

export interface FeedbackItem {
  id: string;
  application_id: string;
  section_id?: string;
  category: string;
  issue: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  created_by: string;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  issuer_response?: string;
  ib_response?: string;
}

export interface FeedbackComment {
  id: string;
  feedback_id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  content: string;
  created_at: string;
}

export class FeedbackService {
  private supabase = createClient();

  /**
   * Create a new feedback item
   */
  async createFeedback(data: {
    application_id: string;
    section_id?: string;
    category: string;
    issue: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
  }): Promise<FeedbackItem> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: feedback, error } = await this.supabase
      .from('application_feedback')
      .insert({
        ...data,
        created_by: user.id,
        status: 'PENDING'
      })
      .select()
      .single();

    if (error) throw error;
    return feedback;
  }

  /**
   * Get all feedback for an application
   */
  async getFeedback(applicationId: string): Promise<FeedbackItem[]> {
    const { data, error } = await this.supabase
      .from('application_feedback')
      .select(`
        *,
        creator:profiles!application_feedback_created_by_fkey(full_name, role),
        resolver:profiles!application_feedback_resolved_by_fkey(full_name, role)
      `)
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Update feedback status
   */
  async updateFeedbackStatus(
    feedbackId: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED',
    response?: string
  ): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const updates: any = { status };
    
    if (status === 'RESOLVED') {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = user.id;
    }

    if (response) {
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'IB_ADVISOR') {
        updates.ib_response = response;
      } else {
        updates.issuer_response = response;
      }
    }

    const { error } = await this.supabase
      .from('application_feedback')
      .update(updates)
      .eq('id', feedbackId);

    if (error) throw error;
  }

  /**
   * Add a comment to feedback
   */
  async addFeedbackComment(
    feedbackId: string,
    content: string
  ): Promise<FeedbackComment> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: comment, error } = await this.supabase
      .from('feedback_comments')
      .insert({
        feedback_id: feedbackId,
        author_id: user.id,
        content
      })
      .select(`
        *,
        author:profiles!feedback_comments_author_id_fkey(full_name, role)
      `)
      .single();

    if (error) throw error;

    return {
      id: comment.id,
      feedback_id: comment.feedback_id,
      author_id: comment.author_id,
      author_name: comment.author.full_name,
      author_role: comment.author.role,
      content: comment.content,
      created_at: comment.created_at
    };
  }

  /**
   * Get comments for a feedback item
   */
  async getFeedbackComments(feedbackId: string): Promise<FeedbackComment[]> {
    const { data, error } = await this.supabase
      .from('feedback_comments')
      .select(`
        *,
        author:profiles!feedback_comments_author_id_fkey(full_name, role)
      `)
      .eq('feedback_id', feedbackId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(comment => ({
      id: comment.id,
      feedback_id: comment.feedback_id,
      author_id: comment.author_id,
      author_name: comment.author.full_name,
      author_role: comment.author.role,
      content: comment.content,
      created_at: comment.created_at
    }));
  }

  /**
   * Send feedback notification to issuer
   */
  async notifyIssuer(applicationId: string, feedbackCount: number): Promise<void> {
    const { data: application } = await this.supabase
      .from('ipo_applications')
      .select('company_id')
      .eq('id', applicationId)
      .single();

    if (!application) return;

    // Get all issuer team members
    const { data: issuerTeam } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('company_id', application.company_id);

    if (!issuerTeam || issuerTeam.length === 0) return;

    // Create notifications
    const notifications = issuerTeam.map(member => ({
      recipient_id: member.id,
      title: 'IB Advisor Feedback Received',
      message: `Your IB Advisor has provided ${feedbackCount} feedback item(s) for your application`,
      type: 'QUERY_ISSUED',
      application_id: applicationId,
      priority: 'HIGH'
    }));

    await this.supabase.from('notifications').insert(notifications);
  }
}
