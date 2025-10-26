/**
 * API: Admin Route Management (Single)
 * GET /api/admin/routes/[id] - Get route details
 * PUT /api/admin/routes/[id] - Update route
 * DELETE /api/admin/routes/[id] - Delete route
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Route } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';

/**
 * GET - Get route details
 */
export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const { id } = event.params;

		await connectDB();

		const route = await Route.findById(id).lean();

		if (!route) {
			return json({ error: 'Route not found' }, { status: 404 });
		}

		return json({ route });
	} catch (error) {
		console.error('Get route error:', error);
		return json({ error: 'Failed to fetch route' }, { status: 500 });
	}
};

/**
 * PUT - Update route
 */
export const PUT: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const { id } = event.params;
		const data = await event.request.json();

		await connectDB();

		const updates: any = {};
		if (data.routeName !== undefined) updates.routeName = data.routeName;
		if (data.origin !== undefined) updates.origin = data.origin;
		if (data.destination !== undefined) updates.destination = data.destination;
		if (data.aircraftType !== undefined) updates.aircraftType = data.aircraftType;
		if (data.departureTime !== undefined) updates.departureTime = data.departureTime;
		if (data.arrivalTime !== undefined) updates.arrivalTime = data.arrivalTime;
		if (data.flightDuration !== undefined) updates.flightDuration = parseFloat(data.flightDuration);
		if (data.pricePerKg !== undefined) updates.pricePerKg = parseFloat(data.pricePerKg);
		if (data.basePrice !== undefined) updates.basePrice = parseFloat(data.basePrice);
		if (data.maxWeight !== undefined) updates.maxWeight = parseFloat(data.maxWeight);
		if (data.availableDays !== undefined) updates.availableDays = data.availableDays;
		if (data.isActive !== undefined) updates.isActive = data.isActive;
		if (data.description !== undefined) updates.description = data.description;

		const route = await Route.findByIdAndUpdate(
			id,
			{ $set: updates },
			{ new: true, runValidators: true }
		);

		if (!route) {
			return json({ error: 'Route not found' }, { status: 404 });
		}

		return json({ 
			message: 'Route updated successfully',
			route
		});
	} catch (error: any) {
		console.error('Update route error:', error);
		return json({ error: error.message || 'Failed to update route' }, { status: 500 });
	}
};

/**
 * DELETE - Delete route
 */
export const DELETE: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const { id } = event.params;

		await connectDB();

		const route = await Route.findByIdAndDelete(id);

		if (!route) {
			return json({ error: 'Route not found' }, { status: 404 });
		}

		return json({ 
			message: 'Route deleted successfully'
		});
	} catch (error) {
		console.error('Delete route error:', error);
		return json({ error: 'Failed to delete route' }, { status: 500 });
	}
};
