"use client"

import { IssuerApplicationForm } from '@/components/cma-issuer/issuer-application-form'

export default function CMAIssuerPage() {
  return (
    <div className="min-h-screen bg-background">
      <IssuerApplicationForm
        onSave={(data) => {
          console.log('Saving application data:', data)
          // In real implementation, save to database
        }}
        onSubmit={(data) => {
          console.log('Submitting application:', data)
          // In real implementation, submit to CMA system
        }}
      />
    </div>
  )
}