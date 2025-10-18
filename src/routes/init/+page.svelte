<script lang="ts">
	let isInitializing = $state(false);
	let result = $state<any>(null);

	async function initializeDatabase() {
		isInitializing = true;
		result = null;

		try {
			const response = await fetch('/api/init-db', {
				method: 'POST'
			});
			const data = await response.json();
			result = data;
		} catch (error) {
			result = {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to initialize'
			};
		} finally {
			isInitializing = false;
		}
	}
</script>

<svelte:head>
	<title>Initialize Database - GoFright</title>
</svelte:head>

<div class="min-h-screen bg-white flex items-center justify-center p-4">
	<div class="max-w-md w-full bg-white border rounded-lg shadow-lg p-8">
		<div class="text-center mb-6">
			<div class="text-6xl mb-4">🔧</div>
			<h1 class="text-2xl font-bold text-gray-900">Database Initialization</h1>
			<p class="text-gray-600 mt-2">Create the default admin account</p>
		</div>

		{#if !result}
			<button
				type="button"
				onclick={initializeDatabase}
				disabled={isInitializing}
				class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
			>
				{isInitializing ? 'Initializing...' : 'Initialize Database'}
			</button>
		{:else if result.success}
			<div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
				<p class="text-green-800 font-medium">✅ {result.message}</p>
				{#if result.admin}
					<div class="mt-3 text-sm text-green-700 space-y-1">
						<p><strong>Name:</strong> {result.admin.name}</p>
						<p><strong>Email:</strong> {result.admin.email}</p>
						{#if result.admin.password}
							<p><strong>Password:</strong> <span class="font-mono bg-white px-2 py-1 rounded">{result.admin.password}</span></p>
						{/if}
					</div>
				{/if}
				{#if result.note}
					<p class="mt-3 text-sm text-yellow-700">⚠️ {result.note}</p>
				{/if}
			</div>
			<a
				href="/login"
				class="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg text-center transition"
			>
				Go to Login
			</a>
		{:else}
			<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
				<p class="text-red-800 font-medium">❌ {result.error}</p>
			</div>
			<button
				type="button"
				onclick={() => (result = null)}
				class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
			>
				Try Again
			</button>
		{/if}

		<div class="mt-6 text-center text-sm text-gray-600">
			<p>This will create an admin account with:</p>
			<p class="mt-1 font-mono">Email: admin@gofright.com</p>
			<p class="font-mono">Password: GoFright@2024Admin</p>
		</div>
	</div>
</div>
