// scripts/fixInvalidLocations.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/user.model.js';

dotenv.config();

async function run(){
  try {
    await connectDB();
    console.log('Connected to DB');

    // Unset location where coordinates are missing or empty array
    const res = await User.updateMany(
      {
        'location.type': 'Point',
        $or: [
          { 'location.coordinates': { $exists: false } },
          { 'location.coordinates': { $size: 0 } },
          { 'location.coordinates': null }
        ]
      },
      {
        $unset: { location: "" },
        $set: { locationUpdatedAt: null }
      }
    );

    console.log(`Fixed documents: ${res.modifiedCount}`);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected');
  }
}

run();
