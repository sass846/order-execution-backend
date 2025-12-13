import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

async function main() {
    await redis.set('ping', 'pong')
    const value = await redis.get('ping')
    console.log(value)
    await redis.quit()
}

main().catch(console.error)
