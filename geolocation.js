// geolocation.js - Frontend geolocation service
class GeolocationService {
  constructor() {
    this.userLocation = null;
    this.watchId = null;
  }

  // Get user's current location
  async getCurrentLocation(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes cache
    };

    const settings = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp)
          };
          this.userLocation = location;
          resolve(location);
        },
        (error) => {
          let message = 'Unable to get your location.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out.';
              break;
          }
          reject(new Error(message));
        },
        settings
      );
    });
  }

  // Watch user's location for changes
  watchPosition(callback, errorCallback, options = {}) {
    if (!navigator.geolocation) {
      errorCallback?.(new Error('Geolocation is not supported by this browser.'));
      return null;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 minute cache
    };

    const settings = { ...defaultOptions, ...options };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp)
        };
        this.userLocation = location;
        callback(location);
      },
      (error) => {
        let message = 'Unable to watch your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }
        errorCallback?.(new Error(message));
      },
      settings
    );

    return this.watchId;
  }

  // Stop watching location
  clearWatch() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Get formatted distance string
  formatDistance(distance) {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  }

  // Get nearby technicians from API
  async getNearbyTechnicians(userLat, userLng, radius = 10, serviceType = null) {
    try {
      const API_BASE = 'http://localhost:9000';
      let url = `${API_BASE}/api/location/nearby?latitude=${userLat}&longitude=${userLng}&radius=${radius}`;
      
      if (serviceType) {
        url += `&serviceType=${encodeURIComponent(serviceType)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch nearby technicians');
      }

      return data;
    } catch (error) {
      console.error('Error fetching nearby technicians:', error);
      throw error;
    }
  }

  // Update technician location (for technicians)
  async updateTechnicianLocation(latitude, longitude) {
    try {
      const API_BASE = 'http://localhost:9000';
      const token = localStorage.getItem('quickfix-token');

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE}/api/location/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ latitude, longitude })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update location');
      }

      return data;
    } catch (error) {
      console.error('Error updating technician location:', error);
      throw error;
    }
  }

  // Get technician's current location
  async getTechnicianLocation() {
    try {
      const API_BASE = 'http://localhost:9000';
      const token = localStorage.getItem('quickfix-token');

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE}/api/location/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get location');
      }

      return data;
    } catch (error) {
      console.error('Error getting technician location:', error);
      throw error;
    }
  }

  // Update technician availability
  async updateTechnicianAvailability(isAvailable, serviceRadius) {
    try {
      const API_BASE = 'http://localhost:9000';
      const token = localStorage.getItem('quickfix-token');

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE}/api/location/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable, serviceRadius })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update availability');
      }

      return data;
    } catch (error) {
      console.error('Error updating availability:', error);
      throw error;
    }
  }

  // Request user permission for location access
  async requestLocationPermission() {
    try {
      await this.getCurrentLocation();
      return true;
    } catch (error) {
      console.warn('Location permission denied or unavailable:', error.message);
      return false;
    }
  }

  // Check if geolocation is supported
  isGeolocationSupported() {
    return 'geolocation' in navigator;
  }

  // Get user location from cache or fetch new
  getUserLocation() {
    return this.userLocation;
  }
}

// Create a global instance
window.geolocationService = new GeolocationService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GeolocationService;
}