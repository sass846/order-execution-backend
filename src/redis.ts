import { Redis } from 'ioredis'

if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL is not set')
}

//BullMQ connection (Queue + worker)
export const redisConnection = new Redis(
    process.env.REDIS_URL,
    {
        maxRetriesPerRequest: null,
    }
)

// pub/sub
export const redisPublisher = new Redis(
    process.env.REDIS_URL,
    {
        maxRetriesPerRequest: null,
    }
)

export const redisSubscriber = new Redis(
    process.env.REDIS_URL,
    {
        maxRetriesPerRequest: null,
    }
)