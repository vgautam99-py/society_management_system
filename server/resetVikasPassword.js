import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './model/user.model.js';

dotenv.config();

async function reset() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/');
    console.log('Connected to DB');

    const hashedPassword = await bcrypt.hash('password123', 12);
    const result = await User.findOneAndUpdate(
      { email: 'vikas1726gh@gmail.com' },
      { password: hashedPassword },
      { new: true }
    );

    if (result) {
      console.log('Successfully updated password for vikas1726gh@gmail.com to password123');
    } else {
      console.log('User vikas1726gh@gmail.com not found');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

reset();
