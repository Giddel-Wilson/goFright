/**
 * User Model
 * Manages user accounts for Admin, Freight Officer, and Customer roles
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Role Enum
 */
export enum UserRole {
	ADMIN = 'admin',
	FREIGHT_OFFICER = 'freight_officer',
	CUSTOMER = 'customer'
}

/**
 * User Interface
 */
export interface IUser extends Document {
	name: string;
	email: string;
	password_hash: string;
	role: UserRole;
	phone?: string;
	address?: string;
	photoUrl?: string;
	// Demographics
	gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
	dateOfBirth?: Date;
	nationality?: string;
	stateOfOrigin?: string;
	city?: string;
	state?: string;
	// Location (for freight officers)
	country?: string;
	location?: string;
	latitude?: number;
	longitude?: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	// Methods
	comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * User Schema Definition
 */
const UserSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
			trim: true,
			minlength: [2, 'Name must be at least 2 characters'],
			maxlength: [100, 'Name cannot exceed 100 characters']
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
		},
		password_hash: {
			type: String,
			required: [true, 'Password is required'],
			minlength: [8, 'Password must be at least 8 characters']
		},
		role: {
			type: String,
			enum: Object.values(UserRole),
			default: UserRole.CUSTOMER,
			required: true
		},
		phone: {
			type: String,
			trim: true,
			match: [/^[\d\s+()-]+$/, 'Please provide a valid phone number']
		},
		address: {
			type: String,
			trim: true,
			maxlength: [500, 'Address cannot exceed 500 characters']
		},
		photoUrl: {
			type: String,
			trim: true
		},
		// Demographics for analytics
		gender: {
			type: String,
			enum: ['male', 'female', 'other', 'prefer_not_to_say'],
			trim: true
		},
		dateOfBirth: {
			type: Date
		},
		nationality: {
			type: String,
			trim: true,
			maxlength: [100, 'Nationality cannot exceed 100 characters']
		},
		stateOfOrigin: {
			type: String,
			trim: true,
			maxlength: [100, 'State of origin cannot exceed 100 characters']
		},
		city: {
			type: String,
			trim: true,
			maxlength: [100, 'City cannot exceed 100 characters']
		},
		state: {
			type: String,
			trim: true,
			maxlength: [100, 'State cannot exceed 100 characters']
		},
		// Location data for freight officers
		country: {
			type: String,
			trim: true,
			maxlength: [100, 'Country cannot exceed 100 characters']
		},
		location: {
			type: String,
			trim: true,
			maxlength: [200, 'Location cannot exceed 200 characters']
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
		},
		isActive: {
			type: Boolean,
			default: true
		}
	},
	{
		timestamps: true,
		strict: false,
		toJSON: {
			transform: (_doc, ret: Record<string, unknown>) => {
				delete ret.password_hash;
				delete ret.__v;
				return ret;
			}
		}
	}
);

/**
 * Pre-save middleware to hash password
 */
UserSchema.pre('save', async function (next) {
	if (!this.isModified('password_hash')) {
		return next();
	}

	try {
		const salt = await bcrypt.genSalt(10);
		this.password_hash = await bcrypt.hash(this.password_hash, salt);
		next();
	} catch (error) {
		next(error as Error);
	}
});

/**
 * Method to compare password for authentication
 */
UserSchema.methods.comparePassword = async function (
	candidatePassword: string
): Promise<boolean> {
	return bcrypt.compare(candidatePassword, this.password_hash);
};

/**
 * Index for faster queries
 * Note: email already has unique index from schema definition
 */
UserSchema.index({ role: 1 });

/**
 * User Model
 */
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
