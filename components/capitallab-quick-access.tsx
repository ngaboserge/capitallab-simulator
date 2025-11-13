'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  GraduationCap, 
  Shield, 
  Award,
  Building2,
  ArrowRight,
  Play,
  Users,
  TrendingUp
} from 'lucide-react'

export function CapitalLabQuickAccess() {
  const router = useRouter()

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 shadow-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-600 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg text-green-900">CapitalLab</CardTitle>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              NEW
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-green-700">
            Learn Rwanda's capital markets through our comprehensive educational platform
          </p>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1 text-green-600">
              <BookOpen className="w-3 h-3" />
              <span>Learn Concepts</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <Shield className="w-3 h-3" />
              <span>CMA, RSE, CSD</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <Building2 className="w-3 h-3" />
              <span>8 Institutions</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>Real Process</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => router.push('/capitallab/learn')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <BookOpen className="w-4 h-4 mr-1" />
              Learn
            </Button>
            <Button 
              onClick={() => router.push('/capitallab')}
              variant="outline"
              className="flex-1 border-green-600 text-green-700 hover:bg-green-50"
              size="sm"
            >
              <Play className="w-4 h-4 mr-1" />
              Explore
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}