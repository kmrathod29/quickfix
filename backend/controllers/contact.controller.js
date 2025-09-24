// controllers/contact.controller.js
import Inquiry from "../models/inquiry.model.js";

export const postContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: 'Missing required fields' });
    const doc = await Inquiry.create({ name, email, phone, message });
    return res.status(201).json({ success: true, inquiryId: doc._id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
