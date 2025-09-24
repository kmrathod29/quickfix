// controllers/admin.controller.js
// Very simple admin endpoints with clear comments for learning.
import User from "../models/user.model.js";
import Service from "../models/service.model.js";
import Booking from "../models/booking.model.js";

// GET /api/admin/summary
// Return counts for quick dashboard tiles
export const getSummary = async (req, res) => {
  try {
    const [users, services, bookings] = await Promise.all([
      User.countDocuments({}),
      Service.countDocuments({}),
      Booking.countDocuments({}),
    ]);
    res.json({ users, services, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/bookings?status=&page=&limit=
// List bookings for admin with pagination
export const listBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('userId', 'name email')
        .populate('serviceId', 'name'),
      Booking.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/bookings/:id
// Update booking status (simple admin action)
export const updateBookingStatus = async (req, res) => {
  try {
    const allowed = ['Pending','Accepted','En route','Arrived','Completed','Cancelled'];
    const { status } = req.body;
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const doc = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Booking not found' });

    // Emit and notify
    try {
      const { getIO } = await import('../realtime/socket.js');
      const io = getIO();
      io?.emit('booking:status', { id: doc._id, status: doc.status });
    } catch (_) {}
    try {
      const { notifyBookingStatusChange } = await import('../services/notify.js');
      await notifyBookingStatusChange(doc);
    } catch (_) {}

    res.json({ success: true, booking: doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/bookings/:id/assign  { technicianId }
export const assignTechnician = async (req, res) => {
  try {
    const { technicianId } = req.body;
    if (!technicianId) return res.status(400).json({ message: 'technicianId is required' });
    const doc = await Booking.findByIdAndUpdate(
      req.params.id,
      { technicianId },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Booking not found' });
    res.json({ success: true, booking: doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/users?role=
// List users (optional filter by role)
export const listUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select('name email role'),
      User.countDocuments(filter)
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};