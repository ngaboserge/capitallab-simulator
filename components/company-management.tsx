'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Pause, 
  Play,
  Building2,
  FileText
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Company {
  id: string
  name: string
  symbol: string
  ipoPrice: number
  currentPrice: number
  totalShares: number
  isActive: boolean
  sector: string
  description: string
  prospectusUrl?: string
}

export function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    ipoPrice: '',
    totalShares: '',
    sector: '',
    description: '',
    prospectusUrl: ''
  })

  useEffect(() => {
    // Using actual Rwandan companies
    setCompanies([
      {
        id: '1',
        name: 'Bank of Kigali',
        symbol: 'BK',
        ipoPrice: 250.00,
        currentPrice: 285.5,
        totalShares: 2000000,
        isActive: true,
        sector: 'Banking',
        description: 'Leading commercial bank in Rwanda providing comprehensive financial services.',
        prospectusUrl: '/docs/bk-prospectus.pdf'
      },
      {
        id: '2',
        name: 'MTN Rwanda',
        symbol: 'MTN',
        ipoPrice: 180.00,
        currentPrice: 198.3,
        totalShares: 1500000,
        isActive: true,
        sector: 'Telecom',
        description: 'Leading telecommunications company providing mobile and digital services.'
      },
      {
        id: '3',
        name: 'Bralirwa',
        symbol: 'BRALIRWA',
        ipoPrice: 300.00,
        currentPrice: 325.0,
        totalShares: 800000,
        isActive: true,
        sector: 'Consumer',
        description: 'Leading brewery and beverage company in Rwanda.'
      },
      {
        id: '4',
        name: 'AgriTech Rwanda',
        symbol: 'AGRITECH',
        ipoPrice: 60.00,
        currentPrice: 78.4,
        totalShares: 1200000,
        isActive: true,
        sector: 'Agriculture',
        description: 'Agricultural technology company focused on sustainable farming solutions.'
      },
      {
        id: '5',
        name: 'BK Group',
        symbol: 'BKG',
        ipoPrice: 150.00,
        currentPrice: 142.8,
        totalShares: 900000,
        isActive: true,
        sector: 'Banking',
        description: 'Financial services group with operations across East Africa.'
      },
      {
        id: '6',
        name: 'Crystal Telecom',
        symbol: 'CRYSTAL',
        ipoPrice: 170.00,
        currentPrice: 156.2,
        totalShares: 600000,
        isActive: false,
        sector: 'Telecom',
        description: 'Telecommunications infrastructure and services provider.'
      }
    ])
  }, [])

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newCompany: Company = {
      id: editingCompany?.id || Date.now().toString(),
      name: formData.name,
      symbol: formData.symbol.toUpperCase(),
      ipoPrice: parseFloat(formData.ipoPrice),
      currentPrice: editingCompany?.currentPrice || parseFloat(formData.ipoPrice),
      totalShares: parseInt(formData.totalShares),
      isActive: editingCompany?.isActive || true,
      sector: formData.sector,
      description: formData.description,
      prospectusUrl: formData.prospectusUrl || undefined
    }

    if (editingCompany) {
      setCompanies(companies.map(c => c.id === editingCompany.id ? newCompany : c))
    } else {
      setCompanies([...companies, newCompany])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      symbol: '',
      ipoPrice: '',
      totalShares: '',
      sector: '',
      description: '',
      prospectusUrl: ''
    })
    setEditingCompany(null)
    setIsAddDialogOpen(false)
  }

  const handleEdit = (company: Company) => {
    setFormData({
      name: company.name,
      symbol: company.symbol,
      ipoPrice: company.ipoPrice.toString(),
      totalShares: company.totalShares.toString(),
      sector: company.sector,
      description: company.description,
      prospectusUrl: company.prospectusUrl || ''
    })
    setEditingCompany(company)
    setIsAddDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setCompanies(companies.filter(c => c.id !== id))
  }

  const toggleCompanyStatus = (id: string) => {
    setCompanies(companies.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Company Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCompany ? 'Edit Company' : 'Add New Company'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="symbol">Ticker Symbol</Label>
                  <Input
                    id="symbol"
                    value={formData.symbol}
                    onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                    placeholder="e.g., TECH"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ipoPrice">IPO Price (RWF)</Label>
                  <Input
                    id="ipoPrice"
                    type="number"
                    step="0.01"
                    value={formData.ipoPrice}
                    onChange={(e) => setFormData({...formData, ipoPrice: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="totalShares">Total Shares</Label>
                  <Input
                    id="totalShares"
                    type="number"
                    value={formData.totalShares}
                    onChange={(e) => setFormData({...formData, totalShares: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="sector">Sector</Label>
                <Input
                  id="sector"
                  value={formData.sector}
                  onChange={(e) => setFormData({...formData, sector: e.target.value})}
                  placeholder="e.g., Technology, Healthcare"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief company description..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="prospectusUrl">Prospectus Document (Optional)</Label>
                <div className="space-y-2">
                  <Input
                    id="prospectusUrl"
                    value={formData.prospectusUrl}
                    onChange={(e) => setFormData({...formData, prospectusUrl: e.target.value})}
                    placeholder="https://example.com/prospectus.pdf or /docs/prospectus.pdf"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Or upload file:</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Simulate file upload
                        const fileName = `${formData.symbol || 'company'}-prospectus-${Date.now()}.pdf`
                        setFormData({...formData, prospectusUrl: `/docs/${fileName}`})
                      }}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Upload PDF
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter a URL, file path, or upload a prospectus document
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCompany ? 'Update' : 'Add'} Company
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className={!company.isActive ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{company.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{company.symbol}</Badge>
                    <Badge variant={company.isActive ? 'default' : 'secondary'}>
                      {company.isActive ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                </div>
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">IPO Price</p>
                  <p className="font-medium">RWF {company.ipoPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Current Price</p>
                  <p className="font-medium">RWF {company.currentPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Shares</p>
                  <p className="font-medium">{company.totalShares.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Sector</p>
                  <p className="font-medium">{company.sector}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">
                {company.description}
              </p>

              {company.prospectusUrl ? (
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <FileText className="h-4 w-4" />
                    <span>Prospectus Available</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(company.prospectusUrl, '_blank')}
                      className="text-xs"
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Simulate download
                        const link = document.createElement('a')
                        link.href = company.prospectusUrl!
                        link.download = `${company.symbol}-prospectus.pdf`
                        link.click()
                      }}
                      className="text-xs"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FileText className="h-4 w-4" />
                    <span>No Prospectus</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(company)}
                    className="text-xs"
                  >
                    Add
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={company.isActive}
                    onCheckedChange={() => toggleCompanyStatus(company.id)}
                  />
                  <span className="text-sm">
                    {company.isActive ? 'Trading' : 'Paused'}
                  </span>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(company)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(company.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}