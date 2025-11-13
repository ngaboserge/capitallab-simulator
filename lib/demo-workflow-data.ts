// Demo data for CapitalLab Workflow System
import { workflowEngine } from './capitallab-workflow-engine'

export function initializeDemoWorkflows() {
  // Create a sample workflow for TechCorp Ltd
  const workflow1 = workflowEngine.createWorkflow({
    userId: 'issuer-techcorp',
    companyName: 'TechCorp Ltd',
    instrumentType: 'equity',
    targetAmount: 2500000,
    currency: 'RWF'
  })

  // Simulate some progress - assign IB Advisor
  workflowEngine.assignParticipant(workflow1.id, 'ib_advisor', {
    userId: 'ib-advisor-123',
    role: 'ib_advisor',
    name: 'Rwanda Capital Partners',
    institution: 'Rwanda Capital Partners Ltd',
    isActive: true
  })

  // Advance to due diligence stage
  workflowEngine.executeAction(workflow1.id, 'assign_ib', 'ib-advisor-123', {
    participant: {
      userId: 'ib-advisor-123',
      role: 'ib_advisor',
      name: 'Rwanda Capital Partners',
      isActive: true
    }
  })

  // Add some documents
  workflowEngine.addDocument(workflow1.id, {
    type: 'capital_raise_intent',
    title: 'Capital Raise Intent - TechCorp Ltd',
    content: {
      amount: 2500000,
      currency: 'RWF',
      purpose: 'Expansion and technology upgrade',
      timeline: '6 months'
    },
    uploadedBy: 'issuer-techcorp',
    status: 'submitted'
  })

  // Create another workflow for AgriCorp Ltd
  const workflow2 = workflowEngine.createWorkflow({
    userId: 'issuer-agricorp',
    companyName: 'AgriCorp Ltd',
    instrumentType: 'bond',
    targetAmount: 1800000,
    currency: 'RWF'
  })

  // This one is further along - at regulatory review stage
  workflowEngine.assignParticipant(workflow2.id, 'ib_advisor', {
    userId: 'ib-advisor-456',
    role: 'ib_advisor',
    name: 'Kigali Investment Bank',
    institution: 'Kigali Investment Bank Ltd',
    isActive: true
  })

  // Advance through multiple stages
  workflowEngine.executeAction(workflow2.id, 'assign_ib', 'ib-advisor-456')
  workflowEngine.advanceStage(workflow2.id, 'prospectus_building', 'ib-advisor-456', 'Due diligence completed')
  workflowEngine.executeAction(workflow2.id, 'submit_for_review', 'ib-advisor-456')

  // Assign regulator
  workflowEngine.assignParticipant(workflow2.id, 'regulator', {
    userId: 'regulator-cma',
    role: 'regulator',
    name: 'CMA Regulatory Officer',
    institution: 'Capital Markets Authority',
    isActive: true
  })

  console.log('Demo workflows initialized:', {
    workflow1: workflow1.id,
    workflow2: workflow2.id
  })

  return { workflow1, workflow2 }
}

// Initialize demo data when this module is imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    initializeDemoWorkflows()
  }, 1000)
}