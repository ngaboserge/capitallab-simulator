// Market Engine System - Admin as the Market Orchestrator
// Users graduate to admin/market maker roles after completing institutional workflows

import { workflowEngine, CapitalRaiseWorkflow, WorkflowStage } from './capitallab-workflow-engine'

export type MarketMakerLevel = 
  | 'junior_market_maker'      // Completed 1 full workflow
  | 'senior_market_maker'      // Completed 3+ workflows in different roles
  | 'market_supervisor'        // Completed 5+ workflows, can oversee others
  | 'market_administrator'     // Master level - can create scenarios and manage system

export type MarketEngineRole = 
  | 'liquidity_provider'       // Provides market liquidity
  | 'scenario_creator'         // Creates educational scenarios
  | 'workflow_supervisor'      // Oversees active workflows
  | 'system_administrator'     // Full system control
  | 'market_data_manager'      // Manages market data and pricing
  | 'compliance_monitor'       // Monitors all activities for compliance

export interface MarketMakerProfile {
  userId: string
  name: string
  level: MarketMakerLevel
  roles: MarketEngineRole[]
  
  // Qualification Metrics
  completedWorkflows: string[]           // Workflow IDs completed
  rolesExperienced: string[]            // Institutional roles mastered
  totalTransactionsSupervised: number   // Transactions they've overseen
  scenariosCreated: number              // Educational scenarios created
  
  // Market Making Capabilities
  canCreateScenarios: boolean
  canSuperviseWorkflows: boolean
  canManageMarketData: boolean
  canProvideLiquidity: boolean
  
  // Performance Metrics
  supervisionRating: number             // 1-5 rating from participants
  scenarioSuccessRate: number          // Success rate of created scenarios
  marketEfficiencyScore: number        // How well they manage market operations
  
  graduatedAt: Date
  lastActive: Date
}

export interface MarketScenario {
  id: string
  title: string
  description: string
  type: 'crisis_simulation' | 'compliance_test' | 'market_stress' | 'educational_demo'
  
  // Scenario Configuration
  targetRoles: string[]                 // Which roles participate
  duration: number                      // Duration in minutes
  complexity: 'beginner' | 'intermediate' | 'advanced'
  
  // Market Conditions
  marketConditions: {
    volatility: number                  // 1-10 scale
    liquidity: number                   // 1-10 scale
    regulatoryPressure: number         // 1-10 scale
    economicEvents: string[]           // List of events to simulate
  }
  
  // Workflow Modifications
  workflowModifications: {
    stageTimeouts: Record<WorkflowStage, number>  // Time limits per stage
    rejectionProbability: Record<string, number>  // Chance of rejections
    documentRequirements: Record<string, string[]> // Extra docs required
  }
  
  // Success Criteria
  successCriteria: {
    completionRate: number             // % of workflows that must complete
    timeLimit: number                  // Max time for scenario
    complianceScore: number           // Min compliance score required
  }
  
  // Participants and Results
  participants: string[]               // User IDs participating
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  results?: {
    completionRate: number
    averageTime: number
    complianceScores: Record<string, number>
    participantFeedback: Record<string, number>
  }
  
  createdBy: string                    // Market maker who created it
  createdAt: Date
  scheduledFor?: Date
}

export interface MarketOperation {
  id: string
  type: 'liquidity_injection' | 'price_adjustment' | 'market_halt' | 'scenario_trigger'
  description: string
  
  // Operation Details
  targetInstruments?: string[]         // ISINs affected
  targetWorkflows?: string[]           // Workflow IDs affected
  parameters: Record<string, any>      // Operation-specific parameters
  
  // Execution
  executedBy: string                   // Market maker who executed
  executedAt: Date
  duration?: number                    // How long the operation lasts
  
  // Impact Tracking
  impact: {
    workflowsAffected: number
    participantsNotified: number
    marketDataChanges: Record<string, number>
  }
  
  status: 'pending' | 'active' | 'completed' | 'cancelled'
}

export class MarketEngineSystem {
  private marketMakers: Map<string, MarketMakerProfile> = new Map()
  private activeScenarios: Map<string, MarketScenario> = new Map()
  private marketOperations: MarketOperation[] = []
  
