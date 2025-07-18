import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import L from 'leaflet';
import "./map.scss";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function Map({ items = [] }) {
  const [validItems, setValidItems] = useState([]);
  const [mapCenter, setMapCenter] = useState([52.4797, -1.90269]); // Default center (Birmingham, UK)

  useEffect(() => {
    // Helper function to ensure coordinates are numbers and within valid ranges
    const parseCoordinate = (coord, isLat) => {
      // If it's already a number, return it if valid
      if (typeof coord === 'number' && !isNaN(coord)) {
        return isLat 
          ? Math.max(-90, Math.min(90, coord)) 
          : Math.max(-180, Math.min(180, coord));
      }
      
      // If it's a string, try to convert to number
      if (typeof coord === 'string') {
        const num = parseFloat(coord);
        if (!isNaN(num)) {
          return isLat 
            ? Math.max(-90, Math.min(90, num))
            : Math.max(-180, Math.min(180, num));
        }
      }
      
      return null; // Invalid coordinate
    };

    // Process all items to ensure valid coordinates
    const processedItems = items
      .filter(item => item && (item.latitude !== undefined && item.longitude !== undefined))
      .map(item => ({
        ...item,
        // Ensure latitude and longitude are valid numbers
        latitude: parseCoordinate(item.latitude, true),
        longitude: parseCoordinate(item.longitude, false)
      }))
      .filter(item => item.latitude !== null && item.longitude !== null);

    console.log('Map received items:', items);
    console.log('Processed map items:', processedItems);

    setValidItems(processedItems);

    // Update map center if we have valid items
    if (processedItems.length > 0) {
      if (processedItems.length === 1) {
        // Center on the single item with a good zoom level
        setMapCenter([processedItems[0].latitude, processedItems[0].longitude]);
      } else {
        // Calculate bounds that contain all markers
        const lats = processedItems.map(item => item.latitude);
        const lngs = processedItems.map(item => item.longitude);
        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
        setMapCenter([centerLat, centerLng]);
      }
    } else {
      // If no valid items but we have items, show a more helpful message
      console.warn('No valid coordinates found in items:', items);
    }
  }, [items]);

  if (!items || items.length === 0) {
    return <div className="map-placeholder">No location data available</div>;
  }
  
  if (validItems.length === 0) {
    return (
      <div className="map-placeholder">
        <p>No valid location data found.</p>
        <p>Please check if the coordinates are in the correct format.</p>
        <p>Expected format: {'{ latitude: number, longitude: number }'}</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={validItems.length === 1 ? 12 : 7}
      scrollWheelZoom={false}
      className="map"
      key={`map-${validItems.length}`} // Force re-render when items change
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {validItems.map((item) => (
        <Marker 
          key={item.id} 
          position={[item.latitude, item.longitude]}
        >
          <Popup>
            <div>
              <strong>{item.title || 'Unnamed Location'}</strong><br />
              {item.city && <span>{item.city}</span>}
              {item.price && <div>Price: ${item.price}</div>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default Map;
