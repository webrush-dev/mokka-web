'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar, X, Edit, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface RSVP {
  id: string
  name: string
  email: string
  phone?: string
  seats: number
  status: string
  reservationCode: string
  createdAt: string
  session: {
    id: string
    start: string
    end: string
    capacity: number
    reserved: number
    event: {
      title: string
    }
  }
}

interface RSVPManagerProps {
  isOpen: boolean
  onClose: () => void
}

export default function RSVPManager({ isOpen, onClose }: RSVPManagerProps) {
  const [step, setStep] = useState<'code' | 'manage'>('code')
  const [reservationCode, setReservationCode] = useState('')
  const [userRSVPs, setUserRSVPs] = useState<RSVP[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [action, setAction] = useState<'cancel' | 'modify'>('cancel')
  const [selectedRSVP, setSelectedRSVP] = useState<RSVP | null>(null)
  const [newSeats, setNewSeats] = useState(1)

  const handleReservationCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reservationCode.trim()) return

    setIsLoading(true)
    try {
      // Get all RSVPs and find the one with this reservation code
      const response = await fetch('/api/admin/rsvps')
      const data = await response.json()
      
      if (response.ok && data.success) {
        const allRSVPs = Object.values(data.data.organizedRSVPs)
          .flatMap((event) => {
            const eventData = event as Record<string, unknown>
            return Object.values(eventData.sessions as Record<string, unknown>)
              .flatMap((session) => {
                const sessionData = session as { 
                  session: { id: string; start: string; end: string; capacity: number; reserved: number };
                  rsvps: Array<{
                    id: string; name: string; email: string; phone?: string; seats: number; status: string; reservationCode: string; createdAt: string;
                  }>;
                }
                // Flatten RSVPs with session and event data
                return sessionData.rsvps.map(rsvp => ({
                  ...rsvp,
                  session: {
                    id: sessionData.session.id,
                    start: sessionData.session.start,
                    end: sessionData.session.end,
                    capacity: sessionData.session.capacity,
                    reserved: sessionData.session.reserved,
                    event: {
                      title: (eventData as { event: { title: string } }).event.title
                    }
                  }
                }))
              })
          })
        
        const foundRSVP = allRSVPs.find((rsvp: RSVP) => 
          rsvp.reservationCode === reservationCode.toUpperCase()
        )
        
        if (foundRSVP) {
          // Get all RSVPs for this user (by email)
          const userRSVPs = allRSVPs.filter((rsvp: RSVP) => 
            rsvp.email === foundRSVP.email
          )
          setUserRSVPs(userRSVPs)
          setStep('manage')
        } else {
          toast.error('Кодът за резервация не е намерен. Моля, проверете кода и опитайте отново.')
        }
      } else {
        toast.error('Възникна грешка при зареждането на резервациите')
      }
    } catch {
      toast.error('Възникна грешка при потърсването на резервацията')
    } finally {
      setIsLoading(false)
    }
  }



  const handleCancelAll = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/rsvp/public-manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationCode,
          action: 'cancel'
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        onClose()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Възникна грешка при отменянето')
    } finally {
      setIsLoading(false)
    }
  }

  const handleModify = async () => {
    if (!selectedRSVP || !newSeats) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/rsvp/public-manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationCode,
          action: 'modify',
          rsvpId: selectedRSVP.id,
          newSeats
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        onClose()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Възникна грешка при промяната')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-mokka-tq" />
              Управление на резервации
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Въведете вашия код за резервация, за да управлявате резервациите си
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Reservation Code Input */}
          {step === 'code' && (
            <form onSubmit={handleReservationCodeSubmit} className="space-y-4">
              <div>
                <Label htmlFor="reservationCode" className="text-mokka-gy font-medium">
                  Код за резервация *
                </Label>
                <Input
                  id="reservationCode"
                  type="text"
                  value={reservationCode}
                  onChange={(e) => setReservationCode(e.target.value.toUpperCase())}
                  placeholder="ABC12345"
                  className="mt-1 border-mokka-br/20 focus:border-mokka-tq font-mono text-center text-lg tracking-wider"
                  maxLength={8}
                  required
                />
                <p className="text-xs text-mokka-gy/60 mt-1">
                  Въведете 8-символния код, който сте получили при резервирането
                </p>
              </div>



              <Button
                type="submit"
                disabled={isLoading || !reservationCode.trim()}
                className="w-full bg-mokka-tq hover:bg-mokka-tq/90 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Търся резервация...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Намери резервацията
                  </>
                )}
              </Button>
            </form>
          )}




                  {/* Step 2: Manage RSVPs */}
        {step === 'manage' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium">Резервации намерени!</p>
                      <p className="mt-1">Код: <span className="font-mono font-bold">{reservationCode}</span></p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep('code')}
                    className="text-xs"
                  >
                    Промени код
                  </Button>
                </div>
              </div>

              {/* Action Selection */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAction('cancel')}
                  className={`flex-1 ${action === 'cancel' ? 'border-mokka-tq text-mokka-tq' : ''}`}
                >
                  <X className="w-4 h-4 mr-2" />
                  Отмени резервации
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAction('modify')}
                  className={`flex-1 ${action === 'modify' ? 'border-mokka-tq text-mokka-tq' : ''}`}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Промени резервации
                </Button>
              </div>

              {userRSVPs.map((rsvp) => (
                <Card key={rsvp.id} className="border-mokka-br/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{rsvp.session.event.title}</CardTitle>
                      <Badge 
                        variant={rsvp.status === 'CONFIRMED' ? 'default' : 'secondary'}
                        className={rsvp.status === 'CONFIRMED' ? 'bg-green-600' : ''}
                      >
                        {rsvp.status === 'CONFIRMED' ? 'Потвърдена' : 'Чакаща'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-mokka-gy/70">Име:</span>
                        <p className="font-medium">{rsvp.name}</p>
                      </div>
                      <div>
                        <span className="text-mokka-gy/70">Места:</span>
                        <p className="font-medium">{rsvp.seats}</p>
                      </div>
                      <div>
                        <span className="text-mokka-gy/70">Дата:</span>
                        <p className="font-medium">
                          {new Date(rsvp.session.start).toLocaleDateString('bg-BG')}
                        </p>
                      </div>
                      <div>
                        <span className="text-mokka-gy/70">Време:</span>
                        <p className="font-medium">
                          {new Date(rsvp.session.start).toLocaleTimeString('bg-BG', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>

                    {action === 'modify' && (
                      <div className="border-t pt-3">
                        <Label htmlFor={`seats-${rsvp.id}`} className="text-sm text-mokka-gy/70">
                          Нов брой места:
                        </Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            id={`seats-${rsvp.id}`}
                            type="number"
                            min="1"
                            max={rsvp.session.capacity - rsvp.session.reserved + rsvp.seats}
                            value={selectedRSVP?.id === rsvp.id ? newSeats : rsvp.seats}
                            onChange={(e) => {
                              setSelectedRSVP(rsvp)
                              setNewSeats(parseInt(e.target.value) || 1)
                            }}
                            className="w-20 border-mokka-br/20 focus:border-mokka-tq"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleModify()}
                            disabled={isLoading || !selectedRSVP || selectedRSVP.id !== rsvp.id}
                            className="bg-mokka-tq hover:bg-mokka-tq/90 text-white"
                          >
                            Промени
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {action === 'cancel' && (
                <div className="border-t pt-4">
                  <Button
                    onClick={handleCancelAll}
                    disabled={isLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Отменям...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Отмени всички резервации
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-mokka-gy/60 mt-2 text-center">
                    Внимание: Това действие не може да бъде отменено
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                                  onClick={() => setStep('code')}
                className="w-full"
              >
                Назад към началото
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
