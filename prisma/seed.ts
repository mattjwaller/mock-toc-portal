import { PrismaClient, IncidentSource, IncidentPriority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // create customers
  const customers = await Promise.all(
    Array.from({ length: 3 }).map((_, i) =>
      prisma.customer.create({ data: { name: `Customer ${i + 1}` } })
    )
  );
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

  const sites = await prisma.site.findMany();
  for (let i = 0; i < 10; i++) {
    await prisma.incident.create({
      data: {
        title: `Sample Incident ${i + 1}`,
        description: 'Demo incident',
        source: IncidentSource.MANUAL,
        priority: IncidentPriority.MEDIUM,
        severityLevel: i % 2 === 0 ? 'SEV2' : 'SEV3',
        siteId: sites[i % sites.length].id,
        tags: ['demo'],
      },
    });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
