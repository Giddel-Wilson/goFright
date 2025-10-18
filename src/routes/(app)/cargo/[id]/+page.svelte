<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import Card from '$lib/components/ui/card/card.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Alert from '$lib/components/ui/alert/alert.svelte';

	let user = $state(null);
	let cargo = $state(null);
	let trackingHistory = $state([]);
	let isLoading = $state(true);
	let error = $state('');

	authStore.subscribe(state => {
		user = state.user;
	});

	const cargoId = $derived($page.params.id);

	onMount(async () => {
		await loadCargoDetails();
	});

	async function loadCargoDetails() {
		isLoading = true;
		error = '';
		
		try {
			const response = await fetch(`/api/cargo/${cargoId}`);
			const data = await response.json();

			if (response.ok) {
				cargo = data.cargo;
				trackingHistory = data.tracking || [];
			} else {
				error = data.error || 'Failed to load cargo details';
			}
		} catch (err) {
			error = 'An error occurred while loading cargo details';
			console.error('Load error:', err);
		} finally {
			isLoading = false;
		}
	}

	function getStatusColor(status: string) {
		const colors: Record<string, string> = {
			'booked': 'bg-blue-100 text-blue-800',
			'pending_pickup': 'bg-yellow-100 text-yellow-800',
			'in_transit': 'bg-purple-100 text-purple-800',
			'out_for_delivery': 'bg-indigo-100 text-indigo-800',
			'delivered': 'bg-green-100 text-green-800',
			'delayed': 'bg-orange-100 text-orange-800',
			'cancelled': 'bg-red-100 text-red-800',
			'returned': 'bg-gray-100 text-gray-800'
		};
		return colors[status] || 'bg-gray-100 text-gray-800';
	}

	function formatDateTime(date: string) {
		return new Date(date).toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}

	function getStatusIcon(status: string) {
		const icons: Record<string, string> = {
			'booked': '📋',
			'pending_pickup': '📦',
			'in_transit': '🚚',
			'out_for_delivery': '🚛',
			'delivered': '✅',
			'delayed': '⚠️',
			'cancelled': '❌',
			'returned': '↩️'
		};
		return icons[status] || '📦';
	}
</script>

<svelte:head>
	<title>{cargo?.trackingId || 'Cargo Details'} - GoFright</title>
</svelte:head>

