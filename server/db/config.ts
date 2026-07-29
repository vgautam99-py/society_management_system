import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Override Node's default DNS servers to Google and Cloudflare DNS to avoid Jio querySrv ECONNREFUSED issues
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err: any) {
  console.warn('⚠️ Failed to set default DNS servers:', err.message);
}

const connectDb = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is missing.');
    }
    await mongoose.connect(uri);
    console.log('✅ MONGODB IS UP');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
  }
};

export default connectDb;
