// 🔗 Workflow-to-Trading Integration
// Automatically creates tradeable instruments when capital raise workflows complete

import { tradingEngine, TradingInstrument } from './trading-engine';
import { workflowEngine } from './capitallab-workflow-engine';

export interface WorkflowCompletionEvent {
  workflowId: string;
  companyName: string;
  instrumentType: 'equity' | 'bond' | 'preferred' | 'warrant';
  targetAmount: number;
  sharesOffered?: number;
  pricePerShare?: number;
  completedAt: Date;
  participants: {
    issuer: string;
    ibAdvisor?: string;
    broker?: string;
    investors: string[];
    regulator: string;
    csd: string;
    listingDesk: string;
  };
}

export class WorkflowTradingIntegration {
  private completedWorkflows: Map<string, WorkflowCompletionEvent> = new Map();
  private createdInstruments: Map<string, string> = new Map(); // workflowId -> instrumentId

  // 🎓 Handle workflow completion
  onWorkflowComplete(workflow: any): TradingInstrument | null {
    // Validate workflow completion
    if (!this.isWorkflowReadyForTrading(workflow)) {
      console.log(`Workflow ${workflow.id} not ready for trading`);
      return null;
    }

    // Create completion event
    const completionEvent: WorkflowCompletionEvent = {
      workflowId: workflow.id,
      companyName: workflow.companyName,
      instrumentType: workflow.instrumentType || 'equity',
      targetAmount: workflow.targetAmount,
      sharesOffered: workflow.sharesOffered,
      pricePerShare: workflow.pricePerShare,
      completedAt: new Date(),
      participants: {
        issuer: workflow.currentParticipants?.issuer || 'Unknown',
        ibAdvisor: workflow.currentParticipants?.ibAdvisor,
        broker: workflow.currentParticipants?.broker,
        investors: workflow.currentParticipants?.investors || [],
        regulator: workflow.currentParticipants?.regulator || 'Unknown',
        csd: workflow.currentParticipants?.csd || 'Unknown',
        listingDesk: workflow.currentParticipants?.listingDesk || 'Unknown'
      }
    };

    // Store completion event
    this.completedWorkflows.set(workflow.id, completionEvent);

    // Create tradeable instrument
    const instrument = tradingEngine.createInstrumentFromWorkflow(workflow);
    this.createdInstruments.set(workflow.id, instrument.id);

    console.log(`✅ Created tradeable instrument ${instrument.symbol} from workflow ${workflow.id}`);
    
    // Auto-launch trading after 24 hours (simulated as 5 seconds for demo)
    setTimeout(() => {
      this.launchTradingForInstrument(instrument.id);
    }, 5000);

    return instrument;
  }

  // ✅ Check if workflow is ready for trading
  private isWorkflowReadyForTrading(workflow: any): boolean {
    // Must have completed all required stages
    const requiredStages = [
      'intent_submission',
      'ib_advisor_review',
      'broker_engagement',
      'investor_interest',
      'regulatory_approval',
      'csd_setup',
      'listing_preparation',
      'final_approval'
    ];

    const completedStages = workflow.stageHistory?.map((h: any) => h.stage) || [];
    const hasAllStages = requiredStages.every(stage => completedStages.includes(stage));

    // Must have final approval
    const hasFinalApproval = workflow.status === 'completed' || workflow.currentStage === 'completed';

    // Must have valid financial data
    const hasValidData = workflow.targetAmount > 0 && workflow.companyName;

    return hasAllStages && hasFinalApproval && hasValidData;
  }

  // 🚀 Launch trading for instrument
  private launchTradingForInstrument(instrumentId: string): void {
    const success = tradingEngine.launchTrading(instrumentId);
    if (success) {
      const instrument = tradingEngine.getInstrument(instrumentId);
      console.log(`🚀 Launched trading for ${instrument?.symbol} (${instrument?.companyName})`);
      
      // Notify participants
      this.notifyTradingLaunch(instrumentId);
    }
  }

  // 📢 Notify participants about trading launch
  private notifyTradingLaunch(instrumentId: string): void {
    const instrument = tradingEngine.getInstrument(instrumentId);
    if (!instrument) return;

    const workflowId = instrument.workflowId;
    const completionEvent = this.completedWorkflows.get(workflowId);
    if (!completionEvent) return;

    // In a real system, this would send notifications to all participants
    console.log(`📢 Trading launched for ${instrument.symbol}:`);
    console.log(`   Company: ${instrument.companyName}`);
    console.log(`   Symbol: ${instrument.symbol}`);
    console.log(`   Initial Price: $${instrument.issuePrice}`);
    console.log(`   Market Cap: $${instrument.marketCap.toLocaleString()}`);
    console.log(`   Participants notified: ${Object.values(completionEvent.participants).filter(Boolean).length}`);
  }

  // 📊 Get trading statistics for completed workflows
  getTradingStatistics() {
    const allInstruments = tradingEngine.getAllInstruments();
    const completedWorkflowCount = this.completedWorkflows.size;
    const activeInstruments = allInstruments.filter(i => i.status === 'active').length;
    const totalMarketCap = allInstruments.reduce((sum, i) => sum + i.marketCap, 0);
    const totalVolume = allInstruments.reduce((sum, i) => sum + i.volume, 0);

    return {
      completedWorkflows: completedWorkflowCount,
      createdInstruments: allInstruments.length,
      activeInstruments,
      totalMarketCap,
      totalVolume,
      conversionRate: completedWorkflowCount > 0 ? (allInstruments.length / completedWorkflowCount) * 100 : 0
    };
  }

