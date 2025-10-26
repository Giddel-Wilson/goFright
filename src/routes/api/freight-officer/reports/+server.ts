/**
 * API: Reports
 * GET /api/freight-officer/reports - Generate various reports
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Cargo } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';

/**
 * GET - Generate reports based on date range and type
 */
export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		if (authUser.role !== 'freight_officer' && authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const url = new URL(event.request.url);
		const reportType = url.searchParams.get('type') || 'delivery';
		const dateFrom = url.searchParams.get('from');
		const dateTo = url.searchParams.get('to');

		if (!dateFrom || !dateTo) {
			return json({ error: 'Date range is required' }, { status: 400 });
		}

		await connectDB();

		// Build query
		const query: any = {
			createdAt: {
				$gte: new Date(dateFrom),
				$lte: new Date(dateTo + 'T23:59:59.999Z')
			}
		};

		// Get shipments
		const shipments = await Cargo.find(query)
			.sort({ createdAt: -1 })
			.lean();

		// Calculate stats
		const stats = {
			totalShipments: shipments.length,
			delivered: shipments.filter(s => s.status === 'delivered').length,
			inTransit: shipments.filter(s => s.status === 'in-transit').length,
			pending: shipments.filter(s => s.status === 'pending' || s.status === 'at-warehouse').length,
			revenue: shipments.reduce((sum, s) => sum + (s.price || 0), 0)
		};

		return json({
			stats,
			shipments,
			reportType,
			dateRange: { from: dateFrom, to: dateTo }
		});
	} catch (error) {
		console.error('Report generation error:', error);
		return json({ error: 'Failed to generate report' }, { status: 500 });
	}
};
