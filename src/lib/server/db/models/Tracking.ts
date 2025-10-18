/**
 * Tracking Model
 * Records location and status updates for cargo shipments
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { CargoStatus } from './Cargo';

/**
 * Tracking Interface
 */
export interface ITracking extends Document {
	cargoId: mongoose.Types.ObjectId;
	status: CargoStatus;
	location: string;
	description?: string;
	updatedBy?: mongoose.Types.ObjectId;
	timestamp: Date;
	latitude?: number;
	longitude?: number;
	createdAt: Date;
}

/**
 * Tracking Schema Definition
 */
const TrackingSchema = new Schema<ITracking>(
	{
		cargoId: {
			type: Schema.Types.ObjectId,
			ref: 'Cargo',
			required: true,
			index: true
		},
		status: {
			type: String,
			enum: Object.values(CargoStatus),
			required: true
		},
		location: {
			type: String,
			required: [true, 'Location is required'],
			trim: true
		},
		description: {
			type: String,
			trim: true,
			maxlength: [300, 'Description cannot exceed 300 characters']
		},
		updatedBy: {
			type: Schema.Types.ObjectId,
			ref: 'User'
		},
		timestamp: {
			type: Date,
			default: Date.now,
			required: true
		},
		latitude: {
			type: Number,
			min: -90,
			max: 90
		},
		longitude: {
			type: Number,
			min: -180,
			max: 180
		}
	},
	{
		timestamps: { createdAt: true, updatedAt: false }
	}
);

/**
 * Indexes for faster queries
 */
TrackingSchema.index({ cargoId: 1, timestamp: -1 });
TrackingSchema.index({ status: 1 });

/**
 * Tracking Model
 */
const Tracking: Model<ITracking> =
	mongoose.models.Tracking || mongoose.model<ITracking>('Tracking', TrackingSchema);

export default Tracking;
