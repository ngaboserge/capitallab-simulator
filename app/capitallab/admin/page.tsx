'use client'

import { MarketEngineDashboard } from '@/components/market-engine-dashboard'

export default function AdminPage() {
  // In real implementation, get user data from auth context
  const mockUser = {
    id: 'admin-123',
    role: 'admin'
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <MarketEngineDashboard 
          userId={mockUser.id}
          userRole={mockUser.role}
        />
      </div>
    </div>
  )
}