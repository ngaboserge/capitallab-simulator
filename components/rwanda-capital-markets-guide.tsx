'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  BookOpen, 
  Building2, 
  Shield, 
  Award,
  Database,
  Users,
  TrendingUp,
  Briefcase,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  Info,
  MapPin,
  Clock,
  Target
} from 'lucide-react'

interface ConceptSection {
  id: string
  title: string
  description: string
  keyPoints: string[]
  realWorldExample: string
  icon: any
  color: string 
}

const CAPITAL_MARKETS_CONCEPTS: ConceptSection[] = [
  {
    id: 'what-are-capital-markets',
    title: 'What Are Capital Markets?',
    description: 'Capital markets are where businesses and governments raise long-term funding by selling securities to investors.',
    keyPoints: [
      'Businesses need money to grow, expand, or start new projects',
      'Instead of only using bank loans, they can sell shares or bonds to many investors',
      'Investors provide money in exchange for ownership (shares) or lending (bonds)',
      'This creates a marketplace where capital flows from savers to businesses'
    ],
    realWorldExample: 'Think of it like a farmer who needs money to buy more land. Instead of asking one bank for a huge loan, the farmer can ask 100 people to each contribute a smaller amount. In return, each person gets a share of the farm\'s future profits.',
    icon: TrendingUp,
    color: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'why-rwanda-needs-capital-markets',
    title: 'Why Rwanda Needs Capital Markets',
    description: 'Capital markets help Rwanda\'s economy grow by connecting businesses with investors efficiently.',
    keyPoints: [
      'SMEs can access funding beyond traditional bank loans',
      'Investors can support local businesses and earn returns',
      'Creates jobs and economic growth across the country',
      'Builds a modern financial system for Vision 2050'
    ],
    realWorldExample: 'A Rwandan coffee cooperative wants to build a processing plant. Through capital markets, they can raise funds from Rwandans living abroad, local pension funds, and individual investors who believe in the coffee industry.',
    icon: MapPin,
    color: 'bg-green-50 border-green-200'
  },
  {
    id: 'cma-role',
    title: 'Capital Markets Authority (CMA) - The Regulator',
    description: 'CMA is like the referee in a football match - they make sure everyone follows the rules fairly.',
    keyPoints: [
      'Protects investors from fraud and misleading information',
      'Ensures companies provide honest financial information',
      'Licenses and monitors market professionals',
      'Investigates and punishes rule violations'
    ],
    realWorldExample: 'Before a company can sell shares to the public, CMA reviews their business plan, financial records, and risk factors. They make sure investors get complete, truthful information to make informed decisions.',
    icon: Shield,
    color: 'bg-red-50 border-red-200'
  },
  {
    id: 'rse-role',
    title: 'Rwanda Stock Exchange (RSE) - The Marketplace',
    description: 'RSE is like a organized market where approved securities are bought and sold safely.',
    keyPoints: [
      'Provides a secure, transparent trading platform',
      'Sets listing standards for companies',
      'Ensures fair price discovery through supply and demand',
      'Maintains market integrity and orderly trading'
    ],
    realWorldExample: 'Just like Kimisagara Market has rules about where vendors can set up and how they operate, RSE has rules about which companies can list and how trading happens.',
    icon: Award,
    color: 'bg-yellow-50 border-yellow-200'
  },
  {
    id: 'csd-role',
    title: 'Central Securities Depository (CSD) - The Record Keeper',
    description: 'CSD is like the land registry office - they keep the official record of who owns what securities.',
    keyPoints: [
      'Maintains the master record of all security ownership',
      'Processes transfers when securities are bought/sold',
      'Issues certificates and statements to owners',
      'Handles corporate actions like dividend payments'
    ],
    realWorldExample: 'When you buy shares, CSD updates their records to show you as the new owner, just like how the land registry updates records when you buy property.',
    icon: Database,
    color: 'bg-purple-50 border-purple-200'
  }
]

