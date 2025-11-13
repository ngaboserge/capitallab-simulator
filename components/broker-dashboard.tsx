'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  UserPlus,
  Activity,
  DollarSign,
  Eye,
  MessageSquare,
  Shield
} from 'lucide-react'

interface InvestorActivationRequest {
  id: string
  investorName: string
  investorEmail: string
  investorPhone: string
  requestedAt: Date
  kycStatus: 'pending' | 'completed' | 'rejected'
  activationStatus: 'pending' | 'active' | 'suspended' | 'terminated'
  riskProfile: 'conservative' | 'moderate' | 'aggressive'
}

interface ClientAccount {
  id: string
  investorName: string
  investorEmail: string
  portfolioValue: number
  cashBalance: number
  totalTrades: number
  activatedAt: Date
  status: 'active' | 'suspended'
  riskProfile: 'conservative' | 'moderate' | 'aggressive'
}

interface TradeExecution {
  id: string
  clientName: string
  instrumentName: string
  tradeType: 'buy' | 'sell'
  quantity: number
  price: number
  totalValue: number
  executedAt: Date
  status: 'executed' | 'settled' | 'failed'
}

interface BrokerDashboardProps {
  userId: string
  userRole: string
}

export function BrokerDashboard({ userId, userRole }: BrokerDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [activationRequests, setActivationRequests] = useState<InvestorActivationRequest[]>([])
  const [clientAccounts, setClientAccounts] = useState<ClientAccount[]>([])
  const [recentTrades, setRecentTrades] = useState<TradeExecution[]>([])

  // Mock data - in real implementation, fetch from API
  useEffect(() => {
    // Mock activation requests
    setActivationRequests([
      {
        id: 'AR-001',
        investorName: 'Alice Uwimana',
        investorEmail: 'alice.uwimana@email.com',
        investorPhone: '+250 788 123 456',
        requestedAt: new Date('2024-01-20'),
        kycStatus: 'pending',
        activationStatus: 'pending',
        riskProfile: 'moderate'
      },
      {
        id: 'AR-002',
        investorName: 'Jean Baptiste Nzeyimana',
        investorEmail: 'jean.nzeyimana@email.com',
        investorPhone: '+250 788 987 654',
        requestedAt: new Date('2024-01-18'),
        kycStatus: 'completed',
        activationStatus: 'pending',
        riskProfile: 'conservative'
      }
    ])

    // Mock client accounts
    setClientAccounts([
      {
        id: 'CA-001',
        investorName: 'Marie Mukamana',
        investorEmail: 'marie.mukamana@email.com',
        portfolioValue: 2500000,
        cashBalance: 500000,
        totalTrades: 15,
        activatedAt: new Date('2024-01-10'),
        status: 'active',
        riskProfile: 'moderate'
      },
      {
        id: 'CA-002',
        investorName: 'Patrick Nzeyimana',
        investorEmail: 'patrick.nzeyimana@email.com',
        portfolioValue: 5000000,
        cashBalance: 1000000,
        totalTrades: 28,
        activatedAt: new Date('2024-01-05'),
        status: 'active',
        riskProfile: 'aggressive'
      }
    ])

    // Mock recent trades
    setRecentTrades([
      {
        id: 'TE-001',
        clientName: 'Marie Mukamana',
        instrumentName: 'Bank of Kigali (BK)',
        tradeType: 'buy',
        quantity: 100,
        price: 285.5,
        totalValue: 28550,
        executedAt: new Date('2024-01-22T10:30:00'),
        status: 'settled'
      },
      {
        id: 'TE-002',
        clientName: 'Patrick Nzeyimana',
        instrumentName: 'MTN Rwanda (MTN)',
        tradeType: 'sell',
        quantity: 200,
        price: 198.7,
        totalValue: 39740,
        executedAt: new Date('2024-01-22T11:15:00'),
        status: 'executed'
      }
    ])
  }, [])

  const handleApproveActivation = (requestId: string) => {
    setActivationRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, activationStatus: 'active' as const }
          : req
      )
    )
    
    // In real implementation, this would also create a client account
    alert('Investor activation approved successfully!')
  }

  const handleRejectActivation = (requestId: string) => {
    setActivationRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, activationStatus: 'terminated' as const }
          : req
      )
    )
    
    alert('Investor activation rejected.')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending', icon: Clock },
      active: { variant: 'default' as const, label: 'Active', icon: CheckCircle },
      suspended: { variant: 'destructive' as const, label: 'Suspended', icon: AlertCircle },
      terminated: { variant: 'destructive' as const, label: 'Terminated', icon: AlertCircle },
      completed: { variant: 'default' as const, label: 'Completed', icon: CheckCircle },
      rejected: { variant: 'destructive' as const, label: 'Rejected', icon: AlertCircle },
      executed: { variant: 'default' as const, label: 'Executed', icon: CheckCircle },
      settled: { variant: 'default' as const, label: 'Settled', icon: CheckCircle },
      failed: { variant: 'destructive' as const, label: 'Failed', icon: AlertCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: 'secondary' as const,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      icon: AlertCircle
    }
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getRiskProfileBadge = (profile: string) => {
    const profileConfig = {
      conservative: { variant: 'secondary' as const, label: 'Conservative' },
      moderate: { variant: 'default' as const, label: 'Moderate' },
      aggressive: { variant: 'destructive' as const, label: 'Aggressive' }
    }
    
    const config = profileConfig[profile as keyof typeof profileConfig] || {
      variant: 'secondary' as const,
      label: profile.charAt(0).toUpperCase() + profile.slice(1)
    }
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  if (userRole !== 'broker') {
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
              Only licensed Brokers can access this dashboard. Your current role ({userRole}) does not have this permission.
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
          <h1 className="text-3xl font-bold text-foreground">Licensed Broker Dashboard</h1>
          <p className="text-muted-foreground">
            Activate investor accounts and execute trades on behalf of clients
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Invite New Investor
        </Button>
      </div>

      {/* Role Authority Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Your Authority:</strong> As a Licensed Broker, you are the gateway for investor market access. 
          All investors must be activated by you before they can trade, and you can execute trades on their behalf.
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activations">Activations</TabsTrigger>
          <TabsTrigger value="clients">Client Accounts</TabsTrigger>
          <TabsTrigger value="trades">Trade Execution</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientAccounts.filter(c => c.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground">
                  Activated investors
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Activations</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activationRequests.filter(r => r.activationStatus === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total AUM</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  RWF {clientAccounts.reduce((sum, client) => sum + client.portfolioValue, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Assets under management
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Trades</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentTrades.length}</div>
                <p className="text-xs text-muted-foreground">
                  Executed today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Client Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTrades.slice(0, 5).map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${trade.tradeType === 'buy' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <TrendingUp className={`w-4 h-4 ${trade.tradeType === 'buy' ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <p className="font-medium">{trade.clientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {trade.tradeType.toUpperCase()} {trade.quantity} {trade.instrumentName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">RWF {trade.totalValue.toLocaleString()}</p>
                      {getStatusBadge(trade.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Investor Activation Requests</h3>
            <Badge variant="outline">
              {activationRequests.filter(r => r.activationStatus === 'pending').length} Pending
            </Badge>
          </div>

          <div className="space-y-4">
            {activationRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      {request.investorName}
                    </CardTitle>
                    {getStatusBadge(request.activationStatus)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p><strong>Email:</strong> {request.investorEmail}</p>
                      <p><strong>Phone:</strong> {request.investorPhone}</p>
                      <p><strong>Requested:</strong> {request.requestedAt.toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-2">
                      <p><strong>KYC Status:</strong> {getStatusBadge(request.kycStatus)}</p>
                      <p><strong>Risk Profile:</strong> {getRiskProfileBadge(request.riskProfile)}</p>
                    </div>
                  </div>
                  
                  {request.activationStatus === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm"
                        onClick={() => handleApproveActivation(request.id)}
                        disabled={request.kycStatus !== 'completed'}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Activation
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleRejectActivation(request.id)}
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Review KYC
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Client Accounts</h3>
            <Badge variant="outline">
              {clientAccounts.filter(c => c.status === 'active').length} Active Clients
            </Badge>
          </div>

          <div className="space-y-4">
            {clientAccounts.map((client) => (
              <Card key={client.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {client.investorName}
                    </CardTitle>
                    {getStatusBadge(client.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <p><strong>Portfolio Value:</strong> RWF {client.portfolioValue.toLocaleString()}</p>
                      <p><strong>Cash Balance:</strong> RWF {client.cashBalance.toLocaleString()}</p>
                    </div>
                    <div className="space-y-2">
                      <p><strong>Total Trades:</strong> {client.totalTrades}</p>
                      <p><strong>Risk Profile:</strong> {getRiskProfileBadge(client.riskProfile)}</p>
                    </div>
                    <div className="space-y-2">
                      <p><strong>Activated:</strong> {client.activatedAt.toLocaleDateString()}</p>
                      <p><strong>Email:</strong> {client.investorEmail}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Portfolio
                    </Button>
                    <Button size="sm" variant="outline">
                      <Activity className="w-4 h-4 mr-2" />
                      Execute Trade
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

        <TabsContent value="trades" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Trade Execution History</h3>
            <Button>
              <Activity className="w-4 h-4 mr-2" />
              Execute New Trade
            </Button>
          </div>

          <div className="space-y-4">
            {recentTrades.map((trade) => (
              <Card key={trade.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${trade.tradeType === 'buy' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <TrendingUp className={`w-5 h-5 ${trade.tradeType === 'buy' ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <p className="font-medium">{trade.clientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {trade.tradeType.toUpperCase()} {trade.quantity} shares of {trade.instrumentName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Executed: {trade.executedAt.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">@ RWF {trade.price}</p>
                      <p className="text-sm text-muted-foreground">
                        Total: RWF {trade.totalValue.toLocaleString()}
                      </p>
                      {getStatusBadge(trade.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}