  // Market Maker Graduation System
  evaluateForGraduation(userId: string): MarketMakerProfile | null {
    // Get user's completed workflows
    const completedWorkflows = this.getUserCompletedWorkflows(userId)
    const rolesExperienced = this.getUserRolesExperienced(userId)
    
    // Check if user qualifies for market maker status
    if (completedWorkflows.length === 0) return null
    
    // Determine market maker level
    let level: MarketMakerLevel = 'junior_market_maker'
    let roles: MarketEngineRole[] = ['liquidity_provider']
    
    if (completedWorkflows.length >= 3 && rolesExperienced.length >= 3) {
      level = 'senior_market_maker'
      roles.push('scenario_creator', 'workflow_supervisor')
    }
    
    if (completedWorkflows.length >= 5 && rolesExperienced.length >= 5) {
      level = 'market_supervisor'
      roles.push('compliance_monitor', 'market_data_manager')
    }
    
    if (completedWorkflows.length >= 8 && rolesExperienced.length >= 7) {
      level = 'market_administrator'
      roles.push('system_administrator')
    }
    
    const profile: MarketMakerProfile = {
      userId,
      name: `Market Maker ${userId}`,
      level,
      roles,
      completedWorkflows: completedWorkflows.map(w => w.id),
      rolesExperienced,
      totalTransactionsSupervised: 0,
      scenariosCreated: 0,
      canCreateScenarios: roles.includes('scenario_creator'),
      canSuperviseWorkflows: roles.includes('workflow_supervisor'),
      canManageMarketData: roles.includes('market_data_manager'),
      canProvideLiquidity: roles.includes('liquidity_provider'),
      supervisionRating: 5.0,
      scenarioSuccessRate: 0,
      marketEfficiencyScore: 5.0,
      graduatedAt: new Date(),
      lastActive: new Date()
    }
    
    this.marketMakers.set(userId, profile)
    return profile
  }
  
  private getUserCompletedWorkflows(userId: string): CapitalRaiseWorkflow[] {
    // In real implementation, this would query the database
    // For now, return mock data based on workflow engine
    return Array.from(workflowEngine['workflows'].values()).filter(workflow => 
      workflow.status === 'completed' && 
      this.userParticipatedInWorkflow(userId, workflow)
    )
  }
  
  private getUserRolesExperienced(userId: string): string[] {
    const workflows = this.getUserCompletedWorkflows(userId)
    const roles = new Set<string>()
    
    workflows.forEach(workflow => {
      // Check which roles the user played in each workflow
      if (workflow.participants.issuer.userId === userId) roles.add('issuer')
      if (workflow.participants.ibAdvisor?.userId === userId) roles.add('ib_advisor')
      if (workflow.participants.regulator?.userId === userId) roles.add('regulator')
      if (workflow.participants.listingDesk?.userId === userId) roles.add('listing_desk')
      if (workflow.participants.csdOperator?.userId === userId) roles.add('csd_operator')
      if (workflow.participants.brokers.some(b => b.userId === userId)) roles.add('broker')
      if (workflow.participants.investors.some(i => i.userId === userId)) roles.add('investor')
    })
    
    return Array.from(roles)
  }
  
  private userParticipatedInWorkflow(userId: string, workflow: CapitalRaiseWorkflow): boolean {
    return workflow.participants.issuer.userId === userId ||
           workflow.participants.ibAdvisor?.userId === userId ||
           workflow.participants.regulator?.userId === userId ||
           workflow.participants.listingDesk?.userId === userId ||
           workflow.participants.csdOperator?.userId === userId ||
           workflow.participants.brokers.some(b => b.userId === userId) ||
           workflow.participants.investors.some(i => i.userId === userId)
  }
  
  // Scenario Management
  createScenario(creatorId: string, scenarioData: Omit<MarketScenario, 'id' | 'createdBy' | 'createdAt' | 'participants' | 'status'>): MarketScenario {
    const creator = this.marketMakers.get(creatorId)
    if (!creator || !creator.canCreateScenarios) {
      throw new Error('User not authorized to create scenarios')
    }
    
    const scenario: MarketScenario = {
      ...scenarioData,
      id: `SCENARIO-${Date.now()}`,
      participants: [],
      status: 'draft',
      createdBy: creatorId,
      createdAt: new Date()
    }
    
    this.activeScenarios.set(scenario.id, scenario)
    
    // Update creator's metrics
    creator.scenariosCreated++
    creator.lastActive = new Date()
    
    return scenario
  }
  
  launchScenario(scenarioId: string, launchedBy: string): boolean {
    const scenario = this.activeScenarios.get(scenarioId)
    const launcher = this.marketMakers.get(launchedBy)
    
    if (!scenario || !launcher || !launcher.canSuperviseWorkflows) {
      return false
    }
    
    scenario.status = 'active'
    
    // Apply scenario modifications to active workflows
    this.applyScenarioToWorkflows(scenario)
    
    // Notify all participants
    this.notifyScenarioParticipants(scenario)
    
    return true
  }
  
