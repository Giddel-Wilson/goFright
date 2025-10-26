/**
 * API: Admin Profile Management
 * GET /api/admin/profile - Get current admin profile
 * PUT /api/admin/profile - Update admin profile
 * POST /api/admin/profile/password - Change password
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { User } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';
import { logActivity } from '$lib/server/utils/activityLogger';
import bcrypt from 'bcryptjs';

/**
 * GET - Get current admin profile with stats
 */
export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		await connectDB();

		const user = await User.findById(authUser.userId).select('-password_hash').lean();

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		console.log('GET /api/admin/profile - User from DB:', {
			id: user._id,
			name: user.name,
			photoUrl: user.photoUrl,
			hasPhotoUrl: !!user.photoUrl
		});

		// Get user activity stats (you can expand this with actual data)
		const stats = {
			totalActions: 1247,
			shipmentsCreated: 847,
			usersManaged: 156,
			reportsGenerated: 244,
			lastLogin: new Date(),
			device: 'MacBook Pro - Chrome',
			location: 'San Francisco, US'
		};

		return json({ user, stats });
	} catch (error) {
		console.error('Get profile error:', error);
		return json({ error: 'Failed to fetch profile' }, { status: 500 });
	}
};

/**
 * PUT - Update admin profile
 */
export const PUT: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);
		const data = await event.request.json();

		await connectDB();

		const allowedUpdates = [
			'name', 
			'email', 
			'phone', 
			'address',
			'gender',
			'dateOfBirth',
			'nationality',
			'stateOfOrigin',
			'city',
			'state'
		];
		const updates: Record<string, unknown> = {};

		for (const key of allowedUpdates) {
			if (data[key] !== undefined) {
				updates[key] = data[key];
			}
		}

		const user = await User.findByIdAndUpdate(
			authUser.userId,
			{ $set: updates },
			{ new: true, runValidators: true }
		).select('-password_hash');

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Log activity
		const updatedFields = Object.keys(updates).join(', ');
		await logActivity({
			userId: authUser.userId,
			action: 'profile_update',
			details: `Updated profile information: ${updatedFields}`,
			category: 'profile',
			metadata: { updatedFields: Object.keys(updates) },
			event
		});

		return json({ message: 'Profile updated successfully', user });
	} catch (error) {
		console.error('Update profile error:', error);
		return json({ error: 'Failed to update profile' }, { status: 500 });
	}
};

/**
 * POST - Change password
 */
export const POST: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);
		const { currentPassword, newPassword } = await event.request.json();

		if (!currentPassword || !newPassword) {
			return json({ error: 'Current and new passwords are required' }, { status: 400 });
		}

		if (newPassword.length < 6) {
			return json({ error: 'New password must be at least 6 characters' }, { status: 400 });
		}

		await connectDB();

		const user = await User.findById(authUser.userId);

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Verify current password
		const isMatch = await user.comparePassword(currentPassword);
		if (!isMatch) {
			return json({ error: 'Current password is incorrect' }, { status: 401 });
		}

		// Hash and update new password
		const salt = await bcrypt.genSalt(10);
		user.password_hash = await bcrypt.hash(newPassword, salt);
		await user.save();

		return json({ message: 'Password changed successfully' });
	} catch (error) {
		console.error('Change password error:', error);
		return json({ error: 'Failed to change password' }, { status: 500 });
	}
};
