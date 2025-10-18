/**
 * API: POST /api/auth/register
 * Register a new customer account
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { User, UserRole } from '$lib/server/db/models';
import { z } from 'zod';

/**
 * Registration Schema
 */
const registerSchema = z.object({
	name: z.string().min(2).max(100),
	email: z.string().email(),
	password: z.string().min(8),
	phone: z.string().optional(),
	address: z.string().max(500).optional()
});

/**
 * POST - Register new customer
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		// Parse and validate request body
		const body = await request.json();
		const validated = registerSchema.parse(body);

		// Connect to database
		await connectDB();

		// Check if user already exists
		const existingUser = await User.findOne({ email: validated.email });
		if (existingUser) {
			return json(
				{ error: 'Email already registered' },
				{ status: 400 }
			);
		}

		// Create new customer user
		const user = await User.create({
			name: validated.name,
			email: validated.email,
			password_hash: validated.password, // Will be hashed by pre-save hook
			role: UserRole.CUSTOMER,
			phone: validated.phone,
			address: validated.address
		});

		return json(
			{
				message: 'Registration successful',
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					role: user.role
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Registration error:', error);

		if (error instanceof z.ZodError) {
			return json(
				{ error: 'Validation failed', details: error.issues },
				{ status: 400 }
			);
		}

		return json(
			{ error: 'Registration failed', message: 'An error occurred during registration' },
			{ status: 500 }
		);
	}
};
