import mongoose, { Schema, Document } from 'mongoose';

export interface INotice extends Document {
  title: string;
  description: string;
  postedBy: mongoose.Types.ObjectId;
  expiryDate?: Date;
  society: mongoose.Types.ObjectId;
}

const noticeSchema = new Schema<INotice>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expiryDate: {
    type: Date,
  },
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true,
  },
});

const Notice = mongoose.model<INotice>('Notice', noticeSchema);

export default Notice;
