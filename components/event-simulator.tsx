'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { 
  Zap, 
  Plus, 
  Play, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Newspaper,
  Building2,
  AlertTriangle
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

interface MarketEvent {
  id: string
  title: string
  type: 'earnings' | 'dividend' | 'news' | 'economic' | 'regulatory'
  affectedSymbols: string[]
  impact: 'positive' | 'negative' | 'neutral'
  magnitude: number // 1-10 scale
  description: string
  scheduledTime?: Date
  isActive: boolean
  priceImpact?: number
  volumeImpact?: number
}

const eventTypes = [
  { value: 'earnings', label: 'Earnings Announcement', icon: DollarSign },
  { value: 'dividend', label: 'Dividend Declaration', icon: TrendingUp },
  { value: 'news', label: 'Company News', icon: Newspaper },
  { value: 'economic', label: 'Economic News', icon: Building2 },
  { value: 'regulatory', label: 'Regulatory Change', icon: AlertTriangle }
]

const companies = ['BK', 'MTN', 'BRALIRWA', 'AGRITECH', 'BKG', 'CRYSTAL']

export function EventSimulator() {
  const [events, setEvents] = useState<MarketEvent[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [activeEvents, setActiveEvents] = useState<MarketEvent[]>([])

  const [formData, setFormData] = useState({
    title: '',
    type: 'news' as MarketEvent['type'],
    affectedSymbols: [] as string[],
    impact: 'neutral' as MarketEvent['impact'],
    magnitude: 5,
    description: '',
    scheduledTime: '',
    priceImpact: 0,
    volumeImpact: 0
  })

  useEffect(() => {
    // Mock data using actual Rwandan companies
    setEvents([
      {
        id: '1',
        title: 'Bank of Kigali Q4 Earnings Beat',
        type: 'earnings',
        affectedSymbols: ['BK'],
        impact: 'positive',
        magnitude: 8,
        description: 'Bank of Kigali reports Q4 earnings beating estimates with strong digital banking growth.',
        isActive: false,
        priceImpact: 5.2,
        volumeImpact: 150
      },
      {
        id: '2',
        title: 'Rwanda Central Bank Rate Decision',
        type: 'economic',
        affectedSymbols: ['BK', 'MTN', 'BRALIRWA', 'AGRITECH', 'BKG', 'CRYSTAL'],
        impact: 'negative',
        magnitude: 6,
        description: 'National Bank of Rwanda announces policy rate adjustment affecting market sentiment.',
        scheduledTime: new Date(Date.now() + 3600000),
        isActive: false,
        priceImpact: -2.1,
        volumeImpact: 200
      }
    ])
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newEvent: MarketEvent = {
      id: Date.now().toString(),
      title: formData.title,
      type: formData.type,
      affectedSymbols: formData.affectedSymbols,
      impact: formData.impact,
      magnitude: formData.magnitude,
      description: formData.description,
      scheduledTime: formData.scheduledTime ? new Date(formData.scheduledTime) : undefined,
      isActive: false,
      priceImpact: formData.priceImpact,
      volumeImpact: formData.volumeImpact
    }

    setEvents([...events, newEvent])
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'news',
      affectedSymbols: [],
      impact: 'neutral',
      magnitude: 5,
      description: '',
      scheduledTime: '',
      priceImpact: 0,
      volumeImpact: 0
    })
    setIsCreateDialogOpen(false)
  }

  const triggerEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId)
    if (event) {
      setEvents(events.map(e => 
        e.id === eventId ? { ...e, isActive: true } : e
      ))
      setActiveEvents([...activeEvents, { ...event, isActive: true }])
      
      // Simulate market impact
      console.log(`Triggering event: ${event.title}`)
      console.log(`Price impact: ${event.priceImpact}%`)
      console.log(`Volume impact: ${event.volumeImpact}%`)
    }
  }

  const stopEvent = (eventId: string) => {
    setEvents(events.map(e => 
      e.id === eventId ? { ...e, isActive: false } : e
    ))
    setActiveEvents(activeEvents.filter(e => e.id !== eventId))
  }

  const getEventIcon = (type: string) => {
    const eventType = eventTypes.find(t => t.value === type)
    return eventType ? eventType.icon : Newspaper
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-50'
      case 'negative': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="h-3 w-3" />
      case 'negative': return <TrendingDown className="h-3 w-3" />
      default: return null
    }
  }

  const quickEvents = [
    {
      title: 'Rwanda Market Rally',
      type: 'economic' as const,
      impact: 'positive' as const,
      magnitude: 7,
      description: 'Broad market rally due to positive GDP growth and infrastructure development',
      affectedSymbols: companies,
      priceImpact: 3.5
    },
    {
      title: 'Banking Sector Strength',
      type: 'news' as const,
      impact: 'positive' as const,
      magnitude: 6,
      description: 'Banking sector shows strong performance with digital transformation',
      affectedSymbols: ['BK', 'BKG'],
      priceImpact: 4.2
    },
    {
      title: 'Dividend Season',
      type: 'dividend' as const,
      impact: 'positive' as const,
      magnitude: 4,
      description: 'Multiple companies announce dividend increases',
      affectedSymbols: ['BRALIRWA', 'MTN'],
      priceImpact: 2.1
    }
  ]

  const triggerQuickEvent = (quickEvent: any) => {
    const event: MarketEvent = {
      id: Date.now().toString(),
      title: quickEvent.title,
      type: quickEvent.type,
      affectedSymbols: quickEvent.affectedSymbols,
      impact: quickEvent.impact,
      magnitude: quickEvent.magnitude,
      description: quickEvent.description,
      isActive: true,
      priceImpact: quickEvent.priceImpact,
      volumeImpact: Math.random() * 100 + 50
    }
    
    setEvents([...events, event])
    setActiveEvents([...activeEvents, event])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Event Simulator</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Market Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Event Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: MarketEvent['type']) => 
                      setFormData({...formData, type: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Affected Symbols</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {companies.map((symbol) => (
                      <Button
                        key={symbol}
                        type="button"
                        size="sm"
                        variant={formData.affectedSymbols.includes(symbol) ? 'default' : 'outline'}
                        onClick={() => {
                          const symbols = formData.affectedSymbols.includes(symbol)
                            ? formData.affectedSymbols.filter(s => s !== symbol)
                            : [...formData.affectedSymbols, symbol]
                          setFormData({...formData, affectedSymbols: symbols})
                        }}
                      >
                        {symbol}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="impact">Market Impact</Label>
                  <Select
                    value={formData.impact}
                    onValueChange={(value: MarketEvent['impact']) => 
                      setFormData({...formData, impact: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Event Magnitude</Label>
                  <span className="text-sm text-gray-600">{formData.magnitude}/10</span>
                </div>
                <Slider
                  value={[formData.magnitude]}
                  onValueChange={([value]) => setFormData({...formData, magnitude: value})}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priceImpact">Expected Price Impact (%)</Label>
                  <Input
                    id="priceImpact"
                    type="number"
                    step="0.1"
                    value={formData.priceImpact}
                    onChange={(e) => setFormData({...formData, priceImpact: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="volumeImpact">Expected Volume Impact (%)</Label>
                  <Input
                    id="volumeImpact"
                    type="number"
                    step="0.1"
                    value={formData.volumeImpact}
                    onChange={(e) => setFormData({...formData, volumeImpact: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Event Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the event and its expected market impact..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="scheduledTime">Scheduled Time (Optional)</Label>
                <Input
                  id="scheduledTime"
                  type="datetime-local"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Event
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Events */}
      {activeEvents.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Zap className="h-5 w-5" />
              Active Events ({activeEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Affecting: {event.affectedSymbols.join(', ')}</span>
                        <Badge className={getImpactColor(event.impact)}>
                          {getImpactIcon(event.impact)}
                          <span className="ml-1">{event.impact}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => stopEvent(event.id)}
                  >
                    Stop
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Events */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickEvents.map((event, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{event.title}</h4>
                  <Badge className={getImpactColor(event.impact)}>
                    {getImpactIcon(event.impact)}
                    <span className="ml-1">{event.impact}</span>
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {event.affectedSymbols.join(', ')}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => triggerQuickEvent(event)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Trigger
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Events */}
      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => {
              const EventIcon = getEventIcon(event.type)
              return (
                <div key={event.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <EventIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge variant="outline">
                            {eventTypes.find(t => t.value === event.type)?.label}
                          </Badge>
                          <Badge className={getImpactColor(event.impact)}>
                            {getImpactIcon(event.impact)}
                            <span className="ml-1">{event.impact}</span>
                          </Badge>
                          {event.isActive && (
                            <Badge className="bg-blue-100 text-blue-800">
                              Active
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Symbols: {event.affectedSymbols.join(', ')}</span>
                          <span>Magnitude: {event.magnitude}/10</span>
                          {event.priceImpact && (
                            <span>Price Impact: {event.priceImpact > 0 ? '+' : ''}{event.priceImpact}%</span>
                          )}
                          {event.scheduledTime && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {event.scheduledTime.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {event.isActive ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => stopEvent(event.id)}
                        >
                          Stop
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => triggerEvent(event.id)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Trigger
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}