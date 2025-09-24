// models/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ["user", "technician", "admin"], default: "user" },
    address: { type: String },
    avatarUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    // Rating summary (for technicians)
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    // Location fields for technicians
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      }
    },
    locationUpdatedAt: { type: Date },
    isAvailable: { type: Boolean, default: true }, // For technicians
    serviceRadius: { type: Number, default: 10 }, // Service radius in kilometers
    skills: [{ type: String }], // Technician skills/specializations
  },
  { timestamps: true }
);

// Create 2dsphere index for location-based queries
userSchema.index({ location: '2dsphere' });
userSchema.index({ role: 1, isAvailable: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ ratingAverage: -1, ratingCount: -1 });
console.log("User model loaded");
export default mongoose.model("User", userSchema);
