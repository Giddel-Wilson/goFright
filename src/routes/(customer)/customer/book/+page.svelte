<script lang="ts">
	import { onMount } from 'svelte';
	import NotificationModal from '$lib/components/NotificationModal.svelte';

	// State
	let currentStep = $state(1);
	let loading = $state(false);
	let notification = $state({ show: false, message: '', type: 'info' });

	// Form data
	let bookingData = $state({
		// Sender Information
		senderName: '',
		senderPhone: '',
		senderAddress: '',
		senderCity: '',
		
		// Receiver Information
		receiverName: '',
		receiverPhone: '',
		receiverAddress: '',
		receiverCity: '',
		
		// Cargo Details
		cargoType: 'general',
		weight: '',
		description: '',
		specialInstructions: '',
		
		// Pickup Details
		pickupDate: '',
		pickupTime: '',
		pickupLocation: ''
	});

	let estimatedPrice = $state(0);

	onMount(() => {
		// Set minimum pickup date to tomorrow
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		bookingData.pickupDate = tomorrow.toISOString().split('T')[0];
	});

	function nextStep() {
		if (validateCurrentStep()) {
			if (currentStep === 3) {
				calculatePrice();
			}
			currentStep++;
		}
	}

	function prevStep() {
		currentStep--;
	}

	function validateCurrentStep(): boolean {
		switch (currentStep) {
			case 1:
				if (!bookingData.senderName || !bookingData.senderPhone || !bookingData.senderAddress || !bookingData.senderCity) {
					showNotification('Please fill in all sender information', 'warning');
					return false;
				}
				break;
			case 2:
				if (!bookingData.receiverName || !bookingData.receiverPhone || !bookingData.receiverAddress || !bookingData.receiverCity) {
					showNotification('Please fill in all receiver information', 'warning');
					return false;
				}
				break;
			case 3:
				if (!bookingData.weight) {
					showNotification('Please enter cargo weight', 'warning');
					return false;
				}
				break;
			case 4:
				if (!bookingData.pickupDate || !bookingData.pickupTime) {
					showNotification('Please select pickup date and time', 'warning');
					return false;
				}
				break;
		}
		return true;
	}

	function calculatePrice() {
		// Simple price calculation based on weight and distance
		const weight = parseFloat(bookingData.weight) || 0;
		const basePrice = 5000; // Base price in Naira
		const pricePerKg = 500;
		
		estimatedPrice = basePrice + (weight * pricePerKg);
	}

	async function submitBooking() {
		if (!validateCurrentStep()) return;

		loading = true;
		try {
			const response = await fetch('/api/customer/bookings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(bookingData)
			});

			if (!response.ok) {
				throw new Error('Failed to create booking');
			}

			const data = await response.json();
			showNotification(`Booking created successfully! Tracking: ${data.trackingNumber}`, 'success');
			
			// Redirect to shipments page after 2 seconds
			setTimeout(() => {
				window.location.href = '/customer/shipments';
			}, 2000);
		} catch (error) {
			console.error('Booking error:', error);
			showNotification('Failed to create booking. Please try again.', 'error');
		} finally {
			loading = false;
		}
	}

	function showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info') {
		notification = { show: true, message, type };
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-NG', {
			style: 'currency',
			currency: 'NGN'
		}).format(amount);
	}
</script>

<NotificationModal bind:show={notification.show} message={notification.message} type={notification.type} />

