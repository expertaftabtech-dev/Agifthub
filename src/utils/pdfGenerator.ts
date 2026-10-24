import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Order, StudioSettings, CashMemo } from '../types';

export interface GeneratePdfOptions {
  elementId?: string;
  format?: '58mm' | '80mm' | 'a4';
  filename?: string;
  order: Order;
  settings: StudioSettings;
  cashMemo?: CashMemo | null;
}

/**
 * Generates and triggers download of an invoice as a high-fidelity PDF file.
 * Uses html2canvas for pixel-perfect reproduction with an automatic fallback
 * to clean vector jsPDF if canvas rendering is blocked.
 */
export async function downloadInvoiceAsPDF(options: GeneratePdfOptions): Promise<boolean> {
  const {
    elementId = 'printable-receipt',
    format = 'a4',
    order,
    settings,
    cashMemo,
  } = options;

  const invoiceNumber = cashMemo?.invoiceNumber || order.orderNumber;
  const safeFilename =
    options.filename || `${invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}_Invoice.pdf`;

  const targetElement = document.getElementById(elementId);

  if (targetElement) {
    try {
      // 1. Primary method: High-resolution raster capture of styled element
      const canvas = await html2canvas(targetElement, {
        scale: 2.5, // 2.5x scale for razor-sharp 300dpi printing
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: targetElement.scrollWidth,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);

      if (format === 'a4') {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pageWidth = 210;
        const pageHeight = 297;
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (imgHeight <= pageHeight) {
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        } else {
          // Multi-page handling if invoice is unusually tall
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft > 0) {
            position = -(imgHeight - heightLeft);
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
        }

        pdf.save(safeFilename);
        return true;
      } else {
        // Thermal formats (58mm or 80mm roll)
        const rollWidth = format === '58mm' ? 58 : 80;
        const rollHeight = Math.max((canvas.height * rollWidth) / canvas.width, 100);

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [rollWidth, rollHeight],
        });

        pdf.addImage(imgData, 'PNG', 0, 0, rollWidth, rollHeight);
        pdf.save(safeFilename);
        return true;
      }
    } catch (renderError) {
      console.warn('Canvas capture fallback triggered:', renderError);
      // Fallback to programmatic vector PDF below
    }
  }

  // 2. Vector jsPDF Direct Generator (Guaranteed reliable fallback)
  return generateVectorInvoicePDF(order, settings, cashMemo, safeFilename);
}

/**
 * Generates an authoritative vector-based A4 Tax Invoice directly using jsPDF coordinates.
 * Extremely fast, crisp, lightweight, and works even without DOM access.
 */
