<script lang="ts">
	import { onMount } from 'svelte';

	let settings = $state<any>(null);
	let isLoading = $state(true);
	let isSaving = $state(false);
	let saveMessage = $state('');

	onMount(async () => {
		await loadSettings();
	});

	async function loadSettings() {
		isLoading = true;
		try {
			const response = await fetch('/api/admin/settings', {
				credentials: 'include'
			});

			if (response.ok) {
				const data = await response.json();
				settings = data.settings;
			}
		} catch (error) {
			console.error('Failed to load settings:', error);
		} finally {
			isLoading = false;
		}
	}

	async function saveSettings() {
		isSaving = true;
		saveMessage = '';
		
		try {
			const response = await fetch('/api/admin/settings', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(settings)
			});

			if (response.ok) {
				const data = await response.json();
				settings = data.settings;
				saveMessage = 'Settings saved successfully!';
				
				setTimeout(() => {
					saveMessage = '';
				}, 3000);
			} else {
				const error = await response.json();
				alert(error.error || 'Failed to save settings');
			}
		} catch (error) {
			console.error('Failed to save settings:', error);
			alert('Failed to save settings');
		} finally {
			isSaving = false;
		}
	}

	async function resetSettings() {
		if (confirm('Are you sure you want to reset all settings to default values?')) {
			settings = {
				companyName: 'GoFright',
				companyEmail: 'admin@gofright.com',
				companyPhone: '+1 234 567 8900',
				companyAddress: '123 Freight St, City, Country',
				currency: 'USD - US Dollar',
				timezone: 'UTC - Coordinated Universal Time',
				twoFactorEnabled: false,
				emailNotifications: true,
				smsNotifications: false,
				autoBackup: true,
				maintenanceMode: false
			};
			await saveSettings();
		}
	}
</script>

<svelte:head>
	<title>Settings - GoFright Admin</title>
</svelte:head>

