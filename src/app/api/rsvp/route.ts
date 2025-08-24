import { NextRequest, NextResponse } from 'next/server'
import { prisma, stringifyTags } from '@/lib/db'
import { z } from 'zod'

const rsvpSchema = z.object({
  name: z.string().min(1, 'Името е задължително'),
  email: z.string().email('Невалиден имейл адрес'),
  phone: z.string().optional(),
  sessionId: z.string().min(1, 'Трябва да изберете сесия'),
  seats: z.number().min(1, 'Трябва да резервирате поне 1 място'),
  locale: z.string().default('bg'),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  utm_term: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = rsvpSchema.parse(body)

    // Check if session exists and has capacity
    const session = await prisma.eventSession.findUnique({
      where: { id: validatedData.sessionId },
      include: { event: true }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Сесията не е намерена' },
        { status: 404 }
      )
    }

    // Check if requested seats exceed capacity
    if (validatedData.seats > session.capacity) {
      return NextResponse.json(
        { error: 'Заявеният брой места надвишава капацитета на сесията' },
        { status: 400 }
      )
    }

    // Check if there are enough available seats
    if (session.reserved + validatedData.seats > session.capacity) {
      return NextResponse.json(
        { error: `Няма достатъчно свободни места. Доступни: ${session.capacity - session.reserved}` },
        { status: 409 }
      )
    }



    // Check if user already has an active RSVP for this session
    // Allow new reservations if previous ones are cancelled, in the past, or for different events
    const existingRSVP = await prisma.rSVP.findFirst({
      where: {
        email: validatedData.email,
        sessionId: validatedData.sessionId,
        status: {
          not: 'CANCELLED'
        }
      },
      include: {
        session: true
      }
    })

    if (existingRSVP) {
      // Check if the existing RSVP is for a past session
      const now = new Date()
      const sessionStart = new Date(existingRSVP.session.start)
      
      if (sessionStart > now) {
        // Session is in the future, don't allow duplicate
        return NextResponse.json(
          { error: 'Вече имате активна резервация за тази сесия' },
          { status: 409 }
        )
      }
    }

    // Check if user has any conflicting future RSVPs for the same event
    // This prevents double-booking across different sessions of the same event
    const conflictingRSVP = await prisma.rSVP.findFirst({
      where: {
        email: validatedData.email,
        status: {
          not: 'CANCELLED'
        },
        session: {
          eventId: session.eventId,
          start: {
            gt: new Date() // Only check future sessions
          }
        }
      }
    })

    if (conflictingRSVP) {
      return NextResponse.json(
        { error: 'Вече имате активна резервация за друго време на същото събитие' },
        { status: 409 }
      )
    }

    // Create or find UTM data
    let utmId: string | undefined
    if (validatedData.utm_source || validatedData.utm_campaign) {
      const utm = await prisma.uTM.upsert({
        where: {
          id: `${validatedData.utm_source || 'direct'}-${validatedData.utm_campaign || 'none'}`
        },
        update: {},
        create: {
          id: `${validatedData.utm_source || 'direct'}-${validatedData.utm_campaign || 'none'}`,
          source: validatedData.utm_source,
          medium: validatedData.utm_medium,
          campaign: validatedData.utm_campaign,
          content: validatedData.utm_content,
          term: validatedData.utm_term,
        }
      })
      utmId = utm.id
    }

    // Generate unique reservation code
    const generateReservationCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let result = ''
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }

    let reservationCode: string
    let attempts = 0
    const maxAttempts = 10

    do {
      reservationCode = generateReservationCode()
      attempts++
      
      if (attempts > maxAttempts) {
        return NextResponse.json(
          { error: 'Грешка при генерирането на код за резервация' },
          { status: 500 }
        )
      }
    } while (await prisma.rSVP.findUnique({ where: { reservationCode } }))

    // Create RSVP and update session capacity
    const [rsvp] = await prisma.$transaction([
      prisma.rSVP.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          sessionId: validatedData.sessionId,
          seats: validatedData.seats,
          status: 'PENDING',
          reservationCode,
          utmId,
        }
      }),
      prisma.eventSession.update({
        where: { id: validatedData.sessionId },
        data: { reserved: { increment: validatedData.seats } }
      })
    ])

    // TODO: Send confirmation email via Resend
    // TODO: Track analytics event

    return NextResponse.json({
      success: true,
      message: 'Резервацията е направена успешно!',
      rsvpId: rsvp.id,
      reservationCode: rsvp.reservationCode,
      session: {
        title: session.event.title,
        start: session.start,
        end: session.end,
        seats: validatedData.seats
      }
    })

  } catch (error) {
    console.error('RSVP submission error:', error)
    
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
