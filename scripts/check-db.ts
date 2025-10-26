import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGO_DB_NAME || 'goFright';

console.log('\n🔍 Database Connection Test\n' + '='.repeat(80));
console.log('MongoDB URI:', MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@'));
console.log('Database Name:', DB_NAME);
console.log('='.repeat(80) + '\n');

async function checkDatabase() {
	try {
		// Connect with Mongoose
		console.log('🔌 Connecting to MongoDB with Mongoose...');
		await mongoose.connect(MONGODB_URI!, {
			dbName: DB_NAME
		});
		console.log('✅ Connected successfully!\n');

		// List all collections
		const collections = await mongoose.connection.db?.listCollections().toArray();
		console.log('📂 Collections in database:');
		console.log('-'.repeat(80));
		collections?.forEach((col) => {
			console.log(`   ${col.name}`);
		});
		console.log('-'.repeat(80) + '\n');

		// Check users collection
		const User = mongoose.connection.db?.collection('users');
		const userCount = await User?.countDocuments();
		console.log(`👥 Users Collection: ${userCount} documents\n`);

		if (userCount && userCount > 0) {
			const users = await User?.find({}).toArray();
			console.log('📊 User Details:');
			console.log('='.repeat(80));
			users?.forEach((user, i) => {
				console.log(`\n👤 User ${i + 1}`);
				console.log('-'.repeat(80));
				console.log(`ID:          ${user._id}`);
				console.log(`Name:        ${user.name}`);
				console.log(`Email:       ${user.email}`);
				console.log(`Role:        ${user.role}`);
				console.log(`Phone:       ${user.phone || 'N/A'}`);
				console.log(`Active:      ${user.isActive !== false ? 'Yes' : 'No'}`);
				console.log(`Password:    ${user.password_hash ? 'Set (length: ' + user.password_hash.length + ')' : 'NOT SET!'}`);
				console.log(`Created:     ${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}`);
			});
			console.log('\n' + '='.repeat(80));
		} else {
			console.log('ℹ️  No users found in database');
		}

		await mongoose.connection.close();
		console.log('\n✅ Connection closed\n');
	} catch (error) {
		console.error('❌ Error:', error);
		process.exit(1);
	}
}

checkDatabase();
