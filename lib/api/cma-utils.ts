/**
 * Utility functions for CMA application system
 */

import type { Database } from '@/lib/supabase/types'

type ApplicationStatus = Database['public']['Tables']['ipo_applications']['Row']['status']
type SectionStatus = Database['public']['Tables']['application_sections']['Row']['status']
type UserRole = Database['public']['Tables']['profiles']['Row']['role']

// ============ Status Helpers ============

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  QUERY_ISSUED: 'Query Issued',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
}

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  QUERY_ISSUED: 'bg-orange-100 text-orange-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800'
}

export const SECTION_STATUS_LABELS: Record<SectionStatus, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved'
}

export const SECTION_STATUS_COLORS: Record<SectionStatus, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-emerald-100 text-emerald-800'
}

// ============ Role Helpers ============

export const ROLE_LABELS: Record<UserRole, string> = {
  ISSUER_CEO: 'CEO',
  ISSUER_CFO: 'CFO',
  ISSUER_SECRETARY: 'Company Secretary',
  ISSUER_LEGAL: 'Legal Officer',
  IB_ADVISOR: 'IB Advisor',
  CMA_REGULATOR: 'CMA Regulator',
  CMA_ADMIN: 'CMA Administrator'
}

export const ROLE_COLORS: Record<UserRole, string> = {
  ISSUER_CEO: 'bg-purple-100 text-purple-800',
  ISSUER_CFO: 'bg-blue-100 text-blue-800',
  ISSUER_SECRETARY: 'bg-cyan-100 text-cyan-800',
  ISSUER_LEGAL: 'bg-indigo-100 text-indigo-800',
  IB_ADVISOR: 'bg-green-100 text-green-800',
  CMA_REGULATOR: 'bg-orange-100 text-orange-800',
  CMA_ADMIN: 'bg-red-100 text-red-800'
}

export function isIssuerRole(role: UserRole): boolean {
  return role.startsWith('ISSUER_')
}

export function isCMARole(role: UserRole): boolean {
  return role === 'CMA_REGULATOR' || role === 'CMA_ADMIN'
}

export function canEditSection(userRole: UserRole, sectionRole: string): boolean {
  return userRole === sectionRole || userRole === 'IB_ADVISOR'
}

export function canSubmitApplication(userRole: UserRole): boolean {
  return userRole === 'ISSUER_CEO'
}

export function canReviewApplication(userRole: UserRole): boolean {
  return isCMARole(userRole)
}

export function canAssignIBAdvisor(userRole: UserRole): boolean {
  return userRole === 'ISSUER_CEO'
}

// ============ Progress Helpers ============

export function calculateSectionProgress(sections: any[]): {
  total: number
  completed: number
  inProgress: number
  notStarted: number
  percentage: number
} {
  const total = sections.length
  const completed = sections.filter(s => s.status === 'COMPLETED').length
  const inProgress = sections.filter(s => s.status === 'IN_PROGRESS').length
  const notStarted = sections.filter(s => s.status === 'NOT_STARTED').length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return { total, completed, inProgress, notStarted, percentage }
}

export function isApplicationReadyForSubmission(sections: any[]): boolean {
  return sections.every(s => s.status === 'COMPLETED')
}

export function getNextIncompleteSection(sections: any[]): any | null {
  return sections.find(s => s.status !== 'COMPLETED') || null
}

// ============ Validation Helpers ============

export function validateApplicationNumber(appNumber: string): boolean {
  return /^IPO-\d{4}-\d{4}$/.test(appNumber)
}

export function validateTargetAmount(amount: number): boolean {
  return amount > 0 && amount <= 1000000000000 // Max 1 trillion
}

export function formatCurrency(amount: number, currency = 'SAR'): string {
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return formatDate(date)
}

// ============ Notification Helpers ============

export const NOTIFICATION_TYPES = {
  APPLICATION_SUBMITTED: 'Application Submitted',
  IB_ASSIGNED: 'IB Advisor Assigned',
  CMA_START_REVIEW: 'Review Started',
  CMA_ISSUE_QUERY: 'Query Issued',
  CMA_APPROVE: 'Application Approved',
  CMA_REJECT: 'Application Rejected',
  COMMENT_ADDED: 'New Comment',
  SECTION_COMPLETED: 'Section Completed'
} as const

