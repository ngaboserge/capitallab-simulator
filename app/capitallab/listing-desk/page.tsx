'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Award, Building, Calendar, Hash, CheckCircle, Clock } from 'lucide-react'

export default function ListingDeskPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-green-100">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">RSE Listing Desk Dashboard</h1>
              <p className="text-muted-foreground">Approve instrument listings and create virtual ISINs</p>
            </div>
          </div>
          
          <Alert className="bg-green-50 border-green-200">
            <Award className="h-4 w-4" />
            <AlertDescription>
              <strong>Listing Authority:</strong> You control the transition from regulatory approval to market listing.
              Create virtual ISINs and manage the listing calendar for approved instruments.
            </AlertDescription>
          </Alert>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Listings</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Listed This Month</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Virtual ISINs Created</p>
                  <p className="text-2xl font-bold">15</p>
                </div>
                <Hash className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Scheduled Listings</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Approved for Listing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Approved for Listing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">TechCorp Ltd - Ordinary Shares</h3>
                  <p className="text-sm text-muted-foreground">CMA Approved • Ready for ISIN Assignment</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">IPO</Badge>
                    <Badge variant="outline">RWF 2.5B</Badge>
                    <Badge className="bg-green-100 text-green-800">CMA Approved</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Create ISIN
                  </Button>
                  <Button size="sm">
                    Schedule Listing
                  </Button>
                </div>
              </div>
              
              <div className="text-center py-8 text-muted-foreground">
                <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No additional instruments ready for listing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listing Calendar */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <h4 className="font-medium">AgriCorp Ltd</h4>
                  <p className="text-sm text-muted-foreground">ISIN: RW000A1B2C3D • Listing Date: Tomorrow</p>
                </div>
                <Badge>Ready</Badge>
              </div>
              
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No other listings scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Educational Notice */}
        <Alert className="bg-amber-50 border-amber-200">
          <Award className="h-4 w-4" />
          <AlertDescription>
            <strong>Educational Simulation:</strong> This listing desk simulates the Rwanda Stock Exchange listing process. 
            Virtual ISINs created here are for educational purposes only.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}