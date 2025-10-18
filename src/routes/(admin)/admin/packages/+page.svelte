<script lang="ts">
	import { onMount } from 'svelte';
	import GoogleMap from '$lib/components/GoogleMap.svelte';

	let packages = $state([]);
	let selectedPackage = $state(null);
	let isLoading = $state(true);
	let searchTerm = $state('');
	let activeTab = $state('All');
	let showMap = $state(false);

	let stats = $state({
		all: 0,
		prepared: 0,
		ready: 0,
		delivered: 0,
		inTransit: 0
	});

	const tabs = $derived([
		{ label: 'All', count: stats.all },
		{ label: 'Prepared', count: stats.prepared },
		{ label: 'Ready for shipping', count: stats.ready },
		{ label: 'Delivered', count: stats.delivered },
		{ label: 'In transit', count: stats.inTransit }
	]);

	onMount(async () => {
		await loadPackages();
	});

	async function loadPackages() {
		isLoading = true;
		try {
			const response = await fetch('/api/admin/packages', {
				credentials: 'include'
			});

			if (!response.ok) {
				throw new Error('Failed to load packages');
			}

			const data = await response.json();
			packages = data.packages || [];

			// Calculate stats - use normalized status
			stats.all = packages.length;
			stats.prepared = packages.filter(p => p.status === 'prepared').length;
			stats.ready = packages.filter(p => p.status === 'ready_for_shipping').length;
			stats.delivered = packages.filter(p => p.status === 'delivered').length;
			stats.inTransit = packages.filter(p => p.status === 'in_transit' || p.status === 'out_for_delivery').length;

			// Select first package by default
			if (packages.length > 0) {
				selectedPackage = packages[0];
			}
		} catch (error) {
			console.error('Failed to load packages:', error);
		} finally {
			isLoading = false;
		}
	}

	function getStatusColor(status: string): string {
		const colors: Record<string, string> = {
			'prepared': '#F59E0B',
			'ready_for_shipping': '#3B82F6',
			'in_transit': '#8B5CF6',
			'out_for_delivery': '#EC4899',
			'delivered': '#22C55E',
			'pending': '#EF4444'
		};
		return colors[status] || '#6B7280';
	}

	function formatStatus(status: string): string {
		return status?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Unknown';
	}

	function getDriverInitials(name: string): string {
		return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DR';
	}

	let filteredPackages = $derived(() => {
		let filtered = packages;

		// Filter by active tab
		if (activeTab === 'Prepared') {
			filtered = filtered.filter(p => p.status === 'prepared');
		} else if (activeTab === 'Ready for shipping') {
			filtered = filtered.filter(p => p.status === 'ready_for_shipping');
		} else if (activeTab === 'Delivered') {
			filtered = filtered.filter(p => p.status === 'delivered');
		} else if (activeTab === 'In transit') {
			filtered = filtered.filter(p => p.status === 'in_transit' || p.status === 'out_for_delivery');
		}

		// Filter by search term
		if (searchTerm.trim()) {
			const term = searchTerm.toLowerCase();
			filtered = filtered.filter(p => 
				p.trackingId?.toLowerCase().includes(term) ||
				p.customerName?.toLowerCase().includes(term) ||
				p.origin?.toLowerCase().includes(term) ||
				p.destination?.toLowerCase().includes(term)
			);
		}

		return filtered;
	});

	// Packages with coordinates for map
	let mappablePackages = $derived(() => {
		return packages.filter(p => p.coordinates);
	});
</script>

<svelte:head>
	<title>Packages - GoFright Admin</title>
</svelte:head>

