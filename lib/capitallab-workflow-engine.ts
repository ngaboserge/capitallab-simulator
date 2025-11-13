// CapitalLab Dynamic Workflow Engine
// Orchestrates the complete capital raise journey with real-time role interactions

export type WorkflowStage = 
  | 'capital_raise_intent'
  | 'ib_assignment'
  | 'due_diligence'
  | 'prospectus_building'
  | 'regulatory_review'
  | 'listing_approval'
  | 'isin_assignment'
  | 'investor_onboarding'
  | 'trading_active'
  | 'settlement'
  | 'completed'

export type WorkflowAction = 
  | 'submit_intent'
  | 'assign_ib'
  | 'request_due_diligence'
  | 'submit_documents'
  | 'build_prospectus'
  | 'submit_for_review'
  | 'approve_filing'
  | 'reject_filing'
  | 'approve_listing'
  | 'create_isin'
  | 'activate_investor'
  | 'execute_trade'
  | 'settle_trade'

export interface WorkflowParticipant {
  userId: string
  role: string
  name: string
  institution?: string
  isActive: boolean
}

export interface WorkflowDocument {
  id: string
  type: 'capital_raise_intent' | 'due_diligence_response' | 'prospectus' | 'regulatory_filing' | 'isin_certificate' | 'contract_note'
  title: string
  content: any
  uploadedBy: string
  uploadedAt: Date
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  watermark: string
}

export interface WorkflowNotification {
  id: string
  workflowId: string
  recipientRole: string
  recipientUserId?: string
  type: 'action_required' | 'status_update' | 'document_ready' | 'approval_needed'
  title: string
  message: string
  actionUrl?: string
  createdAt: Date
  isRead: boolean
}

export interface CapitalRaiseWorkflow {
  id: string
  issuerCompany: string
  instrumentType: 'equity' | 'bond' | 'note'
  targetAmount: number
  currency: 'RWF' | 'USD'
  currentStage: WorkflowStage
  status: 'active' | 'completed' | 'rejected' | 'suspended'
  
  // Participants
  participants: {
    issuer: WorkflowParticipant
    ibAdvisor?: WorkflowParticipant
    regulator?: WorkflowParticipant
    listingDesk?: WorkflowParticipant
    csdOperator?: WorkflowParticipant
    brokers: WorkflowParticipant[]
    investors: WorkflowParticipant[]
  }
  
  // Workflow Data
  documents: WorkflowDocument[]
  notifications: WorkflowNotification[]
  stageHistory: {
    stage: WorkflowStage
    enteredAt: Date
    completedAt?: Date
    completedBy?: string
    notes?: string
  }[]
  
  // Generated Assets
  virtualISIN?: string
  listingDate?: Date
  tradingActive: boolean
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

export class CapitalLabWorkflowEngine {
  private workflows: Map<string, CapitalRaiseWorkflow> = new Map()
  private notifications: WorkflowNotification[] = []
  
