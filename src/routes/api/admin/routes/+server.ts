/**
 * API: Admin Routes Management
 * GET /api/admin/routes - List all routes
 * POST /api/admin/routes - Create new route
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Route } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';

/**
 * GET - List all routes
 */
export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		await connectDB();

		const routes = await Route.find().sort({ createdAt: -1 }).lean();

		return json({ routes });
	} catch (error) {
		console.error('Get routes error:', error);
		return json({ error: 'Failed to fetch routes' }, { status: 500 });
	}
};

/**
 * POST - Create new route
 */
export const POST: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const data = await event.request.json();

		await connectDB();

		const route = await Route.create({
			routeName: data.routeName,
			origin: data.origin,
			destination: data.destination,
			aircraftType: data.aircraftType,
			departureTime: data.departureTime,
			arrivalTime: data.arrivalTime,
			flightDuration: parseFloat(data.flightDuration),
			pricePerKg: parseFloat(data.pricePerKg),
			basePrice: parseFloat(data.basePrice),
			maxWeight: parseFloat(data.maxWeight),
			availableDays: data.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
			isActive: data.isActive !== undefined ? data.isActive : true,
			description: data.description
		});

		return json({ 
			message: 'Route created successfully',
			route
		}, { status: 201 });
	} catch (error: any) {
		console.error('Create route error:', error);
		return json({ error: error.message || 'Failed to create route' }, { status: 500 });
	}
};
