// controllers/me.controller.js
// Endpoints for the currently logged-in user (homeowner)
import User from "../models/user.model.js";
import Booking from "../models/booking.model.js";

// GET /api/me
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('name email phone role address');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/me
export const updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'address'];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.user.userId, update, { new: true }).select('name email phone role address');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/me/summary
export const getSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const total = await Booking.countDocuments({ userId });
    const completed = await Booking.countDocuments({ userId, status: 'Completed' });
    const pending = await Booking.countDocuments({ userId, status: { $nin: ['Completed','Cancelled'] } });
    res.json({ total, completed, pending });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/me/bookings?page=&limit=
export const listMyBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Booking.find({ userId: req.user.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('serviceId','name')
        .populate('technicianId','name phone role'),
      Booking.countDocuments({ userId: req.user.userId })
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
