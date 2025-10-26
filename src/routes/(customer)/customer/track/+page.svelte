<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import NotificationModal from '$lib/components/NotificationModal.svelte';
	import LeafletMap from '$lib/components/LeafletMap.svelte';

	// State
	let trackingNumber = $state('');
	let loading = $state(false);
	let shipment: any = $state(null);
	let notification = $state({ show: false, message: '', type: 'info' });

	// Timeline events
	let timelineEvents: any[] = $state([]);

	onMount(() => {
		// Get tracking number from URL
		const params = new URLSearchParams(window.location.search);
		const number = params.get('number');
		if (number) {
			trackingNumber = number;
			trackShipment();
		}
	});

	async function trackShipment() {
		if (!trackingNumber.trim()) {
			showNotification('Please enter a tracking number', 'warning');
			return;
		}

		loading = true;
		try {
			const response = await fetch(`/api/customer/tracking/${encodeURIComponent(trackingNumber)}`);
			
			if (!response.ok) {
				throw new Error('Shipment not found');
			}

			const data = await response.json();
			shipment = data.shipment;
			timelineEvents = data.timeline || generateTimeline(shipment);

			showNotification('Shipment found', 'success');
		} catch (error) {
			console.error('Track shipment error:', error);
			showNotification('Shipment not found. Please check the tracking number.', 'error');
			shipment = null;
		} finally {
			loading = false;
		}
	}

	function generateTimeline(shipment: any) {
		const events = [];
		const createdDate = new Date(shipment.createdAt);

		events.push({
			status: 'Booking Created',
			description: 'Your cargo booking has been confirmed',
			timestamp: createdDate,
			completed: true
		});

		if (shipment.status === 'at-warehouse' || shipment.status === 'in-transit' || shipment.status === 'delivered') {
			events.push({
				status: 'At Warehouse',
				description: 'Cargo received at warehouse',
				timestamp: new Date(createdDate.getTime() + 24 * 60 * 60 * 1000),
				completed: true
			});
		}

		if (shipment.status === 'in-transit' || shipment.status === 'delivered') {
			events.push({
				status: 'In Transit',
				description: 'Cargo is on the way to destination',
				timestamp: new Date(createdDate.getTime() + 48 * 60 * 60 * 1000),
				completed: true
			});
		}

		if (shipment.status === 'delivered') {
			events.push({
				status: 'Delivered',
				description: 'Cargo delivered successfully',
				timestamp: new Date(createdDate.getTime() + 72 * 60 * 60 * 1000),
				completed: true
			});
		} else {
			events.push({
				status: 'Out for Delivery',
				description: 'Cargo is out for delivery',
				timestamp: null,
				completed: false
			});

			events.push({
				status: 'Delivered',
				description: 'Cargo will be delivered',
				timestamp: null,
				completed: false
			});
		}

		return events;
	}

	// Convert shipment to package format for LeafletMap
	let mapPackages = $derived(shipment ? [{
		_id: shipment._id,
		trackingId: shipment.trackingId,
		origin: shipment.origin,
		destination: shipment.destination,
		status: shipment.status,
		coordinates: shipment.coordinates
	}] : []);

	function shareTracking() {
		const url = `${window.location.origin}/customer/track?number=${trackingNumber}`;
		if (navigator.share) {
			navigator.share({
				title: 'Track Shipment',
				text: `Track shipment ${trackingNumber}`,
				url: url
			});
		} else {
			navigator.clipboard.writeText(url);
			showNotification('Tracking link copied to clipboard', 'success');
		}
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
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	function formatDate(dateString: string | Date) {
		if (!dateString) return '';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<NotificationModal bind:show={notification.show} message={notification.message} type={notification.type} />

<div class="p-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900">Track Your Cargo</h1>
		<p class="text-gray-600">Enter your tracking number to see real-time location</p>
	</div>

	<!-- Tracking Input -->
	<div class="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg shadow-sm p-6 mb-6 text-white">
		<div class="flex gap-3">
			<input
				type="text"
				bind:value={trackingNumber}
				placeholder="Enter tracking number (e.g., TRK-2024-000123)"
				class="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-300 focus:outline-none"
				onkeydown={(e) => { if (e.key === 'Enter') trackShipment(); }}
			/>
			<button
				onclick={trackShipment}
				disabled={loading}
				class="px-6 py-3 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold disabled:opacity-50"
			>
				{loading ? 'Tracking...' : 'Track'}
			</button>
		</div>
	</div>

	{#if shipment}
		<!-- Shipment Info Card -->
		<div class="bg-white rounded-lg shadow-sm p-6 mb-6">
			<div class="flex items-center justify-between mb-4">
				<div>
					<h2 class="text-xl font-bold text-gray-900">{shipment.trackingNumber}</h2>
					<p class="text-sm text-gray-600">Last updated: {formatDate(shipment.updatedAt)}</p>
				</div>
				<div class="flex items-center gap-3">
					<span class="px-3 py-1 text-sm font-semibold rounded-full {getStatusColor(shipment.status)}">
						{shipment.status}
					</span>
					<button
						onclick={shareTracking}
						class="px-4 py-2 text-sm bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
					>
						Share
					</button>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
					<p class="text-sm text-gray-600">From</p>
					<p class="font-medium text-gray-900">{shipment.senderCity}</p>
				</div>
				<div>
					<p class="text-sm text-gray-600">To</p>
					<p class="font-medium text-gray-900">{shipment.receiverCity}</p>
				</div>
				<div>
					<p class="text-sm text-gray-600">Est. Delivery</p>
					<p class="font-medium text-gray-900">
						{shipment.status === 'delivered' ? 'Delivered' : '2-3 business days'}
					</p>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Map -->
			<div class="bg-white rounded-lg shadow-sm overflow-hidden">
				<div class="p-4 border-b border-gray-200">
					<h3 class="font-semibold text-gray-900">Current Location</h3>
				</div>
				<div class="w-full h-96">
					<LeafletMap packages={mapPackages} height="384px" zoom={13} />
				</div>
			</div>

			<!-- Timeline -->
			<div class="bg-white rounded-lg shadow-sm p-6">
				<h3 class="font-semibold text-gray-900 mb-4">Delivery Timeline</h3>
				
				<div class="space-y-4">
					{#each timelineEvents as event, index}
						<div class="flex gap-4">
							<div class="flex flex-col items-center">
								<div class="w-8 h-8 rounded-full flex items-center justify-center {event.completed ? 'bg-green-600' : 'bg-gray-300'}">
									{#if event.completed}
										<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
										</svg>
									{:else}
										<div class="w-3 h-3 bg-white rounded-full"></div>
									{/if}
								</div>
								{#if index < timelineEvents.length - 1}
									<div class="w-0.5 h-full {event.completed ? 'bg-green-600' : 'bg-gray-300'} my-1"></div>
								{/if}
							</div>
							
							<div class="flex-1 pb-4">
								<p class="font-medium text-gray-900">{event.status}</p>
								<p class="text-sm text-gray-600">{event.description}</p>
								{#if event.timestamp}
									<p class="text-xs text-gray-500 mt-1">{formatDate(event.timestamp)}</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Shipment Details -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
			<!-- Sender -->
			<div class="bg-white rounded-lg shadow-sm p-6">
				<h3 class="font-semibold text-gray-900 mb-3">Sender Information</h3>
				<div class="space-y-2 text-sm">
					<div>
						<span class="text-gray-600">Name:</span>
						<span class="ml-2 text-gray-900">{shipment.senderName}</span>
					</div>
					<div>
						<span class="text-gray-600">Phone:</span>
						<span class="ml-2 text-gray-900">{shipment.senderPhone}</span>
					</div>
					<div>
						<span class="text-gray-600">Address:</span>
						<span class="ml-2 text-gray-900">{shipment.senderAddress}</span>
					</div>
				</div>
			</div>

			<!-- Receiver -->
			<div class="bg-white rounded-lg shadow-sm p-6">
				<h3 class="font-semibold text-gray-900 mb-3">Receiver Information</h3>
				<div class="space-y-2 text-sm">
					<div>
						<span class="text-gray-600">Name:</span>
						<span class="ml-2 text-gray-900">{shipment.receiverName}</span>
					</div>
					<div>
						<span class="text-gray-600">Phone:</span>
						<span class="ml-2 text-gray-900">{shipment.receiverPhone}</span>
					</div>
					<div>
						<span class="text-gray-600">Address:</span>
						<span class="ml-2 text-gray-900">{shipment.receiverAddress}</span>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
