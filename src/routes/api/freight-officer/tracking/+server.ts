/**
 * API: Shipment Tracking
 * GET /api/freight-officer/tracking - Get all active shipments with locations
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Cargo } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';

/**
 * GET - Get active shipments for tracking
 */
export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		if (authUser.role !== 'freight_officer' && authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		await connectDB();

		// Get shipments that are in transit
		const shipments = await Cargo.find({
			status: { $in: ['pending', 'at-warehouse', 'in-transit'] }
		})
		.sort({ updatedAt: -1 })
		.lean();

		// Add mock locations for demo (in production, these would be real GPS coordinates)
		const shipmentsWithLocations = shipments.map(shipment => ({
			...shipment,
			currentLocation: {
				lat: 6.5244 + (Math.random() - 0.5) * 0.5,
				lng: 3.3792 + (Math.random() - 0.5) * 0.5
			}
		}));

		return json(shipmentsWithLocations);
	} catch (error) {
		console.error('Tracking error:', error);
		return json({ error: 'Failed to fetch tracking data' }, { status: 500 });
	}
};
