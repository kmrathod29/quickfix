// scripts/createIndexes.js - Create required MongoDB indexes
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/QuickFix');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function createIndexes() {
  try {
    console.log('🔧 Creating MongoDB indexes...');
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Create 2dsphere index for location-based queries
    console.log('📍 Creating 2dsphere index for location field...');
    await usersCollection.createIndex({ "location": "2dsphere" });
    console.log('✅ Location index created successfully');
    
    // Create compound index for role and availability
    console.log('👥 Creating compound index for role and availability...');
    await usersCollection.createIndex({ "role": 1, "isAvailable": 1 });
    console.log('✅ Role/availability index created');
    
    // Create index for skills array
    console.log('🔧 Creating index for skills field...');
    await usersCollection.createIndex({ "skills": 1 });
    console.log('✅ Skills index created');
    
    // Create index for email (if not already exists)
    console.log('📧 Creating index for email field...');
    try {
      await usersCollection.createIndex({ "email": 1 }, { unique: true });
      console.log('✅ Email index created');
    } catch (error) {
      if (error.code === 85) {
        console.log('ℹ️  Email index already exists');
      } else {
        console.log('⚠️  Email index creation failed:', error.message);
      }
    }
    
    // List all indexes to verify
    console.log('\n📋 Current indexes on users collection:');
    const indexes = await usersCollection.listIndexes().toArray();
    indexes.forEach((index, i) => {
      console.log(`   ${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    console.log('\n✨ Index creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

async function main() {
  console.log('🗄️  QuickFix MongoDB Index Creation');
  console.log('===================================\n');
  
  await connectDB();
  await createIndexes();
  
  console.log('\n💡 Next steps:');
  console.log('   1. Run: npm run seed:technicians');
  console.log('   2. Test location queries with seeded data');
  console.log('   3. Check your Google Maps API billing settings');
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default main;