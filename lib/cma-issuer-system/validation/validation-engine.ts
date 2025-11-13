import { 
  IssuerApplication, 
  ValidationResult, 
  ValidationStatus, 
  ValidationSeverity 
} from '../types'

// Validation rule interface
export interface ValidationRule {
  id: string
  code: string
  name: string
  sectionId: number
  fieldId?: string
  type: 'REQUIRED' | 'FORMAT' | 'RANGE' | 'CALCULATION' | 'BUSINESS_LOGIC'
  expression: string
  errorMessage: string
  severity: ValidationSeverity
  isActive: boolean
}

// Validation context for rule evaluation
export interface ValidationContext {
  application: IssuerApplication
  section: number
  field?: string
  value: any
  metadata?: Record<string, any>
}

// Core validation engine class
export class ValidationRuleEngine {
  private rules: ValidationRule[] = []
  
  constructor() {
    this.initializeDefaultRules()
  }
  
  // Initialize default CMA compliance rules
  private initializeDefaultRules(): void {
    this.rules = [
      // Section 1: Company Identity validation rules
      {
        id: 'REQ_COMPANY_NAME',
        code: 'REQ_COMPANY_NAME',
        name: 'Company Legal Name Required',
        sectionId: 1,
        fieldId: 'companyIdentity.legalName',
        type: 'REQUIRED',
        expression: 'value && value.trim().length > 0',
        errorMessage: 'Company legal name is required',
        severity: 'CRITICAL',
        isActive: true
      },
      {
        id: 'REQ_REGISTRATION_NUMBER',
        code: 'REQ_REGISTRATION_NUMBER',
        name: 'Registration Number Required',
        sectionId: 1,
        fieldId: 'companyIdentity.registrationNumber',
        type: 'REQUIRED',
        expression: 'value && value.trim().length > 0',
        errorMessage: 'Company registration number is required',
        severity: 'CRITICAL',
        isActive: true
      },
      {
        id: 'COMPANY_TYPE_PUBLIC_LIMITED',
        code: 'COMPANY_TYPE_PUBLIC_LIMITED',
        name: 'Company Type Must Be Public Limited',
        sectionId: 1,
        fieldId: 'companyIdentity.companyType',
        type: 'BUSINESS_LOGIC',
        expression: 'value === "PUBLIC_LIMITED"',
        errorMessage: 'Company must be a Public Limited Company to apply for public offering',
        severity: 'CRITICAL',
        isActive: true
      },
      
      // Section 2: Capitalization validation rules
      {
        id: 'MIN_AUTHORIZED_CAPITAL',
        code: 'MIN_AUTHORIZED_CAPITAL',
        name: 'Minimum Authorized Share Capital',
        sectionId: 2,
        fieldId: 'capitalization.authorizedShareCapital',
        type: 'RANGE',
        expression: 'value >= 500000000',
        errorMessage: 'Authorized share capital must be at least RWF 500,000,000',
        severity: 'CRITICAL',
        isActive: true
      },
      {
        id: 'MIN_NET_ASSETS',
        code: 'MIN_NET_ASSETS',
        name: 'Minimum Net Assets Before Offer',
        sectionId: 2,
        fieldId: 'capitalization.netAssetsBeforeOffer',
        type: 'RANGE',
        expression: 'value >= 1000000000',
        errorMessage: 'Net assets before offer must be at least RWF 1,000,000,000',
        severity: 'CRITICAL',
        isActive: true
      },
      {
        id: 'AUDIT_PERIOD_TIMING',
        code: 'AUDIT_PERIOD_TIMING',
        name: 'Audit Period Timing Requirements',
        sectionId: 2,
        fieldId: 'capitalization.auditPeriodEnd',
        type: 'BUSINESS_LOGIC',
        expression: 'this.validateAuditPeriodTiming(value)',
        errorMessage: 'Audit period must be within 4 months for unlisted companies or 6 months for listed companies',
        severity: 'HIGH',
        isActive: true
      },
      
      // Section 3: Share Ownership validation rules
      {
        id: 'MIN_PUBLIC_SHAREHOLDING',
        code: 'MIN_PUBLIC_SHAREHOLDING',
        name: 'Minimum Public Shareholding Percentage',
        sectionId: 3,
        fieldId: 'shareOwnership.publicShareholdingPercentage',
        type: 'RANGE',
        expression: 'value >= 25',
        errorMessage: 'Public shareholding must be at least 25% post-offer',
        severity: 'CRITICAL',
        isActive: true
      },
      {
        id: 'MIN_SHAREHOLDERS',
        code: 'MIN_SHAREHOLDERS',
        name: 'Minimum Number of Shareholders',
        sectionId: 3,
        fieldId: 'shareOwnership.expectedShareholders',
        type: 'RANGE',
        expression: 'value >= 1000',
        errorMessage: 'Must have at least 1,000 shareholders post-offer',
        severity: 'CRITICAL',
        isActive: true
      },
      {
        id: 'PUBLIC_SHAREHOLDING_CALCULATION',
        code: 'PUBLIC_SHAREHOLDING_CALCULATION',
        name: 'Public Shareholding Percentage Calculation',
        sectionId: 3,
        fieldId: 'shareOwnership.publicShareholdingPercentage',
        type: 'CALCULATION',
        expression: 'this.validatePublicShareholdingCalculation(context)',
        errorMessage: 'Public shareholding percentage calculation is incorrect',
        severity: 'HIGH',
        isActive: true
      },
      
      // Section 4: Governance validation rules
      {
        id: 'REQ_INDEPENDENT_DIRECTOR',
        code: 'REQ_INDEPENDENT_DIRECTOR',
        name: 'Independent Director Required',
        sectionId: 4,
        fieldId: 'governance.independentDirectorAppointed',
        type: 'REQUIRED',
        expression: 'value === true',
        errorMessage: 'At least one independent director must be appointed',
        severity: 'HIGH',
        isActive: true
      },
      {
        id: 'REQ_FIT_PROPER',
        code: 'REQ_FIT_PROPER',
        name: 'Fit and Proper Confirmation Required',
        sectionId: 4,
        fieldId: 'governance.fitAndProperConfirmation',
        type: 'REQUIRED',
        expression: 'value === true',
        errorMessage: 'Fit and proper declarations must be confirmed for all directors and officers',
        severity: 'HIGH',
        isActive: true
      },
      {
        id: 'MIN_DIRECTORS',
        code: 'MIN_DIRECTORS',
        name: 'Minimum Number of Directors',
        sectionId: 4,
        fieldId: 'governance.directors',
        type: 'BUSINESS_LOGIC',
        expression: 'Array.isArray(value) && value.length >= 3',
        errorMessage: 'Public limited company must have at least 3 directors',
        severity: 'HIGH',
        isActive: true
      }
    ]
  }
  
