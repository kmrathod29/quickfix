# QuickFix Backend Data Management

This document explains how technician data is now managed completely on the backend side, replacing any frontend hardcoded data.

## Overview

The QuickFix application now fetches all technician data from the backend APIs. No technician data is hardcoded in the frontend anymore. The system provides multiple ways to access technician information:

1. **Location-based search** - Find nearby technicians using geolocation
2. **Service-based filtering** - Filter technicians by their skills/services
3. **Fallback listing** - Browse all available technicians without location

## Backend APIs

### 1. Location-based Technician Search

**Endpoint:** `GET /api/location/nearby`

**Parameters:**
- `latitude` (required) - User's latitude
- `longitude` (required) - User's longitude  
- `radius` (optional) - Search radius in kilometers (default: 10)
- `serviceType` (optional) - Filter by service type

**Example:**
```
GET /api/location/nearby?latitude=40.7128&longitude=-74.0060&radius=10&serviceType=plumbing
```

**Response:**
```json
{
  "success": true,
  "technicians": [
    {
      "_id": "...",
      "name": "Mike Johnson",
      "email": "mike.plumber@quickfix.com",
      "phone": "+1-555-0101",
      "skills": ["plumbing", "general repairs"],
      "isAvailable": true,
      "serviceRadius": 15,
      "distance": 2.5,
      "location": {
        "type": "Point",
        "coordinates": [-74.0060, 40.7128]
      }
    }
  ],
  "count": 1,
  "searchCenter": {"latitude": 40.7128, "longitude": -74.0060},
  "searchRadius": 10
}
```

### 2. All Technicians (Fallback)

**Endpoint:** `GET /api/technician/all`

**Parameters:**
- `serviceType` (optional) - Filter by service type
- `available` (optional) - Filter by availability (true/false)
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Example:**
```
GET /api/technician/all?serviceType=electrical&available=true&limit=10
```

**Response:**
```json
{
  "success": true,
  "technicians": [
    {
      "_id": "...",
      "name": "Sarah Davis",
      "email": "sarah.electrician@quickfix.com",
      "phone": "+1-555-0102",
      "skills": ["electrical", "lighting"],
      "isAvailable": true,
      "serviceRadius": 20,
      "address": "Midtown Area"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "pages": 3,
    "limit": 10
  }
}
```

## Frontend Integration

### Services Page (`servise.html`)

The services page now handles technician data in three ways:

1. **With Location Permission:**
   - Uses `geolocationService.getNearbyTechnicians()`
   - Shows distance to each technician
   - Displays technicians on Google Maps

2. **Without Location Permission:**
   - Shows location permission prompt
   - Provides "Browse All Technicians" fallback
   - Uses `/api/technician/all` endpoint

3. **Service-Specific Filtering:**
   - Filters by selected service type (plumbing, electrical, etc.)
   - Works with both location-based and fallback modes

### Key Functions

```javascript
// Location-based search
async function loadNearbyTechnicians(serviceType = null) {
  const data = await geolocationService.getNearbyTechnicians(
    userLocation.latitude,
    userLocation.longitude,
    radius,
    serviceType
  );
  updateTechniciansList(data.technicians);
}

// Fallback without location
async function loadTechniciansWithoutLocation() {
  const response = await fetch(`${API_BASE}/api/technician/all?available=true`);
  const data = await response.json();
  updateTechniciansList(data.technicians);
}
```

## Database Seeding

### Seed Sample Technicians

Run the seeding script to populate your database with sample technicians:

```bash
cd backend
npm run seed:technicians
```

This creates 12 sample technicians with:
- Realistic names and contact information
- Various skill sets (plumbing, electrical, AC, painting, appliance repair)
- Different locations (NYC and LA coordinates)
- Different availability status and service radius

### Sample Technicians Include:

**New York Area:**
- Mike Johnson (Plumbing)
- Sarah Davis (Electrical)
- David Wilson (Carpentry)
- Lisa Martinez (AC/HVAC)
- James Brown (Painting)
- Emily Chen (Appliance Repair)
- Robert Taylor (Multi-skilled)
- Jessica Wilson (AC/Electrical - Currently Offline)
- Kevin Garcia (Handyman)
- Maria Rodriguez (Multi-skilled)

**Los Angeles Area:**
- Tom Anderson (Plumbing)
- Anna Thompson (Electrical)

### Custom Data

You can modify the seed data in `backend/scripts/seedTechnicians.js`:

```javascript
const sampleTechnicians = [
  {
    name: "Your Technician",
    email: "tech@quickfix.com",
    password: "password123",
    phone: "+1-555-0000",
    role: "technician",
    address: "Your City",
    skills: ["your", "services"],
    isAvailable: true,
    serviceRadius: 15,
    location: {
      type: "Point",
      coordinates: [longitude, latitude] // [lng, lat] format
    }
  }
];
```

## Testing the Implementation

### 1. Start the Backend
```bash
cd backend
npm run dev
```

### 2. Seed the Database
```bash
npm run seed:technicians
```

### 3. Test the APIs
```bash
npm run test:api
```

### 4. Test Frontend Integration
1. Open `servise.html` in a browser
2. Click on any service (Plumbing, Electrical, etc.)
3. Try both location modes:
   - Allow location access to see nearby technicians with distances
   - Deny location access to see the fallback listing

## API Endpoints Summary

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/location/nearby` | GET | No | Find nearby technicians with location |
| `/api/technician/all` | GET | No | List all technicians (fallback) |
| `/api/technician/summary` | GET | Yes (Technician) | Technician dashboard stats |
| `/api/technician/jobs` | GET | Yes (Technician) | Technician's assigned jobs |
| `/api/technician/profile` | GET/PATCH | Yes (Technician) | Technician profile management |
| `/api/location/update` | PATCH | Yes (Technician) | Update technician location |
| `/api/location/availability` | PATCH | Yes (Technician) | Update availability settings |

## Data Flow

```
1. User visits services page
2. Clicks on service type (e.g., "Plumbing")
3. System checks for location permission:
   
   WITH LOCATION:
   ├── Gets user coordinates
   ├── Calls /api/location/nearby
   ├── Shows technicians with distances
   └── Displays on Google Maps
   
   WITHOUT LOCATION:
   ├── Shows location prompt
   ├── User can choose "Browse All Technicians"
   ├── Calls /api/technician/all
   └── Shows all available technicians
```

## Security & Privacy

- **Location Privacy:** User location is never stored on backend
- **Technician Location:** Only visible to authenticated technicians
- **Public API:** `/api/technician/all` hides sensitive location data
- **Authentication:** Location updates require valid JWT tokens

## Troubleshooting

### No Technicians Found
1. Ensure database is seeded: `npm run seed:technicians`
2. Check if technicians are available: `isAvailable: true`
3. Verify service type matches: skills array should contain the service

### API Connection Issues
1. Backend server running: `npm run dev`
2. Correct API base URL in frontend: `http://localhost:9000`
3. CORS configured properly in backend

### Location-based Search Not Working
1. HTTPS required for geolocation in production
2. User must grant location permission
3. Technicians must have location data set
4. MongoDB 2dsphere index created automatically

## Production Considerations

1. **Environment Variables:**
   ```env
   MONGO_URI=your_production_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=https://yourdomain.com
   ```

2. **Database Indexing:**
   - 2dsphere index on `location` field (automatic)
   - Index on `skills` for faster service filtering
   - Index on `isAvailable` for availability queries

3. **Scaling:**
   - Consider Redis caching for frequently accessed data
   - Database connection pooling
   - API rate limiting

This completes the transition from frontend hardcoded data to a fully backend-driven technician management system!