/**
 * Mock Section Service for Development
 * 
 * Provides a temporary implementation that uses localStorage
 * but mimics the real API structure for seamless transition
 */

import type { ApplicationSection } from '@/lib/supabase/types'

export interface MockSectionWithProfiles extends ApplicationSection {
  completed_by_profile?: {
    id: string
    full_name: string
    email: string
  } | null
  reviewed_by_profile?: {
    id: string
    full_name: string
    email: string
  } | null
}

export interface MockUpdateSectionData {
  data?: Record<string, any>
  status?: ApplicationSection['status']
  validation_errors?: any[]
  completion_percentage?: number
}

export class MockSectionService {
  private getStorageKey(sectionId: string): string {
    return `mock_section_${sectionId}`
  }

  private createMockSection(sectionId: string, sectionNumber: number): MockSectionWithProfiles {
    return {
      id: sectionId,
      application_id: sectionId.split('-section-')[0],
      section_number: sectionNumber,
      title: this.getSectionTitle(sectionNumber),
      data: {},
      status: 'NOT_STARTED',
      completion_percentage: 0,
      validation_errors: null,
      completed_by: null,
      completed_at: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  private getSectionTitle(sectionNumber: number): string {
    const titles: Record<number, string> = {
      1: 'Company Identity & Legal Form',
      2: 'Capitalization & Financial Strength',
      3: 'Share Ownership & Distribution',
      4: 'Governance & Management',
      5: 'Legal & Regulatory Compliance',
      6: 'Offer Details (IPO Information)',
      7: 'Prospectus & Disclosure Checklist',
      8: 'Publication & Advertisement',
      9: 'Post-Approval Undertakings',
      10: 'Declarations & Contacts'
    }
    return titles[sectionNumber] || `Section ${sectionNumber}`
  }

  async getSectionById(sectionId: string): Promise<MockSectionWithProfiles | null> {
    try {
      const stored = localStorage.getItem(this.getStorageKey(sectionId))
      if (stored) {
        return JSON.parse(stored)
      }

      // Extract section number from ID
      const sectionNumber = parseInt(sectionId.split('-section-')[1])
      if (isNaN(sectionNumber)) {
        return null
      }

      // Create new mock section
      const mockSection = this.createMockSection(sectionId, sectionNumber)
      localStorage.setItem(this.getStorageKey(sectionId), JSON.stringify(mockSection))
      return mockSection
    } catch (error) {
      console.error('Error getting mock section:', error)
      return null
    }
  }

  async updateSection(sectionId: string, updates: MockUpdateSectionData): Promise<MockSectionWithProfiles> {
    const existing = await this.getSectionById(sectionId)
    if (!existing) {
      throw new Error('Section not found')
    }

    const updated: MockSectionWithProfiles = {
      ...existing,
      updated_at: new Date().toISOString()
    }

    // Apply updates
    if (updates.data !== undefined) {
      updated.data = updates.data
    }
    if (updates.status !== undefined) {
      updated.status = updates.status
    }
    if (updates.validation_errors !== undefined) {
      updated.validation_errors = updates.validation_errors
    }
    if (updates.completion_percentage !== undefined) {
      updated.completion_percentage = Math.max(0, Math.min(100, updates.completion_percentage))
    }

    // Save to localStorage
    localStorage.setItem(this.getStorageKey(sectionId), JSON.stringify(updated))
    return updated
  }

  async updateSectionField(sectionId: string, fieldPath: string, value: any): Promise<MockSectionWithProfiles> {
    const section = await this.getSectionById(sectionId)
    if (!section) {
      throw new Error('Section not found')
    }

    // Update the specific field in the data object
    const updatedData = { ...(section.data as Record<string, any>) }
    this.setNestedValue(updatedData, fieldPath, value)

    // Calculate completion percentage
    const completionPercentage = this.calculateFieldCompletion(updatedData)

    return this.updateSection(sectionId, {
      data: updatedData,
      completion_percentage: completionPercentage,
      status: completionPercentage > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'
    })
  }

  async completeSection(sectionId: string, userId: string): Promise<MockSectionWithProfiles> {
    const section = await this.getSectionById(sectionId)
    if (!section) {
      throw new Error('Section not found')
    }

    // Validate that section has data
    if (!section.data || Object.keys(section.data).length === 0) {
      throw new Error('Cannot complete empty section')
    }

    const updated: MockSectionWithProfiles = {
      ...section,
      status: 'COMPLETED',
      completion_percentage: 100,
      completed_by: userId,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    localStorage.setItem(this.getStorageKey(sectionId), JSON.stringify(updated))
    return updated
  }

  private calculateFieldCompletion(data: Record<string, any>): number {
    if (!data || Object.keys(data).length === 0) {
      return 0
    }

    const fields = this.flattenObject(data)
    const totalFields = Object.keys(fields).length
    const filledFields = Object.values(fields).filter(value => {
      if (value === null || value === undefined || value === '') {
        return false
      }
      if (Array.isArray(value) && value.length === 0) {
        return false
      }
      if (typeof value === 'object' && Object.keys(value).length === 0) {
        return false
      }
      return true
    }).length

    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }

    current[keys[keys.length - 1]] = value
  }

  private flattenObject(obj: any, prefix = ''): Record<string, any> {
    const flattened: Record<string, any> = {}

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key]
        const newKey = prefix ? `${prefix}.${key}` : key

        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          Object.assign(flattened, this.flattenObject(value, newKey))
        } else {
          flattened[newKey] = value
        }
      }
    }

    return flattened
  }
}

// Export singleton instance
export const mockSectionService = new MockSectionService()