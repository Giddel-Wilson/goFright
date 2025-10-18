<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';

	let formData = $state({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
		phone: '',
		address: ''
	});
	
	let error = $state('');
	let success = $state(false);
	let isLoading = $state(false);
	let isNavigating = $state(false);

	async function navigate(path: string) {
		isNavigating = true;
		await goto(path);
		setTimeout(() => {
			isNavigating = false;
		}, 300);
	}

	async function handleRegister() {
		error = '';
		
		// Validation
		if (formData.password !== formData.confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (formData.password.length < 8) {
			error = 'Password must be at least 8 characters';
			return;
		}

		isLoading = true;

		const result = await authStore.register({
			name: formData.name,
			email: formData.email,
			password: formData.password,
			phone: formData.phone || undefined,
			address: formData.address || undefined
		});

		if (result.success) {
			success = true;
			setTimeout(() => {
				navigate('/login');
			}, 2000);
		} else {
			error = result.error || 'Registration failed';
		}

		isLoading = false;
	}
</script>

<svelte:head>
	<title>Register - GoFright</title>
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
		<Card class="w-full max-w-2xl p-8 space-y-6 bg-white shadow-xl border">
			<!-- Logo -->
			<div class="text-center">
				<div class="text-5xl mb-3">📝</div>
				<h1 class="text-3xl font-bold text-gray-900">Create Account</h1>
				<p class="mt-2 text-sm text-gray-600">Join GoFright and start shipping smarter</p>
			</div>

			{#if success}
				<Alert class="bg-green-50 border-green-200">
					<AlertDescription class="text-green-800">
						✅ Registration successful! Redirecting to login...
					</AlertDescription>
				</Alert>
			{:else}
				<!-- Registration Form -->
				<form 
					onsubmit={(e) => {
						e.preventDefault();
						handleRegister();
					}} 
					class="space-y-4"
				>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="name">Full Name *</Label>
							<Input
								id="name"
								type="text"
								bind:value={formData.name}
								placeholder="John Doe"
								required
								disabled={isLoading}
							/>
						</div>

						<div class="space-y-2">
							<Label for="email">Email *</Label>
							<Input
								id="email"
								type="email"
								bind:value={formData.email}
								placeholder="john@example.com"
								required
								disabled={isLoading}
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="password">Password *</Label>
							<Input
								id="password"
								type="password"
								bind:value={formData.password}
								placeholder="••••••••"
								required
								disabled={isLoading}
							/>
							<p class="text-xs text-gray-500">Minimum 8 characters</p>
						</div>

						<div class="space-y-2">
							<Label for="confirmPassword">Confirm Password *</Label>
							<Input
								id="confirmPassword"
								type="password"
								bind:value={formData.confirmPassword}
								placeholder="••••••••"
								required
								disabled={isLoading}
							/>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="phone">Phone Number</Label>
						<Input
							id="phone"
							type="tel"
							bind:value={formData.phone}
							placeholder="+1234567890"
							disabled={isLoading}
						/>
					</div>

					<div class="space-y-2">
						<Label for="address">Address</Label>
						<Textarea
							id="address"
							bind:value={formData.address}
							placeholder="123 Main Street, City, State, ZIP"
							rows={3}
							disabled={isLoading}
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
						{isLoading ? 'Creating Account...' : 'Create Account'}
					</Button>
				</form>
			{/if}

			<!-- Login Link -->
			<div class="text-center text-sm">
				<p class="text-gray-600">
					Already have an account?
					<button
						type="button"
						onclick={() => navigate('/login')}
						disabled={isNavigating || isLoading}
						class="text-blue-600 hover:text-blue-700 font-medium ml-1"
					>
						Sign in here
					</button>
				</p>
			</div>
		</Card>
	</div>
</div>
