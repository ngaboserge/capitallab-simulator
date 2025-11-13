/**
 * Section Auto-Save Integration Example
 * 
 * Demonstrates how to integrate auto-save functionality
 * with existing section form components
 */

'use client'

import React from 'react'
import { SectionFormWrapper, AutoSaveField } from '@/components/cma-issuer/form-components/section-form-wrapper'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SectionAutoSaveExampleProps {
  sectionId: string
  onComplete?: () => void
}

export function SectionAutoSaveExample({
  sectionId,
  onComplete
}: SectionAutoSaveExampleProps) {
  return (
    <SectionFormWrapper
      sectionId={sectionId}
      showSaveIndicator={true}
      showCompleteButton={true}
      onComplete={onComplete}
      className="max-w-4xl mx-auto p-6"
    >
      {/* Example: Text Input with Auto-Save */}
      <div className="space-y-2">
        <Label htmlFor="company-name">Company Legal Name</Label>
        <AutoSaveField fieldPath="companyInfo.legalName" defaultValue="">
          {({ value, onChange, onBlur, disabled }) => (
            <Input
              id="company-name"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              placeholder="Enter company legal name"
            />
          )}
        </AutoSaveField>
      </div>

      {/* Example: Textarea with Auto-Save */}
      <div className="space-y-2">
        <Label htmlFor="business-description">Business Description</Label>
        <AutoSaveField fieldPath="companyInfo.businessDescription" defaultValue="">
          {({ value, onChange, onBlur, disabled }) => (
            <Textarea
              id="business-description"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              placeholder="Describe your business activities"
              rows={4}
            />
          )}
        </AutoSaveField>
      </div>

      {/* Example: Select with Auto-Save */}
      <div className="space-y-2">
        <Label htmlFor="industry-sector">Industry Sector</Label>
        <AutoSaveField fieldPath="companyInfo.industrySector" defaultValue="">
          {({ value, onChange, disabled }) => (
            <Select
              value={value}
              onValueChange={onChange}
              disabled={disabled}
            >
              <SelectTrigger id="industry-sector">
                <SelectValue placeholder="Select industry sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="financial-services">Financial Services</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="agriculture">Agriculture</SelectItem>
                <SelectItem value="real-estate">Real Estate</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          )}
        </AutoSaveField>
      </div>

      {/* Example: Nested Object Fields */}
      <div className="space-y-4">
        <h4 className="font-semibold">Contact Information</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact-email">Email</Label>
            <AutoSaveField fieldPath="contactInfo.email" defaultValue="">
              {({ value, onChange, onBlur, disabled }) => (
                <Input
                  id="contact-email"
                  type="email"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  disabled={disabled}
                  placeholder="contact@company.com"
                />
              )}
            </AutoSaveField>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone">Phone</Label>
            <AutoSaveField fieldPath="contactInfo.phone" defaultValue="">
              {({ value, onChange, onBlur, disabled }) => (
                <Input
                  id="contact-phone"
                  type="tel"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  disabled={disabled}
                  placeholder="+250 XXX XXX XXX"
                />
              )}
            </AutoSaveField>
          </div>
        </div>
      </div>

      {/* Example: Number Input with Auto-Save */}
      <div className="space-y-2">
        <Label htmlFor="target-amount">Target Amount (RWF)</Label>
        <AutoSaveField fieldPath="offerDetails.targetAmount" defaultValue="">
          {({ value, onChange, onBlur, disabled }) => (
            <Input
              id="target-amount"
              type="number"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              placeholder="1000000000"
              min="0"
            />
          )}
        </AutoSaveField>
      </div>
    </SectionFormWrapper>
  )
}

/**
 * Usage Example:
 * 
 * import { SectionAutoSaveExample } from '@/components/examples/section-auto-save-example'
 * 
 * function MyPage() {
 *   const handleComplete = () => {
 *     console.log('Section completed!')
 *     // Navigate to next section or show success message
 *   }
 * 
 *   return (
 *     <SectionAutoSaveExample
 *       sectionId="section-uuid-here"
 *       onComplete={handleComplete}
 *     />
 *   )
 * }
 */
