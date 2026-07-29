import { Response } from 'express';
import Payslip from '../model/payslip.model.js';
import User from '../model/user.model.js';
import { AuthenticatedRequest } from '../middleware/verifyToken.js';
import APIFeatures from '../lib/apiFeatures.js';

export const createPayslip = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { staffId, month, basicSalary, allowances, deductions } = req.body;

    if (!staffId || !month || basicSalary === undefined) {
      return res.status(400).json({ message: 'Staff ID, Month and Basic Salary are required.' });
    }

    const staffUser = await User.findOne({ _id: staffId, role: 'Staff', society: req.user?.society });
    if (!staffUser) {
      return res.status(404).json({ message: 'Staff user not found in your society.' });
    }

    const basic = Number(basicSalary);
    const allow = Number(allowances || 0);
    const deduct = Number(deductions || 0);
    const netSalary = basic + allow - deduct;

    const payslip = await Payslip.create({
      staff: staffId,
      month,
      basicSalary: basic,
      allowances: allow,
      deductions: deduct,
      netSalary,
      status: 'paid',
      paymentDate: new Date(),
      society: req.user?.society,
    });

    res.status(201).json({
      message: 'Payslip generated and paid successfully.',
      data: payslip,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPayslips = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const societyId = req.user.society;
    let baseQuery = Payslip.find({ society: societyId });

    if (req.user.role === 'Staff') {
      baseQuery = Payslip.find({ staff: req.user.id, society: societyId });
    }

    const countFeatures = new APIFeatures(baseQuery.clone(), req.query)
      .filter()
      .search(['month']);
    const totalResults = await countFeatures.query.countDocuments();

    const features = new APIFeatures(baseQuery, req.query)
      .filter()
      .search(['month'])
      .sort()
      .paginate();

    const payslips = await features.query.populate('staff', 'name email phone');
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    res.status(200).json({
      message: 'success',
      totalResults,
      totalPages: Math.ceil(totalResults / limit),
      page,
      limit,
      data: payslips,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
