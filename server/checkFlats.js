import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Flat from './model/flat.model.js';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/');
  console.log('Database Name:', mongoose.connection.name);
  const flats = await Flat.find({});
  console.log('Flats in DB count:', flats.length);
  console.log('Flats:', flats);
  process.exit(0);
}
check();
