import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const manageSchema = z.object({
  email: z.string().email('Невалиден имейл адрес'),
  code: z.string().length(6, 'Кодът трябва да е 6 цифри'),
  action: z.enum(['cancel', 'modify']),
  rsvpId: z.string().optional(), // Required for modify action
  newSeats: z.number().min(1).optional() // Required for modify action
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = manageSchema.parse(body)

    // Verify the code
    const verification = await prisma.verificationCode.findUnique({
      where: { email: validatedData.email }
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'Невалиден код за потвърждение' },
        { status: 400 }
      )
    }

    if (verification.code !== validatedData.code) {
      return NextResponse.json(
        { error: 'Неверен код за потвърждение' },
        { status: 400 }
      )
    }

    if (verification.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Кодът за потвърждение е изтекъл' },
        { status: 400 }
      )
    }

    if (verification.action !== validatedData.action) {
      return NextResponse.json(
        { error: 'Невалидно действие за този код' },
        { status: 400 }
      )
    }

    // Get user's RSVPs
    const userRSVPs = await prisma.rSVP.findMany({
      where: { email: validatedData.email },
      include: {
        session: true
      }
    })

    if (userRSVPs.length === 0) {
      return NextResponse.json(
        { error: 'Няма намерени резервации' },
        { status: 404 }
      )
    }

    if (validatedData.action === 'cancel') {
      // Cancel all RSVPs for this user
      await Promise.all(
        userRSVPs.map(async (rsvp) => {
          const [updatedRSVP, updatedSession] = await prisma.$transaction([
            prisma.rSVP.update({
              where: { id: rsvp.id },
              data: { status: 'CANCELLED' }
            }),
            prisma.eventSession.update({
              where: { id: rsvp.sessionId },
              data: { reserved: { decrement: rsvp.seats } }
            })
          ])
          return { rsvp: updatedRSVP, session: updatedSession }
        })
      )

      // Delete verification code
      await prisma.verificationCode.delete({
        where: { email: validatedData.email }
      })

      return NextResponse.json({
        success: true,
        message: `Всички резервации са отменени успешно`,
        cancelledCount: userRSVPs.length
      })
    }

    if (validatedData.action === 'modify') {
      if (!validatedData.rsvpId || !validatedData.newSeats) {
        return NextResponse.json(
          { error: 'Необходими са ID на резервацията и новият брой места' },
          { status: 400 }
        )
      }

      const rsvp = userRSVPs.find(r => r.id === validatedData.rsvpId)
      if (!rsvp) {
        return NextResponse.json(
          { error: 'Резервацията не е намерена' },
          { status: 404 }
        )
      }

      const session = await prisma.eventSession.findUnique({
        where: { id: rsvp.sessionId }
      })

      if (!session) {
        return NextResponse.json(
          { error: 'Сесията не е намерена' },
          { status: 404 }
        )
      }

      const currentAvailable = session.capacity - session.reserved + rsvp.seats
      if (validatedData.newSeats > currentAvailable) {
        return NextResponse.json(
          { error: `Няма достатъчно свободни места. Доступни: ${currentAvailable}` },
          { status: 409 }
        )
      }

      // Update RSVP and session
      const [updatedRSVP, updatedSession] = await prisma.$transaction([
        prisma.rSVP.update({
          where: { id: rsvp.id },
          data: { seats: validatedData.newSeats }
        }),
        prisma.eventSession.update({
          where: { id: rsvp.sessionId },
          data: { 
            reserved: { 
              decrement: rsvp.seats,
              increment: validatedData.newSeats
            } 
          }
        })
      ])

      // Delete verification code
      await prisma.verificationCode.delete({
        where: { email: validatedData.email }
      })

      return NextResponse.json({
        success: true,
        message: `Резервацията е променена успешно на ${validatedData.newSeats} места`,
        rsvp: updatedRSVP,
        session: updatedSession
      })
    }

    return NextResponse.json(
      { error: 'Невалидно действие' },
      { status: 400 }
    )

  } catch (error) {
    console.error('RSVP management error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Невалидни данни', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Възникна грешка при управлението на резервацията' },
      { status: 500 }
    )
  }
}
