/**
 * Simple script to list all users using bun
 * Usage: bun run scripts/list-users-simple.ts
 */

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGO_DB_NAME || 'goFright';

if (!MONGODB_URI) {
	console.error('❌ MONGODB_URI not found in environment variables');
	process.exit(1);
}

async function listUsers() {
	try {
		// Import mongoose dynamically
		const mongoose = await import('mongoose');
		
		console.log('🔌 Connecting to MongoDB...');
		
		await mongoose.default.connect(MONGODB_URI, {
			dbName: DB_NAME
		});
		
		console.log('✅ Connected successfully\n');
		
		// Get users collection
		const db = mongoose.default.connection.db;
		const usersCollection = db.collection('users');
		
		const users = await usersCollection.find({}).toArray();
		
		if (users.length === 0) {
			console.log('📭 No users found\n');
			return;
		}
		
		console.log(`📊 Total Users: ${users.length}\n`);
		console.log('═'.repeat(100));
		
		users.forEach((user, i) => {
			console.log(`\n👤 User #${i + 1}`);
			console.log('─'.repeat(100));
			console.log(`ID:       ${user._id}`);
			console.log(`Name:     ${user.name}`);
			console.log(`Email:    ${user.email}`);
			console.log(`Role:     ${user.role}`);
			console.log(`Phone:    ${user.phone || 'N/A'}`);
			console.log(`Address:  ${user.address || 'N/A'}`);
			console.log(`Active:   ${user.isActive !== false ? '✅' : '❌'}`);
			console.log(`Created:  ${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}`);
		});
		
		console.log('\n' + '═'.repeat(100) + '\n');
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	} finally {
		process.exit(0);
	}
}

listUsers();
