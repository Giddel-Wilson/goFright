/**
 * API: Admin Profile Activities
 * GET /api/admin/profile/activities - Get recent activities for admin
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/auth';
import { getUserActivities } from '$lib/server/utils/activityLogger';

/**
 * GET - Get recent activities
 */
export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		// Get limit from query params (default 10, max 50)
		const url = new URL(event.request.url);
		const limitParam = url.searchParams.get('limit');
		const limit = limitParam ? Math.min(parseInt(limitParam), 50) : 10;

		const activities = await getUserActivities(authUser.userId, limit);

		return json({ activities });
	} catch (error) {
		console.error('Get activities error:', error);
		return json({ error: 'Failed to get activities' }, { status: 500 });
	}
};
