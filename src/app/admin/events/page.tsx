'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, Users, Edit, Trash2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

interface Event {
  id: string
  slug: string
  title: string
  description: string
  isTicketed: boolean
  sessions: EventSession[]
}

interface EventSession {
  id: string
  start: string
  end: string
  capacity: number
  reserved: number
}

interface FormData {
  title: string
  description: string
  isTicketed: boolean
  sessions: {
    start: string
    end: string
    capacity: number
  }[]
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    isTicketed: false,
    sessions: [{ 
      start: '2025-01-20T14:00', // Fixed default date
      end: '2025-01-20T15:00',   // Fixed default date
      capacity: 12 
    }]
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  // Set form data when dialog opens
  useEffect(() => {
    if (isDialogOpen && !editingEvent) {
      // Opening dialog for new event - set default values
      setFormData({
        title: '',
        description: '',
        isTicketed: false,
        sessions: [{ 
          start: '2025-01-20T14:00', // Fixed default date
          end: '2025-01-20T15:00',   // Fixed default date
          capacity: 12 
        }]
      })
    }
  }, [isDialogOpen, editingEvent])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      } else {
        toast.error('Грешка при зареждане на събитията')
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Грешка при зареждане на събитията')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    if (!formData.title.trim()) {
      toast.error('Заглавието е задължително')
      return
    }
    
    if (!formData.description.trim()) {
      toast.error('Описанието е задължително')
      return
    }
    
    // Validate sessions
    for (let i = 0; i < formData.sessions.length; i++) {
      const session = formData.sessions[i]
      if (!session.start || !session.end) {
        toast.error(`Сесия ${i + 1}: Началното и крайното време са задължителни`)
        return
      }
      
      if (new Date(session.start) >= new Date(session.end)) {
        toast.error(`Сесия ${i + 1}: Крайното време трябва да е след началното`)
        return
      }
      
      if (session.capacity < 1) {
        toast.error(`Сесия ${i + 1}: Капацитетът трябва да е поне 1`)
        return
      }
    }
    
    try {
      const url = editingEvent ? `/api/admin/events/${editingEvent.id}` : '/api/admin/events'
      const method = editingEvent ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(editingEvent ? 'Събитието е обновено!' : 'Събитието е създадено!')
        setIsDialogOpen(false)
        resetForm()
        fetchEvents()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Грешка при запазване')
      }
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error('Грешка при запазване')
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете това събитие?')) return
    
    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Събитието е изтрито!')
        fetchEvents()
      } else {
        toast.error('Грешка при изтриване')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Грешка при изтриване')
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      isTicketed: event.isTicketed,
      sessions: event.sessions.map(s => ({
        start: new Date(s.start).toISOString().slice(0, 16),
        end: new Date(s.end).toISOString().slice(0, 16),
        capacity: s.capacity
      }))
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      isTicketed: false,
      sessions: [{ 
        start: '2025-01-20T14:00', // Fixed default date
        end: '2025-01-20T15:00',   // Fixed default date
        capacity: 12 
      }]
    })
    setEditingEvent(null)
  }

  const addSession = () => {
    const lastSession = formData.sessions[formData.sessions.length - 1]
    const lastEndTime = lastSession ? new Date(lastSession.end) : new Date('2025-01-20T15:00')
    
    setFormData(prev => ({
      ...prev,
      sessions: [...prev.sessions, { 
        start: lastEndTime.toISOString().slice(0, 16),
        end: new Date(lastEndTime.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16), // +1 hour from last session
        capacity: 12 
      }]
    }))
  }

  const removeSession = (index: number) => {
    if (formData.sessions.length > 1) {
      setFormData(prev => ({
        ...prev,
        sessions: prev.sessions.filter((_, i) => i !== index)
      }))
    }
  }

  const updateSession = (index: number, field: keyof typeof formData.sessions[0], value: string | number) => {
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.map((session, i) => 
        i === index ? { ...session, [field]: value } : session
      )
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-mokka-gy">Зареждане...</div>
      </div>
    )
  }



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-mokka-gy">Управление на събития</h1>
          <p className="text-mokka-gy/70">Създавайте и редактирайте събития и сесии</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingEvent(null)
              setIsDialogOpen(true)
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Ново събитие
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white border-mokka-tq/20 shadow-xl">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Редактиране на събитие' : 'Ново събитие'}
              </DialogTitle>
              <DialogDescription>
                Попълнете информацията за събитието и неговите сесии
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Заглавие</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="isTicketed">Тикетно събитие</Label>
                  <Select
                    value={formData.isTicketed.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, isTicketed: value === 'true' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Безплатно</SelectItem>
                      <SelectItem value="true">Платено</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Сесии</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSession}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добави сесия
                  </Button>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-mokka-gy/70 mb-2">
                    * Времето трябва да е в бъдещето. Използвайте формат ГГГГ-ММ-ДД ЧЧ:ММ
                  </p>
                  {formData.sessions.map((session, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 items-end">
                      <div>
                        <Label>Начало *</Label>
                        <Input
                          type="datetime-local"
                          value={session.start}
                          onChange={(e) => updateSession(index, 'start', e.target.value)}
                          required
                          className={!session.start ? 'border-red-500' : ''}
                        />
                      </div>
                      <div>
                        <Label>Край *</Label>
                        <Input
                          type="datetime-local"
                          value={session.end}
                          onChange={(e) => updateSession(index, 'end', e.target.value)}
                          required
                          className={!session.end ? 'border-red-500' : ''}
                        />
                      </div>
                      <div>
                        <Label>Капацитет *</Label>
                        <Input
                          type="number"
                          value={session.capacity}
                          onChange={(e) => updateSession(index, 'capacity', parseInt(e.target.value))}
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        {formData.sessions.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSession(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отказ
                </Button>
                <Button type="submit">
                  {editingEvent ? 'Обнови' : 'Създай'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {events.map((event) => (
          <Card key={event.id} className="border-mokka-tq/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-mokka-gy">{event.title}</CardTitle>
                  <CardDescription className="text-mokka-gy/70">
                    {event.description}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={event.isTicketed ? "default" : "secondary"}>
                    {event.isTicketed ? 'Платено' : 'Безплатно'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(event)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Редактирай
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(event.id)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Изтрий
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {event.sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-mokka-cr/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-mokka-gy/70">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {(() => {
                            try {
                              return new Date(session.start).toLocaleDateString('bg-BG')
                            } catch (e) {
                              return session.start.split('T')[0] || 'Invalid date'
                            }
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-mokka-gy/70">
                        <Clock className="w-4 h-4" />
                        <span>
                          {(() => {
                            try {
                              const startTime = new Date(session.start).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })
                              const endTime = new Date(session.end).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })
                              return `${startTime} - ${endTime}`
                            } catch (e) {
                              return `${session.start.split('T')[1]?.slice(0, 5) || '00:00'} - ${session.end.split('T')[1]?.slice(0, 5) || '00:00'}`
                            }
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-mokka-gy/70">
                        <Users className="w-4 h-4" />
                        <span>{session.reserved}/{session.capacity}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="border-mokka-tq text-mokka-tq">
                        {session.capacity} места
                      </Badge>
                      <Badge variant="default" className="bg-mokka-tq text-white">
                        {session.reserved} резервирани
                      </Badge>
                      <Badge variant="outline" className="border-green-500 text-green-600">
                        {session.capacity - session.reserved} свободни
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
