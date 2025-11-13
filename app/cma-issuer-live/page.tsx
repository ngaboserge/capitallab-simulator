"use client"

import { AuthProvider } from '@/lib/supabase/auth-context'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { SupabaseSmartApplication } from '@/components/cma-issuer/workflow/supabase-smart-application'

export default function LiveCMAIssuerPage() {
  return (
    <AuthProvider>
      <ProtectedRoute allowedRoles={['ISSUER_CEO', 'ISSUER_CFO', 'ISSUER_SECRETARY', 'ISSUER_LEGAL']}>
        <div className="min-h-screen bg-background">
          <SupabaseSmartApplication />
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}