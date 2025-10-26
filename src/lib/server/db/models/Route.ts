/**
 * Route Model
 * Manages flight routes and schedules for cargo shipments
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * Route Interface
 */
export interface IRoute extends Document {
	routeName: string;
	origin: string;
	destination: string;
	aircraftType: string;
	departureTime: string; // e.g., "14:00"
	arrivalTime: string; // e.g., "18:30"
	flightDuration: number; // in hours
	pricePerKg: number;
	basePrice: number;
	maxWeight: number; // max cargo weight in kg
	availableDays: string[]; // ['Monday', 'Tuesday', etc.]
	isActive: boolean;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Route Schema Definition
 */
const RouteSchema = new Schema<IRoute>(
	{
		routeName: {
			type: String,
			required: [true, 'Route name is required'],
			trim: true,
			unique: true
		},
		origin: {
			type: String,
			required: [true, 'Origin is required'],
			trim: true
		},
		destination: {
			type: String,
			required: [true, 'Destination is required'],
			trim: true
		},
		aircraftType: {
			type: String,
			required: [true, 'Aircraft type is required'],
			trim: true
		},
		departureTime: {
			type: String,
			required: [true, 'Departure time is required'],
			match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM']
		},
		arrivalTime: {
			type: String,
			required: [true, 'Arrival time is required'],
			match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM']
		},
		flightDuration: {
			type: Number,
			required: [true, 'Flight duration is required'],
			min: [0.5, 'Flight duration must be at least 0.5 hours']
		},
		pricePerKg: {
			type: Number,
			required: [true, 'Price per kg is required'],
			min: [0, 'Price per kg must be positive']
		},
		basePrice: {
			type: Number,
			required: [true, 'Base price is required'],
			min: [0, 'Base price must be positive']
		},
		maxWeight: {
			type: Number,
			required: [true, 'Max weight is required'],
			min: [1, 'Max weight must be at least 1 kg']
		},
		availableDays: {
			type: [String],
			required: true,
			enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
			default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
		},
		isActive: {
			type: Boolean,
			default: true
		},
		description: {
			type: String,
			trim: true,
			maxlength: [500, 'Description cannot exceed 500 characters']
		}
	},
	{
		timestamps: true
	}
);

/**
 * Calculate total price for a given weight
 */
RouteSchema.methods.calculatePrice = function(weight: number): number {
	return this.basePrice + (weight * this.pricePerKg);
};

/**
 * Check if route is available on a given date
 */
RouteSchema.methods.isAvailableOnDate = function(date: Date): boolean {
	const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const dayName = dayNames[date.getDay()];
	return this.isActive && this.availableDays.includes(dayName);
};

// Export model
export const Route = mongoose.models.Route || mongoose.model<IRoute>('Route', RouteSchema);
export default Route;
