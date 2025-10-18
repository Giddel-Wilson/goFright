<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import NotificationModal from '$lib/components/NotificationModal.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';

	let user = $state(authStore.user);
	let isEditing = $state(false);
	let isSaving = $state(false);
	let isLoading = $state(true);

	let profileData = $state<any>({
		user: null,
		stats: null
	});

	let formData = $state({
		name: '',
		email: '',
		phone: '',
		address: '',
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	});

	// Modal states
	let notification = $state({
		show: false,
		type: 'info' as 'success' | 'error' | 'warning' | 'info',
		title: '',
		message: ''
	});

	let confirmLogout = $state(false);

	function showNotification(type: 'success' | 'error' | 'warning' | 'info', message: string, title = '') {
		notification = { show: true, type, message, title };
	}

	onMount(async () => {
		await loadProfile();
	});

	async function loadProfile() {
		isLoading = true;
		try {
			const response = await fetch('/api/admin/profile', {
				credentials: 'include'
			});

			if (response.ok) {
				profileData = await response.json();
				
				console.log('Profile loaded:', profileData);
				console.log('User photoUrl:', profileData.user?.photoUrl);
				
				// Update form data with user data
				formData.name = profileData.user.name || '';
				formData.email = profileData.user.email || '';
				formData.phone = profileData.user.phone || '';
				formData.address = profileData.user.address || '';
			}
		} catch (error) {
			console.error('Failed to load profile:', error);
		} finally {
			isLoading = false;
		}
	}

	async function handleLogout() {
		confirmLogout = true;
	}

	function confirmLogoutAction() {
		authStore.logout();
		goto('/login');
	}

	async function saveProfile() {
		isSaving = true;
		try {
			const response = await fetch('/api/admin/profile', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					name: formData.name,
					email: formData.email,
					phone: formData.phone,
					address: formData.address
				})
			});

			if (response.ok) {
				const data = await response.json();
				profileData.user = data.user;
				
				// Update auth store with new user data
				authStore.updateUser(data.user);
				
				isEditing = false;
				showNotification('success', 'Your profile has been updated successfully!');
			} else {
				const error = await response.json();
				showNotification('error', error.error || 'Failed to update profile');
			}
		} catch (error) {
			console.error('Failed to save profile:', error);
			showNotification('error', 'Failed to update profile. Please try again.');
		} finally {
			isSaving = false;
		}
	}

	async function changePassword() {
		if (formData.newPassword !== formData.confirmPassword) {
			showNotification('error', 'Passwords do not match!', 'Validation Error');
			return;
		}
		
		if (formData.newPassword.length < 6) {
			showNotification('error', 'Password must be at least 6 characters!', 'Validation Error');
			return;
		}

		try {
			const response = await fetch('/api/admin/profile', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					currentPassword: formData.currentPassword,
					newPassword: formData.newPassword
				})
			});

			if (response.ok) {
				formData.currentPassword = '';
				formData.newPassword = '';
				formData.confirmPassword = '';
				showNotification('success', 'Your password has been changed successfully!');
			} else {
				const error = await response.json();
				showNotification('error', error.error || 'Failed to change password');
			}
		} catch (error) {
			console.error('Failed to change password:', error);
			showNotification('error', 'Failed to change password. Please try again.');
		}
	}

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	// Photo upload functionality
	let fileInput: HTMLInputElement;
	let uploadingPhoto = $state(false);

	function triggerPhotoUpload() {
		fileInput?.click();
	}

	async function handlePhotoUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			showNotification('error', 'Please select an image file', 'Invalid File Type');
			return;
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			showNotification('error', 'Image size should be less than 5MB', 'File Too Large');
			return;
		}

		uploadingPhoto = true;

		try {
			// Create FormData
			const formData = new FormData();
			formData.append('photo', file);

			const response = await fetch('/api/admin/profile/photo', {
				method: 'POST',
				credentials: 'include',
				body: formData
			});

			if (response.ok) {
				const data = await response.json();
				
				console.log('Photo upload response:', data);
				
				// Update profile data with the full user object from backend
				if (data.user) {
					profileData.user = data.user;
				} else {
					// Fallback to just updating photoUrl
					profileData.user.photoUrl = data.photoUrl;
				}
				
				// Update auth store with the updated user data
				authStore.updateUser(profileData.user);
				
				showNotification('success', 'Your profile photo has been updated successfully!');
			} else {
				const error = await response.json();
				showNotification('error', error.error || 'Failed to upload photo');
			}
		} catch (error) {
			console.error('Failed to upload photo:', error);
			showNotification('error', 'Failed to upload photo. Please try again.');
		} finally {
			uploadingPhoto = false;
			// Reset file input
			if (target) target.value = '';
		}
	}
