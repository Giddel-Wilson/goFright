/**
 * API: Package Details and Updates
 * GET /api/admin/packages/[id] - Get package details
 * PATCH /api/admin/packages/[id] - Update package (status, etc.)
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Cargo } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';
import mongoose from 'mongoose';

/**
 * GET - Get package details
 */
export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		// Only admins and freight officers can access
		if (!['admin', 'freight_officer'].includes(authUser.role)) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		await connectDB();

		const { id } = event.params;

		if (!id || !mongoose.Types.ObjectId.isValid(id)) {
			return json({ error: 'Invalid package ID' }, { status: 400 });
		}

		const pkg = await Cargo.findById(id)
			.populate('senderId', 'name email phone')
			.populate('assignedOfficerId', 'name email phone')
			.populate('assignedOfficers', 'name email phone location country latitude longitude')
			.populate('assignedRouteId')
			.lean();

		if (!pkg) {
			return json({ error: 'Package not found' }, { status: 404 });
		}

		return json({ package: pkg });
	} catch (error) {
		console.error('Get package error:', error);
		return json({ error: 'Failed to fetch package' }, { status: 500 });
	}
};

/**
 * PATCH - Update package (status, assigned officers, etc.)
 */
export const PATCH: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		// Only admins can update packages
		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		await connectDB();

		const { id } = event.params;

		if (!id || !mongoose.Types.ObjectId.isValid(id)) {
			return json({ error: 'Invalid package ID' }, { status: 400 });
		}

		const body = await event.request.json();
		const { status, assignedOfficerId, assignedOfficers } = body;

		const pkg = await Cargo.findById(id);

		if (!pkg) {
			return json({ error: 'Package not found' }, { status: 404 });
		}

		// Update status if provided
		if (status) {
			const validStatuses = [
				'booked',
				'pending_pickup',
				'in_transit',
				'out_for_delivery',
				'delivered',
				'delayed',
				'cancelled',
				'returned'
			];

			if (!validStatuses.includes(status)) {
				return json({ error: 'Invalid status' }, { status: 400 });
			}

			pkg.status = status;

			// Set delivery date if status is delivered
			if (status === 'delivered' && !pkg.actualDelivery) {
				pkg.actualDelivery = new Date();
			}
		}

		// Update assigned officer (single) if provided
		if (assignedOfficerId) {
			if (!mongoose.Types.ObjectId.isValid(assignedOfficerId)) {
				return json({ error: 'Invalid officer ID' }, { status: 400 });
			}
			pkg.assignedOfficerId = assignedOfficerId as unknown as mongoose.Types.ObjectId;
		}

		// Update assigned officers (multiple) if provided
		if (assignedOfficers && Array.isArray(assignedOfficers)) {
			const validOfficerIds = assignedOfficers.every(id => 
				mongoose.Types.ObjectId.isValid(id)
			);

			if (!validOfficerIds) {
				return json({ error: 'Invalid officer IDs' }, { status: 400 });
			}

			pkg.assignedOfficers = assignedOfficers.map(
				id => new mongoose.Types.ObjectId(id)
			);
		}

		await pkg.save();

		// Populate and return updated package
		const updatedPkg = await Cargo.findById(id)
			.populate('senderId', 'name email phone')
			.populate('assignedOfficerId', 'name email phone')
			.populate('assignedOfficers', 'name email phone location country latitude longitude')
			.populate('assignedRouteId')
			.lean();

		return json({ 
			message: 'Package updated successfully', 
			package: updatedPkg 
		});
	} catch (error) {
		console.error('Update package error:', error);
		return json({ error: 'Failed to update package' }, { status: 500 });
	}
};
