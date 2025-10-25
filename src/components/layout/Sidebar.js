import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Map, 
  Satellite, 
  AlertTriangle, 
  Shield, 
  FileText, 
  Settings, 
  LogOut,
  X,
  Menu
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, clearance: 1 },
    { name: 'Satellite Data', href: '/satellite', icon: Satellite, clearance: 2 },
    { name: 'Map View', href: '/map', icon: Map, clearance: 2 },
    { name: 'Strategic Zones', href: '/zones', icon: Shield, clearance: 2 },
    { name: 'Alerts', href: '/alerts', icon: AlertTriangle, clearance: 2 },
    { name: 'Audit Logs', href: '/audit', icon: FileText, clearance: 5, role: 'admin' },
    { name: 'Settings', href: '/settings', icon: Settings, clearance: 1 },
  ];

  const filteredNavigation = navigation.filter(item => {
    if (item.role && !item.role.includes(user?.role)) return false;
    if (item.clearance && user?.clearanceLevel < item.clearance) return false;
    return true;
  });

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-xl font-bold text-white">Military Dashboard</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.username}</p>
              <p className="text-xs text-gray-400">
                {user?.role} • Level {user?.clearanceLevel}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-2">
          <div className="space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    sidebar-item rounded-lg
                    ${isActive ? 'active' : ''}
                  `}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full sidebar-item rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
