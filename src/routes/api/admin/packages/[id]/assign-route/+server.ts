/**
 * API: Assign Route to Package
 * PUT /api/admin/packages/[id]/assign-route - Assign a route to a package
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Cargo, Route } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';
import mongoose from 'mongoose';

/**
 * PUT - Assign a route to a package
 */
export const PUT: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		// Only admins can assign routes
		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		await connectDB();

		const { id } = event.params;
		const body = await event.request.json();
		const { routeId } = body;

		// Validate package ID
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return json({ error: 'Invalid package ID' }, { status: 400 });
		}

		// Validate route ID
		if (!routeId || !mongoose.Types.ObjectId.isValid(routeId)) {
			return json({ error: 'Invalid route ID' }, { status: 400 });
		}

		// Check if package exists
		const cargoPackage = await Cargo.findById(id);
		if (!cargoPackage) {
			return json({ error: 'Package not found' }, { status: 404 });
		}

		// Check if route exists and is active
		const route = await Route.findById(routeId);
		if (!route) {
			return json({ error: 'Route not found' }, { status: 404 });
		}

		if (!route.isActive) {
			return json({ error: 'Route is not active' }, { status: 400 });
		}

		// Validate weight against route capacity
		if (cargoPackage.weight > route.maxWeight) {
			return json({ 
				error: `Package weight (${cargoPackage.weight}kg) exceeds route maximum (${route.maxWeight}kg)` 
			}, { status: 400 });
		}

		// Assign the route
		cargoPackage.assignedRouteId = new mongoose.Types.ObjectId(routeId);
		await cargoPackage.save();

		// Populate and return updated package
		const updatedPackage = await Cargo.findById(id)
			.populate('senderId', 'name email')
			.populate('assignedOfficerId', 'name email')
			.populate('assignedRouteId')
			.lean();

		return json({ 
			message: 'Route assigned successfully', 
			package: updatedPackage 
		});
	} catch (error) {
		console.error('Assign route error:', error);
		return json({ error: 'Failed to assign route' }, { status: 500 });
	}
};

/**
 * DELETE - Remove route assignment from package
 */
export const DELETE: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		// Only admins can remove route assignments
		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		await connectDB();

		const { id } = event.params;

		// Validate package ID
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return json({ error: 'Invalid package ID' }, { status: 400 });
		}

		// Check if package exists
		const cargoPackage = await Cargo.findById(id);
		if (!cargoPackage) {
			return json({ error: 'Package not found' }, { status: 404 });
		}

		// Remove route assignment
		cargoPackage.assignedRouteId = undefined;
		await cargoPackage.save();

		// Populate and return updated package
		const updatedPackage = await Cargo.findById(id)
			.populate('senderId', 'name email')
			.populate('assignedOfficerId', 'name email')
			.lean();

		return json({ 
			message: 'Route assignment removed successfully', 
			package: updatedPackage 
		});
	} catch (error) {
		console.error('Remove route assignment error:', error);
		return json({ error: 'Failed to remove route assignment' }, { status: 500 });
	}
};
