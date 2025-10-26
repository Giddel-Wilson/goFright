<script lang="ts">
	import { onMount } from 'svelte';
	import NotificationModal from '$lib/components/NotificationModal.svelte';
	
	let isLoading = $state(true);
	let shipments = $state<any[]>([]);
	let filteredShipments = $state<any[]>([]);
	let searchQuery = $state('');
	let statusFilter = $state('all');
	
	let showCreateModal = $state(false);
	let showUpdateModal = $state(false);
	let selectedShipment = $state<any>(null);
	
	let notification = $state({
		show: false,
		type: 'info' as 'success' | 'error' | 'warning' | 'info',
		title: '',
		message: ''
	});

	let newShipment = $state({
		senderName: '',
		senderPhone: '',
		senderAddress: '',
		receiverName: '',
		receiverPhone: '',
		receiverAddress: '',
		cargoType: '',
		weight: '',
		dimensions: '',
		specialInstructions: ''
	});

	onMount(async () => {
		await loadShipments();
	});

	async function loadShipments() {
		isLoading = true;
		try {
			const response = await fetch('/api/freight-officer/shipments', {
				credentials: 'include'
			});

			if (response.ok) {
				shipments = await response.json();
				filterShipments();
			}
		} catch (error) {
			console.error('Failed to load shipments:', error);
		} finally {
			isLoading = false;
		}
	}

	function filterShipments() {
		let filtered = [...shipments];
		
		// Filter by status
		if (statusFilter !== 'all') {
			filtered = filtered.filter(s => s.status === statusFilter);
		}
		
		// Filter by search query
		if (searchQuery) {
			filtered = filtered.filter(s => 
				s.trackingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
				s.receiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				s.destination.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}
		
		filteredShipments = filtered;
	}

	$effect(() => {
		filterShipments();
	});

	async function createShipment() {
		try {
			const response = await fetch('/api/freight-officer/shipments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(newShipment)
			});

			if (response.ok) {
				showNotification('success', 'Shipment created successfully!');
				showCreateModal = false;
				await loadShipments();
				resetForm();
			} else {
				const error = await response.json();
				showNotification('error', error.error || 'Failed to create shipment');
			}
		} catch (error) {
			showNotification('error', 'Failed to create shipment. Please try again.');
		}
	}

	async function updateShipmentStatus(shipmentId: string, newStatus: string) {
		try {
			const response = await fetch(`/api/freight-officer/shipments/${shipmentId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ status: newStatus })
			});

			if (response.ok) {
				showNotification('success', 'Shipment status updated!');
				await loadShipments();
			} else {
				const error = await response.json();
				showNotification('error', error.error || 'Failed to update shipment');
			}
		} catch (error) {
			showNotification('error', 'Failed to update shipment. Please try again.');
		}
	}

	function showNotification(type: 'success' | 'error' | 'warning' | 'info', message: string, title = '') {
		notification = { show: true, type, message, title };
	}

	function resetForm() {
		newShipment = {
			senderName: '',
			senderPhone: '',
			senderAddress: '',
			receiverName: '',
			receiverPhone: '',
			receiverAddress: '',
			cargoType: '',
			weight: '',
			dimensions: '',
			specialInstructions: ''
		};
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
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Shipments - GoFright Freight Officer</title>
</svelte:head>

<div class="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
	<!-- Header -->
	<div class="mx-8 mt-8 flex-shrink-0">
		<div class="flex items-center justify-between mb-6">
			<div>
				<h1 class="text-3xl font-bold text-gray-900 mb-1">Shipment Management</h1>
				<p class="text-gray-600">Create and manage cargo shipments</p>
			</div>
			<button
				onclick={() => showCreateModal = true}
				class="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
				</svg>
				Create Shipment
			</button>
		</div>

		<!-- Filters -->
		<div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
			<div class="flex flex-col md:flex-row gap-4">
				<!-- Search -->
				<div class="flex-1">
					<div class="relative">
						<svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
						</svg>
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Search by tracking number, customer, or destination..."
							class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
						/>
					</div>
				</div>
				
				<!-- Status Filter -->
				<select
					bind:value={statusFilter}
					class="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
				>
					<option value="all">All Status</option>
					<option value="pending_pickup">Pending</option>
					<option value="at-warehouse">At Warehouse</option>
					<option value="in-transit">In Transit</option>
					<option value="delivered">Delivered</option>
					<option value="cancelled">Cancelled</option>
				</select>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="flex-1 overflow-y-auto px-8 pb-8">
		{#if isLoading}
			<div class="flex items-center justify-center h-64">
				<div class="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
			</div>
		{:else if filteredShipments.length === 0}
			<div class="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
				<svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
				</svg>
				<h3 class="text-xl font-semibold text-gray-900 mb-2">No shipments found</h3>
				<p class="text-gray-600 mb-4">Create your first shipment to get started</p>
			</div>
		{:else}
			<div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
				<table class="w-full">
					<thead class="bg-gray-50 border-b border-gray-200">
						<tr>
							<th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tracking Number</th>
							<th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
							<th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Destination</th>
							<th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
							<th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
							<th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						{#each filteredShipments as shipment}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-6 py-4">
									<span class="font-mono font-semibold text-green-600">{shipment.trackingId}</span>
								</td>
								<td class="px-6 py-4">
									<div>
										<p class="font-medium text-gray-900">{shipment.receiverName}</p>
										<p class="text-sm text-gray-500">{shipment.receiverPhone}</p>
									</div>
								</td>
								<td class="px-6 py-4 text-gray-900">{shipment.destination}</td>
								<td class="px-6 py-4">
									<span class="px-3 py-1 {getStatusColor(shipment.status)} rounded-full text-xs font-medium">
										{shipment.status}
									</span>
								</td>
								<td class="px-6 py-4 text-gray-600 text-sm">{formatDate(shipment.createdAt)}</td>
								<td class="px-6 py-4">
									<button class="text-green-600 hover:text-green-700 font-medium text-sm">
										View Details →
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<!-- Create Shipment Modal -->
{#if showCreateModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick={() => showCreateModal = false}>
		<div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onclick={(e) => e.stopPropagation()}>
			<div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
				<h3 class="text-xl font-bold text-gray-900">Create New Shipment</h3>
				<button onclick={() => showCreateModal = false} class="text-gray-400 hover:text-gray-600">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
					</svg>
				</button>
			</div>
			
			<form onsubmit={(e) => { e.preventDefault(); createShipment(); }} class="p-6 space-y-6">
				<!-- Sender Information -->
				<div class="space-y-4">
					<h4 class="font-semibold text-gray-900">Sender Information</h4>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Sender Name *</label>
							<input type="text" bind:value={newShipment.senderName} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required />
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Sender Phone *</label>
							<input type="tel" bind:value={newShipment.senderPhone} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required />
						</div>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Sender Address *</label>
						<textarea bind:value={newShipment.senderAddress} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" rows="2" required></textarea>
					</div>
				</div>

				<!-- Receiver Information -->
				<div class="space-y-4">
					<h4 class="font-semibold text-gray-900">Receiver Information</h4>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Receiver Name *</label>
							<input type="text" bind:value={newShipment.receiverName} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required />
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Receiver Phone *</label>
							<input type="tel" bind:value={newShipment.receiverPhone} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required />
						</div>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Receiver Address *</label>
						<textarea bind:value={newShipment.receiverAddress} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" rows="2" required></textarea>
					</div>
				</div>

				<!-- Cargo Details -->
				<div class="space-y-4">
					<h4 class="font-semibold text-gray-900">Cargo Details</h4>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Cargo Type *</label>
							<select bind:value={newShipment.cargoType} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required>
								<option value="general">General Cargo</option>
								<option value="fragile">Fragile</option>
								<option value="perishable">Perishable</option>
								<option value="hazardous">Hazardous</option>
								<option value="electronics">Electronics</option>
								<option value="documents">Documents</option>
							</select>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
							<input type="number" bind:value={newShipment.weight} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" step="0.1" min="0.1" required />
						</div>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
						<textarea bind:value={newShipment.specialInstructions} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" rows="2" placeholder="Any special handling requirements..."></textarea>
					</div>
				</div>

				<div class="flex gap-3 pt-4">
					<button type="button" onclick={() => showCreateModal = false} class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
					<button type="submit" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700" disabled={loading}>
						{loading ? 'Creating...' : 'Create Shipment'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<NotificationModal 
	bind:show={notification.show}
	type={notification.type}
	title={notification.title}
	message={notification.message}
/>

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
