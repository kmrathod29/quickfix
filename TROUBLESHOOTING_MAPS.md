# QuickFix Maps Integration Troubleshooting

This guide helps you resolve common issues with the Maps Integration functionality.

## 🚨 Error 1: MongoDB Index Missing

### Error Message:
```
Error: error processing query: unable to find index for $geoNear query
```

### Cause:
MongoDB needs a 2dsphere index on the `location` field to perform geospatial queries.

### Solution:
Run the index creation script:

```bash
cd backend
npm run setup:db
```

Or run manually:
```bash
node ./scripts/createIndexes.js
```

### Verify Fix:
```bash
npm run test:api
```

## 🚨 Error 2: Google Maps Billing Not Enabled

### Error Message:
```
Google Maps JavaScript API error: BillingNotEnabledMapError
```

### Cause:
Google Maps API requires billing to be enabled, even for development with free tier usage.

### Solution:

#### Step 1: Enable Billing
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **Billing** section
4. Link a billing account (credit card required)
5. Don't worry - you get $200 free credits monthly

#### Step 2: Enable Required APIs
1. Go to **APIs & Services** → **Library**
2. Enable these APIs:
   - **Maps JavaScript API**
   - **Geocoding API** (optional, for address lookup)
   - **Places API** (optional, for place search)

#### Step 3: Create/Update API Key
1. Go to **APIs & Services** → **Credentials**
2. Create API Key or use existing one
3. **Important**: Restrict your API key for security:
   - Application restrictions: **HTTP referrers**
   - Website restrictions: Add your domains:
     - `localhost:8000/*`
     - `127.0.0.1:8000/*`
     - `yourdomain.com/*` (for production)
   - API restrictions: Select **Maps JavaScript API**

#### Step 4: Update Your Code
Replace the API key in `servise.html`:
```javascript
const GOOGLE_MAPS_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
```

### Alternative: Free Development Mode

If you don't want to enable billing immediately, you can disable the Google Maps integration temporarily:

#### Option 1: Use Development Mode
In `servise.html`, find this line and set it to empty:
```javascript
const GOOGLE_MAPS_API_KEY = ''; // Disable maps temporarily
```

This will skip map initialization and show only the technician list.

#### Option 2: Use Mock Maps Mode
Replace the Google Maps API key with a development flag:
```javascript
const GOOGLE_MAPS_API_KEY = 'DEVELOPMENT_MODE'; // Skip maps for now
```

## 🚨 Error 3: Location Permission Denied

### Error Message:
```
Location access denied by user.
```

### Solution:
1. The app automatically falls back to showing all technicians
2. Users can click "Browse All Technicians" button
3. For testing, allow location permission in browser settings

## 🚨 Error 4: No Technicians Found

### Cause:
Database is empty or technicians don't have location data.

### Solution:
```bash
cd backend
npm run seed:technicians
```

## 🚨 Error 5: Backend Connection Failed

### Error Message:
```
failed to fetch
```

### Solution:
1. Make sure backend is running:
   ```bash
   cd backend
   npm run dev
   ```
2. Check API_BASE URL in `servise.html` matches your backend port
3. Verify CORS settings in backend

## 🛠️ Complete Setup Process

### For Full Setup (with Maps):

```bash
# 1. Setup database and seed data
cd backend
npm run setup:complete

# 2. Start backend
npm run dev

# 3. Enable Google Maps billing (see above)
# 4. Add your API key to servise.html
# 5. Open servise.html in browser
```

### For Quick Testing (no Maps):

```bash
# 1. Setup database and seed data
cd backend
npm run setup:complete

# 2. Start backend
npm run dev

# 3. Set GOOGLE_MAPS_API_KEY = '' in servise.html
# 4. Open servise.html in browser
# 5. Click "Browse All Technicians" to see fallback mode
```

## 🧪 Testing Your Setup

### Test Backend APIs:
```bash
cd backend
npm run test:api
```

### Test Frontend:
1. Open `servise.html` in browser
2. Click on any service type (Plumbing, Electrical, etc.)
3. Try both modes:
   - With location permission (if maps enabled)
   - "Browse All Technicians" fallback

## 📞 Common Console Commands

```bash
# Setup everything
npm run setup:complete

# Just create indexes
npm run setup:db

# Just seed technicians
npm run seed:technicians

# Test APIs
npm run test:api

# Start development server
npm run dev
```

## 🔍 Debugging Tips

1. **Check Browser Console** for JavaScript errors
2. **Check Network Tab** for failed API requests
3. **Check Backend Logs** for server errors
4. **Verify Database Connection** in backend/.env
5. **Test with Postman/curl** to isolate API issues

### Sample API Test:
```bash
# Test nearby technicians (replace coordinates)
curl "http://localhost:9000/api/location/nearby?latitude=40.7128&longitude=-74.0060&radius=10"

# Test all technicians
curl "http://localhost:9000/api/technician/all?available=true"
```

## 🎯 Success Checklist

- [ ] MongoDB indexes created
- [ ] Sample technicians seeded
- [ ] Backend server running
- [ ] Google Maps billing enabled (or disabled for testing)
- [ ] API key configured in frontend
- [ ] Browser location permission granted (optional)
- [ ] Frontend successfully loads technicians
- [ ] Map displays technicians (if enabled)

If all items are checked, your Maps Integration should be working perfectly!
