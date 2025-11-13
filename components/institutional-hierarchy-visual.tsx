'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Building2, 
  Briefcase, 
  Users, 
  TrendingUp, 
  Shield, 
  Database,
  Award,
  ArrowDown,
  ArrowRight,
  Info,
  CheckCircle,
  AlertCircle,
  Eye,
  Settings
} from 'lucide-react'

interface InstitutionalRole {
  id: string
  name: string
  level: number
  description: string
  authority: string[]
  restrictions: string[]
  interactions: string[]
  icon: any
  color: string
  bgColor: string
}

const INSTITUTIONAL_ROLES: InstitutionalRole[] = [
  {
    id: 'regulator',
    name: 'CMA Regulator',
    level: 1,
    description: 'Capital Markets Authority - Ultimate regulatory oversight and compliance enforcement',
    authority: [
      'Review and approve/reject all regulatory filings',
      'Issue compliance notices and enforcement actions',
      'Set market rules and regulations',
      'Monitor market integrity'
    ],
    restrictions: [
      'Cannot directly participate in trading',
      'Must maintain independence from market participants',
      'Cannot provide investment advice'
    ],
    interactions: [
      'Receives filings from IB Advisors',
      'Issues approvals to Listing Desk',
      'Monitors all market participants'
    ],
    icon: Shield,
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200'
  },
  {
    id: 'listing_desk',
    name: 'RSE Listing Desk',
    level: 2,
    description: 'Rwanda Stock Exchange - Controls instrument listing and ISIN creation',
    authority: [
      'Create virtual ISINs for approved instruments',
      'List instruments on the exchange',
      'Set listing requirements and fees',
      'Manage market sessions and controls'
    ],
    restrictions: [
      'Can only list CMA-approved instruments',
      'Cannot modify regulatory decisions',
      'Must follow exchange rules'
    ],
    interactions: [
      'Receives approvals from CMA',
      'Creates ISINs for CSD Registry',
      'Coordinates with Market Operations'
    ],
    icon: Award,
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200'
  },
  {
    id: 'csd',
    name: 'CSD Registry',
    level: 3,
    description: 'Central Securities Depository - Authoritative ownership ledger and settlement',
    authority: [
      'Maintain master instrument registry',
      'Process all settlement transactions',
      'Issue ownership certificates',
      'Manage corporate actions'
    ],
    restrictions: [
      'Can only register listed instruments',
      'Cannot create instruments without ISIN',
      'Must follow settlement rules'
    ],
    interactions: [
      'Receives ISINs from Listing Desk',
      'Settles trades from Market',
      'Updates broker sub-accounts'
    ],
    icon: Database,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200'
  },
  {
    id: 'ib_advisor',
    name: 'Investment Bank Advisor',
    level: 4,
    description: 'Licensed advisory firm - Controls all regulatory-facing actions for issuers',
    authority: [
      'Structure and file regulatory submissions',
      'Conduct due diligence on issuers',
      'Create prospectus and offering documents',
      'Manage book-building and allocations'
    ],
    restrictions: [
      'Cannot bypass regulatory approval',
      'Must act in client\'s best interest',
      'Cannot guarantee approvals'
    ],
    interactions: [
      'Assigned to issuers by system',
      'Submits filings to CMA',
      'Coordinates with brokers for distribution'
    ],
    icon: Briefcase,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200'
  },
  {
    id: 'broker',
    name: 'Licensed Broker',
    level: 5,
    description: 'Market intermediary - Gateway for investor access and trade execution',
    authority: [
      'Activate investor accounts',
      'Execute trades on behalf of clients',
      'Provide market access',
      'Manage client portfolios'
    ],
    restrictions: [
      'Can only trade listed instruments',
      'Must complete investor KYC',
      'Cannot guarantee investment returns'
    ],
    interactions: [
      'Activates investors for trading',
      'Executes orders on exchange',
      'Receives settlement confirmations'
    ],
    icon: Users,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'investor',
    name: 'Investor',
    level: 6,
    description: 'Market participant - Must be broker-activated to access trading',
    authority: [
      'Place buy/sell orders through broker',
      'Receive investment returns',
      'Access portfolio information',
      'Participate in corporate actions'
    ],
    restrictions: [
      'Cannot trade without broker activation',
      'Cannot access exchange directly',
      'Must follow investment limits'
    ],
    interactions: [
      'Requests activation from broker',
      'Places orders through broker',
      'Receives confirmations and statements'
    ],
    icon: TrendingUp,
    color: 'text-teal-700',
    bgColor: 'bg-teal-50 border-teal-200'
  },
  {
    id: 'issuer',
    name: 'Issuer',
    level: 7,
    description: 'Capital seeker - Can only express intent, cannot structure or file directly',
    authority: [
      'Submit capital raise intentions',
      'Respond to due diligence requests',
      'Provide company information',
      'Accept or reject IB proposals'
    ],
    restrictions: [
      'Cannot file directly with regulators',
      'Cannot structure their own offerings',
      'Must work through assigned IB'
    ],
    interactions: [
      'Submits intent to system',
      'Assigned IB Advisor',
      'Responds to IB requests'
    ],
    icon: Building2,
    color: 'text-gray-700',
    bgColor: 'bg-gray-50 border-gray-200'
  }
]

