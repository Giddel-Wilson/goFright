/**
 * API: Single Shipment Operations
 * GET /api/freight-officer/shipments/[id] - Get shipment details
 * PUT /api/freight-officer/shipments/[id] - Update shipment
 * DELETE /api/freight-officer/shipments/[id] - Delete shipment
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Cargo } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';

/**
 * GET - Get shipment details
 */
export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);
		const { id } = event.params;

		await connectDB();

		const shipment = await Cargo.findById(id).lean();

		if (!shipment) {
			return json({ error: 'Shipment not found' }, { status: 404 });
		}

		return json(shipment);
	} catch (error) {
		console.error('Get shipment error:', error);
		return json({ error: 'Failed to fetch shipment' }, { status: 500 });
	}
};

/**
 * PUT - Update shipment
 */
export const PUT: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		if (authUser.role !== 'freight_officer' && authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const { id } = event.params;
		const data = await event.request.json();

		await connectDB();

		const updatedShipment = await Cargo.findByIdAndUpdate(
			id,
			{ $set: data },
			{ new: true, runValidators: true }
		);

		if (!updatedShipment) {
			return json({ error: 'Shipment not found' }, { status: 404 });
		}

		return json({
			message: 'Shipment updated successfully',
			shipment: updatedShipment
		});
	} catch (error) {
		console.error('Update shipment error:', error);
		return json({ error: 'Failed to update shipment' }, { status: 500 });
	}
};

/**
 * DELETE - Delete shipment
 */
export const DELETE: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized - Admin only' }, { status: 403 });
		}

		const { id } = event.params;

		await connectDB();

		const deletedShipment = await Cargo.findByIdAndDelete(id);

		if (!deletedShipment) {
			return json({ error: 'Shipment not found' }, { status: 404 });
		}

		return json({ message: 'Shipment deleted successfully' });
	} catch (error) {
		console.error('Delete shipment error:', error);
		return json({ error: 'Failed to delete shipment' }, { status: 500 });
	}
};
