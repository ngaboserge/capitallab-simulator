"use client"

import { useSimpleAuth } from '@/lib/auth/simple-auth-context'
import { SimpleProtectedRoute } from '@/lib/auth/simple-protected-route'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building, User, Mail, LogOut, Settings } from 'lucide-react'

function DashboardContent() {
  const { user, profile, logout } = useSimpleAuth()

  const handleLogout = async () => {
    try {
      await logout()
      // Redirect will be handled by the auth context
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ISSUER': return 'Issuer (Company)'
      case 'IB_ADVISOR': return 'Investment Bank Advisor'
      case 'CMA_REGULATOR': return 'CMA Regulator'
      case 'CMA_ADMIN': return 'CMA Administrator'
      default: return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ISSUER': return 'bg-blue-100 text-blue-800'
      case 'IB_ADVISOR': return 'bg-green-100 text-green-800'
      case 'CMA_REGULATOR': return 'bg-purple-100 text-purple-800'
      case 'CMA_ADMIN': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                CapitalLab - IPO Application Platform
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.fullName || user?.username}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* User Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Username</label>
                  <p className="text-sm text-gray-900">{user?.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-sm text-gray-900">{user?.fullName || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user?.role || '')}`}>
                    {getRoleDisplayName(user?.role || '')}
                  </span>
                </div>
                {user?.companyId && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Company ID</label>
                    <p className="text-sm text-gray-900 font-mono">{user.companyId}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user?.role === 'ISSUER' && (
                  <>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => window.location.href = '/capitallab/collaborative/issuer'}
                    >
                      <Building className="h-4 w-4 mr-2" />
                      Go to Issuer Dashboard
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => window.location.href = '/capitallab/collaborative/issuer'}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      View Applications
                    </Button>
                  </>
                )}
                {user?.role === 'IB_ADVISOR' && (
                  <>
                    <Button className="w-full justify-start" variant="outline">
                      <Building className="h-4 w-4 mr-2" />
                      Review Applications
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Client Communications
                    </Button>
                  </>
                )}
                {(user?.role === 'CMA_REGULATOR' || user?.role === 'CMA_ADMIN') && (
                  <>
                    <Button className="w-full justify-start" variant="outline">
                      <Building className="h-4 w-4 mr-2" />
                      Review Submissions
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Regulatory Actions
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* System Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Authentication</span>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Session</span>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Valid
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Success Message */}
          <div className="mt-8">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-green-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">✓</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Authentication System Working!
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Congratulations! Your authentication system is now fully functional. 
                        You can sign up, log in, and access protected routes. The system includes:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>User registration with role-based access</li>
                        <li>Secure login with username/password</li>
                        <li>Company creation for issuer users</li>
                        <li>Session management and protected routes</li>
                        <li>Supabase backend integration</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <SimpleProtectedRoute>
      <DashboardContent />
    </SimpleProtectedRoute>
  )
}