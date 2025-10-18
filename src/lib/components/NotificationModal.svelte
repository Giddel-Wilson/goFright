<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	
	interface Props {
		show?: boolean;
		type?: 'success' | 'error' | 'warning' | 'info';
		title?: string;
		message: string;
		onClose?: () => void;
	}
	
	let { 
		show = $bindable(false), 
		type = 'info',
		title = '',
		message,
		onClose
	}: Props = $props();

	function close() {
		show = false;
		onClose?.();
	}

	// Auto close after 3 seconds for success messages
	$effect(() => {
		if (show && type === 'success') {
			const timer = setTimeout(() => {
				close();
			}, 3000);
			return () => clearTimeout(timer);
		}
	});

	const icons = {
		success: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
		</svg>`,
		error: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
		</svg>`,
		warning: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
		</svg>`,
		info: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
		</svg>`
	};

	const styles = {
		success: 'bg-green-50 border-green-200 text-green-800',
		error: 'bg-red-50 border-red-200 text-red-800',
		warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
		info: 'bg-blue-50 border-blue-200 text-blue-800'
	};

	const iconStyles = {
		success: 'text-green-600',
		error: 'text-red-600',
		warning: 'text-yellow-600',
		info: 'text-blue-600'
	};

	const defaultTitles = {
		success: 'Success',
		error: 'Error',
		warning: 'Warning',
		info: 'Information'
	};
</script>

{#if show}
	<div 
		class="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
		transition:fade={{ duration: 200 }}
	>
		<!-- Backdrop -->
		<div 
			class="absolute inset-0 bg-black/20 backdrop-blur-sm"
			onclick={close}
		></div>
		
		<!-- Modal -->
		<div 
			class="relative bg-white rounded-2xl shadow-2xl border-2 {styles[type]} max-w-md w-full overflow-hidden"
			transition:fly={{ y: -50, duration: 300 }}
		>
			<div class="p-6">
				<div class="flex items-start gap-4">
					<div class="flex-shrink-0 {iconStyles[type]}">
						{@html icons[type]}
					</div>
					<div class="flex-1 min-w-0">
						<h3 class="text-lg font-semibold mb-1">
							{title || defaultTitles[type]}
						</h3>
						<p class="text-sm opacity-90">
							{message}
						</p>
					</div>
					<button
						onclick={close}
						class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
						</svg>
					</button>
				</div>
			</div>
			
			<!-- Progress bar for auto-close -->
			{#if type === 'success'}
				<div class="h-1 bg-green-200">
					<div class="h-full bg-green-600 animate-[shrink_3s_linear]"></div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	@keyframes shrink {
		from { width: 100%; }
		to { width: 0%; }
	}
</style>
