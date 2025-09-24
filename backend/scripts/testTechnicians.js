// scripts/testTechnicians.js - Test technician APIs
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = process.env.API_BASE || 'http://localhost:9000';

// Test functions
async function testNearbyTechnicians() {
  try {
    console.log('🔍 Testing nearby technicians API...');
    
    // Test with NYC coordinates
    const lat = 40.7128;
    const lng = -74.0060;
    const radius = 20;
    
    console.log(`   Location: ${lat}, ${lng}`);
    console.log(`   Radius: ${radius}km`);
    
    const url = `${API_BASE}/api/location/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Found ${data.technicians.length} nearby technicians`);
      data.technicians.forEach(tech => {
        console.log(`      • ${tech.name} (${tech.skills.join(', ')}) - ${tech.distance}km away`);
      });
    } else {
      console.log(`   ❌ Error: ${data.message}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`);
  }
}

async function testTechniciansByService() {
  try {
    console.log('🔧 Testing technicians by service type...');
    
    const services = ['plumbing', 'electrical', 'ac', 'painting', 'appliance'];
    
    for (const service of services) {
      const url = `${API_BASE}/api/technician/all?serviceType=${service}&available=true`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`   ${service}: ${data.technicians.length} technicians`);
      } else {
        console.log(`   ${service}: Error - ${data.message}`);
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`);
  }
}

async function testAllTechnicians() {
  try {
    console.log('👥 Testing all technicians API...');
    
    const url = `${API_BASE}/api/technician/all?available=true`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Found ${data.technicians.length} available technicians`);
      console.log(`   📄 Pagination: Page ${data.pagination.page} of ${data.pagination.pages}`);
      
      // Show first 3 technicians
      const sample = data.technicians.slice(0, 3);
      sample.forEach(tech => {
        console.log(`      • ${tech.name} - Skills: ${tech.skills.join(', ')}`);
      });
    } else {
      console.log(`   ❌ Error: ${data.message}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`);
  }
}

// Main test function
async function runTests() {
  console.log('🧪 QuickFix Technician API Tests');
  console.log('=================================\n');
  
  console.log(`🌐 Testing against: ${API_BASE}\n`);
  
  await testAllTechnicians();
  console.log('');
  
  await testTechniciansByService();
  console.log('');
  
  await testNearbyTechnicians();
  console.log('');
  
  console.log('✨ Tests completed!');
  console.log('\n💡 Tips:');
  console.log('   • Make sure your backend server is running: npm run dev');
  console.log('   • Seed technicians first: npm run seed:technicians');
  console.log('   • Check MongoDB connection in .env file');
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export default runTests;