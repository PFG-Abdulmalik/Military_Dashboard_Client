import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AlertContext = createContext();

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    acknowledged: 0,
    resolved: 0
  });

  const fetchAlerts = async (params = {}) => {
    setLoading(true);
    try {
      const response = await axios.get('/api/alerts', { params });
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertStats = async () => {
    try {
      const response = await axios.get('/api/alerts/stats/summary');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch alert stats:', error);
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      await axios.put(`/api/alerts/${alertId}/acknowledge`);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'acknowledged', acknowledged_at: new Date().toISOString() }
          : alert
      ));
      toast.success('Alert acknowledged');
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  const resolveAlert = async (alertId, resolution) => {
    try {
      await axios.put(`/api/alerts/${alertId}/resolve`, { resolution });
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'resolved' }
          : alert
      ));
      toast.success('Alert resolved');
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  const createAlert = async (alertData) => {
    try {
      const response = await axios.post('/api/alerts', alertData);
      setAlerts(prev => [response.data.alert, ...prev]);
      toast.success('Alert created successfully');
      return response.data.alert;
    } catch (error) {
      console.error('Failed to create alert:', error);
      toast.error('Failed to create alert');
      throw error;
    }
  };

  const getAlertById = (alertId) => {
    return alerts.find(alert => alert.id === alertId);
  };

  const getAlertsBySeverity = (severity) => {
    return alerts.filter(alert => alert.severity === severity);
  };

  const getActiveAlerts = () => {
    return alerts.filter(alert => alert.status === 'active');
  };

  useEffect(() => {
    fetchAlerts();
    fetchAlertStats();
  }, []);

  const value = {
    alerts,
    loading,
    stats,
    fetchAlerts,
    fetchAlertStats,
    acknowledgeAlert,
    resolveAlert,
    createAlert,
    getAlertById,
    getAlertsBySeverity,
    getActiveAlerts
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};
