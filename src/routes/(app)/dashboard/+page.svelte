<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { goto } from '$app/navigation';

	let user = $state(null);
	let stats = $state({
		totalCargo: 0,
		inTransit: 0,
		delivered: 0,
		pending: 0
	});
	let recentCargo = $state([]);
	let isLoading = $state(true);
	let isNavigating = $state(false);

	async function navigate(path: string) {
		isNavigating = true;
		try {
			await goto(path);
		} finally {
			setTimeout(() => {
				isNavigating = false;
			}, 300);
		}
	}

	authStore.subscribe(state => {
		user = state.user;
		// Redirect admins to admin panel
		if (state.user && state.user.role === 'admin') {
			goto('/admin');
		}
	});

	onMount(async () => {
		// Ensure loading overlay is cleared
		isNavigating = false;
		await loadDashboardData();
	});

	async function loadDashboardData() {
		try {
			// Fetch cargo list
			const response = await fetch('/api/cargo?limit=5');
			if (response.ok) {
				const data = await response.json();
				recentCargo = data.cargo || [];
				
				// Calculate stats
				stats.totalCargo = data.pagination?.total || 0;
				stats.inTransit = recentCargo.filter((c: any) => c.status === 'in_transit').length;
				stats.delivered = recentCargo.filter((c: any) => c.status === 'delivered').length;
				stats.pending = recentCargo.filter((c: any) => c.status === 'booked' || c.status === 'pending_pickup').length;
			}
		} catch (error) {
			console.error('Failed to load dashboard data:', error);
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
			'cancelled': 'bg-red-100 text-red-800'
		};
		return colors[status] || 'bg-gray-100 text-gray-800';
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Dashboard - GoFright</title>
</svelte:head>

{#if isNavigating}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
		<div class="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center">
			<div class="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
			<p class="text-gray-700 font-medium">Loading...</p>
		</div>
	</div>
{/if}

<div class="space-y-8">
	<!-- Welcome Section -->
	<div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-8 rounded-lg shadow-lg">
		<h1 class="text-4xl font-bold mb-2">
			Welcome back, {user?.name || 'User'}! 👋
		</h1>
		<p class="text-blue-100 text-lg">
			{#if user?.role === 'admin'}
				Manage all system operations and user accounts
			{:else if user?.role === 'freight_officer'}
				Track and update cargo shipments
			{:else}
				Track your shipments and book new cargo
			{/if}
		</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		<Card class="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-blue-600">Total Cargo</p>
					<p class="text-3xl font-bold text-blue-900 mt-2">{stats.totalCargo}</p>
				</div>
				<div class="text-4xl">📦</div>
			</div>
		</Card>

		<Card class="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-purple-600">In Transit</p>
					<p class="text-3xl font-bold text-purple-900 mt-2">{stats.inTransit}</p>
				</div>
				<div class="text-4xl">🚚</div>
			</div>
		</Card>

		<Card class="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-green-600">Delivered</p>
					<p class="text-3xl font-bold text-green-900 mt-2">{stats.delivered}</p>
				</div>
				<div class="text-4xl">✅</div>
			</div>
		</Card>

		<Card class="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-yellow-600">Pending</p>
					<p class="text-3xl font-bold text-yellow-900 mt-2">{stats.pending}</p>
				</div>
				<div class="text-4xl">⏳</div>
			</div>
		</Card>
	</div>

	<!-- Quick Actions -->
	<Card class="p-6 shadow-lg border">
		<h2 class="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<Button 
				type="button"
				onclick={() => navigate('/cargo/new')}
				class="bg-blue-600 hover:bg-blue-700 h-auto py-4"
				disabled={isNavigating}
			>
				<div class="text-center">
					<div class="text-2xl mb-1">📦</div>
					<div>Book Cargo</div>
				</div>
			</Button>

			<Button 
				type="button"
				onclick={() => navigate('/track')}
				variant="outline"
				class="h-auto py-4 border-2 hover:bg-blue-50"
				disabled={isNavigating}
			>
				<div class="text-center">
					<div class="text-2xl mb-1">🔍</div>
					<div>Track Shipment</div>
				</div>
			</Button>

			<Button 
				type="button"
				onclick={() => navigate('/cargo')}
				variant="outline"
				class="h-auto py-4 border-2 hover:bg-blue-50"
				disabled={isNavigating}
			>
				<div class="text-center">
					<div class="text-2xl mb-1">📋</div>
					<div>View All Cargo</div>
				</div>
			</Button>

			{#if user?.role === 'admin'}
				<Button 
					type="button"
					onclick={() => navigate('/admin')}
					variant="outline"
					class="h-auto py-4 border-2 hover:bg-blue-50"
					disabled={isNavigating}
				>
					<div class="text-center">
						<div class="text-2xl mb-1">⚙️</div>
						<div>Admin Panel</div>
					</div>
				</Button>
			{/if}
		</div>
	</Card>

	<!-- Recent Cargo -->
	<Card class="p-6 shadow-lg border">
		<div class="flex justify-between items-center mb-6">
			<h2 class="text-xl font-bold text-gray-900">Recent Shipments</h2>
			<Button 
				type="button"
				variant="ghost" 
				onclick={() => navigate('/cargo')}
				disabled={isNavigating}
			>
				View All →
			</Button>
		</div>

		{#if isLoading}
			<div class="text-center py-8 text-gray-500">Loading...</div>
		{:else if recentCargo.length === 0}
			<div class="text-center py-12">
				<div class="text-6xl mb-4">📦</div>
				<p class="text-gray-600 mb-4">No shipments yet</p>
				<Button 
					type="button"
					onclick={() => navigate('/cargo/new')} 
					class="bg-blue-600 hover:bg-blue-700"
					disabled={isNavigating}
				>
					Book Your First Cargo
				</Button>
			</div>
		{:else}
			<div class="space-y-4">
				{#each recentCargo as cargo}
					<button 
						class="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition text-left"
						onclick={() => navigate(`/cargo/${cargo._id}`)}
						disabled={isNavigating}
					>
						<div class="flex-1">
							<div class="flex items-center space-x-3">
								<p class="font-mono text-sm font-semibold text-blue-600">
									{cargo.trackingId}
								</p>
								<Badge class={getStatusColor(cargo.status)}>
									{cargo.status.replace('_', ' ')}
								</Badge>
							</div>
							<div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
								<p>📍 {cargo.origin} → {cargo.destination}</p>
								<p>⚖️ {cargo.weight} kg</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-sm text-gray-500">{formatDate(cargo.createdAt)}</p>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</Card>
</div>
