/**
 * Payment Model
 * Manages billing and payment information for cargo shipments
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Payment Method Enum
 */
export enum PaymentMethod {
	CASH = 'cash',
	CARD = 'card',
	BANK_TRANSFER = 'bank_transfer',
	MOBILE_MONEY = 'mobile_money',
	ONLINE = 'online'
}

/**
 * Payment Status Enum
 */
export enum PaymentStatus {
	PENDING = 'pending',
	PAID = 'paid',
	FAILED = 'failed',
	REFUNDED = 'refunded',
	CANCELLED = 'cancelled'
}

/**
 * Payment Interface
 */
export interface IPayment extends Document {
	cargoId: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId;
	amount: number;
	currency: string;
	paymentMethod: PaymentMethod;
	paymentStatus: PaymentStatus;
	transactionId?: string;
	receiptNumber?: string;
	paidAt?: Date;
	notes?: string;
	breakdown?: {
		baseCharge: number;
		weightCharge: number;
		distanceCharge: number;
		specialHandling?: number;
		insurance?: number;
		tax?: number;
	};
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Payment Schema Definition
 */
const PaymentSchema = new Schema<IPayment>(
	{
		cargoId: {
			type: Schema.Types.ObjectId,
			ref: 'Cargo',
			required: true
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		amount: {
			type: Number,
			required: [true, 'Amount is required'],
			min: [0, 'Amount must be positive']
		},
		currency: {
			type: String,
			default: 'USD',
			uppercase: true,
			trim: true
		},
		paymentMethod: {
			type: String,
			enum: Object.values(PaymentMethod),
			required: true
		},
		paymentStatus: {
			type: String,
			enum: Object.values(PaymentStatus),
			default: PaymentStatus.PENDING,
			required: true
		},
		transactionId: {
			type: String,
			trim: true,
			index: true
		},
		receiptNumber: {
			type: String,
			trim: true,
			unique: true,
			sparse: true
		},
		paidAt: {
			type: Date
		},
		notes: {
			type: String,
			trim: true,
			maxlength: [500, 'Notes cannot exceed 500 characters']
		},
		breakdown: {
			baseCharge: { type: Number, default: 0 },
			weightCharge: { type: Number, default: 0 },
			distanceCharge: { type: Number, default: 0 },
			specialHandling: { type: Number, default: 0 },
			insurance: { type: Number, default: 0 },
			tax: { type: Number, default: 0 }
		}
	},
	{
		timestamps: true
	}
);

/**
 * Indexes for faster queries
 */
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ paymentStatus: 1 });
PaymentSchema.index({ createdAt: -1 });

/**
 * Payment Model
 */
const Payment: Model<IPayment> =
	mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
