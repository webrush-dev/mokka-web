'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Cookie, Settings } from 'lucide-react';
import Link from 'next/link';

interface CookieBannerProps {
  onAccept?: () => void;
  onReject?: () => void;
}

export default function CookieBanner({ onAccept, onReject }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('mokka-cookie-consent');
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('mokka-cookie-consent', 'accepted');
    setIsVisible(false);
    
    // Enable tracking pixels/analytics
    if (onAccept) {
      onAccept();
    }
    
    // Placeholder for pixel code - you can replace this with actual implementation
    console.log('🍪 Cookies accepted - enabling tracking pixels');
    // Example: window.fbq('consent', 'grant');
    // Example: gtag('consent', 'update', { 'analytics_storage': 'granted' });
  };

  const handleReject = () => {
    localStorage.setItem('mokka-cookie-consent', 'rejected');
    setIsVisible(false);
    
    if (onReject) {
      onReject();
    }
    
    console.log('🚫 Cookies rejected - no tracking enabled');
  };

  const handleDismiss = () => {
    // If user dismisses without choosing, treat as rejection
    handleReject();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-4 left-4 right-4 z-50 max-w-2xl mx-auto"
      >
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-mokka-tq/20 rounded-full flex items-center justify-center">
                <Cookie className="w-5 h-5 text-mokka-tq" />
              </div>
              <div>
                <h3 className="font-semibold text-mokka-gy">Бисквитки</h3>
                <p className="text-sm text-mokka-gy/70">Ние използваме бисквитки за подобряване на вашето изживяване</p>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="text-mokka-gy/50 hover:text-mokka-gy transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-mokka-gy/80 text-sm leading-relaxed mb-4">
              Използваме необходими бисквитки за функционирането на сайта и аналитични бисквитки 
              за да разберем как използвате нашия сайт. Маркетинговите бисквитки се използват 
              само с вашето съгласие.
            </p>

            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 mb-4"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-mokka-gy/70">Необходими бисквитки</span>
                  <span className="text-green-600 font-medium">Включени</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-mokka-gy/70">Аналитични бисквитки</span>
                  <span className="text-blue-600 font-medium">Съгласие</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-mokka-gy/70">Маркетингови бисквитки</span>
                  <span className="text-purple-600 font-medium">Съгласие</span>
                </div>
              </motion.div>
            )}

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm text-mokka-tq hover:text-mokka-tq/80 transition-colors"
            >
              <Settings className="w-4 h-4" />
              {showDetails ? 'Скрий детайли' : 'Покажи детайли'}
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAccept}
              className="flex-1 bg-mokka-tq hover:bg-mokka-tq/90 text-white"
            >
              Приемам всички
            </Button>
            
            <Button
              onClick={handleReject}
              variant="outline"
              className="flex-1 border-mokka-gy/30 text-mokka-gy hover:bg-mokka-gy/5"
            >
              Отхвърлям
            </Button>
          </div>

          {/* Links */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-4 text-xs text-mokka-gy/60">
              <Link href="/privacy" className="hover:text-mokka-tq transition-colors">
                Политика за поверителност
              </Link>
              <Link href="/cookies" className="hover:text-mokka-tq transition-colors">
                Политика за бисквитки
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
