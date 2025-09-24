// scripts/seedTechnicians.js - Seed sample technician data
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';

dotenv.config();

// Sample technician data with realistic information
const sampleTechnicians = [
  {
    name: "Mike Johnson",
    email: "mike.plumber@quickfix.com",
    password: "password123",
    phone: "+1-555-0101",
    role: "technician",
    address: "Downtown District",
    skills: ["plumbing", "general repairs"],
    isAvailable: true,
    serviceRadius: 15,
    location: {
      type: "Point",
      coordinates: [-74.0060, 40.7128] // New York City area
    }
  },
  {
    name: "Sarah Davis",
    email: "sarah.electrician@quickfix.com", 
    password: "password123",
    phone: "+1-555-0102",
    role: "technician",
    address: "Midtown Area",
    skills: ["electrical", "lighting"],
    isAvailable: true,
    serviceRadius: 20,
    location: {
      type: "Point",
      coordinates: [-74.0070, 40.7138]
    }
  },
  {
    name: "David Wilson",
    email: "david.carpenter@quickfix.com",
    password: "password123", 
    phone: "+1-555-0103",
    role: "technician",
    address: "East Side",
    skills: ["carpentry", "furniture repair"],
    isAvailable: true,
    serviceRadius: 12,
    location: {
      type: "Point",
      coordinates: [-74.0050, 40.7118]
    }
  },
  {
    name: "Lisa Martinez",
    email: "lisa.ac@quickfix.com",
    password: "password123",
    phone: "+1-555-0104", 
    role: "technician",
    address: "West Side",
    skills: ["ac", "hvac", "refrigeration"],
    isAvailable: true,
    serviceRadius: 25,
    location: {
      type: "Point",
      coordinates: [-74.0080, 40.7148]
    }
  },
  {
    name: "James Brown",
    email: "james.painter@quickfix.com",
    password: "password123",
    phone: "+1-555-0105",
    role: "technician", 
    address: "North District",
    skills: ["painting", "wall repair"],
    isAvailable: true,
    serviceRadius: 18,
    location: {
      type: "Point",
      coordinates: [-74.0040, 40.7158]
    }
  },
  {
    name: "Emily Chen",
    email: "emily.appliance@quickfix.com",
    password: "password123",
    phone: "+1-555-0106",
    role: "technician",
    address: "South District", 
    skills: ["appliance", "washing machine", "refrigerator"],
    isAvailable: true,
    serviceRadius: 22,
    location: {
      type: "Point",
      coordinates: [-74.0055, 40.7108]
    }
  },
  {
    name: "Robert Taylor",
    email: "robert.multi@quickfix.com",
    password: "password123",
    phone: "+1-555-0107",
    role: "technician",
    address: "Central Area",
    skills: ["plumbing", "electrical", "general repairs"],
    isAvailable: true,
    serviceRadius: 30,
    location: {
      type: "Point",
      coordinates: [-74.0065, 40.7125]
    }
  },
  {
    name: "Jessica Wilson",
    email: "jessica.specialist@quickfix.com", 
    password: "password123",
    phone: "+1-555-0108",
    role: "technician",
    address: "Uptown",
    skills: ["ac", "electrical"],
    isAvailable: false, // Currently offline
    serviceRadius: 15,
    location: {
      type: "Point",
      coordinates: [-74.0075, 40.7168]
    }
  },
  {
    name: "Kevin Garcia",
    email: "kevin.handyman@quickfix.com",
    password: "password123", 
    phone: "+1-555-0109",
    role: "technician",
    address: "Riverside",
    skills: ["carpentry", "plumbing", "painting"],
    isAvailable: true,
    serviceRadius: 20,
    location: {
      type: "Point",
      coordinates: [-74.0045, 40.7135]
    }
  },
  {
    name: "Maria Rodriguez",
    email: "maria.expert@quickfix.com",
    password: "password123",
    phone: "+1-555-0110", 
    role: "technician",
    address: "Harbor District",
    skills: ["appliance", "electrical", "ac"],
    isAvailable: true,
    serviceRadius: 25,
    location: {
      type: "Point",
      coordinates: [-74.0035, 40.7115]
    }
  }
];

// Additional technicians for different areas (Los Angeles coordinates)
const additionalTechnicians = [
  {
    name: "Tom Anderson",
    email: "tom.la@quickfix.com",
    password: "password123",
    phone: "+1-555-0201",
    role: "technician", 
    address: "Hollywood",
    skills: ["plumbing", "general repairs"],
    isAvailable: true,
    serviceRadius: 15,
    location: {
      type: "Point",
      coordinates: [-118.2437, 34.0522] // Los Angeles
    }
  },
  {
    name: "Anna Thompson",
    email: "anna.la@quickfix.com",
    password: "password123",
    phone: "+1-555-0202",
    role: "technician",
    address: "Santa Monica", 
    skills: ["electrical", "lighting"],
    isAvailable: true,
    serviceRadius: 12,
    location: {
      type: "Point",
      coordinates: [-118.2547, 34.0622]
    }
  }
];

// Combine all technicians
const allTechnicians = [...sampleTechnicians, ...additionalTechnicians];

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/QuickFix');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function seedTechnicians() {
  try {
    console.log('🌱 Starting technician seeding process...');
    
    // Clear existing technicians (optional - comment out to preserve existing data)
    console.log('🗑️  Clearing existing technician data...');
    await User.deleteMany({ role: 'technician' });
    
    console.log(`👥 Creating ${allTechnicians.length} sample technicians...`);
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const techData of allTechnicians) {
      try {
        // Check if technician already exists
        const existingTech = await User.findOne({ email: techData.email });
        if (existingTech) {
          console.log(`⚠️  Technician ${techData.name} already exists, skipping...`);
          skippedCount++;
          continue;
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(techData.password, 12);
        
        // Create technician
        const technician = new User({
          name: techData.name,
          email: techData.email,
          passwordHash: hashedPassword,
          phone: techData.phone,
          role: techData.role,
          address: techData.address,
          skills: techData.skills,
          isAvailable: techData.isAvailable,
          serviceRadius: techData.serviceRadius,
          location: techData.location,
          locationUpdatedAt: new Date(),
          isVerified: true // Auto-verify for demo purposes
        });
        
        await technician.save();
        console.log(`✅ Created technician: ${techData.name} (${techData.skills.join(', ')})`);
        createdCount++;
        
      } catch (error) {
        console.error(`❌ Error creating technician ${techData.name}:`, error.message);
      }
    }
    
    console.log('\n📊 Seeding Summary:');
    console.log(`   • Created: ${createdCount} technicians`);
    console.log(`   • Skipped: ${skippedCount} technicians`);
    console.log(`   • Total: ${createdCount + skippedCount} technicians processed`);
    
    // Display some sample queries
    console.log('\n🔍 Sample queries you can test:');
    console.log('   • Find plumbers: GET /api/location/nearby?latitude=40.7128&longitude=-74.0060&serviceType=plumbing');
    console.log('   • Find electricians: GET /api/location/nearby?latitude=40.7128&longitude=-74.0060&serviceType=electrical');
    console.log('   • Find all nearby (10km): GET /api/location/nearby?latitude=40.7128&longitude=-74.0060&radius=10');
    
  } catch (error) {
    console.error('❌ Error seeding technicians:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding
async function main() {
  console.log('🚀 QuickFix Technician Seeding Script');
  console.log('=====================================\n');
  
  await connectDB();
  await seedTechnicians();
  
  console.log('\n✨ Seeding complete! You can now test the technician search functionality.');
  console.log('💡 Tip: Use the Services page to find nearby technicians with location enabled.');
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default main;