<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/card/card.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectValue
	} from '$lib/components/ui/select';

	let user = $state(null);
	let cargoList = $state([]);
	let isLoading = $state(true);
	let searchTerm = $state('');
	let statusFilter = $state('all');
	let currentPage = $state(1);
	let totalPages = $state(1);
	let totalItems = $state(0);
	const itemsPerPage = 10;

	authStore.subscribe(state => {
		user = state.user;
	});

	onMount(async () => {
		await loadCargo();
	});

	async function loadCargo() {
		isLoading = true;
		try {
			const params = new URLSearchParams({
				page: currentPage.toString(),
				limit: itemsPerPage.toString()
			});

			if (searchTerm) params.append('search', searchTerm);
			if (statusFilter !== 'all') params.append('status', statusFilter);

			const response = await fetch(`/api/cargo?${params}`);
			if (response.ok) {
				const data = await response.json();
				cargoList = data.cargo || [];
				totalPages = data.pagination?.pages || 1;
				totalItems = data.pagination?.total || 0;
			}
		} catch (error) {
			console.error('Failed to load cargo:', error);
		} finally {
			isLoading = false;
		}
	}

	function handleSearch() {
		currentPage = 1;
		loadCargo();
	}

	function handleFilterChange(value: string) {
		statusFilter = value;
		currentPage = 1;
		loadCargo();
	}

	function nextPage() {
		if (currentPage < totalPages) {
			currentPage++;
			loadCargo();
		}
	}

	function prevPage() {
		if (currentPage > 1) {
			currentPage--;
			loadCargo();
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

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}
</script>

<svelte:head>
	<title>Cargo Management - GoFright</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-8 rounded-lg shadow-lg mb-6">
		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
			<div>
				<h1 class="text-4xl font-bold mb-2">Cargo Management 📦</h1>
				<p class="text-blue-100 text-lg">Manage and track all your shipments</p>
			</div>
			<Button 
				onclick={() => goto('/cargo/new')}
				class="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
			>
				📦 Book New Cargo
			</Button>
		</div>
	</div>

	<!-- Filters -->
	<Card class="p-6 shadow-lg bg-white">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div class="md:col-span-2">
				<form onsubmit={(e) => { e.preventDefault(); handleSearch(); }}>
					<div class="flex gap-2">
						<Input
							type="text"
							placeholder="🔍 Search by tracking ID, origin, or destination..."
							bind:value={searchTerm}
							class="flex-1 border-blue-200 focus:border-blue-500"
						/>
						<Button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white">Search</Button>
					</div>
				</form>
			</div>
			<div>
				<Select value={statusFilter} onValueChange={handleFilterChange}>
					<SelectTrigger>
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="booked">Booked</SelectItem>
						<SelectItem value="pending_pickup">Pending Pickup</SelectItem>
						<SelectItem value="in_transit">In Transit</SelectItem>
						<SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
						<SelectItem value="delivered">Delivered</SelectItem>
						<SelectItem value="delayed">Delayed</SelectItem>
						<SelectItem value="cancelled">Cancelled</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	</Card>

	<!-- Results Info -->
	<div class="flex justify-between items-center text-sm text-gray-600">
		<p>
			Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} shipments
		</p>
		<p>Page {currentPage} of {totalPages}</p>
	</div>

	<!-- Cargo List -->
	<Card class="p-6 shadow-lg bg-white">
		{#if isLoading}
			<div class="text-center py-12">
				<div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
				<p class="text-gray-600 font-medium">Loading shipments...</p>
			</div>
		{:else if cargoList.length === 0}
			<div class="text-center py-12">
				<div class="text-6xl mb-4">📦</div>
				<p class="text-gray-600 text-lg mb-4 font-medium">No shipments found</p>
				<Button onclick={() => goto('/cargo/new')} class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
					📦 Book Your First Cargo
				</Button>
			</div>
		{:else}
			<div class="space-y-4">
				{#each cargoList as cargo}
					<div 
						class="border border-blue-100 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 cursor-pointer transition-all duration-300 bg-gradient-to-r from-white to-blue-50"
						onclick={() => goto(`/cargo/${cargo._id}`)}
						onkeypress={(e) => e.key === 'Enter' && goto(`/cargo/${cargo._id}`)}
						role="button"
						tabindex="0"
					>
						<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
							<!-- Left Section -->
							<div class="flex-1">
								<div class="flex items-center gap-3 mb-3">
									<p class="font-mono text-lg font-bold text-blue-600">
										{cargo.trackingId}
									</p>
									<Badge class={getStatusColor(cargo.status)}>
										{cargo.status.replace('_', ' ')}
									</Badge>
								</div>
								
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
									<div>
										<p class="text-gray-500">Origin</p>
										<p class="font-medium">📍 {cargo.origin}</p>
									</div>
									<div>
										<p class="text-gray-500">Destination</p>
										<p class="font-medium">🎯 {cargo.destination}</p>
									</div>
									<div>
										<p class="text-gray-500">Weight</p>
										<p class="font-medium">⚖️ {cargo.weight} kg</p>
									</div>
									<div>
										<p class="text-gray-500">Type</p>
										<p class="font-medium">{cargo.cargoType.replace('_', ' ')}</p>
									</div>
								</div>
							</div>

							<!-- Right Section -->
							<div class="text-left lg:text-right space-y-2">
								<p class="text-2xl font-bold text-blue-600">
									{formatCurrency(cargo.totalCost)}
								</p>
								<p class="text-sm text-gray-600">
									📅 Booked: {formatDate(cargo.createdAt)}
								</p>
								{#if cargo.estimatedDelivery}
									<p class="text-sm text-cyan-600 font-medium">
										🚚 ETA: {formatDate(cargo.estimatedDelivery)}
									</p>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</Card>

	<!-- Pagination -->
	{#if totalPages > 1}
		<div class="flex justify-center gap-2">
			<Button
				class="border-blue-600 text-blue-600 hover:bg-blue-50"
				variant="outline"
				onclick={prevPage}
				disabled={currentPage === 1}
			>
				← Previous
			</Button>
			<div class="flex items-center px-4 bg-white rounded-lg border border-blue-200">
				<span class="text-sm text-blue-600 font-medium">
					Page {currentPage} of {totalPages}
				</span>
			</div>
			<Button
				class="border-blue-600 text-blue-600 hover:bg-blue-50"
				variant="outline"
				onclick={nextPage}
				disabled={currentPage === totalPages}
			>
				Next →
			</Button>
		</div>
	{/if}
</div>
