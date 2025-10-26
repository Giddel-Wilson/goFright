/**
 * API: Customer Dashboard
 * GET /api/customer/dashboard - Get customer dashboard data
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Cargo } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';

/**
 * GET - Get customer dashboard statistics and recent data
 */
export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		if (authUser.role !== 'customer') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		await connectDB();

		// Get customer's shipments
		const shipments = await Cargo.find({ customerId: authUser.userId })
			.sort({ createdAt: -1 })
			.lean();

		// Calculate stats
		const stats = {
			totalShipments: shipments.length,
			active: shipments.filter(s => 
				s.status === 'pending' || 
				s.status === 'at-warehouse' || 
				s.status === 'in-transit'
			).length,
			delivered: shipments.filter(s => s.status === 'delivered').length,
			pendingPayment: shipments.filter(s => !s.paymentStatus || s.paymentStatus === 'pending').length
		};

		// Get recent shipments (last 5)
		const recentShipments = shipments.slice(0, 5);

		// Generate mock invoices (in production, this would come from an Invoice model)
		const recentInvoices = shipments.slice(0, 3).map((shipment, index) => ({
			invoiceNumber: `INV-2024-${String(index + 1).padStart(6, '0')}`,
			amount: shipment.price || 50000,
			description: `Shipping for ${shipment.trackingNumber}`,
			status: shipment.paymentStatus || 'pending',
			createdAt: shipment.createdAt
		}));

		return json({
			stats,
			recentShipments,
			recentInvoices
		});
	} catch (error) {
		console.error('Dashboard error:', error);
		return json({ error: 'Failed to load dashboard' }, { status: 500 });
	}
};
