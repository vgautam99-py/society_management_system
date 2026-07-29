import mongoose, { Schema, Document } from 'mongoose';

export interface ISociety extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const societySchema = new Schema<ISociety>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Society = mongoose.model<ISociety>('Society', societySchema);
export default Society;
