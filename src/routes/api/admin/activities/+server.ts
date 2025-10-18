/**
 * API: Admin Activities
 * GET /api/admin/activities - Get recent system activities
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/auth';

export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);
		
		// Only admins can access this endpoint
		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		// For now, return empty activities
		// You can implement activity logging later
		interface Activity {
			id: string;
			title: string;
			description: string;
			timestamp: string;
		}
		const activities: Activity[] = [];

		return json({ activities });
	} catch (error) {
		console.error('Admin activities error:', error);
		return json({ error: 'Failed to fetch activities' }, { status: 500 });
	}
};
