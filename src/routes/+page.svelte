<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Input from '$lib/components/ui/input/input.svelte';

	let user = $state(null);
	let trackingId = $state('');
	let isNavigating = $state(false);

	authStore.subscribe(state => {
		user = state.user;
	});

	// Redirect authenticated users to dashboard
	$effect(() => {
		if (user) {
			navigate('/dashboard');
		}
	});

	async function navigate(path: string) {
		isNavigating = true;
		try {
			await goto(path);
		} finally {
			// Keep loading state for a smooth transition
			setTimeout(() => {
				isNavigating = false;
			}, 300);
		}
	}

	function handleTrack() {
		if (trackingId.trim()) {
			navigate(`/track?id=${encodeURIComponent(trackingId.trim())}`);
		}
	}

	function scrollToSection(id: string) {
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
	}

	const transportMethods = [
		{ number: '01', title: 'By Road', icon: '🚚' },
		{ number: '02', title: 'By Air', icon: '✈️' },
		{ number: '03', title: 'By Sea', icon: '🚢' }
	];

	const stats = [
		{ value: '323K', label: 'Happy Clients' },
		{ value: '1247', label: 'Vehicles' },
		{ value: '210K', label: 'Tons Delivered' },
		{ value: '64127', label: 'Deliveries' }
	];

	const steps = [
		{
			number: '01',
			title: 'Order Placement',
			description: 'Submit your order with details like pickup location, delivery address, cargo type, weight, and special requirements.'
		},
		{
			number: '02',
			title: 'Route Planning',
			description: 'Our system analyzes the best routes, considering distance, traffic, and delivery schedules to ensure efficiency.'
		},
		{
			number: '03',
			title: 'Assignment',
			description: 'Assign freight officers and vehicles based on availability and route optimization for timely delivery.'
		},
		{
			number: '04',
			title: 'Tracking and Monitoring',
			description: 'Real-time GPS tracking lets customers and freight officers monitor shipments at every stage.'
		},
		{
			number: '05',
			title: 'Delivery and Confirmation',
			description: 'Upon arrival, confirmation is sent to the customer with proof of delivery and payment receipts.'
		}
	];
</script>

<svelte:head>
	<title>GoFright - Modern Cargo Freight Management</title>
</svelte:head>

