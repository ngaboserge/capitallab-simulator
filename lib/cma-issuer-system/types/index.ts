// Core data models and interfaces for CMA Issuer Application System

export interface Address {
  street: string
  city: string
  province: string
  postalCode: string
  country: string
}

export interface ContactInfo {
  email: string
  phone: string
  fax?: string
  website?: string
}

export interface Document {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  uploadDate: Date
  uploadedBy: string
  category: string
  description?: string
  url: string
  checksum: string
  version: number
}

export interface DigitalSignature {
  signerId: string
  signerName: string
  signerPosition: string
  signatureData: string
  timestamp: Date
  ipAddress: string
  certificateId?: string
}

export interface Director {
  id: string
  name: string
  nationality: string
  position: string
  qualifications: string
  experience: string
  isIndependent: boolean
  appointmentDate: Date
  shareholding?: number
}

export interface SeniorManager {
  id: string
  name: string
  position: string
  qualifications: string
  experience: string
  appointmentDate: Date
}

export type ApplicationStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'QUERY_ISSUED'
  | 'QUERY_RESPONDED'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN'

export type OfferType = 'EQUITY' | 'DEBT' | 'HYBRID'

export type CompanyType = 'PUBLIC_LIMITED'

export type ValidationStatus = 'PASS' | 'FAIL' | 'WARNING'

export type ValidationSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type RiskRating = 'LOW' | 'MEDIUM' | 'HIGH'

export type ReviewStatus = 
  | 'PENDING'
  | 'IN_REVIEW'
  | 'QUERY_ISSUED'
  | 'APPROVED'
  | 'REJECTED'
// Main IssuerApplication interface with all 10 sections
export interface IssuerApplication {
  id: string
  companyId: string
  status: ApplicationStatus
  submissionDate: Date
  lastModified: Date
  currentSection: number
  completionPercentage: number
  
  // Section 1: Company Identity & Legal Form
  companyIdentity: {
    legalName: string
    tradingName?: string
    companyType: CompanyType
    incorporationDate: Date
    registrationNumber: string
    registeredAddress: Address
    contactInfo: ContactInfo
    documents: {
      certificateOfIncorporation: Document
      memorandumAndArticles: Document
    }
  }
  
  // Section 2: Capitalization & Financial Strength
  capitalization: {
    authorizedShareCapital: number
    paidUpShareCapital: number
    netAssetsBeforeOffer: number
    auditPeriodEnd: Date
    goingConcernConfirmation: boolean
    documents: {
      auditedFinancialStatements: Document
      auditorsOpinion: Document
    }
  }
  
  // Section 3: Share Ownership & Distribution
  shareOwnership: {
    totalIssuedShares: number
    sharesToPublic: number
    publicShareholdingPercentage: number
    expectedShareholders: number
    freeTransferability: boolean
    documents: {
      shareRegister: Document
      ownershipStructure: Document
    }
  }
  
  // Section 4: Governance & Management
  governance: {
    directors: Director[]
    seniorManagement: SeniorManager[]
    independentDirectorAppointed: boolean
    fitAndProperConfirmation: boolean
    documents: {
      fitAndProperDeclarations: Document[]
    }
  }
  
  // Section 5: Legal & Regulatory Compliance
  legalCompliance: {
    ongoingLitigation?: string
    materialLitigationConfirmation: boolean
    documents: {
      businessLicenses: Document[]
      taxClearance: Document
      complianceStatement: Document
      materialContracts: Document
    }
  }
  
  // Section 6: Offer Details (IPO Information)
  offerDetails: {
    offerType: OfferType
    totalAmountToRaise: number
    numberOfSecurities: number
    pricePerSecurity: number
    useOfProceeds: string
    offerTimetable: string
    documents: {
      underwritingAgreement: Document
      advisorMandateLetter: Document
      bankRegistrarAgreements: Document
    }
  }
  
  // Section 7: Prospectus & Disclosure Checklist
  prospectus: {
    materialInformationDisclosed: boolean
    forecastAssumptionsReasonable: boolean
    documents: {
      fullProspectus: Document
      abridgedProspectus: Document
      expertConsents: Document[]
      riskFactorsSummary: Document
      projectTimeline: Document
      capitalStructureTable: Document
      feeDisclosure: Document
    }
  }
  
