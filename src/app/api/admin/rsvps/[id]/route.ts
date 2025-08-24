import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateRSVPSchema = z.object({
  name: z.string().min(1, 'Името е задължително'),
  email: z.string().email('Невалиден имейл адрес'),
  phone: z.string().optional(),
  seats: z.number().min(1, 'Трябва поне 1 място'),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']),
  sessionId: z.string().min(1, 'Сесията е задължителна')
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateRSVPSchema.parse(body)

    // Get current RSVP to check seat changes
    const currentRSVP = await prisma.rSVP.findUnique({
      where: { id },
      include: { session: true }
    })

    if (!currentRSVP) {
      return NextResponse.json(
        { error: 'Резервацията не е намерена' },
        { status: 404 }
      )
    }

    // Check if changing session
    if (validatedData.sessionId !== currentRSVP.sessionId) {
      // Check capacity of new session
      const newSession = await prisma.eventSession.findUnique({
        where: { id: validatedData.sessionId }
      })

      if (!newSession) {
        return NextResponse.json(
          { error: 'Новата сесия не е намерена' },
          { status: 404 }
        )
      }

      const availableSeats = newSession.capacity - newSession.reserved
      if (validatedData.seats > availableSeats) {
        return NextResponse.json(
          { error: `Няма достатъчно места в новата сесия. Доступни: ${availableSeats}` },
          { status: 409 }
        )
      }

      // Update both sessions
      await prisma.$transaction([
        // Remove seats from old session
        prisma.eventSession.update({
          where: { id: currentRSVP.sessionId },
          data: { reserved: { decrement: currentRSVP.seats } }
        }),
        // Add seats to new session
        prisma.eventSession.update({
          where: { id: validatedData.sessionId },
          data: { reserved: { increment: validatedData.seats } }
        }),
        // Update RSVP
        prisma.rSVP.update({
          where: { id },
          data: validatedData
        })
      ])
    } else {
      // Same session, just update seats
      const seatDifference = validatedData.seats - currentRSVP.seats
      
      if (seatDifference > 0) {
        // Adding seats
        const availableSeats = currentRSVP.session.capacity - currentRSVP.session.reserved
        if (seatDifference > availableSeats) {
          return NextResponse.json(
            { error: `Няма достатъчно места. Доступни: ${availableSeats}` },
            { status: 409 }
          )
        }
      }

      // Update session and RSVP
      await prisma.$transaction([
        prisma.eventSession.update({
          where: { id: currentRSVP.sessionId },
          data: { reserved: { increment: seatDifference } }
        }),
        prisma.rSVP.update({
          where: { id },
          data: validatedData
        })
      ])
    }

    return NextResponse.json({
      success: true,
      message: 'Резервацията е обновена успешно'
    })

  } catch (error) {
    console.error('Error updating RSVP:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Невалидни данни', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Възникна грешка при обновяването на резервацията' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get RSVP to check seats
    const rsvp = await prisma.rSVP.findUnique({
      where: { id },
      include: { session: true }
    })

    if (!rsvp) {
      return NextResponse.json(
        { error: 'Резервацията не е намерена' },
        { status: 404 }
      )
    }

    // Delete RSVP and update session capacity
    await prisma.$transaction([
      prisma.rSVP.delete({
        where: { id }
      }),
      prisma.eventSession.update({
        where: { id: rsvp.sessionId },
        data: { reserved: { decrement: rsvp.seats } }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Резервацията е изтрита успешно'
    })

  } catch (error) {
    console.error('Error deleting RSVP:', error)
    return NextResponse.json(
      { error: 'Възникна грешка при изтриването на резервацията' },
      { status: 500 }
    )
  }
}
