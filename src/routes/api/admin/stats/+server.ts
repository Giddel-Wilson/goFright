/**
 * API: Admin Stats
 * GET /api/admin/stats - Get admin dashboard statistics
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Cargo, User, Payment } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';

export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);
		
		// Only admins can access this endpoint
		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		await connectDB();

		// Get total users
		const totalUsers = await User.countDocuments({ isActive: true });

		// Get total cargo
		const totalCargo = await User.countDocuments();

		// Get pending cargo
		const pendingCargo = await Cargo.countDocuments({
			status: { $in: ['booked', 'pending_pickup'] }
		});

		// Get active freight officers
		const activeOfficers = await User.countDocuments({
			role: 'freight_officer',
			isActive: true
		});

		// Calculate total revenue
		const payments = await Payment.aggregate([
			{ $match: { status: 'completed' } },
			{ $group: { _id: null, total: { $sum: '$amount' } } }
		]);
		const totalRevenue = payments.length > 0 ? payments[0].total : 0;

		return json({
			totalUsers,
			totalCargo,
			pendingCargo,
			activeOfficers,
			totalRevenue
		});
	} catch (error) {
		console.error('Admin stats error:', error);
		return json({ error: 'Failed to fetch stats' }, { status: 500 });
	}
};
