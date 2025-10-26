/**
 * API: Admin Users Management
 * GET /api/admin/users - Get all users with stats
 * PUT /api/admin/users - Update user
 * DELETE /api/admin/users - Delete user
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { User, Cargo } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';

/**
 * GET - Get all users with stats
 */
export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);
		
		// Only admins can access
		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

	await connectDB();

	const users = await User.find({})
		.select('-password_hash')
		.sort({ createdAt: -1 })
		.lean();

	// Get shipment count for each user
		const usersWithStats = await Promise.all(
			users.map(async (user) => {
				const shipmentCount = await Cargo.countDocuments({ senderId: user._id });
				return {
					...user,
					stats: {
						shipments: shipmentCount,
						lastActive: user.updatedAt,
						status: user.isActive ? 'active' : 'inactive'
					}
				};
			})
		);

		// Overall stats
		const stats = {
			total: users.length,
			active: users.filter((u) => u.isActive).length,
			admins: users.filter((u) => u.role === 'admin').length,
			customers: users.filter((u) => u.role === 'customer').length,
			freightOfficers: users.filter((u) => u.role === 'freight_officer').length
		};

		return json({ users: usersWithStats, stats });
	} catch (error) {
		console.error('Admin users error:', error);
		return json({ error: 'Failed to fetch users' }, { status: 500 });
	}
};

/**
 * PUT - Update user
 */
export const PUT: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);
		
		// Only admins can update
		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const data = await event.request.json();
		const { userId, ...updates } = data;

		if (!userId) {
			return json({ error: 'User ID is required' }, { status: 400 });
		}

		await connectDB();

		const allowedUpdates = ['name', 'email', 'phone', 'address', 'role', 'isActive'];
		const filteredUpdates: Record<string, unknown> = {};

		for (const key of allowedUpdates) {
			if (updates[key] !== undefined) {
				filteredUpdates[key] = updates[key];
			}
		}

	const user = await User.findByIdAndUpdate(
		userId,
		{ $set: filteredUpdates },
		{ new: true, runValidators: true, strict: false }
	).select('-password_hash');

	if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		return json({ message: 'User updated successfully', user });
	} catch (error) {
		console.error('Update user error:', error);
		return json({ error: 'Failed to update user' }, { status: 500 });
	}
};

/**
 * DELETE - Delete user
 */
export const DELETE: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);
		
		// Only admins can delete
		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const url = new URL(event.request.url);
		const userId = url.searchParams.get('userId');

		if (!userId) {
			return json({ error: 'User ID is required' }, { status: 400 });
		}

		// Prevent deleting self
		if (userId === authUser.id) {
			return json({ error: 'Cannot delete your own account' }, { status: 400 });
		}

		await connectDB();

		const user = await User.findByIdAndDelete(userId);

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		return json({ message: 'User deleted successfully' });
	} catch (error) {
		console.error('Delete user error:', error);
		return json({ error: 'Failed to delete user' }, { status: 500 });
	}
};

