'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFeedbackLocalStorage } from '@/lib/api/use-feedback-localstorage';
import { useSimpleAuth } from '@/lib/auth/simple-auth-context';
import { MessageSquare, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface FeedbackNotificationBadgeProps {
  applicationId: string;
}

export function FeedbackNotificationBadge({ applicationId }: FeedbackNotificationBadgeProps) {
  const { profile } = useSimpleAuth();
  const { feedback, loading } = useFeedbackLocalStorage(
    applicationId,
    profile?.id,
    profile?.full_name || profile?.username,
    profile?.role
  );
  
  if (loading || !feedback) return null;

  const pendingCount = feedback.filter(f => f.status === 'PENDING').length;
  const inProgressCount = feedback.filter(f => f.status === 'IN_PROGRESS').length;
  const totalUnresolved = pendingCount + inProgressCount;

  if (totalUnresolved === 0) return null;

  return (
    <Link href="/capitallab/collaborative/issuer/feedback">
      <Button 
        variant="outline" 
        className="border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-900"
      >
        <AlertCircle className="h-4 w-4 mr-2" />
        <span className="font-medium">
          {totalUnresolved} Feedback Item{totalUnresolved !== 1 ? 's' : ''} from IB Advisor
        </span>
        <Badge className="ml-2 bg-orange-600 text-white">
          Action Required
        </Badge>
      </Button>
    </Link>
  );
}

interface FeedbackNotificationCardProps {
  applicationId: string;
}

export function FeedbackNotificationCard({ applicationId }: FeedbackNotificationCardProps) {
  const { profile } = useSimpleAuth();
  const { feedback, loading } = useFeedbackLocalStorage(
    applicationId,
    profile?.id,
    profile?.full_name || profile?.username,
    profile?.role
  );
  
  if (loading || !feedback) return null;

  const pendingCount = feedback.filter(f => f.status === 'PENDING').length;
  const inProgressCount = feedback.filter(f => f.status === 'IN_PROGRESS').length;
  const totalUnresolved = pendingCount + inProgressCount;

  if (totalUnresolved === 0) return null;

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <MessageSquare className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-medium text-orange-900 mb-1">
              IB Advisor Feedback Received
            </h3>
            <p className="text-sm text-orange-700 mb-3">
              Your IB Advisor has provided {totalUnresolved} feedback item{totalUnresolved !== 1 ? 's' : ''} 
              that require{totalUnresolved === 1 ? 's' : ''} your attention.
            </p>
            <div className="flex items-center space-x-4 text-sm">
              {pendingCount > 0 && (
                <div className="flex items-center space-x-1">
                  <Badge className="bg-orange-600 text-white">{pendingCount}</Badge>
                  <span className="text-orange-700">Pending</span>
                </div>
              )}
              {inProgressCount > 0 && (
                <div className="flex items-center space-x-1">
                  <Badge className="bg-blue-600 text-white">{inProgressCount}</Badge>
                  <span className="text-orange-700">In Progress</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <Link href="/capitallab/collaborative/issuer/feedback">
          <Button className="bg-orange-600 hover:bg-orange-700">
            View Feedback
          </Button>
        </Link>
      </div>
    </div>
  );
}
