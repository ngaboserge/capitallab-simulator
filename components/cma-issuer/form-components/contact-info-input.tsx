"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContactInfo } from '@/lib/cma-issuer-system/types'

interface ContactInfoInputProps {
  label?: string
  value?: ContactInfo
  onChange?: (contactInfo: ContactInfo) => void
  required?: boolean
  errors?: Partial<Record<keyof ContactInfo, string>>
}

export function ContactInfoInput({
  label = "Contact Information",
  value,
  onChange,
  required = false,
  errors = {}
}: ContactInfoInputProps) {
  const handleFieldChange = (field: keyof ContactInfo, fieldValue: string) => {
    const updatedContactInfo = {
      ...value,
      [field]: fieldValue
    } as ContactInfo
    onChange?.(updatedContactInfo)
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="company@example.com"
              value={value?.email || ''}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+250 XXX XXX XXX"
              value={value?.phone || ''}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fax">Fax Number</Label>
            <Input
              id="fax"
              type="tel"
              placeholder="+250 XXX XXX XXX"
              value={value?.fax || ''}
              onChange={(e) => handleFieldChange('fax', e.target.value)}
              className={errors.fax ? 'border-red-500' : ''}
            />
            {errors.fax && (
              <p className="text-sm text-red-600">{errors.fax}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://www.company.com"
              value={value?.website || ''}
              onChange={(e) => handleFieldChange('website', e.target.value)}
              className={errors.website ? 'border-red-500' : ''}
            />
            {errors.website && (
              <p className="text-sm text-red-600">{errors.website}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}