</script>

<svelte:head>
	<title>Profile - GoFright Admin</title>
</svelte:head>

<div class="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
	<!-- Header -->
	<div class="mx-8 mt-8 flex-shrink-0">
		<div class="flex items-center justify-between mb-6">
			<div>
				<h1 class="text-3xl font-bold text-gray-900 mb-1">My Profile</h1>
				<p class="text-gray-600">Manage your account settings and preferences</p>
			</div>
			<button 
				onclick={handleLogout}
				class="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium shadow-lg shadow-red-600/30 flex items-center gap-2"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
				</svg>
				Logout
			</button>
		</div>
	</div>

	<!-- Content - Scrollable -->
	<div class="flex-1 overflow-y-auto px-8 pb-8 space-y-6">
		{#if isLoading}
			<div class="flex items-center justify-center h-64">
				<div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
			</div>
		{:else if profileData?.user}
		<!-- Profile Overview Stats Row -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<!-- Profile Summary Card -->
			<div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
				<div class="flex flex-col items-center text-center">
					{#if profileData.user?.photoUrl}
						<img src={profileData.user.photoUrl} alt={profileData.user.name} class="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-blue-50 mb-4" />
					{:else}
						<div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-blue-50 mb-4">
							{getInitials(profileData.user?.name || 'Admin')}
						</div>
					{/if}
					<h3 class="text-lg font-bold text-gray-900 mb-1">{profileData.user?.name || 'Admin User'}</h3>
					<p class="text-sm text-gray-600 mb-3">{profileData.user?.email || ''}</p>
					<div class="flex items-center gap-2">
						<span class="inline-block px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-xs font-medium">
							{profileData.user?.role || 'Admin'}
						</span>
						<span class="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
							<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
							</svg>
							{profileData.user?.isActive ? 'Active' : 'Inactive'}
						</span>
					</div>
					<button 
						onclick={triggerPhotoUpload}
						disabled={uploadingPhoto}
						class="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
					</button>
					<!-- Hidden file input -->
					<input
						type="file"
						bind:this={fileInput}
						onchange={handlePhotoUpload}
						accept="image/*"
						class="hidden"
					/>
				</div>
			</div>

			<!-- Account Stats -->
			<div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
						<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
						</svg>
					</div>
					<div>
						<p class="text-sm text-gray-600">Total Actions</p>
						<p class="text-2xl font-bold text-gray-900">{profileData.stats?.totalActions?.toLocaleString() || '0'}</p>
					</div>
				</div>
				<div class="space-y-2">
					<div class="flex justify-between text-sm">
						<span class="text-gray-600">Shipments Created</span>
						<span class="font-medium text-gray-900">{profileData.stats?.shipmentsCreated?.toLocaleString() || '0'}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-gray-600">Users Managed</span>
						<span class="font-medium text-gray-900">{profileData.stats?.usersManaged?.toLocaleString() || '0'}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-gray-600">Reports Generated</span>
						<span class="font-medium text-gray-900">{profileData.stats?.reportsGenerated?.toLocaleString() || '0'}</span>
					</div>
				</div>
			</div>

			<!-- Last Activity -->
			<div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
						<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
					</div>
					<div>
						<p class="text-sm text-gray-600">Last Login</p>
						<p class="text-lg font-bold text-gray-900">Today</p>
					</div>
				</div>
				<div class="space-y-3">
					<div class="flex items-center gap-2 text-sm">
						<div class="w-2 h-2 bg-green-500 rounded-full"></div>
						<span class="text-gray-600">Current Session</span>
					</div>
					<div class="flex items-center gap-2 text-sm">
						<svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
						</svg>
						<span class="text-gray-600">{profileData.stats?.device || 'Unknown Device'}</span>
					</div>
					<div class="flex items-center gap-2 text-sm">
						<svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
						</svg>
						<span class="text-gray-600">{profileData.stats?.location || 'Unknown'}</span>
					</div>
				</div>
			</div>
		</div>		<!-- Personal Information -->
		<div class="bg-white rounded-3xl shadow-sm p-8">
			<div class="flex items-center justify-between mb-6">
				<div class="flex items-center gap-3">
					<div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
						</svg>
					</div>
					<h3 class="text-xl font-bold text-gray-900">Personal Information</h3>
				</div>
				<button 
					onclick={() => isEditing = !isEditing}
					class="px-4 py-2 {isEditing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} rounded-xl transition-colors text-sm font-medium"
				>
					{isEditing ? 'Cancel' : 'Edit Profile'}
				</button>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
					<input 
						type="text" 
						bind:value={formData.name}
						disabled={!isEditing}
						class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600"
						placeholder="Enter your name"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
					<input 
						type="email" 
						bind:value={formData.email}
						disabled={!isEditing}
						class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600"
						placeholder="Enter your email"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
					<input 
						type="tel" 
						bind:value={formData.phone}
						disabled={!isEditing}
						class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-600"
						placeholder="Enter your phone"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
					<input 
						type="text" 
						value={user?.role || 'admin'} 
						disabled
						class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600"
					/>
				</div>
			</div>

			{#if isEditing}
				<div class="mt-6 pt-6 border-t border-gray-200 flex gap-3">
					<button 
						onclick={saveProfile}
						disabled={isSaving}
						class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
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
					<button 
						onclick={() => isEditing = false}
						class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
					>
						Discard
					</button>
				</div>
			{/if}
		</div>

		<!-- Security & Password -->
		<div class="bg-white rounded-3xl shadow-sm p-8">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center">
					<svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
					</svg>
				</div>
				<h3 class="text-xl font-bold text-gray-900">Security & Password</h3>
			</div>
			
			<div class="grid grid-cols-1 gap-6">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
					<input 
						type="password" 
						bind:value={formData.currentPassword} 
						class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
						placeholder="Enter current password"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
					<input 
						type="password" 
						bind:value={formData.newPassword}
						class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
						placeholder="Enter new password"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
					<input 
						type="password" 
						bind:value={formData.confirmPassword}
						class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
						placeholder="Confirm new password"
					/>
				</div>
			</div>

			<div class="mt-6 pt-6 border-t border-gray-200 flex gap-3">
				<button 
					onclick={changePassword}
					class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20 flex items-center gap-2"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
					</svg>
					Update Password
				</button>
				<button 
					class="px-6 py-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-medium flex items-center gap-2"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/>
					</svg>
					Enable 2FA
				</button>
			</div>
		</div>

		<!-- Recent Activity Log -->
		<div class="bg-white rounded-3xl shadow-sm p-8">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl flex items-center justify-center">
					<svg class="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
				</div>
				<h3 class="text-xl font-bold text-gray-900">Recent Activity</h3>
			</div>

			<div class="space-y-3">
				<div class="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
					<div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
						<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
						</svg>
					</div>
					<div class="flex-1">
						<p class="font-medium text-gray-900">Created new shipment</p>
						<p class="text-sm text-gray-600">Shipment #SH-2024-1234 created for client ABC Corp</p>
						<p class="text-xs text-gray-500 mt-1">2 hours ago</p>
					</div>
				</div>

				<div class="flex items-start gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
					<div class="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
						<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
						</svg>
					</div>
					<div class="flex-1">
						<p class="font-medium text-gray-900">Updated user profile</p>
						<p class="text-sm text-gray-600">Changed contact information and preferences</p>
						<p class="text-xs text-gray-500 mt-1">5 hours ago</p>
					</div>
				</div>

				<div class="flex items-start gap-3 p-4 bg-green-50 rounded-2xl border border-green-100">
					<div class="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
						<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
					</div>
					<div class="flex-1">
						<p class="font-medium text-gray-900">Completed delivery</p>
						<p class="text-sm text-gray-600">Shipment #SH-2024-1180 delivered successfully</p>
						<p class="text-xs text-gray-500 mt-1">1 day ago</p>
					</div>
				</div>

				<div class="flex items-start gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
					<div class="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
						<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
						</svg>
					</div>
					<div class="flex-1">
						<p class="font-medium text-gray-900">Generated report</p>
						<p class="text-sm text-gray-600">Monthly analytics report for October 2025</p>
						<p class="text-xs text-gray-500 mt-1">2 days ago</p>
					</div>
				</div>
			</div>

			<button class="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium">
				View All Activity
			</button>
		</div>
		{:else}
		<!-- Error State -->
		<div class="flex flex-col items-center justify-center h-64">
			<div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
				<svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>
			</div>
			<h3 class="text-lg font-semibold text-gray-900 mb-2">Failed to Load Profile</h3>
			<p class="text-gray-600 mb-4">Unable to load your profile data.</p>
			<button 
				onclick={loadProfile}
				class="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
			>
				Try Again
			</button>
		</div>
		{/if}
	</div>
</div>

<!-- Modals -->
<NotificationModal 
	bind:show={notification.show}
	type={notification.type}
	title={notification.title}
	message={notification.message}
/>

<ConfirmModal
	bind:show={confirmLogout}
	title="Confirm Logout"
	message="Are you sure you want to logout? You will need to login again to access your account."
	confirmText="Logout"
	cancelText="Cancel"
	type="danger"
	onConfirm={confirmLogoutAction}
/>

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
