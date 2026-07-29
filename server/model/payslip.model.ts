import mongoose, { Schema, Document } from 'mongoose';

export interface IPayslip extends Document {
  staff: mongoose.Types.ObjectId;
  month: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'paid' | 'pending';
  paymentDate?: Date;
  society: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const payslipSchema = new Schema<IPayslip>(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Staff reference is required'],
    },
    month: {
      type: String,
      required: [true, 'Month/Year is required'],
    },
    basicSalary: {
      type: Number,
      required: [true, 'Basic Salary is required'],
    },
    allowances: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['paid', 'pending'],
      default: 'paid',
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: true,
    },
  },
  { timestamps: true }
);

const Payslip = mongoose.model<IPayslip>('Payslip', payslipSchema);
export default Payslip;
