/**
 * API: Freight Officer Dashboard
 * GET /api/freight-officer/dashboard - Get dashboard data
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Cargo } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';

/**
 * GET - Get freight officer dashboard data
 */
export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		// Verify user is freight officer
		if (authUser.role !== 'freight_officer') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		await connectDB();

		// Get shipment stats
		const now = new Date();
		const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		
		const [activeShipments, pendingPickups, inTransit, delivered] = await Promise.all([
			Cargo.countDocuments({ status: { $in: ['pending', 'in-transit', 'at-warehouse'] } }),
			Cargo.countDocuments({ status: 'pending' }),
			Cargo.countDocuments({ status: 'in-transit' }),
			Cargo.countDocuments({ 
				status: 'delivered',
				deliveryDate: { $gte: startOfDay }
			})
		]);

		// Get recent shipments
		const recentShipments = await Cargo.find()
			.sort({ createdAt: -1 })
			.limit(5)
			.select('trackingNumber destination status createdAt')
			.lean();

		// Mock today's tasks (can be enhanced with actual task management)
		const todaysTasks = [
			{
				title: 'Pickup from Warehouse A',
				description: 'Collect cargo #TRK-2024-001',
				time: '09:00 AM',
				completed: false
			},
			{
				title: 'Delivery to Customer',
				description: 'Deliver cargo #TRK-2024-002 to Lagos',
				time: '02:00 PM',
				completed: false
			},
			{
				title: 'Update Shipment Status',
				description: 'Update status for 3 shipments',
				time: '04:00 PM',
				completed: false
			}
		];

		return json({
			stats: {
				activeShipments,
				pendingPickups,
				inTransit,
				delivered
			},
			recentShipments,
			todaysTasks
		});
	} catch (error) {
		console.error('Freight officer dashboard error:', error);
		return json({ error: 'Failed to load dashboard' }, { status: 500 });
	}
};
