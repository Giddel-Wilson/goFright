/**
 * API: Customer Invoices
 * GET /api/customer/invoices - List customer's invoices
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Cargo } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';

/**
 * GET - Get customer's invoices
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

		// Generate invoices from shipments
		const invoices = shipments.map((shipment, index) => ({
			_id: shipment._id,
			invoiceNumber: `INV-${new Date(shipment.createdAt).getFullYear()}-${String(index + 1).padStart(6, '0')}`,
			trackingNumber: shipment.trackingNumber,
			amount: shipment.price || 0,
			status: shipment.paymentStatus || 'pending',
			createdAt: shipment.createdAt,
			description: `Shipping for ${shipment.trackingNumber}`
		}));

		// Calculate stats
		const stats = {
			total: invoices.length,
			paid: invoices.filter(i => i.status === 'paid').length,
			pending: invoices.filter(i => i.status === 'pending').length,
			overdue: invoices.filter(i => i.status === 'overdue').length,
			totalAmount: invoices.reduce((sum, i) => sum + i.amount, 0)
		};

		return json({ invoices, stats });
	} catch (error) {
		console.error('Get invoices error:', error);
		return json({ error: 'Failed to fetch invoices' }, { status: 500 });
	}
};
