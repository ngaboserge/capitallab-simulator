/**
 * Mock React Hooks for Section Management
 * 
 * Provides hooks for loading, updating, and managing application sections
 * using localStorage for development/testing
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { mockSectionService, type MockSectionWithProfiles, type MockUpdateSectionData } from './mock-section-service'
import { useSimpleAuth } from '@/lib/auth/simple-auth-context'

// Debounce utility
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current as any)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay) as any
    },
    [callback, delay]
  )
}

/**
 * Hook for loading a single section with auto-save functionality (Mock version)
 */
export function useMockSectionData(sectionId: string | null) {
  const { user } = useSimpleAuth()
  const [section, setSection] = useState<MockSectionWithProfiles | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load section data
  const loadSection = useCallback(async () => {
    if (!sectionId) {
      setSection(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      const data = await mockSectionService.getSectionById(sectionId)
      setSection(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load section')
      console.error('Error loading section:', err)
    } finally {
      setLoading(false)
    }
  }, [sectionId])

  useEffect(() => {
    loadSection()
  }, [loadSection])

  // Update section (with optimistic update)
  const updateSection = useCallback(async (updates: MockUpdateSectionData) => {
    if (!sectionId || !section) return

    // Optimistic update
    const optimisticSection = {
      ...section,
      ...updates,
      data: updates.data !== undefined ? updates.data : (section.data as Record<string, any>)
    }
    setSection(optimisticSection)

    try {
      setSaving(true)
      setSaveError(null)
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300))
      const updated = await mockSectionService.updateSection(sectionId, updates)
      setSection(updated)
      setLastSaved(new Date())
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save section')
      console.error('Error saving section:', err)
      // Revert optimistic update on error
      await loadSection()
    } finally {
      setSaving(false)
    }
  }, [sectionId, section, loadSection])

  // Update single field (for auto-save on blur)
  const updateField = useCallback(async (fieldPath: string, value: any) => {
    if (!sectionId || !section) return

    // Optimistic update
    const updatedData = { ...section.data }
    const keys = fieldPath.split('.')
    let current: any = updatedData

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }
    current[keys[keys.length - 1]] = value

    setSection({
      ...section,
      data: updatedData
    })

    try {
      setSaving(true)
      setSaveError(null)
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200))
      const updated = await mockSectionService.updateSectionField(sectionId, fieldPath, value)
      setSection(updated)
      setLastSaved(new Date())
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save field')
      console.error('Error saving field:', err)
      // Revert optimistic update on error
      await loadSection()
    } finally {
      setSaving(false)
    }
  }, [sectionId, section, loadSection])

  // Debounced version of updateField for auto-save
  const debouncedUpdateField = useDebounce(updateField, 1000)

  return {
    section,
    loading,
    error,
    saving,
    saveError,
    lastSaved,
    updateSection,
    updateField,
    debouncedUpdateField,
    refetch: loadSection
  }
}

/**
 * Hook for completing a section (Mock version)
 */
export function useMockCompleteSection(sectionId: string | null) {
  const { user } = useSimpleAuth()
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const completeSection = useCallback(async () => {
    if (!sectionId || !user) {
      throw new Error('Section ID and user are required')
    }

    try {
      setCompleting(true)
      setError(null)
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      const updated = await mockSectionService.completeSection(sectionId, user.id)
      return updated
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to complete section'
      setError(errorMessage)
      console.error('Error completing section:', err)
      throw new Error(errorMessage)
    } finally {
      setCompleting(false)
    }
  }, [sectionId, user])

  return {
    completeSection,
    completing,
    error
  }
}

/**
 * Hook for auto-save functionality with visual feedback (Mock version)
 */
export function useMockAutoSave() {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const save = useCallback(async (saveFn: () => Promise<void>) => {
    try {
      setSaveState('saving')
      await saveFn()
      setSaveState('saved')
      setLastSaved(new Date())

      // Reset to idle after 2 seconds
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current as any)
      }
      timeoutRef.current = setTimeout(() => {
        setSaveState('idle')
      }, 2000) as any
    } catch (err) {
      setSaveState('error')
      console.error('Auto-save error:', err)
      
      // Reset to idle after 3 seconds
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current as any)
      }
      timeoutRef.current = setTimeout(() => {
        setSaveState('idle')
      }, 3000) as any
    }
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current as any)
      }
    }
  }, [])

  return {
    saveState,
    lastSaved,
    save
  }
}