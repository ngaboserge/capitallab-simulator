/**
 * API Middleware utilities for authentication and authorization
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type UserRole = Database['public']['Tables']['profiles']['Row']['role']

export interface AuthenticatedRequest {
  user: {
    id: string
    email: string
  }
  profile: {
    id: string
    email: string
    full_name: string | null
    role: UserRole
    company_id: string | null
  }
}

/**
 * Authenticate user and get their profile
 */
export async function authenticate(): Promise<{
  data: AuthenticatedRequest | null
  error: string | null
}> {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: 'Unauthorized' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { data: null, error: 'Profile not found' }
  }

  return {
    data: {
      user: {
        id: user.id,
        email: user.email || ''
      },
      profile
    },
    error: null
  }
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole)
}

/**
 * Check if user has any issuer role
 */
export function isIssuer(userRole: UserRole): boolean {
  return userRole.startsWith('ISSUER_')
}

/**
 * Check if user is CMA staff
 */
export function isCMA(userRole: UserRole): boolean {
  return userRole === 'CMA_REGULATOR' || userRole === 'CMA_ADMIN'
}

/**
 * Middleware wrapper for protected routes
 */
export async function withAuth(
  handler: (request: NextRequest, auth: AuthenticatedRequest, params?: any) => Promise<NextResponse>,
  options?: {
    allowedRoles?: UserRole[]
    requireCompany?: boolean
  }
) {
  return async (request: NextRequest, context?: { params: any }) => {
    const { data: auth, error } = await authenticate()

    if (error || !auth) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    // Check role requirements
    if (options?.allowedRoles && !hasRole(auth.profile.role, options.allowedRoles)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check company requirement
    if (options?.requireCompany && !auth.profile.company_id) {
      return NextResponse.json({ error: 'Company association required' }, { status: 400 })
    }

    return handler(request, auth, context?.params)
  }
}

/**
 * Check if user can access specific application
 */
export async function canAccessApplication(
  userId: string,
  userRole: UserRole,
  userCompanyId: string | null,
  applicationId: string
): Promise<boolean> {
  const supabase = createClient()

  const { data: application } = await supabase
    .from('ipo_applications')
    .select('company_id, assigned_ib_advisor, assigned_cma_officer')
    .eq('id', applicationId)
    .single()

  if (!application) return false

  // CMA Admin has full access
  if (userRole === 'CMA_ADMIN') return true

  // CMA Regulator can access assigned or submitted applications
  if (userRole === 'CMA_REGULATOR') {
    return application.assigned_cma_officer === userId
  }

  // Issuer can access their company's applications
  if (isIssuer(userRole)) {
    return application.company_id === userCompanyId
  }

  // IB Advisor can access assigned applications
  if (userRole === 'IB_ADVISOR') {
    return application.assigned_ib_advisor === userId
  }

  return false
}

/**
 * Check if user can modify specific application
 */
export async function canModifyApplication(
  userId: string,
  userRole: UserRole,
  userCompanyId: string | null,
  applicationId: string
): Promise<boolean> {
  const supabase = createClient()

  const { data: application } = await supabase
    .from('ipo_applications')
    .select('company_id, assigned_ib_advisor, status')
    .eq('id', applicationId)
    .single()

  if (!application) return false

  // Can't modify approved or rejected applications
  if (['APPROVED', 'REJECTED'].includes(application.status)) {
    return false
  }

  // CMA Admin can modify any application
  if (userRole === 'CMA_ADMIN') return true

  // Issuer can modify their company's applications (if not submitted)
  if (isIssuer(userRole) && application.company_id === userCompanyId) {
    return ['DRAFT', 'QUERY_ISSUED'].includes(application.status)
  }

  // IB Advisor can modify assigned applications (if not submitted)
  if (userRole === 'IB_ADVISOR' && application.assigned_ib_advisor === userId) {
    return ['DRAFT', 'QUERY_ISSUED'].includes(application.status)
  }

  return false
}

/**
 * Validate request body against schema
 */
export function validateBody<T>(
  body: any,
  requiredFields: (keyof T)[]
): { valid: boolean; error?: string } {
  for (const field of requiredFields) {
    if (!(field in body) || body[field] === undefined || body[field] === null) {
      return { valid: false, error: `Missing required field: ${String(field)}` }
    }
  }
  return { valid: true }
}

/**
 * Create standardized error response
 */
export function errorResponse(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Create standardized success response
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status })
}

/**
 * Rate limiting helper (simple in-memory implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests = 100,
  windowMs = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count }
}

/**
 * Log API request for audit trail
 */
export async function logApiRequest(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: any
) {
  // In production, this would write to an audit log table
  console.log('[API Audit]', {
    timestamp: new Date().toISOString(),
    userId,
    action,
    resourceType,
    resourceId,
    metadata
  })
}
