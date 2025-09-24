// scripts/simpleSeed.js - Simple seeding for testing
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';

dotenv.config();

async function simpleSeed() {
  try {
    console.log('🚀 Starting simple seed...');
    
    // Connect
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/QuickFix');
    console.log('✅ Connected to MongoDB');
    
    // Clear existing technicians
    const deleteResult = await User.deleteMany({ role: 'technician' });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing technicians`);
    
    // Create one test technician
    const hashedPassword = await bcrypt.hash('password123', 12);
    console.log('🔑 Password hashed');
    
    const technician = new User({
      name: 'Test Technician',
      email: 'test@quickfix.com',
      passwordHash: hashedPassword,
      phone: '+1-555-TEST',
      role: 'technician',
      address: 'Test Location',
      skills: ['plumbing', 'general repairs'],
      isAvailable: true,
      serviceRadius: 15,
      location: {
        type: 'Point',
        coordinates: [-74.0060, 40.7128] // NYC
      },
      locationUpdatedAt: new Date(),
      isVerified: true
    });
    
    await technician.save();
    console.log('✅ Created test technician');
    
    // Create index
    await User.collection.createIndex({ location: '2dsphere' });
    console.log('📍 Created location index');
    
    // Test query
    const nearby = await User.find({
      role: 'technician',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [-74.0060, 40.7128]
          },
          $maxDistance: 10000
        }
      }
    });
    
    console.log(`🔍 Found ${nearby.length} nearby technicians`);
    
    await mongoose.disconnect();
    console.log('✨ Simple seed completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

simpleSeed();