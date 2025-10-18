/**
 * Database Initialization Endpoint
 * Creates default admin account
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import User from '$lib/server/db/models/User';
import { UserRole } from '$lib/server/db/models/User';

export const POST: RequestHandler = async () => {
	try {
		await connectDB();

		const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@gofright.com';
		const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'GoFright@2024Admin';

		// Delete existing admin if it exists
		const existingAdmin = await User.findOne({ email: adminEmail });
		if (existingAdmin) {
			await User.deleteOne({ email: adminEmail });
			console.log('🗑️ Deleted existing admin account');
		}

		// Create new admin account
		const admin = await User.create({
			name: 'System Administrator',
			email: adminEmail,
			password_hash: adminPassword, // Will be hashed by pre-save hook
			role: UserRole.ADMIN,
			isActive: true
		});

		console.log('✅ Admin account created');
		console.log(`Email: ${adminEmail}`);
		console.log(`Password: ${adminPassword}`);

		return json({
			success: true,
			message: 'Admin account created successfully',
			admin: {
				email: adminEmail,
				name: admin.name,
				password: adminPassword
			},
			note: 'Please change the password after first login!'
		});
	} catch (error) {
		console.error('Database initialization error:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to initialize database'
			},
			{ status: 500 }
		);
	}
};
