'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  Briefcase, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Eye,
  MessageSquare,
  TrendingUp,
  Users,
  Calendar,
  Building2,
  Send,
  Plus,
  Edit,
  Activity,
  DollarSign,
  BarChart3,
  Shield,
  Target,
  Zap,
  Phone,
  Mail,
  Globe,
  FileSpreadsheet,
  Gavel,
  UserCheck,
  PieChart,
  LineChart,
  Banknote,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Calculator,
  BookOpen,
  Settings,
  Filter,
  Search,
  Download,
  RefreshCw
} from 'lucide-react'
import { WorkflowProgressTracker } from './workflow-progress-tracker'

interface AssignedIssuer {
  id: string
  companyName: string
  instrumentType: 'equity' | 'bond' | 'note' | 'sukuk'
  targetAmount: number
  currency: string
  purpose: string
  status: 'ib_assigned' | 'in_due_diligence' | 'structuring' | 'filed' | 'approved' | 'rejected' | 'listed'
  assignedAt: Date
  contactEmail: string
  contactPhone: string
  sector: string
  riskRating: 'low' | 'medium' | 'high'
  expectedTimeline: number
  feeStructure: {
    retainer: number
    successFee: number
    managementFee: number
  }
  marketData?: {
    estimatedValuation: number
    comparableCompanies: string[]
    recommendedPricing?: {
      couponRate?: number
      discountRate?: number
      faceValue?: number
    }
  }
}

interface DueDiligenceRequest {
  id: string
  issuerId: string
  issuerName: string
  requestType: 'kyc' | 'financials' | 'projections' | 'risk_assessment' | 'legal_docs' | 'governance' | 'operational' | 'other'
  title: string
  description: string
  requiredDocuments: string[]
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'under_review'
  requestedAt: Date
  dueDate: Date
  priority: 'high' | 'medium' | 'low'
  completionRate: number
}

interface ProspectusFiling {
  id: string
  issuerId: string
  issuerName: string
  instrumentType: 'equity' | 'bond' | 'note' | 'sukuk'
  filingData: {
    instrumentName: string
    faceValue: number
    couponRate?: number
    maturity?: string
    useOfProceeds: string
    riskFactors: string[]
    financialHighlights: any
  }
  version: number
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  submittedAt?: Date
  reviewerComments?: string
  cmaReference?: string
}

interface MarketAnalysis {
  id: string
  instrumentType: string
  sector: string
  benchmarkYield: number
  marketSentiment: 'bullish' | 'neutral' | 'bearish'
  demandIndicators: {
    institutionalInterest: number
    retailInterest: number
    foreignInterest: number
  }
  pricingRecommendation: {
    recommendedYield: number
    priceRange: { min: number; max: number }
    allocationStrategy: string
  }
}

interface RegulatoryFiling {
  id: string
  issuerId: string
  filingType: 'prospectus' | 'listing_application' | 'compliance_report' | 'amendment'
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  submittedAt?: Date
  cmaReference?: string
  reviewComments?: string[]
}

interface IBAdvisorDashboardProps {
  userId: string
  userRole: string
}

