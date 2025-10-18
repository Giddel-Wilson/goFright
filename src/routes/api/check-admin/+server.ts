/**
 * Check Admin Endpoint - Debug endpoint to check admin user status
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import User from '$lib/server/db/models/User';

export const GET: RequestHandler = async () => {
	try {
		await connectDB();

		const admin = await User.findOne({ email: 'admin@gofright.com' });

		if (!admin) {
			return json({
				exists: false,
				message: 'Admin user does not exist'
			});
		}

		return json({
			exists: true,
			admin: {
				name: admin.name,
				email: admin.email,
				role: admin.role,
				isActive: admin.isActive,
				createdAt: admin.createdAt
			}
		});
	} catch (error) {
		return json(
			{
				error: error instanceof Error ? error.message : 'Failed to check admin'
			},
			{ status: 500 }
		);
	}
};
