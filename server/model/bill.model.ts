import mongoose, { Schema, Document } from 'mongoose';

export interface IBill extends Document {
  flat: mongoose.Types.ObjectId;
  resident: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid';
  paymentDate?: Date;
  transactionId?: string;
  paymentMethod?: 'card' | 'upi' | 'netbanking' | 'cash';
  society: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema = new Schema<IBill>(
  {
    flat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flat',
      required: true,
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    paymentDate: {
      type: Date,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'cash'],
    },
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: true,
    },
  },
  { timestamps: true }
);

const Bill = mongoose.model<IBill>('Bill', BillSchema);

export default Bill;
