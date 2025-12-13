import { jest } from '@jest/globals';

// Mock Redis
jest.mock('../redis.js', () => ({
    redisClient: {
        on: jest.fn(),
        connect: jest.fn(),
        quit: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
    },
    redisSubscriber: {
        on: jest.fn(),
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
        connect: jest.fn(),
        quit: jest.fn(),
    },
    redisConnection: {
        on: jest.fn(),
    }
}));

// Mock BullMQ
jest.mock('bullmq', () => ({
    Queue: jest.fn().mockImplementation(() => ({
        add: jest.fn(),
    })),
    Worker: jest.fn(),
}));

// Mock Prisma
jest.mock('../prisma.js', () => ({
    prisma: {
        order: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));

beforeEach(() => {
    jest.clearAllMocks();
});
