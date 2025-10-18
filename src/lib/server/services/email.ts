/**
 * Email Service
 * Handles email notifications using Nodemailer
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { Notification, NotificationType, NotificationStatus } from '../db/models';

/**
 * Email transporter (configured once)
 */
let transporter: Transporter | null = null;

/**
 * Initialize email transporter
 */
function getTransporter(): Transporter {
	if (!transporter) {
		transporter = nodemailer.createTransport({
			host: process.env.EMAIL_HOST || 'smtp.gmail.com',
			port: parseInt(process.env.EMAIL_PORT || '587'),
			secure: false, // true for 465, false for other ports
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASSWORD
			}
		});
	}
	return transporter;
}

/**
 * Email options interface
 */
interface EmailOptions {
	to: string;
	subject: string;
	text?: string;
	html?: string;
	userId?: string;
	cargoId?: string;
}

/**
 * Send email notification
 * @param options - Email configuration
 * @returns Success status
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
	try {
		const transport = getTransporter();
		
		const mailOptions = {
			from: process.env.EMAIL_FROM || 'GoFright <noreply@gofright.com>',
			to: options.to,
			subject: options.subject,
			text: options.text,
			html: options.html
		};

		// Create notification record
		const notification = await Notification.create({
			userId: options.userId,
			cargoId: options.cargoId,
			type: NotificationType.EMAIL,
			status: NotificationStatus.PENDING,
			subject: options.subject,
			message: options.text || options.html || '',
			recipient: options.to
		});

		try {
			// Send email
			const info = await transport.sendMail(mailOptions);
			
			// Update notification status
			notification.status = NotificationStatus.SENT;
			notification.sentAt = new Date();
			notification.metadata = { messageId: info.messageId };
			await notification.save();

			console.log('📧 Email sent:', info.messageId);
			return true;
		} catch (error) {
			// Update notification with error
			notification.status = NotificationStatus.FAILED;
			notification.errorMessage = error instanceof Error ? error.message : 'Unknown error';
			await notification.save();

			console.error('📧 Email send failed:', error);
			return false;
		}
	} catch (error) {
		console.error('📧 Email service error:', error);
		return false;
	}
}

/**
 * Send cargo status update email
 */
export async function sendCargoStatusEmail(
	email: string,
	trackingId: string,
	status: string,
	userId: string,
	cargoId: string
): Promise<boolean> {
	const subject = `Cargo Update: ${trackingId}`;
	const html = `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2 style="color: #1B263B;">GoFright - Cargo Status Update</h2>
			<p>Your cargo shipment has been updated.</p>
			<div style="background-color: #f4f4f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
				<p><strong>Tracking ID:</strong> ${trackingId}</p>
				<p><strong>New Status:</strong> <span style="color: #3A506B; font-weight: bold;">${status}</span></p>
			</div>
			<p>Track your shipment at: <a href="${process.env.PUBLIC_APP_URL}/track/${trackingId}">Track Now</a></p>
			<hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
			<p style="color: #666; font-size: 12px;">This is an automated message from GoFright Cargo System.</p>
		</div>
	`;

	return sendEmail({
		to: email,
		subject,
		html,
		userId,
		cargoId
	});
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
	email: string,
	name: string,
	userId: string
): Promise<boolean> {
	const subject = 'Welcome to GoFright!';
	const html = `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2 style="color: #1B263B;">Welcome to GoFright, ${name}! 🚚</h2>
			<p>Thank you for registering with our cargo freight management system.</p>
			<p>You can now:</p>
			<ul>
				<li>Book cargo shipments</li>
				<li>Track your packages in real-time</li>
				<li>Manage your account</li>
				<li>Access delivery reports</li>
			</ul>
			<a href="${process.env.PUBLIC_APP_URL}/login" 
			   style="display: inline-block; padding: 12px 24px; background-color: #3A506B; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
				Get Started
			</a>
			<hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
			<p style="color: #666; font-size: 12px;">This is an automated message from GoFright Cargo System.</p>
		</div>
	`;

	return sendEmail({
		to: email,
		subject,
		html,
		userId
	});
}
