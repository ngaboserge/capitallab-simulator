"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { TeamMember, UserRole, ROLE_DESCRIPTIONS } from '@/lib/cma-issuer-system/types/workflow'
import { Plus, User, Mail, Calendar, Trash2 } from 'lucide-react'

interface TeamSetupProps {
  onTeamComplete: (team: TeamMember[]) => void
  initialTeam?: TeamMember[]
}

export function TeamSetup({ onTeamComplete, initialTeam = [] }: TeamSetupProps) {
  const [team, setTeam] = useState<TeamMember[]>(initialTeam)
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: '' as UserRole | ''
  })

  const availableRoles: UserRole[] = ['CEO', 'CFO', 'COMPANY_SECRETARY', 'LEGAL_ADVISOR']
  const usedRoles = team.map(member => member.role)
  const unusedRoles = availableRoles.filter(role => !usedRoles.includes(role))

  const addTeamMember = () => {
    if (newMember.name && newMember.email && newMember.role) {
      const member: TeamMember = {
        id: `member_${Date.now()}`,
        name: newMember.name,
        email: newMember.email,
        role: newMember.role as UserRole,
        isActive: true,
        joinedDate: new Date()
      }
      
      setTeam([...team, member])
      setNewMember({ name: '', email: '', role: '' })
    }
  }

  const removeMember = (memberId: string) => {
    setTeam(team.filter(member => member.id !== memberId))
  }

  const isTeamComplete = () => {
    const requiredRoles: UserRole[] = ['CEO', 'CFO']
    return requiredRoles.every(role => team.some(member => member.role === role))
  }

  const handleContinue = () => {
    if (isTeamComplete()) {
      onTeamComplete(team)
    }
  }

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      CEO: 'bg-purple-100 text-purple-800',
      CFO: 'bg-blue-100 text-blue-800',
      COMPANY_SECRETARY: 'bg-green-100 text-green-800',
      LEGAL_ADVISOR: 'bg-orange-100 text-orange-800'
    }
    return colors[role]
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Set Up Your IPO Team</CardTitle>
          <p className="text-muted-foreground">
            Assign team members to different roles. Each role will be responsible for specific sections of the CMA application.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Team */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Current Team ({team.length} members)</h3>
            {team.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No team members added yet. Add your first team member below.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {team.map((member) => (
                  <Card key={member.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{member.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span>{member.email}</span>
                        </div>
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {member.role.replace('_', ' ')}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {ROLE_DESCRIPTIONS[member.role]}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(member.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Add New Member */}
          {unusedRoles.length > 0 && (
            <Card className="p-4 bg-gray-50">
              <h4 className="font-medium mb-4">Add Team Member</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Full Name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                />
                <Select
                  value={newMember.role}
                  onValueChange={(value) => setNewMember({ ...newMember, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {unusedRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={addTeamMember}
                  disabled={!newMember.name || !newMember.email || !newMember.role}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </Card>
          )}

          {/* Role Assignments Preview */}
          <Card className="p-4">
            <h4 className="font-medium mb-4">Section Assignments Preview</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Each role can work on their sections independently. No need to wait for others to complete their tasks.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-purple-700 mb-2">CEO Responsibilities (3 sections)</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Company Identity & Legal Form</li>
                  <li>• Prospectus & Disclosure Checklist</li>
                  <li>• Final Declarations & Contacts</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-blue-700 mb-2">CFO Responsibilities (3 sections)</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Capitalization & Financial Strength</li>
                  <li>• Share Ownership & Distribution</li>
                  <li>• Offer Details (IPO Information)</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-green-700 mb-2">Company Secretary (2 sections)</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Governance & Management</li>
                  <li>• Publication & Advertisement</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-orange-700 mb-2">Legal Advisor (2 sections)</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Legal & Regulatory Compliance</li>
                  <li>• Post-Approval Undertakings</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Continue Button */}
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              {isTeamComplete() ? (
                <span className="text-green-600">✓ Minimum team requirements met</span>
              ) : (
                <span className="text-orange-600">⚠ CEO and CFO roles are required</span>
              )}
            </div>
            <Button
              onClick={handleContinue}
              disabled={!isTeamComplete()}
              size="lg"
            >
              Continue to Application
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}