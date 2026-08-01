import Flat from '../model/flat.model.js';
import User from '../model/user.model.js';
import Bill from '../model/bill.model.js';

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
