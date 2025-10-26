/**
 * API: Customer Tracking
 * GET /api/customer/tracking/[trackingNumber] - Track shipment by tracking number
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Cargo } from '$lib/server/db/models';

/**
 * GET - Track shipment by tracking number (public endpoint)
 */
export const GET: RequestHandler = async ({ params }) => {
	try {
		const { trackingNumber } = params;

		if (!trackingNumber) {
			return json({ error: 'Tracking number is required' }, { status: 400 });
		}

		await connectDB();

		const shipment = await Cargo.findOne({ trackingNumber }).lean();

		if (!shipment) {
			return json({ error: 'Shipment not found' }, { status: 404 });
		}

		// Add mock current location for tracking
		const currentLocation = {
			lat: 6.5244 + (Math.random() - 0.5) * 0.5,
			lng: 3.3792 + (Math.random() - 0.5) * 0.5
		};

		return json({
			shipment: {
				...shipment,
				currentLocation
			}
		});
	} catch (error) {
		console.error('Tracking error:', error);
		return json({ error: 'Failed to track shipment' }, { status: 500 });
	}
};