  private applyScenarioToWorkflows(scenario: MarketScenario) {
    // Apply scenario modifications to all active workflows
    const activeWorkflows = Array.from(workflowEngine['workflows'].values())
      .filter(w => w.status === 'active')
    
    activeWorkflows.forEach(workflow => {
      // Apply stage timeouts
      Object.entries(scenario.workflowModifications.stageTimeouts).forEach(([stage, timeout]) => {
        // In real implementation, set timers for stage timeouts
        console.log(`Applied ${timeout}min timeout to ${stage} in workflow ${workflow.id}`)
      })
      
      // Apply rejection probabilities
      Object.entries(scenario.workflowModifications.rejectionProbability).forEach(([role, probability]) => {
        // In real implementation, modify approval logic
        console.log(`Applied ${probability}% rejection probability for ${role} in workflow ${workflow.id}`)
      })
    })
  }
  
  private notifyScenarioParticipants(scenario: MarketScenario) {
    // Send notifications to all participants about the active scenario
    scenario.participants.forEach(participantId => {
      // In real implementation, send notifications
      console.log(`Notified participant ${participantId} about scenario ${scenario.title}`)
    })
  }
  
  // Market Operations
  executeMarketOperation(operatorId: string, operation: Omit<MarketOperation, 'id' | 'executedBy' | 'executedAt' | 'status' | 'impact'>): MarketOperation {
    const operator = this.marketMakers.get(operatorId)
    if (!operator) {
      throw new Error('User not authorized for market operations')
    }
    
    const marketOp: MarketOperation = {
      ...operation,
      id: `OP-${Date.now()}`,
      executedBy: operatorId,
      executedAt: new Date(),
      status: 'active',
      impact: {
        workflowsAffected: 0,
        participantsNotified: 0,
        marketDataChanges: {}
      }
    }
    
    this.marketOperations.push(marketOp)
    
    // Execute the operation
    this.processMarketOperation(marketOp)
    
    return marketOp
  }
  
  private processMarketOperation(operation: MarketOperation) {
    switch (operation.type) {
      case 'liquidity_injection':
        this.injectLiquidity(operation)
        break
      case 'price_adjustment':
        this.adjustPrices(operation)
        break
      case 'market_halt':
        this.haltMarket(operation)
        break
      case 'scenario_trigger':
        this.triggerScenario(operation)
        break
    }
  }
  
  private injectLiquidity(operation: MarketOperation) {
    // Inject liquidity into specified instruments
    operation.targetInstruments?.forEach(isin => {
      console.log(`Injecting liquidity into ${isin}`)
      operation.impact.marketDataChanges[isin] = (operation.parameters.liquidityAmount || 1000000)
    })
    
    operation.impact.workflowsAffected = operation.targetInstruments?.length || 0
  }
  
  private adjustPrices(operation: MarketOperation) {
    // Adjust prices for specified instruments
    operation.targetInstruments?.forEach(isin => {
      const adjustment = operation.parameters.priceAdjustment || 0
      console.log(`Adjusting price for ${isin} by ${adjustment}%`)
      operation.impact.marketDataChanges[isin] = adjustment
    })
  }
  
  private haltMarket(operation: MarketOperation) {
    // Halt trading for specified instruments or entire market
    console.log(`Market halt executed for ${operation.duration || 15} minutes`)
    operation.impact.workflowsAffected = operation.targetWorkflows?.length || 0
  }
  
  private triggerScenario(operation: MarketOperation) {
    // Trigger a specific scenario
    const scenarioId = operation.parameters.scenarioId
    if (scenarioId) {
      this.launchScenario(scenarioId, operation.executedBy)
    }
  }
  
  // Query Functions
  getMarketMaker(userId: string): MarketMakerProfile | undefined {
    return this.marketMakers.get(userId)
  }
  
  getAllMarketMakers(): MarketMakerProfile[] {
    return Array.from(this.marketMakers.values())
  }
  
  getActiveScenarios(): MarketScenario[] {
    return Array.from(this.activeScenarios.values()).filter(s => s.status === 'active')
  }
  
  getMarketOperations(limit: number = 50): MarketOperation[] {
    return this.marketOperations
      .sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime())
      .slice(0, limit)
  }
  
  // Market Maker Leaderboard
  getMarketMakerLeaderboard(): MarketMakerProfile[] {
    return Array.from(this.marketMakers.values())
      .sort((a, b) => {
        // Sort by level, then by performance metrics
        const levelOrder = { 'market_administrator': 4, 'market_supervisor': 3, 'senior_market_maker': 2, 'junior_market_maker': 1 }
        const aLevel = levelOrder[a.level]
        const bLevel = levelOrder[b.level]
        
        if (aLevel !== bLevel) return bLevel - aLevel
        
        // If same level, sort by performance
        const aScore = a.marketEfficiencyScore * a.supervisionRating * (a.scenarioSuccessRate + 1)
        const bScore = b.marketEfficiencyScore * b.supervisionRating * (b.scenarioSuccessRate + 1)
        
        return bScore - aScore
      })
  }
}

// Global market engine instance
export const marketEngine = new MarketEngineSystem()