'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Send
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AnalystReport {
  id: string
  title: string
  company: string
  symbol: string
  recommendation: 'BUY' | 'HOLD' | 'SELL'
  targetPrice: number
  currentPrice: number
  analyst: string
  summary: string
  fullReport: string
  publishDate: Date
  isPublished: boolean
  scheduledDate?: Date
}

export function AnalystPanel() {
  const [reports, setReports] = useState<AnalystReport[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<AnalystReport | null>(null)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    symbol: '',
    recommendation: 'HOLD' as 'BUY' | 'HOLD' | 'SELL',
    targetPrice: '',
    currentPrice: '',
    analyst: '',
    summary: '',
    fullReport: '',
    scheduledDate: ''
  })

  const companies = [
    { name: 'Bank of Kigali', symbol: 'BK', price: 285.5 },
    { name: 'MTN Rwanda', symbol: 'MTN', price: 198.3 },
    { name: 'Bralirwa', symbol: 'BRALIRWA', price: 325.0 },
    { name: 'AgriTech Rwanda', symbol: 'AGRITECH', price: 78.4 },
    { name: 'BK Group', symbol: 'BKG', price: 142.8 },
    { name: 'Crystal Telecom', symbol: 'CRYSTAL', price: 156.2 }
  ]

  useEffect(() => {
    // Mock data using actual Rwandan companies
    setReports([
      {
        id: '1',
        title: 'Bank of Kigali Q4 Earnings Analysis',
        company: 'Bank of Kigali',
        symbol: 'BK',
        recommendation: 'BUY',
        targetPrice: 320.00,
        currentPrice: 285.5,
        analyst: 'Sarah Uwimana',
        summary: 'Strong Q4 performance with 15% revenue growth. Digital banking expansion showing promising results.',
        fullReport: 'Detailed analysis of Bank of Kigali\'s quarterly performance and digital transformation...',
        publishDate: new Date(),
        isPublished: true
      },
      {
        id: '2',
        title: 'MTN Rwanda 5G Network Expansion',
        company: 'MTN Rwanda',
        symbol: 'MTN',
        recommendation: 'HOLD',
        targetPrice: 210.00,
        currentPrice: 198.3,
        analyst: 'Jean Baptiste Nzeyimana',
        summary: 'Solid fundamentals but facing regulatory headwinds in 5G rollout.',
        fullReport: 'Comprehensive review of MTN Rwanda\'s 5G expansion strategy...',
        publishDate: new Date(Date.now() - 86400000),
        isPublished: true
      },
      {
        id: '3',
        title: 'AgriTech Rwanda Growth Potential',
        company: 'AgriTech Rwanda',
        symbol: 'AGRITECH',
        recommendation: 'BUY',
        targetPrice: 95.00,
        currentPrice: 78.4,
        analyst: 'Grace Mukamana',
        summary: 'Strong growth potential in agricultural technology sector with government support.',
        fullReport: 'Draft analysis of AgriTech Rwanda\'s market position and growth prospects...',
        publishDate: new Date(),
        isPublished: false,
        scheduledDate: new Date(Date.now() + 86400000)
      }
    ])
  }, [])

  const filteredReports = reports.filter(report => {
    if (filter === 'published') return report.isPublished
    if (filter === 'draft') return !report.isPublished
    return true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newReport: AnalystReport = {
      id: editingReport?.id || Date.now().toString(),
      title: formData.title,
      company: formData.company,
      symbol: formData.symbol,
      recommendation: formData.recommendation,
      targetPrice: parseFloat(formData.targetPrice),
      currentPrice: parseFloat(formData.currentPrice),
      analyst: formData.analyst,
      summary: formData.summary,
      fullReport: formData.fullReport,
      publishDate: new Date(),
      isPublished: editingReport?.isPublished || false,
      scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : undefined
    }

    if (editingReport) {
      setReports(reports.map(r => r.id === editingReport.id ? newReport : r))
    } else {
      setReports([...reports, newReport])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      symbol: '',
      recommendation: 'HOLD',
      targetPrice: '',
      currentPrice: '',
      analyst: '',
      summary: '',
      fullReport: '',
      scheduledDate: ''
    })
    setEditingReport(null)
    setIsAddDialogOpen(false)
  }

  const handleEdit = (report: AnalystReport) => {
    setFormData({
      title: report.title,
      company: report.company,
      symbol: report.symbol,
      recommendation: report.recommendation,
      targetPrice: report.targetPrice.toString(),
      currentPrice: report.currentPrice.toString(),
      analyst: report.analyst,
      summary: report.summary,
      fullReport: report.fullReport,
      scheduledDate: report.scheduledDate?.toISOString().split('T')[0] || ''
    })
    setEditingReport(report)
    setIsAddDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setReports(reports.filter(r => r.id !== id))
  }

  const publishReport = (id: string) => {
    setReports(reports.map(r => 
      r.id === id ? { ...r, isPublished: true, publishDate: new Date() } : r
    ))
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY': return 'text-green-600 bg-green-50'
      case 'SELL': return 'text-red-600 bg-red-50'
      default: return 'text-yellow-600 bg-yellow-50'
    }
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY': return <TrendingUp className="h-4 w-4" />
      case 'SELL': return <TrendingDown className="h-4 w-4" />
      default: return <Minus className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analyst Panel</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingReport ? 'Edit Report' : 'Create New Report'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Report Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="analyst">Analyst Name</Label>
                  <Input
                    id="analyst"
                    value={formData.analyst}
                    onChange={(e) => setFormData({...formData, analyst: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Select
                    value={formData.company}
                    onValueChange={(value) => {
                      const company = companies.find(c => c.name === value)
                      setFormData({
                        ...formData,
                        company: value,
                        symbol: company?.symbol || '',
                        currentPrice: company?.price.toString() || ''
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.symbol} value={company.name}>
                          {company.name} ({company.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recommendation">Recommendation</Label>
                  <Select
                    value={formData.recommendation}
                    onValueChange={(value: 'BUY' | 'HOLD' | 'SELL') => 
                      setFormData({...formData, recommendation: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUY">BUY</SelectItem>
                      <SelectItem value="HOLD">HOLD</SelectItem>
                      <SelectItem value="SELL">SELL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetPrice">Target Price (RWF)</Label>
                  <Input
                    id="targetPrice"
                    type="number"
                    step="0.01"
                    value={formData.targetPrice}
                    onChange={(e) => setFormData({...formData, targetPrice: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="summary">Executive Summary</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, summary: e.target.value})}
                  placeholder="Brief summary of the analysis..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="fullReport">Full Report</Label>
                <Textarea
                  id="fullReport"
                  value={formData.fullReport}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, fullReport: e.target.value})}
                  placeholder="Detailed analysis and reasoning..."
                  rows={8}
                  required
                />
              </div>

              <div>
                <Label htmlFor="scheduledDate">Scheduled Publish Date (Optional)</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingReport ? 'Update' : 'Create'} Report
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Reports ({reports.length})
        </Button>
        <Button
          variant={filter === 'published' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('published')}
        >
          Published ({reports.filter(r => r.isPublished).length})
        </Button>
        <Button
          variant={filter === 'draft' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('draft')}
        >
          Drafts ({reports.filter(r => !r.isPublished).length})
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className={!report.isPublished ? 'border-dashed' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{report.title}</CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{report.symbol}</Badge>
                    <Badge className={getRecommendationColor(report.recommendation)}>
                      {getRecommendationIcon(report.recommendation)}
                      <span className="ml-1">{report.recommendation}</span>
                    </Badge>
                    <Badge variant={report.isPublished ? 'default' : 'secondary'}>
                      {report.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">By {report.analyst}</p>
                </div>
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Current Price</p>
                  <p className="font-medium">RWF {report.currentPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Target Price</p>
                  <p className="font-medium">RWF {report.targetPrice.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Summary</p>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {report.summary}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {report.isPublished 
                    ? `Published ${report.publishDate.toLocaleDateString()}`
                    : report.scheduledDate 
                      ? `Scheduled for ${report.scheduledDate.toLocaleDateString()}`
                      : 'Not scheduled'
                  }
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(report)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(report.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                {!report.isPublished && (
                  <Button
                    size="sm"
                    onClick={() => publishReport(report.id)}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Publish
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}