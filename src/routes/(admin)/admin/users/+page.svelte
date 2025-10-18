<script lang="ts">
	import { onMount } from 'svelte';

	let users = $state([]);
	let selectedUser = $state(null);
	let isLoading = $state(true);
	let searchTerm = $state('');
	let activeTab = $state('All');

	let stats = $state({
		all: 0,
		admin: 0,
		officer: 0,
		customer: 0
	});

	const tabs = $derived([
		{ label: 'All', count: stats.all },
		{ label: 'Admin', count: stats.admin, role: 'admin' },
		{ label: 'Officers', count: stats.officer, role: 'freight_officer' },
		{ label: 'Customers', count: stats.customer, role: 'customer' }
	]);

	onMount(async () => {
		await loadUsers();
	});

	async function loadUsers() {
		isLoading = true;
		try {
			const response = await fetch('/api/admin/users', {
				credentials: 'include'
			});

			if (!response.ok) {
				throw new Error('Failed to load users');
			}

			const data = await response.json();
			users = data.users || [];

			// Calculate stats
			stats.all = users.length;
			stats.admin = users.filter(u => u.role === 'admin').length;
			stats.officer = users.filter(u => u.role === 'freight_officer').length;
			stats.customer = users.filter(u => u.role === 'customer').length;

			// Don't select first user by default - wait for user to click
			selectedUser = null;
		} catch (error) {
			console.error('Failed to load users:', error);
		} finally {
			isLoading = false;
		}
	}

	async function editUser() {
		if (!selectedUser) return;
		
		// Simple prompt-based editing for now
		const newName = prompt('Enter new name:', selectedUser.name);
		if (!newName || newName === selectedUser.name) return;

		const newEmail = prompt('Enter new email:', selectedUser.email);
		if (!newEmail || newEmail === selectedUser.email) {
			// Just update name
			await updateUserData(selectedUser._id, { name: newName });
		} else {
			await updateUserData(selectedUser._id, { name: newName, email: newEmail });
		}
	}

	async function updateUserData(userId: string, updates: any) {
		try {
			const response = await fetch(`/api/admin/users?userId=${userId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify(updates)
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to update user');
			}

			alert('User updated successfully!');
			await loadUsers();
			selectedUser = null;
		} catch (error: any) {
			console.error('Failed to update user:', error);
			alert(`Failed to update user: ${error.message}`);
		}
	}

	async function resetPassword() {
		if (!selectedUser) return;
		if (confirm(`Reset password for ${selectedUser.name}?`)) {
			alert('Password reset email sent!');
		}
	}

	async function viewActivity() {
		if (!selectedUser) return;
		alert(`Viewing activity for: ${selectedUser.name}\nThis will show user's login history and actions.`);
	}

	async function suspendAccount() {
		if (!selectedUser) return;
		
		const action = selectedUser.isActive ? 'suspend' : 'activate';
		if (confirm(`Are you sure you want to ${action} ${selectedUser.name}'s account?`)) {
			try {
				const response = await fetch(`/api/admin/users?userId=${selectedUser._id}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					credentials: 'include',
					body: JSON.stringify({ isActive: !selectedUser.isActive })
				});

				if (!response.ok) {
					const data = await response.json();
					throw new Error(data.error || `Failed to ${action} account`);
				}

				alert(`Account ${action}ed successfully!`);
				await loadUsers();
				selectedUser = null;
			} catch (error: any) {
				console.error(`Failed to ${action} account:`, error);
				alert(`Failed to ${action} account: ${error.message}`);
			}
		}
	}

	async function deleteUser() {
		if (!selectedUser) return;
		
		if (confirm(`Are you sure you want to DELETE ${selectedUser.name}? This action cannot be undone!`)) {
			if (confirm(`This will permanently delete all data for ${selectedUser.name}. Are you absolutely sure?`)) {
				try {
					const response = await fetch(`/api/admin/users?userId=${selectedUser._id}`, {
						method: 'DELETE',
						credentials: 'include'
					});

					if (!response.ok) {
						const data = await response.json();
						throw new Error(data.error || 'Failed to delete user');
					}

					alert('User deleted successfully!');
					await loadUsers();
					selectedUser = null;
				} catch (error: any) {
					console.error('Failed to delete user:', error);
					alert(`Failed to delete user: ${error.message}`);
				}
			}
		}
	}

	function getRoleColor(role: string): string {
		const colors: Record<string, string> = {
			'admin': '#8B5CF6',
			'freight_officer': '#3B82F6',
			'customer': '#22C55E'
		};
		return colors[role] || '#6B7280';
	}

	function formatRole(role: string): string {
		return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
	}

	function getInitials(name: string): string {
		return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
	}

	function formatDate(date: string | Date): string {
		if (!date) return 'N/A';
		const d = new Date(date);
		return d.toLocaleDateString('en-US', { 
			month: 'short', 
			day: 'numeric', 
			year: 'numeric' 
		});
	}

	let filteredUsers = $derived(() => {
		let filtered = users;

		// Filter by active tab
		if (activeTab !== 'All') {
			const tab = tabs.find(t => t.label === activeTab);
			if (tab?.role) {
				filtered = filtered.filter(u => u.role === tab.role);
			}
		}

		// Filter by search term
		if (searchTerm.trim()) {
			const term = searchTerm.toLowerCase();
			filtered = filtered.filter(u => 
				u.name?.toLowerCase().includes(term) ||
				u.email?.toLowerCase().includes(term) ||
				u.phone?.toLowerCase().includes(term)
			);
		}

		return filtered;
	});
</script>

<svelte:head>
	<title>Users - GoFright Admin</title>
</svelte:head>

<!-- Main Container - Fixed height, no scroll -->
<div class="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
	<!-- Top Bar with Tabs - Fixed -->
	<div class="bg-white mx-8 mt-8 rounded-3xl shadow-sm px-8 py-4 flex-shrink-0">
		<div class="flex items-center justify-between">
			<!-- Tabs -->
			<div class="flex items-center space-x-1">
				{#each tabs as tab}
					<button
						onclick={() => activeTab = tab.label}
						class="px-5 py-2.5 rounded-xl text-sm font-medium transition-all {activeTab === tab.label ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}"
					>
						{tab.label} <span class="text-gray-400">({tab.count})</span>
					</button>
				{/each}
			</div>

			<!-- Right Actions -->
			<div class="flex items-center space-x-3">
				<!-- Search -->
				<div class="relative">
					<svg class="absolute left-3.5 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
					</svg>
					<input
						type="text"
						placeholder="Search users"
						bind:value={searchTerm}
						class="pl-10 pr-4 py-2 w-64 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
					/>
				</div>

				<!-- Add User Button -->
				<button class="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 text-sm font-medium">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
					</svg>
					Add User
				</button>
			</div>
		</div>
	</div>

	<!-- Content Area - Flex container, no scroll -->
	<div class="flex-1 flex gap-6 px-8 py-6 overflow-hidden">
		<!-- Left Panel - User List - ONLY THIS SCROLLS -->
		<div class="w-[380px] flex-shrink-0 overflow-y-auto pr-2 space-y-4">
			<!-- User Cards -->
			{#if isLoading}
				<div class="bg-white rounded-3xl p-8 text-center">
					<div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
					<p class="text-gray-500">Loading users...</p>
				</div>
			{:else if filteredUsers().length === 0}
				<div class="bg-white rounded-3xl p-8 text-center">
					<svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
					</svg>
					<p class="text-gray-500">No users found</p>
				</div>
			{:else}
				{#each filteredUsers() as user}
					<div
						onclick={() => selectedUser = user}
						class="bg-white rounded-3xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300 flex-shrink-0 border-2 {selectedUser?._id === user._id ? 'border-blue-300 shadow-lg' : 'border-transparent'}"
						role="button"
						tabindex="0"
					>
						<!-- User Header -->
						<div class="flex items-start gap-4 mb-4">
							<!-- Avatar -->
							{#if user.profilePicture}
								<img src={user.profilePicture} alt={user.name} class="w-14 h-14 rounded-full object-cover" />
							{:else}
								<div class="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg" style="background: linear-gradient(135deg, {getRoleColor(user.role)}, {getRoleColor(user.role)}dd);">
									{getInitials(user.name)}
								</div>
							{/if}

							<!-- User Info -->
							<div class="flex-1">
								<h3 class="font-semibold text-gray-900 text-base mb-1">{user.name || 'Unnamed User'}</h3>
								<p class="text-sm text-gray-500 mb-2">{user.email}</p>
								<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style="background-color: {getRoleColor(user.role)}20; color: {getRoleColor(user.role)}">
									<span class="w-1.5 h-1.5 rounded-full" style="background-color: {getRoleColor(user.role)}"></span>
									{formatRole(user.role)}
								</div>
							</div>
						</div>

						<!-- User Details -->
						<div class="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
							<div>
								<p class="text-xs text-gray-500 mb-0.5">Phone</p>
								<p class="text-sm font-medium text-gray-900">{user.phone || 'N/A'}</p>
							</div>
							<div>
								<p class="text-xs text-gray-500 mb-0.5">Joined</p>
								<p class="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</p>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Right Panel - User Details - No scroll -->
		<div class="flex-1 bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col">
			{#if selectedUser}
				<!-- User Profile Header -->
				<div class="p-8 border-b border-gray-100 flex-shrink-0">
					<div class="flex items-start justify-between mb-6">
						<div class="flex items-center gap-6">
							<!-- Large Avatar -->
							{#if selectedUser.profilePicture}
								<img src={selectedUser.profilePicture} alt={selectedUser.name} class="w-24 h-24 rounded-2xl object-cover shadow-lg" />
							{:else}
								<div class="w-24 h-24 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg" style="background: linear-gradient(135deg, {getRoleColor(selectedUser.role)}, {getRoleColor(selectedUser.role)}dd);">
									{getInitials(selectedUser.name)}
								</div>
							{/if}

							<!-- User Info -->
							<div>
								<h2 class="text-2xl font-bold text-gray-900 mb-2">{selectedUser.name || 'Unnamed User'}</h2>
								<p class="text-gray-600 mb-3">{selectedUser.email}</p>
								<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium" style="background-color: {getRoleColor(selectedUser.role)}20; color: {getRoleColor(selectedUser.role)}">
									<span class="w-2 h-2 rounded-full" style="background-color: {getRoleColor(selectedUser.role)}"></span>
									{formatRole(selectedUser.role)}
								</div>
							</div>
						</div>

						<!-- Action Button -->
						<button class="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
							<svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
								<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
							</svg>
						</button>
					</div>
				</div>

				<!-- User Details Content - Scrollable -->
				<div class="flex-1 overflow-y-auto p-8 space-y-6">
					<!-- Contact Information -->
					<div>
						<h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
							<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
							</svg>
							Contact Information
						</h3>
						<div class="grid grid-cols-2 gap-4">
							<div class="bg-gray-50 rounded-2xl p-4">
								<p class="text-xs text-gray-500 mb-1">Email Address</p>
								<p class="text-sm font-semibold text-gray-900">{selectedUser.email || 'N/A'}</p>
							</div>
							<div class="bg-gray-50 rounded-2xl p-4">
								<p class="text-xs text-gray-500 mb-1">Phone Number</p>
								<p class="text-sm font-semibold text-gray-900">{selectedUser.phone || 'N/A'}</p>
							</div>
						</div>
					</div>

					<!-- Account Information -->
					<div>
						<h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
							<svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
							</svg>
							Account Information
						</h3>
						<div class="grid grid-cols-2 gap-4">
							<div class="bg-gray-50 rounded-2xl p-4">
								<p class="text-xs text-gray-500 mb-1">User ID</p>
								<p class="text-sm font-semibold text-gray-900 font-mono">{selectedUser._id?.slice(-8) || 'N/A'}</p>
							</div>
							<div class="bg-gray-50 rounded-2xl p-4">
								<p class="text-xs text-gray-500 mb-1">Account Type</p>
								<p class="text-sm font-semibold text-gray-900">{formatRole(selectedUser.role)}</p>
							</div>
							<div class="bg-gray-50 rounded-2xl p-4">
								<p class="text-xs text-gray-500 mb-1">Joined Date</p>
								<p class="text-sm font-semibold text-gray-900">{formatDate(selectedUser.createdAt)}</p>
							</div>
							<div class="bg-gray-50 rounded-2xl p-4">
								<p class="text-xs text-gray-500 mb-1">Status</p>
								<div class="inline-flex items-center gap-1.5">
									<span class="w-2 h-2 rounded-full bg-green-500"></span>
									<span class="text-sm font-semibold text-green-700">Active</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Actions -->
					<div>
						<h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
							<svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
							</svg>
							Quick Actions
						</h3>
						<div class="flex flex-wrap gap-3">
							<button 
								onclick={editUser}
								class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
								</svg>
								Edit User
							</button>
							<button 
								onclick={resetPassword}
								class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
								</svg>
								Reset Password
							</button>
							<button 
								onclick={viewActivity}
								class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
								</svg>
								View Activity
							</button>
							<button 
								onclick={suspendAccount}
								class="px-4 py-2 {selectedUser?.isActive ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-green-100 text-green-700 hover:bg-green-200'} rounded-xl transition-colors text-sm font-medium flex items-center gap-2"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
								</svg>
								{selectedUser?.isActive ? 'Suspend Account' : 'Activate Account'}
							</button>
							<button 
								onclick={deleteUser}
								class="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors text-sm font-medium flex items-center gap-2"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
								</svg>
								Delete User
							</button>
						</div>
					</div>
				</div>
			{:else}
				<div class="h-full flex items-center justify-center">
					<div class="text-center">
						<svg class="w-24 h-24 mx-auto mb-6 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
						</svg>
						<p class="text-xl font-semibold text-gray-900 mb-2">Select a user</p>
						<p class="text-gray-500">Click on a user to view details</p>
					</div>
				</div>
			{/if}
		</div>
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
