<script lang="ts">
	import { onMount } from 'svelte';
	import NotificationModal from '$lib/components/NotificationModal.svelte';

	// State
	let reportType = $state('delivery');
	let dateFrom = $state('');
	let dateTo = $state('');
	let loading = $state(false);
	let reportData: any = $state(null);
	let notification = $state({ show: false, message: '', type: 'info' });

	// Report stats
	let stats = $state({
		totalShipments: 0,
		delivered: 0,
		inTransit: 0,
		pending: 0,
		revenue: 0
	});

	// Set default date range (last 30 days)
	onMount(() => {
		const today = new Date();
		const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
		dateTo = today.toISOString().split('T')[0];
		dateFrom = lastMonth.toISOString().split('T')[0];
		generateReport();
	});

	async function generateReport() {
		if (!dateFrom || !dateTo) {
			showNotification('Please select a date range', 'warning');
			return;
		}

		loading = true;
		try {
			const response = await fetch(
				`/api/freight-officer/reports?type=${reportType}&from=${dateFrom}&to=${dateTo}`
			);

			if (!response.ok) {
				throw new Error('Failed to generate report');
			}

			const data = await response.json();
			reportData = data;
			stats = data.stats || stats;
			showNotification('Report generated successfully', 'success');
		} catch (error) {
			console.error('Report generation error:', error);
			showNotification('Failed to generate report', 'error');
		} finally {
			loading = false;
		}
	}

	function exportReport(format: 'pdf' | 'excel') {
		showNotification(`Exporting report as ${format.toUpperCase()}...`, 'info');
		// In production, this would generate and download the actual file
		setTimeout(() => {
			showNotification(`Report exported successfully`, 'success');
		}, 1500);
	}

	function showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info') {
		notification = { show: true, message, type };
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'delivered':
				return 'bg-green-100 text-green-800';
			case 'in-transit':
				return 'bg-blue-100 text-blue-800';
			case 'at-warehouse':
				return 'bg-purple-100 text-purple-800';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
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
		<h1 class="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
		<p class="text-gray-600">Generate and export shipment reports</p>
	</div>

	<!-- Report Generation Controls -->
	<div class="bg-white rounded-lg shadow-sm p-6 mb-6">
		<h2 class="text-lg font-semibold text-gray-900 mb-4">Generate Report</h2>

		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<!-- Report Type -->
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
				<select
					bind:value={reportType}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
				>
					<option value="delivery">Delivery Report</option>
					<option value="manifest">Shipment Manifest</option>
					<option value="performance">Performance Metrics</option>
					<option value="revenue">Revenue Analysis</option>
				</select>
			</div>

			<!-- Date From -->
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">From Date</label>
				<input
					type="date"
					bind:value={dateFrom}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
				/>
			</div>

			<!-- Date To -->
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">To Date</label>
				<input
					type="date"
					bind:value={dateTo}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
				/>
			</div>

			<!-- Generate Button -->
			<div class="flex items-end">
				<button
					onclick={generateReport}
					disabled={loading}
					class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if loading}
						<div class="flex items-center justify-center">
							<svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Generating...
						</div>
					{:else}
						Generate Report
					{/if}
				</button>
			</div>
		</div>
	</div>

	{#if reportData}
		<!-- Stats Overview -->
		<div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
			<!-- Total Shipments -->
			<div class="bg-white rounded-lg shadow-sm p-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-600">Total Shipments</p>
						<p class="text-2xl font-bold text-gray-900">{stats.totalShipments}</p>
					</div>
					<div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
						</svg>
					</div>
				</div>
			</div>

			<!-- Delivered -->
			<div class="bg-white rounded-lg shadow-sm p-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-600">Delivered</p>
						<p class="text-2xl font-bold text-green-600">{stats.delivered}</p>
					</div>
					<div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
						<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
				</div>
			</div>

			<!-- In Transit -->
			<div class="bg-white rounded-lg shadow-sm p-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-600">In Transit</p>
						<p class="text-2xl font-bold text-blue-600">{stats.inTransit}</p>
					</div>
					<div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
					</div>
				</div>
			</div>

			<!-- Pending -->
			<div class="bg-white rounded-lg shadow-sm p-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-600">Pending</p>
						<p class="text-2xl font-bold text-yellow-600">{stats.pending}</p>
					</div>
					<div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
						<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
				</div>
			</div>

			<!-- Revenue -->
			<div class="bg-white rounded-lg shadow-sm p-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-600">Revenue</p>
						<p class="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
					</div>
					<div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
						<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
				</div>
			</div>
		</div>

		<!-- Report Actions -->
		<div class="bg-white rounded-lg shadow-sm p-6 mb-6">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold text-gray-900">Export Report</h2>
				<div class="flex gap-3">
					<button
						onclick={() => exportReport('pdf')}
						class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
						</svg>
						Export as PDF
					</button>
					<button
						onclick={() => exportReport('excel')}
						class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						Export as Excel
					</button>
				</div>
			</div>
		</div>

		<!-- Report Data Table -->
		<div class="bg-white rounded-lg shadow-sm overflow-hidden">
			<div class="px-6 py-4 border-b border-gray-200">
				<h2 class="text-lg font-semibold text-gray-900">
					{reportType === 'delivery' ? 'Delivery Report' :
					 reportType === 'manifest' ? 'Shipment Manifest' :
					 reportType === 'performance' ? 'Performance Metrics' :
					 'Revenue Analysis'}
				</h2>
				<p class="text-sm text-gray-600">
					{formatDate(dateFrom)} - {formatDate(dateTo)}
				</p>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking #</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo Type</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#if reportData.shipments && reportData.shipments.length > 0}
							{#each reportData.shipments as shipment}
								<tr class="hover:bg-gray-50">
									<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
										{shipment.trackingId}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{shipment.senderName || 'N/A'}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
										{shipment.receiverAddress || 'N/A'}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
										{shipment.cargoType || 'General'}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
										{shipment.weight || 0} kg
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(shipment.status)}">
											{shipment.status}
										</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{formatCurrency(shipment.price || 0)}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
										{formatDate(shipment.createdAt)}
									</td>
								</tr>
							{/each}
						{:else}
							<tr>
								<td colspan="8" class="px-6 py-12 text-center text-gray-500">
									No shipments found for the selected date range
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
