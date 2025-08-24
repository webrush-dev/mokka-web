'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Edit, Save, X } from 'lucide-react'
import { toast } from 'sonner'

interface EventSession {
  id: string
  start: string
  end: string
  capacity: number
  reserved: number
  event: {
    title: string
  }
}

interface RSVP {
  id: string
  name: string
  email: string
  phone?: string
  seats: number
  status: string
  reservationCode: string
  sessionId: string
  createdAt: string
  session: EventSession
}

interface RSVPEditModalProps {
  isOpen: boolean
  onClose: () => void
  rsvp: RSVP | null
  sessions: EventSession[]
  onRSVPUpdated: () => void
}

export default function RSVPEditModal({ isOpen, onClose, rsvp, sessions, onRSVPUpdated }: RSVPEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    seats: 1,
    status: 'PENDING' as 'PENDING' | 'CONFIRMED' | 'CANCELLED',
    sessionId: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [availableSeats, setAvailableSeats] = useState(0)

  useEffect(() => {
    if (rsvp) {
      setFormData({
        name: rsvp.name,
        email: rsvp.email,
        phone: rsvp.phone || '',
        seats: rsvp.seats,
        status: rsvp.status as 'PENDING' | 'CONFIRMED' | 'CANCELLED',
        sessionId: rsvp.sessionId
      })
      
      // Calculate available seats for current session
      const currentSession = sessions.find(s => s.id === rsvp.sessionId)
      if (currentSession) {
        // For editing, available seats should be: capacity - (reserved - current RSVP seats)
        // This gives us the actual available capacity including the current RSVP
        const otherReserved = currentSession.reserved - rsvp.seats
        const available = currentSession.capacity - otherReserved
        setAvailableSeats(available)
        console.log('Available seats calculation:', {
          capacity: currentSession.capacity,
          reserved: currentSession.reserved,
          currentRSVPSeats: rsvp.seats,
          otherReserved,
          available
        })
      }
    }
  }, [rsvp, sessions])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Update available seats when session changes
    if (field === 'sessionId') {
      const selectedSession = sessions.find(s => s.id === value)
      if (selectedSession) {
        // When changing sessions, available seats = capacity - reserved + seats being moved
        const available = selectedSession.capacity - selectedSession.reserved + formData.seats
        setAvailableSeats(available)
        console.log('Session change - Available seats:', {
          capacity: selectedSession.capacity,
          reserved: selectedSession.reserved,
          seatsBeingMoved: formData.seats,
          available
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rsvp) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/rsvps/${rsvp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        onRSVPUpdated()
        onClose()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Възникна грешка при обновяването')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!rsvp || !confirm('Сигурни ли сте, че искате да изтриете тази резервация?')) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/rsvps/${rsvp.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        onRSVPUpdated()
        onClose()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Възникна грешка при изтриването')
    } finally {
      setIsLoading(false)
    }
  }

  if (!rsvp) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-mokka-tq/20 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-mokka-gy flex items-center">
            <Edit className="w-5 h-5 mr-2 text-mokka-tq" />
            Редактирай резервация
          </DialogTitle>
          <DialogDescription className="text-mokka-gy/70">
            Код: {rsvp.reservationCode}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reservation Code Display */}
          <div className="bg-mokka-cr/30 p-3 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-mokka-gy/70">Код за резервация:</span>
              <span className="font-mono font-bold text-mokka-tq bg-white px-2 py-1 rounded">
                {rsvp.reservationCode}
              </span>
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-mokka-gy font-medium">
              Име *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="mt-1 border-mokka-br/20 focus:border-mokka-tq"
              required
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-mokka-gy font-medium">
              Имейл *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="mt-1 border-mokka-br/20 focus:border-mokka-tq"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone" className="text-mokka-gy font-medium">
              Телефон
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="mt-1 border-mokka-br/20 focus:border-mokka-tq"
            />
          </div>

          {/* Session Selection */}
          <div>
            <Label htmlFor="session" className="text-mokka-gy font-medium">
              Сесия *
            </Label>
            <Select
              value={formData.sessionId}
              onValueChange={(value) => handleInputChange('sessionId', value)}
            >
              <SelectTrigger className="mt-1 border-mokka-br/20 focus:border-mokka-tq">
                <SelectValue placeholder="Избери сесия" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {session.event.title} - {new Date(session.start).toLocaleDateString('bg-BG')} {new Date(session.start).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}
                      <span className="text-xs text-mokka-gy/60">
                        ({session.capacity - session.reserved} места)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seats */}
          <div>
            <Label htmlFor="seats" className="text-mokka-gy font-medium">
              Брой места *
            </Label>
            <Input
              id="seats"
              type="number"
              min="1"
              max={availableSeats}
              value={formData.seats}
              onChange={(e) => handleInputChange('seats', parseInt(e.target.value) || 1)}
              className="mt-1 border-mokka-br/20 focus:border-mokka-tq"
              required
            />
            <p className="text-xs text-mokka-gy/60 mt-1">
              Доступни места: {availableSeats}
            </p>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status" className="text-mokka-gy font-medium">
              Статус *
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value as 'PENDING' | 'CONFIRMED' | 'CANCELLED')}
            >
              <SelectTrigger className="mt-1 border-mokka-br/20 focus:border-mokka-tq">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Чакаща</SelectItem>
                <SelectItem value="CONFIRMED">Потвърдена</SelectItem>
                <SelectItem value="CANCELLED">Отменена</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <DialogFooter className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Отказ
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Изтрий
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-mokka-tq hover:bg-mokka-tq/90 text-white"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Запазвам...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Запази
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
