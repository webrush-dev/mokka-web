import { NextRequest, NextResponse } from 'next/server'
import { prisma, stringifyTags } from '@/lib/db'
import { z } from 'zod'

const notifySchema = z.object({
  email: z.string().email('Невалиден имейл адрес'),
  phone: z.string().optional(),
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
    const validatedData = notifySchema.parse(body)

    // Check if lead already exists
    const existingLead = await prisma.lead.findUnique({
      where: { email: validatedData.email }
    })

    if (existingLead) {
      // Update existing lead to include party tag
      const currentTags = JSON.parse(existingLead.tags || '[]')
      if (!currentTags.includes('party')) {
        currentTags.push('party')
        await prisma.lead.update({
          where: { id: existingLead.id },
          data: { tags: stringifyTags(currentTags) }
        })
      }
    } else {
      // Create new lead with party tag
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

      await prisma.lead.create({
        data: {
          email: validatedData.email,
          phone: validatedData.phone,
          source: 'party_reminder',
          consentMarketing: true, // Party reminders require consent
          tags: stringifyTags(['party']),
          locale: validatedData.locale,
          utmId,
        }
      })
    }

    // TODO: Send calendar invite email via Resend
    // TODO: Track analytics event

    return NextResponse.json({
      success: true,
      message: 'Ще получите напомняне за партито!',
      calendarUrl: '/api/ics/launch-party.ics'
    })

  } catch (error) {
    console.error('Party reminder error:', error)
    
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
