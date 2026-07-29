import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './model/user.model.js';
import Role from './model/role.model.js';

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/');
    console.log('Connected to DB');

    const users = await User.find({}).populate('role');
    console.log(`Found ${users.length} users in DB:`);
    for (const u of users) {
      const match = await bcrypt.compare('password123', u.password);
      console.log(`- ${u.name} | ${u.email} | Role: ${u.role?.role} | Password match 'password123': ${match}`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

check();
