import React from 'react';
import { Shield, MapPin, AlertTriangle } from 'lucide-react';

const StrategicZones = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Strategic Zones</h1>
        <div className="flex space-x-2">
          <button className="btn-primary">
            <Shield className="h-4 w-4 mr-2" />
            Add New Zone
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Zone Overview</h2>
          <div className="space-y-3">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                  <div>
                    <h3 className="text-white font-medium">Northern Border Zone</h3>
                    <p className="text-gray-400 text-sm">Military Installation</p>
                  </div>
                </div>
                <span className="status-indicator status-normal">Normal</span>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-orange-500 mr-2" />
                  <div>
                    <h3 className="text-white font-medium">Eastern Conflict Zone</h3>
                    <p className="text-gray-400 text-sm">High Risk Area</p>
                  </div>
                </div>
                <span className="status-indicator status-warning">Warning</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Zone Statistics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total Zones</span>
              <span className="text-white font-semibold">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Active Monitoring</span>
              <span className="text-green-400 font-semibold">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">High Priority</span>
              <span className="text-red-400 font-semibold">3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategicZones;
