<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/card/card.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectValue
	} from '$lib/components/ui/select';
	import Alert from '$lib/components/ui/alert/alert.svelte';

	let formData = $state({
		origin: '',
		destination: '',
		cargoType: 'general',
		weight: '',
		dimensions: {
			length: '',
			width: '',
			height: ''
		},
		description: '',
		estimatedValue: '',
		sender: {
			name: '',
			phone: '',
			email: '',
			address: ''
		},
		receiver: {
			name: '',
			phone: '',
			email: '',
			address: ''
		}
	});

	let isSubmitting = $state(false);
	let error = $state('');
	let successMessage = $state('');

	const cargoTypes = [
		{ value: 'general', label: 'General Cargo' },
		{ value: 'fragile', label: 'Fragile' },
		{ value: 'perishable', label: 'Perishable' },
		{ value: 'hazardous', label: 'Hazardous' },
		{ value: 'electronics', label: 'Electronics' },
		{ value: 'furniture', label: 'Furniture' },
		{ value: 'documents', label: 'Documents' },
		{ value: 'vehicles', label: 'Vehicles' }
	];

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		successMessage = '';
		isSubmitting = true;

		try {
			// Validate required fields
			if (!formData.origin || !formData.destination || !formData.weight) {
				error = 'Please fill in all required fields';
				isSubmitting = false;
				return;
			}

			// Prepare data
			const requestData = {
				origin: formData.origin,
				destination: formData.destination,
				cargoType: formData.cargoType,
				weight: parseFloat(formData.weight),
				dimensions: {
					length: parseFloat(formData.dimensions.length) || undefined,
					width: parseFloat(formData.dimensions.width) || undefined,
					height: parseFloat(formData.dimensions.height) || undefined
				},
				description: formData.description || undefined,
				estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
				sender: {
					name: formData.sender.name,
					phone: formData.sender.phone,
					email: formData.sender.email || undefined,
					address: formData.sender.address
				},
				receiver: {
					name: formData.receiver.name,
					phone: formData.receiver.phone,
					email: formData.receiver.email || undefined,
					address: formData.receiver.address
				}
			};

			const response = await fetch('/api/cargo', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestData)
			});

			const data = await response.json();

			if (response.ok) {
				successMessage = `Cargo booked successfully! Tracking ID: ${data.cargo.trackingId}`;
				setTimeout(() => {
					goto(`/cargo/${data.cargo._id}`);
				}, 2000);
			} else {
				error = data.error || 'Failed to book cargo. Please try again.';
			}
		} catch (err) {
			error = 'An error occurred. Please try again.';
			console.error('Booking error:', err);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Book New Cargo - GoFright</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6">
	<!-- Header -->
	<div>
		<Button variant="ghost" on:click={() => goto('/cargo')} class="mb-4">
			← Back to Cargo List
		</Button>
		<h1 class="text-3xl font-bold text-gray-900">Book New Cargo</h1>
		<p class="text-gray-600 mt-1">Fill in the details to create a new shipment</p>
	</div>

	{#if error}
		<Alert variant="destructive">
			<p>{error}</p>
		</Alert>
	{/if}

	{#if successMessage}
		<Alert class="bg-green-50 border-green-200 text-green-800">
			<p>{successMessage}</p>
		</Alert>
	{/if}

	<form on:submit={handleSubmit} class="space-y-6">
		<!-- Shipment Details -->
		<Card class="p-6">
			<h2 class="text-xl font-bold text-gray-900 mb-4">Shipment Details</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<Label for="origin">Origin *</Label>
					<Input
						id="origin"
						type="text"
						bind:value={formData.origin}
						placeholder="City, Country"
						required
					/>
				</div>

				<div>
					<Label for="destination">Destination *</Label>
					<Input
						id="destination"
						type="text"
						bind:value={formData.destination}
						placeholder="City, Country"
						required
					/>
				</div>

				<div>
					<Label for="cargoType">Cargo Type *</Label>
					<Select bind:value={formData.cargoType}>
						<SelectTrigger>
							<SelectValue placeholder="Select cargo type" />
						</SelectTrigger>
						<SelectContent>
							{#each cargoTypes as type}
								<SelectItem value={type.value}>{type.label}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label for="weight">Weight (kg) *</Label>
					<Input
						id="weight"
						type="number"
						step="0.01"
						bind:value={formData.weight}
						placeholder="0.00"
						required
					/>
				</div>

				<div class="md:col-span-2">
					<Label>Dimensions (optional)</Label>
					<div class="grid grid-cols-3 gap-4 mt-2">
						<Input
							type="number"
							step="0.01"
							bind:value={formData.dimensions.length}
							placeholder="Length (cm)"
						/>
						<Input
							type="number"
							step="0.01"
							bind:value={formData.dimensions.width}
							placeholder="Width (cm)"
						/>
						<Input
							type="number"
							step="0.01"
							bind:value={formData.dimensions.height}
							placeholder="Height (cm)"
						/>
					</div>
				</div>

				<div>
					<Label for="estimatedValue">Estimated Value (USD)</Label>
					<Input
						id="estimatedValue"
						type="number"
						step="0.01"
						bind:value={formData.estimatedValue}
						placeholder="0.00"
					/>
				</div>

				<div class="md:col-span-2">
					<Label for="description">Description</Label>
					<Textarea
						id="description"
						bind:value={formData.description}
						placeholder="Describe the cargo contents..."
						rows={3}
					/>
				</div>
			</div>
		</Card>

		<!-- Sender Information -->
		<Card class="p-6">
			<h2 class="text-xl font-bold text-gray-900 mb-4">Sender Information</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<Label for="senderName">Name *</Label>
					<Input
						id="senderName"
						type="text"
						bind:value={formData.sender.name}
						placeholder="Full name"
						required
					/>
				</div>

				<div>
					<Label for="senderPhone">Phone *</Label>
					<Input
						id="senderPhone"
						type="tel"
						bind:value={formData.sender.phone}
						placeholder="+1234567890"
						required
					/>
				</div>

				<div>
					<Label for="senderEmail">Email</Label>
					<Input
						id="senderEmail"
						type="email"
						bind:value={formData.sender.email}
						placeholder="sender@example.com"
					/>
				</div>

				<div class="md:col-span-2">
					<Label for="senderAddress">Address *</Label>
					<Textarea
						id="senderAddress"
						bind:value={formData.sender.address}
						placeholder="Street address, city, postal code"
						rows={2}
						required
					/>
				</div>
			</div>
		</Card>

		<!-- Receiver Information -->
		<Card class="p-6">
			<h2 class="text-xl font-bold text-gray-900 mb-4">Receiver Information</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<Label for="receiverName">Name *</Label>
					<Input
						id="receiverName"
						type="text"
						bind:value={formData.receiver.name}
						placeholder="Full name"
						required
					/>
				</div>

				<div>
					<Label for="receiverPhone">Phone *</Label>
					<Input
						id="receiverPhone"
						type="tel"
						bind:value={formData.receiver.phone}
						placeholder="+1234567890"
						required
					/>
				</div>

				<div>
					<Label for="receiverEmail">Email</Label>
					<Input
						id="receiverEmail"
						type="email"
						bind:value={formData.receiver.email}
						placeholder="receiver@example.com"
					/>
				</div>

				<div class="md:col-span-2">
					<Label for="receiverAddress">Address *</Label>
					<Textarea
						id="receiverAddress"
						bind:value={formData.receiver.address}
						placeholder="Street address, city, postal code"
						rows={2}
						required
					/>
				</div>
			</div>
		</Card>

		<!-- Submit Button -->
		<div class="flex justify-end gap-4">
			<Button
				type="button"
				variant="outline"
				on:click={() => goto('/cargo')}
				disabled={isSubmitting}
			>
				Cancel
			</Button>
			<Button
				type="submit"
				class="bg-[#3A506B] hover:bg-[#1B263B]"
				disabled={isSubmitting}
			>
				{isSubmitting ? 'Booking...' : '📦 Book Cargo'}
			</Button>
		</div>
	</form>
</div>
