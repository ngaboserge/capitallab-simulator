"use client"

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { SectionNavigator } from '@/components/cma-issuer/section-navigator'
import { CompanyIdentitySection } from '@/components/cma-issuer/sections/company-identity-section-simple'
import { CapitalizationSection } from '@/components/cma-issuer/sections/capitalization-section-simple'
import { ShareOwnershipSection } from '@/components/cma-issuer/sections/share-ownership-section-simple'
import { GovernanceSection } from '@/components/cma-issuer/sections/governance-section-simple'
import { ComplianceSection } from '@/components/cma-issuer/sections/compliance-section-simple'
import { OfferDetailsSection } from './sections/offer-details-section-simple'
import { ProspectusSection } from './sections/prospectus-section-simple'
import { PublicationSection } from './sections/publication-section-simple'
import { UndertakingsSection } from './sections/undertakings-section-simple'
import { DeclarationsSection } from './sections/declarations-section-simple'
import { IssuerApplication } from '@/lib/cma-issuer-system/types'
import { Save, Send } from 'lucide-react'

// Force TypeScript to re-evaluate imports - updated

interface IssuerApplicationFormProps {
  initialData?: Partial<IssuerApplication>
  onSave?: (data: Partial<IssuerApplication>) => void
  onSubmit?: (data: IssuerApplication) => void
  currentSection?: number
  onSectionComplete?: (isComplete: boolean) => void
  restrictToSection?: number // If provided, only show this section
}

const SECTIONS = [
  { id: 1, title: 'Company Identity & Legal Form', component: CompanyIdentitySection },
  { id: 2, title: 'Capitalization & Financial Strength', component: CapitalizationSection },
  { id: 3, title: 'Share Ownership & Distribution', component: ShareOwnershipSection },
  { id: 4, title: 'Governance & Management', component: GovernanceSection },
  { id: 5, title: 'Legal & Regulatory Compliance', component: ComplianceSection },
  { id: 6, title: 'Offer Details (IPO Information)', component: OfferDetailsSection },
  { id: 7, title: 'Prospectus & Disclosure Checklist', component: ProspectusSection },
  { id: 8, title: 'Publication & Advertisement', component: PublicationSection },
  { id: 9, title: 'Post-Approval Undertakings', component: UndertakingsSection },
  { id: 10, title: 'Declarations & Contacts', component: DeclarationsSection }
]

export function IssuerApplicationForm({ 
  initialData, 
  onSave, 
  onSubmit,
  currentSection: propCurrentSection,
  onSectionComplete: propOnSectionComplete,
  restrictToSection
}: IssuerApplicationFormProps) {
  const [currentSection, setCurrentSection] = useState(propCurrentSection || restrictToSection || 1)
  const [applicationData, setApplicationData] = useState<Partial<IssuerApplication>>(
    initialData || {}
  )
  const [sectionCompletion, setSectionCompletion] = useState<Record<number, boolean>>({})

  const updateApplicationData = useCallback((sectionData: Partial<IssuerApplication>) => {
    setApplicationData(prev => ({
      ...prev,
      ...sectionData,
      lastModified: new Date()
    }))
  }, [])

  const markSectionComplete = useCallback((sectionId: number, isComplete: boolean) => {
    setSectionCompletion(prev => ({
      ...prev,
      [sectionId]: isComplete
    }))
    
    // Call the prop callback if provided (for workflow integration)
    if (propOnSectionComplete && sectionId === currentSection) {
      propOnSectionComplete(isComplete)
    }
  }, [propOnSectionComplete, currentSection])

  const handleSave = useCallback(() => {
    onSave?.(applicationData)
  }, [applicationData, onSave])

  const handleSubmit = useCallback(() => {
    if (applicationData && isApplicationComplete()) {
      onSubmit?.(applicationData as IssuerApplication)
    }
  }, [applicationData, onSubmit])

  const isApplicationComplete = () => {
    return SECTIONS.every(section => sectionCompletion[section.id])
  }

  const completionPercentage = () => {
    const completedSections = Object.values(sectionCompletion).filter(Boolean).length
    return Math.round((completedSections / SECTIONS.length) * 100)
  }

  const CurrentSectionComponent = SECTIONS.find(s => s.id === currentSection)?.component

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            CapitalLab - IPO Application Platform
          </CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Application Progress</span>
              <span>{completionPercentage()}% Complete</span>
            </div>
            <Progress value={completionPercentage()} className="w-full" />
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {!restrictToSection && (
          <div className="lg:col-span-1">
            <SectionNavigator
              sections={SECTIONS}
              currentSection={currentSection}
              onSectionChange={setCurrentSection}
              sectionCompletion={sectionCompletion}
            />
          </div>
        )}
        
        <div className={restrictToSection ? "lg:col-span-4" : "lg:col-span-3"}>
          <Card>
            <CardHeader>
              <CardTitle>
                Section {currentSection}: {SECTIONS.find(s => s.id === currentSection)?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {CurrentSectionComponent && (
                <CurrentSectionComponent
                  data={applicationData}
                  onDataChange={updateApplicationData}
                  onSectionComplete={(isComplete: boolean) => markSectionComplete(currentSection, isComplete)}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={!applicationData}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>

            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentSection(Math.max(1, currentSection - 1))}
                disabled={currentSection === 1}
              >
                Previous
              </Button>
              
              {currentSection < SECTIONS.length ? (
                <Button
                  onClick={() => setCurrentSection(Math.min(SECTIONS.length, currentSection + 1))}
                  disabled={!sectionCompletion[currentSection]}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isApplicationComplete()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}