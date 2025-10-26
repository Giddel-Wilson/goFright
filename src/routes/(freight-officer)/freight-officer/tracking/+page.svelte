<script lang="ts">
	import { onMount } from 'svelte';
	import LeafletMap from '$lib/components/LeafletMap.svelte';
	
	let isLoading = $state(true);
	let activeShipments = $state<any[]>([]);
	let selectedShipment = $state<any>(null);

	onMount(async () => {
		await loadActiveShipments();
	});

	async function loadActiveShipments() {
		isLoading = true;
		try {
			const response = await fetch('/api/freight-officer/tracking', {
				credentials: 'include'
			});

			if (response.ok) {
				activeShipments = await response.json();
			}
		} catch (error) {
			console.error('Failed to load shipments:', error);
		} finally {
			isLoading = false;
		}
	}

	function getStatusColor(status: string): string {
		const colors: Record<string, string> = {
			pending: 'bg-yellow-100 text-yellow-700',
			'at-warehouse': 'bg-purple-100 text-purple-700',
			'in-transit': 'bg-blue-100 text-blue-700',
			delivered: 'bg-green-100 text-green-700',
			cancelled: 'bg-red-100 text-red-700'
		};
		return colors[status] || 'bg-gray-100 text-gray-700';
	}

	function formatDate(date: string): string {
		return new Date(date).toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function focusShipment(shipment: any) {
		selectedShipment = shipment;
		if (shipment.currentLocation?.lat && shipment.currentLocation?.lng) {
			map?.panTo({
				lat: shipment.currentLocation.lat,
				lng: shipment.currentLocation.lng
			});
			map?.setZoom(14);
		}
	}
</script>

<svelte:head>
	<title>Live Tracking - GoFright Freight Officer</title>
</svelte:head>

<div class="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
	<!-- Header -->
	<div class="mx-8 mt-8 flex-shrink-0">
		<div class="flex items-center justify-between mb-6">
			<div>
				<h1 class="text-3xl font-bold text-gray-900 mb-1">Live Shipment Tracking</h1>
				<p class="text-gray-600">Monitor all active shipments in real-time</p>
			</div>
			<div class="flex gap-3">
				<button 
					onclick={loadActiveShipments}
					class="px-6 py-3 bg-white text-green-600 border-2 border-green-600 rounded-xl hover:bg-green-50 transition-colors text-sm font-medium flex items-center gap-2"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
					</svg>
					Refresh
				</button>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="flex-1 overflow-hidden px-8 pb-8">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
			<!-- Shipment List -->
			<div class="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
				<div class="p-6 border-b border-gray-200">
					<h2 class="text-xl font-bold text-gray-900">Active Shipments</h2>
					<p class="text-sm text-gray-600 mt-1">{activeShipments.length} shipments in transit</p>
				</div>
				
				<div class="flex-1 overflow-y-auto p-4 space-y-3">
					{#if isLoading}
						<div class="flex items-center justify-center h-32">
							<div class="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
						</div>
					{:else if activeShipments.length === 0}
						<div class="text-center py-12">
							<svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
							</svg>
							<p class="text-gray-600">No active shipments</p>
						</div>
					{:else}
						{#each activeShipments as shipment}
							<button
								onclick={() => focusShipment(shipment)}
								class="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors {selectedShipment?.trackingNumber === shipment.trackingNumber ? 'ring-2 ring-green-500' : ''}"
							>
								<div class="flex items-start justify-between mb-2">
									<span class="font-mono font-semibold text-green-600 text-sm">{shipment.trackingNumber}</span>
									<span class="px-2 py-1 {getStatusColor(shipment.status)} rounded-full text-xs font-medium">
										{shipment.status}
									</span>
								</div>
								<h4 class="font-medium text-gray-900 mb-1">{shipment.receiverName}</h4>
								<p class="text-sm text-gray-600 mb-2">{shipment.destination}</p>
								<p class="text-xs text-gray-500">{formatDate(shipment.updatedAt)}</p>
							</button>
						{/each}
					{/if}
				</div>
			</div>

			<!-- Map View -->
			<div class="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
				<!-- Map -->
				<div class="flex-1 rounded-3xl min-h-[400px]">
					<LeafletMap packages={activeShipments} height="100%" zoom={10} />
				</div>

				<!-- Selected Shipment Details -->
				{#if selectedShipment}
					<div class="p-6 border-t border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
						<div class="flex items-start justify-between">
							<div class="flex-1">
								<div class="flex items-center gap-3 mb-3">
									<h3 class="text-xl font-bold text-gray-900">{selectedShipment.trackingNumber}</h3>
									<span class="px-3 py-1 {getStatusColor(selectedShipment.status)} rounded-full text-sm font-medium">
										{selectedShipment.status}
									</span>
								</div>
								<div class="grid grid-cols-2 gap-4">
									<div>
										<p class="text-sm text-gray-600 mb-1">Customer</p>
										<p class="font-medium text-gray-900">{selectedShipment.receiverName}</p>
										<p class="text-sm text-gray-600">{selectedShipment.receiverPhone}</p>
									</div>
									<div>
										<p class="text-sm text-gray-600 mb-1">Destination</p>
										<p class="font-medium text-gray-900">{selectedShipment.destination}</p>
									</div>
									<div>
										<p class="text-sm text-gray-600 mb-1">Cargo Type</p>
										<p class="font-medium text-gray-900">{selectedShipment.cargoType || 'General'}</p>
									</div>
									<div>
										<p class="text-sm text-gray-600 mb-1">Weight</p>
										<p class="font-medium text-gray-900">{selectedShipment.weight} kg</p>
									</div>
								</div>
							</div>
							<button
								onclick={() => selectedShipment = null}
								class="text-gray-400 hover:text-gray-600"
							>
								<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
								</svg>
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
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
