'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ISSUER_ROLES, type IssuerRole, getUserSectionPermissions } from '@/lib/auth/issuer-roles';
import { 
  Building2, 
  User, 
  Users, 
  Crown, 
  Calculator, 
  Scale, 
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface TeamMember {
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: IssuerRole;
}

interface IssuerTeamSignupProps {
  onSuccess?: (company: any, team: TeamMember[]) => void;
  onError?: (error: string) => void;
}

const ROLE_ICONS = {
  CEO: Crown,
  CFO: Calculator,
  LEGAL_ADVISOR: Scale,
  SECRETARY: FileText
};

const ROLE_COLORS = {
  CEO: 'bg-purple-100 text-purple-800 border-purple-200',
  CFO: 'bg-green-100 text-green-800 border-green-200',
  LEGAL_ADVISOR: 'bg-blue-100 text-blue-800 border-blue-200',
  SECRETARY: 'bg-orange-100 text-orange-800 border-orange-200'
};

export function IssuerTeamSignup({ onSuccess, onError }: IssuerTeamSignupProps) {
  const [step, setStep] = useState<'company' | 'team' | 'review'>('company');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Company information
  const [companyInfo, setCompanyInfo] = useState({
    legalName: '',
    tradingName: '',
    registrationNumber: '',
    industry: '',
    description: ''
  });

  // Team members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      fullName: '',
      email: '',
      username: '',
      password: '',
      role: 'CEO'
    }
  ]);

  const [selectedRole, setSelectedRole] = useState<IssuerRole>('CEO');

  const addTeamMember = (role: IssuerRole) => {
    // Check if role already exists
    if (teamMembers.some(member => member.role === role)) {
      setError(`${ISSUER_ROLES[role].title} role is already assigned`);
      return;
    }

    setTeamMembers([...teamMembers, {
      fullName: '',
      email: '',
      username: '',
      password: '',
      role
    }]);
    setError(null);
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const removeTeamMember = (index: number) => {
    if (teamMembers[index].role === 'CEO') {
      setError('CEO role is required and cannot be removed');
      return;
    }
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
    setError(null);
  };

  const validateStep = (currentStep: string): boolean => {
    setError(null);

    if (currentStep === 'company') {
      if (!companyInfo.legalName || !companyInfo.registrationNumber) {
        setError('Company legal name and registration number are required');
        return false;
      }
    }

    if (currentStep === 'team') {
      // Validate all team members
      for (const member of teamMembers) {
        if (!member.fullName || !member.email || !member.username || !member.password) {
          setError('All team member fields are required');
          return false;
        }
        if (member.password.length < 8) {
          setError('Passwords must be at least 8 characters long');
          return false;
        }
      }

      // Check for duplicate usernames/emails
      const usernames = teamMembers.map(m => m.username);
      const emails = teamMembers.map(m => m.email);
      if (new Set(usernames).size !== usernames.length) {
        setError('Usernames must be unique');
        return false;
      }
      if (new Set(emails).size !== emails.length) {
        setError('Email addresses must be unique');
        return false;
      }

      // Ensure CEO exists
      if (!teamMembers.some(member => member.role === 'CEO')) {
        setError('CEO role is required');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;

    if (step === 'company') setStep('team');
    else if (step === 'team') setStep('review');
  };

  const handleSubmit = async () => {
    if (!validateStep('team')) return;

    setLoading(true);
    setError(null);

    try {
      // Create company and team members
      const response = await fetch('/api/auth/signup-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: companyInfo,
          team: teamMembers
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create team');
      }

      onSuccess?.(data.company, data.team);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create team';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Issuer Team Account</h1>
            <p className="text-gray-600">One unified process to set up your company and team members</p>
          </div>
        </div>
        
        <Alert className="max-w-2xl mx-auto mb-6 border-blue-200 bg-blue-50">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>All-in-one setup:</strong> Create your company profile and add team members (CEO, CFO, Legal Advisor, Secretary) with their specific roles and permissions in one streamlined process.
          </AlertDescription>
        </Alert>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className={`flex items-center space-x-2 ${step === 'company' ? 'text-blue-600' : step === 'team' || step === 'review' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'company' ? 'bg-blue-100' : step === 'team' || step === 'review' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Building2 className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Company</span>
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className={`flex items-center space-x-2 ${step === 'team' ? 'text-blue-600' : step === 'review' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'team' ? 'bg-blue-100' : step === 'review' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Users className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Team</span>
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className={`flex items-center space-x-2 ${step === 'review' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <CheckCircle className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Review</span>
          </div>
        </div>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Company Information Step */}
      {step === 'company' && (
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="legalName">Legal Company Name *</Label>
                <Input
                  id="legalName"
                  value={companyInfo.legalName}
                  onChange={(e) => setCompanyInfo({...companyInfo, legalName: e.target.value})}
                  placeholder="e.g., Rwanda Tech Solutions Ltd"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tradingName">Trading Name</Label>
                <Input
                  id="tradingName"
                  value={companyInfo.tradingName}
                  onChange={(e) => setCompanyInfo({...companyInfo, tradingName: e.target.value})}
                  placeholder="e.g., RTS"
                />
              </div>
              <div>
                <Label htmlFor="registrationNumber">Registration Number *</Label>
                <Input
                  id="registrationNumber"
                  value={companyInfo.registrationNumber}
                  onChange={(e) => setCompanyInfo({...companyInfo, registrationNumber: e.target.value})}
                  placeholder="e.g., RW-001-2024"
                  required
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry Sector</Label>
                <Input
                  id="industry"
                  value={companyInfo.industry}
                  onChange={(e) => setCompanyInfo({...companyInfo, industry: e.target.value})}
                  placeholder="e.g., Technology, Finance, Manufacturing"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Business Description</Label>
              <textarea
                id="description"
                value={companyInfo.description}
                onChange={(e) => setCompanyInfo({...companyInfo, description: e.target.value})}
                placeholder="Brief description of your business activities..."
                className="w-full p-3 border rounded-lg resize-none"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleNext}>
                Next: Set Up Team
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Setup Step */}
      {step === 'team' && (
        <div className="space-y-6">
          <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as IssuerRole)}>
            <TabsList className="grid w-full grid-cols-4">
              {Object.entries(ISSUER_ROLES).map(([role, definition]) => {
                const Icon = ROLE_ICONS[role as IssuerRole];
                const hasTeamMember = teamMembers.some(member => member.role === role);
                return (
                  <TabsTrigger key={role} value={role} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{definition.title}</span>
                    {hasTeamMember && <CheckCircle className="h-3 w-3 text-green-600" />}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.entries(ISSUER_ROLES).map(([role, definition]) => (
              <TabsContent key={role} value={role}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${ROLE_COLORS[role as IssuerRole]}`}>
                          {React.createElement(ROLE_ICONS[role as IssuerRole], { className: "h-5 w-5" })}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <CardTitle>{definition.title}</CardTitle>
                            {role === 'CEO' && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                                Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{definition.description}</p>
                        </div>
                      </div>
                      {!teamMembers.some(member => member.role === role) && (
                        <Button onClick={() => addTeamMember(role as IssuerRole)}>
                          <User className="h-4 w-4 mr-2" />
                          Add {definition.title}
                        </Button>
                      )}
                      {teamMembers.some(member => member.role === role) && (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Added
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-medium mb-3">Responsibilities</h4>
                        <ul className="text-sm space-y-1">
                          {definition.responsibilities.map((responsibility, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{responsibility}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Section Access</h4>
                        <div className="space-y-2">
                          {getUserSectionPermissions(role as IssuerRole)
                            .filter(section => section.isPrimaryResponsible)
                            .map(section => (
                              <div key={section.sectionNumber} className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {section.sectionNumber}
                                </Badge>
                                <span className="text-sm">{section.sectionTitle}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Show add button if role not added yet */}
                    {!teamMembers.some(member => member.role === role) && (
                      <div className="mt-6 p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${ROLE_COLORS[role as IssuerRole]}`}>
                          {React.createElement(ROLE_ICONS[role as IssuerRole], { className: "h-8 w-8" })}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Add {definition.title} to Your Team</h3>
                        <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                          {role === 'CEO' 
                            ? 'The CEO role is required for your team. Click below to add CEO details.'
                            : `Add a ${definition.title} to handle ${definition.responsibilities[0].toLowerCase()}`
                          }
                        </p>
                        <Button 
                          onClick={() => addTeamMember(role as IssuerRole)}
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <User className="h-5 w-5 mr-2" />
                          Add {definition.title}
                        </Button>
                      </div>
                    )}

                    {/* Team member form */}
                    {teamMembers.map((member, index) => 
                      member.role === role && (
                        <div key={index} className="mt-6 p-6 border-2 border-blue-200 rounded-lg bg-blue-50/30">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <div className={`p-2 rounded-lg ${ROLE_COLORS[role as IssuerRole]}`}>
                                {React.createElement(ROLE_ICONS[role as IssuerRole], { className: "h-5 w-5" })}
                              </div>
                              <h5 className="font-semibold text-lg">{definition.title} Details</h5>
                            </div>
                            {role !== 'CEO' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => removeTeamMember(index)}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg">
                            <div>
                              <Label>Full Name *</Label>
                              <Input
                                value={member.fullName}
                                onChange={(e) => updateTeamMember(index, 'fullName', e.target.value)}
                                placeholder="Enter full name"
                                required
                              />
                            </div>
                            <div>
                              <Label>Email Address *</Label>
                              <Input
                                type="email"
                                value={member.email}
                                onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                                placeholder="Enter email address"
                                required
                              />
                            </div>
                            <div>
                              <Label>Username *</Label>
                              <Input
                                value={member.username}
                                onChange={(e) => updateTeamMember(index, 'username', e.target.value)}
                                placeholder="Enter username"
                                required
                              />
                            </div>
                            <div>
                              <Label>Password *</Label>
                              <Input
                                type="password"
                                value={member.password}
                                onChange={(e) => updateTeamMember(index, 'password', e.target.value)}
                                placeholder="Enter password (min 8 characters)"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('company')}>
              Back: Company Info
            </Button>
            <Button onClick={handleNext}>
              Next: Review & Create
            </Button>
          </div>
        </div>
      )}

      {/* Review Step */}
      {step === 'review' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review & Create Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Summary */}
              <div>
                <h4 className="font-medium mb-3">Company Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Legal Name:</strong> {companyInfo.legalName}</div>
                    <div><strong>Trading Name:</strong> {companyInfo.tradingName || 'N/A'}</div>
                    <div><strong>Registration:</strong> {companyInfo.registrationNumber}</div>
                    <div><strong>Industry:</strong> {companyInfo.industry || 'N/A'}</div>
                  </div>
                  {companyInfo.description && (
                    <div className="mt-3 text-sm">
                      <strong>Description:</strong> {companyInfo.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Team Summary */}
              <div>
                <h4 className="font-medium mb-3">Team Members ({teamMembers.length})</h4>
                <div className="space-y-3">
                  {teamMembers.map((member, index) => {
                    const roleDefinition = ISSUER_ROLES[member.role];
                    const Icon = ROLE_ICONS[member.role];
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${ROLE_COLORS[member.role]}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{member.fullName}</div>
                            <div className="text-sm text-gray-600">{roleDefinition.title}</div>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div>{member.email}</div>
                          <div className="text-gray-500">@{member.username}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('team')}>
                  Back: Edit Team
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating Team...' : 'Create Team & Company'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}