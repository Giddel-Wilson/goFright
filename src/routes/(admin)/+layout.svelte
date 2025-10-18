<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	let user = $state(authStore.user);
	let isLoading = $state(authStore.isLoading);

	authStore.subscribe((state) => {
		user = state.user;
		isLoading = state.isLoading;

		if (!isLoading) {
			if (!state.user) {
				goto('/login');
			} else if (state.user.role !== 'admin') {
				goto('/dashboard');
			}
		}
	});

	let currentPath = $derived($page.url.pathname);

	const navItems = [
		{ icon: 'dashboard', label: 'Dashboard', href: '/admin', exactMatch: true },
		{ icon: 'packages', label: 'Packages', href: '/admin/packages', exactMatch: false },
		{ icon: 'users', label: 'Users', href: '/admin/users', exactMatch: false },
		{ icon: 'reports', label: 'Reports', href: '/admin/reports', exactMatch: false },
		{ icon: 'settings', label: 'Settings', href: '/admin/settings', exactMatch: false }
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

{#if isLoading}
	<div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
		<div class="text-center">
			<div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
			<p class="mt-4 text-gray-600 font-medium">Loading...</p>
		</div>
	</div>
{:else if user}
	<div class="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
		<!-- Sidebar -->
		<aside class="w-[120px] bg-blue-600 flex flex-col items-center py-6 relative shadow-2xl" style="border-radius: 0 30px 30px 0;">
			<!-- Logo -->
			<div class="mb-8">
				<div class="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer">
					<span class="text-2xl">✈️</span>
				</div>
			</div>

			<!-- Navigation Icons -->
			<nav class="flex-1 flex flex-col items-center space-y-6 mt-4">
				{#each navItems as item}
					<a
						href={item.href}
						class="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 {isActive(item.href, item.exactMatch) ? 'bg-white text-blue-600 shadow-md scale-110' : 'text-white/60 hover:text-white hover:bg-white/10'}"
						title={item.label}
					>
						{#if item.icon === 'dashboard'}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"/>
							</svg>
						{:else if item.icon === 'packages'}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
							</svg>
						{:else if item.icon === 'users'}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
							</svg>
						{:else if item.icon === 'reports'}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
							</svg>
						{:else if item.icon === 'settings'}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
							</svg>
						{/if}
					</a>
				{/each}
			</nav>

			<!-- User Avatar -->
			<div class="mt-auto pt-4">
				<a
					href="/admin/profile"
					class="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-lg hover:scale-110 transition-transform duration-200 block"
					title="Profile"
				>
					{#if user?.photoUrl}
						<img src={user.photoUrl} alt={user.name} class="w-full h-full object-cover" />
					{:else}
						<div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
							{getInitials(user?.name || 'Admin')}
						</div>
					{/if}
				</a>
			</div>
		</aside>

		<!-- Main Content Area - No scrolling -->
		<main class="flex-1 overflow-hidden">
			{@render children?.()}
		</main>
	</div>
{/if}
