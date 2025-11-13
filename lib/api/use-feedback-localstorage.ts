/**
 * React Hook for Feedback System - LocalStorage Version
 * Works without database, stores feedback in browser localStorage
 */

import { useState, useEffect, useCallback } from 'react';

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
}

export interface FeedbackComment {
  id: string;
  feedback_id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  content: string;
  created_at: string;
  author?: {
    id: string;
    full_name: string;
    role: string;
  };
}

export function useFeedbackLocalStorage(applicationId: string, userId?: string, userName?: string, userRole?: string) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getFeedbackKey = (appId: string) => `feedback_${appId}`;
  const getCommentsKey = (feedbackId: string) => `feedback_comments_${feedbackId}`;

  // Helper function to determine if feedback is relevant for current user role
  const isRelevantFeedback = (item: FeedbackItem, role?: string): boolean => {
    if (!role) return true; // Show all if no role specified
    
    const creatorRole = item.creator?.role || 'UNKNOWN';
    
    // CMA_REGULATOR should only see feedback they created or that IB_ADVISOR created for them
    if (role === 'CMA_REGULATOR') {
      return creatorRole === 'CMA_REGULATOR' || creatorRole === 'IB_ADVISOR';
    }
    
    // IB_ADVISOR should see:
    // - Feedback they created for ISSUER
    // - Feedback CMA_REGULATOR created for them
    if (role === 'IB_ADVISOR') {
      return creatorRole === 'IB_ADVISOR' || creatorRole === 'CMA_REGULATOR';
    }
    
    // ISSUER should only see feedback from IB_ADVISOR
    if (role === 'ISSUER' || role === 'CEO' || role === 'CFO' || role === 'LEGAL') {
      return creatorRole === 'IB_ADVISOR';
    }
    
    return true;
  };

  const loadFeedback = useCallback(() => {
    try {
      setLoading(true);
      setError(null);

      let feedbackData: FeedbackItem[] = [];
      const feedbackMap = new Map<string, FeedbackItem>(); // Use map to avoid duplicates

      console.log('=== Loading Feedback ===');
      console.log('Application ID:', applicationId);
      console.log('User Role:', userRole);

      // Try to load from application-specific key first
      const appKey = getFeedbackKey(applicationId);
      const appStored = localStorage.getItem(appKey);
      
      console.log('App Key:', appKey);
      console.log('Has App Data:', !!appStored);
      
      if (appStored) {
        const parsed = JSON.parse(appStored);
        console.log('App Feedback Count:', parsed.length);
        parsed.forEach((item: FeedbackItem) => {
          feedbackMap.set(item.id, item);
        });
      }

      // Check ALL feedback keys to find related feedback
      const allKeys = Object.keys(localStorage);
      const allFeedbackKeys = allKeys.filter(key => 
        key.startsWith('feedback_') || key.startsWith('issuer_feedback_')
      );
      
      console.log('All Feedback Keys:', allFeedbackKeys);

      allFeedbackKeys.forEach(key => {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const items = JSON.parse(stored);
            if (Array.isArray(items)) {
              items.forEach((item: FeedbackItem) => {
                // Include if it matches the application ID or if we don't have it yet
                // Add null checks to prevent "Cannot read properties of undefined" errors
                const itemAppId = item.application_id || '';
                const currentAppId = applicationId || '';
                
                if (itemAppId === currentAppId || 
                    currentAppId.includes('ib_transfer_') || 
                    itemAppId.includes('ib_transfer_')) {
                  // Always use the most recent version
                  const existing = feedbackMap.get(item.id);
                  if (!existing || 
                      new Date(item.created_at).getTime() >= new Date(existing.created_at).getTime()) {
                    feedbackMap.set(item.id, item);
                  }
                }
              });
            }
          }
        } catch (e) {
          console.error(`Error parsing feedback from ${key}:`, e);
        }
      });

      // Convert map to array
      feedbackData = Array.from(feedbackMap.values());

      console.log('Total Feedback Items Loaded (before validation):', feedbackData.length);

      // Filter out invalid items (must have required fields)
      feedbackData = feedbackData.filter(item => {
        const isValid = item.id && 
                       item.category && 
                       item.issue && 
                       item.created_at &&
                       item.status;
        
        if (!isValid) {
          console.warn('Filtering out invalid feedback item:', item);
        }
        
        return isValid;
      });

      console.log('Total Valid Feedback Items:', feedbackData.length);
      console.log('Feedback Items:', feedbackData);

      // Filter feedback based on user role
      feedbackData = feedbackData.filter(item => isRelevantFeedback(item, userRole));
      console.log('Filtered Feedback Items for role', userRole, ':', feedbackData.length);

      // Sort by created_at descending (newest first)
      feedbackData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setFeedback(feedbackData);
      console.log('======================');
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading feedback:', err);
    } finally {
      setLoading(false);
    }
  }, [applicationId, userRole]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const createFeedback = async (data: {
    category: string;
    issue: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    section_id?: string;
    company_id?: string;
  }) => {
    try {
      const newFeedback: FeedbackItem = {
        id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        application_id: applicationId,
        section_id: data.section_id,
        category: data.category,
        issue: data.issue,
        priority: data.priority,
        status: 'PENDING',
        created_by: userId || 'unknown',
        created_at: new Date().toISOString(),
        creator: {
          id: userId || 'unknown',
          full_name: userName || 'Unknown User',
          role: userRole || 'UNKNOWN'
        }
      };

      const key = getFeedbackKey(applicationId);
      const current = feedback;
      const updated = [newFeedback, ...current];
      
      localStorage.setItem(key, JSON.stringify(updated));
      setFeedback(updated);

      // Store feedback for issuer to see (linked by company_id)
      if (data.company_id) {
        const issuerKey = `issuer_feedback_${data.company_id}`;
        const issuerStored = localStorage.getItem(issuerKey);
        const issuerFeedback = issuerStored ? JSON.parse(issuerStored) : [];
        issuerFeedback.push(newFeedback);
        localStorage.setItem(issuerKey, JSON.stringify(issuerFeedback));
      }

      // Create notification for issuer
      createNotification(applicationId, 'New Feedback from IB Advisor', 
        `Your IB Advisor has provided feedback on: ${data.category}`);

      return newFeedback;
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
      const key = getFeedbackKey(applicationId);
      const current = feedback;
      
      const updated = current.map(item => {
        if (item.id === feedbackId) {
          const updatedItem = { ...item };
          
          if (updates.status) {
            updatedItem.status = updates.status;
            if (updates.status === 'RESOLVED') {
              updatedItem.resolved_at = new Date().toISOString();
              updatedItem.resolved_by = userId;
            }
          }
          
          if (updates.response) {
            // Determine if this is IB or Issuer response based on role
            if (userRole === 'IB_ADVISOR') {
              updatedItem.ib_response = updates.response;
            } else {
              updatedItem.issuer_response = updates.response;
            }
          }
          
          return updatedItem;
        }
        return item;
      });
      
      console.log('=== Updating Feedback ===');
      console.log('Feedback ID:', feedbackId);
      console.log('Updates:', updates);
      console.log('User Role:', userRole);

      // Save to application-specific key (PRIMARY - this is where IB Advisor reads from)
      localStorage.setItem(key, JSON.stringify(updated));
      console.log('Saved to app key:', key);
      
      // CRITICAL: Also update in ALL related storage locations
      const allKeys = Object.keys(localStorage);
      
      // 1. Update in ALL feedback keys (not just issuer-specific)
      const allFeedbackKeys = allKeys.filter(k => 
        k.startsWith('feedback_') || k.startsWith('issuer_feedback_')
      );
      
      console.log('Updating in all feedback keys:', allFeedbackKeys);
      
      allFeedbackKeys.forEach(feedbackKey => {
        if (feedbackKey === key) return; // Skip the one we already updated
        
        try {
          const stored = localStorage.getItem(feedbackKey);
          if (stored) {
            const feedbackItems = JSON.parse(stored);
            if (Array.isArray(feedbackItems)) {
              let hasItem = false;
              const updatedItems = feedbackItems.map((item: FeedbackItem) => {
                if (item.id === feedbackId) {
                  hasItem = true;
                  return updated.find(u => u.id === feedbackId) || item;
                }
                return item;
              });
              
              if (hasItem) {
                localStorage.setItem(feedbackKey, JSON.stringify(updatedItems));
                console.log('Updated in:', feedbackKey);
              }
            }
          }
        } catch (e) {
          console.error(`Error updating feedback in ${feedbackKey}:`, e);
        }
      });

      // 2. IMPORTANT: Update in IB transfer keys (where IB Advisor originally stored the feedback)
      const ibTransferKeys = allKeys.filter(k => k.startsWith('ib_transfer_'));
      
      console.log('Checking IB transfer keys:', ibTransferKeys);
      
      ibTransferKeys.forEach(transferKey => {
        try {
          const transferData = localStorage.getItem(transferKey);
          if (transferData) {
            const transfer = JSON.parse(transferData);
            // Check if this transfer has feedback
            if (transfer.feedback && Array.isArray(transfer.feedback)) {
              let hasItem = false;
              transfer.feedback = transfer.feedback.map((item: FeedbackItem) => {
                if (item.id === feedbackId) {
                  hasItem = true;
                  return updated.find(u => u.id === feedbackId) || item;
                }
                return item;
              });
              
              if (hasItem) {
                localStorage.setItem(transferKey, JSON.stringify(transfer));
                console.log('Updated in transfer:', transferKey);
              }
            }
          }
        } catch (e) {
          console.error('Error updating transfer feedback:', e);
        }
      });
      
      setFeedback(updated);
      console.log('Feedback state updated');
      console.log('========================');

      // Create notification
      if (updates.response) {
        createNotification(applicationId, 'Response to Feedback', 
          `${userName || 'Someone'} responded to feedback`);
      }

      return updated.find(item => item.id === feedbackId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const addComment = async (feedbackId: string, content: string) => {
    try {
      const comment: FeedbackComment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        feedback_id: feedbackId,
        author_id: userId || 'unknown',
        author_name: userName || 'Unknown User',
        author_role: userRole || 'UNKNOWN',
        content,
        created_at: new Date().toISOString(),
        author: {
          id: userId || 'unknown',
          full_name: userName || 'Unknown User',
          role: userRole || 'UNKNOWN'
        }
      };

      const key = getCommentsKey(feedbackId);
      const stored = localStorage.getItem(key);
      const current = stored ? JSON.parse(stored) : [];
      const updated = [...current, comment];
      
      localStorage.setItem(key, JSON.stringify(updated));

      // IMPORTANT: Also update the feedback item's last_updated timestamp
      // This helps trigger refresh on the other side
      const feedbackKey = getFeedbackKey(applicationId);
      const feedbackStored = localStorage.getItem(feedbackKey);
      if (feedbackStored) {
        const feedbackData = JSON.parse(feedbackStored);
        const updatedFeedback = feedbackData.map((item: FeedbackItem) => {
          if (item.id === feedbackId) {
            return {
              ...item,
              last_updated: new Date().toISOString()
            };
          }
          return item;
        });
        localStorage.setItem(feedbackKey, JSON.stringify(updatedFeedback));
        setFeedback(updatedFeedback);
      }

      // Create notification
      createNotification(applicationId, 'New Comment on Feedback', 
        `${userName || 'Someone'} commented: ${content.substring(0, 50)}...`);

      return comment;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const getComments = async (feedbackId: string): Promise<FeedbackComment[]> => {
    try {
      const key = getCommentsKey(feedbackId);
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const createNotification = (appId: string, title: string, message: string) => {
    try {
      const notifKey = `notifications_${appId}`;
      const stored = localStorage.getItem(notifKey);
      const current = stored ? JSON.parse(stored) : [];
      
      const notification = {
        id: `notif-${Date.now()}`,
        title,
        message,
        created_at: new Date().toISOString(),
        read: false
      };
      
      const updated = [notification, ...current];
      localStorage.setItem(notifKey, JSON.stringify(updated));
    } catch (err) {
      console.error('Error creating notification:', err);
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
