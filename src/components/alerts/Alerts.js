import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { useAlerts } from '../../contexts/AlertContext';
import { useSocket } from '../../contexts/SocketContext';
import LoadingSpinner from '../common/LoadingSpinner';

const Alerts = () => {
  const { alerts, loading, stats, acknowledgeAlert, resolveAlert } = useAlerts();
  const { acknowledgeAlert: socketAcknowledgeAlert } = useSocket();
  const [filter, setFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    // Fetch alerts when component mounts
  }, []);

  const handleAcknowledge = async (alertId) => {
    await acknowledgeAlert(alertId);
    socketAcknowledgeAlert(alertId);
  };

  const handleResolve = async (alertId, resolution) => {
    await resolveAlert(alertId, resolution);
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'acknowledged':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.status === filter;
  });

  if (loading) {
    return <LoadingSpinner text="Loading alerts..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Alert Management</h1>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Alerts</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-400">Total Alerts</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-400">Active</p>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-400">Acknowledged</p>
              <p className="text-2xl font-bold text-white">{stats.acknowledged}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-white">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="card">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Alerts</h2>
          <div className="space-y-3">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{alert.title}</h3>
                        <p className="text-gray-300 text-sm mt-1">{alert.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`status-indicator severity-${alert.severity}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          <div className="flex items-center text-gray-400 text-sm">
                            {getStatusIcon(alert.status)}
                            <span className="ml-1">{alert.status}</span>
                          </div>
                          <span className="text-gray-400 text-sm">
                            {new Date(alert.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {alert.status === 'active' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcknowledge(alert.id);
                          }}
                          className="btn-secondary text-xs"
                        >
                          Acknowledge
                        </button>
                      )}
                      {alert.status === 'acknowledged' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolve(alert.id, 'Resolved by analyst');
                          }}
                          className="btn-primary text-xs"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No alerts found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">{selectedAlert.title}</h2>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400">Description</h3>
                <p className="text-white">{selectedAlert.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Severity</h3>
                  <span className={`status-indicator severity-${selectedAlert.severity}`}>
                    {selectedAlert.severity.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Status</h3>
                  <span className={`status-indicator status-${selectedAlert.status}`}>
                    {selectedAlert.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-400">Created</h3>
                <p className="text-white">{new Date(selectedAlert.created_at).toLocaleString()}</p>
              </div>
              
              {selectedAlert.acknowledged_by_username && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Acknowledged By</h3>
                  <p className="text-white">{selectedAlert.acknowledged_by_username}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedAlert(null)}
                className="btn-secondary"
              >
                Close
              </button>
              {selectedAlert.status === 'active' && (
                <button
                  onClick={() => {
                    handleAcknowledge(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                  className="btn-primary"
                >
                  Acknowledge
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
