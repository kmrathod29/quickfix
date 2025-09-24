// models/service.model.js
import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, index: true },
    description: { type: String },
    images: [{ type: String }],
    basePrice: { type: Number, required: true },
    estimatedTime: { type: String },
    tags: [{ type: String, index: true }],
    ratingAvg: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);
console.log("services model loaded");
export default mongoose.model("Service", serviceSchema);
