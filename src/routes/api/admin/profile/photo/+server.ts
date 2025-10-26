/**
 * API: Admin Profile Photo Upload
 * POST /api/admin/profile/photo - Upload profile photo
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { User } from '$lib/server/db/models';
import { requireAuth } from '$lib/server/auth';
import { logActivity } from '$lib/server/utils/activityLogger';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * POST - Upload profile photo
 */
export const POST: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);
		
		console.log('Photo upload request from user:', authUser.userId);
		
		const formData = await event.request.formData();
		const photo = formData.get('photo') as File;

		if (!photo) {
			return json({ error: 'No photo provided' }, { status: 400 });
		}

		console.log('Photo received:', {
			name: photo.name,
			type: photo.type,
			size: photo.size
		});

		// Validate file type
		if (!photo.type.startsWith('image/')) {
			return json({ error: 'File must be an image' }, { status: 400 });
		}

		// Validate file size (max 5MB)
		if (photo.size > 5 * 1024 * 1024) {
			return json({ error: 'Image size must be less than 5MB' }, { status: 400 });
		}

		// Create uploads directory if it doesn't exist
		const uploadsDir = path.join(process.cwd(), 'static', 'uploads', 'profiles');
		if (!existsSync(uploadsDir)) {
			await mkdir(uploadsDir, { recursive: true });
		}

		// Generate unique filename
		const timestamp = Date.now();
		const ext = path.extname(photo.name);
		const filename = `${authUser.userId}-${timestamp}${ext}`;
		const filepath = path.join(uploadsDir, filename);

		// Convert file to buffer and save
		const buffer = Buffer.from(await photo.arrayBuffer());
		await writeFile(filepath, buffer);

		// Update user record with photo URL
		const photoUrl = `/uploads/profiles/${filename}`;
		
		console.log('Attempting to save photo to database:', {
			userId: authUser.userId,
			photoUrl
		});
		
		await connectDB();
		
		// First, verify user exists
		const existingUser = await User.findById(authUser.userId);
		console.log('User exists:', !!existingUser);
		
		if (!existingUser) {
			return json({ error: 'User not found' }, { status: 404 });
		}
		
		// Update with explicit field
		existingUser.photoUrl = photoUrl;
		await existingUser.save();
		
		console.log('Photo saved to database:', {
			userId: authUser.userId,
			photoUrl: existingUser.photoUrl,
			saved: true
		});
		
		// Get clean user object
		const updatedUser = await User.findById(authUser.userId).select('-password_hash');

		console.log('Updated user retrieved:', {
			hasPhotoUrl: !!updatedUser?.photoUrl,
			photoUrl: updatedUser?.photoUrl
		});

		// Log activity
		await logActivity({
			userId: authUser.userId,
			action: 'photo_upload',
			details: 'Updated profile picture',
			category: 'profile',
			metadata: { photoUrl },
			event
		});

		return json({ 
			message: 'Photo uploaded successfully',
			photoUrl,
			user: {
				id: updatedUser._id,
				name: updatedUser.name,
				email: updatedUser.email,
				role: updatedUser.role,
				phone: updatedUser.phone,
				address: updatedUser.address,
				photoUrl: updatedUser.photoUrl,
				isActive: updatedUser.isActive,
				createdAt: updatedUser.createdAt
			}
		});
	} catch (error) {
		console.error('Upload photo error:', error);
		return json({ error: 'Failed to upload photo' }, { status: 500 });
	}
};
