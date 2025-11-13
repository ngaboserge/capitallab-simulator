'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Database, Users, ArrowRightLeft, Building, CheckCircle, Clock } from 'lucide-react'

export default function CSDPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <Database className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">CSD Operator Dashboard</h1>
              <p className="text-muted-foreground">Manage the authoritative ownership registry and process settlements</p>
            </div>
          </div>
          
          <Alert className="bg-purple-50 border-purple-200">
            <Database className="h-4 w-4" />
            <AlertDescription>
              <strong>Registry Authority:</strong> You maintain the final record of all ownership transfers.
              All trades must be settled through your registry to be legally binding.
            </AlertDescription>
          </Alert>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Settlements</p>
                  <p className="text-2xl font-bold">7</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Settled Today</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registered Holders</p>
                  <p className="text-2xl font-bold">1,247</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Listed Instruments</p>
                  <p className="text-2xl font-bold">15</p>
                </div>
                <Building className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Settlements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" />
              Pending Settlements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">TechCorp Ltd - 1,000 shares</h3>
                  <p className="text-sm text-muted-foreground">Trade ID: TRD-2024-001 • Executed via Kigali Securities</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">Buy Order</Badge>
                    <Badge variant="outline">RWF 150,000</Badge>
                    <span className="text-xs text-muted-foreground">T+2 Settlement Due</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                  <Button size="sm">
                    Settle
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">AgriCorp Ltd - 500 shares</h3>
                  <p className="text-sm text-muted-foreground">Trade ID: TRD-2024-002 • Executed via Rwanda Brokers</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">Sell Order</Badge>
                    <Badge variant="outline">RWF 75,000</Badge>
                    <span className="text-xs text-muted-foreground">T+1 Settlement Due</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                  <Button size="sm">
                    Settle
                  </Button>
                </div>
              </div>
              
              <div className="text-center py-8 text-muted-foreground">
                <ArrowRightLeft className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No additional settlements pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registry Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Registry Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">Top Holdings by Value</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">TechCorp Ltd</span>
                    <span className="text-sm font-medium">RWF 2.5B</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">AgriCorp Ltd</span>
                    <span className="text-sm font-medium">RWF 1.8B</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Settlement Statistics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Settlement Time</span>
                    <span className="text-sm font-medium">T+1.2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Settlement Success Rate</span>
                    <span className="text-sm font-medium">99.8%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Educational Notice */}
        <Alert className="bg-amber-50 border-amber-200">
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Educational Simulation:</strong> This CSD registry simulates the Central Securities Depository system. 
            All ownership records and settlements are virtual for educational purposes.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}