#!/usr/bin/env bun
/**
 * MongoDB Connection Test Script
 * Tests the database connection and displays helpful diagnostics
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
	console.error('❌ ERROR: MONGODB_URI is not set in environment variables');
	console.error('💡 Please create a .env file with your MongoDB connection string');
	process.exit(1);
}

// Mask the password in the URI for safe logging
const maskedURI = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
console.log('🔍 Testing MongoDB connection...');
console.log('📍 Connection URI:', maskedURI);
console.log('');

const options = {
	serverSelectionTimeoutMS: 30000,
	socketTimeoutMS: 45000,
	connectTimeoutMS: 30000,
	retryWrites: true,
	family: 4,
};

console.log('⏳ Connecting... (this may take up to 30 seconds for sleeping clusters)');
const startTime = Date.now();

mongoose.connect(MONGODB_URI, options)
	.then(() => {
		const duration = ((Date.now() - startTime) / 1000).toFixed(2);
		console.log('');
		console.log('✅ SUCCESS: MongoDB connected successfully!');
		console.log(`⏱️  Connection time: ${duration}s`);
		console.log('');
		console.log('📊 Connection Details:');
		console.log('   Database:', mongoose.connection.db.databaseName);
		console.log('   Host:', mongoose.connection.host);
		console.log('   Port:', mongoose.connection.port);
		console.log('   Ready State:', mongoose.connection.readyState === 1 ? 'Connected' : mongoose.connection.readyState);
		console.log('');
		
		// List collections
		return mongoose.connection.db.listCollections().toArray();
	})
	.then((collections) => {
		console.log('📁 Collections in database:');
		if (collections.length === 0) {
			console.log('   (No collections yet - database is empty)');
		} else {
			collections.forEach((col) => {
				console.log(`   - ${col.name}`);
			});
		}
		console.log('');
		console.log('🎉 Database connection test completed successfully!');
		process.exit(0);
	})
	.catch((error) => {
		const duration = ((Date.now() - startTime) / 1000).toFixed(2);
		console.log('');
		console.log('❌ FAILED: Could not connect to MongoDB');
		console.log(`⏱️  Time before failure: ${duration}s`);
		console.log('');
		console.log('🔍 Error Details:');
		console.log('   Message:', error.message);
		if (error.reason) {
			console.log('   Reason:', error.reason.type);
		}
		console.log('');
		console.log('💡 Troubleshooting Steps:');
		console.log('');
		console.log('1. CHECK MONGODB ATLAS CLUSTER STATUS:');
		console.log('   - Visit https://cloud.mongodb.com/');
		console.log('   - Ensure your cluster is NOT paused (free tier clusters pause after inactivity)');
		console.log('   - Click "Resume" if the cluster is paused');
		console.log('');
		console.log('2. VERIFY IP WHITELIST:');
		console.log('   - Go to MongoDB Atlas → Network Access');
		console.log('   - Add your current IP address OR use 0.0.0.0/0 (allow from anywhere)');
		console.log('   - Current IP check: Visit https://api.ipify.org to see your IP');
		console.log('');
		console.log('3. CHECK CONNECTION STRING:');
		console.log('   - Ensure MONGODB_URI in .env file is correct');
		console.log('   - Format: mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>');
		console.log('   - Verify username and password are correct');
		console.log('   - Ensure password special characters are URL-encoded');
		console.log('');
		console.log('4. INTERNET CONNECTION:');
		console.log('   - Verify you have a stable internet connection');
		console.log('   - Try pinging: ping atlas-tfjonf-shard-00-00.wmodj34.mongodb.net');
		console.log('');
		process.exit(1);
	});
