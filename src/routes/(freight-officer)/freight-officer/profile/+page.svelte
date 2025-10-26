<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import NotificationModal from '$lib/components/NotificationModal.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';

	// State
	let user = $derived(authStore.user);
	let profileUser = $state<any>(null); // Full user data from profile API including createdAt
	let loading = $state(false);
	let notification = $state({ show: false, message: '', type: 'info' });
	let confirmLogout = $state(false);

	// Form data
	let profileForm = $state({
		name: '',
		email: '',
		phone: '',
		department: '',
		// Demographics
		gender: '',
		dateOfBirth: '',
		nationality: '',
		stateOfOrigin: '',
		city: '',
		state: ''
	});

	let passwordForm = $state({
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	});

	let photoFile: File | null = null;
	let photoPreview = $state('');

	// Recent activity (mock data)
	let recentActivity = $state([
		{ action: 'Created shipment', details: 'TRK-2024-000123', timestamp: '2 hours ago' },
		{ action: 'Updated status', details: 'TRK-2024-000122 to In Transit', timestamp: '5 hours ago' },
		{ action: 'Generated report', details: 'Delivery Report for Jan 2024', timestamp: '1 day ago' },
		{ action: 'Created shipment', details: 'TRK-2024-000121', timestamp: '2 days ago' }
	]);

	onMount(async () => {
		// Load profile from API to ensure latest fields (including demographics)
		loading = true;
		try {
			const res = await fetch('/api/freight-officer/profile', { credentials: 'include' });
			if (res.ok) {
				const data = await res.json();
				const u = data.user;
				profileUser = u; // Store full user data including createdAt
				profileForm.name = u.name || '';
				profileForm.email = u.email || '';
				profileForm.phone = u.phone || '';
				profileForm.department = u.department || 'Logistics';
				profileForm.gender = u.gender || '';
				profileForm.dateOfBirth = u.dateOfBirth ? (new Date(u.dateOfBirth)).toISOString().split('T')[0] : '';
				profileForm.nationality = u.nationality || '';
				profileForm.stateOfOrigin = u.stateOfOrigin || '';
				profileForm.city = u.city || '';
				profileForm.state = u.state || '';
				// Update preview/photo if present
				if (u.photoUrl) photoPreview = u.photoUrl;
			}
		} catch (err) {
			console.error('Failed to load freight officer profile:', err);
			showNotification('Failed to load profile', 'error');
		} finally {
			loading = false;
		}
	});

	function handlePhotoChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			photoFile = input.files[0];
			const reader = new FileReader();
			reader.onload = (e) => {
				photoPreview = e.target?.result as string;
			};
			reader.readAsDataURL(photoFile);
		}
	}

	async function uploadPhoto() {
		if (!photoFile) {
			showNotification('Please select a photo first', 'warning');
			return;
		}

		loading = true;
		try {
			const formData = new FormData();
			formData.append('photo', photoFile);

			const response = await fetch('/api/freight-officer/profile/photo', {
				method: 'POST',
				credentials: 'include',
				body: formData
			});

			if (!response.ok) {
				throw new Error('Failed to upload photo');
			}

			const data = await response.json();
			
			// Update auth store and reload user data
			await authStore.loadUser();
			
			showNotification('Profile photo updated successfully', 'success');
			photoFile = null;
			photoPreview = data.user.photoUrl;
		} catch (error) {
			console.error('Photo upload error:', error);
			showNotification('Failed to upload photo', 'error');
		} finally {
			loading = false;
		}
	}

	async function updateProfile() {
		loading = true;
		try {
			// If a new photo is selected but not uploaded, upload it first so photoUrl exists on the user
			if (photoFile) {
				await uploadPhoto();
			}
			const response = await fetch('/api/freight-officer/profile', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(profileForm)
			});

			if (!response.ok) {
				throw new Error('Failed to update profile');
			}

			const data = await response.json();
			
			// Update auth store and reload user data
			await authStore.loadUser();
			
			showNotification('Profile updated successfully', 'success');
		} catch (error) {
			console.error('Profile update error:', error);
			showNotification('Failed to update profile', 'error');
		} finally {
			loading = false;
		}
	}

	async function changePassword() {
		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			showNotification('Passwords do not match', 'error');
			return;
		}

		if (passwordForm.newPassword.length < 6) {
			showNotification('Password must be at least 6 characters', 'error');
			return;
		}

		loading = true;
		try {
			const response = await fetch('/api/freight-officer/profile/password', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					currentPassword: passwordForm.currentPassword,
					newPassword: passwordForm.newPassword
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to change password');
			}

			showNotification('Password changed successfully', 'success');
			passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
		} catch (error: any) {
			console.error('Password change error:', error);
			showNotification(error.message || 'Failed to change password', 'error');
		} finally {
			loading = false;
		}
	}

	function handleLogout() {
		confirmLogout = true;
	}

	async function confirmLogoutAction() {
		await authStore.logout();
		window.location.href = '/login';
	}

	function showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info') {
		notification = { show: true, message, type };
	}

// Format a createdAt string to 'Mon YYYY' (e.g., 'Jan 2024') with safe fallbacks
function formatMemberSince(dateStr?: string) {
	if (!dateStr) return '-';
 	const d = new Date(dateStr);
 	if (isNaN(d.getTime())) return '-';
	return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}
