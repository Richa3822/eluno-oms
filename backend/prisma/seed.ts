import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  // Seed SLA Config
  console.log('Seeding SLA config...');
  await prisma.slaConfig.createMany({
    data: [
      { lensType: 'SINGLE_VISION', tatHours: 24 },
      { lensType: 'PROGRESSIVE', tatHours: 72 },
      { lensType: 'BIFOCAL', tatHours: 48 },
    ],
    skipDuplicates: true,
  });

  // Seed Lens Inventory
  console.log('Seeding lens inventory...');
  await prisma.lensInventory.createMany({
    data: [
      { powerSph: -1.0, powerCyl: -0.5, powerAxis: 180, lensType: 'SINGLE_VISION', lensIndex: '1.56', coating: 'AR', quantity: 5 },
      { powerSph: -2.0, powerCyl: 0, powerAxis: 0, lensType: 'SINGLE_VISION', lensIndex: '1.56', coating: 'BLUE_CUT', quantity: 3 },
      { powerSph: -3.0, powerCyl: -1.0, powerAxis: 90, lensType: 'PROGRESSIVE', lensIndex: '1.61', coating: 'AR', quantity: 2 },
      { powerSph: 1.0, powerCyl: 0, powerAxis: 0, lensType: 'SINGLE_VISION', lensIndex: '1.50', coating: 'NONE', quantity: 0 },
      { powerSph: -4.0, powerCyl: -1.5, powerAxis: 45, lensType: 'BIFOCAL', lensIndex: '1.67', coating: 'PHOTOCHROMIC', quantity: 4 },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });