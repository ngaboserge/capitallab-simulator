'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  FileBarChart, 
  Download, 
  Calendar,
  Filter,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  AlertTriangle,
  Eye
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Report {
  id: string
  title: string
  type: 'daily' | 'weekly' | 'monthly' | 'compliance' | 'performance' | 'custom'
  generatedDate: Date
  period: {
    start: Date
    end: Date
  }
  status: 'completed' | 'generating' | 'failed'
  size: string
  downloadUrl?: string
}

interface ReportMetrics {
  totalTrades: number
  totalVolume: number
  activeTraders: number
  complianceViolations: number
  topPerformingStock: string
  worstPerformingStock: string
  averageTradeSize: number
  marketVolatility: number
}

export function AdminReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    // Mock data - replace with actual API calls
    setReports([
      {
        id: '1',
        title: 'Daily Trading Summary - Dec 15, 2024',
        type: 'daily',
        generatedDate: new Date(),
        period: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000),
          end: new Date()
        },
        status: 'completed',
        size: '2.3 MB',
        downloadUrl: '/reports/daily-2024-12-15.pdf'
      },
      {
        id: '2',
        title: 'Weekly Performance Report - Week 50',
        type: 'weekly',
        generatedDate: new Date(Date.now() - 86400000),
        period: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        status: 'completed',
        size: '5.7 MB',
        downloadUrl: '/reports/weekly-2024-w50.pdf'
      },
      {
        id: '3',
        title: 'Compliance Audit Report - Q4 2024',
        type: 'compliance',
        generatedDate: new Date(Date.now() - 2 * 86400000),
        period: {
          start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        status: 'completed',
        size: '12.1 MB',
        downloadUrl: '/reports/compliance-q4-2024.pdf'
      },
      {
        id: '4',
        title: 'Monthly Performance Analysis',
        type: 'monthly',
        generatedDate: new Date(),
        period: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        status: 'generating',
        size: 'Generating...'
      }
    ])

    setMetrics({
      totalTrades: 15420,
      totalVolume: 45600000,
      activeTraders: 1247,
      complianceViolations: 3,
      topPerformingStock: 'AGRITECH (+18.61%)',
      worstPerformingStock: 'CRYSTAL (-2.98%)',
      averageTradeSize: 2958,
      marketVolatility: 2.4
    })
  }, [])

  const filteredReports = reports.filter(report => {
    if (filterType === 'all') return true
    return report.type === filterType
  })

  const generateReport = async (type: Report['type']) => {
    setIsGenerating(true)
    
    // Simulate report generation
    const newReport: Report = {
      id: Date.now().toString(),
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${new Date().toLocaleDateString()}`,
      type,
      generatedDate: new Date(),
      period: {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end)
      },
      status: 'generating',
      size: 'Generating...'
    }

    setReports([newReport, ...reports])

    // Simulate generation time
    setTimeout(() => {
      setReports(prev => prev.map(r => 
        r.id === newReport.id 
          ? { 
              ...r, 
              status: 'completed' as const, 
              size: `${(Math.random() * 10 + 1).toFixed(1)} MB`,
              downloadUrl: `/reports/${type}-${Date.now()}.pdf`
            }
          : r
      ))
      setIsGenerating(false)
    }, 3000)
  }

  const downloadReport = (report: Report) => {
    if (report.downloadUrl) {
      // Simulate download
      console.log(`Downloading report: ${report.title}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'generating': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-100 text-blue-800'
      case 'weekly': return 'bg-purple-100 text-purple-800'
      case 'monthly': return 'bg-indigo-100 text-indigo-800'
      case 'compliance': return 'bg-orange-100 text-orange-800'
      case 'performance': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalTrades.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RWF {(metrics.totalVolume / 1000000).toFixed(1)}M</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Traders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeTraders.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.complianceViolations}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Stats */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Market Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Top Performer</p>
                <p className="font-medium text-green-600">{metrics.topPerformingStock}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Worst Performer</p>
                <p className="font-medium text-red-600">{metrics.worstPerformingStock}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Trade Size</p>
                <p className="font-medium">RWF {metrics.averageTradeSize.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Market Volatility</p>
                <p className="font-medium">{metrics.marketVolatility}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => generateReport('daily')}
                disabled={isGenerating}
                size="sm"
              >
                Daily
              </Button>
              <Button
                onClick={() => generateReport('weekly')}
                disabled={isGenerating}
                size="sm"
              >
                Weekly
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => generateReport('compliance')}
                disabled={isGenerating}
                size="sm"
                variant="outline"
              >
                Compliance
              </Button>
              <Button
                onClick={() => generateReport('performance')}
                disabled={isGenerating}
                size="sm"
                variant="outline"
              >
                Performance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5" />
            Generated Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <FileBarChart className="h-8 w-8 text-gray-400" />
                  <div>
                    <h4 className="font-medium">{report.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getTypeColor(report.type)}>
                        {report.type}
                      </Badge>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {report.size}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Generated: {report.generatedDate.toLocaleDateString()}
                      </span>
                      <span>
                        Period: {report.period.start.toLocaleDateString()} - {report.period.end.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedReport(report)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  {report.status === 'completed' && (
                    <Button
                      size="sm"
                      onClick={() => downloadReport(report)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Preview Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                <div>
                  <label className="text-sm font-medium text-gray-500">Report Title</label>
                  <p>{selectedReport.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <Badge className={getTypeColor(selectedReport.type)}>
                    {selectedReport.type}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Generated</label>
                  <p>{selectedReport.generatedDate.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">File Size</label>
                  <p>{selectedReport.size}</p>
                </div>
              </div>

              {/* Mock report content */}
              <div className="p-4 border rounded bg-white">
                <h3 className="text-lg font-semibold mb-4">Executive Summary</h3>
                <div className="space-y-3 text-sm">
                  <p>
                    This report covers trading activity from {selectedReport.period.start.toLocaleDateString()} 
                    to {selectedReport.period.end.toLocaleDateString()}.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">Key Metrics</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>Total trades executed: 15,420</li>
                        <li>Total volume: RWF 45.6M</li>
                        <li>Average trade size: RWF 2,958</li>
                        <li>Market volatility: 2.4%</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium">Compliance Status</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>Compliance violations: 3</li>
                        <li>Resolved issues: 12</li>
                        <li>Pending reviews: 1</li>
                        <li>Overall compliance: 99.8%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
                {selectedReport.status === 'completed' && (
                  <Button onClick={() => downloadReport(selectedReport)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Full Report
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}