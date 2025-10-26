/**
 * Script to list all users in the MongoDB database
 * Usage: node scripts/list-users.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// User Schema (matching your User model)
const userSchema = new mongoose.Schema({
	name: String,
	email: String,
	password: String,
	role: String,
	phone: String,
	address: String,
	photoUrl: String,
	isActive: Boolean,
	createdAt: Date,
	updatedAt: Date
});

const User = mongoose.model('User', userSchema);

async function listUsers() {
	try {
		console.log('🔌 Connecting to MongoDB...');
		console.log('URI:', process.env.MONGODB_URI?.substring(0, 30) + '...');
		
		await mongoose.connect(process.env.MONGODB_URI, {
			dbName: process.env.MONGO_DB_NAME || 'goFright'
		});
		
		console.log('✅ Connected to MongoDB\n');
		
		// Fetch all users
		const users = await User.find({}).sort({ createdAt: -1 });
		
		if (users.length === 0) {
			console.log('📭 No users found in database\n');
			return;
		}
		
		console.log(`📊 Found ${users.length} user(s):\n`);
		console.log('═'.repeat(100));
		
		users.forEach((user, index) => {
			console.log(`\n👤 User #${index + 1}`);
			console.log('─'.repeat(100));
			console.log(`ID:           ${user._id}`);
			console.log(`Name:         ${user.name}`);
			console.log(`Email:        ${user.email}`);
			console.log(`Role:         ${user.role}`);
			console.log(`Phone:        ${user.phone || 'N/A'}`);
			console.log(`Address:      ${user.address || 'N/A'}`);
			console.log(`Photo URL:    ${user.photoUrl || 'N/A'}`);
			console.log(`Active:       ${user.isActive !== false ? '✅ Yes' : '❌ No'}`);
			console.log(`Created:      ${user.createdAt?.toLocaleString() || 'N/A'}`);
			console.log(`Updated:      ${user.updatedAt?.toLocaleString() || 'N/A'}`);
			console.log(`Password:     ${user.password?.substring(0, 20)}... (hashed)`);
		});
		
		console.log('\n' + '═'.repeat(100));
		
		// Summary by role
		const roleCount = {};
		users.forEach(user => {
			roleCount[user.role] = (roleCount[user.role] || 0) + 1;
		});
		
		console.log('\n📈 Summary by Role:');
		console.log('─'.repeat(50));
		Object.entries(roleCount).forEach(([role, count]) => {
			const emoji = role === 'admin' ? '👑' : role === 'freight_officer' ? '🚛' : '👤';
			console.log(`${emoji} ${role.padEnd(20)} : ${count}`);
		});
		console.log('─'.repeat(50));
		console.log(`Total Users: ${users.length}\n`);
		
	} catch (error) {
		console.error('❌ Error:', error.message);
		if (error.stack) {
			console.error('\nStack trace:', error.stack);
		}
	} finally {
		await mongoose.disconnect();
		console.log('🔌 Disconnected from MongoDB');
	}
}

// Run the script
listUsers().catch(console.error);
