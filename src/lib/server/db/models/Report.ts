/**
 * Report Model
 * Manages system-generated reports and analytics
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Report Type Enum
 */
export enum ReportType {
	MONTHLY_FREIGHT = 'monthly_freight',
	QUARTERLY_REVENUE = 'quarterly_revenue',
	YEARLY_SUMMARY = 'yearly_summary',
	CUSTOMER_ACTIVITY = 'customer_activity',
	OFFICER_PERFORMANCE = 'officer_performance',
	CARGO_ANALYTICS = 'cargo_analytics',
	PAYMENT_SUMMARY = 'payment_summary',
	CUSTOM = 'custom'
}

/**
 * Report Status Enum
 */
export enum ReportStatus {
	PENDING = 'pending',
	GENERATING = 'generating',
	COMPLETED = 'completed',
	FAILED = 'failed'
}

/**
 * Report Interface
 */
export interface IReport extends Document {
	adminId: mongoose.Types.ObjectId;
	reportType: ReportType;
	status: ReportStatus;
	title: string;
	description?: string;
	startDate: Date;
	endDate: Date;
	data?: Record<string, unknown>;
	filePath?: string;
	fileUrl?: string;
	generatedAt?: Date;
	errorMessage?: string;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Report Schema Definition
 */
const ReportSchema = new Schema<IReport>(
	{
		adminId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true
		},
		reportType: {
			type: String,
			enum: Object.values(ReportType),
			required: true
		},
		status: {
			type: String,
			enum: Object.values(ReportStatus),
			default: ReportStatus.PENDING,
			required: true
		},
		title: {
			type: String,
			required: [true, 'Title is required'],
			trim: true
		},
		description: {
			type: String,
			trim: true,
			maxlength: [500, 'Description cannot exceed 500 characters']
		},
		startDate: {
			type: Date,
			required: [true, 'Start date is required']
		},
		endDate: {
			type: Date,
			required: [true, 'End date is required']
		},
		data: {
			type: Schema.Types.Mixed
		},
		filePath: {
			type: String,
			trim: true
		},
		fileUrl: {
			type: String,
			trim: true
		},
		generatedAt: {
			type: Date
		},
		errorMessage: {
			type: String,
			trim: true
		}
	},
	{
		timestamps: true
	}
);

/**
 * Indexes for faster queries
 */
ReportSchema.index({ adminId: 1, createdAt: -1 });
ReportSchema.index({ reportType: 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ startDate: 1, endDate: 1 });

/**
 * Report Model
 */
const Report: Model<IReport> =
	mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);

export default Report;
