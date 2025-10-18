/**
 * API: POST /api/auth/logout
 * Logout user and clear authentication cookie
 */

import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * POST - Logout user
 */
export const POST: RequestHandler = async ({ cookies }) => {
	// Clear authentication cookie
	cookies.delete('auth_token', { path: '/' });

	return json({
		message: 'Logout successful'
	});
};
