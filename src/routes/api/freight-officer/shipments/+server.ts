/**
 * API: Freight Officer Shipments
 * GET /api/freight-officer/shipments - List all shipments
 * POST /api/freight-officer/shipments - Create new shipment
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Cargo } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';

/**
 * GET - List all shipments
 */
export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		if (authUser.role !== 'freight_officer' && authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		await connectDB();

		const shipments = await Cargo.find()
			.sort({ createdAt: -1 })
			.lean();

		return json(shipments);
	} catch (error) {
		console.error('Get shipments error:', error);
		return json({ error: 'Failed to fetch shipments' }, { status: 500 });
	}
};

/**
 * POST - Create new shipment
 */
export const POST: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		if (authUser.role !== 'freight_officer' && authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const data = await event.request.json();

		await connectDB();

		// Generate tracking number - no need for manual generation, Cargo model has default

		const shipment = await Cargo.create({
			senderId: authUser.userId, // Use the officer's ID as sender
			senderName: data.senderName,
			senderPhone: data.senderPhone,
			senderAddress: data.senderAddress,
			receiverName: data.receiverName,
			receiverPhone: data.receiverPhone,
			receiverAddress: data.receiverAddress,
			origin: data.senderAddress,
			destination: data.receiverAddress,
			cargoType: data.cargoType || 'general',
			weight: parseFloat(data.weight) || 0,
			status: 'booked', // Use valid enum value
			specialInstructions: data.specialInstructions || '',
			assignedOfficerId: authUser.userId
		});

		return json({ 
			message: 'Shipment created successfully',
			shipment,
			trackingNumber: shipment.trackingId
		}, { status: 201 });
	} catch (error) {
		console.error('Create shipment error:', error);
		return json({ error: 'Failed to create shipment' }, { status: 500 });
	}
};
