// controllers/review.controller.js
import Review from '../models/review.model.js';
import Booking from '../models/booking.model.js';
import User from '../models/user.model.js';

export async function createReview(req, res) {
  try {
    const { bookingId, rating, comment } = req.body;
    if (!bookingId || !rating) return res.status(400).json({ message: 'bookingId and rating are required' });
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.userId) !== req.user.userId) return res.status(403).json({ message: 'Forbidden' });
    if (booking.status !== 'Completed') return res.status(400).json({ message: 'Only completed bookings can be reviewed' });

    const existing = await Review.findOne({ bookingId });
    if (existing) return res.status(400).json({ message: 'This booking is already reviewed' });

    const doc = await Review.create({
      bookingId,
      userId: booking.userId,
      technicianId: booking.technicianId,
      rating: Number(rating),
      comment: comment || '',
    });

    // Update technician rating summary
    if (booking.technicianId) {
      const tech = await User.findById(booking.technicianId).select('ratingAverage ratingCount');
      const count = tech?.ratingCount || 0;
      const avg = tech?.ratingAverage || 0;
      const newCount = count + 1;
      const newAvg = (avg * count + Number(rating)) / newCount;
      await User.findByIdAndUpdate(booking.technicianId, { ratingAverage: newAvg, ratingCount: newCount });
    }

    res.status(201).json({ success: true, review: doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function listReviewsForTechnician(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const techId = req.params.id;
    const [items, total] = await Promise.all([
      Review.find({ technicianId: techId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select('-__v'),
      Review.countDocuments({ technicianId: techId }),
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}