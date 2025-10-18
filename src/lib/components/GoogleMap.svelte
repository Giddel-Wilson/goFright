<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_GOOGLE_MAPS_API_KEY } from '$env/static/public';

	interface MapProps {
		packages?: Array<{
			trackingId: string;
			coordinates: {
				origin: { lat: number; lng: number };
				destination: { lat: number; lng: number };
				current: { lat: number; lng: number };
			};
			status: string;
			senderName: string;
			receiverName: string;
		}>;
		center?: { lat: number; lng: number };
		zoom?: number;
		height?: string;
	}

	let { packages = [], center = { lat: 40.7128, lng: -74.006 }, zoom = 4, height = '400px' }: MapProps = $props();

	let mapContainer: HTMLDivElement;
	let map: google.maps.Map | null = null;
	let markers: google.maps.Marker[] = [];
	let infoWindows: google.maps.InfoWindow[] = [];

	onMount(async () => {
		// Load Google Maps API
		if (!window.google) {
			const script = document.createElement('script');
			script.src = `https://maps.googleapis.com/maps/api/js?key=${PUBLIC_GOOGLE_MAPS_API_KEY}`;
			script.async = true;
			script.defer = true;
			document.head.appendChild(script);

			await new Promise((resolve) => {
				script.onload = resolve;
			});
		}

		initializeMap();
	});

	function initializeMap() {
		if (!mapContainer || !window.google) return;

		map = new google.maps.Map(mapContainer, {
			center,
			zoom,
			styles: [
				{
					featureType: 'poi',
					elementType: 'labels',
					stylers: [{ visibility: 'off' }]
				}
			]
		});

		// Add markers for packages
		if (packages.length > 0) {
			addPackageMarkers();
		}
	}

	function addPackageMarkers() {
		if (!map) return;

		// Clear existing markers
		markers.forEach(marker => marker.setMap(null));
		infoWindows.forEach(infoWindow => infoWindow.close());
		markers = [];
		infoWindows = [];

		packages.forEach((pkg) => {
			if (!pkg.coordinates) return;

			const { origin, destination, current } = pkg.coordinates;

			// Origin marker (green)
			const originMarker = new google.maps.Marker({
				position: origin,
				map,
				title: `Origin: ${pkg.senderName}`,
				icon: {
					path: google.maps.SymbolPath.CIRCLE,
					scale: 8,
					fillColor: '#10b981',
					fillOpacity: 1,
					strokeColor: '#ffffff',
					strokeWeight: 2
				}
			});

			// Destination marker (red)
			const destMarker = new google.maps.Marker({
				position: destination,
				map,
				title: `Destination: ${pkg.receiverName}`,
				icon: {
					path: google.maps.SymbolPath.CIRCLE,
					scale: 8,
					fillColor: '#ef4444',
					fillOpacity: 1,
					strokeColor: '#ffffff',
					strokeWeight: 2
				}
			});

			// Current location marker (blue truck icon)
			const currentMarker = new google.maps.Marker({
				position: current,
				map,
				title: `Package: ${pkg.trackingId}`,
				icon: {
					path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
					scale: 6,
					fillColor: '#3b82f6',
					fillOpacity: 1,
					strokeColor: '#ffffff',
					strokeWeight: 2,
					rotation: calculateBearing(origin, destination)
				}
			});

			// Create info window for current location
			const infoWindow = new google.maps.InfoWindow({
				content: `
					<div style="padding: 8px; font-family: sans-serif;">
						<h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${pkg.trackingId}</h3>
						<p style="margin: 4px 0; font-size: 12px; color: #666;">Status: <span style="color: #3b82f6; font-weight: 500;">${pkg.status}</span></p>
						<p style="margin: 4px 0; font-size: 12px; color: #666;">From: ${pkg.senderName}</p>
						<p style="margin: 4px 0; font-size: 12px; color: #666;">To: ${pkg.receiverName}</p>
					</div>
				`
			});

			currentMarker.addListener('click', () => {
				infoWindows.forEach(iw => iw.close());
				infoWindow.open(map, currentMarker);
			});

			// Draw path line
			const pathLine = new google.maps.Polyline({
				path: [origin, current, destination],
				geodesic: true,
				strokeColor: '#3b82f6',
				strokeOpacity: 0.6,
				strokeWeight: 2,
				map
			});

			markers.push(originMarker, destMarker, currentMarker);
			infoWindows.push(infoWindow);
		});

		// Fit bounds to show all markers
		if (markers.length > 0) {
			const bounds = new google.maps.LatLngBounds();
			markers.forEach(marker => {
				const position = marker.getPosition();
				if (position) bounds.extend(position);
			});
			map?.fitBounds(bounds);
		}
	}

	function calculateBearing(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): number {
		const lat1 = origin.lat * Math.PI / 180;
		const lat2 = destination.lat * Math.PI / 180;
		const dLon = (destination.lng - origin.lng) * Math.PI / 180;

		const y = Math.sin(dLon) * Math.cos(lat2);
		const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
		const bearing = Math.atan2(y, x) * 180 / Math.PI;

		return (bearing + 360) % 360;
	}

	// Update markers when packages change
	$effect(() => {
		if (map && packages.length > 0) {
			addPackageMarkers();
		}
	});
</script>

<div bind:this={mapContainer} style="width: 100%; height: {height}; border-radius: 1.5rem;"></div>