const PROCESS_STEPS = [
  {
    step: 1,
    title: 'Business Identifies Capital Need',
    description: 'A company realizes they need funding for expansion, new equipment, or working capital.',
    actor: 'Company/SME',
    example: 'Green Energy Rwanda needs RWF 500M to build a solar farm'
  },
  {
    step: 2,
    title: 'Investment Bank Advisor Assignment',
    description: 'A licensed investment bank advisor is assigned to guide the company through the process.',
    actor: 'Investment Bank',
    example: 'Rwanda Capital Partners is assigned to help structure the funding'
  },
  {
    step: 3,
    title: 'Due Diligence & Documentation',
    description: 'The advisor helps gather all required financial and legal documents.',
    actor: 'IB Advisor + Company',
    example: 'Financial statements, business plan, environmental permits are compiled'
  },
  {
    step: 4,
    title: 'Regulatory Review',
    description: 'CMA reviews all documents to ensure investor protection and compliance.',
    actor: 'CMA Regulator',
    example: 'CMA verifies the solar farm project is viable and risks are properly disclosed'
  },
  {
    step: 5,
    title: 'Market Listing',
    description: 'Once approved, RSE creates an official listing and assigns an identification number.',
    actor: 'RSE Listing Desk',
    example: 'Green Energy Bond gets ISIN code RWA-GEB-2024-001'
  },
  {
    step: 6,
    title: 'Investor Access',
    description: 'Licensed brokers help investors understand and access the investment opportunity.',
    actor: 'Licensed Brokers',
    example: 'Brokers explain the bond terms to potential investors'
  },
  {
    step: 7,
    title: 'Trading & Settlement',
    description: 'Investors can buy/sell through brokers, with CSD maintaining ownership records.',
    actor: 'Investors + CSD',
    example: 'Investors buy bonds, CSD records their ownership, company receives funding'
  }
]

export function RwandaCapitalMarketsGuide() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [showProcess, setShowProcess] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Understanding Rwanda's Capital Markets</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how businesses raise capital and investors participate in Rwanda's growing economy
          </p>
        </div>

        {/* Key Concepts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Key Concepts</h2>
          
          <div className="space-y-4">
            {CAPITAL_MARKETS_CONCEPTS.map((concept) => {
              const ConceptIcon = concept.icon
              const isActive = activeSection === concept.id
              
              return (
                <Card 
                  key={concept.id} 
                  className={`${concept.color} cursor-pointer transition-all ${
                    isActive ? 'shadow-lg scale-[1.02]' : 'hover:shadow-md'
                  }`}
                  onClick={() => setActiveSection(isActive ? null : concept.id)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <ConceptIcon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{concept.title}</CardTitle>
                        <p className="text-muted-foreground">{concept.description}</p>
                      </div>
                      <ArrowRight className={`w-5 h-5 transition-transform ${
                        isActive ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </CardHeader>
                  
                  {isActive && (
                    <CardContent className="pt-0 space-y-4">
                      <div>
                        <h4 className="font-semibold mb-3">Key Points:</h4>
                        <ul className="space-y-2">
                          {concept.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Alert className="bg-white border-primary/20">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Real-World Example:</strong> {concept.realWorldExample}
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </div>

        {/* Process Overview */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">The Capital Raising Process</h2>
            <Button 
              onClick={() => setShowProcess(!showProcess)}
              variant="outline"
              size="lg"
            >
              {showProcess ? 'Hide Process' : 'Show Step-by-Step Process'}
              <ArrowDown className={`w-4 h-4 ml-2 transition-transform ${
                showProcess ? 'rotate-180' : ''
              }`} />
            </Button>
          </div>

          {showProcess && (
            <div className="space-y-4">
              {PROCESS_STEPS.map((step, index) => (
                <div key={step.step} className="space-y-2">
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-blue-900">{step.title}</h3>
                          <p className="text-blue-700 text-sm mb-2">{step.description}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <Badge variant="outline" className="bg-white">
                              <Users className="w-3 h-3 mr-1" />
                              {step.actor}
                            </Badge>
                            <span className="text-blue-600">
                              <strong>Example:</strong> {step.example}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {index < PROCESS_STEPS.length - 1 && (
                    <div className="flex justify-center">
                      <ArrowDown className="w-6 h-6 text-blue-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Why This Matters */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Target className="w-5 h-5" />
              Why This Educational Approach Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-800">For Students & Professionals:</h4>
                <ul className="space-y-1 text-sm text-green-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Understand real-world financial systems
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Learn institutional roles and responsibilities
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Prepare for careers in finance and business
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-green-800">For Business Owners:</h4>
                <ul className="space-y-1 text-sm text-green-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Understand funding options beyond bank loans
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Learn the process before seeking capital
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Know what to expect from advisors and regulators
                  </li>
                </ul>
              </div>
            </div>
            
            <Alert className="bg-white border-green-200">
              <BookOpen className="h-4 w-4" />
              <AlertDescription>
                <strong>Educational Focus:</strong> This platform teaches concepts first, then provides 
                interactive experiences. Understanding the "why" before the "how" creates better learning outcomes.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}