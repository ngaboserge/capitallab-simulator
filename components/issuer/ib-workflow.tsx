'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Send,
  Building2
} from 'lucide-react';
import { IBAdvisorSelection } from './ib-advisor-selection';
import { ApplicationHandoff } from './application-handoff';

interface IBAdvisor {
  id: string;
  name: string;
  description: string;
  specialization: string[];
  experience: string;
  successRate: number;
  completedIPOs: number;
  averageTimeline: string;
  fees: {
    retainer: string;
    success: string;
  };
  team: {
    name: string;
    role: string;
    experience: string;
  }[];
  contact: {
    email: string;
    phone: string;
    website: string;
  };
  certifications: string[];
  status: 'available' | 'busy' | 'unavailable';
  rating: number;
}

interface IBWorkflowProps {
  companyName: string;
  onBack: () => void;
  onComplete: () => void;
}

type WorkflowStep = 'selection' | 'handoff' | 'complete';

export function IBWorkflow({ companyName, onBack, onComplete }: IBWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('selection');
  const [selectedAdvisor, setSelectedAdvisor] = useState<IBAdvisor | null>(null);

  const handleAdvisorSelect = (advisor: IBAdvisor) => {
    setSelectedAdvisor(advisor);
  };

  const handleProceedToHandoff = () => {
    if (selectedAdvisor) {
      setCurrentStep('handoff');
    }
  };

  const handleHandoffComplete = () => {
    setCurrentStep('complete');
    // Notify parent component after a delay
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  const getStepStatus = (step: WorkflowStep) => {
    if (currentStep === step) return 'current';
    if (
      (step === 'selection' && (currentStep === 'handoff' || currentStep === 'complete')) ||
      (step === 'handoff' && currentStep === 'complete')
    ) {
      return 'completed';
    }
    return 'pending';
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {/* Step 1: Selection */}
      <div className="flex items-center">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
          getStepStatus('selection') === 'completed' 
            ? 'bg-green-100 border-green-500 text-green-600'
            : getStepStatus('selection') === 'current'
            ? 'bg-blue-100 border-blue-500 text-blue-600'
            : 'bg-gray-100 border-gray-300 text-gray-400'
        }`}>
          {getStepStatus('selection') === 'completed' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <Users className="h-5 w-5" />
          )}
        </div>
        <div className="ml-2">
          <div className="text-sm font-medium">Select IB Advisor</div>
          <div className="text-xs text-gray-500">Choose your investment bank</div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex-1 h-px bg-gray-300 mx-4"></div>

      {/* Step 2: Handoff */}
      <div className="flex items-center">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
          getStepStatus('handoff') === 'completed' 
            ? 'bg-green-100 border-green-500 text-green-600'
            : getStepStatus('handoff') === 'current'
            ? 'bg-blue-100 border-blue-500 text-blue-600'
            : 'bg-gray-100 border-gray-300 text-gray-400'
        }`}>
          {getStepStatus('handoff') === 'completed' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <FileText className="h-5 w-5" />
          )}
        </div>
        <div className="ml-2">
          <div className="text-sm font-medium">Transfer Application</div>
          <div className="text-xs text-gray-500">Send documents for review</div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex-1 h-px bg-gray-300 mx-4"></div>

      {/* Step 3: Complete */}
      <div className="flex items-center">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
          getStepStatus('complete') === 'completed' 
            ? 'bg-green-100 border-green-500 text-green-600'
            : getStepStatus('complete') === 'current'
            ? 'bg-blue-100 border-blue-500 text-blue-600'
            : 'bg-gray-100 border-gray-300 text-gray-400'
        }`}>
          {getStepStatus('complete') === 'completed' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </div>
        <div className="ml-2">
          <div className="text-sm font-medium">Complete</div>
          <div className="text-xs text-gray-500">Application transferred</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  IB Advisor Selection & Transfer
                </h1>
                <p className="text-sm text-gray-600">
                  {companyName} • IPO Application Process
                </p>
              </div>
            </div>
            
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Building2 className="h-3 w-3 mr-1" />
              Issuer Workflow
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {renderStepIndicator()}

        {currentStep === 'selection' && (
          <div className="space-y-6">
            <IBAdvisorSelection
              onSelect={handleAdvisorSelect}
              selectedAdvisor={selectedAdvisor}
              applicationData={{}} // Pass actual application data
            />
            
            {selectedAdvisor && (
              <div className="flex justify-center">
                <Button 
                  onClick={handleProceedToHandoff}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Proceed to Application Transfer
                  <FileText className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'handoff' && selectedAdvisor && (
          <ApplicationHandoff
            selectedAdvisor={selectedAdvisor}
            companyName={companyName}
            onHandoff={handleHandoffComplete}
          />
        )}

        {currentStep === 'complete' && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-green-800 mb-2">
                Application Successfully Transferred!
              </h3>
              <p className="text-green-700 mb-6 max-w-2xl mx-auto">
                Your IPO application has been transferred to <strong>{selectedAdvisor?.name}</strong>. 
                They now have access to all your completed sections and documents. You'll receive 
                updates on the review progress and any feedback directly from your assigned advisor.
              </p>
              
              <div className="bg-white p-6 rounded-lg border border-green-200 max-w-2xl mx-auto">
                <h4 className="font-semibold text-green-800 mb-3">What Happens Next?</h4>
                <div className="text-left space-y-2 text-green-700">
                  <div className="flex items-start">
                    <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">IB Advisor reviews your application (2-3 business days)</span>
                  </div>
                  <div className="flex items-start">
                    <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">You'll receive feedback and any requested changes</span>
                  </div>
                  <div className="flex items-start">
                    <Send className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Once approved, application is submitted to CMA</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">CMA begins their regulatory review process</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button onClick={onComplete} size="lg">
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}