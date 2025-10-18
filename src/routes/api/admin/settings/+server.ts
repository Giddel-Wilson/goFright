/**
 * API: Admin Settings Management
 * GET /api/admin/settings - Get system settings
 * PUT /api/admin/settings - Update system settings
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { requireAuth } from '$lib/server/auth';
import mongoose from 'mongoose';

// Settings Schema
const SettingsSchema = new mongoose.Schema({
	companyName: { type: String, default: 'GoFright' },
	companyEmail: { type: String, default: 'admin@gofright.com' },
	companyPhone: { type: String, default: '+1 234 567 8900' },
	companyAddress: { type: String, default: '123 Freight St, City, Country' },
	currency: { type: String, default: 'USD - US Dollar' },
	timezone: { type: String, default: 'UTC - Coordinated Universal Time' },
	twoFactorEnabled: { type: Boolean, default: false },
	emailNotifications: { type: Boolean, default: true },
	smsNotifications: { type: Boolean, default: false },
	autoBackup: { type: Boolean, default: true },
	maintenanceMode: { type: Boolean, default: false },
	updatedAt: { type: Date, default: Date.now },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

/**
 * GET - Get system settings
 */
export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		// Only admins can access
		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		await connectDB();

		let settings = await Settings.findOne().lean();

		// Create default settings if none exist
		if (!settings) {
			settings = await Settings.create({
				companyName: 'GoFright',
				companyEmail: 'admin@gofright.com',
				companyPhone: '+1 234 567 8900',
				companyAddress: '123 Freight St, City, Country',
				currency: 'USD - US Dollar',
				timezone: 'UTC - Coordinated Universal Time',
				twoFactorEnabled: false,
				emailNotifications: true,
				smsNotifications: false,
				autoBackup: true,
				maintenanceMode: false
			});
		}

		return json({ settings });
	} catch (error) {
		console.error('Get settings error:', error);
		return json({ error: 'Failed to fetch settings' }, { status: 500 });
	}
};

/**
 * PUT - Update system settings
 */
export const PUT: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);

		// Only admins can update
		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const data = await event.request.json();

		await connectDB();

		const allowedUpdates = [
			'companyName',
			'companyEmail',
			'companyPhone',
			'companyAddress',
			'currency',
			'timezone',
			'twoFactorEnabled',
			'emailNotifications',
			'smsNotifications',
			'autoBackup',
			'maintenanceMode'
		];

		const updates: Record<string, unknown> = {
			updatedAt: new Date(),
			updatedBy: authUser.id
		};

		for (const key of allowedUpdates) {
			if (data[key] !== undefined) {
				updates[key] = data[key];
			}
		}

		const settings = await Settings.findOneAndUpdate(
			{},
			{ $set: updates },
			{ new: true, upsert: true, runValidators: true }
		);

		return json({ message: 'Settings updated successfully', settings });
	} catch (error) {
		console.error('Update settings error:', error);
		return json({ error: 'Failed to update settings' }, { status: 500 });
	}
};
