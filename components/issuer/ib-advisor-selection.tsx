'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Star, 
  Users, 
  TrendingUp, 
  Award,
  CheckCircle,
  Clock,
  ArrowRight,
  Briefcase,
  Globe,
  Phone,
  Mail
} from 'lucide-react';

interface IBAdvisor {
  id: string;
  name: string;
  logo?: string;
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

interface IBAdvisorSelectionProps {
  onSelect: (advisor: IBAdvisor) => void;
  selectedAdvisor?: IBAdvisor | null;
  applicationData: any;
}

// Load real IB Advisors from the database
const loadRealIBAdvisors = async (): Promise<IBAdvisor[]> => {
  try {
    const response = await fetch('/api/ib-advisors');
    if (!response.ok) {
      throw new Error('Failed to load IB Advisors');
    }
    const data = await response.json();
    return data.advisors || [];
  } catch (error) {
    console.error('Error loading IB Advisors:', error);
    return [];
  }
};

// Fallback mock data for development
const FALLBACK_IB_ADVISORS: IBAdvisor[] = [
  {
    id: 'ib-001',
    name: 'Rwanda Capital Partners',
    description: 'Leading investment bank specializing in East African capital markets with 15+ years of IPO experience.',
    specialization: ['Technology', 'Manufacturing', 'Financial Services', 'Healthcare'],
    experience: '15+ years',
    successRate: 95,
    completedIPOs: 28,
    averageTimeline: '6-8 months',
    fees: {
      retainer: 'RWF 50M',
      success: '3.5% of raise'
    },
    team: [
      { name: 'Jean Baptiste Uwimana', role: 'Managing Director', experience: '20 years' },
      { name: 'Marie Claire Mukamana', role: 'Head of Capital Markets', experience: '15 years' },
      { name: 'Patrick Nkurunziza', role: 'Senior Analyst', experience: '8 years' }
    ],
    contact: {
      email: 'ipo@rwandacapital.com',
      phone: '+250 788 123 456',
      website: 'www.rwandacapital.com'
    },
    certifications: ['CMA Licensed', 'EAC Certified', 'ISO 9001'],
    status: 'available',
    rating: 4.8
  },
  {
    id: 'ib-002',
    name: 'East Africa Investment Bank',
    description: 'Regional investment bank with strong track record in cross-border listings and regulatory compliance.',
    specialization: ['Mining', 'Agriculture', 'Real Estate', 'Infrastructure'],
    experience: '12+ years',
    successRate: 92,
    completedIPOs: 22,
    averageTimeline: '7-9 months',
    fees: {
      retainer: 'RWF 45M',
      success: '4.0% of raise'
    },
    team: [
      { name: 'David Mugisha', role: 'CEO', experience: '18 years' },
      { name: 'Grace Uwimana', role: 'Head of IPOs', experience: '12 years' },
      { name: 'Samuel Habimana', role: 'Compliance Officer', experience: '10 years' }
    ],
    contact: {
      email: 'listings@eaib.com',
      phone: '+250 788 234 567',
      website: 'www.eaib.com'
    },
    certifications: ['CMA Licensed', 'RSE Approved', 'IFRS Certified'],
    status: 'available',
    rating: 4.6
  },
  {
    id: 'ib-003',
    name: 'Kigali Securities Advisory',
    description: 'Boutique investment bank focused on mid-cap companies with personalized service and competitive fees.',
    specialization: ['SME', 'Family Business', 'Startups', 'Tech Companies'],
    experience: '8+ years',
    successRate: 88,
    completedIPOs: 15,
    averageTimeline: '5-7 months',
    fees: {
      retainer: 'RWF 35M',
      success: '3.0% of raise'
    },
    team: [
      { name: 'Alice Nyirahabimana', role: 'Founder & CEO', experience: '15 years' },
      { name: 'Robert Kayitare', role: 'Senior Advisor', experience: '12 years' }
    ],
    contact: {
      email: 'hello@ksa.rw',
      phone: '+250 788 345 678',
      website: 'www.ksa.rw'
    },
    certifications: ['CMA Licensed', 'ACCA Certified'],
    status: 'busy',
    rating: 4.4
  }
];

export function IBAdvisorSelection({ onSelect, selectedAdvisor, applicationData }: IBAdvisorSelectionProps) {
  const [advisors, setAdvisors] = useState<IBAdvisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(selectedAdvisor?.id || null);

  useEffect(() => {
    // Load real IB Advisors from API
    const loadAdvisors = async () => {
      setLoading(true);
      try {
        const realAdvisors = await loadRealIBAdvisors();
        if (realAdvisors.length > 0) {
          setAdvisors(realAdvisors);
        } else {
          // Use fallback data if no real advisors found
          setAdvisors(FALLBACK_IB_ADVISORS);
        }
      } catch (error) {
        console.error('Failed to load advisors, using fallback:', error);
        setAdvisors(FALLBACK_IB_ADVISORS);
      } finally {
        setLoading(false);
      }
    };

    loadAdvisors();
  }, []);

  const handleSelect = (advisor: IBAdvisor) => {
    setSelectedId(advisor.id);
    onSelect(advisor);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unavailable':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            Select Investment Bank Advisor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading available IB Advisors...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            Select Investment Bank Advisor
          </CardTitle>
          <p className="text-sm text-gray-600">
            Choose an investment bank to review your application and guide you through the IPO process.
            Your completed sections and documents will be transferred to the selected advisor.
          </p>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        {advisors.map((advisor) => (
          <Card 
            key={advisor.id} 
            className={`transition-all duration-200 ${
              selectedId === advisor.id 
                ? 'ring-2 ring-blue-500 border-blue-200' 
                : 'hover:shadow-md'
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={advisor.logo} alt={advisor.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                      {advisor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{advisor.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        {renderStars(advisor.rating)}
                        <span className="ml-1 text-sm text-gray-600">({advisor.rating})</span>
                      </div>
                      <Badge variant="outline" className={getStatusColor(advisor.status)}>
                        {advisor.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleSelect(advisor)}
                  disabled={advisor.status === 'unavailable'}
                  variant={selectedId === advisor.id ? 'default' : 'outline'}
                  className={selectedId === advisor.id ? 'bg-blue-600' : ''}
                >
                  {selectedId === advisor.id ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    <>
                      Select
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-700">{advisor.description}</p>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <div className="text-lg font-semibold text-green-600">{advisor.successRate}%</div>
                  <div className="text-xs text-gray-600">Success Rate</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Award className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <div className="text-lg font-semibold text-blue-600">{advisor.completedIPOs}</div>
                  <div className="text-xs text-gray-600">Completed IPOs</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <div className="text-lg font-semibold text-purple-600">{advisor.averageTimeline}</div>
                  <div className="text-xs text-gray-600">Avg Timeline</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Users className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                  <div className="text-lg font-semibold text-orange-600">{advisor.experience}</div>
                  <div className="text-xs text-gray-600">Experience</div>
                </div>
              </div>

              {/* Specialization */}
              <div>
                <h4 className="font-medium mb-2">Specialization</h4>
                <div className="flex flex-wrap gap-2">
                  {advisor.specialization.map((spec) => (
                    <Badge key={spec} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Fees */}
              <div>
                <h4 className="font-medium mb-2">Fee Structure</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Retainer:</span>
                    <span className="ml-2 font-medium">{advisor.fees.retainer}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Success Fee:</span>
                    <span className="ml-2 font-medium">{advisor.fees.success}</span>
                  </div>
                </div>
              </div>

              {/* Team */}
              <div>
                <h4 className="font-medium mb-2">Key Team Members</h4>
                <div className="space-y-2">
                  {advisor.team.slice(0, 2).map((member, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="font-medium">{member.name}</span>
                      <span className="text-gray-600">{member.role} • {member.experience}</span>
                    </div>
                  ))}
                  {advisor.team.length > 2 && (
                    <div className="text-sm text-gray-500">
                      +{advisor.team.length - 2} more team members
                    </div>
                  )}
                </div>
              </div>

              {/* Contact & Certifications */}
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium mb-2">Contact</h5>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-2 text-gray-400" />
                      <span>{advisor.contact.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-2 text-gray-400" />
                      <span>{advisor.contact.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Globe className="h-3 w-3 mr-2 text-gray-400" />
                      <span>{advisor.contact.website}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Certifications</h5>
                  <div className="flex flex-wrap gap-1">
                    {advisor.certifications.map((cert) => (
                      <Badge key={cert} variant="outline" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedId && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium text-green-800">
                {advisors.find(a => a.id === selectedId)?.name} selected as your IB Advisor
              </span>
            </div>
            <p className="text-sm text-green-700 mt-2">
              Your completed application sections and documents will be transferred to this advisor for review.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}