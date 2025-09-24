// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import connectDB from "./config/db.js";
import { createSocketServer } from './realtime/socket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(helmet());

// Improve CORS: support comma-separated list with spaces in .env
// Example: CORS_ORIGIN=http://localhost:8000, http://127.0.0.1:8000
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : '*';
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Stripe webhook requires raw body, so mount it before JSON for that route only
app.use('/api/payments/webhook', express.raw({ type: '*/*' }));

app.use(express.json());
app.use(morgan("dev"));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting for auth
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/services", (await import('./routes/services.routes.js')).default);
app.use("/api/bookings", (await import('./routes/bookings.routes.js')).default);
app.use("/api/contact", (await import('./routes/contact.routes.js')).default);
app.use("/api/admin", adminRoutes);
app.use("/api/me", (await import('./routes/me.routes.js')).default);
app.use("/api/technician", (await import('./routes/technician.routes.js')).default);
app.use("/api/location", (await import('./routes/location.routes.js')).default);
app.use("/api/payments", (await import('./routes/payments.routes.js')).default);
app.use("/api/reviews", (await import('./routes/reviews.routes.js')).default);
app.use("/api/uploads", (await import('./routes/uploads.routes.js')).default);
app.use("/api/skills", (await import('./routes/skills.routes.js')).default);

// Health endpoint
app.get('/health', (req, res) => res.json({ ok: true }));

// Fallback 404 and error handler
app.use((await import('./middleware/error.js')).notFound);
app.use((await import('./middleware/error.js')).errorHandler);

const PORT = process.env.PORT || 9000;

connectDB().then(() => {
  // Start websocket server
  createSocketServer(server, allowedOrigins);

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
