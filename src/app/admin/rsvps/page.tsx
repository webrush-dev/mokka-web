'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Users, Clock, Mail, Phone, Search, Download, Eye, Edit } from 'lucide-react'
import { toast } from 'sonner'
import RSVPEditModal from '@/components/admin/rsvp-edit-modal'

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
  session: {
    id: string
    start: string
    end: string
    capacity: number
    reserved: number
    event: {
      title: string
      slug: string
    }
  }
}

interface OrganizedRSVPs {
  [eventSlug: string]: {
    event: {
      id: string
      slug: string
      title: string
    }
    sessions: {
      [sessionId: string]: {
        session: {
          id: string
          start: string
          end: string
          capacity: number
          reserved: number
        }
        rsvps: RSVP[]
      }
    }
  }
}

interface SummaryStats {
  totalRSVPs: number
  totalSeats: number
  confirmedRSVPs: number
  pendingRSVPs: number
  cancelledRSVPs: number
}

export default function AdminRSVPsPage() {
  const [rsvps, setRsvps] = useState<OrganizedRSVPs>({})
  const [summary, setSummary] = useState<SummaryStats>({
    totalRSVPs: 0,
    totalSeats: 0,
    confirmedRSVPs: 0,
    pendingRSVPs: 0,
    cancelledRSVPs: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedRSVP, setSelectedRSVP] = useState<RSVP | null>(null)

  useEffect(() => {
    fetchRSVPs()
  }, [])

  const fetchRSVPs = async () => {
    try {
      const response = await fetch('/api/admin/rsvps')
      const data = await response.json()

      if (data.success) {
        setRsvps(data.data.organizedRSVPs)
        setSummary(data.data.summary)
      } else {
        toast.error('Грешка при зареждането на резервациите')
      }
    } catch (error) {
      toast.error('Възникна грешка при зареждането на данните')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditRSVP = (rsvp: RSVP) => {
    setSelectedRSVP(rsvp)
    setIsEditModalOpen(true)
  }

  const handleRSVPUpdated = () => {
    fetchRSVPs()
  }

  const exportToCSV = () => {
    const csvData = Object.values(rsvps).flatMap(event =>
      Object.values(event.sessions).flatMap(session =>
        session.rsvps.map(rsvp => ({
          'Event': event.event.title,
          'Date': new Date(session.session.start).toLocaleDateString('bg-BG'),
          'Time': `${new Date(session.session.start).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })} - ${new Date(session.session.end).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}`,
          'Name': rsvp.name,
          'Email': rsvp.email,
          'Phone': rsvp.phone || '',
          'Seats': rsvp.seats,
          'Status': rsvp.status === 'CONFIRMED' ? 'Потвърдена' : rsvp.status === 'PENDING' ? 'Чакаща' : 'Отменена',
          'ReservationCode': rsvp.reservationCode,
          'Created': new Date(rsvp.createdAt).toLocaleDateString('bg-BG')
        }))
      )
    ) as Array<Record<string, string | number>>

    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `rsvps-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-600'
      case 'PENDING':
        return 'bg-yellow-600'
      case 'CANCELLED':
        return 'bg-red-600'
      default:
        return 'bg-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Потвърдена'
      case 'PENDING':
        return 'Чакаща'
      case 'CANCELLED':
        return 'Отменена'
      default:
        return status
    }
  }

  const filteredRSVPs = Object.values(rsvps).map(event => ({
    ...event,
    sessions: Object.values(event.sessions).map(session => ({
      ...session,
      rsvps: session.rsvps.filter(rsvp => {
        const matchesSearch = 
          rsvp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rsvp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (rsvp.phone && rsvp.phone.includes(searchTerm))
        
        const matchesStatus = filterStatus === 'all' || rsvp.status === filterStatus
        
        return matchesSearch && matchesStatus
      })
    })).filter(session => session.rsvps.length > 0)
  })).filter(event => event.sessions.length > 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mokka-tq"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-mokka-gy mb-2">Управление на резервации</h1>
        <p className="text-mokka-gy/70">Преглед и управление на всички RSVP резервации</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-mokka-gy/70">Общо резервации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-mokka-gy">{summary.totalRSVPs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-mokka-gy/70">Общо места</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-mokka-gy">{summary.totalSeats}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-mokka-gy/70">Потвърдени</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.confirmedRSVPs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-mokka-gy/70">Чакащи</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.pendingRSVPs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-mokka-gy/70">Отменени</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.cancelledRSVPs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Label htmlFor="search" className="text-sm text-mokka-gy/70">Търсене</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mokka-gy/40 w-4 h-4" />
            <Input
              id="search"
              placeholder="Търси по име, имейл или телефон..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-mokka-br/20 focus:border-mokka-tq"
            />
          </div>
        </div>

        <div className="sm:w-48">
          <Label htmlFor="status" className="text-sm text-mokka-gy/70">Статус</Label>
          <select
            id="status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="mt-1 w-full border border-mokka-br/20 rounded-md px-3 py-2 focus:border-mokka-tq focus:outline-none"
          >
            <option value="all">Всички</option>
            <option value="CONFIRMED">Потвърдени</option>
            <option value="PENDING">Чакащи</option>
            <option value="CANCELLED">Отменени</option>
          </select>
        </div>

        <div className="sm:w-auto">
          <Label className="text-sm text-mokka-gy/70">&nbsp;</Label>
          <Button
            onClick={exportToCSV}
            className="w-full sm:w-auto bg-mokka-tq hover:bg-mokka-tq/90 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Експорт CSV
          </Button>
        </div>
      </div>

      {/* RSVPs List */}
      <div className="space-y-6">
        {filteredRSVPs.map((event) => (
          <Card key={event.event.slug} className="border-mokka-br/20">
            <CardHeader>
              <CardTitle className="text-xl text-mokka-gy flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-mokka-tq" />
                {event.event.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {event.sessions.map((session) => (
                <div key={session.session.id} className="border border-mokka-br/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-mokka-gy/70">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(session.session.start).toLocaleDateString('bg-BG')} - {new Date(session.session.start).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {session.session.reserved}/{session.session.capacity} места
                      </div>
                    </div>
                  </div>

                  {session.rsvps.length > 0 ? (
                    <div className="grid gap-3">
                      {session.rsvps.map((rsvp) => (
                                                 <div
                           key={rsvp.id}
                           className="flex items-center justify-between p-3 bg-mokka-cr/30 rounded-lg"
                         >
                           <div className="flex-1">
                             <div className="flex items-center gap-3 mb-2">
                               <h4 className="font-medium text-mokka-gy">{rsvp.name}</h4>
                               <Badge className={getStatusColor(rsvp.status)}>
                                 {getStatusText(rsvp.status)}
                               </Badge>
                               <span className="text-sm text-mokka-gy/70">
                                 {rsvp.seats} {rsvp.seats === 1 ? 'място' : 'места'}
                               </span>
                             </div>
                             <div className="flex items-center gap-4 text-sm text-mokka-gy/60">
                               <div className="flex items-center gap-1">
                                 <Mail className="w-3 h-3" />
                                 {rsvp.email}
                               </div>
                               {rsvp.phone && (
                                 <div className="flex items-center gap-1">
                                   <Phone className="w-3 h-3" />
                                   {rsvp.phone}
                                 </div>
                               )}
                               <div className="text-xs">
                                 {new Date(rsvp.createdAt).toLocaleDateString('bg-BG')} {new Date(rsvp.createdAt).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}
                               </div>
                             </div>
                             {/* Reservation Code */}
                             <div className="mt-2 flex items-center gap-2">
                               <span className="text-xs text-mokka-gy/50">Код:</span>
                               <span className="font-mono text-xs bg-white px-2 py-1 rounded border border-mokka-br/20">
                                 {rsvp.reservationCode}
                               </span>
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                             <Button
                               size="sm"
                               variant="outline"
                               onClick={() => handleEditRSVP(rsvp)}
                               className="text-mokka-tq border-mokka-tq hover:bg-mokka-tq hover:text-white"
                             >
                               <Edit className="w-4 h-4" />
                             </Button>
                           </div>
                         </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-mokka-gy/50 py-4">
                      Няма резервации за тази сесия
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {filteredRSVPs.length === 0 && (
          <Card className="border-mokka-br/20">
            <CardContent className="py-12">
              <div className="text-center text-mokka-gy/50">
                <Eye className="w-12 h-12 mx-auto mb-4 text-mokka-gy/30" />
                <p className="text-lg">Няма намерени резервации</p>
                <p className="text-sm">Опитайте да промените критериите за търсене</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* RSVP Edit Modal */}
      <RSVPEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedRSVP(null)
        }}
        rsvp={selectedRSVP}
        sessions={Object.values(rsvps).flatMap(event => 
          Object.values(event.sessions).map(session => ({
            id: session.session.id,
            start: session.session.start,
            end: session.session.end,
            capacity: session.session.capacity,
            reserved: session.session.reserved,
            event: { title: event.event.title }
          }))
        )}
        onRSVPUpdated={handleRSVPUpdated}
      />
    </div>
  )
}
