# QuickFix Maps Integration

This document explains the newly implemented Maps Integration functionality for the QuickFix project.

## Features Implemented

### 1. Geolocation-based Technician Finding
- Find technicians within a specified radius (5km, 10km, 20km, 50km)
- Calculate and display distances to technicians
- Sort technicians by distance, rating, or name

### 2. Interactive Google Maps
- Display user location and nearby technicians on Google Maps
- Custom markers for users and technicians  
- Click on technician markers to view details and book services
- Automatic map bounds adjustment to show all relevant markers

### 3. Technician Location Management
- Technicians can update their current location
- Auto-update location feature (updates every minute)
- Availability toggle and service radius settings
- Real-time location tracking

### 4. Distance-based Filtering
- Filter technicians by distance from user location
- Sort results by proximity, ratings, or alphabetically
- Responsive search radius adjustment

## Setup Instructions

### 1. Google Maps API Key

You need a Google Maps API key to use the maps functionality:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Maps JavaScript API
4. Create API credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Configure API Key

Replace the placeholder in `servise.html`:

```javascript
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your actual API key
```

### 3. Database Setup

The User model has been updated with location fields. If you have existing data, you may need to update your MongoDB collection:

```javascript
// Add these fields to existing technician users
{
  location: {
    type: 'Point',
    coordinates: [longitude, latitude] // [lng, lat] format
  },
  locationUpdatedAt: Date,
  isAvailable: Boolean,
  serviceRadius: Number, // in kilometers
  skills: [String] // technician specializations
}
```

### 4. Backend API Endpoints

The following new endpoints are available:

- `GET /api/location/nearby?latitude=X&longitude=Y&radius=Z&serviceType=TYPE`
- `PATCH /api/location/update` (requires auth)
- `GET /api/location/me` (requires auth)
- `PATCH /api/location/availability` (requires auth)

## Usage

### For Users

1. **View Services**: Go to the Services page
2. **Find Nearby Technicians**: Click "📍 Find Nearby Technicians"
3. **Allow Location Access**: Grant location permission when prompted
4. **View Map**: Interactive map shows your location and nearby technicians
5. **Filter Results**: Use radius and sort filters to refine results
6. **Book Services**: Click on technician cards or map markers to book

### For Technicians

1. **Access Dashboard**: Login and go to technician dashboard
2. **Update Location**: Click "📍 Update Location" to set current position
3. **Auto-Update**: Enable "🔄 Auto Update" for continuous location tracking
4. **Set Availability**: Toggle availability and set service radius
5. **Save Settings**: Click "Save Settings" to apply changes

## Technical Implementation

### Files Added/Modified

**New Files:**
- `geolocation.js` - Frontend geolocation service
- `maps.js` - Google Maps integration service
- `backend/controllers/location.controller.js` - Location API controller
- `backend/routes/location.routes.js` - Location routes

**Modified Files:**
- `backend/models/user.model.js` - Added location fields
- `backend/server.js` - Added location routes
- `servise.html` - Integrated maps and location functionality
- `technician/dashboard.html` - Added location management UI
- `technician/technician.js` - Added location management logic

### Key Features

1. **MongoDB 2dsphere Index**: Enables geospatial queries for efficient nearby searches
2. **Haversine Formula**: Calculates accurate distances between coordinates
3. **Real-time Updates**: Automatic location updates for active technicians
4. **Security**: Proper authentication for location update endpoints
5. **Error Handling**: Graceful handling of geolocation permissions and API errors

## Browser Compatibility

- Requires HTTPS for geolocation in production
- Modern browsers with geolocation API support
- JavaScript enabled

## Security Considerations

1. **API Key Restrictions**: Restrict Google Maps API key to your domain
2. **Location Privacy**: Users can deny location access
3. **Authentication**: Location updates require valid JWT tokens
4. **Rate Limiting**: Consider adding rate limits for location updates

## Testing

1. **Development**: Use `http://localhost` for testing (geolocation works on localhost)
2. **Production**: Ensure HTTPS is enabled for geolocation to work
3. **Mobile Testing**: Test on mobile devices for better geolocation accuracy

## Troubleshooting

### Common Issues

1. **Map not loading**: Check Google Maps API key configuration
2. **Location permission denied**: Inform users to enable location in browser settings
3. **No technicians found**: Ensure technicians have set their locations and are available
4. **Geolocation not working**: Ensure HTTPS in production, localhost in development

### Browser Console Errors

Check browser developer tools console for detailed error messages related to:
- Google Maps API loading
- Geolocation permission errors
- Network requests to location endpoints

## Future Enhancements

Potential improvements for the maps integration:

1. **Route Planning**: Show directions to selected technicians
2. **Real-time Tracking**: Live tracking of technician movement during jobs
3. **Geofencing**: Alerts when technicians enter/leave service areas
4. **Heatmap**: Visualize service demand density
5. **Offline Maps**: Cache map data for offline functionality
6. **Advanced Filtering**: Filter by technician ratings, price range, etc.

## Support

For issues related to maps integration, check:
1. Browser console for JavaScript errors
2. Network tab for failed API requests
3. Google Maps API usage and billing
4. Location permissions in browser settings