import Flat from '../model/flat.model.js';
import User from '../model/user.model.js';
import Bill from '../model/bill.model.js';
import transporter from './sendMail.js';
import { generateBillPDF } from './pdfGenerator.js';

export const runAutomatedBilling = async (): Promise<void> => {
  try {
    // Determine previous month's string designation
    const today = new Date();
    const previousDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const monthName = previousDate.toLocaleString('default', { month: 'long' });
    const billingPeriod = `${monthName} ${previousDate.getFullYear()}`;
    const billTitle = `Maintenance Bill - ${billingPeriod}`;

    // Verify if bills for this period were already processed
    const existingBill = await Bill.findOne({ title: billTitle });
    if (existingBill) {
      console.log(`ℹ️ Automated Billing: Monthly bills for "${billingPeriod}" were already generated.`);
      return;
    }

    console.log(`⚙️ Automated Billing: Starting bill generation for "${billingPeriod}"...`);

    const occupiedFlats = await Flat.find({ isOccupied: true });
    let count = 0;

    for (const flat of occupiedFlats) {
      // Find the active resident head registered to this flat
      const resident = await User.findOne({ flat: flat._id, role: 'Resident', isActive: true });
      if (!resident) continue;

      // 15 days due date
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      const bill = await Bill.create({
        flat: flat._id,
        resident: resident._id,
        title: billTitle,
        amount: 2500,
        dueDate,
        status: 'pending',
        society: flat.society,
      });

      count++;

      // Fetch populated object for PDF builder
      const populatedBill = await Bill.findById(bill._id)
        .populate('flat')
        .populate('resident');

      try {
        const pdfBuffer = await generateBillPDF(populatedBill);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const paymentLink = `${clientUrl}/payment/checkout/${bill._id}`;

        await transporter.sendMail({
          from: `SMS Society Portal <${process.env.SMTP_USER}>`,
          to: resident.email,
          subject: `🔔 Monthly Maintenance Bill Issued - ${billingPeriod}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #1e3a8a;">Monthly Maintenance Statement</h2>
              <p>Dear ${resident.name},</p>
              <p>Your monthly society maintenance invoice for <strong>${billingPeriod}</strong> has been issued automatically.</p>
              
              <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                <table style="width: 100%; font-size: 14px;">
                  <tr><td><strong>Flat Number:</strong></td><td>${flat.flatNumber} (${flat.block} Block)</td></tr>
                  <tr><td><strong>Amount Due:</strong></td><td>INR 2,500</td></tr>
                  <tr><td><strong>Due Date:</strong></td><td>${dueDate.toLocaleDateString()}</td></tr>
                </table>
              </div>

              <p>Your invoice PDF has been attached to this email. Please click the button below to complete payment securely online via Razorpay:</p>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${paymentLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Pay with Razorpay</a>
              </div>
              
              <p style="color: #64748b; font-size: 11px;">If you have any questions, please contact the Admin desk.</p>
            </div>
          `,
          attachments: [
            {
              filename: `Invoice_${billingPeriod.replace(' ', '_')}.pdf`,
              content: pdfBuffer,
            }
          ]
        });
      } catch (err: any) {
        console.warn(`⚠️ SMTP automatic bill dispatch failed for ${resident.email}:`, err.message);
      }
    }

    console.log(`✅ Automated Billing: Generated and sent ${count} bills for "${billingPeriod}".`);
  } catch (error: any) {
    console.error('❌ Automated billing process encountered an error:', error.message);
  }
};

export const initBillingWorker = (): void => {
  // Check/run at startup
  runAutomatedBilling();

  // Run check every 24 hours
  setInterval(() => {
    runAutomatedBilling();
  }, 24 * 60 * 60 * 1000);

  console.log('⏰ Automated Billing worker registered successfully.');
};
