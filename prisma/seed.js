import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  
  // create customers
  const customers = await Promise.all(
    Array.from({ length: 3 }).map((_, i) =>
      prisma.customer.create({ data: { name: `Customer ${i + 1}` } })
    )
  );
  console.log(`✅ Created ${customers.length} customers`);
  
  // create sites and chargers
  for (const customer of customers) {
    for (let s = 0; s < 5; s++) {
      const site = await prisma.site.create({
        data: { name: `Site ${s + 1} of ${customer.name}`, customerId: customer.id },
      });
      for (let c = 0; c < 5; c++) {
        await prisma.charger.create({
          data: { identifier: `CH-${s}-${c}-${customer.id}`, siteId: site.id },
        });
      }
    }
  }
  console.log('✅ Created sites and chargers');

  const sites = await prisma.site.findMany();
  for (let i = 0; i < 10; i++) {
    await prisma.incident.create({
      data: {
        title: `Sample Incident ${i + 1}`,
        description: 'Demo incident',
        source: 'MANUAL',
        priority: 'MEDIUM',
        severityLevel: i % 2 === 0 ? 'SEV2' : 'SEV3',
        siteId: sites[i % sites.length].id,
        tags: ['demo'],
      },
    });
  }
  console.log('✅ Created 10 sample incidents');
  
  console.log('🎉 Database seeding completed successfully!');
}

main().catch((e) => {
  console.error('❌ Seeding failed:', e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
}); 