<!-- Loading Overlay -->
{#if isNavigating}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
		<div class="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
			<div class="relative">
				<div class="w-16 h-16 border-4 border-cyan-200 rounded-full"></div>
				<div class="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
			</div>
			<p class="text-gray-700 font-medium">Loading...</p>
		</div>
	</div>
{/if}

<div class="min-h-screen bg-white">
	<!-- Navigation -->
	<nav class="border-b bg-white sticky top-0 z-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<button 
					onclick={() => navigate('/')}
					class="flex items-center space-x-2 hover:opacity-80 transition"
				>
					<span class="text-3xl">📦</span>
					<span class="text-2xl font-bold text-gray-900">GoFright</span>
				</button>
				<div class="hidden md:flex items-center space-x-8">
					<button 
						onclick={() => scrollToSection('services')}
						class="text-gray-700 hover:text-blue-600 transition"
					>
						Our Services
					</button>
					<button 
						onclick={() => scrollToSection('solutions')}
						class="text-gray-700 hover:text-blue-600 transition"
					>
						Solutions
					</button>
					<button 
						onclick={() => scrollToSection('about')}
						class="text-gray-700 hover:text-blue-600 transition"
					>
						About us
					</button>
				</div>
				<div class="flex items-center space-x-3">
					<Button 
						variant="ghost" 
						type="button"
						onclick={() => navigate('/login')}
						disabled={isNavigating}
					>
						Sign In
					</Button>
					<Button 
						type="button"
						onclick={() => navigate('/register')} 
						class="bg-cyan-500 hover:bg-cyan-600"
						disabled={isNavigating}
					>
						Get Started
					</Button>
				</div>
			</div>
		</div>
	</nav>

	<!-- Hero Section with Image Background -->
	<section class="relative h-[600px] overflow-hidden">
		<!-- Background Image Overlay -->
		<div class="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-700/70 z-10"></div>
		<div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920')] bg-cover bg-center"></div>
		
		<!-- Hero Content -->
		<div class="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
			<div class="max-w-2xl text-white">
				<h1 class="text-5xl md:text-6xl font-bold leading-tight mb-6">
					GoFright<br />
					<span class="text-cyan-300">Crafting Your Logistic Success</span>
				</h1>
				<p class="text-xl mb-8 text-blue-100">
					Ship, track, and manage your cargo with ease. Experience seamless logistics with real-time tracking, automated payments, and instant notifications.
				</p>
				
				<!-- Track Shipment Form -->
				<Card class="p-6 bg-white/95 backdrop-blur-sm max-w-md">
					<h3 class="text-gray-900 font-semibold mb-4">Track My Shipment</h3>
					<form 
						onsubmit={(e) => {
							e.preventDefault();
							handleTrack();
						}} 
						class="flex gap-2"
					>
						<Input
							type="text"
							bind:value={trackingId}
							placeholder="Enter your tracking ID"
							class="flex-1"
						/>
						<Button type="submit" class="bg-cyan-500 hover:bg-cyan-600">
							Track Shipment
						</Button>
					</form>
				</Card>
			</div>
		</div>
	</section>

	<!-- Transport Methods -->
	<section id="services" class="py-20 bg-gray-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				{#each transportMethods as method}
					<Card class="p-8 hover:shadow-xl transition-shadow cursor-pointer group">
						<div class="flex justify-between items-start mb-4">
							<span class="text-4xl">{method.icon}</span>
							<span class="text-5xl font-light text-gray-300 group-hover:text-cyan-500 transition">{method.number}</span>
						</div>
						<h3 class="text-2xl font-bold text-gray-900 mb-2">{method.title}</h3>
						<p class="text-gray-600">
							Fast and reliable {method.title.toLowerCase()} transportation services for all your cargo needs.
						</p>
						<button class="mt-4 text-cyan-600 font-semibold hover:text-cyan-700 transition flex items-center gap-2">
							Learn More →
						</button>
					</Card>
				{/each}
			</div>
		</div>
	</section>

	<!-- Solutions Section -->
	<section id="solutions" class="py-20 bg-white">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
				<div>
					<h2 class="text-4xl font-bold text-gray-900 mb-6">
						Transport Solutions<br />
						For Business To Solve Any<br />
						Delivery Problems
					</h2>
					<p class="text-gray-600 mb-8 text-lg">
						GoFright is the Future of Efficiency. We take Control of Your Logistics, From Planning to Delivery. From Managing Vehicles Attention to Details, From Keeping it on Track to Ensuring Transparency, We're Your Partner in Progress.
					</p>
					<Button class="bg-cyan-500 hover:bg-cyan-600 px-8 py-6 text-lg">
						More Info →
					</Button>
				</div>
				<div class="relative">
					<!-- Stats Grid -->
					<div class="grid grid-cols-2 gap-6">
						{#each stats as stat}
							<Card class="p-6 text-center bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
								<p class="text-4xl font-bold text-blue-900 mb-2">{stat.value}</p>
								<p class="text-gray-600">{stat.label}</p>
							</Card>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- How We Work -->
	<section id="about" class="py-20 bg-gray-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<h2 class="text-4xl font-bold text-gray-900 text-center mb-4">How We Work</h2>
			<p class="text-gray-600 text-center mb-16 max-w-3xl mx-auto">
				Discover our streamlined process that ensures efficiency and excellence every step of the way. From order placement to final delivery, we're with you.
			</p>

			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{#each steps as step}
					<Card class="p-6 hover:shadow-lg transition-shadow">
						<div class="flex items-start gap-4">
							<span class="text-5xl font-bold text-cyan-500">{step.number}</span>
							<div>
								<h3 class="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
								<p class="text-gray-600 text-sm">{step.description}</p>
							</div>
						</div>
					</Card>
				{/each}
			</div>
		</div>
	</section>

	<!-- App Download Section -->
	<section class="py-20 bg-gradient-to-r from-cyan-500 to-blue-600">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
				<div class="text-white">
					<h2 class="text-4xl font-bold mb-6">
						Download the free<br />
						GoFright App
					</h2>
					<p class="text-xl mb-8 text-cyan-50">
						Track your shipments on the go. Available on iOS and Android.
					</p>
					<div class="flex gap-4">
						<button class="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2">
							<span>📱</span> App Store
						</button>
						<button class="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2">
							<span>🤖</span> Google Play
						</button>
					</div>
				</div>
				<div class="relative">
					<div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
						<div class="text-9xl mb-4">📱</div>
						<p class="text-white text-lg">Mobile App Coming Soon!</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Testimonials -->
	<section class="py-20 bg-white">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<h2 class="text-4xl font-bold text-gray-900 text-center mb-4">
				Over 1000+ People Trust us
			</h2>
			<p class="text-gray-600 text-center mb-16">
				Charting Our Course: Riding Waves Of Our Journey, Embracing Growth, and Paving the Way Forward. Let's Propel, Reflect, and Rise Over Our Commitment to Progress.
			</p>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				{#each [1, 2, 3] as _}
					<Card class="p-8 bg-gradient-to-br from-blue-50 to-cyan-50">
						<div class="flex items-center gap-4 mb-4">
							<div class="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
								JD
							</div>
							<div>
								<h4 class="font-bold text-gray-900">John Doe</h4>
								<p class="text-sm text-gray-600">CEO, TechCorp</p>
							</div>
						</div>
						<p class="text-gray-700 italic">
							"GoFright has transformed our logistics operations. The real-time tracking and seamless delivery process has saved us countless hours."
						</p>
						<div class="mt-4 flex gap-1">
							{#each [1, 2, 3, 4, 5] as _}
								<span class="text-yellow-400">⭐</span>
							{/each}
						</div>
					</Card>
				{/each}
			</div>

			<div class="text-center mt-12">
				<Button variant="outline" class="border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50">
					Show All People →
				</Button>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
			<h2 class="text-4xl font-bold mb-6">Ready to Ship Your Cargo?</h2>
			<p class="text-xl mb-8 text-blue-100">
				Join hundreds of satisfied customers and experience hassle-free cargo management today.
			</p>
			<Button 
				type="button"
				onclick={() => navigate('/register')} 
				class="bg-cyan-500 hover:bg-cyan-600 px-12 py-6 text-lg"
				disabled={isNavigating}
			>
				Create Free Account →
			</Button>
		</div>
	</section>

	<!-- Footer -->
	<footer class="bg-gray-900 text-white py-16">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
				<div>
					<div class="flex items-center space-x-2 mb-4">
						<span class="text-3xl">📦</span>
						<span class="text-2xl font-bold">GoFright</span>
					</div>
					<p class="text-gray-400 mb-4">
						Modern cargo freight management for the digital age.
					</p>
					<div class="flex gap-3">
						<button class="w-10 h-10 rounded-full bg-gray-800 hover:bg-cyan-500 transition flex items-center justify-center">
							f
						</button>
						<button class="w-10 h-10 rounded-full bg-gray-800 hover:bg-cyan-500 transition flex items-center justify-center">
							in
						</button>
						<button class="w-10 h-10 rounded-full bg-gray-800 hover:bg-cyan-500 transition flex items-center justify-center">
							tw
						</button>
					</div>
				</div>

				<div>
					<h4 class="font-bold mb-4">Menu</h4>
					<div class="space-y-2 text-gray-400">
						<p><button onclick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} class="hover:text-white transition">Our Services</button></p>
						<p><button onclick={() => goto('/track')} class="hover:text-white transition">Live Tracking</button></p>
						<p><button onclick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })} class="hover:text-white transition">Solutions</button></p>
						<p><button onclick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} class="hover:text-white transition">About</button></p>
						<p><button onclick={() => goto('/login')} class="hover:text-white transition">Sign In</button></p>
					</div>
				</div>

				<div>
					<h4 class="font-bold mb-4">Services</h4>
					<div class="space-y-2 text-gray-400">
						<p class="hover:text-white transition cursor-pointer">Express Shipping</p>
						<p class="hover:text-white transition cursor-pointer">International Freight</p>
						<p class="hover:text-white transition cursor-pointer">Cargo Insurance</p>
						<p class="hover:text-white transition cursor-pointer">Warehousing</p>
					</div>
				</div>

				<div>
					<h4 class="font-bold mb-4">Office</h4>
					<div class="space-y-2 text-gray-400">
						<p>Jln Lorem Backstreet no 45A,<br />45ART, United States</p>
						<p>📧 support@gofright.com</p>
						<p>📞 +1 (800) 123-4567</p>
					</div>
				</div>
			</div>

			<div class="border-t border-gray-800 pt-8 text-center text-gray-400">
				<p>© 2024 GoFright. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>
