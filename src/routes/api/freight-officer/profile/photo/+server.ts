/**
 * API: Freight Officer Profile Photo
 * POST /api/freight-officer/profile/photo - Upload profile photo
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { User } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';
import fs from 'fs';
import path from 'path';

/**
 * POST - Upload profile photo
 */
export const POST: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		if (authUser.role !== 'freight_officer' && authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const formData = await event.request.formData();
		const photo = formData.get('photo') as File;

		if (!photo) {
			return json({ error: 'No photo provided' }, { status: 400 });
		}

		// Create uploads directory if it doesn't exist
		const uploadsDir = path.join(process.cwd(), 'static', 'uploads', 'profiles');
		if (!fs.existsSync(uploadsDir)) {
			fs.mkdirSync(uploadsDir, { recursive: true });
		}

		// Generate unique filename
		const ext = path.extname(photo.name);
		const filename = `${authUser.userId}-${Date.now()}${ext}`;
		const filepath = path.join(uploadsDir, filename);

		// Save file
		const buffer = Buffer.from(await photo.arrayBuffer());
		fs.writeFileSync(filepath, buffer);

		const photoUrl = `/uploads/profiles/${filename}`;
		
		console.log('📸 Freight officer photo upload:', {
			userId: authUser.userId,
			filename,
			photoUrl,
			fileSize: buffer.length
		});

	await connectDB();

	// Update user with photo URL
	const user = await User.findByIdAndUpdate(
		authUser.userId,
		{ photoUrl },
		{ new: true, strict: false }
	).select('-password_hash');

	if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		console.log('✅ Freight officer photo saved to database:', {
			userId: authUser.userId,
			photoUrl: user.photoUrl,
			hasPhotoUrl: !!user.photoUrl
		});

		return json({ user });
	} catch (error) {
		console.error('Photo upload error:', error);
		return json({ error: 'Failed to upload photo' }, { status: 500 });
	}
};
