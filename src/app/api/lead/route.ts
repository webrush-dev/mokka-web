import { NextRequest, NextResponse } from 'next/server'
import { prisma, stringifyTags } from '@/lib/db'
import { z } from 'zod'

const leadSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Невалиден имейл адрес'),
  phone: z.string().optional(),
  source: z.string().optional(),
  consentMarketing: z.boolean().refine(val => val === true, {
    message: 'Трябва да се съгласите с обработката на данните'
  }),
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
    const validatedData = leadSchema.parse(body)

    // Check if lead already exists
    const existingLead = await prisma.lead.findUnique({
      where: { email: validatedData.email }
    })

    if (existingLead) {
      return NextResponse.json(
        { error: 'Този имейл вече е регистриран' },
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

    // Create the lead
    const lead = await prisma.lead.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        source: validatedData.source || 'website',
        consentMarketing: validatedData.consentMarketing,
        tags: stringifyTags(['waitlist']), // Default to waitlist
        locale: validatedData.locale,
        utmId,
      }
    })

    // TODO: Send welcome email via Resend
    // TODO: Track analytics event

    return NextResponse.json({
      success: true,
      message: 'Успешно се присъединихте към списъка!',
      leadId: lead.id
    })

  } catch (error) {
    console.error('Lead submission error:', error)
    
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