<div class="p-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900">Book New Cargo</h1>
		<p class="text-gray-600">Fill in the details to create a new cargo booking</p>
	</div>

	<!-- Progress Steps -->
	<div class="bg-white rounded-lg shadow-sm p-6 mb-6">
		<div class="flex items-center justify-between mb-8">
			{#each [
				{ num: 1, label: 'Sender Info' },
				{ num: 2, label: 'Receiver Info' },
				{ num: 3, label: 'Cargo Details' },
				{ num: 4, label: 'Pickup' },
				{ num: 5, label: 'Review' }
			] as step}
				<div class="flex items-center {step.num < 5 ? 'flex-1' : ''}">
					<div class="flex flex-col items-center">
						<div class="w-10 h-10 rounded-full flex items-center justify-center {currentStep >= step.num ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'} font-semibold">
							{step.num}
						</div>
						<span class="text-xs mt-1 {currentStep >= step.num ? 'text-orange-600' : 'text-gray-500'}">{step.label}</span>
					</div>
					{#if step.num < 5}
						<div class="flex-1 h-1 mx-2 {currentStep > step.num ? 'bg-orange-600' : 'bg-gray-200'}"></div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Step Content -->
		<div class="max-w-2xl mx-auto">
			{#if currentStep === 1}
				<!-- Step 1: Sender Information -->
				<div class="space-y-4">
					<h2 class="text-xl font-semibold text-gray-900 mb-4">Sender Information</h2>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
							<input
								type="text"
								bind:value={bookingData.senderName}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
								placeholder="John Doe"
								required
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
							<input
								type="tel"
								bind:value={bookingData.senderPhone}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
								placeholder="+234 800 000 0000"
								required
							/>
						</div>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Address *</label>
						<textarea
							bind:value={bookingData.senderAddress}
							rows="3"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
							placeholder="123 Main Street, Area Name"
							required
						></textarea>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">City *</label>
						<input
							type="text"
							bind:value={bookingData.senderCity}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
							placeholder="Lagos"
							required
						/>
					</div>
				</div>

			{:else if currentStep === 2}
				<!-- Step 2: Receiver Information -->
				<div class="space-y-4">
					<h2 class="text-xl font-semibold text-gray-900 mb-4">Receiver Information</h2>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
							<input
								type="text"
								bind:value={bookingData.receiverName}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
								placeholder="Jane Smith"
								required
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
							<input
								type="tel"
								bind:value={bookingData.receiverPhone}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
								placeholder="+234 800 000 0000"
								required
							/>
						</div>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Address *</label>
						<textarea
							bind:value={bookingData.receiverAddress}
							rows="3"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
							placeholder="456 Market Road, Area Name"
							required
						></textarea>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">City *</label>
						<input
							type="text"
							bind:value={bookingData.receiverCity}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
							placeholder="Abuja"
							required
						/>
					</div>
				</div>

			{:else if currentStep === 3}
				<!-- Step 3: Cargo Details -->
				<div class="space-y-4">
					<h2 class="text-xl font-semibold text-gray-900 mb-4">Cargo Details</h2>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Cargo Type</label>
						<select
							bind:value={bookingData.cargoType}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
						>
							<option value="general">General Cargo</option>
							<option value="fragile">Fragile Items</option>
							<option value="electronics">Electronics</option>
							<option value="documents">Documents</option>
							<option value="perishable">Perishable Goods</option>
							<option value="hazardous">Hazardous Materials</option>
							<option value="liquid">Liquid</option>
							<option value="other">Other</option>
						</select>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Weight (kg) *</label>
						<input
							type="number"
							bind:value={bookingData.weight}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
							placeholder="50"
							min="0.1"
							step="0.1"
							required
						/>
						<p class="text-xs text-gray-500 mt-1">Enter the total weight of your cargo in kilograms</p>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Cargo Description</label>
						<textarea
							bind:value={bookingData.description}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
							rows="3"
							placeholder="Describe your cargo"
						></textarea>
					</div>
				</div>
			{:else if currentStep === 4}
				<!-- Step 4: Pickup Details -->
				<div class="space-y-4">
					<h2 class="text-xl font-semibold text-gray-900 mb-4">Pickup Scheduling</h2>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Pickup Date *</label>
							<input
								type="date"
								bind:value={bookingData.pickupDate}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
								required
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Pickup Time *</label>
							<select
								bind:value={bookingData.pickupTime}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
								required
							>
								<option value="">Select time</option>
								<option value="08:00-10:00">08:00 AM - 10:00 AM</option>
								<option value="10:00-12:00">10:00 AM - 12:00 PM</option>
								<option value="12:00-14:00">12:00 PM - 02:00 PM</option>
								<option value="14:00-16:00">02:00 PM - 04:00 PM</option>
								<option value="16:00-18:00">04:00 PM - 06:00 PM</option>
							</select>
						</div>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
						<input
							type="text"
							bind:value={bookingData.pickupLocation}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
							placeholder="Same as sender address"
						/>
						<p class="text-sm text-gray-500 mt-1">Leave blank to use sender address</p>
					</div>
				</div>

			{:else if currentStep === 5}
				<!-- Step 5: Review & Confirm -->
				<div class="space-y-6">
					<h2 class="text-xl font-semibold text-gray-900 mb-4">Review Your Booking</h2>

					<!-- Price Estimate -->
					<div class="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm text-gray-600">Estimated Shipping Cost</p>
								<p class="text-3xl font-bold text-orange-600">{formatCurrency(estimatedPrice)}</p>
							</div>
							<div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
								<svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
						</div>
					</div>

					<!-- Booking Summary -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<!-- Sender -->
						<div class="bg-gray-50 rounded-lg p-4">
							<h3 class="font-semibold text-gray-900 mb-2">Sender</h3>
							<p class="text-sm text-gray-600">{bookingData.senderName}</p>
							<p class="text-sm text-gray-600">{bookingData.senderPhone}</p>
							<p class="text-sm text-gray-600">{bookingData.senderAddress}, {bookingData.senderCity}</p>
						</div>

						<!-- Receiver -->
						<div class="bg-gray-50 rounded-lg p-4">
							<h3 class="font-semibold text-gray-900 mb-2">Receiver</h3>
							<p class="text-sm text-gray-600">{bookingData.receiverName}</p>
							<p class="text-sm text-gray-600">{bookingData.receiverPhone}</p>
							<p class="text-sm text-gray-600">{bookingData.receiverAddress}, {bookingData.receiverCity}</p>
						</div>
					</div>

					<!-- Cargo Info -->
					<div class="bg-gray-50 rounded-lg p-4">
						<h3 class="font-semibold text-gray-900 mb-2">Cargo Information</h3>
						<div class="grid grid-cols-2 gap-2 text-sm">
							<div><span class="text-gray-600">Type:</span> <span class="font-medium">{bookingData.cargoType}</span></div>
							<div><span class="text-gray-600">Weight:</span> <span class="font-medium">{bookingData.weight} kg</span></div>
							{#if bookingData.description}
								<div class="col-span-2"><span class="text-gray-600">Description:</span> <span class="font-medium">{bookingData.description}</span></div>
							{/if}
						</div>
						{#if bookingData.specialInstructions}
							<div class="mt-2">
								<span class="text-gray-600 text-sm">Special Instructions:</span>
								<p class="text-sm text-gray-800 mt-1">{bookingData.specialInstructions}</p>
							</div>
						{/if}
					</div>					<!-- Pickup -->
					<div class="bg-gray-50 rounded-lg p-4">
						<h3 class="font-semibold text-gray-900 mb-2">Pickup Schedule</h3>
						<p class="text-sm text-gray-600">Date: {bookingData.pickupDate}</p>
						<p class="text-sm text-gray-600">Time: {bookingData.pickupTime}</p>
						<p class="text-sm text-gray-600">Location: {bookingData.pickupLocation || 'Same as sender address'}</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- Navigation Buttons -->
		<div class="flex justify-between mt-8">
			<button
				onclick={prevStep}
				disabled={currentStep === 1}
				class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				← Previous
			</button>

			{#if currentStep < 5}
				<button
					onclick={nextStep}
					class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
				>
					Next →
				</button>
			{:else}
				<button
					onclick={submitBooking}
					disabled={loading}
					class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if loading}
						<div class="flex items-center gap-2">
							<svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Creating Booking...
						</div>
					{:else}
						Confirm Booking
					{/if}
				</button>
			{/if}
		</div>
	</div>
</div>