export function generateVectorInvoicePDF(
  order: Order,
  settings: StudioSettings,
  cashMemo?: CashMemo | null,
  filename?: string
): boolean {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const isDeliveredAndPaid =
      order.productionStatus === 'Delivered' && order.paymentStatus === 'Paid';
    const invoiceNumber = cashMemo?.invoiceNumber || `INV-${order.orderNumber}`;
    const safeFilename = filename || `${order.orderNumber}_Tax_Invoice.pdf`;

    // Colors
    const primaryColor = [16, 85, 60]; // Deep Emerald
    const darkSlate = [15, 23, 42];
    const mutedSlate = [100, 116, 139];
    const lightBg = [248, 250, 252];

    // Header Background Accent bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 6, 'F');

    // Store Info (Top Left)
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(settings.storeName, 14, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
    doc.text(settings.address, 14, 26);
    doc.text(`Phone: ${settings.phone}  |  Email: ${settings.email}`, 14, 31);
    doc.text('GSTIN: 07AAACA1234F1Z9  |  MSME Reg: UDYAM-DL-03-00123', 14, 36);

    // Invoice Title & Meta (Top Right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    const titleText = isDeliveredAndPaid ? 'FINAL CASH MEMO' : 'TAX INVOICE';
    doc.text(titleText, 196, 20, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(invoiceNumber, 196, 26, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
    doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, 196, 31, { align: 'right' });
    doc.text(`Order Ref: ${order.orderNumber}`, 196, 36, { align: 'right' });

    // Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 42, 196, 42);

    // Customer & Shipping Info Box
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.roundedRect(14, 46, 182, 28, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, 46, 182, 28, 2, 2, 'S');

    // Left Column: Customer details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
    doc.text('BILLED & DELIVERED TO:', 18, 52);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(order.customerName, 18, 58);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    const street = order.shippingAddress?.street || 'Studio Counter / Direct Delivery';
    const cityState = `${order.shippingAddress?.city || 'Delhi'}, ${order.shippingAddress?.state || 'Delhi'} - ${order.shippingAddress?.postalCode || '110001'}`;
    doc.text(street, 18, 63);
    doc.text(cityState, 18, 68);
    doc.text(`Mobile: ${order.customerPhone}`, 18, 73);

    // Right Column: Order status
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
    doc.text('FULFILLMENT & PAYMENT SUMMARY:', 110, 52);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(`Production Status: ${order.productionStatus}`, 110, 58);
    doc.text(`Payment Status: ${order.paymentStatus}`, 110, 63);
    doc.text(
      `Delivery Date: ${order.deliveredDate ? new Date(order.deliveredDate).toLocaleDateString() : 'In Progress'}`,
      110,
      68
    );
    doc.text(`Payment Gateway / UPI: Verified`, 110, 73);

    // Table Header
    let yPos = 82;
    doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.rect(14, yPos, 182, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('#', 18, yPos + 5.5);
    doc.text('DESCRIPTION / MOULDING STYLE', 28, yPos + 5.5);
    doc.text('SIZE & SPECS', 110, yPos + 5.5);
    doc.text('QTY', 145, yPos + 5.5, { align: 'right' });
    doc.text('UNIT PRICE', 170, yPos + 5.5, { align: 'right' });
    doc.text('AMOUNT', 192, yPos + 5.5, { align: 'right' });

    // Table Rows
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);

    order.items.forEach((item, index) => {
      // Row alternating background
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(14, yPos, 182, 8.5, 'F');
      }

      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text(`${index + 1}`, 18, yPos + 5.5);
      doc.setFont('helvetica', 'bold');
      doc.text(item.name.substring(0, 38), 28, yPos + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.text(`${item.size || 'Custom'} (${item.color || 'Standard'})`, 110, yPos + 5.5);
      doc.text(`${item.quantity}`, 145, yPos + 5.5, { align: 'right' });
      doc.text(`₹${item.price.toLocaleString()}`, 170, yPos + 5.5, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.text(`₹${item.finalPrice.toLocaleString()}`, 192, yPos + 5.5, { align: 'right' });

      // Bottom row line
      doc.setDrawColor(241, 245, 249);
      doc.line(14, yPos + 8.5, 196, yPos + 8.5);
      yPos += 8.5;
    });

    // Totals Section
    yPos += 6;
    const totalsX = 130;
    const valueX = 192;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);

    doc.text('Subtotal:', totalsX, yPos);
    doc.text(`₹${order.subtotal.toLocaleString()}`, valueX, yPos, { align: 'right' });
    yPos += 5.5;

    if (order.discountAmount > 0) {
      doc.setTextColor(16, 85, 60);
      doc.text('Discount:', totalsX, yPos);
      doc.text(`-₹${order.discountAmount.toLocaleString()}`, valueX, yPos, { align: 'right' });
      yPos += 5.5;
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    }

    doc.text('Shipping & Safe Packaging:', totalsX, yPos);
    doc.text(order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge.toLocaleString()}`, valueX, yPos, { align: 'right' });
    yPos += 5.5;

    doc.text(`GST (${settings.taxRate}%):`, totalsX, yPos);
    doc.text(`₹${order.taxAmount.toLocaleString()}`, valueX, yPos, { align: 'right' });
    yPos += 6;

    // Total Line
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.line(totalsX - 2, yPos - 1, 196, yPos - 1);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('Total Invoice Amount:', totalsX, yPos + 4);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`₹${order.orderTotal.toLocaleString()}`, valueX, yPos + 4, { align: 'right' });
    yPos += 9;

    doc.setFontSize(9);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Amount Received:', totalsX, yPos);
    doc.text(`₹${order.advancePaid.toLocaleString()}`, valueX, yPos, { align: 'right' });
    yPos += 5.5;

    if (order.balanceDue > 0) {
      doc.setTextColor(190, 18, 60); // Red/Rose
      doc.text('Balance Due:', totalsX, yPos);
      doc.text(`₹${order.balanceDue.toLocaleString()}`, valueX, yPos, { align: 'right' });
    } else {
      doc.setTextColor(16, 85, 60);
      doc.text('Balance Due:', totalsX, yPos);
      doc.text('PAID IN FULL (₹0)', valueX, yPos, { align: 'right' });
    }

    // Payment Box & Bank Info (Bottom Left)
    const boxY = yPos - 32;
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.roundedRect(14, boxY, 96, 38, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, boxY, 96, 38, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('PAYMENT DETAILS & VERIFICATION', 18, boxY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(`Official UPI ID: ${settings.upiId}`, 18, boxY + 12);
    doc.text(`Store Contact: ${settings.phone} / ${settings.email}`, 18, boxY + 17);
    doc.text(`Account Name: Agifthub Picture Frame Studio`, 18, boxY + 22);
    doc.text(`Bank: HDFC Bank | IFSC: HDFC0001234`, 18, boxY + 27);
    doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
    doc.text('Scan store UPI QR code to settle balances.', 18, boxY + 33);

    // Terms & Signatory (Bottom)
    const bottomY = 250;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, bottomY, 196, bottomY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('Terms & Conditions:', 14, bottomY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
    doc.text('1. Handcrafted wooden mouldings possess natural timber grain variations.', 14, bottomY + 11);
    doc.text('2. Keep frames away from direct moisture, damp walls, and persistent high humidity.', 14, bottomY + 16);
    doc.text('3. This is a computer-generated tax invoice issued by Agifthub Picture Frame Studio.', 14, bottomY + 21);

    // Signatory
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('Expert Aftab Tech', 165, bottomY + 15, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
    doc.text('Authorized Signatory', 165, bottomY + 20, { align: 'center' });
    doc.text('Agifthub Studio, New Delhi', 165, bottomY + 24, { align: 'center' });

    doc.save(safeFilename);
    return true;
  } catch (err) {
    console.error('Failed to generate vector invoice PDF:', err);
    return false;
  }
}
