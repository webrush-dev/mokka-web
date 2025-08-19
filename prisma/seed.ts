import { PrismaClient } from '@prisma/client'
import { stringifyTags } from '../src/lib/db'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Coffee Tasting event
  const coffeeTasting = await prisma.event.upsert({
    where: { slug: 'coffee-tasting' },
    update: {},
    create: {
      slug: 'coffee-tasting',
      title: 'Coffee Tasting',
      description: 'Дегустация на специализирани кафета',
      isTicketed: true,
      sessions: {
        create: [
          {
            start: new Date('2025-09-05T18:30:00+03:00'),
            end: new Date('2025-09-05T19:30:00+03:00'),
            capacity: 12,
            reserved: 0,
          },
          {
            start: new Date('2025-09-05T19:30:00+03:00'),
            end: new Date('2025-09-05T20:30:00+03:00'),
            capacity: 12,
            reserved: 0,
          },
        ],
      },
    },
  })

  // Create Launch Party event
  const launchParty = await prisma.event.upsert({
    where: { slug: 'launch-party' },
    update: {},
    create: {
      slug: 'launch-party',
      title: 'Launch Party',
      description: 'Празнуваме откриването на новото Mokka!',
      isTicketed: false,
      sessions: {
        create: [
          {
            start: new Date('2025-09-06T17:00:00+03:00'),
            end: new Date('2025-09-06T20:00:00+03:00'),
            capacity: 100,
            reserved: 0,
          },
        ],
      },
    },
  })

  // Create some sample leads for testing
  const sampleLeads = [
    {
      name: 'Иван Петров',
      email: 'ivan@example.com',
      phone: '+359888123456',
      source: 'waitlist',
      consentMarketing: true,
      tags: stringifyTags(['waitlist']),
      locale: 'bg',
    },
    {
      name: 'Мария Георгиева',
      email: 'maria@example.com',
      phone: '+359888654321',
      source: 'loyalty',
      consentMarketing: true,
      tags: stringifyTags(['loyalty']),
      locale: 'bg',
    },
    {
      name: 'Петър Димитров',
      email: 'petar@example.com',
      phone: '+359888789123',
      source: 'party',
      consentMarketing: false,
      tags: stringifyTags(['party']),
      locale: 'bg',
    },
  ]

  for (const leadData of sampleLeads) {
    await prisma.lead.upsert({
      where: { email: leadData.email },
      update: {},
      create: leadData,
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`📅 Created events: ${coffeeTasting.title}, ${launchParty.title}`)
  console.log(`👥 Created ${sampleLeads.length} sample leads`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
