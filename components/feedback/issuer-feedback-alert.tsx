'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, MessageSquare, X } from 'lucide-react';
import Link from 'next/link';

interface IssuerFeedbackAlertProps {
  companyId: string;
}

export function IssuerFeedbackAlert({ companyId }: IssuerFeedbackAlertProps) {
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const loadFeedback = () => {
      try {
        const issuerFeedbackKey = `issuer_feedback_${companyId}`;
        const feedbackData = localStorage.getItem(issuerFeedbackKey);
        
        if (feedbackData) {
          const feedback = JSON.parse(feedbackData);
          setFeedbackCount(feedback.length);
          
          const pending = feedback.filter((f: any) => 
            f.status === 'PENDING' || f.status === 'IN_PROGRESS'
          ).length;
          setPendingCount(pending);
        }
      } catch (error) {
        console.error('Error loading feedback:', error);
      }
    };

    loadFeedback();
    
    // Refresh every 5 seconds
    const interval = setInterval(loadFeedback, 5000);
    
    return () => clearInterval(interval);
  }, [companyId]);

  if (dismissed || pendingCount === 0) return null;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="p-2 bg-orange-100 rounded-lg">
            <MessageSquare className="h-6 w-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-orange-900">
                IB Advisor Feedback Received
              </h3>
              <Badge className="bg-orange-600 text-white">
                {pendingCount} {pendingCount === 1 ? 'Item' : 'Items'}
              </Badge>
            </div>
            <p className="text-sm text-orange-800 mb-3">
              Your IB Advisor has provided feedback that requires your attention. 
              Please review and respond to continue with your application.
            </p>
            <div className="flex items-center space-x-3">
              <Link href="/capitallab/collaborative/issuer/feedback">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  View Feedback ({pendingCount})
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDismissed(true)}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="text-orange-600 hover:text-orange-800 hover:bg-orange-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
