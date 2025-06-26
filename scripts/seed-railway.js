#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function flushDatabase() {
  console.log('🧹 Flushing existing data...');
  
  // Delete in order to respect foreign key constraints
  await prisma.timelineEvent.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.charger.deleteMany();
  await prisma.site.deleteMany();
  await prisma.customer.deleteMany();
  
  console.log('✅ Database flushed successfully');
}

async function main() {
  console.log('🌱 Starting Railway database seeding...');
  
  try {
    // Check if data already exists
    const existingCustomers = await prisma.customer.count();
    const existingIncidents = await prisma.incident.count();
    
    console.log(`📊 Found ${existingCustomers} customers and ${existingIncidents} incidents`);
    
    if (existingCustomers > 0 || existingIncidents > 0) {
      console.log('🔄 Existing data found, flushing database...');
      await flushDatabase();
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
    const allChargers = [];
    for (const customer of customers) {
      for (let s = 0; s < 5; s++) {
        const site = await prisma.site.create({
          data: { name: `Site ${s + 1} of ${customer.name}`, customerId: customer.id },
        });
        for (let c = 0; c < 5; c++) {
          const charger = await prisma.charger.create({
            data: { identifier: `CH-${s}-${c}-${customer.id}`, siteId: site.id },
          });
          allChargers.push(charger);
        }
      }
    }
    console.log('✅ Created sites and chargers');

    const sites = await prisma.site.findMany();
    console.log('🚨 Creating sample incidents...');
    for (let i = 0; i < 10; i++) {
      const site = sites[i % sites.length];
      const customer = customers.find(c => c.id === site.customerId);
      
      // Get some chargers for this site
      const siteChargers = allChargers.filter(c => c.siteId === site.id);
      const selectedChargers = siteChargers.slice(0, Math.min(2, siteChargers.length));
      
      await prisma.incident.create({
        data: {
          title: `Sample Incident ${i + 1}`,
          description: `Demo incident for testing - ${i % 3 === 0 ? 'Charger offline' : i % 3 === 1 ? 'Network connectivity issue' : 'Power supply problem'}`,
          source: 'MANUAL',
          priority: i % 4 === 0 ? 'CRITICAL' : i % 4 === 1 ? 'HIGH' : i % 4 === 2 ? 'MEDIUM' : 'LOW',
          severityLevel: i % 5 === 0 ? 'SEV0' : i % 5 === 1 ? 'SEV1' : i % 5 === 2 ? 'SEV1A' : i % 5 === 3 ? 'SEV2' : 'SEV3',
          faultReported: i % 3 === 0 ? 'Long Term Unavailable (LTU)' : i % 3 === 1 ? 'Network Timeout' : 'Power Failure',
          inScope: i % 2 === 0,
          customerId: customer.id,
          siteId: site.id,
          chargers: {
            connect: selectedChargers.map(c => ({ id: c.id }))
          },
          tags: ['demo', i % 2 === 0 ? 'charger' : 'network', i % 3 === 0 ? 'critical' : 'normal'],
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