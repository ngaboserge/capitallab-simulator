/**
 * Section Form Wrapper Component
 * 
 * Wraps section forms to provide:
 * - Auto-save functionality
 * - Save state indicators
 * - Completion tracking
 * - Optimistic UI updates
 */

'use client'

import React, { createContext, useContext, useCallback } from 'react'
import { useSectionData, useCompleteSection } from '@/lib/api/use-sections'
import { SaveIndicator, type SaveState } from './save-indicator'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface SectionFormContextValue {
  sectionId: string
  sectionData: Record<string, any>
  updateField: (fieldPath: string, value: any) => void
  debouncedUpdateField: (fieldPath: string, value: any) => void
  saving: boolean
  saveError: string | null
  lastSaved: Date | null
  completeSection: () => Promise<void>
  completing: boolean
}

const SectionFormContext = createContext<SectionFormContextValue | null>(null)

export function useSectionForm() {
  const context = useContext(SectionFormContext)
  if (!context) {
    throw new Error('useSectionForm must be used within SectionFormWrapper')
  }
  return context
}

interface SectionFormWrapperProps {
  sectionId: string
  children: React.ReactNode
  showSaveIndicator?: boolean
  showCompleteButton?: boolean
  onComplete?: () => void
  className?: string
}

export function SectionFormWrapper({
  sectionId,
  children,
  showSaveIndicator = true,
  showCompleteButton = true,
  onComplete,
  className
}: SectionFormWrapperProps) {
  const {
    section,
    loading,
    error,
    saving,
    saveError,
    lastSaved,
    updateField,
    debouncedUpdateField,
    refetch
  } = useSectionData(sectionId)

  const {
    completeSection: completeAction,
    completing,
    error: completeError
  } = useCompleteSection(sectionId)

  const handleComplete = useCallback(async () => {
    try {
      await completeAction()
      await refetch()
      onComplete?.()
    } catch (err) {
      console.error('Error completing section:', err)
    }
  }, [completeAction, refetch, onComplete])

  // Determine save state for indicator
  const getSaveState = (): SaveState => {
    if (saveError) return 'error'
    if (saving) return 'saving'
    if (lastSaved) return 'saved'
    return 'idle'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading section...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!section) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Section not found</AlertDescription>
      </Alert>
    )
  }

  const contextValue: SectionFormContextValue = {
    sectionId,
    sectionData: (section.data as Record<string, any>) || {},
    updateField,
    debouncedUpdateField,
    saving,
    saveError,
    lastSaved,
    completeSection: handleComplete,
    completing
  }

  const isCompleted = section.status === 'COMPLETED'
  const canComplete = section.completion_percentage >= 80 && !isCompleted

  return (
    <SectionFormContext.Provider value={contextValue}>
      <div className={className}>
        {/* Header with save indicator */}
        {showSaveIndicator && (
          <div className="flex items-center justify-between mb-4 pb-2 border-b">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">{section.section_title}</h3>
              {isCompleted && (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Completed</span>
                </div>
              )}
            </div>
            <SaveIndicator
              state={getSaveState()}
              lastSaved={lastSaved}
              error={saveError}
            />
          </div>
        )}

        {/* Save error alert */}
        {saveError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}

        {/* Complete error alert */}
        {completeError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{completeError}</AlertDescription>
          </Alert>
        )}

        {/* Form content */}
        <div className="space-y-6">
          {children}
        </div>

        {/* Footer with complete button */}
        {showCompleteButton && !isCompleted && (
          <div className="mt-6 pt-4 border-t flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Section is {section.completion_percentage}% complete
            </div>
            <Button
              onClick={handleComplete}
              disabled={!canComplete || completing || saving}
              variant={canComplete ? 'default' : 'outline'}
            >
              {completing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Complete
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </SectionFormContext.Provider>
  )
}

/**
 * Helper component for form fields with auto-save
 */
interface AutoSaveFieldProps {
  fieldPath: string
  children: (props: {
    value: any
    onChange: (value: any) => void
    onBlur: () => void
    disabled: boolean
  }) => React.ReactNode
  defaultValue?: any
}

export function AutoSaveField({
  fieldPath,
  children,
  defaultValue
}: AutoSaveFieldProps) {
  const { sectionData, debouncedUpdateField, updateField, saving } = useSectionForm()

  // Get current value from section data
  const getValue = useCallback(() => {
    const keys = fieldPath.split('.')
    let current: any = sectionData

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return defaultValue
      }
    }

    return current !== undefined ? current : defaultValue
  }, [sectionData, fieldPath, defaultValue])

  const value = getValue()

  const handleChange = useCallback((newValue: any) => {
    // Use debounced update for typing
    debouncedUpdateField(fieldPath, newValue)
  }, [debouncedUpdateField, fieldPath])

  const handleBlur = useCallback(() => {
    // Immediate save on blur
    updateField(fieldPath, value)
  }, [updateField, fieldPath, value])

  return (
    <>
      {children({
        value,
        onChange: handleChange,
        onBlur: handleBlur,
        disabled: saving
      })}
    </>
  )
}
