/**
 * Activity Logger Utility
 * Helper functions for logging user activities
 */

import { ActivityLog, type IActivityLog } from '$lib/server/db/models';
import { connectDB } from '$lib/server/db';
import type { RequestEvent } from '@sveltejs/kit';

export interface LogActivityOptions {
	userId: string;
	action: string;
	details: string;
	category?: IActivityLog['category'];
	metadata?: Record<string, any>;
	event?: RequestEvent;
}

/**
 * Log a user activity
 */
export async function logActivity(options: LogActivityOptions): Promise<void> {
	try {
		await connectDB();

		const ip = options.event?.request.headers.get('x-forwarded-for') || 
		            options.event?.request.headers.get('x-real-ip') || 
		            options.event?.getClientAddress();
		
		const userAgent = options.event?.request.headers.get('user-agent');

		await ActivityLog.create({
			userId: options.userId,
			action: options.action,
			details: options.details,
			category: options.category || 'other',
			metadata: options.metadata,
			ip: ip || undefined,
			userAgent: userAgent || undefined
		});
	} catch (error) {
		// Don't throw errors from activity logging - just log them
		console.error('Failed to log activity:', error);
	}
}

/**
 * Get recent activities for a user
 */
export async function getUserActivities(userId: string, limit = 10) {
	await connectDB();
	
	return await ActivityLog.find({ userId })
		.sort({ createdAt: -1 })
		.limit(limit)
		.lean();
}

/**
 * Get recent activities by category
 */
export async function getActivitiesByCategory(
	userId: string,
	category: IActivityLog['category'],
	limit = 10
) {
	await connectDB();
	
	return await ActivityLog.find({ userId, category })
		.sort({ createdAt: -1 })
		.limit(limit)
		.lean();
}
