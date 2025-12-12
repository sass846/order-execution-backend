-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'MARKET',
    "inputToken" TEXT NOT NULL,
    "outputToken" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "txHash" TEXT,
    "executedPrice" DOUBLE PRECISION,
    "dex" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderLog" ADD CONSTRAINT "OrderLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
