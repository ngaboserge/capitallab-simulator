import { Document } from '../types'

// Document validation result
export interface DocumentValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  metadata?: Record<string, any>
}

// Allowed file types and their MIME types
export const ALLOWED_FILE_TYPES = {
  'pdf': ['application/pdf'],
  'doc': ['application/msword'],
  'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  'xls': ['application/vnd.ms-excel'],
  'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  'jpg': ['image/jpeg'],
  'jpeg': ['image/jpeg'],
  'png': ['image/png']
}

// Maximum file sizes by category (in bytes)
export const MAX_FILE_SIZES = {
  document: 50 * 1024 * 1024, // 50MB for documents
  image: 10 * 1024 * 1024,    // 10MB for images
  spreadsheet: 25 * 1024 * 1024 // 25MB for spreadsheets
}

// Required documents by section
export const REQUIRED_DOCUMENTS = {
  1: [ // Company Identity
    'certificateOfIncorporation',
    'memorandumAndArticles'
  ],
  2: [ // Capitalization
    'auditedFinancialStatements',
    'auditorsOpinion'
  ],
  3: [ // Share Ownership
    'shareRegister',
    'ownershipStructure'
  ],
  4: [ // Governance
    'fitAndProperDeclarations'
  ],
  5: [ // Legal Compliance
    'businessLicenses',
    'taxClearance',
    'complianceStatement',
    'materialContracts'
  ],
  6: [ // Offer Details
    'underwritingAgreement',
    'advisorMandateLetter',
    'bankRegistrarAgreements'
  ],
  7: [ // Prospectus
    'fullProspectus',
    'abridgedProspectus',
    'expertConsents',
    'riskFactorsSummary',
    'projectTimeline',
    'capitalStructureTable',
    'feeDisclosure'
  ],
  8: [ // Publication
    'newspaperProspectus',
    'electronicSubscriptionForm'
  ],
  9: [ // Post-Approval
    'lockUpUndertaking',
    'publicationConfirmation'
  ]
}

export class DocumentValidator {
  
  // Validate document format and properties
  public validateDocument(document: Document): DocumentValidationResult {
    const result: DocumentValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    }
    
    // Validate file extension
    const extension = this.getFileExtension(document.filename)
    if (!this.isAllowedFileType(extension)) {
      result.isValid = false
      result.errors.push(`File type '${extension}' is not allowed. Allowed types: ${Object.keys(ALLOWED_FILE_TYPES).join(', ')}`)
    }
    
    // Validate MIME type
    if (!this.isValidMimeType(document.mimeType, extension)) {
      result.isValid = false
      result.errors.push(`MIME type '${document.mimeType}' does not match file extension '${extension}'`)
    }
    
    // Validate file size
    const sizeValidation = this.validateFileSize(document.size, extension)
    if (!sizeValidation.isValid) {
      result.isValid = false
      result.errors.push(sizeValidation.error!)
    }
    
    // Validate filename
    if (!this.isValidFilename(document.originalName)) {
      result.isValid = false
      result.errors.push('Filename contains invalid characters or is too long')
    }
    
    // Check for potential security issues
    const securityCheck = this.performSecurityCheck(document)
    if (!securityCheck.isValid) {
      result.isValid = false
      result.errors.push(...securityCheck.errors)
    }
    result.warnings.push(...securityCheck.warnings)
    
    return result
  }
  
  // Validate document completeness for a section
  public validateSectionDocuments(sectionId: number, documents: Document[]): DocumentValidationResult {
    const result: DocumentValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    }
    
    const requiredDocs = REQUIRED_DOCUMENTS[sectionId as keyof typeof REQUIRED_DOCUMENTS] || []
    const providedCategories = documents.map(doc => doc.category)
    
    // Check for missing required documents
    for (const requiredDoc of requiredDocs) {
      if (!providedCategories.includes(requiredDoc)) {
        result.isValid = false
        result.errors.push(`Required document missing: ${this.formatDocumentName(requiredDoc)}`)
      }
    }
    
    // Validate each provided document
    for (const document of documents) {
      const docValidation = this.validateDocument(document)
      if (!docValidation.isValid) {
        result.isValid = false
        result.errors.push(`Document '${document.originalName}': ${docValidation.errors.join(', ')}`)
      }
      result.warnings.push(...docValidation.warnings.map(w => `Document '${document.originalName}': ${w}`))
    }
    
    return result
  }
  
  // Check if file type is allowed
  private isAllowedFileType(extension: string): boolean {
    return extension.toLowerCase() in ALLOWED_FILE_TYPES
  }
  
  // Validate MIME type matches extension
  private isValidMimeType(mimeType: string, extension: string): boolean {
    const allowedMimeTypes = ALLOWED_FILE_TYPES[extension.toLowerCase() as keyof typeof ALLOWED_FILE_TYPES]
    return allowedMimeTypes ? allowedMimeTypes.includes(mimeType) : false
  }
  
  // Validate file size
  private validateFileSize(size: number, extension: string): { isValid: boolean; error?: string } {
    let maxSize: number
    
    // Determine max size based on file type
    if (['jpg', 'jpeg', 'png'].includes(extension.toLowerCase())) {
      maxSize = MAX_FILE_SIZES.image
    } else if (['xls', 'xlsx'].includes(extension.toLowerCase())) {
      maxSize = MAX_FILE_SIZES.spreadsheet
    } else {
      maxSize = MAX_FILE_SIZES.document
    }
    
    if (size > maxSize) {
      return {
        isValid: false,
        error: `File size (${this.formatFileSize(size)}) exceeds maximum allowed size (${this.formatFileSize(maxSize)})`
      }
    }
    
    return { isValid: true }
  }
  
  // Validate filename
  private isValidFilename(filename: string): boolean {
    // Check length
    if (filename.length > 255) return false
    
    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/
    if (invalidChars.test(filename)) return false
    
    // Check for reserved names (Windows)
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
    const nameWithoutExt = filename.split('.')[0].toUpperCase()
    if (reservedNames.includes(nameWithoutExt)) return false
    
    return true
  }
  
  // Perform basic security checks
  private performSecurityCheck(document: Document): { isValid: boolean; errors: string[]; warnings: string[] } {
    const result = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[]
    }
    
    // Check for suspicious file extensions
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.vbs', '.js']
    const filename = document.originalName.toLowerCase()
    
    for (const ext of suspiciousExtensions) {
      if (filename.includes(ext)) {
        result.isValid = false
        result.errors.push(`Potentially dangerous file extension detected: ${ext}`)
      }
    }
    
    // Check for double extensions
    const parts = filename.split('.')
    if (parts.length > 2) {
      result.warnings.push('File has multiple extensions, please verify this is intentional')
    }
    
    // Check for very long filenames (potential buffer overflow)
    if (document.originalName.length > 200) {
      result.warnings.push('Filename is unusually long')
    }
    
    return result
  }
  
  // Utility methods
  private getFileExtension(filename: string): string {
    const parts = filename.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
  }
  
  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }
  
  private formatDocumentName(category: string): string {
    return category
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }
  
  // Get required documents for section
  public getRequiredDocuments(sectionId: number): string[] {
    return REQUIRED_DOCUMENTS[sectionId as keyof typeof REQUIRED_DOCUMENTS] || []
  }
  
  // Check if document category is required for section
  public isDocumentRequired(sectionId: number, category: string): boolean {
    const required = this.getRequiredDocuments(sectionId)
    return required.includes(category)
  }
}