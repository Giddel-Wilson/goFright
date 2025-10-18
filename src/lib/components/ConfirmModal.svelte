<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	
	interface Props {
		show?: boolean;
		title?: string;
		message: string;
		confirmText?: string;
		cancelText?: string;
		type?: 'danger' | 'warning' | 'info';
		onConfirm?: () => void;
		onCancel?: () => void;
	}
	
	let { 
		show = $bindable(false), 
		title = 'Confirm Action',
		message,
		confirmText = 'Confirm',
		cancelText = 'Cancel',
		type = 'info',
		onConfirm,
		onCancel
	}: Props = $props();

	function handleConfirm() {
		show = false;
		onConfirm?.();
	}

	function handleCancel() {
		show = false;
		onCancel?.();
	}

	const iconColors = {
		danger: 'text-red-600 bg-red-100',
		warning: 'text-yellow-600 bg-yellow-100',
		info: 'text-blue-600 bg-blue-100'
	};

	const buttonColors = {
		danger: 'bg-red-600 hover:bg-red-700',
		warning: 'bg-yellow-600 hover:bg-yellow-700',
		info: 'bg-blue-600 hover:bg-blue-700'
	};
</script>

{#if show}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center px-4"
		transition:fade={{ duration: 200 }}
	>
		<!-- Backdrop -->
		<div 
			class="absolute inset-0 bg-black/50 backdrop-blur-sm"
			onclick={handleCancel}
		></div>
		
		<!-- Modal -->
		<div 
			class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
			transition:fly={{ y: -20, duration: 300 }}
		>
			<div class="p-6">
				<div class="flex items-start gap-4 mb-4">
					<div class="flex-shrink-0 w-12 h-12 rounded-full {iconColors[type]} flex items-center justify-center">
						{#if type === 'danger'}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
							</svg>
						{:else if type === 'warning'}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
						{:else}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
						{/if}
					</div>
					<div class="flex-1 min-w-0">
						<h3 class="text-lg font-semibold text-gray-900 mb-2">
							{title}
						</h3>
						<p class="text-sm text-gray-600">
							{message}
						</p>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex gap-3 justify-end">
					<button
						onclick={handleCancel}
						class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
					>
						{cancelText}
					</button>
					<button
						onclick={handleConfirm}
						class="px-4 py-2 text-sm font-medium text-white {buttonColors[type]} rounded-xl transition-colors shadow-lg"
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