interface InstitutionalHierarchyVisualProps {
  selectedRole?: string
  onRoleSelect?: (roleId: string) => void
  showInteractions?: boolean
  compactView?: boolean
}

export function InstitutionalHierarchyVisual({ 
  selectedRole, 
  onRoleSelect,
  showInteractions = true,
  compactView = false 
}: InstitutionalHierarchyVisualProps) {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleRoleClick = (roleId: string) => {
    if (onRoleSelect) {
      onRoleSelect(roleId)
    }
  }

  const getInteractionArrows = (fromLevel: number, toLevel: number) => {
    if (Math.abs(fromLevel - toLevel) === 1) {
      return fromLevel < toLevel ? '↓' : '↑'
    }
    return ''
  }

  if (compactView) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Institutional Hierarchy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {INSTITUTIONAL_ROLES.map((role) => {
              const RoleIcon = role.icon
              const isSelected = selectedRole === role.id
              
              return (
                <div 
                  key={role.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected ? 'border-primary bg-primary/5' : role.bgColor
                  }`}
                  onClick={() => handleRoleClick(role.id)}
                >
                  <RoleIcon className={`w-4 h-4 ${role.color}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{role.name}</p>
                    <p className="text-xs text-muted-foreground">Level {role.level}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Level {role.level}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Rwanda Capital Markets Institutional Hierarchy
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Authority flows from top to bottom.</strong> No actor can bypass their institutional intermediary. 
              Click on any role to see detailed responsibilities and interactions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Hierarchy Visualization */}
      <div className="space-y-4">
        {INSTITUTIONAL_ROLES.map((role, index) => {
          const RoleIcon = role.icon
          const isSelected = selectedRole === role.id
          const isHovered = hoveredRole === role.id
          const nextRole = INSTITUTIONAL_ROLES[index + 1]
          
          return (
            <div key={role.id} className="space-y-2">
              <Card 
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-primary shadow-lg scale-[1.02]' 
                    : isHovered 
                      ? 'shadow-md scale-[1.01]'
                      : 'hover:shadow-sm'
                } ${role.bgColor}`}
                onClick={() => handleRoleClick(role.id)}
                onMouseEnter={() => setHoveredRole(role.id)}
                onMouseLeave={() => setHoveredRole(null)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg bg-white shadow-sm`}>
                        <RoleIcon className={`w-6 h-6 ${role.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        <p className="text-muted-foreground">{role.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white text-gray-700">
                        Level {role.level}
                      </Badge>
                      {isSelected && <CheckCircle className="w-5 h-5 text-primary" />}
                    </div>
                  </div>
                </CardHeader>

                {/* Detailed View */}
                {(showDetails || isSelected) && (
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Authority
                        </h4>
                        <ul className="text-sm space-y-1">
                          {role.authority.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <div className="w-1 h-1 bg-green-600 rounded-full mt-2" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Restrictions
                        </h4>
                        <ul className="text-sm space-y-1">
                          {role.restrictions.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <div className="w-1 h-1 bg-red-600 rounded-full mt-2" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-1">
                          <ArrowRight className="w-4 h-4" />
                          Key Interactions
                        </h4>
                        <ul className="text-sm space-y-1">
                          {role.interactions.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <div className="w-1 h-1 bg-blue-600 rounded-full mt-2" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Connection Arrow */}
              {nextRole && showInteractions && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm">
                    <ArrowDown className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Authority & Information Flow
                    </span>
                    <ArrowDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Key Principles */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Key Institutional Principles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">No Bypassing Intermediaries</h4>
                  <p className="text-sm text-blue-700">
                    Every participant must work through their designated intermediary. 
                    Issuers cannot file directly; investors cannot trade without brokers.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Regulatory Compliance First</h4>
                  <p className="text-sm text-blue-700">
                    All actions must follow proper regulatory procedures. 
                    No shortcuts or direct market access without proper approvals.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">CSD is Final Authority</h4>
                  <p className="text-sm text-blue-700">
                    The Central Securities Depository maintains the authoritative record. 
                    Trades are not complete until CSD ledger is updated.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-teal-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Professional Intermediation</h4>
                  <p className="text-sm text-blue-700">
                    Licensed professionals (IB Advisors, Brokers) provide essential 
                    expertise and regulatory interface for market participants.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}