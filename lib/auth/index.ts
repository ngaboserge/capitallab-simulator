// Export authentication context and hooks
export { SimpleAuthProvider, useSimpleAuth } from './simple-auth-context'
export type { SignupData } from './simple-auth-context'

// Export protected route component
export { SimpleProtectedRoute } from './simple-protected-route'

// Export company service
export { CompanyService } from './company-service'

// Re-export types from supabase
export type { Profile } from '@/lib/supabase/types'
