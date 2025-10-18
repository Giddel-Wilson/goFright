/**
 * Database Initialization Script
 * Creates default admin account and sets up indexes
 * 
 * Usage: node scripts/init-db.js
 */

import { connectDB, disconnectDB } from '../src/lib/server/db/index.js';
import User from '../src/lib/server/db/models/User.js';
import { UserRole } from '../src/lib/server/db/models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function initializeDatabase() {
	try {
		console.log('🔌 Connecting to MongoDB...');
		await connectDB();
		console.log('✅ Connected to MongoDB');

		// Create default admin account
		const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@gofright.com';
		const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456';

		const existingAdmin = await User.findOne({ email: adminEmail });

		if (existingAdmin) {
			console.log('ℹ️  Admin account already exists');
		} else {
			await User.create({
				name: 'System Administrator',
				email: adminEmail,
				password_hash: adminPassword, // Will be hashed by pre-save hook
				role: UserRole.ADMIN,
				isActive: true
			});

			console.log('✅ Admin account created successfully');
			console.log(`   Email: ${adminEmail}`);
			console.log(`   Password: ${adminPassword}`);
			console.log('   ⚠️  Please change the password after first login!');
		}

		// Create indexes
		console.log('\n📊 Creating database indexes...');
		await User.createIndexes();
		console.log('✅ User indexes created');

		console.log('\n🎉 Database initialization complete!');
		console.log('\n📝 Next steps:');
		console.log('   1. Start the development server: npm run dev');
		console.log('   2. Login with admin credentials');
		console.log('   3. Create freight officer accounts');
		console.log('   4. Test cargo booking and tracking');

	} catch (error) {
		console.error('❌ Database initialization failed:', error);
		process.exit(1);
	} finally {
		await disconnectDB();
	}
}

// Run initialization
initializeDatabase();
