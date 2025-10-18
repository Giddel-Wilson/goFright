<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let isLoading = $state(false);
	let isNavigating = $state(false);

	async function navigate(path: string) {
		isNavigating = true;
		await goto(path);
		setTimeout(() => {
			isNavigating = false;
		}, 300);
	}

	async function handleLogin() {
		error = '';
		isLoading = true;

		const result = await authStore.login(email, password);

		if (result.success) {
			// Get user role from store to determine redirect
			let userRole = '';
			const unsubscribe = authStore.subscribe(state => {
				userRole = state.user?.role || '';
			});
			unsubscribe();

			// Redirect admin to admin panel, others to dashboard
			if (userRole === 'admin') {
				await navigate('/admin');
			} else {
				await navigate('/dashboard');
			}
		} else {
			error = result.error || 'Login failed';
		}

		isLoading = false;
	}
</script>

<svelte:head>
	<title>Login - GoFright</title>
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
					disabled={isNavigating || isLoading}
				>
					<span class="text-3xl">📦</span>
					<span class="text-2xl font-bold text-gray-900">GoFright</span>
				</button>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<div class="flex items-center justify-center px-4 py-12">
		<Card class="w-full max-w-md p-8 space-y-6 bg-white shadow-xl border">
			<!-- Logo -->
			<div class="text-center">
				<div class="text-5xl mb-3">🔐</div>
				<h1 class="text-3xl font-bold text-gray-900">Welcome Back</h1>
				<p class="mt-2 text-sm text-gray-600">Sign in to your GoFright account</p>
			</div>

			<!-- Login Form -->
			<form 
				onsubmit={(e) => {
					e.preventDefault();
					handleLogin();
				}} 
				class="space-y-4"
			>
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input
						id="email"
						type="email"
						bind:value={email}
						placeholder="admin@gofright.com"
						required
						disabled={isLoading}
						class="w-full"
					/>
				</div>

				<div class="space-y-2">
					<Label for="password">Password</Label>
					<Input
						id="password"
						type="password"
						bind:value={password}
						placeholder="••••••••"
						required
						disabled={isLoading}
						class="w-full"
					/>
				</div>

				{#if error}
					<Alert variant="destructive">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				{/if}

				<Button 
					type="submit" 
					disabled={isLoading} 
					class="w-full bg-blue-600 hover:bg-blue-700 text-white"
				>
					{isLoading ? 'Signing in...' : 'Sign In'}
				</Button>
			</form>

			<!-- Register Link -->
			<div class="text-center text-sm">
				<p class="text-gray-600">
					Don't have an account?
					<button
						type="button"
						onclick={() => navigate('/register')}
						disabled={isNavigating || isLoading}
						class="text-blue-600 hover:text-blue-700 font-medium ml-1"
					>
						Create one now
					</button>
				</p>
			</div>

			<!-- Demo Credentials -->
			<div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
				<p class="text-xs font-semibold text-blue-900 mb-2">Demo Credentials:</p>
				<p class="text-xs text-blue-700">Email: admin@gofright.com</p>
				<p class="text-xs text-blue-700">Password: GoFright@2024Admin</p>
			</div>
		</Card>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
