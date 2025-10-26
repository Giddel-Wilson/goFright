/**
 * API: Cancel Booking
 * PUT /api/customer/bookings/[id]/cancel - Request cancellation
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Cargo } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';

/**
 * PUT - Request booking cancellation
 */
export const PUT: RequestHandler = async ({ params, ...event }) => {
	try {
		const authUser = requireAuth(event);

		if (authUser.role !== 'customer') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const { id } = params;

		await connectDB();

		const booking = await Cargo.findOne({
			_id: id,
			customerId: authUser.userId
		});

		if (!booking) {
			return json({ error: 'Booking not found' }, { status: 404 });
		}

		// Only allow cancellation for pending or at-warehouse shipments
		if (booking.status !== 'pending' && booking.status !== 'at-warehouse') {
			return json({ error: 'Cannot cancel shipment in current status' }, { status: 400 });
		}

		// Update status to cancelled
		booking.status = 'cancelled';
		await booking.save();

		return json({
			message: 'Booking cancelled successfully',
			booking
		});
	} catch (error) {
		console.error('Cancel booking error:', error);
		return json({ error: 'Failed to cancel booking' }, { status: 500 });
	}
};
