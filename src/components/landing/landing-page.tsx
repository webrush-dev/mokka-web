'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Phone, Clock, Instagram, Facebook, Mail, ArrowRight, Star, Coffee, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import RSVPModal from './rsvp-modal';
import RSVPManager from '../rsvp/rsvp-manager';
import ImageSlideshow from './image-slideshow';


// Types
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

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

interface BusinessHours {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  note?: string;
}

interface Holiday {
  id: string;
  date: string;
  description: string;
}

export default function LandingPage() {
  // State
  const [events, setEvents] = useState<Event[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isRSVPManagerOpen, setIsRSVPManagerOpen] = useState(false);
  
  // Carousel items data
  const carouselItems = [
    {
      id: 1,
      title: "Продукт 1",
      description: "Описание на продукт 1",
      altText: "Продукт 1",
      imagePath: "/images/1.png",
      start: true
    },
    {
      id: 2,
      title: "Продукт 2",
      description: "Описание на продукт 2",
      altText: "Продукт 2",
      imagePath: "/images/2.png",
      start: false
    },
    {
      id: 3,
      title: "Продукт 3",
      description: "Описание на продукт 3",
      altText: "Продукт 3",
      imagePath: "/images/3.png",
      start: false
    },
    {
      id: 4,
      title: "Продукт 4",
      description: "Описание на продукт 4",
      altText: "Продукт 4",
      imagePath: "/images/4.png",
      start: false
    },
    {
      id: 5,
      title: "Продукт 5",
      description: "Описание на продукт 5",
      altText: "Продукт 5",
      imagePath: "/images/5.png",
      start: false
    },
    {
      id: 6,
      title: "Продукт 6",
      description: "Описание на продукт 6",
      altText: "Продукт 6",
      imagePath: "/images/6.png",
      start: false
    },
    {
      id: 7,
      title: "Продукт 7",
      description: "Описание на продукт 7",
      altText: "Продукт 7",
      imagePath: "/images/7.png",
      start: false
    },
    {
      id: 8,
      title: "Продукт 8",
      description: "Описание на продукт 8",
      altText: "Продукт 8",
      imagePath: "/images/8.png",
      start: false
    },
    {
      id: 9,
      title: "Продукт 9",
      description: "Описание на продукт 9",
      altText: "Продукт 9",
      imagePath: "/images/9.png",
      start: false
    },
    {
      id: 10,
      title: "Продукт 10",
      description: "Описание на продукт 10",
      altText: "Продукт 10",
      imagePath: "/images/10.png",
      start: false
    }
  ];
  
  
  
  

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, menuRes, hoursRes, holidaysRes] = await Promise.all([
          fetch('/api/admin/events'),
          fetch('/api/admin/menu'),
          fetch('/api/admin/settings/hours'),
          fetch('/api/admin/settings/holidays')
        ]);

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData.events || []);
        }
        
        if (menuRes.ok) {
          const menuData = await menuRes.json();
          // The API returns { menuItems: [...] }, so we need to access menuData.menuItems
          setMenuItems(menuData.menuItems || []);
        }
        
        if (hoursRes.ok) {
          const hoursData = await hoursRes.json();
          // The API returns { businessHours: [...] }, so we need to access hoursData.businessHours
          setBusinessHours(hoursData.businessHours || []);
        }
        
        if (holidaysRes.ok) {
          const holidaysData = await holidaysRes.json();
          // The API returns { holidays: [...] }, so we need to access holidaysData.holidays
          setHolidays(holidaysData.holidays || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);



  // Handle RSVP
  const handleRSVPClick = (event: Event) => {
    if (event.sessions && event.sessions.length > 0) {
      const availableSession = event.sessions.find(s => s.capacity > s.reserved);
      setSelectedEvent({ ...event, sessions: availableSession ? [availableSession] : event.sessions });
      setIsRSVPModalOpen(true);
    }
  };

  const handleRSVPSuccess = () => {
    window.location.reload();
  };

  // Menu categories
  const menuCategories = [
    { id: 'coffee', name: 'Кафе', icon: Coffee },
    { id: 'specialty', name: 'Специализирани лате', icon: Coffee },
    { id: 'tea', name: 'Чай и други напитки', icon: Coffee },
    { id: 'pastries', name: 'Сладкиши и печива', icon: Coffee }
  ];

  // Filter menu items by category
  const getMenuItemsByCategory = (category: string) => {
    return menuItems.filter(item => item.category === category);
  };

  // Check if business is open
  const isBusinessOpen = () => {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const todayHours = businessHours.find(h => h.dayOfWeek === currentDayOfWeek);
    if (!todayHours || !todayHours.isOpen) return false;
    
    return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
  };

  // Check upcoming holidays
  const getUpcomingHolidays = () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return holidays
      .filter(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate >= now && holidayDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-mokka-tq"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-[#FFFBF0] overflow-hidden">
        {/* Hero content */}
        <div className="relative z-10 px-4 pt-20 pb-16">
          <div className="max-w-6xl mx-auto text-center">
            {/* Google Review Score */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">4.5</span>
                <span className="text-xs text-gray-500">(27 отзива)</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-mokka-gy mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Вкусът на света в твоята чаша
            </motion.h1>
            
            {/* Subheading */}
            <motion.p 
              className="text-xl md:text-2xl text-mokka-gy/80 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Специализирани кафета, изпечени в България. Откриваме света с всяка глътка.
            </motion.p>
            
            {/* CTA Button */}
            <motion.div 
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Button 
                size="lg" 
                className="bg-mokka-tq hover:bg-mokka-tq/90 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Виж Меню
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Image Slideshow Section */}
        <div className="relative px-4 pb-20">
                  <ImageSlideshow
          items={carouselItems}
        />
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-mokka-gy mb-6">
              Нашето Меню
            </h2>
            <p className="text-xl text-mokka-gy/70 max-w-2xl mx-auto">
              Открий света с всяка глътка. Специализирани кафета от целия свят, изпечени в България.
            </p>
          </motion.div>

          <div className="space-y-16">
            {menuCategories.map((category, categoryIndex) => {
              const items = getMenuItemsByCategory(category.id);
              if (items.length === 0) return null;
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-mokka-br mb-2">
                      {category.name}
                    </h3>
                    <div className="w-24 h-1 bg-mokka-tq mx-auto rounded-full"></div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, itemIndex) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: itemIndex * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="group"
                      >
                        <Card className="h-full border-mokka-br/20 hover:border-mokka-tq/40 transition-all duration-300 hover:shadow-lg">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-semibold text-lg text-mokka-gy group-hover:text-mokka-tq transition-colors">
                                {item.name}
                              </h4>
                              <span className="font-bold text-mokka-tq text-lg">
                                {item.price.toFixed(2)} лв
                              </span>
                            </div>
                            <p className="text-mokka-gy/70 text-sm leading-relaxed">
                              {item.description}
                            </p>
                            {!item.isAvailable && (
                              <Badge variant="secondary" className="mt-3 bg-mokka-gy/10 text-mokka-gy/70">
                                Временно недостъпно
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-20 px-4 bg-mokka-cr/30">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-mokka-gy mb-6">
              Събития и Дегустации
            </h2>
            <p className="text-xl text-mokka-gy/70 max-w-2xl mx-auto">
              Присъедини се към нашите специализирани дегустации и събития
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className={`h-full ${
                  event.slug === 'coffee-tasting' 
                    ? 'border-mokka-tq/30 bg-gradient-to-br from-white to-mokka-tq/5' 
                    : 'border-mokka-br/30 bg-gradient-to-br from-white to-mokka-br/5'
                } hover:shadow-xl transition-all duration-300`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className={`text-2xl ${
                        event.slug === 'coffee-tasting' ? 'text-mokka-tq' : 'text-mokka-br'
                      }`}>
                        {event.title}
                      </CardTitle>
                      <Badge className={
                        event.slug === 'coffee-tasting' 
                          ? 'bg-mokka-tq/20 text-mokka-tq border-mokka-tq/30' 
                          : 'bg-mokka-br/20 text-mokka-br border-mokka-br/30'
                      }>
                        {event.slug === 'coffee-tasting' ? 'Дегустация' : 'Събитие'}
                      </Badge>
                    </div>
                    <CardDescription className="text-mokka-gy/70">
                      {event.sessions?.map(session => (
                        <div key={session.id} className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(session.start).toLocaleDateString('bg-BG', {
                              weekday: 'long',
                              month: 'long',
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
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-mokka-gy/80 mb-6 leading-relaxed">
                      {event.description}
                    </p>
                    
                    {event.slug === 'coffee-tasting' && event.sessions && (
                      <div className="mb-6 p-4 bg-white/50 rounded-lg border border-mokka-tq/20">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-mokka-gy/70">Достъпни места:</span>
                          <span className="font-semibold text-mokka-tq">
                            {event.sessions.reduce((total, session) => 
                              total + (session.capacity - session.reserved), 0
                            )} / {event.sessions.reduce((total, session) => 
                              total + session.capacity, 0
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      className={`w-full ${
                        event.slug === 'coffee-tasting'
                          ? 'bg-mokka-tq hover:bg-mokka-tq/90 text-white'
                          : 'bg-mokka-br hover:bg-mokka-br/90 text-white'
                      }`}
                      onClick={() => handleRSVPClick(event)}
                    >
                      {event.slug === 'coffee-tasting' ? 'RSVP' : 'Присъедини се'}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Evening Offers Section */}
      <section id="evening" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-mokka-gy mb-6">
              Вечерни Оферти
            </h2>
            <p className="text-xl text-mokka-gy/70 max-w-2xl mx-auto">
              Специални комбинации за вечерните часове
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Sunset Sips",
                description: "Специализирано кафе + spritz комбинация",
                price: "12.90 лв",
                time: "18:00 - 22:00",
                badge: "Популярно"
              },
              {
                title: "Unity Duo",
                description: "Две специализирани кафета + пай",
                price: "15.90 лв",
                time: "Цял ден",
                badge: "Най-продавано"
              },
              {
                title: "Evening Vibes",
                description: "Кафе + бира + малки закуски",
                price: "18.90 лв",
                time: "19:00 - 23:00",
                badge: "Ново"
              }
            ].map((offer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <Card className="h-full border-mokka-br/20 hover:border-mokka-tq/40 transition-all duration-300 hover:shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl text-mokka-gy group-hover:text-mokka-tq transition-colors">
                        {offer.title}
                      </CardTitle>
                      <Badge className="bg-mokka-tq/20 text-mokka-tq border-mokka-tq/30">
                        {offer.badge}
                      </Badge>
                    </div>
                    <CardDescription className="text-mokka-gy/70">
                      <Clock className="inline w-4 h-4 mr-2" />
                      {offer.time}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-mokka-gy/80 mb-4 leading-relaxed">
                      {offer.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-2xl text-mokka-tq">
                        {offer.price}
                      </span>
                      <Button size="sm" className="bg-mokka-br hover:bg-mokka-br/90 text-white">
                        Поръчай
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-mokka-cr/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-mokka-gy mb-6">
                За Mokka Coffee
              </h2>
              <p className="text-lg text-mokka-gy/80 mb-6 leading-relaxed">
                Mokka Coffee е вашият идеален избор за специализирани кафета, изпечени в България. 
                Откриваме света с всяка глътка, предлагайки най-добрите кафета от различни произходи.
              </p>
              <p className="text-lg text-mokka-gy/80 mb-8 leading-relaxed">
                Същото уютно място, по-висок стандарт. Присъедини се към нас за незабравими вкусови преживявания.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-mokka-gy font-medium">4.9 (127 отзива)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-mokka-tq" />
                  <span className="text-mokka-gy font-medium">24+ кафета</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-mokka-br" />
                  <span className="text-mokka-gy font-medium">1000+ клиенти</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="w-full h-96 bg-gradient-to-br from-mokka-br/20 to-mokka-tq/20 rounded-2xl flex items-center justify-center">
                <div className="text-center text-mokka-gy/60">
                  <Coffee className="w-24 h-24 mx-auto mb-4" />
                  <p className="text-lg">Снимка ще бъде добавена</p>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-20 h-20 bg-mokka-tq/20 rounded-full flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Coffee className="w-8 h-8 text-mokka-tq" />
              </motion.div>
              
              <motion.div
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-mokka-br/20 rounded-full flex items-center justify-center"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Star className="w-6 h-6 text-mokka-br" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact & Hours Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-mokka-gy mb-6">
              Къде да ни намериш
            </h2>
            <p className="text-xl text-mokka-gy/70 max-w-2xl mx-auto">
              Посети ни за незабравимо кафено преживяване
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-mokka-tq/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-mokka-tq" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-mokka-gy mb-1">Адрес</h3>
                  <p className="text-mokka-gy/70">Тракия, Пловдив, България</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-mokka-br/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-mokka-br" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-mokka-gy mb-1">Телефон</h3>
                  <p className="text-mokka-gy/70">+359 888 XXX XXX</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-mokka-tq/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-mokka-tq" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-mokka-gy mb-1">Имейл</h3>
                  <p className="text-mokka-gy/70">hello@mokka-coffee.bg</p>
                </div>
              </div>

              {/* Business Status */}
              <div className="mt-8 p-4 rounded-lg border-2 border-dashed border-mokka-tq/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${isBusinessOpen() ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-semibold text-mokka-gy">
                    {isBusinessOpen() ? 'Отворено сега' : 'Затворено'}
                  </span>
                </div>
                <p className="text-sm text-mokka-gy/70">
                  {isBusinessOpen() ? 'Добре дошли! Дръжте се на разстояние.' : 'Ще се видим скоро!'}
                </p>
              </div>
            </motion.div>

            {/* Business Hours */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="border-mokka-br/20">
                <CardHeader>
                  <CardTitle className="text-xl text-mokka-gy flex items-center gap-2">
                    <Clock className="w-5 h-5 text-mokka-tq" />
                    Работно време
                  </CardTitle>
                </CardHeader>
                <CardContent>
                                     <div className="space-y-3">
                     {businessHours.map((hours, index) => {
                       const dayNames = ['Неделя', 'Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота'];
                       return (
                         <div key={hours.id} className="flex justify-between items-center py-2 border-b border-mokka-br/10 last:border-b-0">
                           <span className="font-medium text-mokka-gy">
                             {dayNames[hours.dayOfWeek]}
                           </span>
                           <span className="text-mokka-gy/70">
                             {!hours.isOpen ? 'Затворено' : `${hours.openTime} - ${hours.closeTime}`}
                           </span>
                         </div>
                       );
                     })}
                   </div>
                  
                  {/* Upcoming Holidays */}
                  {getUpcomingHolidays().length > 0 && (
                    <div className="mt-6 p-4 bg-mokka-br/10 rounded-lg">
                      <h4 className="font-semibold text-mokka-br mb-3">Предстоящи празници</h4>
                      <div className="space-y-2">
                        {getUpcomingHolidays().map(holiday => (
                          <div key={holiday.id} className="flex justify-between items-center text-sm">
                            <span className="text-mokka-gy/80">
                              {new Date(holiday.date).toLocaleDateString('bg-BG', {
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                            <span className="text-mokka-gy/70">{holiday.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-mokka-gy text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Mokka Coffee</h3>
              <p className="text-mokka-cr/80 leading-relaxed">
                Вкусът на света в твоята чаша. Специализирани кафета, изпечени в България.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Бързи линкове</h4>
              <ul className="space-y-2 text-mokka-cr/80">
                <li><a href="#menu" className="hover:text-mokka-tq transition-colors">Меню</a></li>
                <li><a href="#events" className="hover:text-mokka-tq transition-colors">Събития</a></li>
                <li><a href="#evening" className="hover:text-mokka-tq transition-colors">Вечерни оферти</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Контакти</h4>
              <ul className="space-y-2 text-mokka-cr/80">
                <li>Тракия, Пловдив</li>
                <li>+359 888 XXX XXX</li>
                <li>hello@mokka-coffee.bg</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Последвайте ни</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-mokka-tq/20 rounded-full flex items-center justify-center hover:bg-mokka-tq/30 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-mokka-tq/20 rounded-full flex items-center justify-center hover:bg-mokka-tq/30 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-mokka-gy/30 pt-8 text-center text-mokka-cr/60">
            <p>© 2025 Mokka Coffee. Всички права запазени.</p>
            <div className="flex justify-center space-x-4 mt-2 text-sm">
              <a href="#" className="hover:text-mokka-tq transition-colors">Политика за поверителност</a>
              <span>•</span>
              <a href="#" className="hover:text-mokka-tq transition-colors">Бисквитки</a>
              <span>•</span>
              <a href="#" className="hover:text-mokka-tq transition-colors">Условия за ползване</a>
            </div>
          </div>
        </div>
      </footer>

      {/* RSVP Modal */}
      {selectedEvent && (
        <RSVPModal
          isOpen={isRSVPModalOpen}
          onClose={() => {
            setIsRSVPModalOpen(false);
            setSelectedEvent(null);
          }}
          eventTitle={selectedEvent.title}
          session={selectedEvent.sessions[0]}
          onRSVPSuccess={handleRSVPSuccess}
        />
      )}

      {/* RSVP Manager Modal */}
      <RSVPManager
        isOpen={isRSVPManagerOpen}
        onClose={() => setIsRSVPManagerOpen(false)}
      />
    </div>
  );
}
