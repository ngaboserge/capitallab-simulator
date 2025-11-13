'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Building2, 
  Briefcase, 
  Users, 
  TrendingUp, 
  Shield, 
  Database,
  Award,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  Clock,
  FileText,
  Eye,
  BookOpen,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'

interface TutorialStep {
  id: number
  title: string
  description: string
  actor: string
  actorRole: 'issuer' | 'ib_advisor' | 'regulator' | 'listing_desk' | 'broker' | 'investor' | 'csd'
  action: string
  outcome: string
  keyLearning: string
  icon: any
  color: string
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: "Business Expresses Desire to Raise Capital",
    description: "An SME or startup team submits their capital raise intent - the only step they fully control.",
    actor: "Issuer (SME/Startup)",
    actorRole: "issuer",
    action: "Submit Capital Raise Intent Form",
    outcome: "Intent recorded in system, awaiting IB assignment",
    keyLearning: "Issuers cannot structure deals themselves - they only express intent",
    icon: Building2,
    color: "bg-gray-100 text-gray-700"
  },
  {
    id: 2,
    title: "Assignment of Investment Bank Advisor",
    description: "System assigns a Lead Advisor who will guide the issuer through the entire process.",
    actor: "Investment Bank Advisor",
    actorRole: "ib_advisor",
    action: "Accept assignment and begin client relationship",
    outcome: "IB takes control of all regulatory-facing actions",
    keyLearning: "No business lists directly - all require professional advisory",
    icon: Briefcase,
    color: "bg-orange-100 text-orange-700"
  },
  {
    id: 3,
    title: "Due Diligence Instead of Guesswork",
    description: "IB Advisor requests structured documentation: cashflow, purpose, timeline, risks.",
    actor: "IB Advisor → Issuer",
    actorRole: "ib_advisor",
    action: "Request due diligence documents and KYC information",
    outcome: "Comprehensive documentation package prepared",
    keyLearning: "Nothing gets listed without structured preparation and evidence",
    icon: FileText,
    color: "bg-blue-100 text-blue-700"
  },
  {
    id: 4,
    title: "Simulated CMA Review",
    description: "Regulator reviews the proposal using real CMA-style approval/rejection processes.",
    actor: "CMA Regulator",
    actorRole: "regulator",
    action: "Review prospectus and issue compliance decision",
    outcome: "Approval with conditions OR rejection with specific reasons",
    keyLearning: "Regulatory review follows real-world compliance standards",
    icon: Shield,
    color: "bg-red-100 text-red-700"
  },
  {
    id: 5,
    title: "Approval & Virtual Listing",
    description: "Upon approval, instrument receives virtual ISIN and gets listed on CapitalLab Market Board.",
    actor: "RSE Listing Desk",
    actorRole: "listing_desk",
    action: "Create virtual ISIN and list instrument",
    outcome: "Instrument becomes available for trading with proper controls",
    keyLearning: "Listing requires both regulatory approval AND exchange authorization",
    icon: Award,
    color: "bg-green-100 text-green-700"
  },
  {
    id: 6,
    title: "Investors Cannot Trade Freely Yet",
    description: "Investors must be activated by a licensed broker before they can access the market.",
    actor: "Licensed Broker",
    actorRole: "broker",
    action: "Activate investor accounts and provide market access",
    outcome: "Investors gain broker-mediated trading capability",
    keyLearning: "No direct market access - all trading is broker-mediated",
    icon: Users,
    color: "bg-purple-100 text-purple-700"
  },
  {
    id: 7,
    title: "Trading & Settlement",
    description: "Investors trade through brokers, with all transactions settled in virtual CSD ledger.",
    actor: "Investors + CSD",
    actorRole: "investor",
    action: "Execute trades with proper settlement and documentation",
    outcome: "Contract notes generated, CSD ledger updated",
    keyLearning: "Trade completion requires proper settlement and record-keeping",
    icon: TrendingUp,
    color: "bg-teal-100 text-teal-700"
  }
]

interface CapitalLabOnboardingTutorialProps {
  onComplete: () => void
  onSkip: () => void
}

