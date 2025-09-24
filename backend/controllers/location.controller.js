// controllers/location.controller.js
import User from "../models/user.model.js";

// Update technician's current location
export const updateTechnicianLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    const technician = await User.findByIdAndUpdate(
      req.user.userId,
      {
        location: {
          type: 'Point',
          coordinates: [longitude, latitude] // MongoDB uses [longitude, latitude]
        },
        locationUpdatedAt: new Date()
      },
      { new: true }
    ).select('-passwordHash');

    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    res.json({ 
      success: true, 
      message: "Location updated successfully",
      location: technician.location,
      locationUpdatedAt: technician.locationUpdatedAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get nearby technicians based on user's location
export const getNearbyTechnicians = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10, serviceType } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const searchRadius = parseInt(radius);

    // Build query
    const query = {
      role: 'technician',
      isAvailable: true,
      // ensure only docs with valid coordinates are considered
      'location.type': 'Point',
      'location.coordinates.0': { $exists: true },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: searchRadius * 1000 // Convert km to meters
        }
      }
    };

    // Add service type filter if provided
    if (serviceType) {
      query.skills = { $in: [serviceType] };
    }

    const technicians = await User.find(query)
      .select('-passwordHash')
      .limit(50); // Limit results for performance

    // Calculate distance for each technician
    const techniciansWithDistance = technicians.map(tech => {
      let distance = null;
      if (tech.location && tech.location.coordinates) {
        distance = calculateDistance(
          lat, lng,
          tech.location.coordinates[1], tech.location.coordinates[0]
        );
      }
      
      return {
        ...tech.toObject(),
        distance: distance ? Math.round(distance * 100) / 100 : null // Round to 2 decimal places
      };
    });

    res.json({
      success: true,
      technicians: techniciansWithDistance,
      count: techniciansWithDistance.length,
      searchCenter: { latitude: lat, longitude: lng },
      searchRadius: searchRadius
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get technician's current location
export const getTechnicianLocation = async (req, res) => {
  try {
    const technician = await User.findById(req.user.userId)
      .select('location locationUpdatedAt isAvailable serviceRadius');

    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    res.json({
      success: true,
      location: technician.location,
      locationUpdatedAt: technician.locationUpdatedAt,
      isAvailable: technician.isAvailable,
      serviceRadius: technician.serviceRadius
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update technician availability
export const updateTechnicianAvailability = async (req, res) => {
  try {
    const { isAvailable, serviceRadius } = req.body;

    const updateData = {};
    if (typeof isAvailable === 'boolean') {
      updateData.isAvailable = isAvailable;
    }
    if (serviceRadius && serviceRadius > 0) {
      updateData.serviceRadius = serviceRadius;
    }

    const technician = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true }
    ).select('-passwordHash');

    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    res.json({
      success: true,
      message: "Availability updated successfully",
      isAvailable: technician.isAvailable,
      serviceRadius: technician.serviceRadius
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}