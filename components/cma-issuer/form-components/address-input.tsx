"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Address } from '@/lib/cma-issuer-system/types'

interface AddressInputProps {
  label?: string
  value?: Address
  onChange?: (address: Address) => void
  required?: boolean
  errors?: Partial<Record<keyof Address, string>>
}

const RWANDA_PROVINCES = [
  'Kigali City',
  'Eastern Province',
  'Northern Province',
  'Southern Province',
  'Western Province'
]

export function AddressInput({
  label = "Address",
  value,
  onChange,
  required = false,
  errors = {}
}: AddressInputProps) {
  const handleFieldChange = (field: keyof Address, fieldValue: string) => {
    const updatedAddress = {
      ...value,
      [field]: fieldValue
    } as Address
    onChange?.(updatedAddress)
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
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="street">
              Street Address
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id="street"
              placeholder="Enter street address"
              value={value?.street || ''}
              onChange={(e) => handleFieldChange('street', e.target.value)}
              className={errors.street ? 'border-red-500' : ''}
            />
            {errors.street && (
              <p className="text-sm text-red-600">{errors.street}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">
                City/District
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                id="city"
                placeholder="Enter city or district"
                value={value?.city || ''}
                onChange={(e) => handleFieldChange('city', e.target.value)}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">
                Province
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <select
                value={value?.province || ''}
                onChange={(e) => handleFieldChange('province', e.target.value)}
                className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.province ? 'border-red-500' : ''}`}
              >
                <option value="">Select province</option>
                {RWANDA_PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
              {errors.province && (
                <p className="text-sm text-red-600">{errors.province}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                placeholder="Enter postal code"
                value={value?.postalCode || ''}
                onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                className={errors.postalCode ? 'border-red-500' : ''}
              />
              {errors.postalCode && (
                <p className="text-sm text-red-600">{errors.postalCode}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                Country
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                id="country"
                value="Rwanda"
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}