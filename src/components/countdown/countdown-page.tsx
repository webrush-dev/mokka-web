'use client';

import { CountdownTimer } from './countdown-timer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Coffee, MapPin, Instagram, Facebook, Calendar, Clock } from 'lucide-react';
import RSVPModal from '../landing/rsvp-modal';
import { toast } from 'sonner';

// Types for events
interface EventSession {
  id: string;
  start: string;
  end: string;
  capacity: number;
  reserved: number;
}

interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  isTicketed: boolean;
  sessions: EventSession[];
}

export function CountdownPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    consent: false,
  });

  // Events state
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  
  // Modal states
  const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedSession, setSelectedSession] = useState<EventSession | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/admin/events');
        if (response.ok) {
          const data = await response.json();
          // The API returns { events: [...] }, so we need to access data.events
          setEvents(data.events || []);
        } else {
          console.error('Failed to fetch events');
          setEvents([]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle RSVP button click
  const handleRSVPClick = (event: Event) => {
    setSelectedEvent(event);
    // If event has multiple sessions, show session selection
    if (event.sessions && event.sessions.length > 1) {
      // For now, just select the first available session
      // In the future, we could show a session picker modal
      const availableSession = event.sessions.find(s => s.capacity > s.reserved);
      setSelectedSession(availableSession || event.sessions[0]);
    } else if (event.sessions && event.sessions.length === 1) {
      setSelectedSession(event.sessions[0]);
    }
    setIsRSVPModalOpen(true);
  };

  // Handle notification button click
  const handleNotificationClick = (event: Event) => {
    setSelectedEvent(event);
    setIsNotificationModalOpen(true);
  };

  // Handle RSVP success
  const handleRSVPSuccess = () => {
    // Refresh events to update availability
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          consentMarketing: formData.consent,
          source: 'waitlist',
          locale: 'bg',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Ще ти пишем с първи новини + Sunset Sips на 01.09');
        setFormData({ name: '', email: '', phone: '', consent: false });
      } else {
        alert(result.error || 'Възникна грешка при обработката');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Възникна грешка при обработката');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mokka-cr to-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background placeholder - replace with actual image/video */}
        <div className="absolute inset-0 bg-gradient-to-br from-mokka-br/20 to-mokka-tq/20" />
        <div className="absolute inset-0 bg-black/10" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-mokka-gy mb-6">
            Mokka идва в Тракия
          </h1>
          <p className="text-xl md:text-2xl text-mokka-gy/90 mb-8 max-w-2xl mx-auto">
            Ново управление. Откриване <strong>01.09</strong>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-mokka-tq hover:bg-mokka-tq/90 text-white px-8 py-3 text-lg">
              Присъедини се към списъка
            </Button>
            <Button size="lg" variant="outline" className="border-mokka-br text-mokka-br hover:bg-mokka-br hover:text-white px-8 py-3 text-lg">
              Напомни ми за партито 06.09
            </Button>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="py-20 px-4">
        <CountdownTimer />
      </section>

      {/* What's New Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-mokka-gy text-center mb-12">
            Какво е ново
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-mokka-tq/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-8 h-8 text-mokka-tq" />
              </div>
              <h3 className="font-semibold text-mokka-gy mb-2">Ново управление</h3>
              <p className="text-sm text-mokka-gy/70">По-висок стандарт на кафе</p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-mokka-br/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-8 h-8 text-mokka-br" />
              </div>
              <h3 className="font-semibold text-mokka-gy mb-2">По-добро меню</h3>
              <p className="text-sm text-mokka-gy/70">Специализирани кафета</p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-mokka-tq/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-8 h-8 text-mokka-tq" />
              </div>
              <h3 className="font-semibold text-mokka-gy mb-2">Изпечени в България</h3>
              <p className="text-sm text-mokka-gy/70">Свежи вкусове</p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-mokka-br/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-8 h-8 text-mokka-br" />
              </div>
              <h3 className="font-semibold text-mokka-gy mb-2">Вечерни комбинации</h3>
              <p className="text-sm text-mokka-gy/70">Spritz + бира</p>
            </Card>
        </div>
      </div>
    </section>

    {/* Events Teaser */}
    <section className="py-20 px-4 bg-mokka-cr/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-mokka-gy text-center mb-12">
          Събития
        </h2>
        
        {isLoadingEvents ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mokka-tq mx-auto mb-4"></div>
            <p className="text-mokka-gy/70">Зареждане на събития...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {events.map((event) => (
              <Card 
                key={event.id} 
                className={`bg-white ${
                  event.slug === 'coffee-tasting' 
                    ? 'border-mokka-tq/20' 
                    : 'border-mokka-br/20'
                }`}
              >
                <CardHeader>
                  <CardTitle className={
                    event.slug === 'coffee-tasting' ? 'text-mokka-tq' : 'text-mokka-br'
                  }>
                    {event.title}
                  </CardTitle>
                  <CardDescription>
                                            {event.sessions?.length > 0 && (
                          <div className="space-y-1">
                            {event.sessions.map((session: EventSession) => (
                              <div key={session.id} className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {new Date(session.start).toLocaleDateString('bg-BG', {
                                    weekday: 'long',
                                    month: 'numeric',
                                    day: 'numeric'
                                  })} • {new Date(session.start).toLocaleTimeString('bg-BG', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}–{new Date(session.end).toLocaleTimeString('bg-BG', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-mokka-gy mb-4">{event.description}</p>
                  
                  {/* Show availability for Coffee Tasting */}
                  {event.slug === 'coffee-tasting' && event.sessions && (
                    <div className="mb-4 p-3 bg-mokka-cr/30 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-mokka-gy/70">Доступни места:</span>
                        <span className="font-semibold text-mokka-tq">
                          {event.sessions.reduce((total: number, session: EventSession) => 
                            total + (session.capacity - session.reserved), 0
                          )} / {event.sessions.reduce((total: number, session: EventSession) => 
                            total + session.capacity, 0
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {event.slug === 'coffee-tasting' ? (
                      <Button 
                        className="w-full bg-mokka-tq hover:bg-mokka-tq/90 text-white"
                        onClick={() => handleRSVPClick(event)}
                      >
                        RSVP
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full border-mokka-br text-mokka-br hover:bg-mokka-br hover:text-white"
                        onClick={() => handleNotificationClick(event)}
                      >
                        Напомни ми
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>

    {/* Sign-up Panel */}
    <section className="py-20 px-4 bg-white">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-mokka-gy text-center mb-8">
          Присъедини се
        </h2>
        <p className="text-center text-mokka-gy/80 mb-8">
          Бъди първият, който ще узнае за откриването
        </p>
        
        <Card className="bg-mokka-cr/30 border-mokka-br/20">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-mokka-gy">Име (по желание)</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-mokka-gy">Имейл *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-mokka-gy">Телефон (по желание)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-2"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  required
                  className="rounded border-mokka-br text-mokka-tq focus:ring-mokka-tq"
                />
                <Label htmlFor="consent" className="text-sm text-mokka-gy">
                  Съгласен съм да получавам маркетингови съобщения
                </Label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-mokka-tq hover:bg-mokka-tq/90 text-white py-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Изпращане...' : 'Присъедини се'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>

    {/* Location */}
    <section className="py-20 px-4 bg-mokka-cr/30">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-mokka-gy mb-8">
          Къде да ни намериш
        </h2>
        
        <Card className="bg-white border-mokka-br/20 mb-8">
          <CardContent className="p-8">
            <div className="w-full h-64 bg-mokka-gy/10 rounded-lg mb-6 flex items-center justify-center">
              <MapPin className="w-16 h-16 text-mokka-gy/40" />
              <p className="text-mokka-gy/60 ml-4">Карта ще бъде добавена</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-mokka-gy">Mokka Coffee</h3>
              <p className="text-mokka-gy/80">Тракия, Пловдив</p>
              <p className="text-mokka-gy/80">България</p>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" className="border-mokka-br text-mokka-br hover:bg-mokka-br hover:text-white">
            Google Maps
          </Button>
          <Button variant="outline" className="border-mokka-br text-mokka-br hover:bg-mokka-br hover:text-white">
            Apple Maps
          </Button>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="py-12 px-4 bg-mokka-gy text-white">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex justify-center space-x-6 mb-6">
          <a href="#" className="hover:text-mokka-tq transition-colors">
            <Instagram className="w-6 h-6" />
          </a>
          <a href="#" className="hover:text-mokka-tq transition-colors">
            <Facebook className="w-6 h-6" />
          </a>
          <a href="#" className="hover:text-mokka-tq transition-colors">
            <Calendar className="w-6 h-6" />
          </a>
        </div>
        
        <div className="text-sm text-mokka-cr/80 space-y-2">
          <p>© 2025 Mokka Coffee. Всички права запазени.</p>
          <p>
            <a href="#" className="hover:text-mokka-tq transition-colors">Политика за поверителност</a>
            {' • '}
            <a href="#" className="hover:text-mokka-tq transition-colors">Бисквитки</a>
          </p>
        </div>
      </div>
    </footer>

    {/* RSVP Modal */}
    {selectedEvent && selectedSession && (
      <RSVPModal
        isOpen={isRSVPModalOpen}
        onClose={() => {
          setIsRSVPModalOpen(false);
          setSelectedEvent(null);
          setSelectedSession(null);
        }}
        eventTitle={selectedEvent.title}
        session={selectedSession}
        onRSVPSuccess={handleRSVPSuccess}
      />
    )}

    {/* Notification Modal */}
    {isNotificationModalOpen && selectedEvent && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl text-mokka-gy">
              Напомняне за {selectedEvent.title}
            </CardTitle>
            <CardDescription>
              Ще ти изпратим напомняне преди събитието
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const email = formData.get('email') as string;
              const phone = formData.get('phone') as string;
              
              try {
                const response = await fetch('/api/notify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email,
                    phone,
                    event: selectedEvent.slug,
                    locale: 'bg'
                  })
                });
                
                if (response.ok) {
                  toast.success('Ще ти изпратим напомняне!');
                  setIsNotificationModalOpen(false);
                  setSelectedEvent(null);
                } else {
                  const data = await response.json();
                  toast.error(data.error || 'Възникна грешка');
                }
              } catch (error) {
                toast.error('Възникна грешка при обработката');
              }
            }} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-mokka-gy">Имейл *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-mokka-gy">Телефон (по желание)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsNotificationModalOpen(false);
                    setSelectedEvent(null);
                  }}
                  className="flex-1"
                >
                  Отказ
                </Button>
                <Button type="submit" className="flex-1 bg-mokka-br hover:bg-mokka-br/90 text-white">
                  Изпрати
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )}
  </div>
);
}
