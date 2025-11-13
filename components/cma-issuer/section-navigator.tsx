"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Section {
  id: number
  title: string
  component: React.ComponentType<any>
}

interface SectionNavigatorProps {
  sections: Section[]
  currentSection: number
  onSectionChange: (sectionId: number) => void
  sectionCompletion: Record<number, boolean>
}

export function SectionNavigator({
  sections,
  currentSection,
  onSectionChange,
  sectionCompletion
}: SectionNavigatorProps) {
  const getSectionIcon = (sectionId: number) => {
    if (sectionCompletion[sectionId]) {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    }
    if (sectionId === currentSection) {
      return <AlertCircle className="w-5 h-5 text-blue-600" />
    }
    return <Circle className="w-5 h-5 text-gray-400" />
  }

  const getSectionStatus = (sectionId: number) => {
    if (sectionCompletion[sectionId]) {
      return 'Complete'
    }
    if (sectionId === currentSection) {
      return 'In Progress'
    }
    return 'Pending'
  }

  const getSectionBadgeVariant = (sectionId: number) => {
    if (sectionCompletion[sectionId]) {
      return 'default'
    }
    if (sectionId === currentSection) {
      return 'secondary'
    }
    return 'outline'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Application Sections</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant="ghost"
            className={cn(
              "w-full justify-start h-auto p-3 text-left",
              currentSection === section.id && "bg-muted"
            )}
            onClick={() => onSectionChange(section.id)}
          >
            <div className="flex items-start space-x-3 w-full">
              <div className="flex-shrink-0 mt-0.5">
                {getSectionIcon(section.id)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">
                    {section.id}. {section.title}
                  </span>
                </div>
                <Badge 
                  variant={getSectionBadgeVariant(section.id)}
                  className="text-xs"
                >
                  {getSectionStatus(section.id)}
                </Badge>
              </div>
            </div>
          </Button>
        ))}
        
        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Complete</span>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <Circle className="w-4 h-4 text-gray-400" />
              <span>Pending</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}