<!-- Main Container - Fixed height, no scroll -->
<div class="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
	<!-- Top Bar with Tabs - Fixed -->
	<div class="bg-white mx-8 mt-8 rounded-3xl shadow-sm px-8 py-4 flex-shrink-0">
		<div class="flex items-center justify-between">
			<!-- Tabs -->
			<div class="flex items-center space-x-1">
				{#each tabs as tab}
					<button
						onclick={() => activeTab = tab.label}
						class="px-5 py-2.5 rounded-xl text-sm font-medium transition-all {activeTab === tab.label ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}"
					>
						{tab.label} <span class="text-gray-400">({tab.count})</span>
					</button>
				{/each}
			</div>

			<!-- Right Actions -->
			<div class="flex items-center space-x-3">
				<!-- Search -->
				<div class="relative">
					<svg class="absolute left-3.5 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
					</svg>
					<input
						type="text"
						placeholder="Search"
						bind:value={searchTerm}
						class="pl-10 pr-4 py-2 w-64 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
					/>
				</div>

				<!-- Map View Toggle -->
				<button 
					onclick={() => showMap = !showMap}
					class="px-4 py-2 {showMap ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'} rounded-xl flex items-center gap-2 hover:bg-blue-700 hover:text-white transition-colors"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
					</svg>
					{showMap ? 'Hide Map' : 'Show Map'}
				</button>

				<!-- Grid Button -->
				<button class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
					<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
					</svg>
				</button>

				<!-- Notification Button -->
				<button class="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
					<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
					</svg>
				</button>
			</div>
		</div>
	</div>

	<!-- Content Area - Flex container, no scroll -->
	<div class="flex-1 flex gap-6 px-8 py-6 overflow-hidden">
		<!-- Left Panel - Package List - ONLY THIS SCROLLS -->
		<div class="w-[380px] flex-shrink-0 overflow-y-auto pr-2 space-y-4">
			<!-- Add New Package Card -->
			<div class="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-gray-200 hover:border-blue-400 transition-all cursor-pointer flex-shrink-0">
				<div class="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
					<svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
					</svg>
				</div>
				<h3 class="text-base font-semibold text-gray-900 mb-1">Add new package</h3>
				<p class="text-sm text-gray-500 mb-4">Fill out the form and create new package</p>
				<div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto hover:bg-blue-700 transition-colors shadow-lg">
					<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
					</svg>
				</div>
			</div>

			<!-- Package Cards -->
			{#if isLoading}
				<div class="bg-white rounded-3xl p-8 text-center">
					<div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
					<p class="text-gray-500">Loading packages...</p>
				</div>
			{:else if filteredPackages().length === 0}
				<div class="bg-white rounded-3xl p-8 text-center">
					<svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
					</svg>
					<p class="text-gray-500">No packages found</p>
				</div>
			{:else}
				{#each filteredPackages() as pkg}
					<div
						onclick={() => selectedPackage = pkg}
						class="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 text-white cursor-pointer hover:shadow-2xl transition-all duration-300 flex-shrink-0 {selectedPackage?._id === pkg._id ? 'ring-4 ring-blue-300 ring-offset-2' : ''}"
						role="button"
						tabindex="0"
					>
						<!-- Header -->
						<div class="flex items-start justify-between mb-4">
							<div>
								<p class="text-xs text-blue-200 mb-0.5">Number</p>
								<p class="text-base font-bold">{pkg.trackingId || 'N/A'}</p>
							</div>
							<div class="text-right">
								<p class="text-xs text-blue-200 mb-0.5">Status</p>
								<div class="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur">
									<span class="w-1.5 h-1.5 rounded-full" style="background-color: {getStatusColor(pkg.status)}"></span>
									{formatStatus(pkg.status)}
								</div>
							</div>
						</div>

						<!-- Timeline -->
						<div class="flex items-center gap-3 mb-4 text-sm">
							<div class="flex-1">
								<p class="text-xs text-blue-200 mb-0.5">Origin</p>
								<p class="font-medium text-xs truncate">{pkg.origin || 'N/A'}</p>
							</div>
							<div class="flex-1 border-t-2 border-dashed border-white/30 mx-2"></div>
							<div class="flex-1 text-right">
								<p class="text-xs text-blue-200 mb-0.5">Destination</p>
								<p class="font-medium text-xs truncate">{pkg.destination || 'N/A'}</p>
							</div>
						</div>

						<!-- Info Grid -->
						<div class="grid grid-cols-3 gap-3 pt-4 border-t border-white/20 mb-4">
							<div>
								<p class="text-xs text-blue-200 mb-0.5">Customer</p>
								<p class="font-medium text-xs truncate">{pkg.customerName || 'N/A'}</p>
							</div>
							<div>
								<p class="text-xs text-blue-200 mb-0.5">Weight</p>
								<p class="font-medium text-xs">{pkg.weight ? `${pkg.weight} kg` : 'N/A'}</p>
							</div>
							<div>
								<p class="text-xs text-blue-200 mb-0.5">Value</p>
								<p class="font-medium text-xs">${pkg.declaredValue || 'N/A'}</p>
							</div>
						</div>

						<!-- Driver/Handler -->
						<div class="flex items-center gap-3 pt-4 border-t border-white/20">
							<div class="w-9 h-9 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
								{getDriverInitials(pkg.assignedTo?.name || 'Handler')}
							</div>
							<div class="flex-1">
								<p class="font-medium text-sm">{pkg.assignedTo?.name || 'Unassigned'}</p>
								<p class="text-xs text-blue-200">{pkg.assignedTo?.role || 'Handler'}</p>
							</div>
							<div class="flex gap-2">
								<button
									onclick={(e) => { e.stopPropagation(); }}
									class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
									title="Message"
								>
									<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
										<path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
									</svg>
								</button>
								<button
									onclick={(e) => { e.stopPropagation(); }}
									class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
									title="Call"
								>
									<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
									</svg>
								</button>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Right Panel - Map and Details - No scroll -->
		<div class="flex-1 bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col">
			{#if selectedPackage}
				<!-- Package Header -->
				<div class="p-6 border-b border-gray-100 flex-shrink-0">
					<div class="flex items-start justify-between mb-2">
						<div>
							<h2 class="text-xl font-bold text-gray-900">{selectedPackage.trackingId || 'N/A'}</h2>
						</div>
						<button class="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
							<svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
								<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
							</svg>
						</button>
					</div>
					<div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style="background-color: {getStatusColor(selectedPackage.status)}20; color: {getStatusColor(selectedPackage.status)}">
						<span class="w-2 h-2 rounded-full" style="background-color: {getStatusColor(selectedPackage.status)}"></span>
						{formatStatus(selectedPackage.status)}
					</div>
				</div>

				<!-- Map - Flex grows to fill space -->
				<div class="flex-1 relative bg-gray-100">
					{#if showMap && mappablePackages().length > 0}
						<GoogleMap 
							packages={mappablePackages()} 
							height="100%"
							zoom={4}
						/>
					{:else if showMap}
						<div class="absolute inset-0 flex items-center justify-center">
							<div class="text-center">
								<svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
								</svg>
								<p class="text-gray-500 font-medium">No location data available</p>
								<p class="text-sm text-gray-400 mt-1">Packages without GPS coordinates cannot be displayed on the map</p>
							</div>
						</div>
					{:else}
						<div class="absolute inset-0 flex items-center justify-center">
							<div class="text-center">
								<svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
								</svg>
								<p class="text-gray-500 font-medium">Click "Show Map" to view package locations</p>
								<p class="text-sm text-gray-400 mt-1">Track all packages with GPS coordinates in real-time</p>
							</div>
						</div>
					{/if}
				</div>

				<!-- Details Footer - Fixed at bottom -->
				<div class="p-6 space-y-3 flex-shrink-0">
					<div class="bg-gray-50 rounded-2xl p-4">
						<p class="text-xs text-gray-500 mb-1">Origin → Destination</p>
						<p class="text-sm font-semibold text-gray-900">{selectedPackage.origin || 'N/A'} → {selectedPackage.destination || 'N/A'}</p>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<div class="bg-gray-50 rounded-2xl p-4">
							<p class="text-xs text-gray-500 mb-1">Customer</p>
							<p class="text-sm font-semibold text-gray-900">{selectedPackage.customerName || 'N/A'}</p>
						</div>
						<div class="bg-gray-50 rounded-2xl p-4">
							<p class="text-xs text-gray-500 mb-1">Phone</p>
							<p class="text-sm font-semibold text-gray-900">{selectedPackage.customerPhone || 'N/A'}</p>
						</div>
					</div>

					<div class="grid grid-cols-3 gap-3">
						<div class="bg-gray-50 rounded-2xl p-4">
							<p class="text-xs text-gray-500 mb-1">Weight</p>
							<p class="text-sm font-semibold text-gray-900">{selectedPackage.weight ? `${selectedPackage.weight} kg` : 'N/A'}</p>
						</div>
						<div class="bg-gray-50 rounded-2xl p-4">
							<p class="text-xs text-gray-500 mb-1">Value</p>
							<p class="text-sm font-semibold text-gray-900">${selectedPackage.declaredValue || 'N/A'}</p>
						</div>
						<div class="bg-gray-50 rounded-2xl p-4">
							<p class="text-xs text-gray-500 mb-1">Type</p>
							<p class="text-sm font-semibold text-gray-900">{selectedPackage.cargoType || 'N/A'}</p>
						</div>
					</div>

					<div class="bg-gray-50 rounded-2xl p-4">
						<p class="text-xs text-gray-500 mb-1">Description</p>
						<p class="text-sm font-semibold text-gray-900">{selectedPackage.description || 'No description provided'}</p>
					</div>
				</div>
			{:else}
				<div class="h-full flex items-center justify-center">
					<div class="text-center">
						<svg class="w-24 h-24 mx-auto mb-6 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
						</svg>
						<p class="text-xl font-semibold text-gray-900 mb-2">Select a package</p>
						<p class="text-gray-500">Click on a package to view details</p>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	/* Custom scrollbar for package list only */
	.overflow-y-auto::-webkit-scrollbar {
		width: 6px;
	}
	
	.overflow-y-auto::-webkit-scrollbar-track {
		background: transparent;
	}
	
	.overflow-y-auto::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 3px;
	}
	
	.overflow-y-auto::-webkit-scrollbar-thumb:hover {
		background: #94a3b8;
	}
</style>
