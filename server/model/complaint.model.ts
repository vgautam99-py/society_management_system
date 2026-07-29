import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaint extends Document {
  title: string;
  description: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed';
  resident: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  society: mongoose.Types.ObjectId;
}

const complaintSchema = new Schema<IComplaint>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed'],
    default: 'pending',
  },
  resident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true,
  },
});

const Complaint = mongoose.model<IComplaint>('Complaint', complaintSchema);

export default Complaint;
