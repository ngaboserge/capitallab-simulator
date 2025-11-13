'use client'

import { cn } from '@/lib/utils'
import { 
  BarChart3, 
  Building2, 
  TrendingUp, 
  FileText, 
  Settings, 
  Monitor, 
  Zap, 
  FileBarChart,
  Shield,
  Users
} from 'lucide-react'

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'market-maker', label: 'Market Maker', icon: TrendingUp },
  { id: 'analysts', label: 'Analysts', icon: FileText },
  { id: 'rules', label: 'Rules', icon: Settings },
  { id: 'monitor', label: 'Monitor', icon: Monitor },
  { id: 'events', label: 'Events', icon: Zap },
  { id: 'reports', label: 'Reports', icon: FileBarChart },
]

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  return (
    <div className="w-64 bg-slate-900 text-white relative flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold">Market Regulator</h1>
            <p className="text-sm text-slate-400">Admin Console</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                  activeTab === item.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full p-6 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-slate-400">Regulator Access</p>
          </div>
        </div>
      </div>
    </div>
  )
}