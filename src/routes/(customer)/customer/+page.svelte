<script lang="ts">
	import { onMount } from 'svelte';
	import NotificationModal from '$lib/components/NotificationModal.svelte';

	// State
	let loading = $state(true);
	let notification = $state<{ show: boolean; message: string; type: 'info' | 'success' | 'warning' | 'error' }>({ show: false, message: '', type: 'info' });
	let trackingNumber = $state('');

	// Dashboard data
	let stats = $state({
		totalShipments: 0,
		active: 0,
		delivered: 0,
		pendingPayment: 0
	});

	let recentShipments: any[] = $state([]);
	let recentInvoices: any[] = $state([]);

	onMount(async () => {
		await loadDashboard();
	});

	async function loadDashboard() {
		loading = true;
		try {
			const response = await fetch('/api/customer/dashboard', {
				credentials: 'include'
			});
			
			if (!response.ok) {
				throw new Error('Failed to load dashboard');
			}

			const data = await response.json();
			stats = data.stats;
			recentShipments = data.recentShipments || [];
			recentInvoices = data.recentInvoices || [];
		} catch (error) {
			console.error('Dashboard load error:', error);
			showNotification('Failed to load dashboard data', 'error');
		} finally {
			loading = false;
		}
	}

	function quickTrack() {
		if (!trackingNumber.trim()) {
			showNotification('Please enter a tracking number', 'warning');
			return;
		}
		window.location.href = `/customer/track?number=${trackingNumber}`;
	}

	function showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info') {
		notification = { show: true, message, type };
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'delivered':
				return 'bg-green-100 text-green-700';
			case 'in-transit':
			case 'in_transit':
				return 'bg-blue-100 text-blue-700';
			case 'at-warehouse':
				return 'bg-purple-100 text-purple-700';
			case 'pending':
				return 'bg-yellow-100 text-yellow-700';
			default:
				return 'bg-gray-100 text-gray-700';
		}
	}

	function formatStatus(status: string): string {
		return status.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-NG', {
			style: 'currency',
			currency: 'NGN'
		}).format(amount);
	}
</script>

<svelte:head>
	<title>Customer Dashboard - GoFright</title>
</svelte:head>

<NotificationModal bind:show={notification.show} message={notification.message} type={notification.type} />

