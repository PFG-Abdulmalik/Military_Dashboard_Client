import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Layers, AlertTriangle, Shield, Settings } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom map controls component
const MapControls = ({ onBasemapChange, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [basemap, setBasemap] = useState('satellite');
  const [showControls, setShowControls] = useState(false);

  const basemaps = [
    { id: 'satellite', name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    { id: 'terrain', name: 'Terrain', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}' },
    { id: 'osm', name: 'OpenStreetMap', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
    { id: 'hybrid', name: 'Hybrid', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' }
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleBasemapChange = (newBasemap) => {
    setBasemap(newBasemap);
    onBasemapChange(newBasemap);
  };

  return (
    <div className="absolute top-4 left-4 z-[1000] space-y-2">
      {/* Search Bar */}
      <div className="bg-gray-800 rounded-lg p-3 shadow-lg">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-64 mr-2"
          />
          <button type="submit" className="btn-primary">
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Basemap Controls - Compact Version */}
      <div className="bg-gray-800 rounded-lg p-1.5 shadow-lg">
        <button
          onClick={() => setShowControls(!showControls)}
          className="btn-secondary w-full flex items-center justify-center text-xs py-1.5"
        >
          <Layers className="h-3 w-3 mr-1" />
          Basemaps
        </button>
        
        {showControls && (
          <div className="mt-1 space-y-0.5">
            {basemaps.map((map) => (
              <button
                key={map.id}
                onClick={() => handleBasemapChange(map.id)}
                className={`w-full text-left px-1.5 py-0.5 rounded text-xs transition-colors ${
                  basemap === map.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {map.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="bg-gray-800 rounded-lg p-3 shadow-lg">
        <h4 className="text-sm font-semibold text-white mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-gray-300">Critical Alerts</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span className="text-gray-300">High Priority</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-gray-300">Medium Priority</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-300">Strategic Zones</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Map component that updates basemap
const MapUpdater = ({ basemap }) => {
  const map = useMap();
  
  useEffect(() => {
    const basemaps = {
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      terrain: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      hybrid: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    };

    // Labels layer for satellite and hybrid views
    const labelsLayer = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}';

    const attribution = basemap === 'osm' 
      ? '© OpenStreetMap contributors'
      : '© Esri';

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add main basemap layer
    L.tileLayer(basemaps[basemap], {
      attribution,
      maxZoom: 19
    }).addTo(map);

    // Add labels layer for satellite and hybrid views
    if (basemap === 'satellite' || basemap === 'hybrid') {
      L.tileLayer(labelsLayer, {
        attribution: '© Esri',
        maxZoom: 19,
        opacity: 0.7
      }).addTo(map);
    }
  }, [basemap, map]);

  return null;
};

const MapView = () => {
  const [basemap, setBasemap] = useState('satellite');
  const [alerts, setAlerts] = useState([]);
  const [zones, setZones] = useState([]);
  const [satelliteData, setSatelliteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorShown, setErrorShown] = useState(false);
  const mapRef = useRef();

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    try {
      const [alertsResponse, zonesResponse, satelliteResponse] = await Promise.all([
        axios.get('/api/alerts'),
        axios.get('/api/map/zones'),
        axios.get('/api/satellite')
      ]);

      setAlerts(alertsResponse.data.data || alertsResponse.data.alerts || []);
      setZones(zonesResponse.data.data || zonesResponse.data.zones || []);
      setSatelliteData(satelliteResponse.data.data || satelliteResponse.data.insights || []);
      setErrorShown(false); // Reset error state on successful fetch
    } catch (error) {
      console.error('Failed to fetch map data:', error);
      if (!errorShown) {
        toast.error('Failed to load map data');
        setErrorShown(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    try {
      const response = await axios.get(`/api/map/search?q=${encodeURIComponent(query)}`);
      const results = response.data.results;
      
      if (results.length > 0) {
        const result = results[0];
        if (mapRef.current) {
          mapRef.current.setView([result.lat, result.lon], 12);
        }
        toast.success(`Found: ${result.display_name}`);
      } else {
        toast.error('Location not found');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    }
  };

  const handleBasemapChange = (newBasemap) => {
    setBasemap(newBasemap);
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  const getZoneColor = (status) => {
    switch (status) {
      case 'normal': return 'green';
      case 'warning': return 'yellow';
      case 'critical': return 'red';
      default: return 'blue';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen relative">
      <MapContainer
        center={[39.8283, -98.5795]} // Center of USA
        zoom={4}
        className="h-full w-full"
        ref={mapRef}
      >
        <MapUpdater basemap={basemap} />
        
        {/* Alert Markers */}
        {alerts.map((alert) => {
          if (!alert.location) return null;
          const location = typeof alert.location === 'string' ? JSON.parse(alert.location) : alert.location;
          return (
            <Marker
              key={alert.id}
              position={[location.coordinates[1], location.coordinates[0]]}
              icon={L.divIcon({
                className: 'custom-div-icon',
                html: `<div class="w-4 h-4 rounded-full bg-${getAlertColor(alert.severity)}-500 border-2 border-white shadow-lg"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
              })}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                  <p className="text-sm text-gray-600">{alert.description}</p>
                  <div className="mt-2">
                    <span className={`status-indicator severity-${alert.severity}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Strategic Zone Polygons */}
        {zones.map((zone) => {
          if (!zone.geometry) return null;
          const geometry = typeof zone.geometry === 'string' ? JSON.parse(zone.geometry) : zone.geometry;
          if (geometry.type !== 'Polygon') return null;
          
          // Ensure coordinates are properly formatted [lat, lon]
          const positions = geometry.coordinates[0].map(coord => {
            // Handle both [lon, lat] and [lat, lon] formats
            if (Array.isArray(coord) && coord.length >= 2) {
              return [coord[1], coord[0]]; // Convert to [lat, lon]
            }
            return coord;
          });
          
          return (
            <Polygon
              key={zone.id}
              positions={positions}
              color={getZoneColor(zone.status)}
              fillColor={getZoneColor(zone.status)}
              fillOpacity={0.15}
              weight={3}
              opacity={0.8}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900">{zone.zone_name}</h3>
                  <p className="text-sm text-gray-600">{zone.description}</p>
                  <div className="mt-2">
                    <span className={`status-indicator status-${zone.status}`}>
                      {zone.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Priority: {zone.priority}
                  </p>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Satellite Data Points */}
        {satelliteData.map((data) => {
          if (!data.geometry) return null;
          const geometry = typeof data.geometry === 'string' ? JSON.parse(data.geometry) : data.geometry;
          return (
            <Marker
              key={data.id}
              position={[geometry.coordinates[1], geometry.coordinates[0]]}
              icon={L.divIcon({
                className: 'custom-div-icon',
                html: `<div class="w-3 h-3 rounded-full bg-blue-400 border border-white shadow-lg"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              })}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900">{data.satellite_name}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(data.acquisition_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Confidence: {Math.round(data.confidence_score * 100)}%
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <MapControls onBasemapChange={handleBasemapChange} onSearch={handleSearch} />
    </div>
  );
};

export default MapView;
