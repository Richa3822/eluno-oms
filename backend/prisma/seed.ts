import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';


const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const STORES = ['HSR Layout', 'Mantri Mall'];
const LENS_TYPES = ['SINGLE_VISION', 'PROGRESSIVE', 'BIFOCAL'];
const COATINGS = ['AR', 'BLUE_CUT', 'PHOTOCHROMIC', 'NONE'];
const TAT_HOURS: Record<string, number> = {
  SINGLE_VISION: 24,
  PROGRESSIVE: 72,
  BIFOCAL: 48,
};

const STAGES = [
  'ORDER_PLACED',
  'LENS_CUTTING',
  'QC_CHECK',
  'QC_PASSED',
  'QC_FAILED',
  'DISPATCH',
  'DELIVERED',
];

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

function hoursFromNow(h: number) {
  return new Date(Date.now() + h * 60 * 60 * 1000);
}

async function main() {
  // 1. SLA Config (idempotent)
  console.log('Seeding SLA config...');
  await prisma.slaConfig.createMany({
    data: [
      { lensType: 'SINGLE_VISION', tatHours: 24 },
      { lensType: 'PROGRESSIVE', tatHours: 72 },
      { lensType: 'BIFOCAL', tatHours: 48 },
    ],
    skipDuplicates: true,
  });

  // 2. Lens Inventory (idempotent)
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

  // 3. Realistic Orders (18 orders, mix of stages, breach states, stores, lens types)
  console.log('Seeding orders...');

  const customers = [
    'Anjali Rao', 'Vikram Singh', 'Sneha Patel', 'Arjun Reddy', 'Meera Iyer',
    'Karan Malhotra', 'Divya Nair', 'Rohan Gupta', 'Pooja Desai', 'Sahil Khan',
    'Neha Joshi', 'Aditya Verma', 'Tanvi Shah', 'Rajesh Kumar', 'Ishita Bose',
    'Yash Agarwal', 'Priyanka Menon', 'Kunal Chopra',
  ];

  // Each entry: [lensType, coating, hoursOld, currentStage]
  // hoursOld = how many hours ago order was placed (drives slaDeadline calc)
  const orderPlans: [string, string, number, string][] = [
    // Already BREACHED (slaDeadline in the past)
    ['SINGLE_VISION', 'AR', 30, 'LENS_CUTTING'],       // 24h SLA, 30h old -> breached by 6h
    ['SINGLE_VISION', 'BLUE_CUT', 28, 'QC_CHECK'],     // breached by 4h
    ['BIFOCAL', 'PHOTOCHROMIC', 52, 'QC_FAILED'],      // 48h SLA, breached by 4h

    // AT RISK (0-4 hours remaining)
    ['SINGLE_VISION', 'AR', 22, 'QC_CHECK'],           // 2h remaining
    ['SINGLE_VISION', 'NONE', 21, 'LENS_CUTTING'],     // 3h remaining
    ['BIFOCAL', 'AR', 45, 'QC_CHECK'],                 // 3h remaining

    // Healthy / plenty of time
    ['PROGRESSIVE', 'AR', 10, 'LENS_CUTTING'],
    ['PROGRESSIVE', 'BLUE_CUT', 5, 'ORDER_PLACED'],
    ['SINGLE_VISION', 'AR', 2, 'ORDER_PLACED'],
    ['SINGLE_VISION', 'BLUE_CUT', 1, 'LENS_CUTTING'],
    ['BIFOCAL', 'NONE', 8, 'QC_PASSED'],
    ['PROGRESSIVE', 'PHOTOCHROMIC', 15, 'QC_CHECK'],
    ['SINGLE_VISION', 'AR', 4, 'ORDER_PLACED'],

    // Completed (DISPATCH / DELIVERED)
    ['SINGLE_VISION', 'AR', 20, 'DISPATCH'],
    ['PROGRESSIVE', 'AR', 60, 'DELIVERED'],
    ['BIFOCAL', 'BLUE_CUT', 40, 'DELIVERED'],
    ['SINGLE_VISION', 'PHOTOCHROMIC', 18, 'DISPATCH'],
    ['PROGRESSIVE', 'NONE', 50, 'QC_PASSED'],
  ];

  for (let i = 0; i < orderPlans.length; i++) {
    const [lensType, coating, hoursOld, stage] = orderPlans[i];
    const tat = TAT_HOURS[lensType];
    const createdAt = hoursAgo(hoursOld);
    const slaDeadline = new Date(createdAt.getTime() + tat * 60 * 60 * 1000);
    const store = STORES[i % STORES.length];
    const customerName = customers[i];

    const order = await prisma.order.create({
      data: {
        customerName,
        storeLocation: store,
        prescription: {
          rightEye: { sph: -1.5, cyl: -0.5, axis: 90 },
          leftEye: { sph: -1.75, cyl: -0.25, axis: 85 },
        },
        lensType,
        lensIndex: '1.56',
        coating,
        status: stage,
        slaDeadline,
        createdAt,
        updatedAt: createdAt,
      },
    });

    // Build a realistic status log trail leading to current stage
    const stageIndex = STAGES.indexOf(stage);
    const trail = STAGES.slice(0, stageIndex + 1);
    if (stage === 'QC_FAILED') {
      trail.splice(-1, 0, 'QC_CHECK'); // ensure QC_CHECK precedes QC_FAILED
    }

    let logTime = createdAt;
    const stepGap = (Date.now() - createdAt.getTime()) / (trail.length || 1);

    for (let j = 0; j < trail.length; j++) {
      await prisma.orderStatusLog.create({
        data: {
          orderId: order.id,
          fromStatus: j === 0 ? null : trail[j - 1],
          toStatus: trail[j],
          reason:
            j === 0
              ? 'Order placed'
              : trail[j] === 'QC_FAILED'
              ? 'Coating defect found during inspection'
              : `Moved to ${trail[j]}`,
          updatedBy: j === 0 ? 'system' : 'ops_team',
          createdAt: logTime,
        },
      });
      logTime = new Date(logTime.getTime() + stepGap);
    }
  }

  console.log(`✅ Seed complete! Created ${orderPlans.length} orders.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });