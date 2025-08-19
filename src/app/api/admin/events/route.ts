import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const eventSchema = z.object({
  title: z.string().min(1, 'Заглавието е задължително'),
  description: z.string().min(1, 'Описанието е задължително'),
  isTicketed: z.boolean(),
  sessions: z.array(z.object({
    start: z.string().min(1, 'Началното време е задължително'),
    end: z.string().min(1, 'Крайното време е задължително'),
    capacity: z.number().min(1, 'Капацитетът трябва да е поне 1')
  })).min(1, 'Поне една сесия е задължителна')
})

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        sessions: {
          orderBy: { start: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Грешка при зареждане на събитията' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = eventSchema.parse(body)

    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Create event with sessions in a transaction
    const event = await prisma.$transaction(async (tx) => {
      const newEvent = await tx.event.create({
        data: {
          slug,
          title: validatedData.title,
          description: validatedData.description,
          isTicketed: validatedData.isTicketed
        }
      })

      // Create sessions
      const sessions = await Promise.all(
        validatedData.sessions.map(session => 
          tx.eventSession.create({
            data: {
              eventId: newEvent.id,
              start: new Date(session.start),
              end: new Date(session.end),
              capacity: session.capacity,
              reserved: 0
            }
          })
        )
      )

      return { ...newEvent, sessions }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Събитието е създадено успешно!',
      event 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Невалидни данни', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Грешка при създаване на събитието' },
      { status: 500 }
    )
  }
}
