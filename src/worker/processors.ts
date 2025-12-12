import { Job } from "bullmq";
import { DexRouter } from "../engine/dexRouter.js";
import { PrismaClient } from "@prisma/client";
import { Redis } from "ioredis";

const router = new DexRouter();
const prisma = new PrismaClient();

const redisPublisher = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
});

export const executionProcessor = async (job: Job) => {
    // Get the existing orderId from the job (passed by API)
    const { orderId, inputToken, outputToken, amount } = job.data;
    console.log(`[Worker] Processing Job ${job.id} for Order ${orderId}: ${amount} ${inputToken} -> ${outputToken}`);

    const publishUpdate = async (status: string, data: any = {}) => {
        await redisPublisher.publish(`order: ${orderId}`, JSON.stringify({ orderId, status, ...data }));
    };

    try {

        // Routing
        await job.updateProgress(10);
        await publishUpdate('ROUTING');

        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'ROUTING' }
        });

        const quote = await router.getBestQuote(inputToken, outputToken, amount);

        // Building
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'BUILDING',
                dex: quote.dex
            }
        });

        await publishUpdate('BUILDING', { dex: quote.dex, price: quote.price });

        // Execution
        await job.updateProgress(50);
        console.log(`[Worker] Executing via ${quote.dex}...`);
        const result = await router.executeSwap(quote);

        // Finalize
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'CONFIRMED',
                txHash: result.txHash,
                executedPrice: result.executedPrice
            }
        });

        await job.updateProgress(100);
        await publishUpdate('CONFIRMED', { txHash: result.txHash, executedPrice: result.executedPrice });

        console.log(`[Worker] Order ${orderId} CONFIRMED: ${result.txHash}`);

        return { orderId, ...result };
    } catch (error) {
        console.error(`[Worker] Failed: `, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'FAILED',
                error: errorMessage
            }
        });

        await publishUpdate('FAILED', { error: errorMessage });
        throw error
    }
};