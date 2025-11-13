// Team Management System for Collaborative CapitalLab
// Building Rwanda's Wall Street through University Collaboration

export interface TeamMember {
  id: string
  userId: string
  name: string
  email: string
  university: string
  role: InstitutionalRole
  permissions: RolePermissions
  joinedAt: Date
  performance: IndividualMetrics
  isActive: boolean
}

export interface Team {
  id: string
  name: string
  university: string
  description: string
  members: TeamMember[]
  maxMembers: number
  currentDeal: Deal | null
  progress: WorkflowProgress
  performance: TeamMetrics
  createdAt: Date
  status: 'forming' | 'active' | 'completed' | 'paused'
  inviteCode: string
}

export interface Deal {
  id: string
  teamId: string
  companyName: string
  sector: string
  capitalTarget: number
  description: string
  currentStep: number
  totalSteps: number
  startedAt: Date
  estimatedCompletion: Date
  documents: DealDocument[]
  approvals: ApprovalStatus[]
}

export interface WorkflowProgress {
  currentStep: number
  totalSteps: number
  completedSteps: StepCompletion[]
  blockedSteps: string[]
  nextActions: NextAction[]
  estimatedCompletion: Date
}

export interface StepCompletion {
  stepId: number
  stepName: string
  completedBy: string
  completedAt: Date
  approvedBy?: string
  approvedAt?: Date
  documents: string[]
  notes: string
}

export interface NextAction {
  stepId: number
  assignedRole: InstitutionalRole
  assignedTo: string
  description: string
  dueDate: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dependencies: string[]
}

export interface TeamMetrics {
  overallScore: number
  collaborationScore: number
  processEfficiency: number
  documentQuality: number
  timeToCompletion: number
  peerReviewScores: number
  marketPerformance: number
  rankings: {
    overall: number
    university: number
    sector: number
  }
}

export interface IndividualMetrics {
  rolePerformance: number
  collaborationRating: number
  documentContributions: number
  peerReviewScore: number
  responsiveness: number
  leadershipScore: number
  skillDevelopment: SkillProgress[]
}

export interface SkillProgress {
  skill: string
  currentLevel: number
  targetLevel: number
  progress: number
  lastAssessment: Date
}

export interface RolePermissions {
  canCreateDocuments: boolean
  canApproveDocuments: boolean
  canViewFinancials: boolean
  canSubmitToRegulator: boolean
  canManageTeam: boolean
  canInviteMembers: boolean
  canAccessMarketData: boolean
  canTradeSecurities: boolean
}

export interface DealDocument {
  id: string
  name: string
  type: 'prospectus' | 'financial_statement' | 'regulatory_filing' | 'due_diligence' | 'other'
  createdBy: string
  createdAt: Date
  lastModified: Date
  status: 'draft' | 'review' | 'approved' | 'rejected'
  reviewers: DocumentReviewer[]
  content: string
  attachments: string[]
}

export interface DocumentReviewer {
  userId: string
  role: InstitutionalRole
  status: 'pending' | 'approved' | 'rejected'
  comments: string
  reviewedAt?: Date
}

export interface ApprovalStatus {
  stepId: number
  requiredRole: InstitutionalRole
  approver: string
  status: 'pending' | 'approved' | 'rejected'
  comments: string
  timestamp: Date
}

// Team Management Service
export class TeamManagementService {
  
  // Create new team
  async createTeam(teamData: Partial<Team>, creatorId: string): Promise<Team> {
    const team: Team = {
      id: generateTeamId(),
      name: teamData.name || '',
      university: teamData.university || '',
      description: teamData.description || '',
      members: [],
      maxMembers: 12,
      currentDeal: null,
      progress: this.initializeProgress(),
      performance: this.initializeTeamMetrics(),
      createdAt: new Date(),
      status: 'forming',
      inviteCode: generateInviteCode()
    }

    // Add creator as team leader
    await this.addMemberToTeam(team.id, creatorId, 'admin')
    
    return team
  }