  // Workflow Management
  createWorkflow(issuerData: {
    userId: string
    companyName: string
    instrumentType: 'equity' | 'bond' | 'note'
    targetAmount: number
    currency: 'RWF' | 'USD'
  }): CapitalRaiseWorkflow {
    const workflowId = `CRW-${Date.now()}`
    
    const workflow: CapitalRaiseWorkflow = {
      id: workflowId,
      issuerCompany: issuerData.companyName,
      instrumentType: issuerData.instrumentType,
      targetAmount: issuerData.targetAmount,
      currency: issuerData.currency,
      currentStage: 'capital_raise_intent',
      status: 'active',
      
      participants: {
        issuer: {
          userId: issuerData.userId,
          role: 'issuer',
          name: issuerData.companyName,
          isActive: true
        },
        brokers: [],
        investors: []
      },
      
      documents: [],
      notifications: [],
      stageHistory: [{
        stage: 'capital_raise_intent',
        enteredAt: new Date()
      }],
      
      tradingActive: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    this.workflows.set(workflowId, workflow)
    
    // Notify system that new workflow is created
    this.createNotification(workflowId, 'admin', 'status_update', 
      'New Capital Raise Intent', 
      `${issuerData.companyName} has submitted a capital raise intent for ${issuerData.currency} ${issuerData.targetAmount.toLocaleString()}`
    )
    
    return workflow
  }
  
  // Stage Transitions
  advanceStage(workflowId: string, newStage: WorkflowStage, actorUserId: string, notes?: string): boolean {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) return false
    
    // Validate stage transition
    if (!this.isValidStageTransition(workflow.currentStage, newStage)) {
      throw new Error(`Invalid stage transition from ${workflow.currentStage} to ${newStage}`)
    }
    
    // Complete current stage
    const currentStageHistory = workflow.stageHistory.find(s => s.stage === workflow.currentStage && !s.completedAt)
    if (currentStageHistory) {
      currentStageHistory.completedAt = new Date()
      currentStageHistory.completedBy = actorUserId
      currentStageHistory.notes = notes
    }
    
    // Enter new stage
    workflow.currentStage = newStage
    workflow.stageHistory.push({
      stage: newStage,
      enteredAt: new Date()
    })
    workflow.updatedAt = new Date()
    
    // Trigger stage-specific actions
    this.handleStageEntry(workflow, newStage, actorUserId)
    
    return true
  }
  
  private isValidStageTransition(currentStage: WorkflowStage, newStage: WorkflowStage): boolean {
    const validTransitions: Record<WorkflowStage, WorkflowStage[]> = {
      'capital_raise_intent': ['ib_assignment'],
      'ib_assignment': ['due_diligence'],
      'due_diligence': ['prospectus_building'],
      'prospectus_building': ['regulatory_review'],
      'regulatory_review': ['listing_approval', 'due_diligence'], // Can go back for corrections
      'listing_approval': ['isin_assignment'],
      'isin_assignment': ['investor_onboarding'],
      'investor_onboarding': ['trading_active'],
      'trading_active': ['settlement'],
      'settlement': ['completed'],
      'completed': []
    }
    
    return validTransitions[currentStage]?.includes(newStage) || false
  }
  
  private handleStageEntry(workflow: CapitalRaiseWorkflow, stage: WorkflowStage, actorUserId: string) {
    switch (stage) {
      case 'ib_assignment':
        this.handleIBAssignment(workflow)
        break
      case 'due_diligence':
        this.handleDueDiligenceStart(workflow)
        break
      case 'regulatory_review':
        this.handleRegulatoryReview(workflow)
        break
      case 'listing_approval':
        this.handleListingApproval(workflow)
        break
      case 'isin_assignment':
        this.handleISINAssignment(workflow)
        break
      case 'investor_onboarding':
        this.handleInvestorOnboarding(workflow)
        break
      case 'trading_active':
        this.handleTradingActivation(workflow)
        break
    }
  }
  
  // Stage-Specific Handlers
  private handleIBAssignment(workflow: CapitalRaiseWorkflow) {
    // In real implementation, this would match with available IB Advisors
    // For now, we'll create a notification for IB Advisors to claim
    this.createNotification(workflow.id, 'ib_advisor', 'action_required',
      'New Client Assignment Available',
      `${workflow.issuerCompany} requires IB advisory services for ${workflow.instrumentType} issuance`,
      `/capitallab/ib-advisor?workflow=${workflow.id}`
    )
  }
  
  private handleDueDiligenceStart(workflow: CapitalRaiseWorkflow) {
    if (!workflow.participants.ibAdvisor) return
    
    this.createNotification(workflow.id, 'ib_advisor', 'action_required',
      'Begin Due Diligence Process',
      `Start due diligence for ${workflow.issuerCompany}`,
      `/capitallab/ib-advisor?workflow=${workflow.id}&action=due_diligence`
    )
    
    this.createNotification(workflow.id, 'issuer', 'status_update',
      'Due Diligence Process Started',
      `Your IB Advisor will be requesting documentation. Please prepare your financial statements and corporate documents.`,
      `/capitallab/issuer?workflow=${workflow.id}`
    )
  }
  
