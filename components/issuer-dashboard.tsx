'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Building2, 
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
  DollarSign,
  BarChart3,
  Shield,
  Download,
  Send,
  Phone,
  Mail,
  MapPin,
  Globe,
  Briefcase,
  Target,
  Activity,
  FileCheck,
  AlertTriangle,
  Info
} from 'lucide-react'
import { CapitalRaiseIntentForm } from './capital-raise-intent-form'

interface CapitalRaiseIntent {
  id: string
  companyName: string
  instrumentType: 'equity' | 'bond' | 'note' | 'sukuk'
  targetAmount: number
  currency: string
  purpose: string
  timelineMonths: number
  status: 'submitted' | 'ib_assigned' | 'in_due_diligence' | 'filed' | 'approved' | 'rejected' | 'listed'
  submittedAt: Date
  assignedIB?: {
    name: string
    institution: string
    email: string
  }
}

interface DueDiligenceRequest {
  id: string
  title: string
  description: string
  requestType: 'kyc' | 'financials' | 'projections' | 'risk_assessment' | 'legal_docs' | 'other'
  requiredDocuments: string[]
  status: 'pending' | 'submitted' | 'approved' | 'rejected'
  requestedAt: Date
  dueDate: Date
}

interface IssuerDashboardProps {
  userId: string
  userRole: string
}

