/**
 * API: Auto-Assign Freight Officers to Package
 * POST /api/admin/packages/[id]/assign-officers - Find and assign closest freight officers
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { Cargo, User } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';
import mongoose from 'mongoose';

// City coordinates for mapping
const CITY_COORDINATES: Record<string, { lat: number; lng: number; country: string }> = {
	'New York': { lat: 40.7128, lng: -74.0060, country: 'USA' },
	'Los Angeles': { lat: 34.0522, lng: -118.2437, country: 'USA' },
	'Chicago': { lat: 41.8781, lng: -87.6298, country: 'USA' },
	'Houston': { lat: 29.7604, lng: -95.3698, country: 'USA' },
	'Phoenix': { lat: 33.4484, lng: -112.0740, country: 'USA' },
	'Philadelphia': { lat: 39.9526, lng: -75.1652, country: 'USA' },
	'San Antonio': { lat: 29.4241, lng: -98.4936, country: 'USA' },
	'San Diego': { lat: 32.7157, lng: -117.1611, country: 'USA' },
	'Dallas': { lat: 32.7767, lng: -96.7970, country: 'USA' },
	'San Jose': { lat: 37.3382, lng: -121.8863, country: 'USA' },
	'San Francisco': { lat: 37.7749, lng: -122.4194, country: 'USA' },
	'Miami': { lat: 25.7617, lng: -80.1918, country: 'USA' },
	'Boston': { lat: 42.3601, lng: -71.0589, country: 'USA' },
	'Seattle': { lat: 47.6062, lng: -122.3321, country: 'USA' },
	'Denver': { lat: 39.7392, lng: -104.9903, country: 'USA' },
	'Lagos': { lat: 6.5244, lng: 3.3792, country: 'Nigeria' },
	'Abuja': { lat: 9.0765, lng: 7.3986, country: 'Nigeria' },
	'Kano': { lat: 12.0022, lng: 8.5920, country: 'Nigeria' },
	'Ibadan': { lat: 7.3775, lng: 3.9470, country: 'Nigeria' },
	'Port Harcourt': { lat: 4.8156, lng: 7.0498, country: 'Nigeria' },
	'London': { lat: 51.5074, lng: -0.1278, country: 'UK' },
	'Manchester': { lat: 53.4808, lng: -2.2426, country: 'UK' },
	'Birmingham': { lat: 52.4862, lng: -1.8904, country: 'UK' },
	'Tokyo': { lat: 35.6762, lng: 139.6503, country: 'Japan' },
	'Paris': { lat: 48.8566, lng: 2.3522, country: 'France' },
	'Berlin': { lat: 52.5200, lng: 13.4050, country: 'Germany' },
	'Sydney': { lat: -33.8688, lng: 151.2093, country: 'Australia' },
	'Dubai': { lat: 25.2048, lng: 55.2708, country: 'UAE' },
	'Singapore': { lat: 1.3521, lng: 103.8198, country: 'Singapore' },
	'Hong Kong': { lat: 22.3193, lng: 114.1694, country: 'Hong Kong' },
	'Shanghai': { lat: 31.2304, lng: 121.4737, country: 'China' },
	'Beijing': { lat: 39.9042, lng: 116.4074, country: 'China' },
	'Mumbai': { lat: 19.0760, lng: 72.8777, country: 'India' },
	'Delhi': { lat: 28.7041, lng: 77.1025, country: 'India' },
	'São Paulo': { lat: -23.5505, lng: -46.6333, country: 'Brazil' },
	'Rio de Janeiro': { lat: -22.9068, lng: -43.1729, country: 'Brazil' },
	'Toronto': { lat: 43.6532, lng: -79.3832, country: 'Canada' },
	'Vancouver': { lat: 49.2827, lng: -123.1207, country: 'Canada' },
	'Mexico City': { lat: 19.4326, lng: -99.1332, country: 'Mexico' },
	'Default': { lat: 40.7128, lng: -74.0060, country: 'Unknown' }
};

/**
 * Extract city/country coordinates from address with fuzzy matching
 */
