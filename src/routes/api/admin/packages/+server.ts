/**
 * API: Package Tracking with Coordinates
 * GET /api/admin/packages - Get all packages with location data
 * GET /api/admin/packages/[id] - Get single package details
 * PUT /api/admin/packages/[id]/location - Update package location
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Cargo } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';

// City coordinates for mapping
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
	'New York': { lat: 40.7128, lng: -74.0060 },
	'Los Angeles': { lat: 34.0522, lng: -118.2437 },
	'Chicago': { lat: 41.8781, lng: -87.6298 },
	'Houston': { lat: 29.7604, lng: -95.3698 },
	'Phoenix': { lat: 33.4484, lng: -112.0740 },
	'Philadelphia': { lat: 39.9526, lng: -75.1652 },
	'San Antonio': { lat: 29.4241, lng: -98.4936 },
	'San Diego': { lat: 32.7157, lng: -117.1611 },
	'Dallas': { lat: 32.7767, lng: -96.7970 },
	'San Jose': { lat: 37.3382, lng: -121.8863 },
	'San Francisco': { lat: 37.7749, lng: -122.4194 },
	'Miami': { lat: 25.7617, lng: -80.1918 },
	'Boston': { lat: 42.3601, lng: -71.0589 },
	'Seattle': { lat: 47.6062, lng: -122.3321 },
	'Denver': { lat: 39.7392, lng: -104.9903 },
	'Lagos': { lat: 6.5244, lng: 3.3792 },
	'London': { lat: 51.5074, lng: -0.1278 },
	'Tokyo': { lat: 35.6762, lng: 139.6503 },
	'Paris': { lat: 48.8566, lng: 2.3522 },
	'Berlin': { lat: 52.5200, lng: 13.4050 },
	'Default': { lat: 40.7128, lng: -74.0060 } // Default to NYC
};

/**
 * Extract city name and get coordinates
 */
function getCoordinatesFromAddress(address: string): { lat: number; lng: number } {
	for (const city in CITY_COORDINATES) {
		if (address.includes(city)) {
			return CITY_COORDINATES[city];
		}
	}
	return CITY_COORDINATES.Default;
}

/**
 * GET - Get all packages with location data
 */
export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		// Only admins and freight officers can access
		if (!['admin', 'freight_officer'].includes(authUser.role)) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		await connectDB();

		const url = new URL(event.request.url);
		const limit = parseInt(url.searchParams.get('limit') || '50');
		const status = url.searchParams.get('status');

		const query = status ? { status } : {};

		const packages = await Cargo.find(query)
			.populate('senderId', 'name email')
			.populate('assignedOfficerId', 'name email')
			.sort({ createdAt: -1 })
			.limit(limit)
			.lean();

		// Add coordinates to each package
		const packagesWithCoordinates = packages.map((pkg) => {
			const originCoords = getCoordinatesFromAddress(pkg.origin);
			const destinationCoords = getCoordinatesFromAddress(pkg.destination);
			
			// Calculate current location based on status
			let currentCoords = originCoords;
			if (pkg.status === 'delivered') {
				currentCoords = destinationCoords;
			} else if (pkg.status === 'in_transit' || pkg.status === 'out_for_delivery') {
				// Interpolate position between origin and destination
				const progress = pkg.status === 'out_for_delivery' ? 0.8 : 0.5;
				currentCoords = {
					lat: originCoords.lat + (destinationCoords.lat - originCoords.lat) * progress,
					lng: originCoords.lng + (destinationCoords.lng - originCoords.lng) * progress
				};
			}

			return {
				...pkg,
				coordinates: {
					origin: originCoords,
					destination: destinationCoords,
					current: currentCoords
				}
			};
		});

		// Get summary stats
		const stats = {
			total: await Cargo.countDocuments(),
			inTransit: await Cargo.countDocuments({ status: 'in_transit' }),
			delivered: await Cargo.countDocuments({ status: 'delivered' }),
			pending: await Cargo.countDocuments({ status: { $in: ['booked', 'pending_pickup'] } })
		};

		return json({ packages: packagesWithCoordinates, stats });
	} catch (error) {
		console.error('Get packages error:', error);
		return json({ error: 'Failed to fetch packages' }, { status: 500 });
	}
};
