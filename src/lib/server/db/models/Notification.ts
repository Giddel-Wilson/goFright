/**
 * Notification Model
 * Manages email and SMS notifications for users
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Notification Type Enum
 */
export enum NotificationType {
	EMAIL = 'email',
	SMS = 'sms',
	PUSH = 'push'
}

/**
 * Notification Status Enum
 */
export enum NotificationStatus {
	PENDING = 'pending',
	SENT = 'sent',
	FAILED = 'failed',
	QUEUED = 'queued'
}

/**
 * Notification Interface
 */
export interface INotification extends Document {
	userId: mongoose.Types.ObjectId;
	cargoId?: mongoose.Types.ObjectId;
	type: NotificationType;
	status: NotificationStatus;
	subject?: string;
	message: string;
	recipient: string; // Email or phone number
	sentAt?: Date;
	errorMessage?: string;
	metadata?: Record<string, unknown>;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Notification Schema Definition
 */
const NotificationSchema = new Schema<INotification>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true
		},
		cargoId: {
			type: Schema.Types.ObjectId,
			ref: 'Cargo',
			index: true
		},
		type: {
			type: String,
			enum: Object.values(NotificationType),
			required: true
		},
		status: {
			type: String,
			enum: Object.values(NotificationStatus),
			default: NotificationStatus.PENDING,
			required: true
		},
		subject: {
			type: String,
			trim: true
		},
		message: {
			type: String,
			required: [true, 'Message is required'],
			trim: true
		},
		recipient: {
			type: String,
			required: [true, 'Recipient is required'],
			trim: true
		},
		sentAt: {
			type: Date
		},
		errorMessage: {
			type: String,
			trim: true
		},
		metadata: {
			type: Schema.Types.Mixed
		}
	},
	{
		timestamps: true
	}
);

/**
 * Indexes for faster queries
 */
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ status: 1 });
NotificationSchema.index({ cargoId: 1 });

/**
 * Notification Model
 */
const Notification: Model<INotification> =
	mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