function getCoordinatesFromAddress(address: string): { lat: number; lng: number; country: string } {
	if (!address) return CITY_COORDINATES.Default;
	
	const normalizedAddress = address.toLowerCase().trim();
	
	// Try exact city match first
	for (const city in CITY_COORDINATES) {
		if (normalizedAddress.includes(city.toLowerCase())) {
			return CITY_COORDINATES[city];
		}
	}
	
	// Try country-based matching as fallback
	const countryDefaults: Record<string, { lat: number; lng: number; country: string }> = {
		'nigeria': { lat: 9.0820, lng: 8.6753, country: 'Nigeria' },
		'china': { lat: 35.8617, lng: 104.1954, country: 'China' },
		'usa': { lat: 37.0902, lng: -95.7129, country: 'USA' },
		'united states': { lat: 37.0902, lng: -95.7129, country: 'USA' },
		'uk': { lat: 55.3781, lng: -3.4360, country: 'UK' },
		'united kingdom': { lat: 55.3781, lng: -3.4360, country: 'UK' }
	};
	
	for (const country in countryDefaults) {
		if (normalizedAddress.includes(country)) {
			return countryDefaults[country];
		}
	}
	
	return CITY_COORDINATES.Default;
}

/**
 * Calculate distance between two points using Haversine formula (in km)
 */
function calculateDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number
): number {
	const R = 6371; // Earth's radius in km
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const distance = R * c;
	return distance;
}

/**
 * POST - Auto-assign freight officers to package based on destination proximity
 */
export const POST: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		// Only admins can assign officers
		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		await connectDB();

		const { id } = event.params;

		if (!id || !mongoose.Types.ObjectId.isValid(id)) {
			return json({ error: 'Invalid package ID' }, { status: 400 });
		}

		const body = await event.request.json();
		const { maxOfficers = 3, maxDistance = 500 } = body; // Default: 3 officers within 500km

		// Get the package
		const pkg = await Cargo.findById(id);

		if (!pkg) {
			return json({ error: 'Package not found' }, { status: 404 });
		}

		// Get destination coordinates
		const destCoords = getCoordinatesFromAddress(pkg.destination);

		// Find all active freight officers with location data
		const officers = await User.find({
			role: 'freight_officer',
			isActive: true,
			latitude: { $exists: true, $ne: null },
			longitude: { $exists: true, $ne: null }
		}).lean();

		if (officers.length === 0) {
			return json({ 
				error: 'No freight officers with location data available',
				assigned: [],
				package: pkg
			}, { status: 200 });
		}

		// Calculate distances and sort by proximity
		const officersWithDistance = officers.map((officer) => {
			const distance = calculateDistance(
				destCoords.lat,
				destCoords.lng,
				officer.latitude!,
				officer.longitude!
			);

			return {
				officer,
				distance,
				country: officer.country || 'Unknown'
			};
		});

		// Filter by max distance and sort by closest
		const nearbyOfficers = officersWithDistance
			.filter((o) => o.distance <= maxDistance)
			.sort((a, b) => a.distance - b.distance)
			.slice(0, maxOfficers);

		if (nearbyOfficers.length === 0) {
			return json({
				message: 'No freight officers found within the specified distance',
				assigned: [],
				destination: destCoords,
				package: pkg
			}, { status: 200 });
		}

		// Assign the officers to the package
		const assignedOfficerIds = nearbyOfficers.map(
			(o) => new mongoose.Types.ObjectId(o.officer._id as string)
		);

		pkg.assignedOfficers = assignedOfficerIds;
		
		// Also set the first officer as the primary assigned officer
		if (assignedOfficerIds.length > 0) {
			pkg.assignedOfficerId = assignedOfficerIds[0];
		}

		await pkg.save();

		// Get updated package with populated officers
		const updatedPkg = await Cargo.findById(id)
			.populate('senderId', 'name email phone')
			.populate('assignedOfficerId', 'name email phone location country')
			.populate('assignedOfficers', 'name email phone location country latitude longitude')
			.populate('assignedRouteId')
			.lean();

		return json({
			message: `Successfully assigned ${nearbyOfficers.length} freight officer(s)`,
			assigned: nearbyOfficers.map((o) => ({
				id: o.officer._id,
				name: o.officer.name,
				email: o.officer.email,
				location: o.officer.location,
				country: o.country,
				distance: Math.round(o.distance * 100) / 100 // Round to 2 decimals
			})),
			destination: destCoords,
			package: updatedPkg
		});
	} catch (error) {
		console.error('Auto-assign officers error:', error);
		return json({ error: 'Failed to assign freight officers' }, { status: 500 });
	}
};