  // Validate entire application
  public async validateApplication(application: IssuerApplication): Promise<ValidationResult[]> {
    const results: ValidationResult[] = []
    
    for (const rule of this.rules.filter(r => r.isActive)) {
      const result = await this.validateRule(rule, application)
      if (result) {
        results.push(result)
      }
    }
    
    return results
  }
  
  // Validate specific section
  public async validateSection(application: IssuerApplication, sectionId: number): Promise<ValidationResult[]> {
    const sectionRules = this.rules.filter(r => r.isActive && r.sectionId === sectionId)
    const results: ValidationResult[] = []
    
    for (const rule of sectionRules) {
      const result = await this.validateRule(rule, application)
      if (result) {
        results.push(result)
      }
    }
    
    return results
  }
  
  // Validate specific field
  public async validateField(application: IssuerApplication, fieldId: string): Promise<ValidationResult[]> {
    const fieldRules = this.rules.filter(r => r.isActive && r.fieldId === fieldId)
    const results: ValidationResult[] = []
    
    for (const rule of fieldRules) {
      const result = await this.validateRule(rule, application)
      if (result) {
        results.push(result)
      }
    }
    
    return results
  }
  
  // Validate individual rule
  private async validateRule(rule: ValidationRule, application: IssuerApplication): Promise<ValidationResult | null> {
    try {
      const value = this.getFieldValue(application, rule.fieldId)
      const context: ValidationContext = {
        application,
        section: rule.sectionId,
        field: rule.fieldId,
        value,
        metadata: {}
      }
      
      const isValid = await this.evaluateRule(rule, context)
      
      return {
        id: this.generateId(),
        applicationId: application.id,
        sectionId: rule.sectionId,
        fieldId: rule.fieldId || '',
        ruleId: rule.code,
        status: isValid ? 'PASS' : 'FAIL',
        message: isValid ? `${rule.name} - Passed` : rule.errorMessage,
        severity: rule.severity,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        id: this.generateId(),
        applicationId: application.id,
        sectionId: rule.sectionId,
        fieldId: rule.fieldId || '',
        ruleId: rule.code,
        status: 'FAIL',
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'HIGH',
        timestamp: new Date()
      }
    }
  }
  
