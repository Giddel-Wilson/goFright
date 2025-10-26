/**
 * API: Freight Officer Profile
 * GET /api/freight-officer/profile - Get profile
 * PUT /api/freight-officer/profile - Update profile
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { User } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';

/**
 * GET - Get freight officer profile
 */
export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		if (authUser.role !== 'freight_officer' && authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		await connectDB();

		const user = await User.findById(authUser.userId).select('-password').lean();

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		return json({ user });
	} catch (error) {
		console.error('Get profile error:', error);
		return json({ error: 'Failed to get profile' }, { status: 500 });
	}
};

/**
 * PUT - Update freight officer profile
 */
export const PUT: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		if (authUser.role !== 'freight_officer' && authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const body = await event.request.json();
		const { 
			name, 
			email, 
			phone, 
			address,
			gender,
			dateOfBirth,
			nationality,
			stateOfOrigin,
			city,
			state
		} = body;

		await connectDB();

		const updates: Record<string, unknown> = {};
		if (name !== undefined) updates.name = name;
		if (email !== undefined) updates.email = email;
		if (phone !== undefined) updates.phone = phone;
		if (address !== undefined) updates.address = address;
		if (gender !== undefined) updates.gender = gender;
		if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
		if (nationality !== undefined) updates.nationality = nationality;
		if (stateOfOrigin !== undefined) updates.stateOfOrigin = stateOfOrigin;
		if (city !== undefined) updates.city = city;
		if (state !== undefined) updates.state = state;

		const user = await User.findByIdAndUpdate(
			authUser.userId,
			{ $set: updates },
			{ new: true, runValidators: true, strict: false }
		).select('-password_hash');

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		console.log('Freight officer profile updated:', {
			userId: authUser.userId,
			updatedFields: Object.keys(updates),
			hasPhotoUrl: !!user.photoUrl,
			photoUrl: user.photoUrl,
			demographics: {
				gender: user.gender,
				dateOfBirth: user.dateOfBirth,
				nationality: user.nationality,
				stateOfOrigin: user.stateOfOrigin,
				city: user.city,
				state: user.state
			}
		});

		return json({ user });
	} catch (error) {
		console.error('Update profile error:', error);
		return json({ error: 'Failed to update profile' }, { status: 500 });
	}
};
