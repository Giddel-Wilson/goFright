/**
 * API: Package Tracking with Coordinates
 * GET /api/admin/packages - Get all packages with location data
 * GET /api/admin/packages/[id] - Get single package details
 * PUT /api/admin/packages/[id]/location - Update package location
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Cargo, Route } from '$lib/server/db/models';
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
 * Extract city/country name and get coordinates with fuzzy matching
 */
function getCoordinatesFromAddress(address: string): { lat: number; lng: number } {
	if (!address) return CITY_COORDINATES.Default;
	
	const normalizedAddress = address.toLowerCase().trim();
	
	// Try exact match first
	for (const city in CITY_COORDINATES) {
		if (normalizedAddress.includes(city.toLowerCase())) {
			console.log(`📍 Matched "${address}" to ${city}`);
			return CITY_COORDINATES[city];
		}
	}
	
	// Try country-based matching as fallback
	const countryDefaults: Record<string, { lat: number; lng: number }> = {
		'nigeria': { lat: 9.0820, lng: 8.6753 },
		'china': { lat: 35.8617, lng: 104.1954 },
		'usa': { lat: 37.0902, lng: -95.7129 },
		'united states': { lat: 37.0902, lng: -95.7129 },
		'uk': { lat: 55.3781, lng: -3.4360 },
		'united kingdom': { lat: 55.3781, lng: -3.4360 }
	};
	
	for (const country in countryDefaults) {
		if (normalizedAddress.includes(country)) {
			console.log(`📍 Matched "${address}" to ${country} (country default)`);
			return countryDefaults[country];
		}
	}
	
	// Ultimate fallback - use origin/destination pattern to estimate
	console.log(`⚠️  No match for "${address}", using default coordinates`);
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
		
		// Ensure Route model is registered before populating
		Route;

		const url = new URL(event.request.url);
		const limit = parseInt(url.searchParams.get('limit') || '50');
		const status = url.searchParams.get('status');
		const routeAssigned = url.searchParams.get('routeAssigned'); // 'true', 'false', or null for all

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const query: any = {};
		if (status) query.status = status;
		
		// Filter by route assignment status
		if (routeAssigned === 'true') {
			query.assignedRouteId = { $exists: true, $ne: null };
		} else if (routeAssigned === 'false') {
			query.assignedRouteId = { $exists: false };
		}

		const packages = await Cargo.find(query)
			.populate('senderId', 'name email')
			.populate('assignedOfficerId', 'name email')
			.populate('assignedOfficers', 'name email location country latitude longitude')
			.populate('assignedRouteId') // Populate route details
			.sort({ createdAt: -1 })
			.limit(limit)
			.lean();

		// Add coordinates to each package - ALWAYS add coordinates
		const packagesWithCoordinates = packages.map((pkg) => {
			// Get coordinates, with fallbacks
			const origin = pkg.origin || 'Unknown';
			const destination = pkg.destination || 'Unknown';
			
			const originCoords = getCoordinatesFromAddress(origin);
			const destinationCoords = getCoordinatesFromAddress(destination);
			
			console.log(`🗺️  Package ${pkg.trackingId}:`);
			console.log(`   Origin: "${origin}" → [${originCoords.lat}, ${originCoords.lng}]`);
			console.log(`   Dest: "${destination}" → [${destinationCoords.lat}, ${destinationCoords.lng}]`);
			
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

			// ALWAYS return coordinates
			const packageWithCoords = {
				...pkg,
				coordinates: {
					origin: originCoords,
					destination: destinationCoords,
					current: currentCoords
				},
				// Also add formatted address strings for display
				originFormatted: origin,
				destinationFormatted: destination
			};
			
			return packageWithCoords;
		});
		
		console.log(`✅ Added coordinates to ${packagesWithCoordinates.length} packages`);

		// Get summary stats
		const stats = {
			total: await Cargo.countDocuments(),
			inTransit: await Cargo.countDocuments({ status: 'in_transit' }),
			delivered: await Cargo.countDocuments({ status: 'delivered' }),
			pending: await Cargo.countDocuments({ status: { $in: ['booked', 'pending_pickup'] } }),
			unassignedRoute: await Cargo.countDocuments({ assignedRouteId: { $exists: false } })
		};

		return json({ packages: packagesWithCoordinates, stats });
	} catch (error) {
		console.error('Get packages error:', error);
		return json({ error: 'Failed to fetch packages' }, { status: 500 });
	}
};

/**
 * POST - Create new package
 */
export const POST: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		// Only admins can create packages
		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		await connectDB();

		const body = await event.request.json();
		const {
			weight,
			cargoType,
			description,
			origin,
			destination,
			senderName,
			senderPhone,
			senderAddress,
			receiverName,
			receiverPhone,
			receiverAddress,
			status
		} = body;

		// Validate required fields
		if (!weight || !cargoType || !description || !origin || !destination || 
		    !senderName || !senderPhone || !senderAddress ||
		    !receiverName || !receiverPhone || !receiverAddress) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Create the package
		const newPackage = await Cargo.create({
			weight: parseFloat(weight),
			cargoType,
			description,
			origin,
			destination,
			senderName,
			senderPhone,
			senderAddress,
			receiverName,
			receiverPhone,
			receiverAddress,
			status: status || 'booked',
			senderId: authUser.userId, // Admin is creating it
		});

		// Add coordinates
		const originCoords = getCoordinatesFromAddress(origin);
		const destinationCoords = getCoordinatesFromAddress(destination);

		const packageWithCoordinates = {
			...newPackage.toObject(),
			coordinates: {
				origin: originCoords,
				destination: destinationCoords,
				current: originCoords
			}
		};

		return json({ 
			message: 'Package created successfully', 
			package: packageWithCoordinates 
		}, { status: 201 });
	} catch (error) {
		console.error('Create package error:', error);
		return json({ error: 'Failed to create package' }, { status: 500 });
	}
};
