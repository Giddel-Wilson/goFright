<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let currentPath = $derived($page.url.pathname);

	onMount(async () => {
		console.log('Freight Officer layout mounted - loading user...');
		await authStore.loadUser();
		console.log('User loaded:', $authStore.user);
		
		// After loading, check role
		if ($authStore.user && $authStore.user.role !== 'freight_officer') {
			console.log('User role is not freight_officer, redirecting to login');
			goto('/login');
		} else if (!$authStore.user) {
			console.log('No user found, redirecting to login');
			goto('/login');
		}
	});

	// Only redirect if not loading and no user
	$effect(() => {
		// Don't redirect while loading - wait for onMount to complete
		if (!$authStore.isLoading && !$authStore.user) {
			console.log('Not loading and no user, redirecting to login');
			goto('/login');
		}
	});

	const navItems = [
		{ label: 'Dashboard', href: '/freight-officer', icon: 'dashboard', exactMatch: true },
		{ label: 'Shipments', href: '/freight-officer/shipments', icon: 'shipments' },
		{ label: 'Tracking', href: '/freight-officer/tracking', icon: 'tracking' },
		{ label: 'Reports', href: '/freight-officer/reports', icon: 'reports' },
	];

	function isActive(href: string, exactMatch: boolean = false): boolean {
		if (exactMatch) {
			return currentPath === href;
		}
		return currentPath.startsWith(href);
	}

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<svelte:head>
	<title>Freight Officer - GoFright</title>
</svelte:head>

{#if $authStore.isLoading || !$authStore.user}
	<div class="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
		<div class="text-center">
			<div class="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
			<p class="mt-4 text-gray-600 font-medium">Loading...</p>
		</div>
	</div>
{:else}
	<div class="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
		<!-- Sidebar -->
		<aside class="w-[120px] bg-gradient-to-b from-green-600 to-green-700 flex flex-col items-center py-6 relative shadow-2xl" style="border-radius: 0 30px 30px 0;">
			<!-- Logo -->
			<div class="mb-8">
				<div class="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer">
					<span class="text-2xl">📦</span>
				</div>
			</div>

			<!-- Navigation Icons -->
			<nav class="flex-1 flex flex-col items-center space-y-6 mt-4">
				{#each navItems as item}
					<a
						href={item.href}
						class="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 {isActive(item.href, item.exactMatch) ? 'bg-white text-green-600 shadow-md scale-110' : 'text-white/60 hover:text-white hover:bg-white/10'}"
						title={item.label}
					>
						{#if item.icon === 'dashboard'}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"/>
							</svg>
						{:else if item.icon === 'shipments'}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
							</svg>
						{:else if item.icon === 'tracking'}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
							</svg>
						{:else if item.icon === 'reports'}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
							</svg>
						{:else if item.icon === 'profile'}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
							</svg>
						{/if}
					</a>
				{/each}
			</nav>

			<!-- User Avatar -->
			<div class="mt-auto pt-4">
				<a
					href="/freight-officer/profile"
					class="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-lg hover:scale-110 transition-transform duration-200 block"
					title="Profile"
				>
					{#if $authStore.user?.photoUrl}
						<img src={$authStore.user.photoUrl} alt={$authStore.user.name} class="w-full h-full object-cover" />
					{:else}
						<div class="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">
							{getInitials($authStore.user?.name || 'FO')}
						</div>
					{/if}
				</a>
			</div>
		</aside>

		<!-- Main Content -->
		<main class="flex-1 overflow-hidden">
			<slot />
		</main>
	</div>
{/if}
