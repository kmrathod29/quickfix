// scripts/testConnection.js - Test MongoDB connection
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function testConnection() {
  try {
    console.log('🔌 Testing MongoDB connection...');
    console.log('📍 URI:', process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/QuickFix');
    console.log('✅ Connected to MongoDB successfully');
    
    // Test database access
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name));
    
    // Test users collection
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log('👥 Users count:', userCount);
    
    // Test specific query
    if (userCount > 0) {
      const techCount = await usersCollection.countDocuments({ role: 'technician' });
      console.log('🔧 Technicians count:', techCount);
      
      if (techCount > 0) {
        const sampleTech = await usersCollection.findOne({ role: 'technician' });
        console.log('📋 Sample technician:', {
          name: sampleTech?.name,
          skills: sampleTech?.skills,
          location: sampleTech?.location ? 'Has location' : 'No location'
        });
      }
    }
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected successfully');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.code) {
      console.error('💡 Error code:', error.code);
    }
    process.exit(1);
  }
}

testConnection();