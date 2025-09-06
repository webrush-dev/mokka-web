'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Phone, Clock, Instagram, Facebook, Mail, ArrowRight, Star, Coffee, Users, Heart, Sparkles, MapPinIcon, PhoneIcon, MailIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RSVPModal from './rsvp-modal';
import RSVPManager from '../rsvp/rsvp-manager';
import ImageSlideshow from './image-slideshow';
import CookieBanner from '@/components/ui/cookie-banner';


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
  tags?: string; // This is a comma-separated string from the database
  imageUrl?: string; // Image URL for the menu item
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
  const [isMobile, setIsMobile] = useState(false);
  
  // Modal states
  const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isRSVPManagerOpen, setIsRSVPManagerOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
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
  
  
  
  

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Handle Menu Item Click
  const handleMenuItemClick = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setIsMenuModalOpen(true);
  };

  // Get all unique tags from menu items
  const getAllTags = () => {
    const tags = new Set<string>();
    menuItems.forEach(item => {
      if (item.tags && typeof item.tags === 'string') {
        // Split comma-separated tags and clean them
        const itemTags = item.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        itemTags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  };

  // Get menu items filtered by active category
  const getFilteredMenuItems = () => {
    if (activeCategory === 'all') {
      return menuItems;
    }
    return menuItems.filter(item => {
      if (!item.tags || typeof item.tags !== 'string') return false;
      const itemTags = item.tags.split(',').map(tag => tag.trim());
      return itemTags.includes(activeCategory);
    });
  };

  // Get menu items for a specific category with show more logic
  const getCategoryItems = (categoryId: string, showAll: boolean = false) => {
    const items = getMenuItemsByCategory(categoryId);
    if (showAll || expandedCategories.has(categoryId)) {
      return items;
    }
    return items.slice(0, 3);
  };

  // Handle show more click
  const handleShowMore = (categoryId: string) => {
    setExpandedCategories(prev => new Set(prev).add(categoryId));
  };

  // Handle category tab click
  const handleCategoryTabClick = (tag: string) => {
    setActiveCategory(tag);
    setExpandedCategories(new Set()); // Reset expanded categories when switching tabs
  };

  // Cookie consent handlers
  const handleCookieAccept = () => {
    // Enable tracking pixels/analytics
    // console.log('🍪 Enabling tracking pixels...');
    
    // Placeholder for actual pixel implementation
    // You can replace this with your actual tracking code:
    
    // Facebook Pixel example:
    // if (typeof window !== 'undefined' && window.fbq) {
    //   window.fbq('consent', 'grant');
    // }
    
    // Google Analytics example:
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('consent', 'update', {
    //     'analytics_storage': 'granted',
    //     'ad_storage': 'granted'
    //   });
    // }
    
    // Meta Pixel example:
    // if (typeof window !== 'undefined' && window.fbq) {
    //   window.fbq('init', 'YOUR_PIXEL_ID');
    //   window.fbq('track', 'PageView');
    // }
  };

  const handleCookieReject = () => {
    // Ensure no tracking is enabled
    // console.log('🚫 Tracking disabled - respecting user privacy');
    
    // Disable any existing tracking
    // if (typeof window !== 'undefined' && window.fbq) {
    //   window.fbq('consent', 'revoke');
    // }
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

  // Mobile Navigation Component - Simple and Contained
  const MobileNavigation = () => (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-mokka-tq/20 mobile-nav-container">
      <div className="flex items-center justify-between px-1 py-2 w-full">
        <a 
          href="#menu" 
          className="flex flex-col items-center justify-center flex-1 min-w-0"
        >
          <div className="w-8 h-8 bg-mokka-tq/10 rounded-full flex items-center justify-center mb-1">
            <Coffee className="w-4 h-4 text-mokka-tq" />
          </div>
          <span className="text-xs font-medium text-mokka-gy text-center leading-tight">Меню</span>
        </a>
        <a 
          href="#events" 
          className="flex flex-col items-center justify-center flex-1 min-w-0"
        >
          <div className="w-8 h-8 bg-mokka-br/10 rounded-full flex items-center justify-center mb-1">
            <Calendar className="w-4 h-4 text-mokka-br" />
          </div>
          <span className="text-xs font-medium text-mokka-gy text-center leading-tight">Събития</span>
        </a>
        <a 
          href="#contact" 
          className="flex flex-col items-center justify-center flex-1 min-w-0"
        >
          <div className="w-8 h-8 bg-mokka-tq/10 rounded-full flex items-center justify-center mb-1">
            <MapPin className="w-4 h-4 text-mokka-tq" />
          </div>
          <span className="text-xs font-medium text-mokka-gy text-center leading-tight">Контакти</span>
        </a>
        <button 
          onClick={() => setIsRSVPManagerOpen(true)}
          className="flex flex-col items-center justify-center flex-1 min-w-0"
        >
          <div className="w-8 h-8 bg-mokka-br/10 rounded-full flex items-center justify-center mb-1">
            <Users className="w-4 h-4 text-mokka-br" />
          </div>
          <span className="text-xs font-medium text-mokka-gy text-center leading-tight">RSVP</span>
        </button>
      </div>
    </div>
  );

  // Desktop Navigation Component
  const DesktopNavigation = () => (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-lg border border-mokka-tq/20">
        <nav className="flex items-center space-x-6">
          <a 
            href="#menu" 
            className="text-mokka-gy hover:text-mokka-tq transition-colors font-medium text-sm group"
          >
            <span className="flex items-center gap-1">
              <Coffee className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Меню
            </span>
          </a>
          <a 
            href="#events" 
            className="text-mokka-gy hover:text-mokka-tq transition-colors font-medium text-sm group"
          >
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Събития
            </span>
          </a>
          <a 
            href="#contact" 
            className="text-mokka-gy hover:text-mokka-tq transition-colors font-medium text-sm group"
          >
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Контакти
            </span>
          </a>
          <button 
            onClick={() => setIsRSVPManagerOpen(true)}
            className="text-mokka-gy hover:text-mokka-br transition-colors font-medium text-sm group"
          >
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Управление на резервации
            </span>
          </button>
        </nav>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Conditional Navigation */}
      {isMobile ? <MobileNavigation /> : <DesktopNavigation />}

      {/* Hero Section */}
      <section className={`relative min-h-screen bg-gradient-to-br from-[#FFFBF0] via-[#FEF7E0] to-[#FFFBF0] overflow-hidden ${isMobile ? 'pt-16' : ''}`}>
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating coffee beans */}
          {[
            { top: 15, left: 20, xMove: 10, duration: 6 },
            { top: 25, left: 80, xMove: -8, duration: 7 },
            { top: 35, left: 15, xMove: 12, duration: 8 },
            { top: 45, left: 75, xMove: -15, duration: 6.5 },
            { top: 55, left: 30, xMove: 8, duration: 7.5 },
            { top: 65, left: 85, xMove: -12, duration: 6.8 },
            { top: 75, left: 25, xMove: 15, duration: 7.2 },
            { top: 85, left: 70, xMove: -10, duration: 6.3 },
            { top: 20, left: 60, xMove: 5, duration: 8.2 },
            { top: 40, left: 40, xMove: -7, duration: 6.7 },
            { top: 60, left: 90, xMove: 9, duration: 7.8 },
            { top: 80, left: 10, xMove: -6, duration: 6.9 }
          ].map((bean, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-mokka-br/30 rounded-full"
              style={{
                top: `${bean.top}%`,
                left: `${bean.left}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, bean.xMove, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.3, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: bean.duration,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Coffee steam wisps */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`steam-${i}`}
              className="absolute w-2 h-20 bg-gradient-to-t from-mokka-tq/40 to-transparent rounded-full"
              style={{
                top: `${15 + i * 15}%`,
                left: `${5 + i * 18}%`,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.4, 0.8, 0.4],
                scaleY: [1, 1.8, 1],
                scaleX: [1, 1.2, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.7,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Coffee cup shadows */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`cup-${i}`}
              className="absolute w-16 h-16 bg-mokka-tq/10 rounded-full"
              style={{
                top: `${20 + i * 25}%`,
                left: `${10 + i * 30}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                delay: i * 1.5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-10 px-4 pt-32 pb-16">
          <div className="max-w-6xl mx-auto text-center">
            

            {/* Google Review Score */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-100">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <Star 
                        className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    </motion.div>
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">4.5</span>
                <span className="text-xs text-gray-500">(27 отзива)</span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-mokka-gy mb-6 relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <span className="relative inline-block">
                Вкусът на света
                <motion.div
                  className="absolute -top-2 -right-2 w-8 h-8 bg-mokka-tq/20 rounded-full flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Coffee className="w-4 h-4 text-mokka-tq" />
                </motion.div>
              </span>
              <br />
              <span className="text-mokka-tq">в твоята чаша</span>
            </motion.h1>
            
            {/* Subheading */}
            <motion.p 
              className="text-xl md:text-2xl text-mokka-gy/80 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Специализирани кафета, изпечени в България. 
              <br />
              <span className="text-mokka-br font-semibold">Откриваме света с всяка глътка ☕</span>
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              className="mb-16 flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <Button 
                size="lg" 
                className="bg-mokka-tq hover:bg-mokka-tq/90 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
                onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <motion.div
                  className="flex items-center gap-2"
                  whileHover={{ x: 5 }}
                >
                  Виж Меню
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="border-mokka-br/30 text-mokka-br hover:bg-mokka-br hover:text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
                onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <motion.div
                  className="flex items-center gap-2"
                  whileHover={{ x: 5 }}
                >
                  <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Събития
                </motion.div>
              </Button>
            </motion.div>

            {/* Fun Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              {[
                { icon: Coffee, number: "24+", text: "Кафета" },
                { icon: Users, number: "1000+", text: "Клиенти" },
                { icon: Star, number: "4.5", text: "Рейтинг" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center group"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:shadow-xl transition-all duration-300"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      delay: index * 0.5,
                      ease: "easeInOut" 
                    }}
                  >
                    <stat.icon className="w-6 h-6 text-mokka-tq" />
                  </motion.div>
                  <div className="text-2xl font-bold text-mokka-gy">{stat.number}</div>
                  <div className="text-sm text-mokka-gy/70">{stat.text}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Image Slideshow Section */}
        <div className="relative px-4 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <ImageSlideshow
              items={carouselItems}
            />
          </motion.div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-20 px-4 bg-gradient-to-br from-white via-mokka-cr/5 to-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating coffee beans */}
          {[
            { top: 10, left: 15, xMove: 8, duration: 7 },
            { top: 20, left: 85, xMove: -12, duration: 6.5 },
            { top: 30, left: 25, xMove: 10, duration: 8 },
            { top: 40, left: 75, xMove: -8, duration: 7.2 },
            { top: 50, left: 35, xMove: 12, duration: 6.8 },
            { top: 60, left: 90, xMove: -10, duration: 7.5 },
            { top: 70, left: 20, xMove: 9, duration: 6.3 },
            { top: 80, left: 80, xMove: -15, duration: 8.1 },
            { top: 15, left: 60, xMove: 6, duration: 7.8 },
            { top: 35, left: 45, xMove: -9, duration: 6.7 },
            { top: 55, left: 95, xMove: 11, duration: 7.9 },
            { top: 75, left: 5, xMove: -7, duration: 6.4 }
          ].map((bean, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-mokka-br/25 rounded-full"
              style={{
                top: `${bean.top}%`,
                left: `${bean.left}%`,
              }}
              animate={{
                y: [0, -25, 0],
                x: [0, bean.xMove, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: bean.duration,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Coffee steam wisps */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`steam-${i}`}
              className="absolute w-1 h-12 bg-gradient-to-t from-mokka-tq/25 to-transparent rounded-full"
              style={{
                top: `${20 + i * 20}%`,
                left: `${15 + i * 20}%`,
              }}
              animate={{
                y: [0, -25, 0],
                opacity: [0.3, 0.6, 0.3],
                scaleY: [1, 1.4, 1],
                scaleX: [1, 1.1, 1]
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative inline-block mb-6">
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 bg-mokka-tq/20 rounded-full flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Coffee className="w-4 h-4 text-mokka-tq" />
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold text-mokka-gy">
                Нашето Меню
              </h2>
            </div>
            <p className="text-xl text-mokka-gy/70 max-w-2xl mx-auto">
              Открий света с всяка глътка ☕ Специализирани кафета от целия свят, изпечени в България.
            </p>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex flex-wrap justify-center gap-3">
              {/* All Items Tab */}
              <motion.button
                onClick={() => handleCategoryTabClick('all')}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === 'all'
                    ? 'bg-gradient-to-r from-mokka-tq to-mokka-br text-white shadow-lg'
                    : 'bg-white/80 text-mokka-gy hover:bg-white hover:text-mokka-tq border border-mokka-tq/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4" />
                  <span>Всички</span>
                </div>
              </motion.button>
              
              {/* Tag Tabs */}
              {getAllTags().map((tag, index) => (
                <motion.button
                  key={tag}
                  onClick={() => handleCategoryTabClick(tag)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    activeCategory === tag
                      ? 'bg-gradient-to-r from-mokka-tq to-mokka-br text-white shadow-lg'
                      : 'bg-white/80 text-mokka-gy hover:bg-white hover:text-mokka-tq border border-mokka-tq/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{tag}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Menu Content */}
          <motion.div
            key={activeCategory} // This will trigger re-animation when tab changes
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-20"
          >
            {menuCategories.map((category, categoryIndex) => {
              // Get items for this category
              const categoryItems = getMenuItemsByCategory(category.id);
              
              // Filter items based on active tab
              let filteredItems = categoryItems;
              if (activeCategory !== 'all') {
                filteredItems = categoryItems.filter(item => {
                  if (!item.tags || typeof item.tags !== 'string') return false;
                  const itemTags = item.tags.split(',').map(tag => tag.trim());
                  return itemTags.includes(activeCategory);
                });
              }
              
              // Apply show more logic to filtered items
              const items = getCategoryItems(category.id);
              const allItems = filteredItems;
              const hasMoreItems = allItems.length > 3;
              const isExpanded = expandedCategories.has(category.id);
              
              // Show items with show more logic
              const displayItems = hasMoreItems && !isExpanded ? allItems.slice(0, 3) : allItems;
              
              if (displayItems.length === 0) return null;
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
                  className="relative"
                >
                  {/* Category Header */}
                  <div className="text-center mb-16">
                    <motion.div
                      className="inline-flex items-center gap-4 mb-6"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="w-16 h-16 bg-gradient-to-br from-mokka-tq/20 to-mokka-br/20 rounded-full flex items-center justify-center shadow-lg"
                        animate={{ 
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                          duration: 4, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                      >
                        <category.icon className="w-8 h-8 text-mokka-tq" />
                      </motion.div>
                      <h3 className="text-3xl md:text-4xl font-bold text-mokka-br">
                        {category.name}
                      </h3>
                    </motion.div>
                    <div className="w-40 h-1 bg-gradient-to-r from-mokka-tq to-mokka-br mx-auto rounded-full"></div>
                  </div>
                  
                  {/* Menu Items Grid */}
                  <div className="space-y-8">
                    {displayItems.map((item, itemIndex) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: itemIndex % 2 === 0 ? -50 : 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: itemIndex * 0.1 }}
                        className={`flex flex-col ${itemIndex % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center group cursor-pointer`}
                        onClick={() => handleMenuItemClick(item)}
                      >
                        {/* Menu Item Image */}
                        <motion.div
                          className="w-full lg:w-1/2 h-64 lg:h-80 relative overflow-hidden rounded-2xl shadow-xl"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.3 }}
                        >
                          {item.imageUrl ? (
                            <>
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to placeholder if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="w-full h-full bg-gradient-to-br from-mokka-tq/10 to-mokka-br/10 flex items-center justify-center">
                                        <div class="w-24 h-24 bg-gradient-to-br from-mokka-tq/20 to-mokka-br/20 rounded-full flex items-center justify-center">
                                          <svg class="w-12 h-12 text-mokka-tq" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                          </svg>
                                        </div>
                                      </div>
                                    `;
                                  }
                                }}
                              />
                              {/* Coffee steam animation overlay */}
                              <div className="absolute top-4 right-4">
                                <motion.div
                                  animate={{ 
                                    y: [0, -8, 0],
                                    opacity: [0.3, 0.7, 0.3]
                                  }}
                                  transition={{ 
                                    duration: 3, 
                                    repeat: Infinity, 
                                    ease: "easeInOut" 
                                  }}
                                >
                                  <Coffee className="w-6 h-6 text-mokka-tq/60" />
                                </motion.div>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-mokka-tq/10 to-mokka-br/10 flex items-center justify-center">
                              <motion.div
                                className="w-24 h-24 bg-gradient-to-br from-mokka-tq/20 to-mokka-br/20 rounded-full flex items-center justify-center"
                                animate={{ 
                                  rotate: [0, 10, -10, 0],
                                  scale: [1, 1.1, 1]
                                }}
                                transition={{ 
                                  duration: 3, 
                                  repeat: Infinity, 
                                  ease: "easeInOut" 
                                }}
                              >
                                <Coffee className="w-12 h-12 text-mokka-tq" />
                              </motion.div>
                            </div>
                          )}
                        </motion.div>
                        
                        {/* Menu Item Content */}
                        <motion.div
                          className="w-full lg:w-1/2 space-y-4"
                          whileHover={{ x: itemIndex % 2 === 0 ? 10 : -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="text-2xl md:text-3xl font-bold text-mokka-gy group-hover:text-mokka-tq transition-colors">
                              {item.name}
                            </h4>
                            <motion.div
                              className="bg-gradient-to-r from-mokka-tq/10 to-mokka-br/10 px-4 py-2 rounded-full border border-mokka-tq/20"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            >
                              <span className="font-bold text-mokka-tq text-xl">
                                {item.price.toFixed(2)} лв
                              </span>
                            </motion.div>
                          </div>
                          
                          <p className="text-mokka-gy/70 text-lg leading-relaxed">
                            {item.description.length > 120 
                              ? `${item.description.substring(0, 120)}...` 
                              : item.description
                            }
                          </p>
                          
                          <div className="flex items-center justify-between">
                            {/* Availability Status */}
                            {!item.isAvailable ? (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                <Badge variant="secondary" className="bg-mokka-gy/10 text-mokka-gy/70 border-mokka-gy/20 px-3 py-1">
                                  Временно недостъпно
                                </Badge>
                              </motion.div>
                            ) : (
                              <motion.div
                                className="flex items-center gap-2 text-sm text-mokka-tq/70"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                              >
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                                </motion.div>
                                <span className="font-medium">Наличнo</span>
                              </motion.div>
                            )}
                            
                            {/* More Info Button */}
                            <motion.div
                              className="flex items-center gap-2 text-mokka-tq font-medium group-hover:text-mokka-br transition-colors"
                              whileHover={{ x: 5 }}
                            >
                              <span>Повече информация</span>
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </motion.div>
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                    
                    {/* Show More Button */}
                    {hasMoreItems && !isExpanded && (
                      <motion.div
                        className="text-center pt-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                      >
                        <motion.button
                          onClick={() => handleShowMore(category.id)}
                          className="bg-gradient-to-r from-mokka-tq/10 to-mokka-br/10 hover:from-mokka-tq/20 hover:to-mokka-br/20 px-8 py-4 rounded-full border border-mokka-tq/20 text-mokka-tq font-medium transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="flex items-center gap-3">
                            <span>Покажи още {allItems.length - 3} артикула</span>
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
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

          {events.length > 0 ? (
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
                  <Card className={`h-full relative overflow-hidden ${
                    event.slug === 'coffee-tasting' 
                      ? 'border-mokka-tq/30 bg-gradient-to-br from-white to-mokka-tq/5' 
                      : 'border-mokka-br/30 bg-gradient-to-br from-white to-mokka-br/5'
                  } hover:shadow-xl transition-all duration-300`}>
                    {/* Coffee steam animation */}
                    <div className="absolute top-4 right-4 opacity-20">
                      <motion.div
                        animate={{ 
                          y: [0, -8, 0],
                          opacity: [0.2, 0.6, 0.2]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                      >
                        <Coffee className="w-6 h-6 text-mokka-tq" />
                      </motion.div>
                    </div>
                    
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
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center py-16"
            >
              <div className="relative max-w-md mx-auto">
                {/* Animated coffee mug with steam */}
                <div className="relative mb-8">
                  {/* Coffee mug */}
                  <motion.div
                    className="w-32 h-32 mx-auto bg-gradient-to-b from-mokka-br/20 to-mokka-tq/20 rounded-full flex items-center justify-center"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  >
                    <Coffee className="w-16 h-16 text-mokka-tq" />
                  </motion.div>
                  
                  {/* Steam animation */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-8 bg-gradient-to-t from-mokka-tq/60 to-transparent rounded-full"
                        style={{ left: `${i * 8 - 8}px` }}
                        animate={{
                          y: [0, -20, 0],
                          opacity: [0.4, 0.8, 0.4],
                          scaleY: [1, 1.2, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Floating coffee beans */}
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-mokka-br/40 rounded-full"
                      style={{
                        top: `${20 + i * 15}px`,
                        left: `${i % 2 === 0 ? '20%' : '80%'}`
                      }}
                      animate={{
                        y: [0, -10, 0],
                        x: [0, i % 2 === 0 ? 10 : -10, 0],
                        opacity: [0.3, 0.7, 0.3]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
                
                {/* Message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  <h3 className="text-2xl md:text-3xl font-bold text-mokka-gy mb-4">
                    В момента нямам нищо планирано
                  </h3>
                  <p className="text-lg text-mokka-gy/70 mb-6 leading-relaxed">
                    Но не се притеснявай! Приготвяме нещо ново теб ☕
                  </p>
                  <p className="text-base text-mokka-gy/60 mb-8">
                    Очаквай скоро нови дегустации и събития!
                  </p>
                </motion.div>
                
                {/* Decorative elements */}
                <div className="flex justify-center items-center gap-4 mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Heart className="w-6 h-6 text-mokka-tq/60" />
                  </motion.div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="w-6 h-6 text-mokka-br/60" />
                  </motion.div>
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Heart className="w-6 h-6 text-mokka-tq/60" />
                  </motion.div>
                </div>
                
                {/* Call to action */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                >
                  <Button 
                    variant="outline"
                    className="border-mokka-tq/30 text-mokka-tq hover:bg-mokka-tq hover:text-white transition-all duration-300"
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Свържи се с нас
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Evening Offers Section - Hidden for now */}
      {/* 
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
      */}

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
              <div className="w-full h-96 rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="/images/mokka-inside-2.jpeg" 
                  alt="Интериор на Mokka Coffee" 
                  className="w-full h-full object-cover"
                />
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
      <section id="contact" className="py-20 px-4 bg-gradient-to-br from-white via-mokka-cr/10 to-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating coffee beans */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-mokka-br/20 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Coffee steam wisps */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`steam-${i}`}
              className="absolute w-1 h-16 bg-gradient-to-t from-mokka-tq/30 to-transparent rounded-full"
              style={{
                top: `${20 + i * 20}%`,
                left: `${10 + i * 25}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.7, 0.3],
                scaleY: [1, 1.5, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative inline-block mb-6">
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 bg-mokka-tq/20 rounded-full flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Coffee className="w-4 h-4 text-mokka-tq" />
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold text-mokka-gy">
                Къде да ни намериш
              </h2>
            </div>
            <p className="text-xl text-mokka-gy/70 max-w-2xl mx-auto">
              Посети ни за незабравимо кафено преживяване ☕
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Address Card */}
              <motion.div 
                className="group relative"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-mokka-tq/20 hover:border-mokka-tq/40 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white to-mokka-tq/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <motion.div 
                        className="w-14 h-14 bg-gradient-to-br from-mokka-tq/20 to-mokka-tq/30 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                        animate={{ 
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                          duration: 4, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                      >
                        <MapPin className="w-7 h-7 text-mokka-tq" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-mokka-gy mb-2 group-hover:text-mokka-tq transition-colors">
                          Адрес
                        </h3>
                        <p className="text-mokka-gy/80 text-lg leading-relaxed">
                          бул. Освобождение 31, Пловдив
                        </p>
                        <p className="text-sm text-mokka-gy/60 mt-2">
                          В центъра на града, лесно достъпно с кола и градски транспорт
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Phone Card */}
              <motion.div 
                className="group relative"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-mokka-br/20 hover:border-mokka-br/40 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white to-mokka-br/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <motion.div 
                        className="w-14 h-14 bg-gradient-to-br from-mokka-br/20 to-mokka-br/30 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                      >
                        <Phone className="w-7 h-7 text-mokka-br" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-mokka-gy mb-2 group-hover:text-mokka-br transition-colors">
                          Телефон
                        </h3>
                        <p className="text-mokka-gy/80 text-lg leading-relaxed">
                          +359 876 930 059
                        </p>
                        <p className="text-sm text-mokka-gy/60 mt-2">
                          Обади се за резервации или въпроси
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Email Card */}
              <motion.div 
                className="group relative"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-mokka-tq/20 hover:border-mokka-tq/40 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white to-mokka-tq/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <motion.div 
                        className="w-14 h-14 bg-gradient-to-br from-mokka-tq/20 to-mokka-tq/30 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                        animate={{ 
                          y: [0, -3, 0],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 2.5, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                      >
                        <Mail className="w-7 h-7 text-mokka-tq" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-mokka-gy mb-2 group-hover:text-mokka-tq transition-colors">
                          Имейл
                        </h3>
                        <p className="text-mokka-gy/80 text-lg leading-relaxed">
                          hello@mokka.cafe
                        </p>
                        <p className="text-sm text-mokka-gy/60 mt-2">
                          Пиши ни за сътрудничество или обратна връзка
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Business Status */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative"
              >
                <Card className="border-2 border-dashed border-mokka-tq/40 bg-gradient-to-br from-mokka-tq/5 to-mokka-br/5 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-3">
                      <motion.div 
                        className={`w-4 h-4 rounded-full ${isBusinessOpen() ? 'bg-green-500' : 'bg-red-500'}`}
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                      />
                      <span className="font-bold text-lg text-mokka-gy">
                        {isBusinessOpen() ? 'Отворено сега' : 'Затворено'}
                      </span>
                    </div>
                    <p className="text-mokka-gy/70 text-base">
                      {isBusinessOpen() ? 'Добре дошли! ☕' : 'Ще се видим скоро! 👋'}
                    </p>
                    
                    {/* Animated coffee cup for open status */}
                    {isBusinessOpen() && (
                      <motion.div
                        className="absolute top-2 right-2"
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                      >
                        <Coffee className="w-6 h-6 text-mokka-tq/60" />
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Business Hours */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="border-mokka-br/20 hover:border-mokka-br/40 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-white to-mokka-br/5 relative overflow-hidden">
                {/* Decorative clock animation */}
                <div className="absolute top-4 right-4 opacity-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Clock className="w-8 h-8 text-mokka-br" />
                  </motion.div>
                </div>
                
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-mokka-gy flex items-center gap-3">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    >
                      <Clock className="w-6 h-6 text-mokka-tq" />
                    </motion.div>
                    Работно време
                  </CardTitle>
                  <p className="text-mokka-gy/70 text-sm">
                    Посети ни в удобно за теб време
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {businessHours.map((hours, index) => {
                      const dayNames = ['Неделя', 'Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота'];
                      const isToday = new Date().getDay() === hours.dayOfWeek;
                      
                      return (
                        <motion.div 
                          key={hours.id} 
                          className={`flex justify-between items-center py-3 px-4 rounded-lg border-b border-mokka-br/10 last:border-b-0 transition-all duration-300 ${
                            isToday ? 'bg-mokka-tq/10 border-mokka-tq/20' : 'hover:bg-mokka-br/5'
                          }`}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ x: 5 }}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`font-medium ${isToday ? 'text-mokka-tq' : 'text-mokka-gy'}`}>
                              {dayNames[hours.dayOfWeek]}
                            </span>
                            {isToday && (
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <div className="w-2 h-2 bg-mokka-tq rounded-full" />
                              </motion.div>
                            )}
                          </div>
                          <span className={`${isToday ? 'text-mokka-tq font-semibold' : 'text-mokka-gy/70'}`}>
                            {!hours.isOpen ? 'Затворено' : `${hours.openTime} - ${hours.closeTime}`}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  {/* Upcoming Holidays */}
                  {getUpcomingHolidays().length > 0 && (
                    <motion.div 
                      className="mt-6 p-4 bg-gradient-to-br from-mokka-br/10 to-mokka-br/5 rounded-lg border border-mokka-br/20"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <h4 className="font-semibold text-mokka-br mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Предстоящи празници
                      </h4>
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
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-4 bg-gradient-to-br from-mokka-gy via-mokka-gy/95 to-mokka-gy text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating coffee beans */}
          {[
            { top: 5, left: 10, xMove: 6, duration: 8 },
            { top: 15, left: 90, xMove: -8, duration: 7.5 },
            { top: 25, left: 20, xMove: 9, duration: 9 },
            { top: 35, left: 80, xMove: -7, duration: 8.2 },
            { top: 45, left: 30, xMove: 8, duration: 7.8 },
            { top: 55, left: 85, xMove: -10, duration: 8.5 },
            { top: 65, left: 15, xMove: 7, duration: 7.2 },
            { top: 75, left: 75, xMove: -9, duration: 8.8 },
            { top: 10, left: 60, xMove: 5, duration: 9.2 },
            { top: 30, left: 45, xMove: -6, duration: 7.9 },
            { top: 50, left: 95, xMove: 8, duration: 8.1 },
            { top: 70, left: 5, xMove: -7, duration: 7.6 }
          ].map((bean, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-mokka-tq/20 rounded-full"
              style={{
                top: `${bean.top}%`,
                left: `${bean.left}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, bean.xMove, 0],
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: bean.duration,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Coffee steam wisps */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`steam-${i}`}
              className="absolute w-1 h-16 bg-gradient-to-t from-mokka-tq/30 to-transparent rounded-full"
              style={{
                top: `${15 + i * 25}%`,
                left: `${20 + i * 20}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.4, 0.8, 0.4],
                scaleY: [1, 1.5, 1],
                scaleX: [1, 1.2, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="md:col-span-1"
            >
              <div className="mb-6">
                <motion.div
                  className="relative inline-block"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <img 
                    src="/mokka-logo-l.png" 
                    alt="Mokka Coffee Logo" 
                    className="h-16 w-auto"
                  />
                  <motion.div
                    className="absolute -top-2 -right-2 w-6 h-6 bg-mokka-tq/30 rounded-full flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  >
                    <Coffee className="w-3 h-3 text-mokka-tq" />
                  </motion.div>
                </motion.div>
              </div>
              <p className="text-mokka-cr/80 leading-relaxed text-lg">
                Вкусът на света в твоята чаша ☕
                <br />
                <span className="text-mokka-tq/90 font-medium">Специализирани кафета, изпечени в България.</span>
              </p>
            </motion.div>
            
            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h4 className="font-bold mb-6 text-xl flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-5 h-5 text-mokka-tq" />
                </motion.div>
                Бързи линкове
              </h4>
              <ul className="space-y-4">
                {[
                  { href: "#menu", text: "Меню", icon: Coffee },
                  { href: "#events", text: "Събития", icon: Calendar },
                  { text: "Управление на резервации", icon: Users, action: () => setIsRSVPManagerOpen(true) }
                ].map((link, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    {link.href ? (
                      <a 
                        href={link.href} 
                        className="flex items-center gap-3 text-mokka-cr/80 hover:text-mokka-tq transition-colors group"
                      >
                        <motion.div
                          className="w-8 h-8 bg-mokka-tq/20 rounded-full flex items-center justify-center group-hover:bg-mokka-tq/30 transition-colors"
                          whileHover={{ scale: 1.1 }}
                        >
                          <link.icon className="w-4 h-4 text-mokka-tq" />
                        </motion.div>
                        <span className="font-medium">{link.text}</span>
                      </a>
                    ) : (
                      <button 
                        onClick={link.action}
                        className="flex items-center gap-3 text-mokka-cr/80 hover:text-mokka-tq transition-colors group text-left"
                      >
                        <motion.div
                          className="w-8 h-8 bg-mokka-tq/20 rounded-full flex items-center justify-center group-hover:bg-mokka-tq/30 transition-colors"
                          whileHover={{ scale: 1.1 }}
                        >
                          <link.icon className="w-4 h-4 text-mokka-tq" />
                        </motion.div>
                        <span className="font-medium">{link.text}</span>
                      </button>
                    )}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h4 className="font-bold mb-6 text-xl flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <MapPin className="w-5 h-5 text-mokka-tq" />
                </motion.div>
                Контакти
              </h4>
              <ul className="space-y-4">
                {[
                  { icon: MapPin, text: "бул. Освобождение 31, Пловдив" },
                  { icon: Phone, text: "+359 876 930 059" },
                  { icon: Mail, text: "hello@mokka.cafe" }
                ].map((contact, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-3 text-mokka-cr/80"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <motion.div
                      className="w-8 h-8 bg-mokka-br/20 rounded-full flex items-center justify-center mt-0.5"
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        delay: index * 0.5,
                        ease: "easeInOut" 
                      }}
                    >
                      <contact.icon className="w-4 h-4 text-mokka-br" />
                    </motion.div>
                    <span className="font-medium leading-relaxed">{contact.text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            {/* Social Media */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h4 className="font-bold mb-6 text-xl flex items-center gap-2">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Heart className="w-5 h-5 text-mokka-tq" />
                </motion.div>
                Последвайте ни
              </h4>
              <div className="flex flex-col gap-4">
                <motion.a 
                  href="https://www.instagram.com/mokka_coffee_plovdiv/" 
                  className="flex items-center gap-3 w-fit group"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-mokka-tq/20 to-mokka-br/20 rounded-full flex items-center justify-center group-hover:from-mokka-tq/30 group-hover:to-mokka-br/30 transition-all duration-300"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Instagram className="w-6 h-6 text-mokka-tq" />
                  </motion.div>
                  <div>
                    <div className="font-medium text-mokka-cr/80 group-hover:text-mokka-tq transition-colors">Instagram</div>
                    <div className="text-sm text-mokka-cr/60">@mokka_coffee_plovdiv</div>
                  </div>
                </motion.a>
                
                {/* Fun Stats */}
                <motion.div
                  className="mt-6 p-4 bg-gradient-to-r from-mokka-tq/10 to-mokka-br/10 rounded-xl border border-mokka-tq/20"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-mokka-tq mb-1">4.9</div>
                    <div className="text-sm text-mokka-cr/70">Рейтинг в Google</div>
                    <div className="flex justify-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
          
          {/* Bottom Section */}
          <motion.div 
            className="border-t border-mokka-tq/20 pt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-mokka-cr/60 font-medium">
                © 2025 Mokka Coffee. Всички права запазени.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <motion.a 
                  href="/privacy" 
                  className="text-mokka-cr/60 hover:text-mokka-tq transition-colors flex items-center gap-2"
                  whileHover={{ x: 3 }}
                >
                  <Sparkles className="w-4 h-4" />
                  Политика за поверителност
                </motion.a>
                <span className="text-mokka-cr/40">•</span>
                <motion.a 
                  href="/cookies" 
                  className="text-mokka-cr/60 hover:text-mokka-tq transition-colors flex items-center gap-2"
                  whileHover={{ x: 3 }}
                >
                  <Coffee className="w-4 h-4" />
                  Бисквитки
                </motion.a>
              </div>
            </div>
          </motion.div>
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

      {/* Cookie Consent Banner */}
      <CookieBanner
        onAccept={handleCookieAccept}
        onReject={handleCookieReject}
      />

      {/* Menu Item Modal */}
      <AnimatePresence>
        {isMenuModalOpen && selectedMenuItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsMenuModalOpen(false);
              setSelectedMenuItem(null);
            }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            
            {/* Modal Content */}
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsMenuModalOpen(false);
                  setSelectedMenuItem(null);
                }}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-mokka-gy/10 rounded-full flex items-center justify-center hover:bg-mokka-gy/20 transition-colors"
              >
                <span className="text-mokka-gy text-xl">×</span>
              </button>
            
            {/* Modal Header */}
            <div className="p-8 pb-4 pt-12">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-mokka-gy">
                  {selectedMenuItem.name}
                </h2>
                <motion.div
                  className="bg-gradient-to-r from-mokka-tq/10 to-mokka-br/10 px-4 py-2 rounded-full border border-mokka-tq/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="font-bold text-mokka-tq text-xl">
                    {selectedMenuItem.price.toFixed(2)} лв
                  </span>
                </motion.div>
              </div>
              
              {/* Menu Item Image */}
              <div className="w-full h-64 bg-gradient-to-br from-mokka-tq/10 to-mokka-br/10 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden">
                {selectedMenuItem.imageUrl ? (
                  <>
                    <img
                      src={selectedMenuItem.imageUrl}
                      alt={selectedMenuItem.name}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br from-mokka-tq/10 to-mokka-br/10 flex items-center justify-center">
                              <div class="w-32 h-32 bg-gradient-to-br from-mokka-tq/20 to-mokka-br/20 rounded-full flex items-center justify-center">
                                <svg class="w-16 h-16 text-mokka-tq" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                              </div>
                            </div>
                          `;
                        }
                      }}
                    />
                    {/* Coffee steam animation overlay */}
                    <div className="absolute top-4 right-4">
                      <motion.div
                        animate={{ 
                          y: [0, -12, 0],
                          opacity: [0.3, 0.8, 0.3]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                      >
                        <Coffee className="w-8 h-8 text-mokka-tq/60" />
                      </motion.div>
                    </div>
                  </>
                ) : (
                  <>
                    <motion.div
                      className="w-32 h-32 bg-gradient-to-br from-mokka-tq/20 to-mokka-br/20 rounded-full flex items-center justify-center"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    >
                      <Coffee className="w-16 h-16 text-mokka-tq" />
                    </motion.div>
                    
                    {/* Coffee steam animation */}
                    <div className="absolute top-4 right-4">
                      <motion.div
                        animate={{ 
                          y: [0, -12, 0],
                          opacity: [0.3, 0.8, 0.3]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                      >
                        <Coffee className="w-8 h-8 text-mokka-tq/60" />
                      </motion.div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="px-8 pb-8">
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-xl font-semibold text-mokka-gy mb-3">Описание</h3>
                  <p className="text-mokka-gy/80 leading-relaxed text-lg">
                    {selectedMenuItem.description}
                  </p>
                </div>
                
                {/* Tags */}
                <div>
                  <h3 className="text-xl font-semibold text-mokka-gy mb-3">Категории</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMenuItem.tags && typeof selectedMenuItem.tags === 'string' ? (
                      selectedMenuItem.tags.split(',').map((tag, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center gap-2 bg-gradient-to-r from-mokka-tq/10 to-mokka-br/10 px-3 py-2 rounded-full border border-mokka-tq/20"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Sparkles className="w-4 h-4 text-mokka-tq" />
                          <span className="text-mokka-gy/80 font-medium text-sm">
                            {tag.trim()}
                          </span>
                        </motion.div>
                      ))
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-mokka-tq/20 to-mokka-br/20 rounded-full flex items-center justify-center">
                          <Coffee className="w-5 h-5 text-mokka-tq" />
                        </div>
                        <span className="text-mokka-gy/80 font-medium text-lg">
                          {menuCategories.find(cat => cat.id === selectedMenuItem.category)?.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Availability */}
                <div>
                  <h3 className="text-xl font-semibold text-mokka-gy mb-3">Наличност</h3>
                  {!selectedMenuItem.isAvailable ? (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span className="text-red-600 font-medium">Временно недостъпно</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                      </motion.div>
                      <span className="text-green-600 font-medium">Наличнo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
