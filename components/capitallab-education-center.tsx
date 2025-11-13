'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  GraduationCap, 
  Building2, 
  Shield, 
  Award,
  Database,
  Users,
  TrendingUp,
  Briefcase,
  ArrowRight,
  CheckCircle,
  Info,
  Play,
  FileText,
  Eye
} from 'lucide-react'

interface EducationModule {
  id: string
  title: string
  description: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  topics: string[]
  icon: any
  color: string
}

const EDUCATION_MODULES: EducationModule[] = [
  {
    id: 'basics',
    title: 'Capital Markets Fundamentals',
    description: 'Understanding what capital markets are and why they exist',
    duration: '15 minutes',
    difficulty: 'beginner',
    topics: [
      'What are capital markets?',
      'Why do businesses need capital?',
      'Types of financial instruments',
      'Role in economic development'
    ],
    icon: BookOpen,
    color: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'institutions',
    title: 'Rwanda\'s Capital Markets Institutions',
    description: 'Learn about CMA, RSE, CSD and their specific roles',
    duration: '20 minutes',
    difficulty: 'beginner',
    topics: [
      'Capital Markets Authority (CMA)',
      'Rwanda Stock Exchange (RSE)',
      'Central Securities Depository (CSD)',
      'Licensed intermediaries'
    ],
    icon: Shield,
    color: 'bg-red-50 border-red-200'
  }
]
const A
DDITIONAL_MODULES: EducationModule[] = [
  {
    id: 'capital_raising',
    title: 'Capital Raising Process',
