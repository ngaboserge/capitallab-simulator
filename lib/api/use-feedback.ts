/**
 * React Hook for Feedback System
 * Manages IB Advisor to Issuer communication
 */

import { useState, useEffect, useCallback } from 'react';
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
  creator?: {
    id: string;
    full_name: string;
    role: string;
  };
  resolver?: {
    id: string;
    full_name: string;
    role: string;
  };
}

export interface FeedbackComment {
  id: string;
  feedback_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: {
    id: string;
    full_name: string;
    role: string;
  };
}

export function useFeedback(applicationId: string) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const loadFeedback = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Skip if this is a localStorage-based application (not a real UUID)
      if (!applicationId || applicationId.startsWith('ib_transfer_') || applicationId.startsWith('demo-')) {
        console.log('Skipping feedback load for localStorage application:', applicationId);
        setFeedback([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/cma/applications/${applicationId}/feedback`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load feedback');
      }

      setFeedback(data.feedback || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading feedback:', err);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const createFeedback = async (data: {
    category: string;
    issue: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    section_id?: string;
  }) => {
    try {
      // Skip if this is a localStorage-based application
      if (!applicationId || applicationId.startsWith('ib_transfer_') || applicationId.startsWith('demo-')) {
        throw new Error('Feedback is only available for real applications. Please create a new application in the system.');
      }

      const response = await fetch(`/api/cma/applications/${applicationId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create feedback');
      }

      await loadFeedback();
      return result.feedback;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateFeedback = async (
    feedbackId: string,
    updates: {
      status?: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
      response?: string;
    }
  ) => {
    try {
      const response = await fetch(
        `/api/cma/applications/${applicationId}/feedback/${feedbackId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update feedback');
      }

      await loadFeedback();
      return result.feedback;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const addComment = async (feedbackId: string, content: string) => {
    try {
      const response = await fetch(
        `/api/cma/applications/${applicationId}/feedback/${feedbackId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add comment');
      }

      return result.comment;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const getComments = async (feedbackId: string): Promise<FeedbackComment[]> => {
    try {
      const response = await fetch(
        `/api/cma/applications/${applicationId}/feedback/${feedbackId}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load comments');
      }

      return result.comments || [];
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    feedback,
    loading,
    error,
    createFeedback,
    updateFeedback,
    addComment,
    getComments,
    refresh: loadFeedback
  };
}
