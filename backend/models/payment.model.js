// models/payment.model.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true }, // in cents
    currency: { type: String, default: 'usd' },
    provider: { type: String, default: 'stripe' },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    status: { type: String, enum: ['created', 'succeeded', 'failed', 'refunded'], default: 'created' },
    raw: { type: Object },
  },
  { timestamps: true }
);

paymentSchema.index({ bookingId: 1 });

export default mongoose.model('Payment', paymentSchema);