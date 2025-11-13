/**
 * Save Indicator Component
 * 
 * Displays visual feedback for auto-save status
 * Shows: idle, saving, saved, or error states
 */

'use client'

import React from 'react'
import { CheckCircle2, Loader2, AlertCircle, Cloud } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

interface SaveIndicatorProps {
  state: SaveState
  lastSaved?: Date | null
  error?: string | null
  className?: string
  showTimestamp?: boolean
}

export function SaveIndicator({
  state,
  lastSaved,
  error,
  className,
  showTimestamp = true
}: SaveIndicatorProps) {
  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)

    if (seconds < 10) return 'just now'
    if (seconds < 60) return `${seconds}s ago`
    if (minutes < 60) return `${minutes}m ago`
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      {state === 'idle' && (
        <>
          <Cloud className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {lastSaved && showTimestamp ? `Saved ${formatTimestamp(lastSaved)}` : 'Ready'}
          </span>
        </>
      )}

      {state === 'saving' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-blue-500">Saving...</span>
        </>
      )}

      {state === 'saved' && (
        <>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-green-500">
            {lastSaved && showTimestamp ? `Saved ${formatTimestamp(lastSaved)}` : 'Saved'}
          </span>
        </>
      )}

      {state === 'error' && (
        <>
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-500" title={error || undefined}>
            {error || 'Save failed'}
          </span>
        </>
      )}
    </div>
  )
}

/**
 * Compact version for inline display
 */
export function SaveIndicatorCompact({
  state,
  className
}: {
  state: SaveState
  className?: string
}) {
  return (
    <div className={cn('inline-flex items-center', className)}>
      {state === 'saving' && (
        <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
      )}
      {state === 'saved' && (
        <CheckCircle2 className="h-3 w-3 text-green-500" />
      )}
      {state === 'error' && (
        <AlertCircle className="h-3 w-3 text-red-500" />
      )}
    </div>
  )
}
