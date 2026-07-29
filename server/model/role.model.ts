import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  role: 'Admin' | 'Staff' | 'Resident';
  roleDescription?: string;
}

const roleSchema = new Schema<IRole>({
  role: {
    type: String,
    enum: ['Admin', 'Staff', 'Resident'],
    trim: true,
    unique: true,
    required: true,
  },
  roleDescription: {
    type: String,
  },
});

const Role = mongoose.model<IRole>('Role', roleSchema);

export default Role;
