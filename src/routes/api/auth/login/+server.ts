/**
 * API: POST /api/auth/login
 * Authenticate user and return JWT token
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { User } from '$lib/server/db/models';
import { generateToken } from '$lib/server/auth';
import { z } from 'zod';

/**
 * Login Schema
 */
const loginSchema = z.object({
	email: z.string().email(),
	password: z.string()
});

/**
 * POST - Login user
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		// Parse and validate request body
		const body = await request.json();
		const validated = loginSchema.parse(body);

		// Connect to database
		await connectDB();

		// Find user by email
		const user = await User.findOne({ email: validated.email });
		if (!user) {
			return json(
				{ error: 'Invalid credentials' },
				{ status: 401 }
			);
		}

		// Check if account is active
		if (!user.isActive) {
			return json(
				{ error: 'Account is deactivated' },
				{ status: 403 }
			);
		}

		// Verify password
		const isPasswordValid = await user.comparePassword(validated.password);
		if (!isPasswordValid) {
			return json(
				{ error: 'Invalid credentials' },
				{ status: 401 }
			);
		}

		// Generate JWT token
		const token = generateToken({
			userId: String(user._id),
			email: user.email,
			role: user.role,
			name: user.name
		});

		// Set HTTP-only cookie
		cookies.set('auth_token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7, // 7 days
			path: '/'
		});

		return json({
			message: 'Login successful',
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role
			}
		});
	} catch (error) {
		console.error('Login error:', error);

		if (error instanceof z.ZodError) {
			return json(
				{ error: 'Validation failed', details: error.issues },
				{ status: 400 }
			);
		}

		return json(
			{ error: 'Login failed', message: 'An error occurred during login' },
			{ status: 500 }
		);
	}
};
