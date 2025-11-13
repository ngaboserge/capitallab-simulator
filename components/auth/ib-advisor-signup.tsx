'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSimpleAuth } from '@/lib/auth/simple-auth-context';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Globe,
  Award,
  Users,
  Plus,
  X,
  CheckCircle
} from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  experience: string;
}

interface IBAdvisorSignupData {
  // Company Info
  companyName: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  
  // Experience
  yearsExperience: string;
  completedIPOs: string;
  successRate: string;
  averageTimeline: string;
  
  // Specializations
  specializations: string[];
  
  // Fees
  retainerFee: string;
  successFee: string;
  
  // Team
  teamMembers: TeamMember[];
  
  // Certifications
  certifications: string[];
  
  // User Account
  username: string;
  password: string;
  fullName: string;
}

export function IBAdvisorSignup() {
  const { signup } = useSimpleAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<IBAdvisorSignupData>({
    companyName: '',
    description: '',
    website: '',
    phone: '',
    email: '',
    yearsExperience: '',
    completedIPOs: '',
    successRate: '',
    averageTimeline: '',
    specializations: [],
    retainerFee: '',
    successFee: '',
    teamMembers: [{ name: '', role: '', experience: '' }],
    certifications: [],
    username: '',
    password: '',
    fullName: ''
  });

  const [newSpecialization, setNewSpecialization] = useState('');
  const [newCertification, setNewCertification] = useState('');

  const updateField = (field: keyof IBAdvisorSignupData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSpecialization = () => {
    if (newSpecialization.trim()) {
      updateField('specializations', [...formData.specializations, newSpecialization.trim()]);
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (index: number) => {
    updateField('specializations', formData.specializations.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      updateField('certifications', [...formData.certifications, newCertification.trim()]);
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    updateField('certifications', formData.certifications.filter((_, i) => i !== index));
  };

  const addTeamMember = () => {
    updateField('teamMembers', [...formData.teamMembers, { name: '', role: '', experience: '' }]);
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = formData.teamMembers.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    );
    updateField('teamMembers', updated);
  };

  const removeTeamMember = (index: number) => {
    if (formData.teamMembers.length > 1) {
      updateField('teamMembers', formData.teamMembers.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create the IB Advisor profile data
      const ibAdvisorProfile = {
        companyName: formData.companyName,
        description: formData.description,
        website: formData.website,
        phone: formData.phone,
        yearsExperience: formData.yearsExperience,
        completedIPOs: parseInt(formData.completedIPOs) || 0,
        successRate: parseFloat(formData.successRate) || 0,
        averageTimeline: formData.averageTimeline,
        specializations: formData.specializations,
        retainerFee: formData.retainerFee,
        successFee: formData.successFee,
        teamMembers: formData.teamMembers.filter(m => m.name.trim()),
        certifications: formData.certifications,
        status: 'available'
      };

      // Sign up with IB_ADVISOR role
      await signup({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        fullName: formData.fullName,
        role: 'IB_ADVISOR',
        ibAdvisorProfile: ibAdvisorProfile
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            IB Advisor Registration Successful!
          </h3>
          <p className="text-green-700 mb-4">
            Your investment bank advisor profile has been created. You can now receive 
            IPO applications from issuers and provide professional review services.
          </p>
          <Button onClick={() => window.location.href = '/auth/login'}>
            Sign In to Your Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Register as IB Advisor
          </CardTitle>
          <p className="text-sm text-gray-600">
            Create your investment bank advisor profile to receive and review IPO applications from issuers.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* User Account Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => updateField('username', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Company Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Investment Bank Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    placeholder="e.g., Rwanda Capital Partners"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Company Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Brief description of your investment bank and services"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => updateField('website', e.target.value)}
                      placeholder="www.yourbank.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+250 788 123 456"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Experience & Track Record */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Experience & Track Record</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="yearsExperience">Years of Experience *</Label>
                  <Input
                    id="yearsExperience"
                    value={formData.yearsExperience}
                    onChange={(e) => updateField('yearsExperience', e.target.value)}
                    placeholder="e.g., 15+ years"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="completedIPOs">Completed IPOs *</Label>
                  <Input
                    id="completedIPOs"
                    type="number"
                    value={formData.completedIPOs}
                    onChange={(e) => updateField('completedIPOs', e.target.value)}
                    placeholder="e.g., 25"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="successRate">Success Rate (%) *</Label>
                  <Input
                    id="successRate"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.successRate}
                    onChange={(e) => updateField('successRate', e.target.value)}
                    placeholder="e.g., 95"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="averageTimeline">Average Timeline *</Label>
                  <Input
                    id="averageTimeline"
                    value={formData.averageTimeline}
                    onChange={(e) => updateField('averageTimeline', e.target.value)}
                    placeholder="e.g., 6-8 months"
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Specializations */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Specializations</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    placeholder="e.g., Technology, Manufacturing, Healthcare"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                  />
                  <Button type="button" onClick={addSpecialization}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.specializations.map((spec, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {spec}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSpecialization(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Fee Structure */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Fee Structure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="retainerFee">Retainer Fee *</Label>
                  <Input
                    id="retainerFee"
                    value={formData.retainerFee}
                    onChange={(e) => updateField('retainerFee', e.target.value)}
                    placeholder="e.g., RWF 50M"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="successFee">Success Fee *</Label>
                  <Input
                    id="successFee"
                    value={formData.successFee}
                    onChange={(e) => updateField('successFee', e.target.value)}
                    placeholder="e.g., 3.5% of raise"
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Team Members */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Key Team Members</h3>
              <div className="space-y-4">
                {formData.teamMembers.map((member, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-lg">
                    <Input
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Role"
                      value={member.role}
                      onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                    />
                    <Input
                      placeholder="Experience"
                      value={member.experience}
                      onChange={(e) => updateTeamMember(index, 'experience', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTeamMember(index)}
                      disabled={formData.teamMembers.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addTeamMember}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team Member
                </Button>
              </div>
            </div>

            <Separator />

            {/* Certifications */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Certifications</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="e.g., CMA Licensed, EAC Certified"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                  />
                  <Button type="button" onClick={addCertification}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.certifications.map((cert, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {cert}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeCertification(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Submit */}
            <div className="flex justify-end">
              <Button type="submit" disabled={loading} size="lg">
                {loading ? 'Creating Account...' : 'Register as IB Advisor'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}