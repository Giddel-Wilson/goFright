<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
	import { Separator } from '$lib/components/ui/separator';

	let { children } = $props();
	let isLoading = $state(true);
	let user = $state(null);

	// Subscribe to auth store
	authStore.subscribe(state => {
		console.log('Auth state updated:', state);
		user = state.user;
		isLoading = state.isLoading;
		
		// Redirect to login if not authenticated
		if (!isLoading && !state.isAuthenticated) {
			console.log('Redirecting to login - not authenticated');
			goto('/login');
		}
	});

	function getInitials(name: string) {
		return name
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	async function handleLogout() {
		await authStore.logout();
	}

	const navItems = [
		{ href: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['freight_officer', 'customer'] },
		{ href: '/cargo', label: 'Cargo', icon: '📦', roles: ['freight_officer', 'customer'] },
		{ href: '/track', label: 'Track', icon: '🔍', roles: ['admin', 'freight_officer', 'customer'] },
		{ href: '/admin', label: 'Admin Panel', icon: '⚙️', roles: ['admin'] },
		{ href: '/reports', label: 'Reports', icon: '📈', roles: ['admin', 'freight_officer'] }
	];

	function canSeeNavItem(roles: string[]) {
		return user && roles.includes(user.role);
	}
</script>

	{#if isLoading}
	<div class="flex items-center justify-center min-h-screen bg-gray-50">
		<div class="text-center">
			<div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
			<p class="mt-4 text-gray-600">Loading...</p>
		</div>
	</div>
{:else if user}
	<div class="min-h-screen bg-gray-50">
		<!-- Top Navigation Bar -->
		<nav class="bg-blue-600 text-white shadow-lg">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between items-center h-16">
					<!-- Logo -->
					<a href={user.role === 'admin' ? '/admin' : '/dashboard'} class="flex items-center space-x-2">
						<h1 class="text-2xl font-bold">
							GO<span class="text-cyan-400">FRIGHT</span>
						</h1>
					</a>

					<!-- Navigation Links -->
					<div class="hidden md:flex space-x-4">
						{#each navItems as item}
							{#if canSeeNavItem(item.roles)}
								<a
									href={item.href}
									class="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
								>
									<span>{item.icon}</span>
					<span>{item.label}</span>
								</a>
							{/if}
						{/each}
					</div>

					<!-- User Menu -->
					<div class="flex items-center space-x-4">
						<div class="hidden md:block text-right">
							<p class="text-sm font-medium">{user.name}</p>
							<p class="text-xs text-gray-300 capitalize">{user.role.replace('_', ' ')}</p>
						</div>

						<!-- Logout Button -->
						<Button 
							variant="outline" 
							class="hidden md:flex border-white/20 text-white hover:bg-blue-700 hover:border-white/40"
							onclick={handleLogout}
						>
							🚪 Logout
						</Button>
						
						<DropdownMenu>
							<DropdownMenuTrigger>
								<Avatar class="h-10 w-10 cursor-pointer hover:opacity-80 transition">
									<AvatarFallback class="bg-cyan-500 text-blue-900">
										{getInitials(user.name)}
									</AvatarFallback>
								</Avatar>
							</DropdownMenuTrigger>
							<DropdownMenuContent class="w-56" align="end">
								<DropdownMenuLabel>
									<div class="flex flex-col space-y-1">
										<p class="text-sm font-medium">{user.name}</p>
										<p class="text-xs text-gray-500">{user.email}</p>
										<p class="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{#if user.role !== 'admin'}
									<DropdownMenuItem onclick={() => goto('/dashboard')}>
										📊 Dashboard
									</DropdownMenuItem>
								{/if}
								{#if user.role === 'admin'}
									<DropdownMenuItem onclick={() => goto('/admin')}>
										⚙️ Admin Panel
									</DropdownMenuItem>
								{/if}
								<DropdownMenuItem onclick={() => goto('/profile')}>
									👤 Profile
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onclick={handleLogout} class="text-red-600">
									🚪 Logout
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>
		</nav>

		<!-- Main Content -->
		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			{@render children?.()}
		</main>

		<!-- Footer -->
		<footer class="bg-white border-t border-gray-200 mt-12">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div class="text-center text-sm text-gray-600">
					<p>© 2025 GoFright - Cargo Freight Management System</p>
					<p class="mt-1">Built with SvelteKit & MongoDB</p>
				</div>
			</div>
		</footer>
	</div>
{/if}
