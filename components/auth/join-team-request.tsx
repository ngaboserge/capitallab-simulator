'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Users, AlertCircle, CheckCircle } from 'lucide-react';

interface JoinTeamRequestProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function JoinTeamRequest({ onSuccess, onError }: JoinTeamRequestProps) {
  const [companyName, setCompanyName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      onError?.('Please enter a company name');
      return;
    }

    setLoading(true);
    
    try {
      // For now, we'll just show a success message
      // In a real implementation, this would:
      // 1. Check if the company exists
      // 2. Send a notification to company admins
      // 3. Create a pending invitation record
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setSuccess(true);
      onSuccess?.();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to send join request');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Sent!</h3>
            <p className="text-gray-600 mb-4">
              Your request to join <strong>{companyName}</strong> has been sent to the company administrators.
            </p>
            <p className="text-sm text-gray-500">
              You'll receive an email notification once your request is approved.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-xl">Join Existing Team</CardTitle>
        <p className="text-sm text-gray-600">
          Request to join your company's IPO application team
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Enter your company's legal name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Input
              id="message"
              type="text"
              placeholder="Brief message to company administrators"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your request will be sent to the company administrators for approval. 
              Make sure you enter the exact legal name of your company.
            </AlertDescription>
          </Alert>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending Request...
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4 mr-2" />
                Send Join Request
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-gray-500 text-center">
            Don't see your company? You might need to{' '}
            <a href="/auth/signup-team" className="text-blue-600 hover:underline">
              create a new team
            </a>{' '}
            if you're the first from your organization.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}