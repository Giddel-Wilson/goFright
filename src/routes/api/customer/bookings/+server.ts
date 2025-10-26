/**
 * API: Customer Bookings
 * GET /api/customer/bookings - List customer's bookings
 * POST /api/customer/bookings - Create new booking
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Cargo } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';

/**
 * GET - Get customer's bookings
 */
export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		if (authUser.role !== 'customer') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		await connectDB();

		const bookings = await Cargo.find({ customerId: authUser.userId })
			.sort({ createdAt: -1 })
			.lean();

		return json({ bookings });
	} catch (error) {
		console.error('Get bookings error:', error);
		return json({ error: 'Failed to fetch bookings' }, { status: 500 });
	}
};

/**
 * POST - Create new booking
 */
export const POST: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		if (authUser.role !== 'customer') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const body = await event.request.json();

		await connectDB();

		// Generate tracking number
		const year = new Date().getFullYear();
		const count = await Cargo.countDocuments();
		const trackingNumber = `TRK-${year}-${String(count + 1).padStart(6, '0')}`;

		// Create booking
		const booking = await Cargo.create({
			trackingNumber,
			senderId: authUser.userId, // Fixed: use senderId instead of customerId
			senderName: body.senderName,
			senderPhone: body.senderPhone,
			senderAddress: body.senderAddress,
			origin: body.senderCity || body.senderAddress, // Fixed: add origin
			receiverName: body.receiverName,
			receiverPhone: body.receiverPhone,
			receiverAddress: body.receiverAddress,
			destination: body.receiverCity || body.receiverAddress, // Fixed: add destination
			cargoType: body.cargoType || 'general',
			weight: body.weight,
			// Removed dimensions - only weight is needed
			description: body.specialInstructions,
			specialInstructions: body.specialInstructions,
			status: 'booked', // Fixed: use valid enum value 'booked' instead of 'pending'
			// Calculate price based on weight
			estimatedDelivery: body.pickupDate ? new Date(body.pickupDate) : undefined
		});

		return json({
			message: 'Booking created successfully',
			trackingNumber: booking.trackingNumber,
			booking
		});
	} catch (error) {
		console.error('Create booking error:', error);
		return json({ error: 'Failed to create booking' }, { status: 500 });
	}
};