  private handleRegulatoryReview(workflow: CapitalRaiseWorkflow) {
    this.createNotification(workflow.id, 'regulator', 'action_required',
      'New Regulatory Filing for Review',
      `${workflow.issuerCompany} prospectus submitted for CMA review`,
      `/capitallab/regulator?workflow=${workflow.id}`
    )
  }
  
  private handleListingApproval(workflow: CapitalRaiseWorkflow) {
    this.createNotification(workflow.id, 'listing_desk', 'action_required',
      'Listing Application Ready',
      `${workflow.issuerCompany} approved by CMA, ready for SHORA Exchange listing review`,
      `/capitallab/listing-desk?workflow=${workflow.id}`
    )
  }
  
  private handleISINAssignment(workflow: CapitalRaiseWorkflow) {
    // Generate virtual ISIN
    const isin = this.generateVirtualISIN(workflow)
    workflow.virtualISIN = isin
    
    this.createNotification(workflow.id, 'csd_operator', 'action_required',
      'New Instrument for Registry',
      `Create CSD registry entry for ${workflow.issuerCompany} (${isin})`,
      `/capitallab/csd?workflow=${workflow.id}`
    )
    
    // Notify all participants
    this.createNotification(workflow.id, 'issuer', 'status_update',
      'Virtual ISIN Assigned',
      `Your instrument has been assigned ISIN: ${isin}`,
      `/capitallab/issuer?workflow=${workflow.id}`
    )
  }
  
  private handleInvestorOnboarding(workflow: CapitalRaiseWorkflow) {
    // Notify brokers that new instrument is available
    this.createNotification(workflow.id, 'broker', 'status_update',
      'New Instrument Available',
      `${workflow.issuerCompany} (${workflow.virtualISIN}) is now available for investor onboarding`,
      `/capitallab/broker?workflow=${workflow.id}`
    )
  }
  
  private handleTradingActivation(workflow: CapitalRaiseWorkflow) {
    workflow.tradingActive = true
    workflow.listingDate = new Date()
    
    // Notify all participants
    const roles = ['issuer', 'ib_advisor', 'broker', 'investor']
    roles.forEach(role => {
      this.createNotification(workflow.id, role, 'status_update',
        'Trading Now Active',
        `${workflow.issuerCompany} (${workflow.virtualISIN}) is now actively trading`,
        `/capitallab/${role}?workflow=${workflow.id}`
      )
    })
  }
  
  // Participant Management
  assignParticipant(workflowId: string, role: string, participant: WorkflowParticipant): boolean {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) return false
    
    switch (role) {
      case 'ib_advisor':
        workflow.participants.ibAdvisor = participant
        this.createNotification(workflowId, 'issuer', 'status_update',
          'IB Advisor Assigned',
          `${participant.name} has been assigned as your Investment Banking Advisor`
        )
        break
      case 'regulator':
        workflow.participants.regulator = participant
        break
      case 'listing_desk':
        workflow.participants.listingDesk = participant
        break
      case 'csd_operator':
        workflow.participants.csdOperator = participant
        break
      case 'broker':
        workflow.participants.brokers.push(participant)
        break
      case 'investor':
        workflow.participants.investors.push(participant)
        break
    }
    
    workflow.updatedAt = new Date()
    return true
  }
  
  // Document Management
  addDocument(workflowId: string, document: Omit<WorkflowDocument, 'id' | 'uploadedAt' | 'watermark'>): WorkflowDocument {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) throw new Error('Workflow not found')
    
    const doc: WorkflowDocument = {
      ...document,
      id: `DOC-${Date.now()}`,
      uploadedAt: new Date(),
      watermark: 'EDUCATION SIMULATION – NO REAL MONEY / NO REGULATORY EFFECT'
    }
    
    workflow.documents.push(doc)
    workflow.updatedAt = new Date()
    
