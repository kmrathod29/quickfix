// models/inquiry.model.js
import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String, required: true }
  },
  { timestamps: true }
);
console.log("inquiry model loaded");
export default mongoose.model('Inquiry', inquirySchema);
