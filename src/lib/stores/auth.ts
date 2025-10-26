/**
 * Authentication Store
 * Manages user authentication state across the application
 */

import { writable } from 'svelte/store';
import { goto } from '$app/navigation';

export interface User {
	id: string;
	name: string;
	email: string;
	role: 'admin' | 'freight_officer' | 'customer';
	phone?: string;
	address?: string;
	photoUrl?: string;
	// Demographics
	gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
	dateOfBirth?: string;
	nationality?: string;
	stateOfOrigin?: string;
	city?: string;
	state?: string;
	isActive: boolean;
	createdAt: string;
}

interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

const initialState: AuthState = {
	user: null,
	token: null,
	isAuthenticated: false,
	isLoading: true
};

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,
		
		/**
		 * Login user
		 */
		login: async (email: string, password: string) => {
			try {
				const response = await fetch('/api/auth/login', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify({ email, password })
				});

				const data = await response.json();

				if (!response.ok) {
					// Ensure loading is false even on error
					update(state => ({
						...state,
						isLoading: false
					}));
					throw new Error(data.error || 'Login failed');
				}

				// Update store with user data
				update(state => ({
					...state,
					user: data.user,
					token: data.token,
					isAuthenticated: true,
					isLoading: false
				}));

				return { success: true };
			} catch (error) {
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Login failed'
				};
			}
		},

		/**
		 * Register new user
		 */
		register: async (userData: {
			name: string;
			email: string;
			password: string;
			role: 'admin' | 'freight_officer' | 'customer';
			phone?: string;
			address?: string;
		}) => {
			try {
				const response = await fetch('/api/auth/register', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(userData)
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.error || 'Registration failed');
				}

				return { success: true };
			} catch (error) {
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Registration failed'
				};
			}
		},

		/**
		 * Logout user
		 */
		logout: async () => {
			try {
				await fetch('/api/auth/logout', { method: 'POST' });
			} catch (error) {
				console.error('Logout error:', error);
			}

		// Clear store
		set(initialState);
		goto('/login');
	},

		/**
		 * Load current user from API
		 * Note: Token is stored in HTTP-only cookie, not in state
		 */
		async loadUser() {
		try {
			const response = await fetch('/api/auth/me', {
				credentials: 'include'
			});

			if (!response.ok) {
				throw new Error('Not authenticated');
			}

			const data = await response.json();

			if (data.user) {
				update(state => ({
					...state,
					user: data.user,
					token: 'cookie', // Placeholder to indicate token is in cookie
					isAuthenticated: true,
					isLoading: false
				}));
			} else {
				throw new Error('No user data');
			}
		} catch (error) {
			update(state => ({
				...state,
				user: null,
				token: null,
				isAuthenticated: false,
				isLoading: false
			}));
		}
	},

		/**
		 * Update user data in store
		 */
		updateUser: (userData: Partial<User>) => {
			update(state => ({
				...state,
				user: state.user ? { ...state.user, ...userData } : null
			}));
		},

		/**
		 * Check if user has specific role
		 */
		hasRole: (roles: string[]): boolean => {
			let hasRoleAccess = false;
			const unsubscribe = subscribe(state => {
				hasRoleAccess = state.user ? roles.includes(state.user.role) : false;
			});
			unsubscribe();
			
			return hasRoleAccess;
		}
	};
}

export const authStore = createAuthStore();
