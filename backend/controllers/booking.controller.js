// controllers/booking.controller.js
import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";

// Helper: normalize serviceType into a canonical skill key
function normalizeSkill(serviceType) {
  if (!serviceType) return null;
  const key = String(serviceType).trim().toLowerCase().replace(/\s+/g, '');
  const map = {
    plumbing: 'plumbing',
    electrical: 'electrical',
    electricalwork: 'electrical',
    carpenter: 'carpentry',
    carpentry: 'carpentry',
    painting: 'painting',
    ac: 'ac',
    acrepair: 'ac',
    hvac: 'ac',
    appliance: 'appliance',
    appliancerepair: 'appliance'
  };
  return map[key] || key;
}

// Auth required: verifyJWT middleware ensures req.user is set
export const createBooking = async (req, res) => {
  try {
    const {
      serviceId,
      serviceType,
      technicianId,
      name,
      email,
      phone,
      address,
      date,
      time,
      notes,
      price
    } = req.body;

    let assignedTechnicianId = technicianId;

    // Auto-assign a technician when one wasn't explicitly selected
    if (!assignedTechnicianId && serviceType) {
      const skill = normalizeSkill(serviceType);
      // First try: available technician with matching skill
      let tech = await User.findOne({
        role: 'technician',
        isAvailable: true,
        skills: { $in: [skill] }
      }).sort({ locationUpdatedAt: -1, updatedAt: -1 });

      // Fallback: any technician with that skill
      if (!tech) {
        tech = await User.findOne({
          role: 'technician',
          skills: { $in: [skill] }
        }).sort({ updatedAt: -1 });
      }

      if (tech) {
        assignedTechnicianId = tech._id;
      }
    }

    const booking = await Booking.create({
      userId: req.user?.userId,
      technicianId: assignedTechnicianId || undefined,
      serviceId: serviceId || undefined,
      serviceType,
      name,
      email,
      phone,
      address,
      date,
      time,
      notes,
      price,
      guest: req.user ? false : true
    });

    // Emit real-time event
    try {
      const { getIO } = await import('../realtime/socket.js');
      const io = getIO();
      io?.emit('booking:new', { id: booking._id, serviceType: booking.serviceType, date: booking.date, time: booking.time });
    } catch (_) {}

    // Notify via email/SMS (best effort)
    try {
      const { notifyBookingCreated } = await import('../services/notify.js');
      await notifyBookingCreated(booking);
    } catch (_) {}

    return res.status(201).json({ success: true, booking });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // If authenticated, ensure user owns booking or is admin/technician
    if (req.user && req.user.role === 'user' && String(booking.userId) !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return res.json({ success: true, booking });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
