/**
 * API: Track Cargo by Tracking ID
 * GET /api/track/[trackingId] - Get cargo tracking information (public)
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Cargo, Tracking } from '$lib/server/db/models';

/**
 * GET - Track cargo by tracking ID (public endpoint)
 */
export const GET: RequestHandler = async (event) => {
	try {
		await connectDB();

		const { trackingId } = event.params;

		// Find cargo by tracking ID
		const cargo = await Cargo.findOne({ trackingId })
			.select('-senderId -assignedOfficerId')
			.lean();

		if (!cargo) {
			return json(
				{ error: 'Tracking ID not found' },
				{ status: 404 }
			);
		}

		// Get tracking history
		const tracking = await Tracking.find({ cargoId: cargo._id })
			.sort({ timestamp: -1 })
			.select('-updatedBy')
			.lean();

		return json({
			cargo: {
				trackingId: cargo.trackingId,
				origin: cargo.origin,
				destination: cargo.destination,
				status: cargo.status,
				weight: cargo.weight,
				cargoType: cargo.cargoType,
				estimatedDelivery: cargo.estimatedDelivery,
				actualDelivery: cargo.actualDelivery,
				createdAt: cargo.createdAt
			},
			tracking
		});
	} catch (error) {
		console.error('Track cargo error:', error);
		return json(
			{ error: 'Failed to track cargo' },
			{ status: 500 }
		);
	}
};
