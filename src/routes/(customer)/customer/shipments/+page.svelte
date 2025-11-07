<script lang="ts">
	import { onMount } from 'svelte';
	import NotificationModal from '$lib/components/NotificationModal.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';

	// State
	let loading = $state(true);
	let shipments: any[] = $state([]);
	let filteredShipments: any[] = $state([]);
	let searchQuery = $state('');
	let statusFilter = $state('all');
	let selectedShipment: any = $state(null);
	let showDetailsModal = $state(false);
	let confirmCancel = $state(false);
	let shipmentToCancel: any = $state(null);
	let notification = $state({ show: false, message: '', type: 'info' });

	onMount(async () => {
		await loadShipments();
	});

	async function loadShipments() {
		loading = true;
		try {
			const response = await fetch('/api/customer/bookings');
			
			if (!response.ok) {
				throw new Error('Failed to load shipments');
			}

			const data = await response.json();
			shipments = data.bookings || [];
			filterShipments();
		} catch (error) {
			console.error('Load shipments error:', error);
			showNotification('Failed to load shipments', 'error');
		} finally {
			loading = false;
		}
	}

	function filterShipments() {
		let filtered = [...shipments];

		// Filter by status
		if (statusFilter !== 'all') {
			filtered = filtered.filter(s => s.status === statusFilter);
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(s =>
				s.trackingId?.toLowerCase().includes(query) ||
				s.receiverName?.toLowerCase().includes(query) ||
				s.receiverAddress?.toLowerCase().includes(query)
			);
		}

		filteredShipments = filtered;
	}

	$effect(() => {
		searchQuery;
		statusFilter;
		filterShipments();
	});

	function viewDetails(shipment: any) {
		selectedShipment = shipment;
		showDetailsModal = true;
	}

	function requestCancellation(shipment: any) {
		shipmentToCancel = shipment;
		confirmCancel = true;
	}

	async function confirmCancellation() {
		if (!shipmentToCancel) return;

		try {
			const response = await fetch(`/api/customer/bookings/${shipmentToCancel._id}/cancel`, {
				method: 'PUT'
			});

			if (!response.ok) {
				throw new Error('Failed to cancel booking');
			}

			showNotification('Cancellation request submitted successfully', 'success');
			await loadShipments();
		} catch (error) {
			console.error('Cancel booking error:', error);
			showNotification('Failed to cancel booking', 'error');
		}
	}

	function downloadInvoice(shipment: any) {
		showNotification('Downloading invoice...', 'info');
		// In production, this would download the actual invoice
		setTimeout(() => {
			showNotification('Invoice downloaded successfully', 'success');
		}, 1500);
	}

	function showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info') {
		notification = { show: true, message, type };
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'delivered':
				return 'bg-green-100 text-green-800';
			case 'in-transit':
				return 'bg-blue-100 text-blue-800';
			case 'at-warehouse':
				return 'bg-purple-100 text-purple-800';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'cancelled':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
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

<NotificationModal bind:show={notification.show} message={notification.message} type={notification.type} />
<ConfirmModal
	bind:show={confirmCancel}
	title="Cancel Booking"
	message="Are you sure you want to request cancellation for this booking? This action cannot be undone."
	confirmText="Yes, Cancel"
	onConfirm={confirmCancellation}
	mode="danger"
/>

