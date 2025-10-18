/**
 * Authentication Middleware
 * Protects routes and enforces role-based access control
 */

import type { RequestEvent } from '@sveltejs/kit';
import { verifyToken, extractTokenFromHeader, type JWTPayload } from './jwt';
import { UserRole } from '../db/models';

/**
 * Extended RequestEvent with user information
 */
export interface AuthenticatedRequestEvent extends RequestEvent {
	locals: {
		user?: JWTPayload;
	};
}

/**
 * Authenticate user from request
 * Extracts and verifies JWT token from cookies or Authorization header
 * @param event - SvelteKit request event
 * @returns User payload or null if unauthenticated
 */
export function authenticate(event: RequestEvent): JWTPayload | null {
	// Try to get token from cookie first
	let token = event.cookies.get('auth_token');
	
	// Fallback to Authorization header
	if (!token) {
		const authHeader = event.request.headers.get('Authorization');
		const headerToken = extractTokenFromHeader(authHeader);
		if (headerToken) {
			token = headerToken;
		}
	}
	
	if (!token) return null;
	
	return verifyToken(token);
}

/**
 * Require authentication middleware
 * Returns 401 if user is not authenticated
 * @param event - SvelteKit request event
 * @returns User payload or throws error
 */
export function requireAuth(event: RequestEvent): JWTPayload {
	const user = authenticate(event);
	
	if (!user) {
		throw new Response(
			JSON.stringify({ error: 'Unauthorized', message: 'Authentication required' }),
			{
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
	
	return user;
}

/**
 * Require specific role(s)
 * Returns 403 if user doesn't have required role
 * @param event - SvelteKit request event
 * @param allowedRoles - Array of allowed user roles
 * @returns User payload or throws error
 */
export function requireRole(event: RequestEvent, allowedRoles: UserRole[]): JWTPayload {
	const user = requireAuth(event);
	
	if (!allowedRoles.includes(user.role)) {
		throw new Response(
			JSON.stringify({
				error: 'Forbidden',
				message: 'You do not have permission to access this resource'
			}),
			{
				status: 403,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
	
	return user;
}

/**
 * Check if user is admin
 * @param event - SvelteKit request event
 * @returns User payload or throws error
 */
export function requireAdmin(event: RequestEvent): JWTPayload {
	return requireRole(event, [UserRole.ADMIN]);
}

/**
 * Check if user is freight officer or admin
 * @param event - SvelteKit request event
 * @returns User payload or throws error
 */
export function requireOfficerOrAdmin(event: RequestEvent): JWTPayload {
	return requireRole(event, [UserRole.ADMIN, UserRole.FREIGHT_OFFICER]);
}

/**
 * Optional authentication
 * Returns user if authenticated, null otherwise (doesn't throw)
 * @param event - SvelteKit request event
 * @returns User payload or null
 */
export function optionalAuth(event: RequestEvent): JWTPayload | null {
	return authenticate(event);
}
