'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface EventSession {
  id: string
  start: string
  end: string
  capacity: number
  reserved: number
}

interface RSVPModalProps {
  isOpen: boolean
  onClose: () => void
  session: EventSession | null
  eventTitle?: string
  onRSVPSuccess: () => void
}

export default function RSVPModal({ isOpen, onClose, session, eventTitle, onRSVPSuccess }: RSVPModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    seats: 1
  })

  // Clear error message when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null)
    }
  }, [isOpen])

  const availableSeats = session ? session.capacity - session.reserved : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) return

    console.log('RSVP Form Data:', formData)
    console.log('Available Seats:', availableSeats)
    console.log('Session:', session)

    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Моля, въведете вашето име')
      return
    }
    
    if (!formData.email.trim()) {
      toast.error('Моля, въведете вашия имейл')
      return
    }

    if (formData.seats > availableSeats) {
      toast.error(`Няма достатъчно свободни места. Доступни: ${availableSeats}`)
      return
    }



    setIsSubmitting(true)

    try {
      const requestBody = {
        ...formData,
        sessionId: session.id,
        locale: 'bg'
      }
      console.log('Sending RSVP request:', requestBody)
      
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (response.ok) {
        const reservationCode = data.reservationCode
        toast.success(
          <div>
            <p>{data.message || 'Резервацията е направена успешно!'}</p>
            <p className="text-sm mt-1">Код за резервация: <span className="font-mono font-bold">{reservationCode}</span></p>
          </div>
        )
        onClose()
        // Reset form
        setFormData({ name: '', email: '', phone: '', seats: 1 })
        // Refresh landing page data to show updated availability
        onRSVPSuccess()
      } else {
        const errorMsg = data.error || 'Възникна грешка при резервирането'
        setErrorMessage(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      console.error('RSVP submission error:', error)
      const errorMsg = 'Възникна грешка при резервирането'
      setErrorMessage(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage(null)
    }
  }

  if (!session) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-mokka-tq/20 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-mokka-gy flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-mokka-tq" />
            Резервирай място за дегустация
          </DialogTitle>
          <DialogDescription className="text-mokka-gy/70">
            {eventTitle} - {new Date(session.start).toLocaleDateString('bg-BG', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Session Info */}
          <div className="bg-mokka-cr/30 p-4 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-mokka-gy/70">Време:</span>
              <span className="font-medium text-mokka-gy">
                {new Date(session.start).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })} - 
                {new Date(session.end).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-mokka-gy/70">Свободни места:</span>
              <span className={`font-medium ${availableSeats > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {availableSeats} от {session.capacity}
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
              placeholder="Въведете вашето име"
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
              placeholder="ваш@имейл.com"
              className="mt-1 border-mokka-br/20 focus:border-mokka-tq"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone" className="text-mokka-gy font-medium">
              Телефон (по желание)
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+359 888 123 456"
              className="mt-1 border-mokka-br/20 focus:border-mokka-tq"
            />
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
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1
                const clampedValue = Math.min(Math.max(value, 1), availableSeats)
                handleInputChange('seats', clampedValue)
              }}
              className="mt-1 border-mokka-br/20 focus:border-mokka-tq"
              required
            />
            <p className="text-xs text-mokka-gy/60 mt-1">
              Доступни места: {availableSeats} | Можете да резервирате до {availableSeats} места
            </p>
            {formData.seats > availableSeats && (
              <p className="text-xs text-red-600 mt-1">
                Няма достатъчно свободни места
              </p>
            )}
          </div>

          {/* Error Message Display */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Грешка при резервирането
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{errorMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Важно:</p>
                <ul className="mt-1 space-y-1">
                  <li>• Резервацията е безплатна</li>
                  <li>• Мястото се запазва за 15 минути след началото</li>
                  <li>• При нужда от отказ, моля уведомете ни поне 24ч преди</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto border-mokka-br text-mokka-br hover:bg-mokka-br hover:text-white"
              disabled={isSubmitting}
            >
              Отказ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || availableSeats === 0 || formData.seats > availableSeats}
              className="w-full sm:w-auto bg-mokka-tq hover:bg-mokka-tq/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Резервирам...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Резервирай място
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
