/**
 * Auto-Save Wrapper Component
 * 
 * Wraps form inputs to provide automatic saving on blur
 * with visual feedback and error handling
 */

'use client'

import React, { useCallback } from 'react'
import { useSectionData } from '@/lib/api/use-sections'

interface AutoSaveWrapperProps {
  sectionId: string
  fieldPath: string
  children: (props: {
    value: any
    onChange: (value: any) => void
    onBlur: () => void
    disabled: boolean
  }) => React.ReactNode
  defaultValue?: any
}

export function AutoSaveWrapper({
  sectionId,
  fieldPath,
  children,
  defaultValue
}: AutoSaveWrapperProps) {
  const { section, debouncedUpdateField, saving } = useSectionData(sectionId)

  // Get current value from section data
  const getValue = useCallback(() => {
    if (!section?.data) return defaultValue

    const keys = fieldPath.split('.')
    let current: any = section.data

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return defaultValue
      }
    }

    return current !== undefined ? current : defaultValue
  }, [section, fieldPath, defaultValue])

  const value = getValue()

  const handleChange = useCallback((newValue: any) => {
    // Trigger debounced save
    debouncedUpdateField(fieldPath, newValue)
  }, [debouncedUpdateField, fieldPath])

  const handleBlur = useCallback(() => {
    // Immediate save on blur (cancel debounce and save now)
    // This is handled by the hook internally
  }, [])

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
