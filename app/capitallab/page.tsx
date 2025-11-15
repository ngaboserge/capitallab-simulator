import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Workflow, GraduationCap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function CapitalLabPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-foreground">CapitalLab</h1>
              <p className="text-muted-foreground">Rwanda Capital Markets Education & Simulation</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Educational Platform
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Learn about Rwanda's capital markets through interactive lessons and role-based simulations.
              </p>
              <ul className="text-sm space-y-2">
                <li>• Interactive learning modules</li>
                <li>• Role-based tutorials</li>
                <li>• Market process education</li>
                <li>• Progress tracking</li>
              </ul>
              <Link href="/capitallab/learn">
                <Button className="w-full">
                  Start Learning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-blue-600" />
                Collaborative Hub
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Participate in real IPO process simulations with teams playing different market roles.
              </p>
              <ul className="text-sm space-y-2">
                <li>• Real-time collaboration</li>
                <li>• 7 market roles available</li>
                <li>• Live workflow processes</li>
                <li>• Team-based simulation</li>
              </ul>
              <Link href="/capitallab/collaborative">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Enter Collaborative Hub
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Ready to Start?</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Whether you're learning about capital markets or participating in live simulations, 
                CapitalLab provides hands-on experience with Rwanda's IPO process.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/capitallab/learn">
                  <Button variant="outline">Learn First</Button>
                </Link>
                <Link href="/capitallab/collaborative">
                  <Button>Jump Into Simulation</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}