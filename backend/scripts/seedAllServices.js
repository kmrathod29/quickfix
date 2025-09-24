// scripts/seedAllServices.js - Create technicians for all service types
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';

dotenv.config();

const allServiceTechnicians = [
  {
    name: 'Mike Johnson',
    email: 'mike.plumber@quickfix.com',
    phone: '+1-555-0101',
    skills: ['plumbing', 'pipe repairs', 'drain cleaning'],
    address: 'Downtown District',
    coordinates: [-74.0060, 40.7128]  // NYC
  },
  {
    name: 'Sarah Davis',
    email: 'sarah.electrician@quickfix.com', 
    phone: '+1-555-0102',
    skills: ['electrical', 'wiring', 'lighting'],
    address: 'Midtown Area',
    coordinates: [-74.0070, 40.7138]
  },
  {
    name: 'David Wilson',
    email: 'david.carpenter@quickfix.com',
    phone: '+1-555-0103',
    skills: ['carpentry', 'furniture repair', 'woodwork'],
    address: 'East Side',
    coordinates: [-74.0050, 40.7118]
  },
  {
    name: 'Lisa Martinez',
    email: 'lisa.ac@quickfix.com',
    phone: '+1-555-0104',
    skills: ['ac', 'hvac', 'cooling systems'],
    address: 'West Side',
    coordinates: [-74.0080, 40.7148]
  },
  {
    name: 'James Brown',
    email: 'james.painter@quickfix.com',
    phone: '+1-555-0105',
    skills: ['painting', 'interior design', 'wall repair'],
    address: 'North District',
    coordinates: [-74.0040, 40.7158]
  },
  {
    name: 'Emily Chen',
    email: 'emily.appliance@quickfix.com',
    phone: '+1-555-0106',
    skills: ['appliance', 'refrigeration', 'electronics'],
    address: 'South District',
    coordinates: [-74.0055, 40.7108]
  },
  {
    name: 'Robert Taylor',
    email: 'robert.multi@quickfix.com',
    phone: '+1-555-0107',
    skills: ['plumbing', 'electrical', 'general repairs'],
    address: 'Central Area',
    coordinates: [-74.0065, 40.7125]
  }
];

async function seedAllServices() {
  try {
    console.log('🚀 Starting comprehensive service seeding...');
    
    // Connect
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/QuickFix');
    console.log('✅ Connected to MongoDB');
    
    // Clear existing technicians
    const deleteResult = await User.deleteMany({ role: 'technician' });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing technicians`);
    
    // Create technicians for all services
    console.log(`👥 Creating ${allServiceTechnicians.length} technicians...`);
    
    let createdCount = 0;
    
    for (const techData of allServiceTechnicians) {
      try {
        const hashedPassword = await bcrypt.hash('password123', 12);
        
        const technician = new User({
          name: techData.name,
          email: techData.email,
          passwordHash: hashedPassword,
          phone: techData.phone,
          role: 'technician',
          address: techData.address,
          skills: techData.skills,
          isAvailable: true,
          serviceRadius: 15,
          location: {
            type: 'Point',
            coordinates: techData.coordinates
          },
          locationUpdatedAt: new Date(),
          isVerified: true
        });
        
        await technician.save();
        console.log(`✅ Created: ${techData.name} (${techData.skills.join(', ')})`);
        createdCount++;
        
      } catch (error) {
        console.error(`❌ Error creating ${techData.name}:`, error.message);
      }
    }
    
    // Create indexes
    await User.collection.createIndex({ location: '2dsphere' });
    console.log('📍 Created location index');
    
    console.log(`\n📊 Created ${createdCount} technicians successfully!`);
    
    // Test each service type
    console.log('\n🧪 Testing service availability:');
    const serviceTypes = ['plumbing', 'electrical', 'carpentry', 'ac', 'painting', 'appliance'];
    
    for (const serviceType of serviceTypes) {
      const count = await User.countDocuments({
        role: 'technician',
        skills: { $in: [serviceType] },
        isAvailable: true
      });
      console.log(`   ${serviceType}: ${count} technicians available`);
    }
    
    await mongoose.disconnect();
    console.log('\n✨ Comprehensive seeding completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedAllServices();