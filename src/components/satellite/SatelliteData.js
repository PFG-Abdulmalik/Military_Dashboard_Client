import React, { useState, useEffect, useRef } from 'react';
import { Satellite, Activity, BarChart3, Calendar, MapPin, Clock, Eye, Download, Filter, Upload, Map, X, Maximize2, Info } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SatelliteData = () => {
  const [satelliteData, setSatelliteData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateRange, setDateRange] = useState('today');
  const [selectedSatellite, setSelectedSatellite] = useState('all');
  const [errorShown, setErrorShown] = useState(false);
  const [uploadedAOI, setUploadedAOI] = useState(null);
  const [aoiName, setAoiName] = useState('');
  const [searchingTiles, setSearchingTiles] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const fileInputRef = useRef(null);
  const [analysisStats, setAnalysisStats] = useState({
    totalImages: 0,
    vehiclesDetected: 0,
    buildingsIdentified: 0,
    anomaliesFound: 0,
    averageConfidence: 0
  });

  useEffect(() => {
    fetchSatelliteData();
  }, []);

  useEffect(() => {
    filterData();
  }, [satelliteData, selectedDate, dateRange, selectedSatellite]);

  const fetchSatelliteData = async () => {
    try {
      setLoading(true);
      // Generate some initial mock data for demonstration
      const mockData = [
        {
          id: 'landsat_demo_1',
          satellite_name: 'Landsat-8',
          acquisition_date: new Date().toISOString(),
          geometry: { type: 'Point', coordinates: [-77.04, 38.88] },
          confidence_score: 0.85,
          data_type: 'multispectral',
          metadata: {
            resolution: '30m',
            cloud_coverage: 15,
            tile_id: 'LC08_L1TP_016033_20241025',
            path_row: '016_033',
            sun_elevation: 45
          },
          aoi_covered: false,
          coverage_percentage: 0,
          real_image: false,
          mock_image_url: '/landsat8.png'
        },
        {
          id: 'sentinel_demo_1',
          satellite_name: 'Sentinel-1A',
          acquisition_date: new Date().toISOString(),
          geometry: { type: 'Point', coordinates: [-77.03, 38.89] },
          confidence_score: 0.92,
          data_type: 'optical',
          metadata: {
            resolution: '10m',
            cloud_coverage: 8,
            tile_id: 'S1A_IW_GRDH_1SDV_20241024',
            path_row: '016_033',
            sun_elevation: 42
          },
          aoi_covered: false,
          coverage_percentage: 0,
          real_image: false,
          mock_image_url: '/sentinel1.png'
        },
        {
          id: 'sentinel2_demo_1',
          satellite_name: 'Sentinel-2A',
          acquisition_date: new Date().toISOString(),
          geometry: { type: 'Point', coordinates: [-77.02, 38.87] },
          confidence_score: 0.88,
          data_type: 'multispectral',
          metadata: {
            resolution: '10m',
            cloud_coverage: 12,
            tile_id: 'S2A_MSIL1C_20241025',
            path_row: '016_033',
            sun_elevation: 48
          },
          aoi_covered: false,
          coverage_percentage: 0,
          real_image: false,
          mock_image_url: '/sentinel1.png'
        }
      ];
      setSatelliteData(mockData);
    } catch (error) {
      console.error('Error fetching satellite data:', error);
      if (!errorShown) {
        toast.error('Failed to load satellite data');
        setErrorShown(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...satelliteData];

    // Filter by date range
    const today = new Date();
    const selectedDateObj = new Date(selectedDate);

    switch (dateRange) {
      case 'today':
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.acquisition_date);
          return itemDate.toDateString() === today.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(item => new Date(item.acquisition_date) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(item => new Date(item.acquisition_date) >= monthAgo);
        break;
      case 'custom':
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.acquisition_date);
          return itemDate.toDateString() === selectedDateObj.toDateString();
        });
        break;
    }

    // Filter by satellite type
    if (selectedSatellite !== 'all') {
      filtered = filtered.filter(item => item.satellite_name === selectedSatellite);
    }

    setFilteredData(filtered);
  };

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 0.9) return 'bg-green-600 text-white';
    if (confidence >= 0.7) return 'bg-yellow-600 text-white';
    return 'bg-red-600 text-white';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-400';
    if (confidence >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleGeoJSONUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/geo+json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const geojson = JSON.parse(e.target.result);
          setUploadedAOI(geojson);
          setAoiName(file.name.replace('.geojson', ''));
          toast.success(`AOI uploaded: ${file.name}`);
          
          // Automatically search for tiles covering this AOI
          searchTilesForAOI(geojson);
        } catch (error) {
          toast.error('Invalid GeoJSON file');
        }
      };
      reader.readAsText(file);
    } else {
      toast.error('Please upload a valid GeoJSON file');
    }
  };

  const searchTilesForAOI = async (geojson) => {
    try {
      setSearchingTiles(true);
      const bbox = calculateBoundingBox(geojson);
      
      const response = await axios.post('http://localhost:5000/api/satellite/search-tiles', {
        geojson,
        bbox,
        satellite: selectedSatellite,
        dateRange
      });

      if (response.data.tiles && response.data.tiles.length > 0) {
        // Update the satellite data with AOI-filtered results
        setSatelliteData(response.data.tiles);
        toast.success(`Found ${response.data.tiles.length} satellite tiles covering your AOI`);
      } else {
        // Generate mock tiles for the AOI if no real data found
        const mockTiles = generateMockTilesForAOI(bbox);
        setSatelliteData(mockTiles);
        toast.success(`Generated ${mockTiles.length} mock satellite tiles for your AOI`);
      }
    } catch (error) {
      console.error('Error searching tiles:', error);
      toast.error('Failed to search for satellite tiles');
    } finally {
      setSearchingTiles(false);
    }
  };

  const calculateBoundingBox = (geojson) => {
    let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
    
    geojson.features.forEach(feature => {
      if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates[0].forEach(coord => {
          minLon = Math.min(minLon, coord[0]);
          maxLon = Math.max(maxLon, coord[0]);
          minLat = Math.min(minLat, coord[1]);
          maxLat = Math.max(maxLat, coord[1]);
        });
      }
    });
    
    return { minLon, maxLon, minLat, maxLat };
  };

  const generateMockTilesForAOI = (bbox) => {
    const tiles = [];
    const tileCount = Math.floor(Math.random() * 3) + 1; // 1-3 tiles
    
    for (let i = 0; i < tileCount; i++) {
      const lat = bbox.minLat + Math.random() * (bbox.maxLat - bbox.minLat);
      const lon = bbox.minLon + Math.random() * (bbox.maxLon - bbox.minLon);
      
      tiles.push({
        id: `tile_${Date.now()}_${i}`,
        satellite_name: selectedSatellite === 'all' ? (Math.random() > 0.5 ? 'Landsat-8' : 'Sentinel-1A') : selectedSatellite,
        acquisition_date: new Date().toISOString(),
        geometry: { type: 'Point', coordinates: [lon, lat] },
        confidence_score: 0.7 + Math.random() * 0.3,
        data_type: selectedSatellite === 'Landsat-8' ? 'multispectral' : 'optical',
        metadata: {
          resolution: selectedSatellite === 'Landsat-8' ? '30m' : '10m',
          cloud_coverage: Math.random() * 30,
          tile_id: `${selectedSatellite}_${Date.now()}_${i}`,
          path_row: `${Math.floor(Math.random() * 200) + 1}_${Math.floor(Math.random() * 200) + 1}`,
          sun_elevation: 30 + Math.random() * 40
        },
        aoi_covered: true,
        coverage_percentage: 60 + Math.random() * 40,
        real_image: false,
        mock_image_url: generateMockSatelliteImageUrl(selectedSatellite, lat, lon, new Date())
      });
    }
    
    return tiles;
  };

  const generateMockSatelliteImageUrl = (satelliteType, lat, lon, date) => {
    // Use local PNG files from the AOI folder
    const localSatelliteImages = {
      landsat: '/landsat8.png',  // Local Landsat 8 PNG
      sentinel1: '/sentinel1.png',  // Local Sentinel 1 PNG
      sentinel2: '/sentinel1.png'   // Use Sentinel 1 PNG for Sentinel 2 as well
    };

    // Return the appropriate local image based on satellite type
    return localSatelliteImages[satelliteType] || localSatelliteImages.landsat;
  };

  const clearAOI = () => {
    setUploadedAOI(null);
    setAoiName('');
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('AOI cleared');
  };

  const handleViewImage = (data) => {
    setSelectedImage(data);
    setShowImageViewer(false); // Don't show modal, show inline instead
    toast.success(`Opening ${data.satellite_name} image viewer`);
  };

  const closeImageViewer = () => {
    setShowImageViewer(false);
    setSelectedImage(null);
  };

  const generateImageUrl = (data) => {
    // Prioritize real NASA image, then mock image, then fallback
    if (data.image_url) {
      return data.image_url;
    } else if (data.mock_image_url) {
      return data.mock_image_url;
    } else {
      return generateRealisticSatelliteImage(data);
    }
  };

  const generateRealisticSatelliteImage = (data) => {
    const { satellite_name } = data;

    // Use local PNG files from the AOI folder
    const localSatelliteImages = {
      'Landsat-8': '/landsat8.png',  // Local Landsat 8 PNG
      'Sentinel-1A': '/sentinel1.png',  // Local Sentinel 1 PNG
      'Sentinel-2A': '/sentinel1.png'   // Use Sentinel 1 PNG for Sentinel 2 as well
    };

    // Return the appropriate local image based on satellite type
    return localSatelliteImages[satellite_name] || localSatelliteImages['Landsat-8'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Satellite Data Analysis</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Date</option>
          </select>
          <select
            value={selectedSatellite}
            onChange={(e) => setSelectedSatellite(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Satellites</option>
            <option value="Landsat-8">Landsat-8</option>
            <option value="Sentinel-1A">Sentinel-1A</option>
            <option value="Sentinel-2A">Sentinel-2A</option>
          </select>
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".geojson"
              onChange={handleGeoJSONUpload}
              className="hidden"
              id="aoi-upload"
            />
            <label
              htmlFor="aoi-upload"
              className="btn-secondary cursor-pointer flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Upload AOI</span>
            </label>
            {uploadedAOI && (
              <button
                onClick={clearAOI}
                className="btn-secondary text-red-400 hover:text-red-300"
              >
                Clear AOI
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Image Viewer - Takes maximum space */}
      {selectedImage && (
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white">{selectedImage.satellite_name}</h2>
              <p className="text-sm text-gray-400">
                {selectedImage.data_type} • {selectedImage.metadata?.resolution} • {new Date(selectedImage.acquisition_date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="btn-secondary text-sm">
                <Download className="h-4 w-4 mr-1" />
                Download
              </button>
              <button 
                onClick={() => setSelectedImage(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Large Image Display */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '70vh', minHeight: '600px' }}>
            <img
              src={generateImageUrl(selectedImage)}
              alt={`${selectedImage.satellite_name} satellite image`}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjMzMzMzMzIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TYXRlbGxpdGUgSW1hZ2UgUHJldmlldzwvdGV4dD4KPC9zdmc+';
              }}
            />
            
            {/* AOI Overlay */}
            {uploadedAOI && (
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full">
                  {uploadedAOI.features.map((feature, index) => {
                    if (feature.geometry.type === 'Polygon') {
                      const coords = feature.geometry.coordinates[0];
                      const points = coords.map(coord => {
                        // Convert geographic coordinates to SVG coordinates
                        // This is a simplified mapping - in a real app you'd use proper projection
                        const x = ((coord[0] + 180) / 360) * 100;
                        const y = ((90 - coord[1]) / 180) * 100;
                        return `${x}%,${y}%`;
                      }).join(' ');
                      
                      return (
                        <polygon
                          key={index}
                          points={points}
                          fill="none"
                          stroke="#ff0000"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          opacity="0.8"
                        />
                      );
                    }
                    return null;
                  })}
                </svg>
              </div>
            )}
            
            {/* Compact Image Overlay Info */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-80 text-white p-2 rounded text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-2 w-2" />
                  <span>{selectedImage.geometry ? 
                    (typeof selectedImage.geometry === 'string' ? JSON.parse(selectedImage.geometry) : selectedImage.geometry).coordinates.join(', ') 
                    : 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-2 w-2" />
                  <span>{new Date(selectedImage.acquisition_date).toLocaleString()}</span>
                </div>
                {selectedImage.metadata && (
                  <>
                    <div>{selectedImage.metadata.resolution}</div>
                    {selectedImage.metadata.cloud_coverage !== undefined && (
                      <div>{Math.round(selectedImage.metadata.cloud_coverage)}% clouds</div>
                    )}
                    {selectedImage.coverage_percentage && (
                      <div>{Math.round(selectedImage.coverage_percentage)}% AOI</div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Satellite Data List - Below the main image */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-4 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Satellite className="h-5 w-5 mr-2" />
              Satellite Images ({filteredData.length})
              {uploadedAOI && (
                <span className="ml-2 text-sm text-green-400">• AOI: {aoiName}</span>
              )}
            </h2>
            <div className="flex items-center space-x-2">
              {uploadedAOI && (
                <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                  AOI Filtered
                </span>
              )}
            </div>
          </div>
          <div className="space-y-3">
            {filteredData.length > 0 ? (
              filteredData.map((data, index) => (
                <div key={index} className={`bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors ${data.aoi_covered ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-white font-medium">{data.satellite_name}</h3>
                        <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                          {data.data_type || 'optical'}
                        </span>
                        {data.aoi_covered && (
                          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                            Covers AOI
                          </span>
                        )}
                        {data.real_image && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            NASA Image
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center text-gray-400 text-sm">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(data.acquisition_date).toLocaleString()}
                        </div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <MapPin className="h-3 w-3 mr-1" />
                          {data.geometry ? 
                            (typeof data.geometry === 'string' ? JSON.parse(data.geometry) : data.geometry).coordinates.join(', ') 
                            : 'N/A'}
                        </div>
                        {data.metadata && (
                          <div className="flex items-center space-x-2 text-gray-400 text-sm">
                            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                              {data.metadata.resolution || 'N/A'} resolution
                            </span>
                            {data.metadata.cloud_coverage !== undefined && (
                              <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">
                                {Math.round(data.metadata.cloud_coverage)}% clouds
                              </span>
                            )}
                            {data.coverage_percentage && (
                              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                                {Math.round(data.coverage_percentage)}% AOI coverage
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`status-indicator ${getConfidenceBadge(data.confidence_score || 0.8)}`}>
                        {Math.round((data.confidence_score || 0.8) * 100)}% Confidence
                      </span>
                      <button 
                        onClick={() => handleViewImage(data)}
                        className="btn-secondary text-xs hover:bg-blue-600 transition-colors"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Satellite className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No satellite data found for selected criteria</p>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Analysis Summary
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <span className="text-gray-300">Vehicles Detected</span>
              <span className="text-white font-semibold">{analysisStats.vehiclesDetected}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <span className="text-gray-300">Buildings Identified</span>
              <span className="text-white font-semibold">{analysisStats.buildingsIdentified}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <span className="text-gray-300">Anomalies Found</span>
              <span className="text-white font-semibold">{analysisStats.anomaliesFound}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <span className="text-gray-300">Avg Confidence</span>
              <span className="text-white font-semibold">{Math.round(analysisStats.averageConfidence * 100)}%</span>
            </div>
            <div className="pt-4 border-t border-gray-700">
              <button className="w-full btn-secondary text-sm">
                <Download className="h-3 w-3 mr-2" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SatelliteData;