</script>

<NotificationModal bind:show={notification.show} message={notification.message} type={notification.type} />
<ConfirmModal
	bind:show={confirmLogout}
	title="Confirm Logout"
	message="Are you sure you want to logout?"
	confirmText="Logout"
	onConfirm={confirmLogoutAction}
	mode="danger"
/>

<div class="p-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900">My Profile</h1>
		<p class="text-gray-600">Manage your account settings and preferences</p>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Left Column - Profile Photo & Info -->
		<div class="space-y-6">
			<!-- Profile Photo -->
			<div class="bg-white rounded-lg shadow-sm p-6">
				<h2 class="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h2>
				
				<div class="flex flex-col items-center">
					<div class="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center mb-4">
						{#if photoPreview}
							<img src={photoPreview} alt="Preview" class="w-full h-full object-cover" />
						{:else if user?.photoUrl}
							<img src={user.photoUrl} alt={user.name} class="w-full h-full object-cover" />
						{:else}
							<span class="text-4xl text-white font-bold">
								{user?.name?.charAt(0) || 'U'}
							</span>
						{/if}
					</div>

					<input
						type="file"
						accept="image/*"
						onchange={handlePhotoChange}
						class="hidden"
						id="photo-upload"
					/>
					
					<label
						for="photo-upload"
						class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-center mb-2"
					>
						Choose Photo
					</label>

					{#if photoFile}
						<button
							onclick={uploadPhoto}
							disabled={loading}
							class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
						>
							{loading ? 'Uploading...' : 'Upload Photo'}
						</button>
					{/if}
				</div>
			</div>

			<!-- Quick Stats -->
			<div class="bg-white rounded-lg shadow-sm p-6">
				<h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
				<div class="space-y-3">
					<div class="flex justify-between items-center">
						<span class="text-sm text-gray-600">Role</span>
						<span class="text-sm font-semibold text-gray-900 capitalize">{user?.role}</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-sm text-gray-600">Member Since</span>
						<span class="text-sm font-semibold text-gray-900">{formatMemberSince(profileUser?.createdAt)}</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-sm text-gray-600">Shipments Handled</span>
						<span class="text-sm font-semibold text-gray-900">127</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-sm text-gray-600">Active Tasks</span>
						<span class="text-sm font-semibold text-gray-900">8</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Middle Column - Profile & Password Forms -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Personal Information -->
			<div class="bg-white rounded-lg shadow-sm p-6">
				<h2 class="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
				
				<form onsubmit={(e) => { e.preventDefault(); updateProfile(); }} class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
							<input
								type="text"
								bind:value={profileForm.name}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								required
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
							<input
								type="email"
								bind:value={profileForm.email}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								required
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
							<input
								type="tel"
								bind:value={profileForm.phone}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
							<input
								type="text"
								bind:value={profileForm.department}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Gender</label>
							<select
								bind:value={profileForm.gender}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							>
								<option value="">Select gender</option>
								<option value="male">Male</option>
								<option value="female">Female</option>
								<option value="other">Other</option>
								<option value="prefer_not_to_say">Prefer not to say</option>
							</select>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
							<input
								type="date"
								bind:value={profileForm.dateOfBirth}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
							<input
								type="text"
								bind:value={profileForm.nationality}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								placeholder="e.g., Nigerian"
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">State of Origin</label>
							<input
								type="text"
								bind:value={profileForm.stateOfOrigin}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">City</label>
							<input
								type="text"
								bind:value={profileForm.city}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
							<input
								type="text"
								bind:value={profileForm.state}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							/>
						</div>
					</div>

					<div class="flex justify-end">
						<button
							type="submit"
							disabled={loading}
							class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
						>
							{loading ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
				</form>
			</div>

			<!-- Change Password -->
			<div class="bg-white rounded-lg shadow-sm p-6">
				<h2 class="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
				
				<form onsubmit={(e) => { e.preventDefault(); changePassword(); }} class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
						<input
							type="password"
							bind:value={passwordForm.currentPassword}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							required
						/>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
							<input
								type="password"
								bind:value={passwordForm.newPassword}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								required
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
							<input
								type="password"
								bind:value={passwordForm.confirmPassword}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
								required
							/>
						</div>
					</div>

					<div class="flex justify-end">
						<button
							type="submit"
							disabled={loading}
							class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
						>
							{loading ? 'Changing...' : 'Change Password'}
						</button>
					</div>
				</form>
			</div>

			<!-- Recent Activity -->
			<div class="bg-white rounded-lg shadow-sm p-6">
				<h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
				
				<div class="space-y-3">
					{#each recentActivity as activity}
						<div class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
							<div class="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
							<div class="flex-1">
								<p class="text-sm font-medium text-gray-900">{activity.action}</p>
								<p class="text-xs text-gray-600">{activity.details}</p>
							</div>
							<span class="text-xs text-gray-500">{activity.timestamp}</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Danger Zone -->
			<div class="bg-white rounded-lg shadow-sm p-6 border-2 border-red-200">
				<h2 class="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
				<p class="text-sm text-gray-600 mb-4">Irreversible actions that affect your account</p>
				
				<button
					onclick={handleLogout}
					class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
				>
					Logout
				</button>
			</div>
		</div>
	</div>
</div>
