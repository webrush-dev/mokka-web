'use client';

import { CountdownTimer } from './countdown-timer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Coffee, MapPin, Instagram, Facebook, Calendar } from 'lucide-react';

export function CountdownPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    consent: false,
  });

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
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-white border-mokka-tq/20">
            <CardHeader>
              <CardTitle className="text-mokka-tq">Coffee Tasting</CardTitle>
              <CardDescription>Петък 05.09 • 18:30 / 19:30</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-mokka-gy mb-4">24 места за дегустация на специализирани кафета</p>
              <Button className="w-full bg-mokka-tq hover:bg-mokka-tq/90">
                RSVP
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-mokka-br/20">
            <CardHeader>
              <CardTitle className="text-mokka-br">Launch Party</CardTitle>
              <CardDescription>Събота 06.09 • 17:00–20:00</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-mokka-gy mb-4">Празнуваме откриването с Mokka</p>
              <Button variant="outline" className="w-full border-mokka-br text-mokka-br hover:bg-mokka-br hover:text-white">
                Напомни ми
              </Button>
            </CardContent>
          </Card>
        </div>
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
  </div>
);
}
