<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';

	let { children } = $props();

	onMount(async () => {
		// Load user authentication state on app start
		console.log('Root layout mounted - loading user...');
		await authStore.loadUser();
		console.log('User loaded');
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
