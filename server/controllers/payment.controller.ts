import { Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/verifyToken.js';
import User from '../model/user.model.js';
import Bill from '../model/bill.model.js';

// Setup Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Secure server-side pricing mapping (converted from USD to INR at ~80 Rate)
const SUBSCRIPTION_PLANS: Record<string, { amountInINR: number; durationMonths: number }> = {
  'Free Trial': { amountInINR: 0, durationMonths: 1 },
  '3-Monthly': { amountInINR: 45 * 80, durationMonths: 3 },      // ₹3,600 total
  '6-Monthly': { amountInINR: 72 * 80, durationMonths: 6 },      // ₹5,760 total
  'Yearly Plan': { amountInINR: 120 * 80, durationMonths: 12 },  // ₹9,600 total
};

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { planName, billId } = req.body;
    if (!planName && !billId) {
      return res.status(400).json({ message: 'Plan name or Bill ID selection is required.' });
    }

    let amountInINR = 0;
    let receiptPrefix = 'receipt';

    if (planName) {
      const plan = SUBSCRIPTION_PLANS[planName];
      if (!plan) {
        return res.status(400).json({ message: 'Invalid pricing plan selected.' });
      }
      // Zero-value plans are processed directly
      if (plan.amountInINR === 0) {
        return res.status(400).json({ message: 'Free plans do not require a gateway transaction.' });
      }
      amountInINR = plan.amountInINR;
      receiptPrefix = 'receipt_sub';
    } else if (billId) {
      const bill = await Bill.findOne({ _id: billId, society: req.user?.society });
      if (!bill) {
        return res.status(404).json({ message: 'Bill statement not found.' });
      }
      if (bill.status === 'paid') {
        return res.status(400).json({ message: 'This bill has already been paid.' });
      }
      amountInINR = bill.amount;
      receiptPrefix = 'receipt_bill';
    }

    const options = {
      amount: Math.round(amountInINR * 100), // convert to paise
      currency: 'INR',
      receipt: `${receiptPrefix}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('Razorpay Order Creation Error:', error);
    const errorMsg = error.error?.description || error.description || error.message || 'Razorpay order creation failed';
    res.status(500).json({ message: errorMsg });
  }
};

export const verifyPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName, billId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'All signature verification parameters are required.' });
    }

    if (!planName && !billId) {
      return res.status(400).json({ message: 'Plan name or Bill ID is required for verification.' });
    }

    // Verify signature cryptographically using key_secret
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    if (planName) {
      const plan = SUBSCRIPTION_PLANS[planName];
      if (!plan) {
        return res.status(400).json({ message: 'Invalid pricing plan selection.' });
      }

      // Update user profile with new subscription plan
      const planStartDate = new Date();
      const planEndDate = new Date();
      planEndDate.setDate(planEndDate.getDate() + plan.durationMonths * 30);

      const user = await User.findByIdAndUpdate(
        req.user?.id,
        {
          planName,
          planStartDate,
          planEndDate,
        },
        { new: true }
      ).populate('flat');

      if (!user) {
        return res.status(404).json({ message: 'User profile not found.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Payment verified and subscription activated successfully!',
        data: user,
      });
    } else if (billId) {
      const bill = await Bill.findOne({ _id: billId, society: req.user?.society });
      if (!bill) {
        return res.status(404).json({ message: 'Bill statement not found.' });
      }

      bill.status = 'paid';
      bill.paymentDate = new Date();
      bill.transactionId = razorpay_payment_id;
      bill.paymentMethod = 'card';

      await bill.save();

      return res.status(200).json({
        success: true,
        message: 'Maintenance bill payment verified and processed successfully!',
        data: bill,
      });
    }
  } catch (error: any) {
    console.error('Razorpay Payment Verification Error:', error);
    const errorMsg = error.error?.description || error.description || error.message || 'Razorpay payment verification failed';
    res.status(500).json({ message: errorMsg });
  }
};
