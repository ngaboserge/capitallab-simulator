'use client'

import { CapitalLabInvestorDashboard } from '@/components/capitallab-investor-dashboard'

export default function CapitalLabInvestorPage() {
  // In real implementation, get user data from auth context
  const mockUser = {
    id: 'investor-123',
    role: 'investor'
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CapitalLabInvestorDashboard 
          userId={mockUser.id}
          userRole={mockUser.role}
        />
      </div>
    </div>
  )
}