  // Join team with invite code
  async joinTeam(inviteCode: string, userId: string, preferredRole?: InstitutionalRole): Promise<boolean> {
    const team = await this.getTeamByInviteCode(inviteCode)
    if (!team || team.members.length >= team.maxMembers) {
      return false
    }

    const availableRole = preferredRole && this.isRoleAvailable(team, preferredRole) 
      ? preferredRole 
      : this.getNextAvailableRole(team)

    if (!availableRole) {
      return false
    }

    await this.addMemberToTeam(team.id, userId, availableRole)
    return true
  }

  // Start new deal
  async startDeal(teamId: string, dealData: Partial<Deal>): Promise<Deal> {
    const deal: Deal = {
      id: generateDealId(),
      teamId,
      companyName: dealData.companyName || '',
      sector: dealData.sector || '',
      capitalTarget: dealData.capitalTarget || 0,
      description: dealData.description || '',
      currentStep: 1,
      totalSteps: 7,
      startedAt: new Date(),
      estimatedCompletion: this.calculateEstimatedCompletion(),
      documents: [],
      approvals: []
    }

    await this.updateTeamDeal(teamId, deal)
    await this.notifyTeamMembers(teamId, 'deal_started', deal)
    
    return deal
  }

  // Progress workflow step
  async completeStep(teamId: string, stepId: number, completedBy: string, data: any): Promise<boolean> {
    const team = await this.getTeam(teamId)
    if (!team || !team.currentDeal) return false

    const completion: StepCompletion = {
      stepId,
      stepName: this.getStepName(stepId),
      completedBy,
      completedAt: new Date(),
      documents: data.documents || [],
      notes: data.notes || ''
    }

    // Check if step requires approval
    const requiredApproval = this.getRequiredApproval(stepId)
    if (requiredApproval) {
      await this.requestApproval(teamId, stepId, requiredApproval)
    }

    await this.updateProgress(teamId, completion)
    await this.notifyNextStepAssignee(teamId, stepId + 1)
    
    return true
  }

  // Cross-team interactions
  async investInTeam(investorTeamId: string, targetTeamId: string, amount: number): Promise<boolean> {
    const investorTeam = await this.getTeam(investorTeamId)
    const targetTeam = await this.getTeam(targetTeamId)
    
    if (!investorTeam || !targetTeam || !targetTeam.currentDeal) {
      return false
    }

    // Record investment
    await this.recordInvestment({
      investorTeamId,
      targetTeamId,
      amount,
      timestamp: new Date(),
      dealId: targetTeam.currentDeal.id
    })

    // Update market data
    await this.updateMarketData(targetTeamId, amount)
    
    return true
  }

  // Performance tracking
  async updateTeamMetrics(teamId: string): Promise<TeamMetrics> {
    const team = await this.getTeam(teamId)
    if (!team) throw new Error('Team not found')

    const metrics: TeamMetrics = {
      overallScore: await this.calculateOverallScore(team),
      collaborationScore: await this.calculateCollaborationScore(team),
      processEfficiency: await this.calculateProcessEfficiency(team),
      documentQuality: await this.calculateDocumentQuality(team),
      timeToCompletion: await this.calculateTimeEfficiency(team),
      peerReviewScores: await this.calculatePeerReviewScores(team),
      marketPerformance: await this.calculateMarketPerformance(team),
      rankings: await this.calculateRankings(team)
    }

    await this.saveTeamMetrics(teamId, metrics)
    return metrics
  }

  // Central market integration
  async submitToMarketEngine(teamId: string): Promise<boolean> {
    const team = await this.getTeam(teamId)
    if (!team || !team.currentDeal || team.progress.currentStep < 7) {
      return false
    }

    const marketData = {
      companyId: `TEAM_${team.id}_${team.currentDeal.id}`,
      teamId: team.id,
      companyName: team.currentDeal.companyName,
      sector: team.currentDeal.sector,
      capitalRaised: team.currentDeal.capitalTarget,
      university: team.university,
      performance: team.performance,
      listingDate: new Date(),
      status: 'active'
    }

    await this.sendToCentralMarket(marketData)
    await this.updateTeamStatus(teamId, 'completed')
    
    return true
  }

