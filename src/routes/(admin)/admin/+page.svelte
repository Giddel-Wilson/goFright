<script lang="ts">
	import { onMount } from 'svelte';
	import LeafletMap from '$lib/components/LeafletMap.svelte';

	let stats = $state({
		totalDelivered: 0,
		onDelivery: 0,
		canceledDelivery: 0,
		newDelivery: 0
	});

	let shipments = $state([]);
	let livePackages = $state([]);
	let isLoading = $state(true);

	onMount(async () => {
		await loadDashboardData();
	});

	async function loadDashboardData() {
		isLoading = true;
		try {
			// Load stats
			const statsResponse = await fetch('/api/admin/stats', {
				credentials: 'include'
			});

			if (statsResponse.ok) {
				const statsData = await statsResponse.json();
				stats.totalDelivered = statsData.totalCargo || 0;
				stats.onDelivery = Math.floor((statsData.totalCargo || 0) * 0.15);
				stats.canceledDelivery = Math.floor((statsData.totalCargo || 0) * 0.02);
				stats.newDelivery = statsData.pendingCargo || 0;
			}

			// Load recent shipments
			const cargoResponse = await fetch('/api/cargo?limit=10', {
				credentials: 'include'
			});

			if (cargoResponse.ok) {
				const cargoData = await cargoResponse.json();
				shipments = cargoData.cargo || [];
			}

			// Load packages for live tracking
			const packagesResponse = await fetch('/api/admin/packages?limit=20', {
				credentials: 'include'
			});

			if (packagesResponse.ok) {
				const packagesData = await packagesResponse.json();
				// Filter only packages that are in transit or out for delivery
				livePackages = (packagesData.packages || []).filter((pkg: any) => 
					pkg.status === 'in_transit' || pkg.status === 'out_for_delivery'
				);
			}
		} catch (error) {
			console.error('Failed to load dashboard data:', error);
		} finally {
			isLoading = false;
		}
	}

	function formatDate(date: string | Date): string {
		if (!date) return 'N/A';
		const d = new Date(date);
		return d.toLocaleDateString('en-US', { 
			month: '2-digit', 
			day: '2-digit', 
			year: 'numeric' 
		});
	}

	function getStatusBadge(status: string): string {
		const badges: Record<string, string> = {
			'delivered': 'bg-green-100 text-green-700',
			'in_transit': 'bg-blue-100 text-blue-700',
			'pending_pickup': 'bg-orange-100 text-orange-700',
			'booked': 'bg-yellow-100 text-yellow-700',
			'out_for_delivery': 'bg-purple-100 text-purple-700',
			'delayed': 'bg-red-100 text-red-700',
			'cancelled': 'bg-gray-100 text-gray-700'
		};
		return badges[status] || 'bg-gray-100 text-gray-700';
	}

	function formatStatus(status: string): string {
		return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
	}
</script>

<svelte:head>
	<title>Dashboard - GoFright Admin</title>
</svelte:head>

