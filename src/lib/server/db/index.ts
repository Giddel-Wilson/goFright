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
	serverSelectionTimeoutMS: 30000, // Increased from 5000ms to 30000ms (30 seconds)
	socketTimeoutMS: 45000, // 45 seconds
	connectTimeoutMS: 30000, // 30 seconds
	// Retry writes
	retryWrites: true,
	// Use new URL parser
	family: 4, // Use IPv4, skip trying IPv6
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
		// Check if connection is ready
		if (cached.conn.connection.readyState === 1) {
			return cached.conn;
		} else {
			// Connection exists but not ready, reset it
			cached.conn = null;
			cached.promise = null;
		}
	}

	if (!cached.promise) {
		console.log('🔌 Connecting to MongoDB... (This may take up to 30 seconds for sleeping clusters)');
		
		cached.promise = mongoose.connect(MONGODB_URI, options).then((mongoose) => {
			console.log('✅ MongoDB connected successfully');
			
			// Handle connection events
			mongoose.connection.on('error', (err) => {
				console.error('❌ MongoDB connection error:', err);
			});
			
			mongoose.connection.on('disconnected', () => {
				console.warn('⚠️  MongoDB disconnected');
				cached.conn = null;
				cached.promise = null;
			});
			
			mongoose.connection.on('reconnected', () => {
				console.log('🔄 MongoDB reconnected');
			});
			
			return mongoose;
		}).catch((error) => {
			console.error('❌ MongoDB connection error:', error.message);
			console.error('💡 Troubleshooting tips:');
			console.error('   1. Check if your MongoDB Atlas cluster is paused (free tier sleeps after inactivity)');
			console.error('   2. Verify your IP address is whitelisted in MongoDB Atlas Network Access');
			console.error('   3. Confirm your connection string in .env file is correct');
			console.error('   4. Ensure your internet connection is stable');
			cached.promise = null;
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
