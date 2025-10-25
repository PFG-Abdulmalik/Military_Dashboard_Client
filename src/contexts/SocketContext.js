import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          token: token
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Connection to server failed');
      });

      // Real-time alert notifications
      newSocket.on('alerts:new_alerts', (data) => {
        toast.error(`New Alert: ${data.alerts[0]?.title}`, {
          duration: 6000,
          style: {
            background: '#dc2626',
            color: 'white'
          }
        });
      });

      // Alert acknowledgment updates
      newSocket.on('alert:acknowledged', (data) => {
        toast.success(`Alert acknowledged by ${data.acknowledgedBy}`, {
          duration: 4000
        });
      });

      // Zone status updates
      newSocket.on('zone:status_updated', (data) => {
        toast.info(`Zone ${data.zone.zone_name} status updated to ${data.status}`, {
          duration: 4000
        });
      });

      // Satellite processing updates
      newSocket.on('satellite:processing_complete', (data) => {
        toast.success(`Satellite data processed: ${Math.round(data.confidence * 100)}% confidence`, {
          duration: 4000
        });
      });

      newSocket.on('satellite:processing_error', (data) => {
        toast.error('Satellite data processing failed', {
          duration: 4000
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, token]);

  const emitEvent = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  const joinSession = (sessionId) => {
    emitEvent('collaboration:join_session', { sessionId });
  };

  const leaveSession = (sessionId) => {
    emitEvent('collaboration:leave_session', { sessionId });
  };

  const acknowledgeAlert = (alertId) => {
    emitEvent('alert:acknowledge', { alertId });
  };

  const updateZoneStatus = (zoneId, status) => {
    emitEvent('zone:status_update', { zoneId, status });
  };

  const processSatelliteData = (satelliteDataId, analysisType) => {
    emitEvent('satellite:process', { satelliteDataId, analysisType });
  };

  const updateMapView = (viewData) => {
    emitEvent('map:view_changed', viewData);
  };

  const value = {
    socket,
    connected,
    emitEvent,
    joinSession,
    leaveSession,
    acknowledgeAlert,
    updateZoneStatus,
    processSatelliteData,
    updateMapView
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
