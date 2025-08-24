import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const cancelSchema = z.object({
  reservationCode: z.string().min(1, 'Кодът за резервация е задължителен'),
  action: z.literal('cancel')
})

const modifySchema = z.object({
  reservationCode: z.string().min(1, 'Кодът за резервация е задължителен'),
  action: z.literal('modify'),
  rsvpId: z.string().min(1, 'ID на резервацията е задължително'),
  newSeats: z.number().min(1, 'Трябва поне 1 място')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // First, find the RSVP by reservation code to verify ownership
    const rsvp = await prisma.rSVP.findUnique({
      where: { reservationCode: body.reservationCode },
      include: { session: true }
    })

    if (!rsvp) {
      return NextResponse.json(
        { error: 'Кодът за резервация не е намерен' },
        { status: 404 }
      )
    }

    if (body.action === 'cancel') {
      const validatedData = cancelSchema.parse(body)
      
      // Cancel all RSVPs for this user (by email)
      const userRSVPs = await prisma.rSVP.findMany({
        where: { email: rsvp.email },
        include: { session: true }
      })

      // Update all RSVPs to cancelled and free up seats
      await prisma.$transaction([
        ...userRSVPs.map(rsvp => 
          prisma.rSVP.update({
            where: { id: rsvp.id },
            data: { status: 'CANCELLED' }
          })
        ),
        ...userRSVPs.map(rsvp =>
          prisma.eventSession.update({
            where: { id: rsvp.sessionId },
            data: { reserved: { decrement: rsvp.seats } }
          })
        )
      ])

      return NextResponse.json({
        success: true,
        message: 'Всички резервации са отменени успешно'
      })

    } else if (body.action === 'modify') {
      const validatedData = modifySchema.parse(body)
      
      // Find the specific RSVP to modify
      const rsvpToModify = await prisma.rSVP.findUnique({
        where: { id: validatedData.rsvpId },
        include: { session: true }
      })

      if (!rsvpToModify) {
        return NextResponse.json(
          { error: 'Резервацията не е намерена' },
          { status: 404 }
        )
      }

      // Verify this RSVP belongs to the same user (same email)
      if (rsvpToModify.email !== rsvp.email) {
        return NextResponse.json(
          { error: 'Нямате достъп до тази резервация' },
          { status: 403 }
        )
      }

      // Check if new seats exceed capacity
      if (validatedData.newSeats > rsvpToModify.session.capacity) {
        return NextResponse.json(
          { error: 'Заявеният брой места надвишава капацитета на сесията' },
          { status: 400 }
        )
      }

      // Calculate seat difference
      const seatDifference = validatedData.newSeats - rsvpToModify.seats
      
      // Check if there are enough available seats
      const availableSeats = rsvpToModify.session.capacity - rsvpToModify.session.reserved + rsvpToModify.seats
      if (seatDifference > availableSeats) {
        return NextResponse.json(
          { error: `Няма достатъчно свободни места. Доступни: ${availableSeats}` },
          { status: 409 }
        )
      }

      // Update RSVP and session capacity
      await prisma.$transaction([
        prisma.rSVP.update({
          where: { id: validatedData.rsvpId },
          data: { seats: validatedData.newSeats }
        }),
        prisma.eventSession.update({
          where: { id: rsvpToModify.sessionId },
          data: { reserved: { increment: seatDifference } }
        })
      ])

      return NextResponse.json({
        success: true,
        message: 'Резервацията е променена успешно'
      })
    }

    return NextResponse.json(
      { error: 'Невалидно действие' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Public RSVP management error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Невалидни данни', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Възникна грешка при обработката' },
      { status: 500 }
    )
  }
}
