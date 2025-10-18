/**
 * API: Single Cargo Operations
 * GET /api/cargo/[id] - Get cargo details
 * PATCH /api/cargo/[id] - Update cargo
 * DELETE /api/cargo/[id] - Delete cargo
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Cargo, Tracking, CargoStatus } from '$lib/server/db/models';
import { requireAuth, requireOfficerOrAdmin } from '$lib/server/auth';
import { z } from 'zod';
import type mongoose from 'mongoose';

/**
 * GET - Get single cargo details with tracking history
 */
export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);
		await connectDB();

		const { id } = event.params;

		const cargo = await Cargo.findById(id)
			.populate('senderId', 'name email phone')
			.populate('assignedOfficerId', 'name email')
			.lean();

		if (!cargo) {
			return json(
				{ error: 'Cargo not found' },
				{ status: 404 }
			);
		}

		// Check if user has permission to view
		if (authUser.role === 'customer' && cargo.senderId._id.toString() !== authUser.userId) {
			return json(
				{ error: 'Forbidden' },
				{ status: 403 }
			);
		}

		// Get tracking history
		const tracking = await Tracking.find({ cargoId: id })
			.sort({ timestamp: -1 })
			.populate('updatedBy', 'name')
			.lean();

		return json({
			cargo,
			tracking
		});
	} catch (error) {
		if (error instanceof Response) throw error;
		
		console.error('Get cargo error:', error);
		return json(
			{ error: 'Failed to fetch cargo details' },
			{ status: 500 }
		);
	}
};

/**
 * PATCH - Update cargo status (Officers/Admin only)
 */
export const PATCH: RequestHandler = async (event) => {
	try {
		const authUser = requireOfficerOrAdmin(event);
		await connectDB();

		const { id } = event.params;
		const body = await event.request.json();

		const updateSchema = z.object({
			status: z.string().optional(),
			assignedOfficerId: z.string().optional(),
			estimatedDelivery: z.string().optional(),
			actualDelivery: z.string().optional(),
			location: z.string().optional(),
			description: z.string().optional()
		});

		const validated = updateSchema.parse(body);

		const cargo = await Cargo.findById(id);
		if (!cargo) {
			return json(
				{ error: 'Cargo not found' },
				{ status: 404 }
			);
		}

		// Update cargo fields
		if (validated.status) {
			cargo.status = validated.status as CargoStatus;
		}
		if (validated.assignedOfficerId) {
			cargo.assignedOfficerId = validated.assignedOfficerId as unknown as mongoose.Types.ObjectId;
		}
		if (validated.estimatedDelivery) cargo.estimatedDelivery = new Date(validated.estimatedDelivery);
		if (validated.actualDelivery) cargo.actualDelivery = new Date(validated.actualDelivery);

		await cargo.save();

		// Create tracking entry if status or location changed
		if (validated.status || validated.location) {
			await Tracking.create({
				cargoId: cargo._id,
				status: validated.status || cargo.status,
				location: validated.location || cargo.destination,
				description: validated.description || `Status updated to ${validated.status}`,
				updatedBy: authUser.userId,
				timestamp: new Date()
			});
		}

		return json({
			message: 'Cargo updated successfully',
			cargo
		});
	} catch (error) {
		if (error instanceof Response) throw error;
		
		console.error('Update cargo error:', error);

		if (error instanceof z.ZodError) {
			return json(
				{ error: 'Validation failed', details: error.issues },
				{ status: 400 }
			);
		}

		return json(
			{ error: 'Failed to update cargo' },
			{ status: 500 }
		);
	}
};

/**
 * DELETE - Cancel/Delete cargo (Admin only)
 */
export const DELETE: RequestHandler = async (event) => {
	try {
		requireOfficerOrAdmin(event);
		await connectDB();

		const { id } = event.params;

		const cargo = await Cargo.findByIdAndDelete(id);
		if (!cargo) {
			return json(
				{ error: 'Cargo not found' },
				{ status: 404 }
			);
		}

		return json({
			message: 'Cargo deleted successfully'
		});
	} catch (error) {
		if (error instanceof Response) throw error;
		
		console.error('Delete cargo error:', error);
		return json(
			{ error: 'Failed to delete cargo' },
			{ status: 500 }
		);
	}
};
