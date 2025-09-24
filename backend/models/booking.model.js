// models/booking.model.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    serviceType: { type: String },
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    date: { type: String },
    time: { type: String },
    notes: { type: String },
    price: { type: Number },
    status: { type: String, enum: ['Pending','Accepted','En route','Arrived','Completed','Cancelled'], default: 'Pending' },
    paymentStatus: { type: String, enum: ['unpaid','paid','refunded'], default: 'unpaid' },
    guest: { type: Boolean, default: false }
  },
  { timestamps: true }
);
  console.log("booking model loaded");
export default mongoose.model('Booking', bookingSchema);
