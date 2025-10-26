/**
 * API: Freight Officer Daily Tasks
 * GET /api/freight-officer/daily-tasks - Get tasks for the current day
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Cargo } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';

/**
 * GET - Get daily tasks for freight officer
 */
export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		// Only freight officers and admins can access
		if (!['admin', 'freight_officer'].includes(authUser.role)) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		await connectDB();

		// Get today's date range (start and end of day)
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		// Task 1: Today's Pickups - packages waiting to be picked up
		const pickups = await Cargo.find({
			status: 'pending_pickup',
			createdAt: { $gte: today, $lt: tomorrow }
		})
			.populate('senderId', 'name email phone')
			.populate('assignedRouteId', 'routeName departureTime')
			.sort({ createdAt: 1 })
			.lean();

		// Task 2: Today's Deliveries - packages expected to be delivered today
		const deliveries = await Cargo.find({
			status: { $in: ['out_for_delivery', 'in_transit'] },
			estimatedDelivery: { $gte: today, $lt: tomorrow }
		})
			.populate('senderId', 'name email phone')
			.populate('assignedRouteId', 'routeName arrivalTime')
			.sort({ estimatedDelivery: 1 })
			.lean();

		// Task 3: In-Transit Shipments - all packages currently in transit
		const inTransit = await Cargo.find({
			status: 'in_transit',
			assignedOfficerId: authUser.userId
		})
			.populate('senderId', 'name email phone')
			.populate('assignedRouteId', 'routeName')
			.sort({ createdAt: -1 })
			.limit(20)
			.lean();

		// Task 4: Urgent Packages - delayed or high-priority packages
		const urgent = await Cargo.find({
			$or: [
				{ status: 'delayed' },
				{ 
					status: { $in: ['booked', 'pending_pickup'] },
					createdAt: { $lt: new Date(Date.now() - 48 * 60 * 60 * 1000) } // Older than 48 hours
				}
			]
		})
			.populate('senderId', 'name email phone')
			.populate('assignedRouteId', 'routeName')
			.sort({ createdAt: 1 })
			.limit(10)
			.lean();

		// Task 5: Packages needing route assignment
		const needsRoute = await Cargo.find({
			status: { $in: ['booked', 'pending_pickup'] },
			assignedRouteId: { $exists: false }
		})
			.populate('senderId', 'name email phone')
			.sort({ createdAt: 1 })
			.limit(10)
			.lean();

		// Calculate summary counts
		const summary = {
			pickupsCount: pickups.length,
			deliveriesCount: deliveries.length,
			inTransitCount: inTransit.length,
			urgentCount: urgent.length,
			needsRouteCount: needsRoute.length,
			totalTasks: pickups.length + deliveries.length + urgent.length + needsRoute.length
		};

		return json({
			summary,
			tasks: {
				pickups,
				deliveries,
				inTransit,
				urgent,
				needsRoute
			}
		});
	} catch (error) {
		console.error('Get daily tasks error:', error);
		return json({ error: 'Failed to fetch daily tasks' }, { status: 500 });
	}
};