  // Section 8: Publication & Advertisement
  publication: {
    cmaSubmissionDate: Date
    documents: {
      newspaperProspectus: Document
      electronicSubscriptionForm: Document
    }
  }
  
  // Section 9: Post-Approval Undertakings
  postApproval: {
    documents: {
      lockUpUndertaking: Document
      publicationConfirmation: Document
      cmaApprovalLetter?: Document
    }
  }
  
  // Section 10: Declarations & Contacts
  declarations: {
    authorizedOfficer: {
      name: string
      position: string
      contactInfo: ContactInfo
      signature: DigitalSignature
      declarationText: string
    }
    investmentAdviser: {
      signature: DigitalSignature
      confirmationText: string
    }
  }
  
  // System fields
  validationResults: ValidationResult[]
  cmaComments: CMAComment[]
  auditTrail: AuditEntry[]
}

// ValidationResult interface for compliance tracking
export interface ValidationResult {
  id: string
  applicationId: string
  sectionId: number
  fieldId: string
  ruleId: string
  status: ValidationStatus
  message: string
  severity: ValidationSeverity
  timestamp: Date
  validatedBy?: string
}

// CMAReview interface for regulatory workflow
export interface CMAReview {
  id: string
  applicationId: string
  reviewerId: string
  reviewerName: string
  status: ReviewStatus
  complianceScore: number
  riskRating: RiskRating
  comments: CMAComment[]
  decision?: CMADecision
  queryLetters: QueryLetter[]
  approvalLetter?: ApprovalLetter
  assignedDate: Date
  reviewStartDate?: Date
  reviewCompletedDate?: Date
}

// CMAComment interface for internal notes
export interface CMAComment {
  id: string
  reviewId: string
  commenterId: string
  commenterName: string
  sectionId?: number
  fieldId?: string
  comment: string
  isInternal: boolean
  timestamp: Date
  parentCommentId?: string
}

// CMADecision interface for final decisions
export interface CMADecision {
  id: string
  reviewId: string
  decisionType: 'APPROVED' | 'REJECTED' | 'QUERY_ISSUED'
  decisionDate: Date
  decisionBy: string
  decisionReason: string
  conditions?: string[]
  validUntil?: Date
}

// QueryLetter interface for CMA queries
export interface QueryLetter {
  id: string
  reviewId: string
  letterNumber: string
  issueDate: Date
  dueDate: Date
  queries: Query[]
  status: 'ISSUED' | 'RESPONDED' | 'OVERDUE'
  issuedBy: string
  respondedDate?: Date
}

// Query interface for individual queries
export interface Query {
  id: string
  queryLetterId: string
  sectionId: number
  fieldId?: string
  queryText: string
  responseText?: string
  isResolved: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

// ApprovalLetter interface for formal approvals
export interface ApprovalLetter {
  id: string
  reviewId: string
  letterNumber: string
  issueDate: Date
  approvedBy: string
  conditions: string[]
  validityPeriod: number
  document: Document
}

// AuditEntry interface for system logging
export interface AuditEntry {
  id: string
  entityType: 'APPLICATION' | 'DOCUMENT' | 'REVIEW' | 'USER' | 'SYSTEM'
  entityId: string
  action: string
  description: string
  userId?: string
  userName?: string
  timestamp: Date
  ipAddress?: string
  userAgent?: string
  oldValue?: any
  newValue?: any
  metadata?: Record<string, any>
}

// Company interface for issuer companies
export interface Company {
  id: string
  legalName: string
  tradingName?: string
  registrationNumber: string
  incorporationDate: Date
  companyType: CompanyType
  registeredAddress: Address
  contactInfo: ContactInfo
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdDate: Date
  lastModified: Date
}

// User interface for system users
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ISSUER' | 'CMA_OFFICER' | 'ADMIN'
  companyId?: string
  isActive: boolean
  lastLogin?: Date
  createdDate: Date
  permissions: string[]
}

// Notification interface for system notifications
export interface Notification {
  id: string
  userId: string
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
  title: string
  message: string
  isRead: boolean
  createdDate: Date
  expiryDate?: Date
  actionUrl?: string
  metadata?: Record<string, any>
}