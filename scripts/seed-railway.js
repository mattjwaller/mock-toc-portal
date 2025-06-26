#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Railway database seeding...');
  
  try {
    // Check if data already exists
    const existingCustomers = await prisma.customer.count();
    const existingIncidents = await prisma.incident.count();
    
    console.log(`📊 Found ${existingCustomers} customers and ${existingIncidents} incidents`);
    
    if (existingCustomers > 0 && existingIncidents > 0) {
      console.log('✅ Database already contains data, skipping seeding');
      return;
    }
    
    // create customers
    console.log('👥 Creating customers...');
    const customers = await Promise.all(
      Array.from({ length: 3 }).map((_, i) =>
        prisma.customer.create({ data: { name: `Customer ${i + 1}` } })
      )
    );
    console.log(`✅ Created ${customers.length} customers`);
    
    // create sites and chargers
    console.log('🏢 Creating sites and chargers...');
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
    console.log('🚨 Creating sample incidents...');
    for (let i = 0; i < 10; i++) {
      await prisma.incident.create({
        data: {
          title: `Sample Incident ${i + 1}`,
          description: 'Demo incident for testing',
          source: 'MANUAL',
          priority: 'MEDIUM',
          severityLevel: i % 2 === 0 ? 'SEV2' : 'SEV3',
          siteId: sites[i % sites.length].id,
          tags: ['demo'],
        },
      });
    }
    console.log('✅ Created 10 sample incidents');
    
    console.log('🎉 Railway database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main().catch((e) => {
  console.error('❌ Seeding failed:', e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
}); 