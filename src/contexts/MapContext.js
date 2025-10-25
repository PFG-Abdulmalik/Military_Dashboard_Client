import React, { createContext, useContext, useState } from 'react';

const MapContext = createContext();

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};

export const MapProvider = ({ children }) => {
  const [selectedBasemap, setSelectedBasemap] = useState('satellite');
  const [mapCenter, setMapCenter] = useState([39.8283, -98.5795]);
  const [mapZoom, setMapZoom] = useState(4);
  const [selectedLayers, setSelectedLayers] = useState({
    alerts: true,
    zones: true,
    satellite: true
  });

  const updateBasemap = (basemap) => {
    setSelectedBasemap(basemap);
  };

  const updateMapView = (center, zoom) => {
    setMapCenter(center);
    setMapZoom(zoom);
  };

  const toggleLayer = (layerName) => {
    setSelectedLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  const value = {
    selectedBasemap,
    mapCenter,
    mapZoom,
    selectedLayers,
    updateBasemap,
    updateMapView,
    toggleLayer
  };

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
};