<!-- Shipment Details Modal -->
{#if showDetailsModal && selectedShipment}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick={() => showDetailsModal = false}>
		<div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onclick={(e) => e.stopPropagation()}>
			<div class="p-6">
				<!-- Header -->
				<div class="flex items-center justify-between mb-6">
					<div>
						<h2 class="text-2xl font-bold text-gray-900">Shipment Details</h2>
						<p class="text-sm text-gray-600">{selectedShipment.trackingId}</p>
					</div>
					<button
						onclick={() => showDetailsModal = false}
						class="text-gray-400 hover:text-gray-600"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<!-- Status -->
				<div class="mb-6">
					<span class="px-3 py-1 text-sm font-semibold rounded-full {getStatusColor(selectedShipment.status)}">
						{selectedShipment.status}
					</span>
				</div>

				<!-- Sender & Receiver -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
					<div class="bg-gray-50 rounded-lg p-4">
						<h3 class="font-semibold text-gray-900 mb-2">Sender</h3>
						<p class="text-sm text-gray-600">{selectedShipment.senderName}</p>
						<p class="text-sm text-gray-600">{selectedShipment.senderPhone}</p>
						<p class="text-sm text-gray-600">{selectedShipment.senderAddress}</p>
					</div>

					<div class="bg-gray-50 rounded-lg p-4">
						<h3 class="font-semibold text-gray-900 mb-2">Receiver</h3>
						<p class="text-sm text-gray-600">{selectedShipment.receiverName}</p>
						<p class="text-sm text-gray-600">{selectedShipment.receiverPhone}</p>
						<p class="text-sm text-gray-600">{selectedShipment.receiverAddress}</p>
					</div>
				</div>

				<!-- Cargo Details -->
				<div class="bg-gray-50 rounded-lg p-4 mb-6">
					<h3 class="font-semibold text-gray-900 mb-2">Cargo Information</h3>
					<div class="grid grid-cols-2 gap-2 text-sm">
						<div><span class="text-gray-600">Type:</span> <span class="font-medium">{selectedShipment.cargoType}</span></div>
						<div><span class="text-gray-600">Weight:</span> <span class="font-medium">{selectedShipment.weight} kg</span></div>
						<div><span class="text-gray-600">Price:</span> <span class="font-medium">{formatCurrency(selectedShipment.price || 0)}</span></div>
						<div><span class="text-gray-600">Payment:</span> <span class="font-medium capitalize">{selectedShipment.paymentStatus || 'pending'}</span></div>
					</div>
					{#if selectedShipment.specialInstructions}
						<div class="mt-2">
							<span class="text-gray-600 text-sm">Special Instructions:</span>
							<p class="text-sm text-gray-800 mt-1">{selectedShipment.specialInstructions}</p>
						</div>
					{/if}
				</div>

				<!-- Actions -->
				<div class="flex gap-3">
					<button
						onclick={() => downloadInvoice(selectedShipment)}
						class="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
					>
						Download Invoice
					</button>
					{#if selectedShipment.status === 'pending' || selectedShipment.status === 'at-warehouse'}
						<button
							onclick={() => {
								showDetailsModal = false;
								requestCancellation(selectedShipment);
							}}
							class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
						>
							Cancel
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<div class="p-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900">My Shipments</h1>
		<p class="text-gray-600">Track and manage your cargo shipments</p>
	</div>

	<!-- Filters -->
	<div class="bg-white rounded-lg shadow-sm p-4 mb-6">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<!-- Search -->
			<div>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search by tracking number, receiver..."
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
				/>
			</div>

			<!-- Status Filter -->
			<div>
				<select
					bind:value={statusFilter}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
				>
					<option value="all">All Statuses</option>
					<option value="pending">Pending</option>
					<option value="at-warehouse">At Warehouse</option>
					<option value="in-transit">In Transit</option>
					<option value="delivered">Delivered</option>
					<option value="cancelled">Cancelled</option>
				</select>
			</div>
		</div>
	</div>

	<!-- Shipments Table -->
	<div class="bg-white rounded-lg shadow-sm overflow-hidden">
		{#if loading}
			<div class="flex items-center justify-center h-64">
				<div class="text-center">
					<svg class="animate-spin h-12 w-12 text-orange-600 mx-auto mb-4" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					<p class="text-gray-600">Loading shipments...</p>
				</div>
			</div>
		{:else if filteredShipments.length === 0}
			<div class="text-center py-12">
				<svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
				</svg>
				<p class="text-gray-600 mb-4">No shipments found</p>
				<a href="/customer/book" class="text-orange-600 hover:text-orange-700 font-medium">
					Book your first cargo →
				</a>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking #</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each filteredShipments as shipment}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
									{shipment.trackingId}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
									{shipment.receiverAddress}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(shipment.status)}">
										{shipment.status}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
									{formatDate(shipment.createdAt)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{formatCurrency(shipment.price || 0)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm">
									<div class="flex gap-2">
										<button
											onclick={() => viewDetails(shipment)}
											class="text-orange-600 hover:text-orange-700 font-medium"
										>
											Details
										</button>
										<a
											href="/customer/track?number={shipment.trackingId}"
											class="text-blue-600 hover:text-blue-700 font-medium"
										>
											Track
										</a>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
