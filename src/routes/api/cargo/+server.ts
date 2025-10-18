/**
 * API: Cargo Management
 * GET /api/cargo - List all cargo (with filters)
 * POST /api/cargo - Create new cargo booking
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Cargo, Tracking, Payment, CargoStatus, PaymentStatus, PaymentMethod } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';
import { z } from 'zod';

/**
 * Cargo Creation Schema
 */
const cargoSchema = z.object({
	senderName: z.string().min(2).max(100),
	senderPhone: z.string(),
	senderAddress: z.string(),
	receiverName: z.string().min(2).max(100),
	receiverPhone: z.string(),
	receiverAddress: z.string(),
	destination: z.string(),
	origin: z.string(),
	weight: z.number().min(0.1),
	dimensions: z.object({
		length: z.number().min(0),
		width: z.number().min(0),
		height: z.number().min(0)
	}).optional(),
	cargoType: z.string(),
	description: z.string().max(500).optional(),
	specialInstructions: z.string().max(500).optional(),
	estimatedDelivery: z.string().optional()
});

/**
 * GET - List cargo with filters
 */
export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);
		await connectDB();

		const { url } = event;
		const searchParams = url.searchParams;
		
		// Build filter based on user role and query params
		const filter: Record<string, unknown> = {};
		
		// Customers can only see their own cargo
		if (authUser.role === 'customer') {
			filter.senderId = authUser.userId;
		}
		
		// Filter by status
		const status = searchParams.get('status');
		if (status) {
			filter.status = status;
		}
		
		// Filter by tracking ID
		const trackingId = searchParams.get('trackingId');
		if (trackingId) {
			filter.trackingId = trackingId;
		}
		
		// Filter by destination
		const destination = searchParams.get('destination');
		if (destination) {
			filter.destination = { $regex: destination, $options: 'i' };
		}
		
		// Pagination
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '20');
		const skip = (page - 1) * limit;
		
		// Get cargo list
		const [cargoList, total] = await Promise.all([
			Cargo.find(filter)
				.populate('senderId', 'name email')
				.populate('assignedOfficerId', 'name email')
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			Cargo.countDocuments(filter)
		]);

		return json({
			cargo: cargoList,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit)
			}
		});
	} catch (error) {
		if (error instanceof Response) throw error;
		
		console.error('Get cargo error:', error);
		return json(
			{ error: 'Failed to fetch cargo' },
			{ status: 500 }
		);
	}
};

/**
 * POST - Create new cargo booking
 */
export const POST: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);
		await connectDB();

		const body = await event.request.json();
		const validated = cargoSchema.parse(body);

		// Create cargo
		const cargo = await Cargo.create({
			...validated,
			senderId: authUser.userId,
			status: CargoStatus.BOOKED,
			estimatedDelivery: validated.estimatedDelivery 
				? new Date(validated.estimatedDelivery) 
				: undefined
		});

		// Create initial tracking entry
		await Tracking.create({
			cargoId: cargo._id,
			status: CargoStatus.BOOKED,
			location: validated.origin,
			description: 'Cargo booking confirmed',
			timestamp: new Date()
		});

		// Calculate payment amount (basic calculation)
		const baseCharge = 50; // Base fee
		const weightCharge = validated.weight * 5; // $5 per kg
		const totalAmount = baseCharge + weightCharge;

		// Create payment record
		await Payment.create({
			cargoId: cargo._id,
			userId: authUser.userId,
			amount: totalAmount,
			currency: 'USD',
			paymentMethod: PaymentMethod.CASH, // Default
			paymentStatus: PaymentStatus.PENDING,
			breakdown: {
				baseCharge,
				weightCharge,
				distanceCharge: 0,
				tax: 0
			}
		});

		return json(
			{
				message: 'Cargo booked successfully',
				cargo: {
					id: cargo._id,
					trackingId: cargo.trackingId,
					status: cargo.status,
					estimatedDelivery: cargo.estimatedDelivery
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		if (error instanceof Response) throw error;
		
		console.error('Create cargo error:', error);

		if (error instanceof z.ZodError) {
			return json(
				{ error: 'Validation failed', details: error.issues },
				{ status: 400 }
			);
		}

		return json(
			{ error: 'Failed to create cargo booking' },
			{ status: 500 }
		);
	}
};
