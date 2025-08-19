import { NextRequest, NextResponse } from 'next/server'
import { prisma, stringifyTags } from '@/lib/db'
import { z } from 'zod'

const rsvpSchema = z.object({
  name: z.string().min(1, 'Името е задължително'),
  email: z.string().email('Невалиден имейл адрес'),
  phone: z.string().optional(),
  sessionId: z.string().min(1, 'Трябва да изберете сесия'),
  seats: z.number().min(1).max(2, 'Максимум 2 места на резервация'),
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

    if (session.reserved + validatedData.seats > session.capacity) {
      return NextResponse.json(
        { error: 'Няма достатъчно свободни места' },
        { status: 409 }
      )
    }

    // Check if user already has an RSVP for this session
    const existingRSVP = await prisma.rSVP.findFirst({
      where: {
        email: validatedData.email,
        sessionId: validatedData.sessionId
      }
    })

    if (existingRSVP) {
      return NextResponse.json(
        { error: 'Вече имате резервация за тази сесия' },
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