<div class="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
	<!-- Header -->
	<div class="mx-8 mt-8 flex-shrink-0">
		<div class="flex items-center justify-between mb-6">
			<div>
				<h1 class="text-3xl font-bold text-gray-900 mb-1">Good Morning!</h1>
				<p class="text-gray-600">Here's what's happening with your shipments today</p>
			</div>
			<div class="flex items-center gap-3">
				<button class="px-4 py-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
					Export CSV
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
					</svg>
				</button>
				<button class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium shadow-lg shadow-blue-600/30 flex items-center gap-2">
					Add New Shipping
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
					</svg>
				</button>
			</div>
		</div>
	</div>

	<!-- Content - Scrollable -->
	<div class="flex-1 overflow-y-auto px-8 pb-8 space-y-6">
		<!-- Stats Cards Row -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
			<!-- Total Delivered -->
			<div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
				<div class="flex items-center justify-between mb-3">
					<div class="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
					</div>
					<span class="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg font-medium">↑ 12.5%</span>
				</div>
				<p class="text-sm text-gray-600 mb-1">Total Delivered</p>
				<p class="text-2xl font-bold text-gray-900">{stats.totalDelivered.toLocaleString()}</p>
				<p class="text-xs text-gray-500 mt-2">
					<span class="text-green-600">+{Math.floor(stats.totalDelivered * 0.12)}</span> in Last Month
				</p>
			</div>

			<!-- On Delivery -->
			<div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
				<div class="flex items-center justify-between mb-3">
					<div class="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
						<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
						</svg>
					</div>
					<span class="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg font-medium">↑ 8.2%</span>
				</div>
				<p class="text-sm text-gray-600 mb-1">On Delivery</p>
				<p class="text-2xl font-bold text-gray-900">{stats.onDelivery.toLocaleString()}</p>
				<p class="text-xs text-gray-500 mt-2">
					<span class="text-purple-600">{Math.floor(stats.onDelivery * 0.08)}</span> in Last Month
				</p>
			</div>

			<!-- Canceled Delivery -->
			<div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
				<div class="flex items-center justify-between mb-3">
					<div class="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
						<svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
					</div>
					<span class="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-lg font-medium">↓ 2.1%</span>
				</div>
				<p class="text-sm text-gray-600 mb-1">Canceled Delivery</p>
				<p class="text-2xl font-bold text-gray-900">{stats.canceledDelivery.toLocaleString()}</p>
				<p class="text-xs text-gray-500 mt-2">
					<span class="text-red-600">{stats.canceledDelivery}</span> in Last Month
				</p>
			</div>

			<!-- New Delivery -->
			<div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
				<div class="flex items-center justify-between mb-3">
					<div class="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
						<svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
						</svg>
					</div>
					<span class="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg font-medium">↑ 15.8%</span>
				</div>
				<p class="text-sm text-gray-600 mb-1">New Delivery</p>
				<p class="text-2xl font-bold text-gray-900">{stats.newDelivery.toLocaleString()}</p>
				<p class="text-xs text-gray-500 mt-2">
					<span class="text-orange-600">+{Math.floor(stats.newDelivery * 0.15)}</span> in Last Month
				</p>
			</div>
		</div>

		<!-- Main Content Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Shipment Analytics Chart -->
			<div class="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-xl font-bold text-gray-900">Shipment Analytics</h2>
					<div class="flex items-center gap-2">
						<button class="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
							Day
						</button>
						<button class="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
							Week
						</button>
						<button class="px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-600 rounded-lg">
							Month
						</button>
					</div>
				</div>

				<!-- Chart Placeholder -->
				<div class="h-64 flex items-end justify-between gap-4 px-4">
					<!-- Animated Bars -->
					<div class="flex-1 flex flex-col items-center gap-2">
						<div class="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-xl relative" style="height: 45%">
							<div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-bold">
								152
							</div>
						</div>
						<span class="text-xs text-gray-500 font-medium">May</span>
					</div>
					<div class="flex-1 flex flex-col items-center gap-2">
						<div class="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-xl" style="height: 60%"></div>
						<span class="text-xs text-gray-500 font-medium">Jun</span>
					</div>
					<div class="flex-1 flex flex-col items-center gap-2">
						<div class="w-full bg-gradient-to-t from-blue-600 to-blue-500 rounded-t-xl relative" style="height: 95%">
							<div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-bold">
								248
							</div>
						</div>
						<span class="text-xs text-blue-600 font-bold">Jul</span>
					</div>
					<div class="flex-1 flex flex-col items-center gap-2">
						<div class="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-xl" style="height: 75%"></div>
						<span class="text-xs text-gray-500 font-medium">Aug</span>
					</div>
					<div class="flex-1 flex flex-col items-center gap-2">
						<div class="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-xl" style="height: 55%"></div>
						<span class="text-xs text-gray-500 font-medium">Sep</span>
					</div>
					<div class="flex-1 flex flex-col items-center gap-2">
						<div class="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-xl" style="height: 40%"></div>
						<span class="text-xs text-gray-500 font-medium">Oct</span>
					</div>
				</div>
			</div>

			<!-- Live Tracking Delivery Card -->
			<div class="bg-white rounded-3xl p-8 shadow-sm">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-xl font-bold text-gray-900">Live Tracking Delivery</h2>
					<div class="flex items-center gap-2">
						<span class="text-sm text-gray-600">{livePackages.length} active</span>
						<button class="text-blue-600 hover:text-blue-700">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
							</svg>
						</button>
					</div>
				</div>

				<!-- Live Shipment Map -->
				{#if livePackages.length > 0}
					<div class="mb-6 rounded-2xl overflow-hidden">
						<LeafletMap packages={livePackages} height="300px" zoom={5} />
					</div>
				{:else}
					<div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl h-48 mb-6 flex items-center justify-center">
						<div class="text-center">
							<svg class="w-16 h-16 text-blue-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
							</svg>
							<p class="text-gray-600 text-sm">No active shipments to track</p>
						</div>
					</div>
				{/if}

				<div class="space-y-4">
					{#if livePackages.length > 0}
						{#each livePackages.slice(0, 3) as pkg}
							<div class="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-xl">
								<div>
									<p class="font-bold text-gray-900">{pkg.trackingId}</p>
									<p class="text-xs text-gray-600">{pkg.origin} → {pkg.destination}</p>
								</div>
								<span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
									{formatStatus(pkg.status)}
								</span>
							</div>
						{/each}
					{:else}
						<div class="text-center py-4 text-gray-500 text-sm">
							No shipments currently in transit
						</div>
					{/if}
				</div>
				
				<!-- Status Timeline -->
				<div class="grid grid-cols-4 gap-2 pt-4">
						<button class="flex flex-col items-center gap-2 p-3 bg-blue-50 rounded-xl">
							<div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
								<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
								</svg>
							</div>
							<span class="text-[10px] font-medium text-gray-600">Distribute</span>
						</button>
						<button class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50">
							<div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
								<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
								</svg>
							</div>
							<span class="text-[10px] font-medium text-gray-600">Shipment</span>
						</button>
						<button class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50">
							<div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
								<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
								</svg>
							</div>
							<span class="text-[10px] font-medium text-gray-600">Tracking</span>
						</button>
						<button class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50">
							<div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
								<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
								</svg>
							</div>
							<span class="text-[10px] font-medium text-gray-600">On Deliver</span>
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Shipments Activities Table -->
		<div class="bg-white rounded-3xl shadow-sm overflow-hidden">
			<div class="p-6 border-b border-gray-100 flex items-center justify-between">
				<h2 class="text-xl font-bold text-gray-900">Shipment Activities</h2>
				<div class="flex items-center gap-3">
					<div class="relative">
						<svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
						</svg>
						<input 
							type="text" 
							placeholder="Search shipment name"
							class="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 w-64"
						/>
					</div>
					<button class="px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors text-sm font-medium flex items-center gap-2">
						Filters
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
						</svg>
					</button>
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50 border-b border-gray-100">
						<tr>
							<th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
							<th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
							<th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Shipped Date</th>
							<th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Departure</th>
							<th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Destination</th>
							<th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Weight</th>
							<th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#if isLoading}
							<tr>
								<td colspan="7" class="px-6 py-12 text-center">
									<div class="flex items-center justify-center gap-2">
										<div class="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
										<span class="text-gray-500">Loading shipments...</span>
									</div>
								</td>
							</tr>
						{:else if shipments.length === 0}
							<tr>
								<td colspan="7" class="px-6 py-12 text-center text-gray-500">
									No shipments found
								</td>
							</tr>
						{:else}
							{#each shipments as shipment}
								<tr class="hover:bg-gray-50 transition-colors">
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="text-sm font-semibold text-gray-900">#{shipment.trackingId || 'N/A'}</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="text-sm text-gray-600">{shipment.cargoType || 'General'}</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="text-sm text-gray-600">{formatDate(shipment.createdAt)}</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="text-sm text-gray-900">{shipment.origin || 'N/A'}</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="text-sm text-gray-900">{shipment.destination || 'N/A'}</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="text-sm text-gray-600">{shipment.weight ? `${shipment.weight} kg` : 'N/A'}</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium {getStatusBadge(shipment.status)}">
											{formatStatus(shipment.status)}
										</span>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>

			<!-- Pagination -->
			<div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
				<div class="text-sm text-gray-600">
					Showing <span class="font-medium">{shipments.length}</span> of <span class="font-medium">{stats.totalDelivered}</span> shipments
				</div>
				<div class="flex items-center gap-2">
					<button class="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
						</svg>
					</button>
					<button class="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium text-sm">1</button>
					<button class="px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-sm">2</button>
					<button class="px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-sm">3</button>
					<button class="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	</div>

<style>
	/* Custom scrollbar */
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
