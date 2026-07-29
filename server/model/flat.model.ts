import mongoose, { Schema, Document } from 'mongoose';

export interface IFlat extends Document {
  flatNumber: number;
  block: string;
  floor: number;
  isOccupied: boolean;
  society: mongoose.Types.ObjectId;
}

const flatSchema = new Schema<IFlat>({
  flatNumber: {
    type: Number,
    required: true,
  },
  block: {
    type: String,
    required: true,
  },
  floor: {
    type: Number,
    required: true,
  },
  isOccupied: {
    type: Boolean,
    default: false,
  },
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true,
  },
});

const Flat = mongoose.model<IFlat>('Flat', flatSchema);

export default Flat;
