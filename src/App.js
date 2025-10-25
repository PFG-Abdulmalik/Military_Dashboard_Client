import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MapProvider } from './contexts/MapContext';
import { AlertProvider } from './contexts/AlertContext';
import { SocketProvider } from './contexts/SocketContext';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import MapView from './components/map/MapView';
import SatelliteData from './components/satellite/SatelliteData';
import Alerts from './components/alerts/Alerts';
import StrategicZones from './components/zones/StrategicZones';
import AuditLogs from './components/audit/AuditLogs';
import Settings from './components/settings/Settings';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoadingSpinner from './components/common/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole, requiredClearance }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredClearance && user.clearanceLevel < requiredClearance) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main App Layout
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// App Routes
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={
        // <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        // </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        // <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        // </ProtectedRoute>
      } />
      
      <Route path="/map" element={
        // <ProtectedRoute requiredClearance={2}>
          <AppLayout>
            <MapView />
          </AppLayout>
        // </ProtectedRoute>
      } />
      
      <Route path="/satellite" element={
        // <ProtectedRoute requiredClearance={2}>
          <AppLayout>
            <SatelliteData />
          </AppLayout>
        // </ProtectedRoute>
      } />
      
      <Route path="/alerts" element={
        // <ProtectedRoute requiredClearance={2}>
          <AppLayout>
            <Alerts />
          </AppLayout>
        // </ProtectedRoute>
      } />
      
      <Route path="/zones" element={
        // <ProtectedRoute requiredClearance={2}>
          <AppLayout>
            <StrategicZones />
          </AppLayout>
        // </ProtectedRoute>
      } />
      
      <Route path="/audit" element={
        // <ProtectedRoute requiredRole={['admin']}>
          <AppLayout>
            <AuditLogs />
          </AppLayout>
        // </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        // <ProtectedRoute>
          <AppLayout>
            <Settings />
          </AppLayout>
        // </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MapProvider>
          <AlertProvider>
            <AppRoutes />
          </AlertProvider>
        </MapProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
