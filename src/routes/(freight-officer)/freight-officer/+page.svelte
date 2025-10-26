<script lang="ts">
	import { onMount } from 'svelte';
	
	interface TaskSummary {
		pickupsCount: number;
		deliveriesCount: number;
		inTransitCount: number;
		urgentCount: number;
		needsRouteCount: number;
		totalTasks: number;
	}

	interface Package {
		_id: string;
		trackingId: string;
		senderName: string;
		receiverName: string;
		origin: string;
		destination: string;
		weight: number;
		status: string;
		cargoType: string;
	}

	interface DailyTasks {
		pickups: Package[];
		deliveries: Package[];
		inTransit: Package[];
		urgent: Package[];
		needsRoute: Package[];
	}
	
	let isLoading = $state(true);
	let dashboardData = $state<any>({
		stats: {
			activeShipments: 0,
			pendingPickups: 0,
			inTransit: 0,
			delivered: 0
		},
		recentShipments: [],
		todaysTasks: []
	});

	let dailyTasks = $state<DailyTasks>({
		pickups: [],
		deliveries: [],
		inTransit: [],
		urgent: [],
		needsRoute: []
	});
	let taskSummary = $state<TaskSummary>({
		pickupsCount: 0,
		deliveriesCount: 0,
		inTransitCount: 0,
		urgentCount: 0,
		needsRouteCount: 0,
		totalTasks: 0
	});
	let loadingTasks = $state(true);

	onMount(async () => {
		await loadDashboard();
		await loadDailyTasks();
	});

	async function loadDashboard() {
		isLoading = true;
		try {
			const response = await fetch('/api/freight-officer/dashboard', {
				credentials: 'include'
			});

			if (response.ok) {
				dashboardData = await response.json();
			}
		} catch (error) {
			console.error('Failed to load dashboard:', error);
		} finally {
			isLoading = false;
		}
	}

	async function loadDailyTasks() {
		loadingTasks = true;
		try {
			const response = await fetch('/api/freight-officer/daily-tasks', {
				credentials: 'include'
			});

			if (response.ok) {
				const data = await response.json();
				dailyTasks = data.tasks;
				taskSummary = data.summary;
			}
		} catch (error) {
			console.error('Failed to load daily tasks:', error);
		} finally {
			loadingTasks = false;
		}
	}

	function getStatusColor(status: string): string {
		const colors: Record<string, string> = {
			pending: 'bg-yellow-100 text-yellow-700',
			'in-transit': 'bg-blue-100 text-blue-700',
			delivered: 'bg-green-100 text-green-700',
			cancelled: 'bg-red-100 text-red-700',
			booked: 'bg-blue-100 text-blue-700',
			pending_pickup: 'bg-yellow-100 text-yellow-700',
			in_transit: 'bg-purple-100 text-purple-700',
			out_for_delivery: 'bg-indigo-100 text-indigo-700',
			delayed: 'bg-red-100 text-red-700'
		};
		return colors[status] || 'bg-gray-100 text-gray-700';
	}

	function formatStatus(status: string): string {
		return status.split('_').map(word => 
			word.charAt(0).toUpperCase() + word.slice(1)
		).join(' ');
	}
</script>

<svelte:head>
	<title>Freight Officer Dashboard - GoFright</title>
</svelte:head>

