import { RaydiumMock, MeteoraMock } from "./mocks.js";
import type { Quote } from "./mocks.js";

const raydium = new RaydiumMock();
const meteora = new MeteoraMock();

export class DexRouter {
    // get quotes from both and return the best quore
    async getBestQuote(tokenIn: string, tokenOut: string, amount: number): Promise<Quote> {
        console.log(`[Router] Fetching quotes for ${amount} ${tokenIn} -> ${tokenOut}...`);

        const [q1, q2] = await Promise.all([
            raydium.getQuote(tokenIn, tokenOut, amount),
            meteora.getQuote(tokenIn, tokenOut, amount)
        ]);

        console.log(`[Router] Raydium: $${q1.price.toFixed(2)} | Meteora: $${q2.price.toFixed(2)}`);

        return q1.price > q2.price ? q1 : q2;
    }

    async executeSwap(quote: Quote) {
        console.log(`[Router] Executing on ${quote.dex} at $${quote.price.toFixed(2)}...`);

        await new Promise(r => setTimeout(r, 2000));
        return {
            txHash: "tx_" + Math.random().toString(36).substring(7),
            executedPrice: quote.price
        };
    }
}