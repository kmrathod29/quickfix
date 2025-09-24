// controllers/upload.controller.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/user.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

export async function uploadAvatar(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const relPath = '/uploads/avatars/' + req.file.filename;
    const user = await User.findByIdAndUpdate(req.user.userId, { avatarUrl: relPath }, { new: true }).select('-passwordHash');
    res.json({ success: true, url: relPath, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function health(req, res) {
  // Simple endpoint to confirm uploads directory exists
  try {
    const dir = path.join(UPLOAD_ROOT, 'avatars');
    if (!fs.existsSync(dir)) return res.status(500).json({ ok: false, message: 'avatars dir missing' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
}