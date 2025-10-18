/**
 * API: GET /api/auth/me
 * Get current authenticated user information
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { User } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';

/**
 * GET - Get current user
 */
export const GET: RequestHandler = async (event) => {
	try {
		// Try to authenticate - if no token, return null
		const authUser = requireAuth(event);

		// Connect to database
		await connectDB();

		// Get full user details from database
		const user = await User.findById(authUser.userId).select('-password_hash');
		
		if (!user) {
			return json(
				{ error: 'User not found' },
				{ status: 404 }
			);
		}

		return json({
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				phone: user.phone,
				address: user.address,
				photoUrl: user.photoUrl,
				isActive: user.isActive,
				createdAt: user.createdAt
			}
		});
	} catch (error) {
		// If it's an auth error (no token), return null user
		if (error instanceof Response) {
			return json({ user: null });
		}

		console.error('Get user error:', error);
		return json(
			{ error: 'Failed to get user information' },
			{ status: 500 }
		);
	}
};
