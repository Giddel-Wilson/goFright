/**
 * PDF Service
 * Generates PDF documents for receipts and reports
 */

import PDFDocument from 'pdfkit';

/**
 * Payment receipt data interface
 */
interface ReceiptData {
	receiptNumber: string;
	cargoTrackingId: string;
	customerName: string;
	customerEmail: string;
	amount: number;
	currency: string;
	paymentMethod: string;
	paymentDate: Date;
	breakdown?: {
		baseCharge: number;
		weightCharge: number;
		distanceCharge: number;
		specialHandling?: number;
		insurance?: number;
		tax?: number;
	};
	cargoDetails: {
		origin: string;
		destination: string;
		weight: number;
		cargoType: string;
	};
}

/**
 * Generate payment receipt PDF
 * @param data - Receipt data
 * @returns PDF buffer
 */
export async function generateReceiptPDF(data: ReceiptData): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		try {
			const doc = new PDFDocument({ margin: 50 });
			const chunks: Buffer[] = [];

			// Collect PDF data
			doc.on('data', (chunk) => chunks.push(chunk));
			doc.on('end', () => resolve(Buffer.concat(chunks)));
			doc.on('error', reject);

			// Header
			doc.fontSize(24)
				.fillColor('#1B263B')
				.text('GOفRIGHT', { align: 'center' })
				.moveDown(0.5);

			doc.fontSize(10)
				.fillColor('#666')
				.text('Cargo Freight Management System', { align: 'center' })
				.moveDown(2);

			// Receipt Title
			doc.fontSize(18)
				.fillColor('#3A506B')
				.text('PAYMENT RECEIPT', { align: 'center', underline: true })
				.moveDown(2);

			// Receipt Information
			doc.fontSize(10).fillColor('#000');
			
			doc.text(`Receipt Number: ${data.receiptNumber}`, { continued: true })
				.text(`Date: ${data.paymentDate.toLocaleDateString()}`, { align: 'right' });
			doc.moveDown();

			doc.font('Helvetica-Bold').text(`Tracking ID: ${data.cargoTrackingId}`).font('Helvetica');
			doc.moveDown(2);

			// Customer Information
			doc.fontSize(12)
				.fillColor('#1B263B')
				.text('Customer Information', { underline: true })
				.moveDown(0.5);

			doc.fontSize(10).fillColor('#000');
			doc.text(`Name: ${data.customerName}`);
			doc.text(`Email: ${data.customerEmail}`);
			doc.moveDown(2);

			// Cargo Details
			doc.fontSize(12)
				.fillColor('#1B263B')
				.text('Cargo Details', { underline: true })
				.moveDown(0.5);

			doc.fontSize(10).fillColor('#000');
			doc.text(`Origin: ${data.cargoDetails.origin}`);
			doc.text(`Destination: ${data.cargoDetails.destination}`);
			doc.text(`Weight: ${data.cargoDetails.weight} kg`);
			doc.text(`Type: ${data.cargoDetails.cargoType}`);
			doc.moveDown(2);

			// Payment Breakdown
			if (data.breakdown) {
				doc.fontSize(12)
					.fillColor('#1B263B')
					.text('Payment Breakdown', { underline: true })
					.moveDown(0.5);

				doc.fontSize(10).fillColor('#000');
				
				const breakdown = data.breakdown;
				doc.text(`Base Charge: ${data.currency} ${breakdown.baseCharge.toFixed(2)}`);
				doc.text(`Weight Charge: ${data.currency} ${breakdown.weightCharge.toFixed(2)}`);
				doc.text(`Distance Charge: ${data.currency} ${breakdown.distanceCharge.toFixed(2)}`);
				
				if (breakdown.specialHandling) {
					doc.text(`Special Handling: ${data.currency} ${breakdown.specialHandling.toFixed(2)}`);
				}
				if (breakdown.insurance) {
					doc.text(`Insurance: ${data.currency} ${breakdown.insurance.toFixed(2)}`);
				}
				if (breakdown.tax) {
					doc.text(`Tax: ${data.currency} ${breakdown.tax.toFixed(2)}`);
				}
				
				doc.moveDown();
				doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
				doc.moveDown(0.5);
			}

			// Total Amount
			doc.font('Helvetica-Bold')
				.fontSize(14)
				.fillColor('#1B263B')
				.text(`Total Amount: ${data.currency} ${data.amount.toFixed(2)}`)
				.font('Helvetica')
				.moveDown(0.5);

			doc.fontSize(10).fillColor('#000');
			doc.text(`Payment Method: ${data.paymentMethod}`);
			doc.fillColor('#4CAF50').text(`Status: PAID`).fillColor('#000');
			doc.moveDown(3);

			// Footer
			doc.fontSize(8)
				.fillColor('#999')
				.text('Thank you for choosing GoFright!', { align: 'center' })
				.moveDown(0.5);

			doc.text('This is a computer-generated receipt and does not require a signature.', 
				{ align: 'center' });

			doc.moveDown();
			doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

			// Finalize PDF
			doc.end();
		} catch (error) {
			reject(error);
		}
	});
}

/**
 * Send PDF as response
 * @param pdfBuffer - PDF buffer
 * @param filename - Download filename
 * @returns Response with PDF
 */
export function sendPDFResponse(pdfBuffer: Buffer, filename: string): Response {
	return new Response(pdfBuffer as unknown as BodyInit, {
		status: 200,
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `attachment; filename="${filename}"`,
			'Content-Length': pdfBuffer.length.toString()
		}
	});
}
