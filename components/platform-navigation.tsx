'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Users, 
  Building2, 
  Settings, 
  LogOut,
  ChevronDown,
  Star,
  Award,
  TrendingUp,
  BookOpen
} from 'lucide-react'

interface NavigationProps {
  user?: {
    name: string
    primaryMode: 'individual' | 'team' | 'institutional'
    totalXP: number
    currentLevel: number
  }
}

export function PlatformNavigation({ user }: NavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [showModeSelector, setShowModeSelector] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const navigationItems = [
    {
      id: 'platform',
      label: 'CapitalLab',
      icon: Building2,
      route: '/capitallab',
      description: 'Educational platform'
    },
    {
      id: 'learn',
      label: 'Learn',
      icon: BookOpen,
      route: '/capitallab/learn',
      description: 'Educational content'
    },
    {
      id: 'roles',
      label: 'Explore Roles',
      icon: Users,
      route: '/capitallab',
      description: 'Institutional roles'
    }
  ]

  const getCurrentMode = () => {
    if (pathname.startsWith('/capitallab/learn')) return 'learn'
    if (pathname.startsWith('/capitallab')) return 'platform'
    return 'platform'
  }

  const currentMode = getCurrentMode()

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'learn': return 'bg-green-100 text-green-800'
      case 'platform': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <nav className="bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Platform Name */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Shora</span>
            </div>

            {/* Current Mode Indicator */}
            {currentMode !== 'platform' && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setShowModeSelector(!showModeSelector)}
                >
                  <Badge className={getModeColor(currentMode)}>
                    {navigationItems.find(item => item.id === currentMode)?.label}
                  </Badge>
                  <ChevronDown className="w-4 h-4" />
                </Button>

                {/* Mode Selector Dropdown */}
                {showModeSelector && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-border rounded-lg shadow-lg z-50">
                    <div className="p-2">
                      {navigationItems.map((item) => {
                        const Icon = item.icon
                        const isActive = item.id === currentMode
                        
                        return (
                          <button
                            key={item.id}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50 transition-colors ${
                              isActive ? 'bg-gray-50' : ''
                            }`}
                            onClick={() => {
                              router.push(item.route)
                              setShowModeSelector(false)
                            }}
                          >
                            <Icon className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-sm">{item.label}</div>
                              <div className="text-xs text-muted-foreground">{item.description}</div>
                            </div>
                            {isActive && <Star className="w-4 h-4 text-yellow-500 ml-auto" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                {/* User Stats */}
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{user.totalXP} XP</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-muted-foreground">Level {user.currentLevel}</span>
                  </div>
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {user.primaryMode} Mode
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    
                    {showUserMenu && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-border rounded-lg shadow-lg z-50">
                        <div className="p-2">
                          <button
                            className="w-full flex items-center gap-2 p-2 rounded-lg text-left hover:bg-gray-50 transition-colors"
                            onClick={() => {
                              router.push('/platform')
                              setShowUserMenu(false)
                            }}
                          >
                            <Home className="w-4 h-4" />
                            <span className="text-sm">Platform Hub</span>
                          </button>
                          <button
                            className="w-full flex items-center gap-2 p-2 rounded-lg text-left hover:bg-gray-50 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="w-4 h-4" />
                            <span className="text-sm">Settings</span>
                          </button>
                          <button
                            className="w-full flex items-center gap-2 p-2 rounded-lg text-left hover:bg-gray-50 transition-colors text-red-600"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}