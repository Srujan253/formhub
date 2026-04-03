import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './model/User.js';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const email = 'ksrujan026@gmail.com';
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      existingAdmin.role = 'admin';
      existingAdmin.isVerified = true;
      existingAdmin.password = 'villdesign@8088';
      await existingAdmin.save();
      console.log('Super Admin user updated successfully');
    } else {
      const managerUser = new User({
        name: 'Super Admin',
        email,
        password: 'villdesign@8088',
        role: 'admin',
        isVerified: true,
        about: 'Default System Super Admin',
      });
      await managerUser.save();
      console.log('Super Admin user created successfully');
    }

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

createSuperAdmin();
