<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	interface FreightOfficer {
		_id: string;
		name: string;
		email?: string;
		location?: string;
		country?: string;
		latitude?: number;
		longitude?: number;
	}

	interface Package {
		_id: string;
		trackingId: string;
		origin: string;
		destination: string;
		status: string;
		assignedOfficers?: FreightOfficer[];
		coordinates?: {
			origin: { lat: number; lng: number };
			destination: { lat: number; lng: number };
			current?: { lat: number; lng: number };
		};
	}

	interface Props {
		packages?: Package[];
		height?: string;
		zoom?: number;
	}

	let { packages = [], height = '400px', zoom = 6 }: Props = $props();

	let mapContainer: HTMLDivElement;
	let map: any = null;
	let markers: any[] = [];
	let polylines: any[] = [];
	let L: any = null;
	let isLoaded = $state(false);

	// Dynamically import Leaflet only in browser
	onMount(async () => {
		if (!browser) return;

		try {
			// Dynamically import Leaflet
			L = await import('leaflet');
			
			// Import CSS
			await import('leaflet/dist/leaflet.css');

			// Fix for default marker icons in Leaflet
			delete (L.Icon.Default.prototype as any)._getIconUrl;
			L.Icon.Default.mergeOptions({
				iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
				iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
				shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
			});

			isLoaded = true;
			initializeMap();
		} catch (error) {
			console.error('Failed to load Leaflet:', error);
		}
	});

	onDestroy(() => {
		if (map) {
			map.remove();
			map = null;
		}
	});

	function initializeMap() {
		if (!mapContainer || !L || !isLoaded) return;

		// Initialize map with OpenStreetMap tiles
		map = L.map(mapContainer, {
			center: [9.082, 8.6753], // Nigeria center
			zoom: zoom,
			scrollWheelZoom: true
		});

		// Add OpenStreetMap tile layer
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			maxZoom: 19
		}).addTo(map);

		if (packages && packages.length > 0) {
			updateMarkers();
		}
	}

	function updateMarkers() {
		if (!map || !L || !isLoaded) return;

		// Clear existing markers and polylines
		markers.forEach(marker => marker.remove());
		polylines.forEach(polyline => polyline.remove());
		markers = [];
		polylines = [];

		const bounds: L.LatLngBounds = L.latLngBounds([]);
		let hasValidCoords = false;

		packages.forEach((pkg) => {
			if (!pkg.coordinates) return;

			const { origin, destination, current } = pkg.coordinates;

			// Custom icons for different marker types
			const originIcon = L.divIcon({
				html: `<div style="background-color: #3B82F6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
				className: 'custom-marker',
				iconSize: [16, 16],
				iconAnchor: [8, 8]
			});

			const destinationIcon = L.divIcon({
				html: `<div style="background-color: #10B981; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
				className: 'custom-marker',
				iconSize: [16, 16],
				iconAnchor: [8, 8]
			});

			const currentIcon = L.divIcon({
				html: `<div style="background-color: #F59E0B; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
				className: 'custom-marker',
				iconSize: [20, 20],
				iconAnchor: [10, 10]
			});

			const officerIcon = L.divIcon({
				html: `<div style="background-color: #8B5CF6; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
				className: 'custom-marker',
				iconSize: [18, 18],
				iconAnchor: [9, 9]
			});

			// Add origin marker
			if (origin) {
				const originMarker = L.marker([origin.lat, origin.lng], { icon: originIcon })
					.addTo(map!)
					.bindPopup(`
						<div style="padding: 8px;">
							<strong style="color: #3B82F6;">${pkg.trackingId}</strong><br/>
							<span style="font-size: 12px;">Origin: ${pkg.origin}</span>
						</div>
					`);
				markers.push(originMarker);
				bounds.extend([origin.lat, origin.lng]);
				hasValidCoords = true;
			}

			// Add destination marker
			if (destination) {
				const destMarker = L.marker([destination.lat, destination.lng], { icon: destinationIcon })
					.addTo(map!)
					.bindPopup(`
						<div style="padding: 8px;">
							<strong style="color: #10B981;">${pkg.trackingId}</strong><br/>
							<span style="font-size: 12px;">Destination: ${pkg.destination}</span>
						</div>
					`);
				markers.push(destMarker);
				bounds.extend([destination.lat, destination.lng]);
				hasValidCoords = true;
			}

			// Add freight officer markers
			const officerCoords: Array<[number, number]> = [];
			if (pkg.assignedOfficers && pkg.assignedOfficers.length > 0) {
				pkg.assignedOfficers.forEach((officer, idx) => {
					if (officer.latitude && officer.longitude) {
						const officerMarker = L.marker([officer.latitude, officer.longitude], { icon: officerIcon })
							.addTo(map!)
							.bindPopup(`
								<div style="padding: 10px;">
									<strong style="color: #8B5CF6; font-size: 14px;">Freight Officer ${idx + 1}</strong><br/>
									<span style="font-size: 12px;">${officer.name}</span><br/>
									<span style="font-size: 11px; color: #666;">${officer.location || officer.country || 'N/A'}</span><br/>
									<span style="font-size: 10px; color: #999;">Package: ${pkg.trackingId}</span>
								</div>
							`);
						markers.push(officerMarker);
						bounds.extend([officer.latitude, officer.longitude]);
						hasValidCoords = true;
						officerCoords.push([officer.latitude, officer.longitude]);
					}
				});
			}

			// Add current location marker if exists
			if (current) {
				const currentMarker = L.marker([current.lat, current.lng], { icon: currentIcon })
					.addTo(map!)
					.bindPopup(`
						<div style="padding: 12px;">
							<strong style="color: #F59E0B; font-size: 14px;">${pkg.trackingId}</strong><br/>
							<span style="font-size: 12px; color: #666;">Status: ${pkg.status}</span><br/>
							<span style="font-size: 11px; color: #999;">Current Location</span>
						</div>
					`);
				markers.push(currentMarker);
				bounds.extend([current.lat, current.lng]);
				hasValidCoords = true;
			}

			// Draw path line from origin → freight officers → destination
			if (origin && destination) {
				const pathCoords: Array<[number, number]> = [
					[origin.lat, origin.lng] as [number, number]
				];

				// Add freight officer waypoints
				if (officerCoords.length > 0) {
					pathCoords.push(...officerCoords);
				}

				// Add current location if in transit
				if (current) {
					pathCoords.push([current.lat, current.lng] as [number, number]);
				}

				// Add destination
				pathCoords.push([destination.lat, destination.lng] as [number, number]);

				// Draw the main route line
				const pathLine = L.polyline(pathCoords, {
					color: '#6366F1',
					weight: 3,
					opacity: 0.7,
					dashArray: '10, 10'
				}).addTo(map!);

				polylines.push(pathLine);

				// Draw connecting lines to freight officers with different color
				if (officerCoords.length > 0) {
					officerCoords.forEach((coord) => {
						const connectionLine = L.polyline([
							[origin.lat, origin.lng] as [number, number],
							coord,
							[destination.lat, destination.lng] as [number, number]
						], {
							color: '#8B5CF6',
							weight: 2,
							opacity: 0.5,
							dashArray: '5, 5'
						}).addTo(map!);
						polylines.push(connectionLine);
					});
				}
			}
		});

		// Fit map to show all markers
		if (hasValidCoords && bounds.isValid()) {
			map!.fitBounds(bounds, { padding: [50, 50] });
		}
	}

	$effect(() => {
		if (map && packages && L && isLoaded) {
			updateMarkers();
		}
	});
</script>

<div bind:this={mapContainer} style="height: {height}; width: 100%; border-radius: 12px; overflow: hidden;" class="shadow-lg">
	{#if !isLoaded}
		<div class="flex items-center justify-center h-full bg-gray-100">
			<div class="text-center">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
				<p class="text-gray-600 text-sm">Loading map...</p>
			</div>
		</div>
	{/if}
</div>

<style>
	:global(.custom-marker) {
		background: transparent !important;
		border: none !important;
	}

	:global(.leaflet-popup-content-wrapper) {
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	:global(.leaflet-popup-tip) {
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
</style>
