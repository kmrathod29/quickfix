// routes/uploads.routes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { verifyJWT } from '../middleware/auth.js';
import { uploadAvatar, health } from '../controllers/upload.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
fs.mkdirSync(avatarsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, req.user.userId + '-' + Date.now() + ext);
  }
});

const upload = multer({ storage });

const router = express.Router();

router.get('/health', health);
router.post('/avatar', verifyJWT, upload.single('avatar'), uploadAvatar);

export default router;