<div class="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
	<!-- Header -->
	<div class="mx-8 mt-8 flex-shrink-0">
		<div class="flex items-center justify-between mb-6">
			<div>
				<h1 class="text-3xl font-bold text-gray-900 mb-1">Freight Officer Dashboard</h1>
				<p class="text-gray-600">Manage shipments and track deliveries</p>
			</div>
			<button class="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium shadow-lg shadow-green-600/30 flex items-center gap-2">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
				</svg>
				New Shipment
			</button>
		</div>
	</div>

	<!-- Content -->
	<div class="flex-1 overflow-y-auto px-8 pb-8 space-y-6">
		{#if isLoading}
			<div class="flex items-center justify-center h-64">
				<div class="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
			</div>
		{:else}
		<!-- Stats Grid -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
			<!-- Active Shipments -->
			<div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
				<div class="flex items-start justify-between mb-4">
					<div class="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
						<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
						</svg>
					</div>
					<span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Active</span>
				</div>
				<h3 class="text-3xl font-bold text-gray-900 mb-1">{dashboardData.stats.activeShipments}</h3>
				<p class="text-sm text-gray-600">Active Shipments</p>
			</div>

			<!-- Pending Pickups -->
			<div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
				<div class="flex items-start justify-between mb-4">
					<div class="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
						<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
					</div>
					<span class="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Pending</span>
				</div>
				<h3 class="text-3xl font-bold text-gray-900 mb-1">{dashboardData.stats.pendingPickups}</h3>
				<p class="text-sm text-gray-600">Pending Pickups</p>
			</div>

			<!-- In Transit -->
			<div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
				<div class="flex items-start justify-between mb-4">
					<div class="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
						</svg>
					</div>
					<span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Moving</span>
				</div>
				<h3 class="text-3xl font-bold text-gray-900 mb-1">{dashboardData.stats.inTransit}</h3>
				<p class="text-sm text-gray-600">In Transit</p>
			</div>

			<!-- Delivered -->
			<div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
				<div class="flex items-start justify-between mb-4">
					<div class="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
						<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
					</div>
					<span class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">Complete</span>
				</div>
				<h3 class="text-3xl font-bold text-gray-900 mb-1">{dashboardData.stats.delivered}</h3>
				<p class="text-sm text-gray-600">Delivered Today</p>
			</div>
		</div>

		<!-- Recent Shipments & Tasks -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Recent Shipments -->
			<div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-xl font-bold text-gray-900">Recent Shipments</h2>
					<a href="/freight-officer/shipments" class="text-sm text-green-600 hover:text-green-700 font-medium">View All →</a>
				</div>
				<div class="space-y-4">
					{#if dashboardData.recentShipments.length === 0}
						<p class="text-center text-gray-500 py-8">No recent shipments</p>
					{:else}
						{#each dashboardData.recentShipments as shipment}
							<div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
								<div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
									<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
									</svg>
								</div>
								<div class="flex-1 min-w-0">
									<h4 class="font-semibold text-gray-900 truncate">{shipment.trackingNumber}</h4>
									<p class="text-sm text-gray-600 truncate">{shipment.destination}</p>
								</div>
								<span class="px-3 py-1 {getStatusColor(shipment.status)} rounded-full text-xs font-medium whitespace-nowrap">
									{shipment.status}
								</span>
							</div>
						{/each}
					{/if}
				</div>
			</div>

			<!-- Today's Tasks -->
			<div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-xl font-bold text-gray-900">Today's Tasks</h2>
					<span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
						{taskSummary.totalTasks} tasks
					</span>
				</div>
				<div class="space-y-3 max-h-[400px] overflow-y-auto">
					{#if loadingTasks}
						<div class="text-center py-8">
							<div class="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
						</div>
					{:else if taskSummary.totalTasks === 0}
						<p class="text-center text-gray-500 py-8">No tasks for today</p>
					{:else}
						<!-- Today's Pickups -->
						{#if dailyTasks.pickups.length > 0}
							<div class="mb-4">
								<h3 class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
									<svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
									</svg>
									Today's Pickups ({dailyTasks.pickups.length})
								</h3>
								{#each dailyTasks.pickups as pkg}
									<div class="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl mb-2 border border-yellow-100">
										<div class="flex-1 min-w-0">
											<h4 class="font-medium text-gray-900 text-sm truncate">{pkg.trackingId}</h4>
											<p class="text-xs text-gray-600 truncate">{pkg.senderName} → {pkg.destination}</p>
											<div class="flex items-center gap-2 mt-1">
												<span class="px-2 py-0.5 {getStatusColor(pkg.status)} rounded text-xs">
													{formatStatus(pkg.status)}
												</span>
												<span class="text-xs text-gray-500">{pkg.weight}kg</span>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}

						<!-- Today's Deliveries -->
						{#if dailyTasks.deliveries.length > 0}
							<div class="mb-4">
								<h3 class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
									<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
									</svg>
									Today's Deliveries ({dailyTasks.deliveries.length})
								</h3>
								{#each dailyTasks.deliveries as pkg}
									<div class="flex items-start gap-3 p-3 bg-green-50 rounded-xl mb-2 border border-green-100">
										<div class="flex-1 min-w-0">
											<h4 class="font-medium text-gray-900 text-sm truncate">{pkg.trackingId}</h4>
											<p class="text-xs text-gray-600 truncate">{pkg.receiverName} at {pkg.destination}</p>
											<div class="flex items-center gap-2 mt-1">
												<span class="px-2 py-0.5 {getStatusColor(pkg.status)} rounded text-xs">
													{formatStatus(pkg.status)}
												</span>
												<span class="text-xs text-gray-500">{pkg.weight}kg</span>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}

						<!-- Urgent Packages -->
						{#if dailyTasks.urgent.length > 0}
							<div class="mb-4">
								<h3 class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
									<svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
									</svg>
									Urgent Attention ({dailyTasks.urgent.length})
								</h3>
								{#each dailyTasks.urgent as pkg}
									<div class="flex items-start gap-3 p-3 bg-red-50 rounded-xl mb-2 border border-red-100">
										<div class="flex-1 min-w-0">
											<h4 class="font-medium text-gray-900 text-sm truncate">{pkg.trackingId}</h4>
											<p class="text-xs text-gray-600 truncate">{pkg.origin} → {pkg.destination}</p>
											<div class="flex items-center gap-2 mt-1">
												<span class="px-2 py-0.5 {getStatusColor(pkg.status)} rounded text-xs">
													{formatStatus(pkg.status)}
												</span>
												<span class="text-xs text-gray-500">{pkg.weight}kg</span>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}

						<!-- Needs Route Assignment -->
						{#if dailyTasks.needsRoute.length > 0}
							<div class="mb-4">
								<h3 class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
									<svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
									</svg>
									Needs Route Assignment ({dailyTasks.needsRoute.length})
								</h3>
								{#each dailyTasks.needsRoute as pkg}
									<div class="flex items-start gap-3 p-3 bg-orange-50 rounded-xl mb-2 border border-orange-100">
										<div class="flex-1 min-w-0">
											<h4 class="font-medium text-gray-900 text-sm truncate">{pkg.trackingId}</h4>
											<p class="text-xs text-gray-600 truncate">{pkg.origin} → {pkg.destination}</p>
											<div class="flex items-center gap-2 mt-1">
												<span class="px-2 py-0.5 {getStatusColor(pkg.status)} rounded text-xs">
													{formatStatus(pkg.status)}
												</span>
												<span class="text-xs text-gray-500">{pkg.weight}kg</span>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					{/if}
				</div>
			</div>
		</div>
		{/if}
	</div>
</div>

<style>
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
