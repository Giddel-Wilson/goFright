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

		const bookings = await Cargo.find({ senderId: authUser.userId })
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

		// Calculate price based on weight
		// Base price: GH₵50, Additional: GH₵10 per kg
		const basePrice = 50;
		const pricePerKg = 10;
		const weight = parseFloat(body.weight) || 0;
		const calculatedPrice = basePrice + (weight * pricePerKg);

		// Create booking (trackingId will be auto-generated)
		const booking = await Cargo.create({
			senderId: authUser.userId,
			senderName: body.senderName,
			senderPhone: body.senderPhone,
			senderAddress: body.senderAddress,
			origin: body.senderCity || body.senderAddress,
			receiverName: body.receiverName,
			receiverPhone: body.receiverPhone,
			receiverAddress: body.receiverAddress,
			destination: body.receiverCity || body.receiverAddress,
			cargoType: body.cargoType || 'general',
			weight: weight,
			declaredValue: parseFloat(body.declaredValue) || calculatedPrice,
			price: calculatedPrice,
			description: body.specialInstructions,
			specialInstructions: body.specialInstructions,
			status: 'booked',
			estimatedDelivery: body.pickupDate ? new Date(body.pickupDate) : undefined
		});

		return json({
			message: 'Booking created successfully',
			trackingNumber: booking.trackingId, // Return trackingId as trackingNumber for compatibility
			booking
		});
	} catch (error) {
		console.error('Create booking error:', error);
		return json({ error: 'Failed to create booking' }, { status: 500 });
	}
};
