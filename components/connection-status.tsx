"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"
import { isSupabaseConfigured } from "@/lib/supabase"

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured())
    setIsConnected(navigator.onLine)

    const handleOnline = () => setIsConnected(true)
    const handleOffline = () => setIsConnected(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isConfigured) {
    return (
      <Badge variant="outline" className="gap-1 border-orange-500/20 text-orange-500">
        <WifiOff className="w-3 h-3" />
        Local Mode
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className={`gap-1 ${
      isConnected 
        ? "border-green-500/20 text-green-500" 
        : "border-red-500/20 text-red-500"
    }`}>
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3" />
          Connected
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          Offline
        </>
      )}
    </Badge>
  )
}