<div class="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
	<!-- Header -->
	<div class="mx-8 mt-8 flex-shrink-0">
		<div class="flex items-center justify-between mb-6">
			<div>
				<h1 class="text-3xl font-bold text-gray-900 mb-1">System Settings</h1>
				<p class="text-gray-600">Configure system preferences and company information</p>
			</div>
			<div class="flex items-center gap-3">
				<button 
					onclick={resetSettings}
					class="px-4 py-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
					</svg>
					Reset
				</button>
				<button 
					onclick={saveSettings}
					disabled={isSaving}
					class="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium shadow-lg shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50"
				>
					{#if isSaving}
						<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						Saving...
					{:else}
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
						</svg>
						Save Changes
					{/if}
				</button>
			</div>
		</div>
		
		{#if saveMessage}
			<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 mb-4">
				<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
				</svg>
				{saveMessage}
			</div>
		{/if}
	</div>

	<!-- Content - Scrollable -->
	<div class="flex-1 overflow-y-auto px-8 pb-8 space-y-6">
		{#if isLoading}
			<div class="flex items-center justify-center h-64">
				<div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
			</div>
		{:else if settings}
		<!-- Company Information -->
		<div class="bg-white rounded-3xl shadow-sm p-8">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
					<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
					</svg>
				</div>
				<h2 class="text-xl font-bold text-gray-900">Company Information</h2>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
					<input 
						type="text" 
						bind:value={settings.companyName}
						class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
						placeholder="Enter company name"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
					<input 
						type="email" 
						bind:value={settings.companyEmail}
						class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
						placeholder="Enter email"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
					<input 
						type="tel" 
						bind:value={settings.companyPhone}
						class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
						placeholder="Enter phone"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
					<input 
						type="text" 
						bind:value={settings.companyAddress}
						class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
						placeholder="Enter address"
					/>
				</div>
			</div>
		</div>

		<!-- Localization -->
		<div class="bg-white rounded-3xl shadow-sm p-8">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
					<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/>
					</svg>
				</div>
				<h2 class="text-xl font-bold text-gray-900">Localization</h2>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Currency</label>
					<select 
						bind:value={settings.currency}
						class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
					>
						<option>USD - US Dollar</option>
						<option>EUR - Euro</option>
						<option>GBP - British Pound</option>
						<option>JPY - Japanese Yen</option>
					</select>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
					<select 
						bind:value={settings.timezone}
						class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
					>
						<option>UTC</option>
						<option>EST - Eastern Time</option>
						<option>PST - Pacific Time</option>
						<option>GMT - Greenwich Mean Time</option>
					</select>
				</div>
			</div>
		</div>

		<!-- Security -->
		<div class="bg-white rounded-3xl shadow-sm p-8">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center">
					<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
					</svg>
				</div>
				<h2 class="text-xl font-bold text-gray-900">Security</h2>
			</div>

			<div class="space-y-4">
				<div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
					<div>
						<h3 class="font-semibold text-gray-900 mb-1">Two-Factor Authentication</h3>
						<p class="text-sm text-gray-600">Add an extra layer of security to your account</p>
					</div>
					<button 
						onclick={() => settings.twoFactorEnabled = !settings.twoFactorEnabled}
						class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors {settings.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-300'}"
					>
						<span class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform {settings.twoFactorEnabled ? 'translate-x-7' : 'translate-x-1'}"></span>
					</button>
				</div>

				<div class="flex gap-3">
					<button class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
						Change Password
					</button>
					<button class="px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium">
						Enable Two-Factor Authentication
					</button>
				</div>
			</div>
		</div>

		<!-- Notifications -->
		<div class="bg-white rounded-3xl shadow-sm p-8">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center">
					<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
					</svg>
				</div>
				<h2 class="text-xl font-bold text-gray-900">Notifications</h2>
			</div>

			<div class="space-y-3">
				<div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
					<div>
						<h3 class="font-medium text-gray-900">Email Notifications</h3>
						<p class="text-sm text-gray-600">Receive updates via email</p>
					</div>
					<button 
						onclick={() => settings.emailNotifications = !settings.emailNotifications}
						class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors {settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'}"
					>
						<span class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform {settings.emailNotifications ? 'translate-x-7' : 'translate-x-1'}"></span>
					</button>
				</div>

				<div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
					<div>
						<h3 class="font-medium text-gray-900">SMS Notifications</h3>
						<p class="text-sm text-gray-600">Receive SMS for critical updates</p>
					</div>
					<button 
						onclick={() => settings.smsNotifications = !settings.smsNotifications}
						class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors {settings.smsNotifications ? 'bg-blue-600' : 'bg-gray-300'}"
					>
						<span class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform {settings.smsNotifications ? 'translate-x-7' : 'translate-x-1'}"></span>
					</button>
				</div>
			</div>
		</div>

		<!-- System Settings -->
		<div class="bg-white rounded-3xl shadow-sm p-8">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center">
					<svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
					</svg>
				</div>
				<h2 class="text-xl font-bold text-gray-900">System Configuration</h2>
			</div>

			<div class="space-y-3">
				<div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
					<div>
						<h3 class="font-medium text-gray-900">Auto Backup</h3>
						<p class="text-sm text-gray-600">Automatically backup database daily</p>
					</div>
					<button 
						onclick={() => settings.autoBackup = !settings.autoBackup}
						class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors {settings.autoBackup ? 'bg-blue-600' : 'bg-gray-300'}"
					>
						<span class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform {settings.autoBackup ? 'translate-x-7' : 'translate-x-1'}"></span>
					</button>
				</div>

				<div class="flex items-center justify-between p-4 bg-red-50 rounded-2xl border-2 border-red-200">
					<div>
						<h3 class="font-medium text-red-900">Maintenance Mode</h3>
						<p class="text-sm text-red-600">Temporarily disable system for maintenance</p>
					</div>
					<button 
						onclick={() => settings.maintenanceMode = !settings.maintenanceMode}
						class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors {settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'}"
					>
						<span class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform {settings.maintenanceMode ? 'translate-x-7' : 'translate-x-1'}"></span>
					</button>
				</div>
			</div>
		</div>
		{/if}
	</div>
</div>

<style>
	/* Custom scrollbar */
	.overflow-y-auto::-webkit-scrollbar {
		width: 6px;
	}
	
	.overflow-y-auto::-webkit-scrollbar-track {
		background: transparent;
	}
	
	.overflow-y-auto::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 3px;
	}
	
	.overflow-y-auto::-webkit-scrollbar-thumb:hover {
		background: #94a3b8;
	}
</style>
