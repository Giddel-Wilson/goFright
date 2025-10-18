/**
 * API: Admin Analytics Data
 * GET /api/admin/analytics - Get analytics data for reports page
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { User, Cargo } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';

/**
 * GET - Get analytics data
 */
export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		// Only admins can access
		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		await connectDB();

		// Get total users count
		const totalUsers = await User.countDocuments();
		const activeUsers = await User.countDocuments({ isActive: true });
		
		// Get cargo stats
		const totalShipments = await Cargo.countDocuments();
		const deliveredShipments = await Cargo.countDocuments({ status: 'delivered' });

		// Mock analytics data (you can replace with real aggregation queries)
		const analytics = {
			stats: {
				totalPosts: totalShipments,
				totalFollowers: totalUsers * 150, // Mock: avg 150 followers per user
				totalFollowing: totalUsers * 87,  // Mock: avg 87 following per user
				engagement: totalShipments > 0 ? ((deliveredShipments / totalShipments) * 100) : 0
			},
			demographicData: {
				topCountries: [
					{ 
						name: 'Indonesia', 
						percentage: 45.5, 
						users: Math.floor(totalUsers * 0.455),
						flag: '🇮🇩',
						trend: 'up',
						regions: [
							{ name: 'Jakarta', percentage: 18.2 },
							{ name: 'Bali', percentage: 12.5 },
							{ name: 'Surabaya', percentage: 14.8 }
						]
					},
					{ 
						name: 'Nepal', 
						percentage: 28.2, 
						users: Math.floor(totalUsers * 0.282),
						flag: '🇳🇵',
						trend: 'up',
						regions: [
							{ name: 'Kathmandu', percentage: 15.1 },
							{ name: 'Pokhara', percentage: 8.3 },
							{ name: 'Lalitpur', percentage: 4.8 }
						]
					},
					{ 
						name: 'United States', 
						percentage: 26.3, 
						users: Math.floor(totalUsers * 0.263),
						flag: '🇺🇸',
						trend: 'down',
						regions: [
							{ name: 'New York', percentage: 9.2 },
							{ name: 'California', percentage: 11.5 },
							{ name: 'Texas', percentage: 5.6 }
						]
					}
				],
				ageGroups: [
					{ range: '13-17', label: '13-17 years', percentage: 8.5, count: Math.floor(totalUsers * 0.085) },
					{ range: '18-24', label: '18-24 years', percentage: 28.3, count: Math.floor(totalUsers * 0.283) },
					{ range: '25-34', label: '25-34 years', percentage: 35.7, count: Math.floor(totalUsers * 0.357) },
					{ range: '35-44', label: '35-44 years', percentage: 18.2, count: Math.floor(totalUsers * 0.182) },
					{ range: '45-54', label: '45-54 years', percentage: 7.1, count: Math.floor(totalUsers * 0.071) },
					{ range: '55+', label: '55+ years', percentage: 2.2, count: Math.floor(totalUsers * 0.022) }
				],
				genderData: {
					male: 60,
					female: 30,
					other: 10
				}
			},
			activityData: generateActivityHeatmap(),
			trends: {
				postsGrowth: 12.5,
				followersGrowth: 18.3,
				followingGrowth: 8.7,
				engagementGrowth: -2.4
			}
		};

		return json({ analytics });
	} catch (error) {
		console.error('Get analytics error:', error);
		return json({ error: 'Failed to fetch analytics' }, { status: 500 });
	}
};

/**
 * Generate activity heatmap data (12 weeks x 7 days)
 */
function generateActivityHeatmap(): number[][] {
	const weeks = 12;
	const days = 7;
	const heatmap: number[][] = [];

	for (let week = 0; week < weeks; week++) {
		const weekData: number[] = [];
		for (let day = 0; day < days; day++) {
			// Generate realistic activity patterns
			// Weekdays (Mon-Fri) have more activity than weekends
			const isWeekday = day >= 1 && day <= 5;
			const baseActivity = isWeekday ? 30 : 10;
			const variance = Math.floor(Math.random() * 40);
			weekData.push(baseActivity + variance);
		}
		heatmap.push(weekData);
	}

	return heatmap;
}
