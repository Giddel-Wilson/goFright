<script lang="ts">
	import { onMount } from 'svelte';

	let analytics = $state<any>(null);
	let isLoading = $state(true);
	let selectedPeriod = $state('3 Months');
	let selectedGender = $state('All Gender');
	let selectedAudience = $state('Audience');

	onMount(async () => {
		await loadAnalytics();
	});

	async function loadAnalytics() {
		isLoading = true;
		try {
			const response = await fetch('/api/admin/analytics', {
				credentials: 'include'
			});

			if (response.ok) {
				const data = await response.json();
				analytics = data.analytics;
			}
		} catch (error) {
			console.error('Failed to load analytics:', error);
		} finally {
			isLoading = false;
		}
	}

	function getActivityColor(value: number): string {
		if (value === 0) return '#E5E7EB';
		if (value <= 20) return '#C7D2FE';
		if (value <= 40) return '#818CF8';
		return '#6366F1';
	}

	function getMaxActivity(): number {
		if (!analytics?.activityData) return 100;
		return Math.max(...analytics.activityData.flat());
	}
</script>

<svelte:head>
	<title>Analytics & Reports - GoFright Admin</title>
</svelte:head>
<div class="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
	<!-- Header -->
	<!-- Header -->
	<div class="mx-8 mt-8 flex-shrink-0">
		<div class="flex items-center justify-between mb-6">
			<div>
				<h1 class="text-3xl font-bold text-gray-900 mb-1">Analytics</h1>
				<p class="text-gray-600">Want to see about <button class="text-blue-600 hover:underline font-medium">{selectedAudience}</button></p>
			</div>
			<div class="flex items-center gap-3">
				<!-- Period Selector -->
				<select 
					bind:value={selectedPeriod}
					class="px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
				>
					<option>7 Days</option>
					<option>1 Month</option>
					<option selected>3 Months</option>
					<option>6 Months</option>
					<option>1 Year</option>
				</select>
				
				<!-- Date Range -->
				<button class="px-4 py-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
					<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
					</svg>
					Mar 26, 2019 - Apr 26, 2019
				</button>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="flex-1 overflow-y-auto px-8 pb-8 space-y-6">
		{#if isLoading}
		<div class="flex items-center justify-center h-64">
			<div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
		</div>
		{:else if analytics}
		<!-- Stats Cards Row -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
			<!-- Total Posts -->
			<div class="bg-white rounded-3xl p-6 shadow-sm">
				<div class="flex items-center justify-between mb-3">
					<span class="text-sm text-gray-600">Total Posts</span>
					<div class="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
						<svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
						</svg>
					</div>
				</div>
				<p class="text-3xl font-bold text-gray-900 mb-2">{analytics.stats.totalPosts}</p>
				<div class="flex items-center gap-1 text-xs">
					<svg class="w-3 h-3 {analytics.trends.postsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d={analytics.trends.postsGrowth >= 0 ? "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" : "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"} clip-rule="evenodd"/>
					</svg>
					<span class="{analytics.trends.postsGrowth >= 0 ? 'text-green-600' : 'text-red-600'} font-medium">{Math.abs(analytics.trends.postsGrowth).toFixed(2)}%</span>
				</div>
			</div>

			<!-- Total Followers -->
			<div class="bg-white rounded-3xl p-6 shadow-sm">
				<div class="flex items-center justify-between mb-3">
					<span class="text-sm text-gray-600">Followers</span>
					<div class="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
						<svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
						</svg>
					</div>
				</div>
				<p class="text-3xl font-bold text-gray-900 mb-2">{analytics.stats.totalFollowers.toLocaleString()}</p>
				<div class="flex items-center gap-1 text-xs">
					<svg class="w-3 h-3 {analytics.trends.followersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d={analytics.trends.followersGrowth >= 0 ? "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" : "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"} clip-rule="evenodd"/>
					</svg>
					<span class="{analytics.trends.followersGrowth >= 0 ? 'text-green-600' : 'text-red-600'} font-medium">{Math.abs(analytics.trends.followersGrowth).toFixed(2)}%</span>
				</div>
			</div>

			<!-- Following -->
			<div class="bg-white rounded-3xl p-6 shadow-sm">
				<div class="flex items-center justify-between mb-3">
					<span class="text-sm text-gray-600">Following</span>
					<div class="w-8 h-8 bg-pink-100 rounded-xl flex items-center justify-center">
						<svg class="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
						</svg>
					</div>
				</div>
				<p class="text-3xl font-bold text-gray-900 mb-2">{analytics.stats.totalFollowing}</p>
				<div class="flex items-center gap-1 text-xs">
					<svg class="w-3 h-3 {analytics.trends.followingGrowth >= 0 ? 'text-green-600' : 'text-red-600'}" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d={analytics.trends.followingGrowth >= 0 ? "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" : "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"} clip-rule="evenodd"/>
					</svg>
					<span class="{analytics.trends.followingGrowth >= 0 ? 'text-green-600' : 'text-red-600'} font-medium">{Math.abs(analytics.trends.followingGrowth).toFixed(2)}%</span>
				</div>
			</div>

			<!-- Engagement -->
			<div class="bg-white rounded-3xl p-6 shadow-sm">
				<div class="flex items-center justify-between mb-3">
					<span class="text-sm text-gray-600">Engagement</span>
					<div class="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
						<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
						</svg>
					</div>
				</div>
				<p class="text-3xl font-bold text-gray-900 mb-2">{analytics.stats.engagement.toFixed(1)}%</p>
				<div class="flex items-center gap-1 text-xs">
					<svg class="w-3 h-3 {analytics.trends.engagementGrowth >= 0 ? 'text-green-600' : 'text-red-600'}" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d={analytics.trends.engagementGrowth >= 0 ? "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" : "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"} clip-rule="evenodd"/>
					</svg>
					<span class="{analytics.trends.engagementGrowth >= 0 ? 'text-green-600' : 'text-red-600'} font-medium">{Math.abs(analytics.trends.engagementGrowth).toFixed(2)}%</span>
				</div>
			</div>
		</div>
		{:else}
		<!-- Error State -->
		<div class="flex flex-col items-center justify-center h-64">
			<div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
				<svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>
			</div>
			<h3 class="text-lg font-semibold text-gray-900 mb-2">Failed to Load Analytics</h3>
			<p class="text-gray-600 mb-4">Unable to load analytics data.</p>
			<button 
				onclick={loadAnalytics}
				class="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
			>
				Try Again
			</button>
		</div>
		{/if}

		<!-- Main Analytics Grid -->
		{#if analytics}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Left Column - Demographics & Activity -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Demographic Audience -->
				<div class="bg-white rounded-3xl shadow-sm p-8">
					<div class="flex items-center justify-between mb-6">
						<h3 class="text-xl font-bold text-gray-900">Demographic Audience</h3>
						<select 
							bind:value={selectedGender}
							class="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium focus:outline-none"
						>
							<option>All Gender</option>
							<option>Male</option>
							<option>Female</option>
						</select>
					</div>

					<p class="text-sm text-gray-600 mb-6">See insights on how your audience have changed over time</p>

					<!-- World Map Illustration -->
					<div class="relative h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl mb-6 overflow-hidden">
						<!-- Simplified world map using gradients and shapes -->
						<svg viewBox="0 0 800 400" class="w-full h-full">
							<!-- North America -->
							<path d="M 100 80 Q 120 70 140 80 L 180 100 Q 200 110 190 130 L 170 150 Q 160 160 150 150 L 120 140 Q 100 130 100 110 Z" fill="#818CF8" opacity="0.7"/>
							<path d="M 140 140 L 160 160 L 150 180 L 130 170 Z" fill="#818CF8" opacity="0.7"/>
							
							<!-- South America -->
							<path d="M 180 200 L 200 220 Q 210 250 200 280 L 190 300 Q 180 310 170 300 L 160 270 Q 155 240 165 220 Z" fill="#6366F1" opacity="0.8"/>
							
							<!-- Europe -->
							<path d="M 380 90 L 420 95 L 430 110 L 420 125 L 390 120 L 380 105 Z" fill="#C7D2FE" opacity="0.6"/>
							
							<!-- Africa -->
							<path d="M 390 140 Q 410 145 420 160 L 430 200 Q 435 240 420 270 L 400 280 Q 385 275 380 260 L 375 200 Q 375 160 390 140 Z" fill="#E5E7EB" opacity="0.5"/>
							
							<!-- Asia -->
							<path d="M 450 80 Q 480 75 510 85 L 560 95 Q 590 105 600 120 L 610 150 Q 615 180 600 200 L 570 210 Q 540 215 520 205 L 480 190 Q 460 175 455 150 L 450 110 Z" fill="#60A5FA" opacity="0.7"/>
							<path d="M 530 210 L 550 230 L 560 250 L 540 260 L 520 250 Z" fill="#60A5FA" opacity="0.7"/>
							
							<!-- Australia -->
							<path d="M 620 280 Q 650 275 670 285 L 680 305 Q 675 320 660 325 L 630 320 Q 620 305 620 290 Z" fill="#93C5FD" opacity="0.6"/>
							
							<!-- Markers -->
							<circle cx="150" cy="120" r="4" fill="#EF4444"/>
							<circle cx="190" cy="250" r="4" fill="#EF4444"/>
							<circle cx="400" cy="110" r="4" fill="#EF4444"/>
							<circle cx="550" cy="140" r="4" fill="#EF4444"/>
							<circle cx="650" cy="300" r="4" fill="#EF4444"/>
						</svg>
					</div>

					<!-- Top Countries -->
					<div class="grid grid-cols-3 gap-4">
						{#each analytics.demographicData.topCountries as country}
							<div class="bg-gray-50 rounded-2xl p-4">
								<div class="flex items-center justify-between mb-3">
									<span class="text-2xl">{country.flag}</span>
									<span class="text-xs font-medium text-gray-500">Top Country</span>
								</div>
								<div class="flex items-center gap-2 mb-2">
									<p class="text-2xl font-bold text-gray-900">{country.percentage}%</p>
									<svg class="w-4 h-4 {country.trend === 'up' ? 'text-green-600' : 'text-red-600'}" fill="currentColor" viewBox="0 0 20 20">
										{#if country.trend === 'up'}
											<path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
										{:else}
											<path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
										{/if}
									</svg>
								</div>
								<p class="text-sm font-medium text-blue-600 mb-3">{country.name}</p>
								
								{#each country.regions as region}
									<div class="flex items-center justify-between text-xs mb-1">
										<span class="text-gray-600">{region.name}</span>
										<span class="font-medium text-gray-900">{region.percentage}%</span>
									</div>
								{/each}
							</div>
						{/each}
					</div>
				</div>

				<!-- Audience Online Activity -->
				<div class="bg-white rounded-3xl shadow-sm p-8">
					<h3 class="text-xl font-bold text-gray-900 mb-2">Audience Online Activity</h3>
					<p class="text-sm text-gray-600 mb-6">Mar 26 - Apr 23</p>

					<!-- Heatmap -->
					<div class="space-y-2">
						<!-- Days labels -->
						<div class="flex items-center gap-2 mb-2">
							<div class="w-8"></div>
							<div class="flex gap-2 text-xs text-gray-500 font-medium">
								<span class="w-3">M</span>
								<span class="w-3">T</span>
								<span class="w-3">W</span>
								<span class="w-3">T</span>
								<span class="w-3">F</span>
								<span class="w-3">S</span>
								<span class="w-3">S</span>
							</div>
						</div>
						
						<!-- Heatmap grid -->
						{#each analytics.activityData as week, weekIndex}
							<div class="flex items-center gap-2">
								<span class="w-8 text-xs text-gray-500 font-medium">{weekIndex + 1}</span>
								<div class="flex gap-2">
									{#each week as activity}
										<div 
											class="w-3 h-3 rounded" 
											style="background-color: {getActivityColor(activity)}"
											title="{activity} shipments"
										></div>
									{/each}
								</div>
							</div>
						{/each}
					</div>

					<!-- Legend -->
					<div class="flex items-center justify-end gap-2 mt-4">
						<span class="text-xs text-gray-600">Less</span>
						<div class="flex gap-1">
							<div class="w-3 h-3 rounded bg-gray-200"></div>
							<div class="w-3 h-3 rounded bg-indigo-200"></div>
							<div class="w-3 h-3 rounded bg-indigo-400"></div>
							<div class="w-3 h-3 rounded bg-indigo-600"></div>
						</div>
						<span class="text-xs text-gray-600">More</span>
					</div>
				</div>
			</div>

			<!-- Right Column - Gender & Age Stats -->
			<div class="space-y-6">
				<!-- Statistic By Gender -->
				<div class="bg-white rounded-3xl shadow-sm p-8">
					<h3 class="text-lg font-bold text-gray-900 mb-2">Statistic By Gender</h3>
					<p class="text-sm text-gray-600 mb-6">Mar 26 - Apr 20</p>

					<!-- Donut Chart -->
					<div class="relative w-48 h-48 mx-auto mb-6">
						<svg viewBox="0 0 200 200" class="transform -rotate-90">
							<!-- Male (60%) -->
							<circle
								cx="100"
								cy="100"
								r="80"
								fill="none"
								stroke="#6366F1"
								stroke-width="30"
								stroke-dasharray="301.593 502.655"
								stroke-dashoffset="0"
							/>
							<!-- Female (30%) -->
							<circle
								cx="100"
								cy="100"
								r="80"
								fill="none"
								stroke="#60A5FA"
								stroke-width="30"
								stroke-dasharray="150.796 502.655"
								stroke-dashoffset="-301.593"
							/>
							<!-- Other (10%) -->
							<circle
								cx="100"
								cy="100"
								r="80"
								fill="none"
								stroke="#22D3EE"
								stroke-width="30"
								stroke-dasharray="50.265 502.655"
								stroke-dashoffset="-452.389"
							/>
						</svg>
						<div class="absolute inset-0 flex items-center justify-center">
							<div class="text-center">
								<p class="text-3xl font-bold text-gray-900">100%</p>
								<p class="text-sm text-gray-600">Total</p>
							</div>
						</div>
					</div>

					<!-- Legend -->
					<div class="space-y-3">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<div class="w-3 h-3 rounded-full bg-indigo-600"></div>
								<span class="text-sm text-gray-700">Man</span>
							</div>
							<span class="text-sm font-bold text-gray-900">{analytics.demographicData.genderData.male}%</span>
						</div>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<div class="w-3 h-3 rounded-full bg-blue-400"></div>
								<span class="text-sm text-gray-700">Women</span>
							</div>
							<span class="text-sm font-bold text-gray-900">{analytics.demographicData.genderData.female}%</span>
						</div>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<div class="w-3 h-3 rounded-full bg-cyan-400"></div>
								<span class="text-sm text-gray-700">Other</span>
							</div>
							<span class="text-sm font-bold text-gray-900">{analytics.demographicData.genderData.other}%</span>
						</div>
					</div>
				</div>

				<!-- Audience by Age -->
				<div class="bg-white rounded-3xl shadow-sm p-8">
					<div class="flex items-center justify-between mb-6">
						<h3 class="text-lg font-bold text-gray-900">Audience by Age</h3>
						<button class="text-sm text-gray-600 hover:text-gray-900">All</button>
					</div>
					<p class="text-sm text-gray-600 mb-6">Mar 26 - Apr 20</p>

					<!-- Age Groups -->
					<div class="space-y-4">
						{#each analytics.demographicData.ageGroups as group}
							<div>
								<div class="flex items-center justify-between mb-2">
									<span class="text-sm font-medium text-gray-700">{group.label}</span>
									<span class="text-sm font-bold text-gray-900">{group.percentage}%</span>
								</div>
								<div class="w-full bg-gray-200 rounded-full h-2">
									<div 
										class="bg-gradient-to-r from-indigo-600 to-indigo-400 h-2 rounded-full transition-all duration-500" 
										style="width: {group.percentage}%"
									></div>
								</div>
							</div>
						{/each}
					</div>
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
