<script lang="ts">
	import { onMount } from 'svelte';
	import NotificationModal from '$lib/components/NotificationModal.svelte';

	// State
	let loading = $state(true);
	let invoices: any[] = $state([]);
	let filteredInvoices: any[] = $state([]);
	let searchQuery = $state('');
	let statusFilter = $state('all');
	let notification = $state({ show: false, message: '', type: 'info' });

	// Stats
	let stats = $state({
		total: 0,
		paid: 0,
		pending: 0,
		overdue: 0,
		totalAmount: 0
	});

	onMount(async () => {
		await loadInvoices();
	});

	async function loadInvoices() {
		loading = true;
		try {
			const response = await fetch('/api/customer/invoices');
			
			if (!response.ok) {
				throw new Error('Failed to load invoices');
			}

			const data = await response.json();
			invoices = data.invoices || [];
			stats = data.stats || stats;
			filterInvoices();
		} catch (error) {
			console.error('Load invoices error:', error);
			showNotification('Failed to load invoices', 'error');
		} finally {
			loading = false;
		}
	}

	function filterInvoices() {
		let filtered = [...invoices];

		// Filter by status
		if (statusFilter !== 'all') {
			filtered = filtered.filter(i => i.status === statusFilter);
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(i =>
				i.invoiceNumber?.toLowerCase().includes(query) ||
				i.trackingNumber?.toLowerCase().includes(query)
			);
		}

		filteredInvoices = filtered;
	}

	$effect(() => {
		searchQuery;
		statusFilter;
		filterInvoices();
	});

	function downloadInvoice(invoice: any) {
		showNotification('Downloading invoice...', 'info');
		// In production, this would download the actual PDF
		setTimeout(() => {
			showNotification('Invoice downloaded successfully', 'success');
		}, 1500);
	}

	function payInvoice(invoice: any) {
		showNotification('Redirecting to payment gateway...', 'info');
		// In production, this would redirect to payment provider (Paystack/Flutterwave)
		setTimeout(() => {
			window.location.href = `/customer/payment/${invoice._id}`;
		}, 1500);
	}

	function showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info') {
		notification = { show: true, message, type };
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'paid':
				return 'bg-green-100 text-green-800';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'overdue':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
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
		<h1 class="text-2xl font-bold text-gray-900">Invoices & Payments</h1>
		<p class="text-gray-600">Manage your billing and payment history</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
		<div class="bg-white rounded-lg shadow-sm p-4">
			<p class="text-sm text-gray-600">Total Invoices</p>
			<p class="text-2xl font-bold text-gray-900">{stats.total}</p>
		</div>

		<div class="bg-white rounded-lg shadow-sm p-4">
			<p class="text-sm text-gray-600">Paid</p>
			<p class="text-2xl font-bold text-green-600">{stats.paid}</p>
		</div>

		<div class="bg-white rounded-lg shadow-sm p-4">
			<p class="text-sm text-gray-600">Pending</p>
			<p class="text-2xl font-bold text-yellow-600">{stats.pending}</p>
		</div>

		<div class="bg-white rounded-lg shadow-sm p-4">
			<p class="text-sm text-gray-600">Total Amount</p>
			<p class="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
		</div>
	</div>

	<!-- Filters -->
	<div class="bg-white rounded-lg shadow-sm p-4 mb-6">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<!-- Search -->
			<div>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search by invoice or tracking number..."
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
				/>
			</div>

			<!-- Status Filter -->
			<div>
				<select
					bind:value={statusFilter}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
				>
					<option value="all">All Invoices</option>
					<option value="paid">Paid</option>
					<option value="pending">Pending</option>
					<option value="overdue">Overdue</option>
				</select>
			</div>
		</div>
	</div>

	<!-- Invoices Table -->
	<div class="bg-white rounded-lg shadow-sm overflow-hidden">
		{#if loading}
			<div class="flex items-center justify-center h-64">
				<div class="text-center">
					<svg class="animate-spin h-12 w-12 text-orange-600 mx-auto mb-4" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					<p class="text-gray-600">Loading invoices...</p>
				</div>
			</div>
		{:else if filteredInvoices.length === 0}
			<div class="text-center py-12">
				<svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				<p class="text-gray-600">No invoices found</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking #</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each filteredInvoices as invoice}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
									{invoice.invoiceNumber}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
									{invoice.trackingNumber}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
									{formatDate(invoice.createdAt)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
									{formatCurrency(invoice.amount)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(invoice.status)}">
										{invoice.status}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm">
									<div class="flex gap-2">
										<button
											onclick={() => downloadInvoice(invoice)}
											class="text-blue-600 hover:text-blue-700 font-medium"
										>
											Download
										</button>
										{#if invoice.status === 'pending' || invoice.status === 'overdue'}
											<button
												onclick={() => payInvoice(invoice)}
												class="text-green-600 hover:text-green-700 font-medium"
											>
												Pay Now
											</button>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
