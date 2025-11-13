// Workflow and role-based assignment types for CMA Issuer Application System

export type UserRole = 'CEO' | 'CFO' | 'COMPANY_SECRETARY' | 'LEGAL_ADVISOR'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  joinedDate: Date
  lastActivity?: Date
}

export interface SectionAssignment {
  sectionId: number
  sectionTitle: string
  assignedRole: UserRole
  description: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  estimatedTime: string // e.g., "30 minutes"
  dependencies?: number[] // Section IDs that must be completed first
}

export interface WorkflowProgress {
  applicationId: string
  totalSections: number
  completedSections: number
  completionPercentage: number
  currentPhase: 'SETUP' | 'DATA_COLLECTION' | 'REVIEW' | 'SUBMISSION' | 'COMPLETED'
  sectionProgress: Record<number, SectionProgress>
  teamProgress: Record<UserRole, RoleProgress>
}

export interface SectionProgress {
  sectionId: number
  assignedTo: UserRole
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'UNDER_REVIEW' | 'APPROVED'
  completedBy?: string
  completedDate?: Date
  reviewedBy?: string
  reviewedDate?: Date
  comments: Comment[]
  validationStatus: 'PASS' | 'FAIL' | 'PENDING'
  requiredDocuments: string[]
  uploadedDocuments: string[]
}

export interface RoleProgress {
  role: UserRole
  assignedSections: number[]
  completedSections: number[]
  pendingSections: number[]
  overdueSections: number[]
  totalProgress: number // percentage
}

export interface Comment {
  id: string
  authorId: string
  authorName: string
  authorRole: UserRole
  content: string
  timestamp: Date
  isInternal: boolean
  attachments?: string[]
}

export interface Notification {
  id: string
  recipientId: string
  recipientRole: UserRole
  type: 'ASSIGNMENT' | 'REMINDER' | 'COMPLETION' | 'REVIEW_REQUEST' | 'APPROVAL'
  title: string
  message: string
  sectionId?: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  isRead: boolean
  createdDate: Date
  dueDate?: Date
  actionUrl?: string
}

export interface ValidationCheck {
  id: string
  category: 'CAPITAL_THRESHOLD' | 'GOVERNANCE' | 'DOCUMENTATION' | 'DISCLOSURE'
  description: string
  requirement: string
  status: 'PASS' | 'FAIL' | 'WARNING'
  message: string
  relatedSections: number[]
}

// Default section assignments based on CMA requirements
export const DEFAULT_SECTION_ASSIGNMENTS: SectionAssignment[] = [
  {
    sectionId: 1,
    sectionTitle: 'Company Identity & Legal Form',
    assignedRole: 'CEO',
    description: 'Provides company overview and IPO purpose',
    priority: 'HIGH',
    estimatedTime: '20 minutes'
  },
  {
    sectionId: 2,
    sectionTitle: 'Capitalization & Financial Strength',
    assignedRole: 'CFO',
    description: 'Enters authorized capital and financial strength',
    priority: 'HIGH',
    estimatedTime: '30 minutes'
  },
  {
    sectionId: 3,
    sectionTitle: 'Share Ownership & Distribution',
    assignedRole: 'CFO',
    description: 'Defines shareholder distribution and transferability',
    priority: 'HIGH',
    estimatedTime: '25 minutes'
  },
  {
    sectionId: 4,
    sectionTitle: 'Governance & Management',
    assignedRole: 'COMPANY_SECRETARY',
    description: 'Adds directors, bios, and confirms governance compliance',
    priority: 'HIGH',
    estimatedTime: '45 minutes'
  },
  {
    sectionId: 5,
    sectionTitle: 'Legal & Regulatory Compliance',
    assignedRole: 'LEGAL_ADVISOR',
    description: 'Uploads licenses, tax clearance, and legal disclosures',
    priority: 'HIGH',
    estimatedTime: '35 minutes'
  },
  {
    sectionId: 6,
    sectionTitle: 'Offer Details (IPO Information)',
    assignedRole: 'CFO',
    description: 'Explains how raised funds will be used',
    priority: 'MEDIUM',
    estimatedTime: '40 minutes'
  },
  {
    sectionId: 7,
    sectionTitle: 'Prospectus & Disclosure Checklist',
    assignedRole: 'CEO',
    description: 'Ensures all material information and disclaimers are present',
    priority: 'MEDIUM',
    estimatedTime: '50 minutes'
  },
  {
    sectionId: 8,
    sectionTitle: 'Publication & Advertisement',
    assignedRole: 'COMPANY_SECRETARY',
    description: 'Manages publication requirements and advertising compliance',
    priority: 'MEDIUM',
    estimatedTime: '25 minutes'
  },
  {
    sectionId: 9,
    sectionTitle: 'Post-Approval Undertakings',
    assignedRole: 'LEGAL_ADVISOR',
    description: 'Confirms ongoing compliance commitments',
    priority: 'LOW',
    estimatedTime: '30 minutes'
  },
  {
    sectionId: 10,
    sectionTitle: 'Declarations & Contacts',
    assignedRole: 'CEO',
    description: 'Signs the declaration confirming truth and completeness',
    priority: 'HIGH',
    estimatedTime: '15 minutes'
  }
]

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  CEO: 'Chief Executive Officer - Overall responsibility and final declarations',
  CFO: 'Chief Financial Officer - Financial data, capitalization, and use of proceeds',
  COMPANY_SECRETARY: 'Company Secretary - Governance, compliance, and administrative matters',
  LEGAL_ADVISOR: 'Legal Advisor - Legal compliance, regulatory matters, and documentation'
}