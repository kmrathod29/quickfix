// controllers/technician.controller.js
// Endpoints for technicians to manage assigned jobs
import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";
import { validateSkills, SERVICE_CATEGORIES } from "../constants/serviceSkills.js";

// GET /api/technician/summary
export const getSummary = async (req, res) => {
  try {
    const technicianId = req.user.userId;
    const total = await Booking.countDocuments({ technicianId });
    const today = new Date();
    const pending = await Booking.countDocuments({ technicianId, status: { $in: ['Pending','Accepted','En route','Arrived'] } });
    const completed = await Booking.countDocuments({ technicianId, status: 'Completed' });
    res.json({ total, pending, completed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/technician/jobs?status=&page=&limit=
export const listJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { technicianId: req.user.userId };
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('serviceId','name'),
      Booking.countDocuments(filter)
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/technician/jobs/:id  { status }
// Allowed transitions: Pending -> Accepted -> En route -> Arrived -> Completed / Cancelled
export const updateJobStatus = async (req, res) => {
  try {
    const allowed = ['Pending','Accepted','En route','Arrived','Completed','Cancelled'];
    const { status } = req.body;
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const doc = await Booking.findOneAndUpdate(
      { _id: req.params.id, technicianId: req.user.userId },
      { status },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Job not found' });

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

// Get technician profile
export const getTechnicianProfile = async (req, res) => {
  try {
    const technician = await User.findById(req.user.userId)
      .select('-passwordHash');
    
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }
    
    res.json({ success: true, technician });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update technician profile
export const updateTechnicianProfile = async (req, res) => {
  try {
    const { name, phone, address, skills } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    
    if (skills && Array.isArray(skills)) {
      const cleanSkills = [...new Set(skills.map(s => String(s).trim().toLowerCase()).filter(Boolean))];
      
      // Validate skills
      if (cleanSkills.length === 0) {
        return res.status(400).json({ message: "Please select at least one skill" });
      }
      
      if (!validateSkills(cleanSkills)) {
        return res.status(400).json({ 
          message: "Invalid skills selected. Please choose from available services." 
        });
      }
      
      updateData.skills = cleanSkills;
    }
    
    const technician = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true }
    ).select('-passwordHash');
    
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }
    
    res.json({ success: true, technician });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all technicians (for public listing without location)
export const getAllTechnicians = async (req, res) => {
  try {
    const { serviceType, available, minRating, sort = 'recent', page = 1, limit = 20 } = req.query;
    
    const filter = { role: 'technician' };
    
    if (serviceType) {
      const st = String(serviceType).trim().toLowerCase();
      // Map common service slugs to full skill lists so cards match categories
      const SLUG_TO_SKILLS = {
        electrical: ['electrical service', 'electrical'],
        plumbing: ['plumbing service', 'plumbing'],
        ac: ['ac repair', 'ac'],
        carpentry: ['carpentry', 'carpentry service'],
        painting: ['painting', 'painting service'],
        appliance: ['appliance repair', 'appliance']
      };
      const expanded = [st, ...(SLUG_TO_SKILLS[st] || [])].map(s => String(s).toLowerCase());
      filter.skills = { $in: expanded };
    }
    
    if (available === 'true') {
      filter.isAvailable = true;
    } else if (available === 'false') {
      filter.isAvailable = false;
    }

    if (minRating) {
      filter.ratingAverage = { $gte: Number(minRating) };
    }

    let sortBy = { createdAt: -1 };
    if (sort === 'name') sortBy = { name: 1 };
    if (sort === 'rating') sortBy = { ratingAverage: -1, ratingCount: -1 };
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [technicians, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash -location') // Hide precise location for public listing
        .sort(sortBy)
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      technicians,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
