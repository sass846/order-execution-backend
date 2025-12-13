import { Job } from "bullmq";
import { DexRouter } from "../engine/dexRouter.js";
import { redisPublisher } from "../redis.js";
import { prisma } from "../prisma.js";

const router = new DexRouter();

export const executionProcessor = async (job: Job) => {
  // Get the existing orderId from the job (passed by API)
  const { orderId, inputToken, outputToken, amount } = job.data;
  console.log(
    `[Worker] Processing Job ${job.id} for Order ${orderId}: ${amount} ${inputToken} -> ${outputToken}`
  );

  await new Promise(r => setTimeout(r, 1000));

  const publishUpdate = async (status: string, data: any = {}) => {
    await redisPublisher.publish(
      `order:${orderId}`,
      JSON.stringify({ orderId, status, ...data })
    );
  };

  try {
    // Routing
    await job.updateProgress(10);
    await publishUpdate("routing");

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "routing" },
    });

    const quote = await router.getBestQuote(inputToken, outputToken, amount);

    // Building
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "building",
        dex: quote.dex,
      },
    });

    await publishUpdate("building", { dex: quote.dex, price: quote.price });

    // Execution
    await job.updateProgress(50);

    // Submitted
    await publishUpdate("submitted");
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "submitted" },
    });

    console.log(`[Worker] Executing via ${quote.dex}...`);
    const result = await router.executeSwap(quote);

    // Finalize
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "confirmed",
        txHash: result.txHash,
        executedPrice: result.executedPrice,
      },
    });

    await job.updateProgress(100);
    await publishUpdate("confirmed", {
      txHash: result.txHash,
      executedPrice: result.executedPrice,
    });

    console.log(`[Worker] Order ${orderId} CONFIRMED: ${result.txHash}`);

    return { orderId, ...result };
  } catch (error) {
    console.error(`[Worker] Failed: `, error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "failed",
        error: errorMessage,
      },
    });

    await publishUpdate("failed", { error: errorMessage });
    throw error;
  }
};