  // Helper methods
  private initializeProgress(): WorkflowProgress {
    return {
      currentStep: 0,
      totalSteps: 7,
      completedSteps: [],
      blockedSteps: [],
      nextActions: [],
      estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  }

  private initializeTeamMetrics(): TeamMetrics {
    return {
      overallScore: 0,
      collaborationScore: 0,
      processEfficiency: 0,
      documentQuality: 0,
      timeToCompletion: 0,
      peerReviewScores: 0,
      marketPerformance: 0,
      rankings: { overall: 0, university: 0, sector: 0 }
    }
  }

  private isRoleAvailable(team: Team, role: InstitutionalRole): boolean {
    const roleCount = team.members.filter(m => m.role === role).length
    const maxForRole = this.getMaxMembersForRole(role)
    return roleCount < maxForRole
  }

  private getMaxMembersForRole(role: InstitutionalRole): number {
    const limits = {
      'issuer': 2,
      'ib_advisor': 2,
      'regulator': 1,
      'listing_desk': 1,
      'broker': 2,
      'investor': 3,
      'csd_operator': 1
    }
    return limits[role] || 1
  }

  private getNextAvailableRole(team: Team): InstitutionalRole | null {
    const roles: InstitutionalRole[] = ['issuer', 'ib_advisor', 'regulator', 'listing_desk', 'broker', 'investor', 'csd_operator']
    
    for (const role of roles) {
      if (this.isRoleAvailable(team, role)) {
        return role
      }
    }
    
    return null
  }

  // Placeholder methods for database operations
  private async getTeam(teamId: string): Promise<Team | null> { return null }
  private async getTeamByInviteCode(code: string): Promise<Team | null> { return null }
  private async addMemberToTeam(teamId: string, userId: string, role: InstitutionalRole): Promise<void> {}
  private async updateTeamDeal(teamId: string, deal: Deal): Promise<void> {}
  private async notifyTeamMembers(teamId: string, event: string, data: any): Promise<void> {}
  private async updateProgress(teamId: string, completion: StepCompletion): Promise<void> {}
  private async notifyNextStepAssignee(teamId: string, stepId: number): Promise<void> {}
  private async recordInvestment(investment: any): Promise<void> {}
  private async updateMarketData(teamId: string, amount: number): Promise<void> {}
  private async saveTeamMetrics(teamId: string, metrics: TeamMetrics): Promise<void> {}
  private async sendToCentralMarket(data: any): Promise<void> {}
  private async updateTeamStatus(teamId: string, status: Team['status']): Promise<void> {}
  
  private calculateEstimatedCompletion(): Date {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
  
  private getStepName(stepId: number): string {
    const steps = ['', 'Capital Intent', 'Deal Structuring', 'Regulatory Review', 'Listing Approval', 'Market Access', 'Investment', 'Settlement']
    return steps[stepId] || 'Unknown Step'
  }
  
  private getRequiredApproval(stepId: number): InstitutionalRole | null {
    const approvals = {
      3: 'regulator' as InstitutionalRole,
      4: 'listing_desk' as InstitutionalRole,
      7: 'csd_operator' as InstitutionalRole
    }
    return approvals[stepId] || null
  }
  
  private async requestApproval(teamId: string, stepId: number, role: InstitutionalRole): Promise<void> {}
  private async calculateOverallScore(team: Team): Promise<number> { return 0 }
  private async calculateCollaborationScore(team: Team): Promise<number> { return 0 }
  private async calculateProcessEfficiency(team: Team): Promise<number> { return 0 }
  private async calculateDocumentQuality(team: Team): Promise<number> { return 0 }
  private async calculateTimeEfficiency(team: Team): Promise<number> { return 0 }
  private async calculatePeerReviewScores(team: Team): Promise<number> { return 0 }
  private async calculateMarketPerformance(team: Team): Promise<number> { return 0 }
  private async calculateRankings(team: Team): Promise<{overall: number, university: number, sector: number}> {
    return { overall: 0, university: 0, sector: 0 }
  }
}

// Utility functions
function generateTeamId(): string {
  return `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateDealId(): string {
  return `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateInviteCode(): string {
  return Math.random().toString(36).substr(2, 8).toUpperCase()
}

export const teamManagement = new TeamManagementService()