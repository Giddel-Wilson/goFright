/**
 * MongoDB Database Configuration
 * Establishes connection to MongoDB using Mongoose ORM
 */

import mongoose from 'mongoose';
import { MONGODB_URI } from '$env/static/private';

/**
 * Connection options for MongoDB
 */
const options: mongoose.ConnectOptions = {
	// Automatically reconnect if connection is lost
	autoIndex: true,
	// Use the new Server Discover and Monitoring engine
	serverSelectionTimeoutMS: 5000,
};

/**
 * Global mongoose connection cache
 * Prevents multiple connections in development (hot reloading)
 */
declare global {
	var mongoose: {
		conn: typeof import('mongoose') | null;
		promise: Promise<typeof import('mongoose')> | null;
	};
}

let cached = global.mongoose;

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB database
 * Uses cached connection in development to prevent hot reload issues
 * @returns Promise<typeof mongoose> - Mongoose instance
 */
export async function connectDB() {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		console.log('🔌 Connecting to MongoDB...');
		
		cached.promise = mongoose.connect(MONGODB_URI, options).then((mongoose) => {
			console.log('✅ MongoDB connected successfully');
			return mongoose;
		}).catch((error) => {
			console.error('❌ MongoDB connection error:', error);
			throw error;
		});
	}

	try {
		cached.conn = await cached.promise;
	} catch (e) {
		cached.promise = null;
		throw e;
	}

	return cached.conn;
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDB() {
	if (cached.conn) {
		await cached.conn.disconnect();
		cached.conn = null;
		cached.promise = null;
		console.log('🔌 MongoDB disconnected');
	}
}

/**
 * Check database connection status
 */
export function isConnected(): boolean {
	return mongoose.connection.readyState === 1;
}

export default mongoose;
