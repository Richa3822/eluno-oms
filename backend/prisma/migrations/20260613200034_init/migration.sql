-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "storeLocation" TEXT NOT NULL,
    "prescription" JSONB NOT NULL,
    "frameId" TEXT,
    "lensType" TEXT NOT NULL,
    "lensIndex" TEXT NOT NULL,
    "coating" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ORDER_PLACED',
    "slaDeadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStatusLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "reason" TEXT,
    "updatedBy" TEXT NOT NULL DEFAULT 'system',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LensInventory" (
    "id" TEXT NOT NULL,
    "powerSph" DOUBLE PRECISION NOT NULL,
    "powerCyl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "powerAxis" INTEGER NOT NULL DEFAULT 0,
    "lensType" TEXT NOT NULL,
    "lensIndex" TEXT NOT NULL,
    "coating" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LensInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlaConfig" (
    "id" TEXT NOT NULL,
    "lensType" TEXT NOT NULL,
    "tatHours" INTEGER NOT NULL,

    CONSTRAINT "SlaConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreachAlert" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "predictedBreachAt" TIMESTAMP(3) NOT NULL,
    "alertSentAt" TIMESTAMP(3),
    "channel" TEXT,
    "breachRisk" TEXT,
    "riskReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BreachAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SlaConfig_lensType_key" ON "SlaConfig"("lensType");

-- AddForeignKey
ALTER TABLE "OrderStatusLog" ADD CONSTRAINT "OrderStatusLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreachAlert" ADD CONSTRAINT "BreachAlert_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
