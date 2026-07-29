import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function list() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('Databases list:');
    for (const db of dbs.databases) {
      console.log(`- Db: ${db.name} (Size: ${db.sizeOnDisk} bytes)`);
      const connection = mongoose.createConnection(`${uri}${db.name}`);
      await new Promise(resolve => connection.once('open', resolve));
      const collections = await connection.db.listCollections().toArray();
      for (const col of collections) {
        const count = await connection.db.collection(col.name).countDocuments({});
        console.log(`    * Collection: ${col.name} (Count: ${count})`);
      }
      await connection.close();
    }
    process.exit(0);
  } catch (err) {
    console.error('Error listing databases:', err);
    process.exit(1);
  }
}

list();
