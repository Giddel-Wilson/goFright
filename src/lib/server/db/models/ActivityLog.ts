/**
 * Activity Log Model
 * Tracks user actions and system events for audit and display purposes
 */

import mongoose, { Schema, type Document } from 'mongoose';

export interface IActivityLog extends Document {
	userId: mongoose.Types.ObjectId;
	action: string; // e.g., 'profile_update', 'photo_upload', 'shipment_created', 'password_change'
	details: string; // Human-readable description
	category: 'profile' | 'shipment' | 'user' | 'system' | 'security' | 'report' | 'other';
	metadata?: Record<string, any>; // Additional data like shipment ID, old/new values, etc.
	ip?: string;
	userAgent?: string;
	createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true
		},
		action: {
			type: String,
			required: true,
			trim: true
		},
		details: {
			type: String,
			required: true,
			trim: true
		},
		category: {
			type: String,
			enum: ['profile', 'shipment', 'user', 'system', 'security', 'report', 'other'],
			default: 'other',
			index: true
		},
		metadata: {
			type: Schema.Types.Mixed
		},
		ip: {
			type: String,
			trim: true
		},
		userAgent: {
			type: String,
			trim: true
		}
	},
	{
		timestamps: true
	}
);

// Index for efficient querying
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ category: 1, createdAt: -1 });

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