  // Evaluate rule expression
  private async evaluateRule(rule: ValidationRule, context: ValidationContext): Promise<boolean> {
    const { value } = context
    
    switch (rule.type) {
      case 'REQUIRED':
        return this.evaluateExpression(rule.expression, { value })
      
      case 'FORMAT':
        return this.evaluateFormatRule(rule.expression, value)
      
      case 'RANGE':
        return this.evaluateExpression(rule.expression, { value })
      
      case 'CALCULATION':
        return this.evaluateCalculationRule(rule.expression, context)
      
      case 'BUSINESS_LOGIC':
        return this.evaluateBusinessLogicRule(rule.expression, context)
      
      default:
        throw new Error(`Unknown rule type: ${rule.type}`)
    }
  }
  
  // Evaluate JavaScript expression safely
  private evaluateExpression(expression: string, variables: Record<string, any>): boolean {
    try {
      // Create a safe evaluation context
      const func = new Function(...Object.keys(variables), `return ${expression}`)
      return Boolean(func(...Object.values(variables)))
    } catch (error) {
      console.error('Expression evaluation error:', error)
      return false
    }
  }
  
  // Evaluate format validation rules
  private evaluateFormatRule(expression: string, value: any): boolean {
    if (!value) return false
    
    try {
      const regex = new RegExp(expression)
      return regex.test(String(value))
    } catch (error) {
      console.error('Format rule evaluation error:', error)
      return false
    }
  }
  
  // Evaluate calculation rules
  private evaluateCalculationRule(expression: string, context: ValidationContext): boolean {
    try {
      // Handle specific calculation rules
      if (expression.includes('validatePublicShareholdingCalculation')) {
        return this.validatePublicShareholdingCalculation(context)
      }
      
      return this.evaluateExpression(expression, { value: context.value, context })
    } catch (error) {
      console.error('Calculation rule evaluation error:', error)
      return false
    }
  }
  
  // Evaluate business logic rules
  private evaluateBusinessLogicRule(expression: string, context: ValidationContext): boolean {
    try {
      // Handle specific business logic rules
      if (expression.includes('validateAuditPeriodTiming')) {
        return this.validateAuditPeriodTiming(context.value)
      }
      
      return this.evaluateExpression(expression, { value: context.value, context })
    } catch (error) {
      console.error('Business logic rule evaluation error:', error)
      return false
    }
  }
  
  // Specific validation methods
  private validatePublicShareholdingCalculation(context: ValidationContext): boolean {
    const { application } = context
    const { shareOwnership } = application
    
    if (!shareOwnership.totalIssuedShares || !shareOwnership.sharesToPublic) {
      return false
    }
    
    const calculatedPercentage = (shareOwnership.sharesToPublic / shareOwnership.totalIssuedShares) * 100
    const declaredPercentage = shareOwnership.publicShareholdingPercentage
    
    // Allow for small rounding differences (0.01%)
    return Math.abs(calculatedPercentage - declaredPercentage) <= 0.01
  }
  
  private validateAuditPeriodTiming(auditPeriodEnd: Date): boolean {
    if (!auditPeriodEnd) return false
    
    const now = new Date()
    const monthsDiff = this.getMonthsDifference(auditPeriodEnd, now)
    
    // For this simulation, assume unlisted companies (4 months requirement)
    // In real implementation, this would check company listing status
    return monthsDiff <= 4
  }
  
  // Utility methods
  private getFieldValue(application: IssuerApplication, fieldPath?: string): any {
    if (!fieldPath) return null
    
    const parts = fieldPath.split('.')
    let value: any = application
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part]
      } else {
        return null
      }
    }
    
    return value
  }
  
  private getMonthsDifference(date1: Date, date2: Date): number {
    const yearDiff = date2.getFullYear() - date1.getFullYear()
    const monthDiff = date2.getMonth() - date1.getMonth()
    return yearDiff * 12 + monthDiff
  }
  
  private generateId(): string {
    return `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  // Add custom validation rule
  public addRule(rule: ValidationRule): void {
    this.rules.push(rule)
  }
  
  // Remove validation rule
  public removeRule(ruleId: string): void {
    this.rules = this.rules.filter(r => r.id !== ruleId)
  }
  
  // Get all active rules
  public getRules(): ValidationRule[] {
    return this.rules.filter(r => r.isActive)
  }
  
  // Get rules for specific section
  public getSectionRules(sectionId: number): ValidationRule[] {
    return this.rules.filter(r => r.isActive && r.sectionId === sectionId)
  }
}