export function CapitalLabOnboardingTutorial({ onComplete, onSkip }: CapitalLabOnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStart = () => {
    setHasStarted(true)
    setCurrentStep(0)
  }

  const handleAutoPlay = () => {
    if (!isPlaying) {
      setIsPlaying(true)
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= TUTORIAL_STEPS.length - 1) {
            setIsPlaying(false)
            clearInterval(interval)
            return prev
          }
          return prev + 1
        })
      }, 4000) // 4 seconds per step
    } else {
      setIsPlaying(false)
    }
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
    setHasStarted(false)
  }

  const getRoleIcon = (role: string) => {
    const icons = {
      issuer: Building2,
      ib_advisor: Briefcase,
      broker: Users,
      investor: TrendingUp,
      regulator: Shield,
      listing_desk: Award,
      csd: Database
    }
    return icons[role as keyof typeof icons] || Building2
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-4xl w-full">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-3xl">How CapitalLab Works</CardTitle>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Learn Rwanda's capital markets institutional procedures through our 7-step educational journey
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-amber-50 border-amber-200">
              <BookOpen className="h-4 w-4" />
              <AlertDescription>
                <strong>Educational Platform:</strong> This tutorial shows you how real capital markets work in Rwanda - 
                from initial intent to final settlement. No real money is involved.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What You'll Learn:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    How businesses raise capital in Rwanda
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Role of Investment Bank Advisors
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    CMA regulatory review process
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    RSE listing procedures
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Broker-mediated investor access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    CSD settlement and record-keeping
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tutorial Features:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-blue-600" />
                    Interactive step-by-step walkthrough
                  </li>
                  <li className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    Visual institutional hierarchy
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Auto-play mode available
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Real-world examples and scenarios
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button onClick={handleStart} size="lg" className="px-8">
                <Play className="w-4 h-4 mr-2" />
                Start Tutorial
              </Button>
              <Button onClick={onSkip} variant="outline" size="lg">
                Skip Tutorial
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const step = TUTORIAL_STEPS[currentStep]
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">How CapitalLab Works</h1>
            <p className="text-muted-foreground">
              Step {currentStep + 1} of {TUTORIAL_STEPS.length}: {step.title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoPlay}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Auto Play'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSkip}
            >
              Skip Tutorial
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tutorial Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Step Detail */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 border-primary">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${step.color}`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <p className="text-muted-foreground">{step.actor}</p>
                  </div>
                  <Badge className="ml-auto">
                    Step {step.id}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg">{step.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-700">Action Taken:</h4>
                    <p className="text-sm bg-green-50 p-3 rounded-lg border border-green-200">
                      {step.action}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-700">Outcome:</h4>
                    <p className="text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
                      {step.outcome}
                    </p>
                  </div>
                </div>

                <Alert className="bg-amber-50 border-amber-200">
                  <BookOpen className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Key Learning:</strong> {step.keyLearning}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Previous Step
              </Button>
              <Button onClick={handleNext}>
                {currentStep === TUTORIAL_STEPS.length - 1 ? 'Complete Tutorial' : 'Next Step'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Process Overview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Complete Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {TUTORIAL_STEPS.map((tutorialStep, index) => {
                    const StepIcon = tutorialStep.icon
                    const isActive = index === currentStep
                    const isCompleted = index < currentStep
                    
                    return (
                      <div key={tutorialStep.id} className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : isCompleted 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <StepIcon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            isActive ? 'text-primary' : isCompleted ? 'text-green-700' : 'text-muted-foreground'
                          }`}>
                            {tutorialStep.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tutorialStep.actor}
                          </p>
                        </div>
                        {index < TUTORIAL_STEPS.length - 1 && (
                          <ArrowDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Institutional Hierarchy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Institutional Hierarchy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                    <Shield className="w-4 h-4 text-red-600" />
                    <span>CMA Regulator (Level 1)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                    <Award className="w-4 h-4 text-green-600" />
                    <span>RSE Listing Desk (Level 2)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                    <Database className="w-4 h-4 text-purple-600" />
                    <span>CSD Registry (Level 3)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                    <Briefcase className="w-4 h-4 text-orange-600" />
                    <span>IB Advisor (Level 4)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Licensed Broker (Level 5)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-teal-50 rounded">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                    <span>Investor (Level 6)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Building2 className="w-4 h-4 text-gray-600" />
                    <span>Issuer (Level 7)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}