export function IssuerDashboard({ userId, userRole }: IssuerDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [capitalRaiseIntents, setCapitalRaiseIntents] = useState<CapitalRaiseIntent[]>([])
  const [dueDiligenceRequests, setDueDiligenceRequests] = useState<DueDiligenceRequest[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showIntentForm, setShowIntentForm] = useState(false)

  // Mock data - in real implementation, fetch from API
  useEffect(() => {
    // Mock existing capital raise intents with comprehensive data
    setCapitalRaiseIntents([
      {
        id: 'CRI-001',
        companyName: 'Rwanda Green Energy Ltd',
        instrumentType: 'bond',
        targetAmount: 500000000,
        currency: 'RWF',
        purpose: 'Solar farm development and grid infrastructure',
        timelineMonths: 18,
        status: 'in_due_diligence',
        submittedAt: new Date('2024-01-15'),
        assignedIB: {
          name: 'Sarah Mukamana',
          institution: 'Rwanda Capital Partners',
          email: 'sarah.mukamana@rwandacapital.rw'
        }
      },
      {
        id: 'CRI-002',
        companyName: 'Kigali Manufacturing Corp',
        instrumentType: 'equity',
        targetAmount: 300000000,
        currency: 'RWF',
        purpose: 'Factory expansion and equipment upgrade',
        timelineMonths: 12,
        status: 'filed',
        submittedAt: new Date('2023-11-20'),
        assignedIB: {
          name: 'Jean Baptiste Nzeyimana',
          institution: 'East Africa Investment Bank',
          email: 'jb.nzeyimana@eaib.rw'
        }
      }
    ])

    // Mock comprehensive due diligence requests
    setDueDiligenceRequests([
      {
        id: 'DDR-001',
        title: 'Financial Statements & Projections',
        description: 'Please provide audited financial statements for the last 3 years and 5-year financial projections including sensitivity analysis',
        requestType: 'financials',
        requiredDocuments: [
          'Audited Financial Statements (2021-2023)',
          '5-Year Financial Projections with Scenarios',
          'Monthly Cash Flow Statements',
          'Management Discussion & Analysis',
          'Independent Auditor Reports',
          'Tax Compliance Certificates'
        ],
        status: 'pending',
        requestedAt: new Date('2024-01-20'),
        dueDate: new Date('2024-02-05')
      },
      {
        id: 'DDR-002',
        title: 'Corporate Governance & Legal Documents',
        description: 'Corporate structure, governance policies, and legal compliance documentation required for regulatory filing',
        requestType: 'legal_docs',
        requiredDocuments: [
          'Certificate of Incorporation',
          'Board Resolutions (Capital Raise Authorization)',
          'Corporate Governance Policy',
          'Regulatory Compliance Certificates',
          'Shareholder Agreements',
          'Articles of Association',
          'Director & Officer Insurance Policies'
        ],
        status: 'submitted',
        requestedAt: new Date('2024-01-22'),
        dueDate: new Date('2024-02-10')
      },
      {
        id: 'DDR-003',
        title: 'Business Operations & Risk Assessment',
        description: 'Comprehensive business model documentation and risk assessment for investment evaluation',
        requestType: 'risk_assessment',
        requiredDocuments: [
          'Business Plan & Strategy Document',
          'Market Analysis Report',
          'Competitive Landscape Assessment',
          'Risk Register & Mitigation Plans',
          'Environmental Impact Assessment',
          'Key Personnel CVs & Contracts'
        ],
        status: 'pending',
        requestedAt: new Date('2024-01-25'),
        dueDate: new Date('2024-02-15')
      }
    ])
  }, [])

  const handleSubmitIntent = async (intentData: any) => {
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newIntent: CapitalRaiseIntent = {
        id: `CRI-${Date.now()}`,
        ...intentData,
        status: 'submitted',
        submittedAt: new Date()
      }
      
      setCapitalRaiseIntents(prev => [newIntent, ...prev])
      setShowIntentForm(false)
      setActiveTab('intents')
      
      // Show success message (in real app, use toast)
      alert('Capital Raise Intent submitted successfully! An Investment Bank Advisor will be assigned shortly.')
      
    } catch (error) {
      console.error('Error submitting intent:', error)
      alert('Error submitting intent. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: { variant: 'secondary' as const, label: 'Submitted', icon: Clock },
      ib_assigned: { variant: 'default' as const, label: 'IB Assigned', icon: Users },
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

  const getRequestStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending Response', icon: Clock },
      submitted: { variant: 'default' as const, label: 'Submitted', icon: CheckCircle },
      approved: { variant: 'default' as const, label: 'Approved', icon: CheckCircle },
      rejected: { variant: 'destructive' as const, label: 'Rejected', icon: AlertCircle }
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

  if (showIntentForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setShowIntentForm(false)}
          >
            ← Back to Dashboard
          </Button>
        </div>
        <CapitalRaiseIntentForm 
          onSubmit={handleSubmitIntent}
          isSubmitting={isSubmitting}
          userRole={userRole}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Issuer Dashboard</h1>
          <p className="text-muted-foreground">
            Submit capital raise intents and respond to due diligence requests
          </p>
        </div>
        <Button 
          onClick={() => setShowIntentForm(true)}
          className="flex items-center gap-2"
        >
          <Building2 className="w-4 h-4" />
          New Capital Raise Intent
        </Button>
      </div>

      {/* Role Restriction Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Your Role:</strong> As an Issuer, you can only express capital raise intent and respond to due diligence requests. 
          All structuring, filing, and regulatory interactions are handled by your assigned Investment Bank Advisor.
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="intents">Capital Raise Intents</TabsTrigger>
          <TabsTrigger value="due-diligence">Due Diligence</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Intents</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{capitalRaiseIntents.length}</div>
                <p className="text-xs text-muted-foreground">
                  Capital raise submissions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dueDiligenceRequests.filter(r => r.status === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Due diligence responses needed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Target</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  RWF {capitalRaiseIntents.reduce((sum, intent) => sum + intent.targetAmount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all intents
                </p>
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
                {capitalRaiseIntents.slice(0, 3).map((intent) => (
                  <div key={intent.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{intent.companyName}</p>
                        <p className="text-sm text-muted-foreground">
                          {intent.instrumentType.toUpperCase()} • RWF {intent.targetAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(intent.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intents" className="space-y-4">
          {capitalRaiseIntents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Capital Raise Intents</h3>
                <p className="text-muted-foreground mb-4">
                  Submit your first capital raise intent to begin the process
                </p>
                <Button onClick={() => setShowIntentForm(true)}>
                  Submit Capital Raise Intent
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {capitalRaiseIntents.map((intent) => (
                <Card key={intent.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {intent.companyName}
                      </CardTitle>
                      {getStatusBadge(intent.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p><strong>Instrument:</strong> {intent.instrumentType.toUpperCase()}</p>
                        <p><strong>Target Amount:</strong> {intent.currency} {intent.targetAmount.toLocaleString()}</p>
                        <p><strong>Purpose:</strong> {intent.purpose}</p>
                        <p><strong>Timeline:</strong> {intent.timelineMonths} months</p>
                      </div>
                      <div className="space-y-2">
                        <p><strong>Submitted:</strong> {intent.submittedAt.toLocaleDateString()}</p>
                        {intent.assignedIB && (
                          <div>
                            <p><strong>Assigned IB:</strong></p>
                            <div className="ml-4 text-sm">
                              <p>{intent.assignedIB.name}</p>
                              <p className="text-muted-foreground">{intent.assignedIB.institution}</p>
                              <p className="text-muted-foreground">{intent.assignedIB.email}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="due-diligence" className="space-y-4">
          {dueDiligenceRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Due Diligence Requests</h3>
                <p className="text-muted-foreground">
                  Due diligence requests from your assigned IB Advisor will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {dueDiligenceRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {request.title}
                      </CardTitle>
                      {getRequestStatusBadge(request.status)}
                    </div>
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
                        
                        {request.status === 'pending' && (
                          <Button size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Documents
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}