export function IBAdvisorDashboard({ userId, userRole }: IBAdvisorDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [assignedIssuers, setAssignedIssuers] = useState<AssignedIssuer[]>([])
  const [dueDiligenceRequests, setDueDiligenceRequests] = useState<DueDiligenceRequest[]>([])
  const [prospectusFilings, setProspectusFilings] = useState<ProspectusFiling[]>([])
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis[]>([])
  const [regulatoryFilings, setRegulatoryFilings] = useState<RegulatoryFiling[]>([])
  const [showNewDDForm, setShowNewDDForm] = useState(false)
  const [showProspectusBuilder, setShowProspectusBuilder] = useState(false)
  const [selectedIssuer, setSelectedIssuer] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Mock data - in real implementation, fetch from API
  useEffect(() => {
    // Mock assigned issuers with comprehensive data
    setAssignedIssuers([
      {
        id: 'CRI-001',
        companyName: 'Rwanda Green Energy Ltd',
        instrumentType: 'bond',
        targetAmount: 500000000,
        currency: 'RWF',
        purpose: 'Solar farm development and grid infrastructure',
        status: 'in_due_diligence',
        assignedAt: new Date('2024-01-16'),
        contactEmail: 'ceo@rwandagreen.rw',
        contactPhone: '+250 788 123 456',
        sector: 'Renewable Energy',
        riskRating: 'medium',
        expectedTimeline: 18,
        feeStructure: {
          retainer: 5000000,
          successFee: 15000000,
          managementFee: 2500000
        },
        marketData: {
          estimatedValuation: 2500000000,
          comparableCompanies: ['East African Power', 'Solar Rwanda Ltd', 'Green Energy Corp'],
          recommendedPricing: {
            couponRate: 8.5,
            faceValue: 1000,
            discountRate: 8.25
          }
        }
      },
      {
        id: 'CRI-002',
        companyName: 'Kigali Tech Solutions',
        instrumentType: 'equity',
        targetAmount: 200000000,
        currency: 'RWF',
        purpose: 'Technology infrastructure expansion',
        status: 'structuring',
        assignedAt: new Date('2024-01-18'),
        contactEmail: 'founder@kigalitech.rw',
        contactPhone: '+250 788 987 654',
        sector: 'Technology',
        riskRating: 'high',
        expectedTimeline: 12,
        feeStructure: {
          retainer: 3000000,
          successFee: 8000000,
          managementFee: 1500000
        },
        marketData: {
          estimatedValuation: 800000000,
          comparableCompanies: ['Rwanda IT Corp', 'Tech Solutions Ltd', 'Digital Rwanda'],
          recommendedPricing: {
            discountRate: 15.0
          }
        }
      },
      {
        id: 'CRI-003',
        companyName: 'Kigali Manufacturing Corp',
        instrumentType: 'bond',
        targetAmount: 300000000,
        currency: 'RWF',
        purpose: 'Factory expansion and equipment upgrade',
        status: 'filed',
        assignedAt: new Date('2023-11-20'),
        contactEmail: 'cfo@kigalimanufacturing.rw',
        contactPhone: '+250 788 555 123',
        sector: 'Manufacturing',
        riskRating: 'low',
        expectedTimeline: 15,
        feeStructure: {
          retainer: 4000000,
          successFee: 12000000,
          managementFee: 2000000
        }
      }
    ])

    // Mock due diligence requests
    setDueDiligenceRequests([
      {
        id: 'DDR-001',
        issuerId: 'CRI-001',
        issuerName: 'Rwanda Green Energy Ltd',
        requestType: 'financials',
        title: 'Financial Statements & Projections',
        description: 'Please provide audited financial statements for the last 3 years and 5-year financial projections',
        requiredDocuments: [
          'Audited Financial Statements (2021-2023)',
          '5-Year Financial Projections',
          'Cash Flow Statements',
          'Management Discussion & Analysis'
        ],
        status: 'submitted',
        requestedAt: new Date('2024-01-20'),
        dueDate: new Date('2024-02-05'),
        priority: 'high',
        completionRate: 85
      },
      {
        id: 'DDR-002',
        issuerId: 'CRI-001',
        issuerName: 'Rwanda Green Energy Ltd',
        requestType: 'legal_docs',
        title: 'Corporate Governance & Legal Documents',
        description: 'Corporate structure and governance documentation',
        requiredDocuments: [
          'Certificate of Incorporation',
          'Board Resolutions',
          'Corporate Governance Policy',
          'Regulatory Compliance Certificates'
        ],
        status: 'approved',
        requestedAt: new Date('2024-01-22'),
        dueDate: new Date('2024-02-10'),
        priority: 'high',
        completionRate: 100
      },
      {
        id: 'DDR-003',
        issuerId: 'CRI-002',
        issuerName: 'Kigali Tech Solutions',
        requestType: 'kyc',
        title: 'KYC & Beneficial Ownership',
        description: 'Know Your Customer documentation and beneficial ownership disclosure',
        requiredDocuments: [
          'Beneficial Ownership Declaration',
          'Director ID Copies & CVs',
          'Proof of Address',
          'Criminal Background Checks'
        ],
        status: 'pending',
        requestedAt: new Date('2024-01-25'),
        dueDate: new Date('2024-02-15'),
        priority: 'medium',
        completionRate: 0
      }
    ])

    // Mock prospectus filings
    setProspectusFilings([
      {
        id: 'PF-001',
        issuerId: 'CRI-001',
        issuerName: 'Rwanda Green Energy Ltd',
        instrumentType: 'bond',
        filingData: {
          instrumentName: 'Rwanda Green Energy Bond 2024',
          faceValue: 1000,
          couponRate: 8.5,
          maturity: '2029-12-31',
          useOfProceeds: 'Solar farm development and grid infrastructure expansion',
          riskFactors: [
            'Regulatory changes in renewable energy sector',
            'Weather dependency for solar generation',
            'Currency exchange rate fluctuations',
            'Technology obsolescence risk'
          ],
          financialHighlights: {
            revenue2023: 2500000000,
            ebitda2023: 750000000,
            debtToEquity: 0.65,
            currentRatio: 1.8
          }
        },
        version: 2,
        status: 'under_review',
        submittedAt: new Date('2024-01-28'),
        cmaReference: 'CMA/BOND/2024/001'
      },
      {
        id: 'PF-002',
        issuerId: 'CRI-002',
        issuerName: 'Kigali Tech Solutions',
        instrumentType: 'equity',
        filingData: {
          instrumentName: 'Kigali Tech Solutions IPO',
          faceValue: 100,
          useOfProceeds: 'Technology infrastructure expansion and R&D investment',
          riskFactors: [
            'High competition in technology sector',
            'Dependence on key personnel',
            'Rapid technological changes',
            'Market volatility'
          ],
          financialHighlights: {
            revenue2023: 800000000,
            ebitda2023: 160000000,
            debtToEquity: 0.25,
            currentRatio: 2.1
          }
        },
        version: 1,
        status: 'draft'
      }
    ])

    // Mock market analysis
    setMarketAnalysis([
      {
        id: 'MA-001',
        instrumentType: 'bond',
        sector: 'Renewable Energy',
        benchmarkYield: 8.25,
        marketSentiment: 'bullish',
        demandIndicators: {
          institutionalInterest: 85,
          retailInterest: 65,
          foreignInterest: 70
        },
        pricingRecommendation: {
          recommendedYield: 8.5,
          priceRange: { min: 98.5, max: 101.2 },
          allocationStrategy: '60% institutional, 30% retail, 10% foreign'
        }
      }
    ])

    // Mock regulatory filings
    setRegulatoryFilings([
      {
        id: 'RF-001',
        issuerId: 'CRI-001',
        filingType: 'prospectus',
        status: 'under_review',
        submittedAt: new Date('2024-01-28'),
        cmaReference: 'CMA/BOND/2024/001'
      },
      {
        id: 'RF-002',
        issuerId: 'CRI-001',
        filingType: 'listing_application',
        status: 'draft'
      }
    ])
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ib_assigned: { variant: 'secondary' as const, label: 'Newly Assigned', icon: Clock },
      in_due_diligence: { variant: 'default' as const, label: 'Due Diligence', icon: FileText },
      filed: { variant: 'default' as const, label: 'Filed', icon: Upload },
      approved: { variant: 'default' as const, label: 'Approved', icon: CheckCircle },
      rejected: { variant: 'destructive' as const, label: 'Rejected', icon: AlertCircle },
      listed: { variant: 'default' as const, label: 'Listed', icon: TrendingUp }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const handleCreateDueDiligenceRequest = () => {
    // In real implementation, this would open a form to create new DD request
    setShowNewDDForm(true)
  }

  const handleCreateProspectus = (issuerId: string) => {
    setSelectedIssuer(issuerId)
    setShowProspectusBuilder(true)
  }

  if (userRole !== 'ib_advisor') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only registered Investment Bank Advisors can access this dashboard. Your current role ({userRole}) does not have this permission.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Investment Bank Advisor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage due diligence, create prospectus filings, and handle allocations
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleCreateDueDiligenceRequest}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New DD Request
          </Button>
          <Button 
            onClick={() => setShowProspectusBuilder(true)}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Create Prospectus
          </Button>
        </div>
      </div>

      {/* Role Authority Notice */}
      <Alert>
        <Briefcase className="h-4 w-4" />
        <AlertDescription>
          <strong>Your Authority:</strong> As an Investment Bank Advisor, you control all structuring, filing, and regulatory-facing actions 
          on behalf of your assigned issuers. You are responsible for the complete capital markets process.
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Client Portfolio</TabsTrigger>
          <TabsTrigger value="due-diligence">Due Diligence</TabsTrigger>
          <TabsTrigger value="structuring">Structuring</TabsTrigger>
          <TabsTrigger value="filings">Regulatory</TabsTrigger>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Executive Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assignedIssuers.length}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" />
                  Issuers under management
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  RWF {(assignedIssuers.reduce((sum, issuer) => sum + issuer.targetAmount, 0) / 1000000).toFixed(0)}M
                </div>
                <p className="text-xs text-muted-foreground">
                  Total capital raising pipeline
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expected Fees</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  RWF {(assignedIssuers.reduce((sum, issuer) => sum + (issuer.feeStructure?.successFee || 0), 0) / 1000000).toFixed(0)}M
                </div>
                <p className="text-xs text-muted-foreground">
                  Success fees potential
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Filings</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {regulatoryFilings.filter(f => f.status === 'under_review' || f.status === 'submitted').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Under CMA review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">95%</div>
                <p className="text-xs text-muted-foreground">
                  Historical approval rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Client Portfolio Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Portfolio by Instrument Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Bonds</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">
                        {assignedIssuers.filter(i => i.instrumentType === 'bond').length} clients
                      </span>
                      <p className="text-xs text-muted-foreground">
                        RWF {(assignedIssuers.filter(i => i.instrumentType === 'bond').reduce((sum, i) => sum + i.targetAmount, 0) / 1000000).toFixed(0)}M
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Equity</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">
                        {assignedIssuers.filter(i => i.instrumentType === 'equity').length} clients
                      </span>
                      <p className="text-xs text-muted-foreground">
                        RWF {(assignedIssuers.filter(i => i.instrumentType === 'equity').reduce((sum, i) => sum + i.targetAmount, 0) / 1000000).toFixed(0)}M
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Notes</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">
                        {assignedIssuers.filter(i => i.instrumentType === 'note').length} clients
                      </span>
                      <p className="text-xs text-muted-foreground">
                        RWF {(assignedIssuers.filter(i => i.instrumentType === 'note').reduce((sum, i) => sum + i.targetAmount, 0) / 1000000).toFixed(0)}M
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Client Progress Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignedIssuers.map((issuer) => (
                    <div key={issuer.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{issuer.companyName}</span>
                        <Badge 
                          variant={
                            issuer.riskRating === 'low' ? 'default' :
                            issuer.riskRating === 'medium' ? 'secondary' : 'destructive'
                          }
                          className="text-xs"
                        >
                          {issuer.riskRating} risk
                        </Badge>
                      </div>
                      <Progress 
                        value={
                          issuer.status === 'ib_assigned' ? 20 :
                          issuer.status === 'in_due_diligence' ? 40 :
                          issuer.status === 'structuring' ? 60 :
                          issuer.status === 'filed' ? 80 :
                          issuer.status === 'approved' ? 90 :
                          issuer.status === 'listed' ? 100 : 10
                        } 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{issuer.status.replace('_', ' ')}</span>
                        <span>RWF {(issuer.targetAmount / 1000000).toFixed(0)}M</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignedIssuers.slice(0, 3).map((issuer) => (
                  <div key={issuer.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{issuer.companyName}</p>
                        <p className="text-sm text-muted-foreground">
                          {issuer.instrumentType.toUpperCase()} • RWF {issuer.targetAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(issuer.status)}
                      <Button size="sm" variant="outline">
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="space-y-4">
            {assignedIssuers.map((issuer) => (
              <Card key={issuer.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {issuer.companyName}
                    </CardTitle>
                    {getStatusBadge(issuer.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p><strong>Instrument:</strong> {issuer.instrumentType.toUpperCase()}</p>
                      <p><strong>Target Amount:</strong> {issuer.currency} {issuer.targetAmount.toLocaleString()}</p>
                      <p><strong>Purpose:</strong> {issuer.purpose}</p>
                      <p><strong>Assigned:</strong> {issuer.assignedAt.toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-2">
                      <p><strong>Contact:</strong></p>
                      <div className="ml-4 text-sm">
                        <p>{issuer.contactEmail}</p>
                        <p>{issuer.contactPhone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedIssuer(issuer.id)
                        setShowNewDDForm(true)
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Request DD
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleCreateProspectus(issuer.id)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Create Prospectus
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="due-diligence" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Due Diligence Requests</h3>
            <Button onClick={handleCreateDueDiligenceRequest}>
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </div>

          <div className="space-y-4">
            {dueDiligenceRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {request.title}
                    </CardTitle>
                    <Badge variant={request.status === 'submitted' ? 'default' : 'secondary'}>
                      {request.status === 'submitted' ? 'Submitted' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    For: {request.issuerName}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">{request.description}</p>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Required Documents:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {request.requiredDocuments.map((doc, index) => (
                          <li key={index}>{doc}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Requested: {request.requestedAt.toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Due: {request.dueDate.toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        {request.status === 'submitted' && (
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prospectus" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Prospectus Filings</h3>
            <Button onClick={() => setShowProspectusBuilder(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Prospectus
            </Button>
          </div>

          <div className="space-y-4">
            {prospectusFilings.map((filing) => (
              <Card key={filing.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {filing.filingData.instrumentName || `${filing.issuerName} Filing`}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">v{filing.version}</Badge>
                      <Badge variant={filing.status === 'draft' ? 'secondary' : 'default'}>
                        {filing.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    For: {filing.issuerName}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Face Value:</strong> RWF {filing.filingData.faceValue?.toLocaleString()}</p>
                        <p><strong>Coupon Rate:</strong> {filing.filingData.couponRate}%</p>
                      </div>
                      <div>
                        <p><strong>Maturity:</strong> {filing.filingData.maturity}</p>
                        <p><strong>Status:</strong> {filing.status.replace('_', ' ')}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      {filing.status === 'draft' && (
                        <Button size="sm">
                          <Send className="w-4 h-4 mr-2" />
                          Submit to CMA
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Active Workflows</h3>
            <Button variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              View All Workflows
            </Button>
          </div>

          <WorkflowProgressTracker 
            workflowId="WF-001"
            companyName="Rwanda Green Energy Ltd"
            userRole="ib_advisor"
            showDetailedView={true}
          />
        </TabsContent>

        <TabsContent value="structuring" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Instrument Structuring & Pricing</h3>
            <Button>
              <Calculator className="w-4 h-4 mr-2" />
              Pricing Model
            </Button>
          </div>

          <div className="space-y-6">
            {assignedIssuers.filter(i => i.status === 'structuring' || i.status === 'in_due_diligence').map((issuer) => (
              <Card key={issuer.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      {issuer.companyName} - {issuer.instrumentType.toUpperCase()} Structuring
                    </CardTitle>
                    <Badge variant="outline">{issuer.status.replace('_', ' ')}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Instrument Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Target Amount:</span>
                          <span className="font-medium">RWF {issuer.targetAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sector:</span>
                          <span className="font-medium">{issuer.sector}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Risk Rating:</span>
                          <Badge variant={issuer.riskRating === 'low' ? 'default' : issuer.riskRating === 'medium' ? 'secondary' : 'destructive'}>
                            {issuer.riskRating}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Expected Timeline:</span>
                          <span className="font-medium">{issuer.expectedTimeline} months</span>
                        </div>
                      </div>
                    </div>

                    {issuer.marketData?.recommendedPricing && (
                      <div className="space-y-4">
                        <h4 className="font-semibold">Recommended Pricing</h4>
                        <div className="space-y-2 text-sm">
                          {issuer.marketData.recommendedPricing.couponRate && (
                            <div className="flex justify-between">
                              <span>Coupon Rate:</span>
                              <span className="font-medium">{issuer.marketData.recommendedPricing.couponRate}%</span>
                            </div>
                          )}
                          {issuer.marketData.recommendedPricing.faceValue && (
                            <div className="flex justify-between">
                              <span>Face Value:</span>
                              <span className="font-medium">RWF {issuer.marketData.recommendedPricing.faceValue.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Discount Rate:</span>
                            <span className="font-medium">{issuer.marketData.recommendedPricing.discountRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Est. Valuation:</span>
                            <span className="font-medium">RWF {(issuer.marketData.estimatedValuation / 1000000).toFixed(0)}M</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <div className="flex gap-2">
                      <Button size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Modify Structure
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Run Scenarios
                      </Button>
                      <Button size="sm" variant="outline">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Generate Term Sheet
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="filings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Regulatory Filings & CMA Interactions</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync with CMA
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Filing
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Pending Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {regulatoryFilings.filter(f => f.status === 'draft').length}
                </div>
                <p className="text-xs text-muted-foreground">Ready for CMA submission</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Under Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {regulatoryFilings.filter(f => f.status === 'under_review').length}
                </div>
                <p className="text-xs text-muted-foreground">CMA review in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {regulatoryFilings.filter(f => f.status === 'approved').length}
                </div>
                <p className="text-xs text-muted-foreground">Ready for market listing</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {prospectusFilings.map((filing) => (
              <Card key={filing.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Gavel className="w-5 h-5" />
                      {filing.filingData.instrumentName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">v{filing.version}</Badge>
                      <Badge 
                        variant={
                          filing.status === 'approved' ? 'default' :
                          filing.status === 'under_review' ? 'secondary' :
                          filing.status === 'rejected' ? 'destructive' : 'outline'
                        }
                      >
                        {filing.status.replace('_', ' ')}
                      </Badge>
                      {filing.cmaReference && (
                        <Badge variant="outline" className="text-xs">
                          {filing.cmaReference}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {filing.issuerName} • {filing.instrumentType.toUpperCase()}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Face Value:</span>
                        <span className="font-medium">RWF {filing.filingData.faceValue?.toLocaleString()}</span>
                      </div>
                      {filing.filingData.couponRate && (
                        <div className="flex justify-between">
                          <span>Coupon Rate:</span>
                          <span className="font-medium">{filing.filingData.couponRate}%</span>
                        </div>
                      )}
                      {filing.filingData.maturity && (
                        <div className="flex justify-between">
                          <span>Maturity:</span>
                          <span className="font-medium">{filing.filingData.maturity}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      {filing.submittedAt && (
                        <div className="flex justify-between">
                          <span>Submitted:</span>
                          <span className="font-medium">{filing.submittedAt.toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-medium">{filing.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="font-medium mb-2">Use of Proceeds</h5>
                    <p className="text-sm text-muted-foreground">{filing.filingData.useOfProceeds}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    {filing.status === 'draft' && (
                      <Button size="sm">
                        <Send className="w-4 h-4 mr-2" />
                        Submit to CMA
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Market Analysis & Intelligence</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Market Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-lg font-bold text-green-600">Bullish</span>
                </div>
                <p className="text-xs text-muted-foreground">Strong investor appetite</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Benchmark Yield</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.25%</div>
                <p className="text-xs text-muted-foreground">10Y Government Bond</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Market Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">High</div>
                <p className="text-xs text-muted-foreground">Trading volume above average</p>
              </CardContent>
            </Card>
          </div>

          {marketAnalysis.map((analysis) => (
            <Card key={analysis.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  {analysis.sector} - {analysis.instrumentType.toUpperCase()} Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Demand Indicators</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Institutional Interest:</span>
                          <div className="flex items-center gap-2">
                            <Progress value={analysis.demandIndicators.institutionalInterest} className="w-20 h-2" />
                            <span className="text-sm font-medium">{analysis.demandIndicators.institutionalInterest}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Retail Interest:</span>
                          <div className="flex items-center gap-2">
                            <Progress value={analysis.demandIndicators.retailInterest} className="w-20 h-2" />
                            <span className="text-sm font-medium">{analysis.demandIndicators.retailInterest}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Foreign Interest:</span>
                          <div className="flex items-center gap-2">
                            <Progress value={analysis.demandIndicators.foreignInterest} className="w-20 h-2" />
                            <span className="text-sm font-medium">{analysis.demandIndicators.foreignInterest}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Pricing Recommendation</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Recommended Yield:</span>
                          <span className="font-medium">{analysis.pricingRecommendation.recommendedYield}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Price Range:</span>
                          <span className="font-medium">
                            {analysis.pricingRecommendation.priceRange.min} - {analysis.pricingRecommendation.priceRange.max}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Benchmark Spread:</span>
                          <span className="font-medium">+{(analysis.pricingRecommendation.recommendedYield - analysis.benchmarkYield).toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Allocation Strategy</h4>
                      <p className="text-sm text-muted-foreground">{analysis.pricingRecommendation.allocationStrategy}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <Button size="sm">
                      <Calculator className="w-4 h-4 mr-2" />
                      Run Pricing Model
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Scenario Analysis
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Analysis
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}