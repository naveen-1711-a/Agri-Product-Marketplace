import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a professional Sales Bill PDF similar to a real tax invoice.
 * @param {Object} order - The order object from the DB
 * @param {Object} customerInfo - Optional override for customer info
 */
export function generateBill(order, customerInfo = null) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  const PAGE_W = doc.internal.pageSize.getWidth();
  const MARGIN = 28;
  const COL_MID = PAGE_W / 2;

  const PURPLE = [63, 47, 155];
  const LIGHT_PURPLE = [235, 232, 252];
  const GRAY = [90, 90, 90];
  const BLACK = [30, 30, 30];
  const WHITE = [255, 255, 255];
  const TABLE_HEAD_BG = [63, 47, 155];

  const order_id = `INV-${order._id.slice(-8).toUpperCase()}`;
  const order_date = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  const addr = order.shippingAddress || {};
  const customerName = customerInfo?.name || addr.name || order.customerName || 'Customer';
  const customerPhone = customerInfo?.phone || addr.phone || 'N/A';
  const customerAddress = addr.addressLine ? `${addr.addressLine}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}` : 'N/A';

  const subtotal = (order.products || []).reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = subtotal > 500 ? 0 : 60;
  const sgst = +(subtotal * 0.025).toFixed(2);
  const cgst = +(subtotal * 0.025).toFixed(2);
  const grandTotal = +(subtotal + shipping + sgst + cgst).toFixed(2);

  function toWords(n) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if (n === 0) return 'Zero';
    let str = '';
    if (n >= 1000) { str += ones[Math.floor(n / 1000)] + ' Thousand '; n %= 1000; }
    if (n >= 100) { str += ones[Math.floor(n / 100)] + ' Hundred '; n %= 100; }
    if (n >= 20) { str += tens[Math.floor(n / 10)] + ' '; n %= 10; }
    if (n > 0) { str += ones[n] + ' '; }
    return str.trim();
  }

  // ─── HEADER BAND ────────────────────────────────────────────────────────────
  doc.setFillColor(...PURPLE);
  doc.rect(0, 0, PAGE_W, 42, 'F');

  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('SALES BILL', PAGE_W / 2, 28, { align: 'center' });

  // ─── COMPANY BLOCK (left) + INVOICE META (right) ─────────────────────────
  let y = 54;
  doc.setTextColor(...BLACK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('EPM – Empowering Products Marketplace', MARGIN, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);

  const companyLines = [
    ['Business Name :', 'EPM Marketplace'],
    ['Address :', 'Village Hub, Tamil Nadu, India'],
    ['Phone Number :', '+91 98765 43210'],
    ['Email :', 'support@epm.in'],
  ];
  y += 14;
  companyLines.forEach(([label, val]) => {
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLACK);
    doc.text(label, MARGIN, y);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
    doc.text(val, MARGIN + 82, y);
    y += 13;
  });

  // Invoice meta on the right
  const metaY = 68;
  const rightX = COL_MID + 10;
  const metaLines = [
    ['Invoice No :', order_id],
    ['Invoice Date :', order_date],
    ['Payment :', order.paymentMethod || 'COD'],
    ['State :', addr.state || 'Tamil Nadu'],
    ['GSTIN :', 'N/A (Unregistered)'],
  ];
  let my = metaY;
  metaLines.forEach(([label, val]) => {
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLACK); doc.setFontSize(9);
    doc.text(label, rightX, my);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
    doc.text(val, rightX + 78, my);
    my += 13;
  });

  // ─── DIVIDER ─────────────────────────────────────────────────────────────
  y = Math.max(y, my) + 8;
  doc.setDrawColor(...PURPLE);
  doc.setLineWidth(1);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 10;

  // ─── BILL TO / SHIPPING TO SECTION ───────────────────────────────────────
  const boxH = 80;
  doc.setFillColor(...LIGHT_PURPLE);
  doc.setDrawColor(...PURPLE);
  doc.setLineWidth(0.8);
  doc.roundedRect(MARGIN, y, COL_MID - MARGIN - 6, boxH, 4, 4, 'FD');
  doc.roundedRect(COL_MID + 6, y, COL_MID - MARGIN - 6, boxH, 4, 4, 'FD');

  // Bill To header
  doc.setFillColor(...PURPLE);
  doc.roundedRect(MARGIN, y, COL_MID - MARGIN - 6, 18, 4, 4, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Bill To:', MARGIN + 8, y + 13);

  // Shipping To header
  doc.roundedRect(COL_MID + 6, y, COL_MID - MARGIN - 6, 18, 4, 4, 'F');
  doc.text('Shipping To:', COL_MID + 14, y + 13);

  const infoY = y + 26;
  const billLines = [
    ['Name :', customerName],
    ['Address :', addr.addressLine || 'N/A'],
    ['Phone No :', customerPhone],
    ['GSTIN :', 'N/A'],
    ['State :', addr.state || 'N/A'],
  ];

  billLines.forEach((row, i) => {
    const ly = infoY + i * 11;
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLACK); doc.setFontSize(8);
    doc.text(row[0], MARGIN + 6, ly);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
    doc.text(row[1], MARGIN + 50, ly, { maxWidth: COL_MID - MARGIN - 60 });

    doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLACK);
    doc.text(row[0], COL_MID + 14, ly);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
    doc.text(row[1], COL_MID + 58, ly, { maxWidth: COL_MID - MARGIN - 60 });
  });

  y += boxH + 14;

  // ─── ITEMS TABLE ─────────────────────────────────────────────────────────
  const tableRows = (order.products || []).map((item, idx) => [
    idx + 1,
    item.name,
    'N/A',     // HSN
    item.quantity || 1,
    `Rs. ${item.price.toFixed(2)}`,
    `Rs. ${(item.price * (item.quantity || 1)).toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['S.No', 'Goods Description', 'HSN', 'QTY', 'MRP', 'Amount']],
    body: tableRows,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 6, textColor: BLACK, lineColor: [180, 180, 180], lineWidth: 0.4 },
    headStyles: { fillColor: TABLE_HEAD_BG, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 32 },
      1: { cellWidth: 160 },
      2: { halign: 'center', cellWidth: 50 },
      3: { halign: 'center', cellWidth: 35 },
      4: { halign: 'right', cellWidth: 65 },
      5: { halign: 'right', cellWidth: 65 },
    },
    alternateRowStyles: { fillColor: [248, 248, 252] },
  });

  y = doc.lastAutoTable.finalY + 14;

  // ─── FOOTER: BANK DETAILS + TOTALS ───────────────────────────────────────
  const footerColW = COL_MID - MARGIN - 6;
  const rightColX = COL_MID + 6;
  const rightColW = COL_MID - MARGIN - 6;

  // Bank details box
  doc.setDrawColor(...PURPLE);
  doc.setLineWidth(0.8);
  doc.roundedRect(MARGIN, y, footerColW, 90, 4, 4, 'D');

  doc.setFillColor(...PURPLE);
  doc.roundedRect(MARGIN, y, footerColW, 18, 4, 4, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Bank Details', MARGIN + 8, y + 13);

  const bankLines = [
    ['Account Name :', 'EPM Marketplace'],
    ['Account Number :', '1234567890123456'],
    ['IFSC Code :', 'SBIN0001234'],
    ['Bank :', 'State Bank of India'],
    ['Branch :', 'Chennai Main Branch'],
  ];
  let by = y + 30;
  bankLines.forEach(([label, val]) => {
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLACK); doc.setFontSize(8);
    doc.text(label, MARGIN + 6, by);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
    doc.text(val, MARGIN + 82, by);
    by += 12;
  });

  // Totals box (right side)
  doc.setDrawColor(...PURPLE);
  doc.roundedRect(rightColX, y, rightColW, 90, 4, 4, 'D');

  const totals = [
    ['Discount', 'Rs. 0.00'],
    ['SGST (2.5%)', `Rs. ${sgst.toFixed(2)}`],
    ['CGST (2.5%)', `Rs. ${cgst.toFixed(2)}`],
    ['Shipping', shipping === 0 ? 'FREE' : `Rs. ${shipping}.00`],
  ];

  let ty = y + 14;
  totals.forEach(([label, val]) => {
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY); doc.setFontSize(9);
    doc.text(label, rightColX + 8, ty);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLACK);
    doc.text(val, rightColX + rightColW - 8, ty, { align: 'right' });
    ty += 14;
    doc.setDrawColor(220, 220, 220);
    doc.line(rightColX + 4, ty - 4, rightColX + rightColW - 4, ty - 4);
  });

  // Grand Total row
  doc.setFillColor(...PURPLE);
  doc.roundedRect(rightColX, ty - 2, rightColW, 22, 3, 3, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Total', rightColX + 8, ty + 13);
  doc.text(`Rs. ${grandTotal.toFixed(2)}`, rightColX + rightColW - 8, ty + 13, { align: 'right' });

  y += 100;

  // ─── AMOUNT IN WORDS ───────────────────────────────────────────────────
  doc.setFillColor(...LIGHT_PURPLE);
  doc.setDrawColor(...PURPLE);
  doc.setLineWidth(0.8);
  doc.roundedRect(MARGIN, y, PAGE_W - MARGIN * 2, 22, 4, 4, 'FD');
  doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLACK); doc.setFontSize(9);
  doc.text('Amount in Words:', MARGIN + 8, y + 15);
  doc.setFont('helvetica', 'italic'); doc.setTextColor(...GRAY);
  doc.text(`${toWords(Math.floor(grandTotal))} Rupees Only`, MARGIN + 100, y + 15);

  y += 30;

  // ─── FOOTER NOTE ─────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text('* This is a computer-generated invoice and does not require a physical signature.', PAGE_W / 2, y + 10, { align: 'center' });
  doc.text('Thank you for shopping with EPM – Empowering Products Marketplace!', PAGE_W / 2, y + 22, { align: 'center' });

  // ─── PURPLE BOTTOM BAND ───────────────────────────────────────────────────
  doc.setFillColor(...PURPLE);
  doc.rect(0, doc.internal.pageSize.getHeight() - 18, PAGE_W, 18, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('www.epm.in  |  support@epm.in  |  +91 98765 43210', PAGE_W / 2, doc.internal.pageSize.getHeight() - 6, { align: 'center' });

  doc.save(`EPM_Invoice_${order_id}.pdf`);
}