{#if isLoading}
	<div class="flex items-center justify-center min-h-[400px]">
		<div class="text-center">
			<div class="animate-spin text-6xl mb-4">⏳</div>
			<p class="text-gray-600">Loading cargo details...</p>
		</div>
	</div>
{:else if error}
	<div class="max-w-2xl mx-auto mt-8">
		<Alert variant="destructive">
			<p>{error}</p>
		</Alert>
		<div class="text-center mt-4">
			<Button on:click={() => goto('/cargo')}>
				← Back to Cargo List
			</Button>
		</div>
	</div>
{:else if cargo}
	<div class="space-y-6">
		<!-- Header -->
		<div>
			<Button variant="ghost" on:click={() => goto('/cargo')} class="mb-4">
				← Back to Cargo List
			</Button>
			<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h1 class="text-3xl font-bold text-gray-900 font-mono">
						{cargo.trackingId}
					</h1>
					<p class="text-gray-600 mt-1">
						{cargo.origin} → {cargo.destination}
					</p>
				</div>
				<Badge class={`${getStatusColor(cargo.status)} text-lg px-4 py-2`}>
					{getStatusIcon(cargo.status)} {cargo.status.replace('_', ' ')}
				</Badge>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Main Details -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Shipment Info -->
				<Card class="p-6">
					<h2 class="text-xl font-bold text-gray-900 mb-4">Shipment Information</h2>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<p class="text-sm text-gray-500">Cargo Type</p>
							<p class="font-medium">{cargo.cargoType.replace('_', ' ')}</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">Weight</p>
							<p class="font-medium">⚖️ {cargo.weight} kg</p>
						</div>
						{#if cargo.dimensions}
							<div class="col-span-2">
								<p class="text-sm text-gray-500">Dimensions (L × W × H)</p>
								<p class="font-medium">
									{cargo.dimensions.length || '—'} × {cargo.dimensions.width || '—'} × {cargo.dimensions.height || '—'} cm
								</p>
							</div>
						{/if}
						{#if cargo.description}
							<div class="col-span-2">
								<p class="text-sm text-gray-500">Description</p>
								<p class="font-medium">{cargo.description}</p>
							</div>
						{/if}
						{#if cargo.estimatedValue}
							<div>
								<p class="text-sm text-gray-500">Estimated Value</p>
								<p class="font-medium">{formatCurrency(cargo.estimatedValue)}</p>
							</div>
						{/if}
						{#if cargo.estimatedDelivery}
							<div>
								<p class="text-sm text-gray-500">Estimated Delivery</p>
								<p class="font-medium">{formatDateTime(cargo.estimatedDelivery)}</p>
							</div>
						{/if}
					</div>
				</Card>

				<!-- Sender & Receiver -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card class="p-6">
						<h3 class="font-bold text-gray-900 mb-3">📤 Sender</h3>
						<div class="space-y-2 text-sm">
							<p class="font-medium">{cargo.sender.name}</p>
							<p class="text-gray-600">📞 {cargo.sender.phone}</p>
							{#if cargo.sender.email}
								<p class="text-gray-600">✉️ {cargo.sender.email}</p>
							{/if}
							<p class="text-gray-600">📍 {cargo.sender.address}</p>
						</div>
					</Card>

					<Card class="p-6">
						<h3 class="font-bold text-gray-900 mb-3">📥 Receiver</h3>
						<div class="space-y-2 text-sm">
							<p class="font-medium">{cargo.receiver.name}</p>
							<p class="text-gray-600">📞 {cargo.receiver.phone}</p>
							{#if cargo.receiver.email}
								<p class="text-gray-600">✉️ {cargo.receiver.email}</p>
							{/if}
							<p class="text-gray-600">📍 {cargo.receiver.address}</p>
						</div>
					</Card>
				</div>

				<!-- Tracking History -->
				<Card class="p-6">
					<h2 class="text-xl font-bold text-gray-900 mb-6">Tracking History</h2>
					
					{#if trackingHistory.length === 0}
						<p class="text-gray-500 text-center py-4">No tracking updates yet</p>
					{:else}
						<div class="space-y-4">
							{#each trackingHistory as track, index}
								<div class="flex gap-4">
									<!-- Timeline -->
									<div class="flex flex-col items-center">
										<div class="w-10 h-10 rounded-full bg-[#3A506B] text-white flex items-center justify-center text-lg">
											{getStatusIcon(track.status)}
										</div>
										{#if index < trackingHistory.length - 1}
											<div class="w-0.5 h-full bg-gray-300 my-2"></div>
										{/if}
									</div>

									<!-- Content -->
									<div class="flex-1 pb-6">
										<div class="flex justify-between items-start mb-1">
											<p class="font-semibold text-gray-900">
												{track.status.replace('_', ' ').toUpperCase()}
											</p>
											<p class="text-sm text-gray-500">
												{formatDateTime(track.timestamp)}
											</p>
										</div>
										<p class="text-sm text-gray-600 mb-1">
												📍 {track.location}
										</p>
										{#if track.notes}
											<p class="text-sm text-gray-500 italic">{track.notes}</p>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</Card>
			</div>

			<!-- Sidebar -->
			<div class="space-y-6">
				<!-- Payment Info -->
				<Card class="p-6">
					<h3 class="font-bold text-gray-900 mb-4">💰 Payment Summary</h3>
					<div class="space-y-3">
						<div class="flex justify-between text-sm">
							<span class="text-gray-600">Base Cost</span>
							<span class="font-medium">{formatCurrency(cargo.baseCost)}</span>
						</div>
						<div class="flex justify-between text-sm">
							<span class="text-gray-600">Weight Charge</span>
							<span class="font-medium">{formatCurrency(cargo.weightCost)}</span>
						</div>
						<div class="flex justify-between text-sm">
							<span class="text-gray-600">Distance Fee</span>
							<span class="font-medium">{formatCurrency(cargo.distanceCost)}</span>
						</div>
						<div class="flex justify-between text-sm">
							<span class="text-gray-600">Tax</span>
							<span class="font-medium">{formatCurrency(cargo.taxAmount)}</span>
						</div>
						<Separator />
						<div class="flex justify-between">
							<span class="font-bold">Total Cost</span>
							<span class="font-bold text-lg text-[#3A506B]">
								{formatCurrency(cargo.totalCost)}
							</span>
						</div>
						{#if cargo.isPaid}
							<Badge class="w-full justify-center bg-green-100 text-green-800">
								✅ Paid
							</Badge>
						{:else}
							<Badge class="w-full justify-center bg-yellow-100 text-yellow-800">
								⏳ Payment Pending
							</Badge>
						{/if}
					</div>
				</Card>

				<!-- Quick Actions -->
				<Card class="p-6">
					<h3 class="font-bold text-gray-900 mb-4">Quick Actions</h3>
					<div class="space-y-2">
						<Button 
							variant="outline" 
							class="w-full justify-start"
							on:click={() => goto(`/track?id=${cargo.trackingId}`)}
						>
							🔍 Public Tracking
						</Button>
						{#if user?.role === 'admin' || user?.role === 'freight_officer'}
							<Button 
								variant="outline" 
								class="w-full justify-start"
								on:click={() => goto(`/cargo/${cargo._id}/update`)}
							>
								📝 Update Status
							</Button>
						{/if}
					</div>
				</Card>

				<!-- Metadata -->
				<Card class="p-6">
					<h3 class="font-bold text-gray-900 mb-4">📋 Metadata</h3>
					<div class="space-y-2 text-sm">
						<div>
							<p class="text-gray-500">Created</p>
							<p class="font-medium">{formatDateTime(cargo.createdAt)}</p>
						</div>
						<div>
							<p class="text-gray-500">Last Updated</p>
							<p class="font-medium">{formatDateTime(cargo.updatedAt)}</p>
						</div>
					</div>
				</Card>
			</div>
		</div>
	</div>
{/if}
