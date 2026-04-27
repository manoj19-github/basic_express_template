import dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config();

export const redisClient = new Redis({
	host: process.env.REDIS_HOST || 'localhost',
	port: parseInt(process.env.REDIS_PORT || '6379'),
	maxRetriesPerRequest: null,
	enableReadyCheck: false
});

redisClient.on('connect', () => console.log('Redis connected'));
redisClient.on('error', (err) => console.error('Redis error:', err));

/*
 * Pub/Sub setup for horizontal scaling.
 * Multiple server instances can publish location events
 * and broadcast to connected clients via WebSocket/SSE later.
 */
export const redisPublisher = new Redis({
	host: process.env.REDIS_HOST || 'localhost',
	port: parseInt(process.env.REDIS_PORT || '6379')
});

export const redisSubscriber = new Redis({
	host: process.env.REDIS_HOST || 'localhost',
	port: parseInt(process.env.REDIS_PORT || '6379')
});

redisSubscriber.subscribe('location:updates');
redisSubscriber.on('message', (channel: any, message: any) => {
	// Future: broadcast to WebSocket/SSE listeners
	console.log(`[Pub/Sub] ${channel}:`, JSON.parse(message));
});