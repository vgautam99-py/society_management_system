import PDFDocument from 'pdfkit';

export const generateBillPDF = (bill: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));
    
    // Write PDF layout
    doc.fillColor('#1e3a8a').fontSize(24).text('SMS SOCIETY INVOICE', { align: 'center' });
    doc.moveDown(1);
    
    doc.fillColor('#334155').fontSize(12);
    doc.text(`Invoice ID: INV-${bill._id.toString().slice(-8).toUpperCase()}`);
    doc.text(`Period: ${bill.title}`);
    doc.text(`Amount Due: INR ${bill.amount.toLocaleString()}`);
    doc.text(`Due Date: ${new Date(bill.dueDate).toLocaleDateString()}`);
    doc.text(`Status: ${bill.status.toUpperCase()}`);
    doc.moveDown(1);
    
    doc.text(`Resident: ${bill.resident?.name || 'Resident Head'}`);
    doc.text(`Flat: ${bill.flat?.flatNumber || ''} - Block ${bill.flat?.block || ''}`);
    doc.moveDown(2);
    
    // Add payment gateway link
    doc.fillColor('#2563eb').text(`Click here to Pay with Razorpay:`, { underline: true });
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const paymentLink = `${clientUrl}/payment/checkout/${bill._id}`;
    doc.fillColor('#1d4ed8').text(paymentLink, { link: paymentLink });
    
    doc.end();
  });
};

export const generatePayslipPDF = (payslip: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));
    
    doc.fillColor('#1e3a8a').fontSize(24).text('STAFF SALARY SLIP', { align: 'center' });
    doc.moveDown(1);
    
    doc.fillColor('#334155').fontSize(12);
    doc.text(`Slip Reference: SLIP-${payslip._id.toString().slice(-8).toUpperCase()}`);
    doc.text(`Staff Member: ${payslip.staff?.name || ''}`);
    doc.text(`Period: ${payslip.month}`);
    doc.text(`Disbursement Date: ${new Date(payslip.paymentDate || payslip.createdAt).toLocaleDateString()}`);
    doc.moveDown(1);
    
    doc.text(`Basic Salary: INR ${payslip.basicSalary.toLocaleString()}`);
    doc.text(`Allowances: +INR ${payslip.allowances.toLocaleString()}`);
    doc.text(`Deductions: -INR ${payslip.deductions.toLocaleString()}`);
    doc.moveDown(1);
    
    doc.fillColor('#1e3a8a').fontSize(14).text(`Net Salary Paid: INR ${payslip.netSalary.toLocaleString()}`);
    
    doc.end();
  });
};