    // Notify relevant parties
    this.createNotification(workflowId, 'all', 'document_ready',
      'New Document Available',
      `${document.title} has been uploaded to the workflow`
    )
    
    return doc
  }
  
  // Notification System
  private createNotification(
    workflowId: string, 
    recipientRole: string, 
    type: WorkflowNotification['type'],
    title: string, 
    message: string, 
    actionUrl?: string,
    recipientUserId?: string
  ) {
    const notification: WorkflowNotification = {
      id: `NOT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      recipientRole,
      recipientUserId,
      type,
      title,
      message,
      actionUrl,
      createdAt: new Date(),
      isRead: false
    }
    
    this.notifications.push(notification)
  }
  
  // Utility Functions
  private generateVirtualISIN(workflow: CapitalRaiseWorkflow): string {
    const year = new Date().getFullYear()
    const sequence = String(Date.now()).slice(-4)
    const type = workflow.instrumentType === 'equity' ? 'EQ' : workflow.instrumentType === 'bond' ? 'BD' : 'NT'
    return `RW${year}${type}${sequence}`
  }
  
  // Query Functions
  getWorkflow(workflowId: string): CapitalRaiseWorkflow | undefined {
    return this.workflows.get(workflowId)
  }
  
  getWorkflowsByParticipant(userId: string, role: string): CapitalRaiseWorkflow[] {
    return Array.from(this.workflows.values()).filter(workflow => {
      switch (role) {
        case 'issuer':
          return workflow.participants.issuer.userId === userId
        case 'ib_advisor':
          return workflow.participants.ibAdvisor?.userId === userId
        case 'regulator':
          return workflow.participants.regulator?.userId === userId
        case 'listing_desk':
          return workflow.participants.listingDesk?.userId === userId
        case 'csd_operator':
          return workflow.participants.csdOperator?.userId === userId
        case 'broker':
          return workflow.participants.brokers.some(b => b.userId === userId)
        case 'investor':
          return workflow.participants.investors.some(i => i.userId === userId)
        default:
          return false
      }
    })
  }
  
  getNotificationsForUser(userId: string, role: string): WorkflowNotification[] {
    return this.notifications.filter(notification => 
      (notification.recipientRole === role || notification.recipientRole === 'all') &&
      (!notification.recipientUserId || notification.recipientUserId === userId)
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }
  
  markNotificationAsRead(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.isRead = true
      return true
    }
    return false
  }
  
  // Workflow Actions
  executeAction(workflowId: string, action: WorkflowAction, actorUserId: string, data?: any): boolean {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) return false
    
    switch (action) {
      case 'assign_ib':
        return this.assignParticipant(workflowId, 'ib_advisor', data.participant) &&
               this.advanceStage(workflowId, 'due_diligence', actorUserId)
      
      case 'submit_for_review':
        return this.advanceStage(workflowId, 'regulatory_review', actorUserId, 'Prospectus submitted for CMA review')
      
      case 'approve_filing':
        return this.advanceStage(workflowId, 'listing_approval', actorUserId, 'CMA approval granted')
      
      case 'reject_filing':
        return this.advanceStage(workflowId, 'due_diligence', actorUserId, 'CMA rejection - corrections required')
      
      case 'approve_listing':
        return this.advanceStage(workflowId, 'isin_assignment', actorUserId, 'SHORA Exchange listing approved')
      
      case 'create_isin':
        return this.advanceStage(workflowId, 'investor_onboarding', actorUserId, 'Virtual ISIN created and registered')
      
      case 'activate_investor':
        // This doesn't advance the main workflow but enables trading for specific investors
        return this.assignParticipant(workflowId, 'investor', data.participant)
      
      case 'execute_trade':
        if (!workflow.tradingActive) {
          workflow.tradingActive = true
          this.advanceStage(workflowId, 'trading_active', actorUserId, 'First trade executed')
        }
        return true
      
      default:
        return false
    }
  }
}

// Global workflow engine instance
export const workflowEngine = new CapitalLabWorkflowEngine()