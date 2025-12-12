export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface Quote {
    price: number,
    fee: number,
    dex: 'Raydium' | 'Meteora';
}

export class RaydiumMock {
    async getQuote(tokenIn: string, tokenOut: string, amount: number): Promise<Quote> {
        await sleep(2500);

        // lets say 1 sol = 150 usdc
        const basePrice = 150;

        // add randomness
        const variance = (Math.random() * 0.04) - 0.02;
        const price = basePrice * (1 + variance);

        return {
            price,
            fee: 0.003,
            dex: 'Raydium'
        }
    }
}

export class MeteoraMock {
    async getQuote(tokenIn: string, tokenOut: string, amount: number): Promise<Quote> {
        await sleep(2000);

        const basePrice = 150;
        const variance = (Math.random() * 0.04) - 0.01;
        const price = basePrice * (1 + variance);

        return {
            price,
            fee: 0.002,
            dex: 'Meteora'
        };
    }
}