import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get all RSVPs with session and event information
    const rsvps = await prisma.rSVP.findMany({
      include: {
        session: {
          include: {
            event: true
          }
        }
      }
    })

    // Group RSVPs by event and session for better organization
    const organizedRSVPs = rsvps.reduce((acc, rsvp) => {
      const eventKey = rsvp.session.event.slug
      const sessionKey = rsvp.sessionId
      
      if (!acc[eventKey]) {
        acc[eventKey] = {
          event: {
            id: rsvp.session.event.id,
            slug: rsvp.session.event.slug,
            title: rsvp.session.event.title
          },
          sessions: {}
        }
      }
      
      if (!acc[eventKey].sessions[sessionKey]) {
        acc[eventKey].sessions[sessionKey] = {
                  session: {
          id: rsvp.session.id,
          start: rsvp.session.start.toISOString(),
          end: rsvp.session.end.toISOString(),
          capacity: rsvp.session.capacity,
          reserved: rsvp.session.reserved
        },
          rsvps: []
        }
      }
      
      acc[eventKey].sessions[sessionKey].rsvps.push({
        id: rsvp.id,
        name: rsvp.name,
        email: rsvp.email,
        phone: rsvp.phone || undefined,
        seats: rsvp.seats,
        status: rsvp.status,
        reservationCode: rsvp.reservationCode
      })
      
      return acc
    }, {} as Record<string, {
      event: { id: string; slug: string; title: string };
      sessions: Record<string, {
        session: { id: string; start: string; end: string; capacity: number; reserved: number };
        rsvps: Array<{
          id: string; name: string; email: string; phone?: string; seats: number; status: string; reservationCode: string;
        }>;
      }>;
    }>)

    // Calculate summary statistics
    const totalRSVPs = rsvps.length
    const totalSeats = rsvps.reduce((sum, rsvp) => sum + rsvp.seats, 0)
    const confirmedRSVPs = rsvps.filter(r => r.status === 'CONFIRMED').length
    const pendingRSVPs = rsvps.filter(r => r.status === 'PENDING').length
    const cancelledRSVPs = rsvps.filter(r => r.status === 'CANCELLED').length

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRSVPs,
          totalSeats,
          confirmedRSVPs,
          pendingRSVPs,
          cancelledRSVPs
        },
        organizedRSVPs
      }
    })

  } catch (error) {
    console.error('Error fetching RSVPs:', error)
    return NextResponse.json(
      { error: 'Възникна грешка при зареждането на резервациите' },
      { status: 500 }
    )
  }
}
