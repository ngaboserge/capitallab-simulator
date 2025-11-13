"use client"

import { useState, useEffect } from "react"
import { Zap, Plus } from "lucide-react"

interface XPNotificationProps {
  xpGain: number
  reason: string
  show: boolean
  onHide: () => void
}

export function XPNotification({ xpGain, reason, show, onHide }: XPNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide()
      }, 3000) // Hide after 3 seconds

      return () => clearTimeout(timer)
    }
  }, [show, onHide])

  if (!show) return null

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-3 rounded-lg shadow-lg border border-green-400 flex items-center gap-3">
        <div className="p-1 bg-white/20 rounded-full">
          <Plus className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold text-sm">+{xpGain} XP</p>
          <p className="text-xs opacity-90">{reason}</p>
        </div>
        <Zap className="w-5 h-5 animate-pulse" />
      </div>
    </div>
  )
}

// Hook to manage XP notifications
export function useXPNotification() {
  const [notification, setNotification] = useState<{
    xpGain: number
    reason: string
    show: boolean
  }>({
    xpGain: 0,
    reason: "",
    show: false
  })

  const showXPGain = (xpGain: number, reason: string) => {
    setNotification({
      xpGain,
      reason,
      show: true
    })
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }))
  }

  return {
    notification,
    showXPGain,
    hideNotification
  }
}