<div class="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
	<!-- Header -->
	<div class="mx-8 mt-8 flex-shrink-0">
		<div class="flex items-center justify-between mb-6">
			<div>
				<h1 class="text-3xl font-bold text-gray-900 mb-1">Customer Dashboard</h1>
				<p class="text-gray-600">Welcome back! Here's an overview of your shipments</p>
			</div>
			<a href="/customer/book" class="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors text-sm font-medium shadow-lg shadow-orange-600/30 flex items-center gap-2">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
				</svg>
				Book Cargo
			</a>
		</div>
	</div>

	<!-- Content -->
	<div class="flex-1 overflow-y-auto px-8 pb-8 space-y-6">
		{#if loading}
			<div class="flex items-center justify-center h-64">
				<div class="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
			</div>
		{:else}
		<!-- Stats Grid -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
			<!-- Total Shipments -->
			<div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
				<div class="flex items-start justify-between mb-4">
					<div class="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
						<svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
						</svg>
					</div>
					<span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">Total</span>
				</div>
				<h3 class="text-3xl font-bold text-gray-900 mb-1">{stats.totalShipments}</h3>
				<p class="text-sm text-gray-600">Total Shipments</p>
			</div>

			<!-- Active Shipments -->
			<div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
				<div class="flex items-start justify-between mb-4">
					<div class="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
					</div>
					<span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Active</span>
				</div>
				<h3 class="text-3xl font-bold text-gray-900 mb-1">{stats.active}</h3>
				<p class="text-sm text-gray-600">Active Shipments</p>
			</div>

			<!-- Delivered -->
			<div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
				<div class="flex items-start justify-between mb-4">
					<div class="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
						<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Success</span>
				</div>
				<h3 class="text-3xl font-bold text-gray-900 mb-1">{stats.delivered}</h3>
				<p class="text-sm text-gray-600">Delivered</p>
			</div>

			<!-- Pending Payment -->
			<div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
				<div class="flex items-start justify-between mb-4">
					<div class="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
						<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<span class="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Pending</span>
				</div>
				<h3 class="text-3xl font-bold text-gray-900 mb-1">{stats.pendingPayment}</h3>
				<p class="text-sm text-gray-600">Pending Payment</p>
			</div>
		</div>

		<!-- Quick Track Card -->
		<div class="bg-gradient-to-r from-orange-600 to-orange-700 rounded-3xl shadow-lg p-8 text-white">
			<h2 class="text-2xl font-bold mb-2">Quick Track Your Cargo</h2>
			<p class="text-orange-100 mb-4">Enter your tracking number to see real-time shipment status</p>
			<div class="flex gap-3">
				<input
					type="text"
					bind:value={trackingNumber}
					placeholder="Enter tracking number (e.g., TRK-2024-000123)"
					class="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
					onkeydown={(e) => { if (e.key === 'Enter') quickTrack(); }}
				/>
				<button
					onclick={quickTrack}
					class="px-8 py-3 bg-white text-orange-600 rounded-xl hover:bg-orange-50 transition-colors font-semibold flex items-center gap-2 shadow-lg"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
					Track Now
				</button>
			</div>
		</div>

		<!-- Content Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Recent Shipments -->
			<div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
				<div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
					<h2 class="text-lg font-semibold text-gray-900">Recent Shipments</h2>
					<a href="/customer/shipments" class="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
						View All
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
						</svg>
					</a>
				</div>

				<div class="divide-y divide-gray-100">
					{#if recentShipments.length > 0}
						{#each recentShipments as shipment}
							<a href="/customer/shipments" class="block px-6 py-4 hover:bg-gray-50 transition-colors">
								<div class="flex items-center justify-between mb-2">
									<span class="font-semibold text-gray-900">{shipment.trackingNumber}</span>
									<span class="px-3 py-1 text-xs font-semibold rounded-full {getStatusColor(shipment.status)}">
										{formatStatus(shipment.status)}
									</span>
								</div>
								<div class="flex items-center justify-between text-sm">
									<span class="text-gray-600">{shipment.receiverAddress || shipment.destination || 'N/A'}</span>
									<span class="text-gray-500">{formatDate(shipment.createdAt)}</span>
								</div>
							</a>
						{/each}
					{:else}
						<div class="px-6 py-16 text-center">
							<div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
								<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
								</svg>
							</div>
							<p class="text-gray-600 font-medium mb-2">No shipments yet</p>
							<p class="text-sm text-gray-500 mb-4">Start tracking your cargo by booking your first shipment</p>
							<a href="/customer/book" class="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium">
								Book your first cargo
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
								</svg>
							</a>
						</div>
					{/if}
				</div>
			</div>

			<!-- Recent Invoices -->
			<div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
				<div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
					<h2 class="text-lg font-semibold text-gray-900">Recent Invoices</h2>
					<a href="/customer/invoices" class="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
						View All
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
						</svg>
					</a>
				</div>

				<div class="divide-y divide-gray-100">
					{#if recentInvoices.length > 0}
						{#each recentInvoices as invoice}
							<a href="/customer/invoices" class="block px-6 py-4 hover:bg-gray-50 transition-colors">
								<div class="flex items-center justify-between mb-2">
									<span class="font-semibold text-gray-900">{invoice.invoiceNumber}</span>
									<span class="font-bold text-gray-900">{formatCurrency(invoice.amount)}</span>
								</div>
								<div class="flex items-center justify-between text-sm">
									<span class="text-gray-600">{invoice.description}</span>
									<span class="px-3 py-1 text-xs font-semibold rounded-full {invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
										{invoice.status.toUpperCase()}
									</span>
								</div>
							</a>
						{/each}
					{:else}
						<div class="px-6 py-16 text-center">
							<div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
								<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							</div>
							<p class="text-gray-600 font-medium mb-2">No invoices yet</p>
							<p class="text-sm text-gray-500">Your invoices will appear here once you book shipments</p>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<a
				href="/customer/book"
				class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-orange-500 transition-all group"
			>
				<div class="flex items-center gap-4">
					<div class="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600 transition-colors">
						<svg class="w-7 h-7 text-orange-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
						</svg>
					</div>
					<div>
						<h3 class="font-bold text-gray-900 mb-1">Book New Cargo</h3>
						<p class="text-sm text-gray-600">Schedule a new shipment</p>
					</div>
				</div>
			</a>

			<a
				href="/customer/track"
				class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-500 transition-all group"
			>
				<div class="flex items-center gap-4">
					<div class="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
						<svg class="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
						</svg>
					</div>
					<div>
						<h3 class="font-bold text-gray-900 mb-1">Track Shipment</h3>
						<p class="text-sm text-gray-600">Check cargo location</p>
					</div>
				</div>
			</a>

			<a
				href="/customer/invoices"
				class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-green-500 transition-all group"
			>
				<div class="flex items-center gap-4">
					<div class="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-600 transition-colors">
						<svg class="w-7 h-7 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
					</div>
					<div>
						<h3 class="font-bold text-gray-900 mb-1">View Invoices</h3>
						<p class="text-sm text-gray-600">Payment and billing</p>
					</div>
				</div>
			</a>
		</div>

		<!-- Quick Track -->
		<div class="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg shadow-sm p-6 mb-6 text-white">
			<h2 class="text-xl font-semibold mb-4">Quick Track Your Cargo</h2>
			<div class="flex gap-3">
				<input
					type="text"
					bind:value={trackingNumber}
					placeholder="Enter tracking number (e.g., TRK-2024-000123)"
					class="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-300 focus:outline-none"
					onkeydown={(e) => { if (e.key === 'Enter') quickTrack(); }}
				/>
				<button
					onclick={quickTrack}
					class="px-6 py-3 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold"
				>
					Track Now
				</button>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Recent Shipments -->
			<div class="bg-white rounded-lg shadow-sm overflow-hidden">
				<div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
					<h2 class="text-lg font-semibold text-gray-900">Recent Shipments</h2>
					<a href="/customer/shipments" class="text-sm text-orange-600 hover:text-orange-700 font-medium">
						View All →
					</a>
				</div>

				<div class="divide-y divide-gray-200">
					{#if recentShipments.length > 0}
						{#each recentShipments as shipment}
							<div class="px-6 py-4 hover:bg-gray-50">
								<div class="flex items-center justify-between mb-2">
									<span class="font-medium text-gray-900">{shipment.trackingNumber}</span>
									<span class="px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(shipment.status)}">
										{shipment.status}
									</span>
								</div>
								<div class="flex items-center justify-between text-sm text-gray-600">
									<span>{shipment.receiverAddress}</span>
									<span>{formatDate(shipment.createdAt)}</span>
								</div>
							</div>
						{/each}
					{:else}
						<div class="px-6 py-12 text-center text-gray-500">
							<svg class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
							</svg>
							<p>No shipments yet</p>
							<a href="/customer/book" class="text-orange-600 hover:text-orange-700 font-medium mt-2 inline-block">
								Book your first cargo →
							</a>
						</div>
					{/if}
				</div>
			</div>

			<!-- Recent Invoices -->
			<div class="bg-white rounded-lg shadow-sm overflow-hidden">
				<div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
					<h2 class="text-lg font-semibold text-gray-900">Recent Invoices</h2>
					<a href="/customer/invoices" class="text-sm text-orange-600 hover:text-orange-700 font-medium">
						View All →
					</a>
				</div>

				<div class="divide-y divide-gray-200">
					{#if recentInvoices.length > 0}
						{#each recentInvoices as invoice}
							<div class="px-6 py-4 hover:bg-gray-50">
								<div class="flex items-center justify-between mb-2">
									<span class="font-medium text-gray-900">{invoice.invoiceNumber}</span>
									<span class="font-semibold text-gray-900">{formatCurrency(invoice.amount)}</span>
								</div>
								<div class="flex items-center justify-between text-sm text-gray-600">
									<span>{invoice.description}</span>
									<span class="px-2 py-1 text-xs font-semibold rounded-full {invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
										{invoice.status}
									</span>
								</div>
							</div>
						{/each}
					{:else}
						<div class="px-6 py-12 text-center text-gray-500">
							<svg class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							<p>No invoices yet</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
		{/if}
	</div>
</div>
