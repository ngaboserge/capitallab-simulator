"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Plus, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TableField {
  key: string
  label: string
  type: 'text' | 'email' | 'tel' | 'date' | 'number' | 'select' | 'checkbox'
  required?: boolean
  placeholder?: string
  options?: string[]
}

interface DynamicTableProps<T> {
  title: string
  description?: string
  fields: TableField[]
  data: T[]
  onChange: (data: T[]) => void
  createEmpty: () => T
  errors?: Record<number, Record<string, string>>
  maxItems?: number
  minItems?: number
}

export function DynamicTable<T extends Record<string, any>>({
  title,
  description,
  fields,
  data,
  onChange,
  createEmpty,
  errors = {},
  maxItems,
  minItems = 0
}: DynamicTableProps<T>) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]))

  const addItem = () => {
    if (maxItems && data.length >= maxItems) return
    const newItem = createEmpty()
    const newData = [...data, newItem]
    onChange(newData)
    setExpandedItems(prev => new Set([...prev, data.length]))
  }

  const removeItem = (index: number) => {
    if (data.length <= minItems) return
    const newData = data.filter((_, i) => i !== index)
    onChange(newData)
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      newSet.delete(index)
      // Adjust indices for remaining items
      const adjustedSet = new Set<number>()
      newSet.forEach(i => {
        if (i < index) adjustedSet.add(i)
        else if (i > index) adjustedSet.add(i - 1)
      })
      return adjustedSet
    })
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newData = [...data]
    newData[index] = { ...newData[index], [field]: value }
    onChange(newData)
  }

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const renderField = (field: TableField, item: T, index: number) => {
    const fieldError = errors[index]?.[field.key]
    const value = item[field.key]

    switch (field.type) {
      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={`${field.key}-${index}`}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <select
              value={value || ''}
              onChange={(e) => updateItem(index, field.key, e.target.value)}
              className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${fieldError ? 'border-red-500' : ''}`}
            >
              <option value="">{field.placeholder}</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {fieldError && (
              <p className="text-sm text-red-600">{fieldError}</p>
            )}
          </div>
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${field.key}-${index}`}
              checked={value || false}
              onCheckedChange={(checked) => updateItem(index, field.key, checked === true)}
              className={fieldError ? 'border-red-500' : ''}
            />
            <Label htmlFor={`${field.key}-${index}`} className="text-sm">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {fieldError && (
              <p className="text-sm text-red-600">{fieldError}</p>
            )}
          </div>
        )

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={`${field.key}-${index}`}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={`${field.key}-${index}`}
              type={field.type}
              placeholder={field.placeholder}
              value={value || ''}
              onChange={(e) => updateItem(index, field.key, e.target.value)}
              className={fieldError ? 'border-red-500' : ''}
            />
            {fieldError && (
              <p className="text-sm text-red-600">{fieldError}</p>
            )}
          </div>
        )
    }
  }

  const getItemSummary = (item: T) => {
    const nameField = fields.find(f => f.key === 'name')
    const positionField = fields.find(f => f.key === 'position')
    
    const name = nameField ? item[nameField.key] : ''
    const position = positionField ? item[positionField.key] : ''
    
    if (name && position) return `${name} - ${position}`
    if (name) return name
    if (position) return position
    return 'New Entry'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center">
          <User className="w-4 h-4 mr-2" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No entries added yet</p>
            <Button onClick={addItem} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Add First Entry
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      onClick={() => toggleExpanded(index)}
                      className="flex-1 justify-start p-0 h-auto"
                    >
                      <div className="text-left">
                        <p className="font-medium">{getItemSummary(item)}</p>
                        <p className="text-sm text-muted-foreground">
                          {expandedItems.has(index) ? 'Click to collapse' : 'Click to expand'}
                        </p>
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={data.length <= minItems}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                {expandedItems.has(index) && (
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fields.map((field) => (
                        <div
                          key={field.key}
                          className={cn(
                            field.type === 'checkbox' && 'md:col-span-2'
                          )}
                        >
                          {renderField(field, item, index)}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {data.length > 0 && (!maxItems || data.length < maxItems) && (
          <Button onClick={addItem} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Entry
          </Button>
        )}

        {maxItems && (
          <p className="text-sm text-muted-foreground text-center">
            {data.length} of {maxItems} entries
          </p>
        )}
      </CardContent>
    </Card>
  )
}