  // 🔍 Get instrument by workflow ID
  getInstrumentByWorkflowId(workflowId: string): TradingInstrument | null {
    const instrumentId = this.createdInstruments.get(workflowId);
    if (!instrumentId) return null;
    
    return tradingEngine.getInstrument(instrumentId) || null;
  }

  // 📋 Get all completed workflows
  getCompletedWorkflows(): WorkflowCompletionEvent[] {
    return Array.from(this.completedWorkflows.values());
  }

  // 🎯 Simulate workflow completion for demo
  simulateWorkflowCompletion(companyName: string, instrumentType: 'equity' | 'bond' = 'equity'): TradingInstrument | null {
    const mockWorkflow = {
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      companyName,
      instrumentType,
      targetAmount: Math.floor(Math.random() * 50000000) + 10000000, // $10M - $60M
      sharesOffered: Math.floor(Math.random() * 5000000) + 1000000, // 1M - 6M shares
      pricePerShare: Math.floor(Math.random() * 50) + 10, // $10 - $60 per share
      status: 'completed',
      currentStage: 'completed',
      stageHistory: [
        { stage: 'intent_submission', completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
        { stage: 'ib_advisor_review', completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        { stage: 'broker_engagement', completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
        { stage: 'investor_interest', completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { stage: 'regulatory_approval', completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
        { stage: 'csd_setup', completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { stage: 'listing_preparation', completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { stage: 'final_approval', completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
      ],
      currentParticipants: {
        issuer: `${companyName} Management`,
        ibAdvisor: 'Goldman Sachs',
        broker: 'Morgan Stanley',
        investors: ['BlackRock', 'Vanguard', 'Fidelity'],
        regulator: 'SEC',
        csd: 'DTC',
        listingDesk: 'NYSE'
      }
    };

    return this.onWorkflowComplete(mockWorkflow);
  }

  // 🎮 Demo: Create sample instruments
  createDemoInstruments(): TradingInstrument[] {
    const demoCompanies = [
      { name: 'TechCorp Solutions', type: 'equity' as const },
      { name: 'Green Energy Inc', type: 'equity' as const },
      { name: 'FinTech Innovations', type: 'equity' as const },
      { name: 'BioMed Research', type: 'equity' as const },
      { name: 'Smart Manufacturing', type: 'equity' as const }
    ];

    const instruments: TradingInstrument[] = [];

    demoCompanies.forEach(company => {
      const instrument = this.simulateWorkflowCompletion(company.name, company.type);
      if (instrument) {
        instruments.push(instrument);
      }
    });

    return instruments;
  }

  // 🎯 Create demo instruments for a specific trading engine
  createDemoInstrumentsForEngine(engine: any): TradingInstrument[] {
    const demoCompanies = [
      { name: 'TechCorp Solutions', type: 'equity' as const },
      { name: 'Green Energy Inc', type: 'equity' as const },
      { name: 'FinTech Innovations', type: 'equity' as const },
      { name: 'BioMed Research', type: 'equity' as const },
      { name: 'Smart Manufacturing', type: 'equity' as const }
    ];

    const instruments: TradingInstrument[] = [];

    demoCompanies.forEach(company => {
      const mockWorkflow = {
        id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        companyName: company.name,
        instrumentType: company.type,
        targetAmount: Math.floor(Math.random() * 50000000) + 10000000, // $10M - $60M
        sharesOffered: Math.floor(Math.random() * 5000000) + 1000000, // 1M - 6M shares
        pricePerShare: Math.floor(Math.random() * 50) + 10, // $10 - $60 per share
        status: 'completed',
        currentStage: 'completed',
        stageHistory: [
          { stage: 'intent_submission', completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
          { stage: 'ib_advisor_review', completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          { stage: 'broker_engagement', completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
          { stage: 'investor_interest', completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
          { stage: 'regulatory_approval', completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
          { stage: 'csd_setup', completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { stage: 'listing_preparation', completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { stage: 'final_approval', completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
        ],
        currentParticipants: {
          issuer: `${company.name} Management`,
          ibAdvisor: 'Goldman Sachs',
          broker: 'Morgan Stanley',
          investors: ['BlackRock', 'Vanguard', 'Fidelity'],
          regulator: 'SEC',
          csd: 'DTC',
          listingDesk: 'NYSE'
        }
      };

      const instrument = engine.createInstrumentFromWorkflow(mockWorkflow);
      if (instrument) {
        instruments.push(instrument);
        // Auto-launch trading after a short delay
        setTimeout(() => {
          engine.launchTrading(instrument.id);
        }, 1000 + Math.random() * 2000);
      }
    });

    return instruments;
  }
}

// 🔗 Global integration instance
export const workflowTradingIntegration = new WorkflowTradingIntegration();

// 🎯 Initialize demo data when needed (called by components)
// Removed automatic timeout to prevent race conditions