export function getNotificationIcon(type: string): string {
  switch (type) {
    case 'APPLICATION_SUBMITTED': return '📤'
    case 'IB_ASSIGNED': return '👔'
    case 'CMA_START_REVIEW': return '🔍'
    case 'CMA_ISSUE_QUERY': return '❓'
    case 'CMA_APPROVE': return '✅'
    case 'CMA_REJECT': return '❌'
    case 'COMMENT_ADDED': return '💬'
    case 'SECTION_COMPLETED': return '✓'
    default: return '📢'
  }
}

// ============ Section Mapping ============

export const SECTION_TITLES = [
  'Company Identity & Legal Form',
  'Capitalization & Financial Strength',
  'Share Ownership & Distribution',
  'Governance & Management',
  'Legal & Regulatory Compliance',
  'Offer Details (IPO Information)',
  'Prospectus & Disclosure Checklist',
  'Publication & Advertisement',
  'Post-Approval Undertakings',
  'Declarations & Contacts'
]

export const SECTION_ROLE_MAPPING: Record<number, UserRole> = {
  1: 'ISSUER_CEO',
  2: 'ISSUER_CFO',
  3: 'ISSUER_CFO',
  4: 'ISSUER_SECRETARY',
  5: 'ISSUER_LEGAL',
  6: 'ISSUER_CFO',
  7: 'ISSUER_CEO',
  8: 'ISSUER_SECRETARY',
  9: 'ISSUER_LEGAL',
  10: 'ISSUER_CEO'
}

export function getSectionTitle(sectionNumber: number): string {
  return SECTION_TITLES[sectionNumber - 1] || `Section ${sectionNumber}`
}

export function getSectionRole(sectionNumber: number): UserRole {
  return SECTION_ROLE_MAPPING[sectionNumber] || 'ISSUER_CEO'
}

// ============ Access Control Helpers ============

export function canAccessApplication(
  userRole: UserRole,
  userCompanyId: string | null,
  application: {
    company_id: string
    assigned_ib_advisor: string | null
    assigned_cma_officer: string | null
  },
  userId: string
): boolean {
  // CMA Admin has full access
  if (userRole === 'CMA_ADMIN') return true

  // CMA Regulator can access submitted applications or assigned ones
  if (userRole === 'CMA_REGULATOR') {
    return application.assigned_cma_officer === userId
  }

  // Issuer can access their company's applications
  if (isIssuerRole(userRole)) {
    return application.company_id === userCompanyId
  }

  // IB Advisor can access assigned applications
  if (userRole === 'IB_ADVISOR') {
    return application.assigned_ib_advisor === userId
  }

  return false
}

// ============ Export Helpers ============

export function generateApplicationSummary(application: any): string {
  const status = application.status as ApplicationStatus
  const lines = [
    `Application Number: ${application.application_number || 'N/A'}`,
    `Company: ${application.companies?.legal_name || 'N/A'}`,
    `Status: ${APPLICATION_STATUS_LABELS[status] || application.status}`,
    `Completion: ${application.completion_percentage}%`,
    `Target Amount: ${formatCurrency(application.target_amount || 0)}`,
    `Submission Date: ${application.submission_date ? formatDate(application.submission_date) : 'Not submitted'}`,
    `IB Advisor: ${application.assigned_ib_advisor?.full_name || 'Not assigned'}`,
    `CMA Officer: ${application.assigned_cma_officer?.full_name || 'Not assigned'}`
  ]
  return lines.join('\n')
}

// ============ Risk Rating Helpers ============

export const RISK_RATINGS = {
  LOW: { label: 'Low Risk', color: 'bg-green-100 text-green-800', icon: '🟢' },
  MEDIUM: { label: 'Medium Risk', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
  HIGH: { label: 'High Risk', color: 'bg-red-100 text-red-800', icon: '🔴' }
}

export function getRiskRatingInfo(rating: 'LOW' | 'MEDIUM' | 'HIGH' | null) {
  return rating ? RISK_RATINGS[rating] : null
}

// ============ Compliance Score Helpers ============

export function getComplianceScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

export function getComplianceScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Poor'
}
