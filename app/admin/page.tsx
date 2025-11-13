'use client'

import { useState } from 'react'
// Admin CSS fixes inline
const adminCSS = `
  .admin-dashboard {
    width: 100vw;
    height: 100vh;
  }
  .admin-dashboard * {
    box-sizing: border-box;
  }
  .admin-dashboard .flex-1 {
    flex: 1 1 0%;
    min-width: 0;
    width: 100%;
  }
  .admin-dashboard main {
    width: 100%;
    max-width: none;
    flex: 1;
  }
  .admin-dashboard .admin-content {
    width: 100%;
    max-width: none;
  }
`
import { AdminDashboard } from '@/components/admin-dashboard'
import { CompanyManagement } from '@/components/company-management'
import { MarketMakerConsole } from '@/components/market-maker-console'
import { AnalystPanel } from '@/components/analyst-panel'
import { RuleConfiguration } from '@/components/rule-configuration'
import { TradingMonitor } from '@/components/trading-monitor'
import { EventSimulator } from '@/components/event-simulator'
import { AdminReports } from '@/components/admin-reports'
import { AdminSidebar } from '@/components/admin-sidebar'
import { MarketMakerProvider } from '@/contexts/market-maker-context'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />
      case 'companies':
        return <CompanyManagement />
      case 'market-maker':
        return <MarketMakerConsole />
      case 'analysts':
        return <AnalystPanel />
      case 'rules':
        return <RuleConfiguration />
      case 'monitor':
        return <TradingMonitor />
      case 'events':
        return <EventSimulator />
      case 'reports':
        return <AdminReports />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <MarketMakerProvider>
      <style dangerouslySetInnerHTML={{ __html: adminCSS }} />
      <div className="admin-dashboard flex h-screen bg-gray-50">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-auto w-full">
          <div className="p-6 w-full max-w-none admin-content">
            {renderContent()}
          </div>
        </main>
      </div>
    </MarketMakerProvider>
  )
}