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
	name: z.string().min(2, 'Name must be at least 2 characters').max(100),
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	role: z.enum(['admin', 'freight_officer', 'customer'], {
		errorMap: () => ({ message: 'Role must be admin, freight_officer, or customer' })
	}),
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
		console.log('📝 Registration attempt:', { email: body.email, role: body.role });
		
		const validated = registerSchema.parse(body);
		console.log('✅ Validation passed');

		// Connect to database
		await connectDB();
		console.log('✅ Database connected');

		// Check if user already exists
		const existingUser = await User.findOne({ email: validated.email });
		if (existingUser) {
			console.log('❌ User already exists:', validated.email);
			return json(
				{ error: 'Email already registered' },
				{ status: 400 }
			);
		}
		console.log('✅ Email available');

		// Create new user with specified role
		console.log('📝 Creating user with data:', {
			name: validated.name,
			email: validated.email,
			role: validated.role,
			hasPassword: !!validated.password
		});
		
		const user = await User.create({
			name: validated.name,
			email: validated.email,
			password_hash: validated.password, // Will be hashed by pre-save hook
			role: validated.role, // Use role from registration form
			phone: validated.phone,
			address: validated.address
		});

		console.log('✅ User created successfully:', user._id);

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
		console.error('❌ Registration error:', error);
		console.error('Error details:', JSON.stringify(error, null, 2));

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
