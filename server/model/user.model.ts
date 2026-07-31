import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  username?: string;
  phone?: number;
  password?: string;
  role: 'Admin' | 'Staff' | 'Resident';
  isActive: boolean;
  profilePhoto?: string;
  flat?: mongoose.Types.ObjectId;
  otp?: string;
  otpExpiresIn?: Date;
  society: mongoose.Types.ObjectId;
  dob?: Date;
  joiningDate?: Date;
  staffRole?: 'Guard' | 'Technician' | 'Cleaner' | 'Manager' | 'Gardener' | 'Other';
  age?: number;
  attendanceStatus?: 'Present & Free' | 'Present & Working' | 'Leave';
  gender?: 'Male' | 'Female' | 'Other';
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Other';
  numberOfChildren?: number;
  totalFamilyMembers?: number;
  relationWithOwner?: string;
  isFlatOwner?: boolean;
  planName?: string;
  planStartDate?: Date;
  planEndDate?: Date;
  token?: string;
  firebaseToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: [true, 'Email is required'],
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    phone: {
      type: Number,
    },
    password: {
      type: String,
      trim: true,
      required: false, // Optional for OTP-only login users
    },
    role: {
      type: String,
      enum: ['Admin', 'Staff', 'Resident'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profilePhoto: {
      type: String,
    },
    flat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flat',
    },
    otp: {
      type: String,
    },
    otpExpiresIn: {
      type: Date,
    },
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: true,
    },
    dob: {
      type: Date,
    },
    joiningDate: {
      type: Date,
    },
    staffRole: {
      type: String,
      enum: ['Guard', 'Technician', 'Cleaner', 'Manager', 'Gardener', 'Other'],
    },
    age: {
      type: Number,
    },
    attendanceStatus: {
      type: String,
      enum: ['Present & Free', 'Present & Working', 'Leave'],
      default: 'Present & Free',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    maritalStatus: {
      type: String,
      enum: ['Single', 'Married', 'Divorced', 'Widowed', 'Other'],
    },
    numberOfChildren: {
      type: Number,
    },
    totalFamilyMembers: {
      type: Number,
    },
    relationWithOwner: {
      type: String,
      default: 'Self',
    },
    isFlatOwner: {
      type: Boolean,
      default: true,
    },
    planName: {
      type: String,
      default: 'Free Trial',
    },
    planStartDate: {
      type: Date,
      default: Date.now,
    },
    planEndDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    token: {
      type: String,
    },
    firebaseToken: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
