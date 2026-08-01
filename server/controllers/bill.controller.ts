import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Bill from '../model/bill.model.js';
import Flat from '../model/flat.model.js';
import User from '../model/user.model.js';
import APIFeatures from '../lib/apiFeatures.js';
import { AuthenticatedRequest } from '../middleware/verifyToken.js';

export const createBill = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { flatId, title, amount, dueDate } = req.body;

    if (!flatId || !title || !amount || !dueDate) {
      return res.status(400).json({ message: 'All billing fields are required.' });
    }

    const flat = await Flat.findOne({ _id: flatId, society: req.user?.society });
    if (!flat) {
      return res.status(404).json({ message: 'Flat not found in your society.' });
    }

    const resident = await User.findOne({ flat: flatId, society: req.user?.society, isActive: true });
    if (!resident) {
      return res.status(400).json({ 
        message: 'No active resident is currently registered to this flat. Please assign a user first.' 
      });
    }

    const bill = await Bill.create({
      flat: flatId,
      resident: resident._id,
      title,
      amount,
      dueDate,
      status: 'pending',
      society: req.user?.society,
    });

    res.status(201).json({
      message: 'Bill issued successfully.',
      data: bill,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBills = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const societyId = req.user.society;
    let baseQuery = Bill.find({ society: societyId });

    if (req.user.role === 'Resident') {
      baseQuery = Bill.find({ resident: req.user.id, society: societyId });
    }

    const countFeatures = new APIFeatures(baseQuery.clone(), req.query)
      .filter()
      .search(['title']);
    const totalResults = await countFeatures.query.countDocuments();

    const features = new APIFeatures(baseQuery, req.query)
      .filter()
      .search(['title'])
      .sort()
      .paginate();

    const bills = await features.query
      .populate('flat', 'flatNumber block floor')
      .populate('resident', 'name email phone');

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    res.status(200).json({
      message: 'success',
      totalResults,
      totalPages: Math.ceil(totalResults / limit),
      page,
      limit,
      data: bills,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const payBill = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required.' });
    }

    const bill = await Bill.findOne({ _id: id, society: req.user?.society });
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found.' });
    }

    if (req.user.role === 'Resident' && bill.resident.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: Cannot pay another resident\'s bill.' });
    }

    if (bill.status === 'paid') {
      return res.status(400).json({ message: 'This bill has already been paid.' });
    }

    const mockTxn = `TXN-${Date.now()}-${Math.floor(10000 + Math.random() * 90000)}`;

    bill.status = 'paid';
    bill.paymentDate = new Date();
    bill.transactionId = mockTxn;
    bill.paymentMethod = paymentMethod;

    await bill.save();

    res.status(200).json({
      message: 'Payment processed successfully.',
      data: bill,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBillStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const societyId = new mongoose.Types.ObjectId(req.user?.society);

    const totalBilled = await Bill.aggregate([
      { $match: { society: societyId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalCollected = await Bill.aggregate([
      { $match: { status: 'paid', society: societyId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const unpaidCount = await Bill.countDocuments({ status: { $ne: 'paid' }, society: req.user?.society });
    const paidCount = await Bill.countDocuments({ status: 'paid', society: req.user?.society });

    const billedSum = totalBilled[0]?.total || 0;
    const collectedSum = totalCollected[0]?.total || 0;
    const outstandingSum = billedSum - collectedSum;

    res.status(200).json({
      message: 'success',
      data: {
        totalBilled: billedSum,
        totalCollected: collectedSum,
        totalOutstanding: outstandingSum,
        unpaidCount,
        paidCount,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPublicBill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bill = await Bill.findById(id).populate('flat').populate('resident', 'name email phone');
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.status(200).json({ message: 'success', data: bill });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const completePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMethod, transactionId } = req.body;

    const bill = await Bill.findById(id).populate('resident');
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (bill.status === 'paid') {
      return res.status(400).json({ message: 'Bill already paid' });
    }

    bill.status = 'paid';
    bill.paymentDate = new Date();
    bill.paymentMethod = paymentMethod || 'upi';
    bill.transactionId = transactionId || `TXN-${Date.now()}`;
    await bill.save();

    res.status(200).json({ message: 'Payment completed successfully', data: bill });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
