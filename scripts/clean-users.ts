import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGO_DB_NAME || 'gofright';

console.log('\n🗑️  Cleaning Database - Removing Test Users\n' + '='.repeat(80));

async function cleanDatabase() {
	try {
		// Connect with Mongoose
		console.log('🔌 Connecting to MongoDB...');
		await mongoose.connect(MONGODB_URI!, {
			dbName: DB_NAME
		});
		console.log('✅ Connected successfully!\n');

		// Get users collection
		const User = mongoose.connection.db?.collection('users');
		
		// Find all users first
		const allUsers = await User?.find({}).toArray();
		console.log('📊 Current users in database:');
		console.log('-'.repeat(80));
		allUsers?.forEach((user, i) => {
			console.log(`${i + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
		});
		console.log('-'.repeat(80) + '\n');

		// Delete all users EXCEPT admin@gofright.com
		console.log('🗑️  Deleting users (keeping admin@gofright.com)...\n');
		
		const result = await User?.deleteMany({
			email: { $ne: 'admin@gofright.com' }
		});

		console.log(`✅ Deleted ${result?.deletedCount} users\n`);

		// Show remaining users
		const remainingUsers = await User?.find({}).toArray();
		console.log('📊 Remaining users:');
		console.log('='.repeat(80));
		remainingUsers?.forEach((user, i) => {
			console.log(`\n👤 User ${i + 1}`);
			console.log('-'.repeat(80));
			console.log(`Name:     ${user.name}`);
			console.log(`Email:    ${user.email}`);
			console.log(`Role:     ${user.role}`);
			console.log(`Active:   ${user.isActive !== false ? 'Yes' : 'No'}`);
		});
		console.log('\n' + '='.repeat(80));

		await mongoose.connection.close();
		console.log('\n✅ Database cleaned successfully!\n');
	} catch (error) {
		console.error('❌ Error:', error);
		process.exit(1);
	}
}

cleanDatabase();
