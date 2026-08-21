import PDFDocument from 'pdfkit';

/**
 * PDF Document Generator Service using PDFKit
 * Streams formatted PDF invoice to HTTP response
 */
export const buildInvoicePdfStream = (invoiceData, res) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Pipe PDF document directly to HTTP response stream
  doc.pipe(res);

  // Top Dark Header Banner
  doc.fillColor('#0F172A').rect(0, 0, 595.28, 90).fill();
  doc.fillColor('#D4AF37').fontSize(22).font('Helvetica-Bold').text('AURELIA RESORT & SPA', 40, 25);
  doc.fillColor('#94A3B8').fontSize(9).font('Helvetica').text('LUXURY BEACHFRONT HOTEL & VIP SUITES • TAX INVOICE', 40, 52);

  // Invoice Number & Date (Right Aligned)
  doc.fillColor('#FFFFFF').fontSize(12).font('Helvetica-Bold').text(`INVOICE: ${invoiceData.invoiceNumber}`, 350, 28, { align: 'right', width: 200 });
  doc.fillColor('#CBD5E1').fontSize(9).font('Helvetica').text(`Date: ${invoiceData.invoiceDate}`, 350, 48, { align: 'right', width: 200 });

  // Guest Details Card
  doc.fillColor('#F8FAFC').roundedRect(40, 110, 515, 75, 8).fill();
  doc.strokeColor('#CBD5E1').lineWidth(0.5).roundedRect(40, 110, 515, 75, 8).stroke();

  doc.fillColor('#1E293B').fontSize(10).font('Helvetica-Bold').text('Billed To (Guest Profile):', 55, 122);
  doc.fillColor('#0F172A').fontSize(10).font('Helvetica-Bold').text(invoiceData.booking.guestName, 55, 138);
  doc.fillColor('#64748B').fontSize(8.5).font('Helvetica').text(`${invoiceData.booking.guestEmail}  •  ${invoiceData.booking.guestPhone}`, 55, 154);

  doc.fillColor('#1E293B').fontSize(10).font('Helvetica-Bold').text('Stay Details:', 340, 122);
  doc.fillColor('#0F172A').fontSize(8.5).font('Helvetica').text(`Room: ${invoiceData.booking.roomNumber} (${invoiceData.booking.roomCategory})`, 340, 138);
  doc.fillColor('#64748B').fontSize(8.5).font('Helvetica').text(`Dates: ${invoiceData.booking.checkIn} → ${invoiceData.booking.checkOut} (${invoiceData.booking.totalNights} Nights)`, 340, 154);

  // Line Items Table Header
  let y = 205;
  doc.fillColor('#1E293B').rect(40, y, 515, 24).fill();
  doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold');
  doc.text('DESCRIPTION', 50, y + 7);
  doc.text('QTY', 320, y + 7, { width: 50, align: 'center' });
  doc.text('UNIT PRICE', 380, y + 7, { width: 70, align: 'right' });
  doc.text('TOTAL', 460, y + 7, { width: 80, align: 'right' });

  y += 24;

  // Line Items Rows
  invoiceData.lineItems.forEach((item, index) => {
    const bgColor = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    doc.fillColor(bgColor).rect(40, y, 515, 22).fill();
    doc.strokeColor('#E2E8F0').lineWidth(0.5).rect(40, y, 515, 22).stroke();

    doc.fillColor('#1E293B').fontSize(8.5).font('Helvetica').text(item.description, 50, y + 6);
    doc.fillColor('#475569').text(String(item.quantity), 320, y + 6, { width: 50, align: 'center' });
    doc.fillColor('#475569').text(`$${item.unitPrice.toLocaleString()}`, 380, y + 6, { width: 70, align: 'right' });
    doc.fillColor('#0F172A').font('Helvetica-Bold').text(`$${item.total.toLocaleString()}`, 460, y + 6, { width: 80, align: 'right' });

    y += 22;
  });

  y += 15;

  // Taxes & Discounts Side-by-Side Boxes
  const boxWidth = 250;

  // Taxes Box (+)
  doc.fillColor('#F1F5F9').roundedRect(40, y, boxWidth, 75, 6).fill();
  doc.strokeColor('#CBD5E1').lineWidth(0.5).roundedRect(40, y, boxWidth, 75, 6).stroke();
  doc.fillColor('#0F172A').fontSize(9.5).font('Helvetica-Bold').text('Taxes Breakdown (+)', 50, y + 10);
  let taxY = y + 28;
  invoiceData.taxes.forEach((tax) => {
    doc.fillColor('#475569').fontSize(8).font('Helvetica').text(tax.name, 50, taxY);
    doc.fillColor('#0F172A').font('Helvetica-Bold').text(`+$${tax.amount.toLocaleString()}`, 170, taxY, { width: 110, align: 'right' });
    taxY += 16;
  });

  // Discounts Box (-)
  doc.fillColor('#FEF3C7').roundedRect(305, y, boxWidth, 75, 6).fill();
  doc.strokeColor('#FCD34D').lineWidth(0.5).roundedRect(305, y, boxWidth, 75, 6).stroke();
  doc.fillColor('#78350F').fontSize(9.5).font('Helvetica-Bold').text('Discounts & Promos (-)', 315, y + 10);
  let discY = y + 28;
  invoiceData.discounts.forEach((disc) => {
    doc.fillColor('#92400E').fontSize(8).font('Helvetica').text(disc.name, 315, discY);
    doc.fillColor('#B45309').font('Helvetica-Bold').text(`-$${disc.amount.toLocaleString()}`, 435, discY, { width: 110, align: 'right' });
    discY += 16;
  });

  y += 90;

  // Payment History Section
  doc.fillColor('#0F172A').fontSize(10).font('Helvetica-Bold').text('Payment History & Transactions', 40, y);
  y += 16;

  doc.fillColor('#F8FAFC').rect(40, y, 515, 20).fill();
  doc.fillColor('#94A3B8').fontSize(8).font('Helvetica-Bold');
  doc.text('TX REF', 50, y + 5);
  doc.text('DATE', 140, y + 5);
  doc.text('METHOD', 230, y + 5);
  doc.text('STATUS', 370, y + 5);
  doc.text('AMOUNT PAID', 450, y + 5, { width: 95, align: 'right' });

  y += 20;

  invoiceData.paymentHistory.forEach((pay) => {
    doc.fillColor('#FFFFFF').rect(40, y, 515, 20).fill();
    doc.strokeColor('#E2E8F0').lineWidth(0.5).rect(40, y, 515, 20).stroke();

    doc.fillColor('#B45309').fontSize(8).font('Helvetica-Bold').text(pay.id, 50, y + 5);
    doc.fillColor('#475569').font('Helvetica').text(pay.date, 140, y + 5);
    doc.fillColor('#475569').text(pay.method, 230, y + 5);
    doc.fillColor('#10B981').font('Helvetica-Bold').text(pay.status, 370, y + 5);
    doc.fillColor('#0F172A').font('Helvetica-Bold').text(`$${pay.amount.toLocaleString()}`, 450, y + 5, { width: 95, align: 'right' });

    y += 20;
  });

  y += 20;

  // Summary Totals Box (Right Aligned)
  doc.fillColor('#0F172A').roundedRect(300, y, 255, 95, 8).fill();

  doc.fillColor('#94A3B8').fontSize(8.5).font('Helvetica').text('Subtotal:', 315, y + 12);
  doc.fillColor('#FFFFFF').text(`$${invoiceData.subtotal.toLocaleString()}`, 440, y + 12, { width: 100, align: 'right' });

  doc.fillColor('#94A3B8').text('Taxes (+):', 315, y + 26);
  doc.fillColor('#60A5FA').text(`+$${invoiceData.totalTaxes.toLocaleString()}`, 440, y + 26, { width: 100, align: 'right' });

  doc.fillColor('#94A3B8').text('Discounts (-):', 315, y + 40);
  doc.fillColor('#F59E0B').text(`-$${invoiceData.totalDiscounts.toLocaleString()}`, 440, y + 40, { width: 100, align: 'right' });

  doc.fillColor('#D4AF37').fontSize(11).font('Helvetica-Bold').text('Grand Total:', 315, y + 58);
  doc.fillColor('#D4AF37').fontSize(11).font('Helvetica-Bold').text(`$${invoiceData.grandTotal.toLocaleString()}`, 440, y + 58, { width: 100, align: 'right' });

  doc.fillColor('#10B981').fontSize(9.5).font('Helvetica-Bold').text('Amount Paid:', 315, y + 76);
  doc.fillColor('#10B981').fontSize(9.5).font('Helvetica-Bold').text(`$${invoiceData.totalPaid.toLocaleString()}`, 440, y + 76, { width: 100, align: 'right' });

  // Footer
  doc.fillColor('#94A3B8').fontSize(8).font('Helvetica')
    .text('Aurelia Resort & Spa • 100 Grand Horizon Drive • VAT Reg: #TAX-8899201', 40, 770, { align: 'center', width: 515 });

  doc.end();
};
