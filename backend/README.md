# QuickFix Backend

Backend API for QuickFix (Node.js + Express + MongoDB + JWT).

- Auth: JWT signup/login (user/technician/admin) + user-exists check
- Services: list, read, admin create/update
- Bookings/Reviews/Payments: scaffolding to be added next

Requirements
- Node.js 18+
- MongoDB running locally or Atlas

Setup
1) Install dependencies
   npm install

2) Configure .env (example values)
   PORT=9000
   MONGO_URI=mongodb://localhost:27017/quickfix
   JWT_SECRET=your-secret
   CORS_ORIGIN=http://localhost:8000, http://127.0.0.1:8000

3) Run in dev
   npm run dev

4) API base
   http://localhost:9000

New in this update
- Added simple endpoint to check if a user exists by email so the frontend can redirect to Login or Sign Up accordingly.
- Improved CORS configuration to trim spaces in the CORS_ORIGIN list.

Auth endpoints

Note: Booking APIs are protected. You must include the JWT token returned from login/signup as:
Authorization: Bearer <token>
- POST /api/auth/signup
  Body: { name, email, password, phone, role? }
  Response: { success, token, user }

- POST /api/auth/login
  Body: { email, password }
  Response: { success, token, user }

- GET /api/auth/check?email=user@example.com
  or
  POST /api/auth/check { email: "user@example.com" }
  Response: { exists: boolean, next: "login" | "signup" }

Admin
- Seed an admin user (development):
  1) Set in backend/.env (optional):
     ADMIN_EMAIL=admin@quickfix.local
     ADMIN_PASSWORD=admin123
  2) Run: npm run seed:admin
  3) Login with that admin account, then open admin pages under /admin/ (see frontend).

Admin API endpoints
- GET    /api/admin/summary             -> { users, services, bookings }
- GET    /api/admin/bookings            -> list bookings (query: status, page, limit)
- PATCH  /api/admin/bookings/:id        -> update booking status
- PATCH  /api/admin/bookings/:id/assign -> assign technician to booking { technicianId }
- GET    /api/admin/users               -> list users (query: role, page, limit)

Technician API endpoints
- GET    /api/technician/summary        -> technician job summary
- GET    /api/technician/jobs           -> list assigned jobs (query: status, page, limit)
- PATCH  /api/technician/jobs/:id       -> update job status

User (Me) API endpoints
- GET    /api/me                         -> get my profile
- PATCH  /api/me                         -> update profile { name, phone, address }
- GET    /api/me/summary                 -> booking summary for me
- GET    /api/me/bookings                -> my bookings (query: page, limit)

Troubleshooting
- "failed to fetch": Ensure the frontend is calling the correct API base. Frontend script.js uses:
  const API_BASE = 'http://localhost:9000';
  If your backend runs on a different port, update this value.

Project structure
backend/
  server.js
  config/db.js
  controllers/
    auth.controller.js
    service.controller.js
  models/
    user.model.js
    service.model.js
  routes/
    auth.routes.js
    services.routes.js
  middleware/
    auth.js

Next steps (happy to add on request)
- Technician, Booking, Review, Payment, Inquiry models/controllers/routes
- Socket.IO events for booking rooms and technician tracking
- Stripe/Twilio/Nodemailer integrations with test mode
- Admin-protected routes for management and simple dashboards

- for frontend run:-> npx http-server -p 8000 -c-1