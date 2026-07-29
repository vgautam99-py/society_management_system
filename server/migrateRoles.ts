import dotenv from 'dotenv';
import connectDb from './db/config.js';
import User from './model/user.model.js';

dotenv.config();

const runMigration = async () => {
  try {
    await connectDb();
    console.log('🔄 Running Role Migration...');

    // Convert 'admin' (case-insensitive or old value) to 'Admin'
    const adminRes = await User.updateMany(
      { role: { $in: ['admin', 'ADMIN'] } },
      { $set: { role: 'Admin' } }
    );
    console.log(`Updated ${adminRes.modifiedCount} Admin users.`);

    // Convert 'resident' to 'Member'
    const memberRes = await User.updateMany(
      { role: { $in: ['resident', 'RESIDENT'] } },
      { $set: { role: 'Member' } }
    );
    console.log(`Updated ${memberRes.modifiedCount} Member users.`);

    // Convert 'guard', 'security_guard', 'employee', 'staff' to 'Staff'
    const staffRes = await User.updateMany(
      { role: { $in: ['guard', 'security_guard', 'employee', 'staff', 'GUARD', 'EMPLOYEE', 'STAFF'] } },
      { $set: { role: 'Staff' } }
    );
    console.log(`Updated ${staffRes.modifiedCount} Staff users.`);

    console.log('✅ Role Migration Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
