import { Job } from "bullmq";
import { DexRouter } from "../engine/dexRouter.js";
import { PrismaClient } from "@prisma/client";

const router = new DexRouter();
const prisma = new PrismaClient();

export const executionProcessor = async (job: Job) => {
    const { inputToken, outputToken, amount } = job.data;
    console.log(`[Worker] Processing Job ${job.id}: ${amount} ${inputToken} -> ${outputToken}`);

    const order = await prisma.order.create({
        data: {
            inputToken,
            outputToken,
            amount,
            status: 'ROUTING'
        }
    });

    try {
        await job.updateProgress(10);
        const quote = await router.getBestQuote(inputToken, outputToken, amount);

        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: 'BUILDING',
                dex: quote.dex
            }
        });

        await job.updateProgress(50);
        console.log(`[Worker] Executing via ${quote.dex}...`);
        const result = await router.executeSwap(quote);

        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: 'CONFIRMED',
                txHash: result.txHash,
                executedPrice: result.executedPrice
            }
        });

        await job.updateProgress(100);
        console.log(`[Worker] Order ${order.id} CONFIRMED: ${result.txHash}`);

        return { orderId: order.id, ...result };
    } catch (error) {
        console.error(`[Worker] Failed: `, error);
        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: 'FAILED',
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        });
        throw error
    }
};