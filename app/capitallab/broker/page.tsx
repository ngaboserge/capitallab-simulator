'use client'

import { BrokerDashboard } from '@/components/broker-dashboard'

export default function BrokerPage() {
  // In real implementation, get user data from auth context
  const mockUser = {
    id: 'broker-123',
    role: 'broker'
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BrokerDashboard 
          userId={mockUser.id}
          userRole={mockUser.role}
        />
      </div>
    </div>
  )
}