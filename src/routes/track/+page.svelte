<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Alert from '$lib/components/ui/alert/alert.svelte';

	let trackingId = $state('');
	let cargo = $state(null);
	let trackingHistory = $state([]);
	let isSearching = $state(false);
	let error = $state('');
	let isNavigating = $state(false);

	async function navigate(path: string) {
		isNavigating = true;
		await goto(path);
		setTimeout(() => {
			isNavigating = false;
		}, 300);
	}

	// Check URL params for tracking ID
	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const idFromUrl = urlParams.get('id');
		if (idFromUrl) {
			trackingId = idFromUrl;
			handleSearch();
		}
	});

	async function handleSearch() {
		if (!trackingId.trim()) {
			error = 'Please enter a tracking ID';
			return;
		}

		isSearching = true;
		error = '';
		cargo = null;
		trackingHistory = [];

		try {
			const response = await fetch(`/api/track/${encodeURIComponent(trackingId.trim())}`);
			const data = await response.json();

			if (response.ok) {
				cargo = data.cargo;
				trackingHistory = data.tracking || [];
			} else {
				error = data.error || 'Tracking ID not found';
			}
		} catch (err) {
			error = 'An error occurred. Please try again.';
			console.error('Tracking error:', err);
		} finally {
			isSearching = false;
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

	function formatDateTime(date: string) {
		return new Date(date).toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Track Your Shipment - GoFright</title>
</svelte:head>

{#if isNavigating}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
		<div class="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center">
			<div class="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
			<p class="text-gray-700 font-medium">Loading...</p>
		</div>
	</div>
{/if}

<div class="min-h-screen bg-white">
	<!-- Navigation -->
	<nav class="border-b bg-white sticky top-0 z-50 shadow-sm">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<button 
					onclick={() => navigate('/')}
					class="flex items-center space-x-2 hover:opacity-80 transition"
					disabled={isNavigating || isSearching}
				>
					<span class="text-3xl">📦</span>
					<span class="text-2xl font-bold text-gray-900">GoFright</span>
				</button>
				<div class="flex gap-2">
					<Button 
						variant="ghost" 
						type="button"
						onclick={() => navigate('/login')}
						disabled={isNavigating || isSearching}
					>
						Sign In
					</Button>
					<Button 
						type="button"
						onclick={() => navigate('/register')} 
						class="bg-cyan-500 hover:bg-cyan-600"
						disabled={isNavigating || isSearching}
					>
						Register
					</Button>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<!-- Search Section -->
		<Card class="p-8 mb-8 shadow-lg border">
			<div class="text-center mb-6">
				<div class="text-6xl mb-4">🔍</div>
				<h2 class="text-3xl font-bold text-gray-900 mb-2">Track Your Shipment</h2>
				<p class="text-gray-600">Enter your tracking ID to see the latest status</p>
			</div>

			<form 
				onsubmit={(e) => {
					e.preventDefault();
					handleSearch();
				}} 
				class="max-w-xl mx-auto"
			>
				<div class="space-y-4">
					<div>
						<Label for="trackingId">Tracking ID</Label>
						<Input
							id="trackingId"
							type="text"
							bind:value={trackingId}
							placeholder="e.g., GF-XXXXXXXXXX"
							class="text-lg"
							disabled={isSearching}
						/>
					</div>
					<Button
						type="submit"
						class="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
						disabled={isSearching}
					>
						{isSearching ? 'Searching...' : '🔍 Track Shipment'}
					</Button>
				</div>
			</form>

			{#if error}
				<Alert variant="destructive" class="mt-4">
					<p>{error}</p>
				</Alert>
			{/if}
		</Card>

		<!-- Results Section -->
		{#if cargo}
			<div class="space-y-6">
				<!-- Status Card -->
				<Card class="p-8 bg-white shadow-lg border">
					<div class="text-center mb-6">
						<div class="text-6xl mb-4">{getStatusIcon(cargo.status)}</div>
						<Badge class={`${getStatusColor(cargo.status)} text-lg px-6 py-2 mb-4`}>
							{cargo.status.replace('_', ' ').toUpperCase()}
						</Badge>
						<h3 class="text-2xl font-bold text-gray-900 mb-2 font-mono">
							{cargo.trackingId}
						</h3>
						<p class="text-gray-600">
							{cargo.origin} → {cargo.destination}
						</p>
					</div>

					<!-- Quick Info -->
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
						<div class="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
							<p class="text-sm text-gray-500 mb-1">Weight</p>
							<p class="font-bold text-gray-900">⚖️ {cargo.weight} kg</p>
						</div>
						<div class="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
							<p class="text-sm text-gray-500 mb-1">Cargo Type</p>
							<p class="font-bold text-gray-900">{cargo.cargoType.replace('_', ' ')}</p>
						</div>
						{#if cargo.estimatedDelivery}
							<div class="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
								<p class="text-sm text-gray-500 mb-1">Est. Delivery</p>
								<p class="font-bold text-gray-900">
									{new Date(cargo.estimatedDelivery).toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric'
									})}
								</p>
							</div>
						{/if}
					</div>
				</Card>

				<!-- Tracking Timeline -->
				<Card class="p-8 shadow-lg border">
					<h3 class="text-2xl font-bold text-gray-900 mb-6">Shipment Journey</h3>
					
					{#if trackingHistory.length === 0}
						<p class="text-gray-500 text-center py-8">No tracking updates available yet</p>
					{:else}
						<div class="space-y-6">
							{#each trackingHistory as track, index}
								<div class="flex gap-4">
									<!-- Timeline -->
									<div class="flex flex-col items-center">
										<div class="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl shadow-lg">
											{getStatusIcon(track.status)}
										</div>
										{#if index < trackingHistory.length - 1}
											<div class="w-1 h-full bg-blue-200 my-2"></div>
										{/if}
									</div>

									<!-- Content -->
									<div class="flex-1 pb-8">
										<div class="bg-gray-50 rounded-lg p-4 border">
											<div class="flex justify-between items-start mb-2">
												<p class="font-bold text-gray-900 text-lg">
													{track.status.replace('_', ' ').toUpperCase()}
												</p>
												<p class="text-sm text-gray-500">
													{formatDateTime(track.timestamp)}
												</p>
											</div>
											<p class="text-gray-700 mb-2">
												📍 {track.location}
											</p>
											{#if track.notes}
												<p class="text-sm text-gray-600 italic">{track.notes}</p>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</Card>

				<!-- Contact Info -->
				<Card class="p-6 bg-blue-50 border-blue-200 shadow-lg">
					<div class="text-center">
						<p class="text-gray-700 mb-2">
							Need help with your shipment?
						</p>
						<p class="font-semibold text-blue-900">
							Contact us: support@gofright.com | +1 (800) 123-4567
						</p>
					</div>
				</Card>
			</div>
		{/if}
	</div>

	<!-- Footer -->
	<div class="border-t bg-gray-50 mt-12">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div class="text-center">
				<p class="text-gray-600 mb-2">
					© 2024 GoFright. All rights reserved.
				</p>
				<button
					type="button"
					onclick={() => navigate('/')}
					disabled={isNavigating}
					class="text-blue-600 hover:text-blue-700 font-medium"
				>
					Back to Home
				</button>
			</div>
		</div>
	</div>
</div>
