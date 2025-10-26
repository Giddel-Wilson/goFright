/**
 * API: Customer Password Change
 * PUT /api/customer/profile/password - Change password
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { User } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';
import bcrypt from 'bcryptjs';

/**
 * PUT - Change password
 */
export const PUT: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		if (authUser.role !== 'customer') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const body = await event.request.json();
		const { currentPassword, newPassword } = body;

		if (!currentPassword || !newPassword) {
			return json({ error: 'Current and new passwords are required' }, { status: 400 });
		}

		if (newPassword.length < 6) {
			return json({ error: 'Password must be at least 6 characters' }, { status: 400 });
		}

		await connectDB();

		const user = await User.findById(authUser.userId);

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Verify current password
		const isValid = await bcrypt.compare(currentPassword, user.password);
		if (!isValid) {
			return json({ error: 'Current password is incorrect' }, { status: 400 });
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update password
		user.password = hashedPassword;
		await user.save();

		return json({ message: 'Password changed successfully' });
	} catch (error) {
		console.error('Password change error:', error);
		return json({ error: 'Failed to change password' }, { status: 500 });
	}
};
