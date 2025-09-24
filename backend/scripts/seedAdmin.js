// scripts/seedAdmin.js
// Create an admin user if it does not exist.
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@quickfix.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

if (!MONGO_URI) {
  console.error('MONGO_URI is missing in .env');
  process.exit(1);
}

(async function run(){
  try {
    await mongoose.connect(MONGO_URI);
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log('Admin already exists:', ADMIN_EMAIL);
      process.exit(0);
    }
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const admin = await User.create({
      name: 'Admin',
      email: ADMIN_EMAIL,
      passwordHash,
      phone: '0000000000',
      role: 'admin'
    });
    console.log('Admin created:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error('Seed admin error:', err.message);
    process.exit(1);
  }
})();