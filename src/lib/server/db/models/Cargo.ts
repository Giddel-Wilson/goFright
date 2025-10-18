/**
 * Cargo Model
 * Manages freight and cargo shipment information
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { nanoid } from 'nanoid';

/**
 * Cargo Type Enum
 */
export enum CargoType {
	GENERAL = 'general',
	FRAGILE = 'fragile',
	PERISHABLE = 'perishable',
	HAZARDOUS = 'hazardous',
	ELECTRONICS = 'electronics',
	DOCUMENTS = 'documents',
	LIQUID = 'liquid',
	OTHER = 'other'
}

/**
 * Cargo Status Enum
 */
export enum CargoStatus {
	BOOKED = 'booked',
	PENDING_PICKUP = 'pending_pickup',
	IN_TRANSIT = 'in_transit',
	OUT_FOR_DELIVERY = 'out_for_delivery',
	DELIVERED = 'delivered',
	DELAYED = 'delayed',
	CANCELLED = 'cancelled',
	RETURNED = 'returned'
}

/**
 * Cargo Interface
 */
export interface ICargo extends Document {
	trackingId: string;
	senderId: mongoose.Types.ObjectId;
	senderName: string;
	senderPhone: string;
	senderAddress: string;
	receiverName: string;
	receiverPhone: string;
	receiverAddress: string;
	destination: string;
	origin: string;
	weight: number; // in kg
	dimensions?: {
		length: number; // in cm
		width: number;
		height: number;
	};
	cargoType: CargoType;
	status: CargoStatus;
	description?: string;
	specialInstructions?: string;
	estimatedDelivery?: Date;
	actualDelivery?: Date;
	assignedOfficerId?: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Cargo Schema Definition
 */
const CargoSchema = new Schema<ICargo>(
	{
		trackingId: {
			type: String,
			unique: true,
			required: true,
			default: () => `GF-${nanoid(10).toUpperCase()}`
		},
		senderId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		senderName: {
			type: String,
			required: [true, 'Sender name is required'],
			trim: true
		},
		senderPhone: {
			type: String,
			required: [true, 'Sender phone is required'],
			trim: true
		},
		senderAddress: {
			type: String,
			required: [true, 'Sender address is required'],
			trim: true
		},
		receiverName: {
			type: String,
			required: [true, 'Receiver name is required'],
			trim: true
		},
		receiverPhone: {
			type: String,
			required: [true, 'Receiver phone is required'],
			trim: true
		},
		receiverAddress: {
			type: String,
			required: [true, 'Receiver address is required'],
			trim: true
		},
		destination: {
			type: String,
			required: [true, 'Destination is required'],
			trim: true
		},
		origin: {
			type: String,
			required: [true, 'Origin is required'],
			trim: true
		},
		weight: {
			type: Number,
			required: [true, 'Weight is required'],
			min: [0.1, 'Weight must be at least 0.1 kg']
		},
		dimensions: {
			length: { type: Number, min: 0 },
			width: { type: Number, min: 0 },
			height: { type: Number, min: 0 }
		},
		cargoType: {
			type: String,
			enum: Object.values(CargoType),
			default: CargoType.GENERAL,
			required: true
		},
		status: {
			type: String,
			enum: Object.values(CargoStatus),
			default: CargoStatus.BOOKED,
			required: true
		},
		description: {
			type: String,
			trim: true,
			maxlength: [500, 'Description cannot exceed 500 characters']
		},
		specialInstructions: {
			type: String,
			trim: true,
			maxlength: [500, 'Special instructions cannot exceed 500 characters']
		},
		estimatedDelivery: {
			type: Date
		},
		actualDelivery: {
			type: Date
		},
		assignedOfficerId: {
			type: Schema.Types.ObjectId,
			ref: 'User'
		}
	},
	{
		timestamps: true
	}
);

/**
 * Indexes for faster queries
 * Note: trackingId already has unique index from schema definition
 */
CargoSchema.index({ senderId: 1 });
CargoSchema.index({ status: 1 });
CargoSchema.index({ createdAt: -1 });
CargoSchema.index({ destination: 1 });

/**
 * Cargo Model
 */
const Cargo: Model<ICargo> = mongoose.models.Cargo || mongoose.model<ICargo>('Cargo', CargoSchema);

export default Cargo;
