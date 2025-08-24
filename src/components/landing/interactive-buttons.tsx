'use client'

import { Button } from '@/components/ui/button'
import { Utensils, Calendar, Bell, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'

// Menu Button - Scrolls to menu section
export const MenuButton = () => {
  const handleMenuClick = () => {
    const menuSection = document.querySelector('[data-section="menu"]')
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' })
    } else {
      toast.info('Менюто ще бъде достъпно скоро!')
    }
  }

  return (
    <Button size="lg" className="bg-mokka-tq hover:bg-mokka-tq/90 text-white" onClick={handleMenuClick}>
      <Utensils className="w-5 h-5 mr-2" />
      Виж менюто
    </Button>
  )
}

// RSVP Button - Opens RSVP form or shows info
export const RSVPButton = ({ sessionId }: { sessionId?: string }) => {
  const handleRSVP = () => {
    if (sessionId) {
      // TODO: Implement RSVP form for specific session
      toast.info(`RSVP за сесия ${sessionId} - формата ще бъде достъпна скоро!`)
    } else {
      // General RSVP button
      toast.info('RSVP формата ще бъде достъпна скоро!')
    }
  }

  return (
    <Button 
      className={sessionId ? "w-full bg-mokka-tq hover:bg-mokka-tq/90" : "bg-mokka-tq hover:bg-mokka-tq/90 text-white"}
      onClick={handleRSVP}
    >
      <Calendar className="w-4 h-4 mr-2" />
      RSVP
    </Button>
  )
}

// Remind Button - Opts into party reminders
export const RemindButton = () => {
  const handleRemind = () => {
    // TODO: Implement reminder opt-in form
    toast.info('Формата за напомняния ще бъде достъпна скоро!')
  }

  return (
    <Button 
      variant="outline" 
      className="w-full border-mokka-br text-mokka-br hover:bg-mokka-br hover:text-white"
      onClick={handleRemind}
    >
      <Bell className="w-4 h-4 mr-2" />
      Напомни ми
    </Button>
  )
}

// Order Button - Handles menu item ordering
export const OrderButton = ({ itemId }: { itemId: string }) => {
  const handleOrder = () => {
    // TODO: Implement ordering system
    toast.info(`Поръчка за артикул ${itemId} - системата ще бъде достъпна скоро!`)
  }

  return (
    <Button 
      size="sm" 
      variant="outline"
      onClick={handleOrder}
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      Поръчай
    </Button>
  )
}

// Export all buttons as a namespace
export const InteractiveButtons = {
  MenuButton,
  RSVPButton,
  RemindButton,
  OrderButton
}
