import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function clear() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
    console.log('Connecting to DB at:', uri);
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const collectionsToClear = ['bills', 'complaints', 'gatelogs', 'notices', 'payslips', 'visitors', 'visitorlogs', 'logs'];
    
    for (const name of collectionsToClear) {
      try {
        await mongoose.connection.db.collection(name).deleteMany({});
        console.log(`Cleared collection: ${name}`);
      } catch (e) {
        console.log(`Collection ${name} clear skipped or not found:`, e.message);
      }
    }

    try {
      const userResult = await mongoose.connection.db.collection('users').deleteMany({ role: { $ne: 'Admin' } });
      console.log(`Cleared non-admin users. Deleted: ${userResult.deletedCount}`);
    } catch (e) {
      console.log('Failed to clear users:', e.message);
    }

    try {
      const flatResult = await mongoose.connection.db.collection('flats').updateMany({}, { $set: { isOccupied: false } });
      console.log(`Reset flats occupied status. Modified: ${flatResult.modifiedCount}`);
    } catch (e) {
      console.log('Failed to reset flats:', e.message);
    }

    console.log('✅ Database wiped successfully (except Admin users)!');
    process.exit(0);
  } catch (err) {
    console.error('Error wiping database:', err);
    process.exit(1);
  }
}

clear();
