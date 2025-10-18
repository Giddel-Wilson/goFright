/**
 * JWT Authentication Utilities
 * Handles token generation and verification
 */

import jwt from 'jsonwebtoken';
import { UserRole } from '../db/models';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * JWT Payload Interface
 */
export interface JWTPayload {
	userId: string;
	email: string;
	role: UserRole;
	name: string;
}

/**
 * Generate JWT token
 * @param payload - User information to encode in token
 * @returns JWT token string
 */
export function generateToken(payload: JWTPayload): string {
	return jwt.sign(payload, JWT_SECRET, {
		expiresIn: JWT_EXPIRES_IN
	} as jwt.SignOptions);
}

/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
	try {
		const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
		return decoded;
	} catch (error) {
		console.error('Token verification failed:', error);
		return null;
	}
}

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
	if (!authHeader) return null;
	
	const parts = authHeader.split(' ');
	if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
	
	return parts[1];
}

/**
 * Decode token without verification (for debugging)
 * @param token - JWT token
 * @returns Decoded payload or null
 */
export function decodeToken(token: string): JWTPayload | null {
	try {
		return jwt.decode(token) as JWTPayload;
	} catch {
		return null;
	}
}
