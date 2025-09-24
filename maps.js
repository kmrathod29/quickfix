// maps.js - Google Maps integration service
class MapsService {
  constructor() {
    this.map = null;
    this.markers = [];
    this.userMarker = null;
    this.infoWindow = null;
    this.isLoaded = false;
  }

  // Initialize Google Maps
  async initMap(containerId, userLocation, options = {}) {
    if (!window.google || !window.google.maps) {
      throw new Error('Google Maps API not loaded');
    }

    const defaultOptions = {
      zoom: 12,
      center: { lat: userLocation.latitude, lng: userLocation.longitude },
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    };

    const mapOptions = { ...defaultOptions, ...options };
    const container = document.getElementById(containerId);
    
    if (!container) {
      throw new Error(`Map container with id '${containerId}' not found`);
    }

    this.map = new window.google.maps.Map(container, mapOptions);
    this.infoWindow = new window.google.maps.InfoWindow();
    this.isLoaded = true;

    // Add user location marker
    this.addUserMarker(userLocation);

    return this.map;
  }

  // Add user location marker
  addUserMarker(userLocation) {
    if (!this.map) return;

    this.userMarker = new window.google.maps.Marker({
      position: { lat: userLocation.latitude, lng: userLocation.longitude },
      map: this.map,
      title: 'Your Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeWeight: 3,
        strokeColor: '#ffffff'
      }
    });

    // Add click listener for user marker
    this.userMarker.addListener('click', () => {
      this.infoWindow.setContent(`
        <div style="padding: 8px;">
          <h4 style="margin: 0 0 8px 0; color: #1976D2;">Your Location</h4>
          <p style="margin: 0; color: #666;">You are here</p>
        </div>
      `);
      this.infoWindow.open(this.map, this.userMarker);
    });
  }

  // Add technician markers to the map
  addTechnicianMarkers(technicians) {
    if (!this.map) return;

    // Clear existing technician markers
    this.clearTechnicianMarkers();

    technicians.forEach(technician => {
      if (!technician.location || !technician.location.coordinates) return;

      const [lng, lat] = technician.location.coordinates;
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: this.map,
        title: technician.name,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
              <circle cx="12" cy="12" r="10" fill="#10B981" stroke="#ffffff" stroke-width="2"/>
              <text x="12" y="16" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">🔧</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        }
      });

      // Create info window content
      const infoContent = this.createTechnicianInfoContent(technician);

      // Add click listener
      marker.addListener('click', () => {
        this.infoWindow.setContent(infoContent);
        this.infoWindow.open(this.map, marker);
      });

      this.markers.push(marker);
    });

    // Adjust map bounds to show all markers
    this.fitMapToMarkers();
  }

  // Create info window content for technician
  createTechnicianInfoContent(technician) {
    const skills = technician.skills && technician.skills.length > 0 
      ? technician.skills.join(', ') 
      : 'General repairs';
    
    const distance = technician.distance 
      ? `<p style="margin: 4px 0; color: #666;"><strong>Distance:</strong> ${window.geolocationService.formatDistance(technician.distance)}</p>`
      : '';

    const availability = technician.isAvailable 
      ? '<span style="color: #10B981;">Available</span>'
      : '<span style="color: #EF4444;">Unavailable</span>';

    return `
      <div style="padding: 12px; max-width: 250px;">
        <h4 style="margin: 0 0 8px 0; color: #1976D2;">${technician.name}</h4>
        <p style="margin: 4px 0; color: #666;"><strong>Skills:</strong> ${skills}</p>
        ${distance}
        <p style="margin: 4px 0; color: #666;"><strong>Status:</strong> ${availability}</p>
        <p style="margin: 4px 0; color: #666;"><strong>Phone:</strong> ${technician.phone}</p>
        <div style="margin-top: 8px;">
          <button onclick="bookTechnician('${technician._id}')" 
                  style="background: #1976D2; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
            Book Now
          </button>
        </div>
      </div>
    `;
  }

  // Clear all technician markers
  clearTechnicianMarkers() {
    this.markers.forEach(marker => {
      marker.setMap(null);
    });
    this.markers = [];
  }

  // Fit map bounds to show all markers
  fitMapToMarkers() {
    if (!this.map || this.markers.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    
    // Add user marker to bounds
    if (this.userMarker) {
      bounds.extend(this.userMarker.getPosition());
    }

    // Add all technician markers to bounds
    this.markers.forEach(marker => {
      bounds.extend(marker.getPosition());
    });

    this.map.fitBounds(bounds);

    // Ensure minimum zoom level
    window.google.maps.event.addListenerOnce(this.map, 'bounds_changed', () => {
      if (this.map.getZoom() > 15) {
        this.map.setZoom(15);
      }
    });
  }

  // Update user location
  updateUserLocation(userLocation) {
    if (!this.map || !this.userMarker) return;

    const newPosition = { lat: userLocation.latitude, lng: userLocation.longitude };
    this.userMarker.setPosition(newPosition);
    this.map.setCenter(newPosition);
  }

  // Show/hide map
  toggleVisibility(containerId, show = true) {
    const container = document.getElementById(containerId);
    if (container) {
      container.style.display = show ? 'block' : 'none';
    }
  }

  // Destroy map and cleanup
  destroy() {
    if (this.infoWindow) {
      this.infoWindow.close();
    }
    this.clearTechnicianMarkers();
    if (this.userMarker) {
      this.userMarker.setMap(null);
    }
    this.map = null;
    this.isLoaded = false;
  }

  // Check if Maps API is loaded
  static isGoogleMapsLoaded() {
    return typeof window.google !== 'undefined' && 
           typeof window.google.maps !== 'undefined';
  }

  // Load Google Maps API dynamically
  static async loadGoogleMaps(apiKey) {
    if (MapsService.isGoogleMapsLoaded()) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (MapsService.isGoogleMapsLoaded()) {
          resolve();
        } else {
          reject(new Error('Google Maps API failed to load'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API script'));
      };

      document.head.appendChild(script);
    });
  }
}

// Global function for booking technician (called from info window)
window.bookTechnician = function(technicianId) {
  // You can customize this function based on your booking flow
  const token = localStorage.getItem('quickfix-token');
  if (!token) {
    alert('Please login to book a technician');
    window.location.href = 'login.html';
    return;
  }

  // For now, just show an alert. You can replace this with your booking modal
  if (confirm('Do you want to book this technician?')) {
    // Redirect to booking page or open booking modal
    // You could also store the technician ID and pre-fill the booking form
    localStorage.setItem('selected-technician', technicianId);
    alert('Technician selected! You can now proceed with booking.');
  }
};

// Create global instance
window.mapsService = new MapsService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapsService;
}