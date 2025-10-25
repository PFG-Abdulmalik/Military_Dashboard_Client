import React, { useState, useEffect } from 'react';
import { Map, BarChart3, AlertTriangle, Shield, Activity, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAlerts: 0,
    activeAlerts: 0,
    satelliteImages: 0,
    strategicZones: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [alertsResponse, satelliteResponse, zonesResponse] = await Promise.all([
        axios.get('/api/alerts/stats/summary'),
        axios.get('/api/satellite/insights?limit=5'),
        axios.get('/api/map/zones?limit=10')
      ]);

      setStats({
        totalAlerts: alertsResponse.data.stats.total_alerts || 0,
        activeAlerts: alertsResponse.data.stats.active_alerts || 0,
        satelliteImages: satelliteResponse.data.insights?.length || 0,
        strategicZones: zonesResponse.data.zones?.length || 0,
        recentActivity: satelliteResponse.data.insights?.slice(0, 5) || []
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="card p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {trend && (
            <p className="text-xs text-green-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.username}
        </h1>
        <p className="text-blue-100">
          {user?.role === 'admin' ? 'Administrator Dashboard' : 
           user?.role === 'commander' ? 'Command Center' : 
           'Analyst Workspace'} - Level {user?.clearanceLevel} Clearance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Alerts"
          value={stats.totalAlerts}
          icon={AlertTriangle}
          color="bg-red-600"
          trend="+12% this week"
        />
        <StatCard
          title="Active Alerts"
          value={stats.activeAlerts}
          icon={Activity}
          color="bg-orange-600"
        />
        <StatCard
          title="Satellite Images"
          value={stats.satelliteImages}
          icon={Map}
          color="bg-blue-600"
          trend="+8% this week"
        />
        <StatCard
          title="Strategic Zones"
          value={stats.strategicZones}
          icon={Shield}
          color="bg-green-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Recent Satellite Analysis
          </h3>
          <div className="space-y-3">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {activity.satellite_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.acquisition_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`status-indicator ${
                      activity.confidence_score > 0.8 ? 'status-normal' : 
                      activity.confidence_score > 0.6 ? 'status-warning' : 'status-critical'
                    }`}>
                      {Math.round(activity.confidence_score * 100)}% confidence
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            System Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-300">Database Connection</span>
              <span className="status-indicator status-normal">Online</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-300">Satellite Feed</span>
              <span className="status-indicator status-normal">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-300">Alert System</span>
              <span className="status-indicator status-normal">Monitoring</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-300">Security Status</span>
              <span className="status-indicator status-normal">Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary flex items-center justify-center">
            <Map className="h-4 w-4 mr-2" />
            View Map
          </button>
          <button className="btn-secondary flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Check Alerts
          </button>
          <button className="btn-secondary flex items-center justify-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analyze Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
