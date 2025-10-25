import React, { useState } from 'react';
import { Menu, Bell, User, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { connected } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-400 hover:text-white mr-3"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="hidden lg:flex items-center">
            <h1 className="text-lg font-semibold text-white">
              Military Satellite Surveillance Dashboard
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              connected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm text-gray-400">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-700 border border-gray-600 text-gray-100 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-white"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-3 border-b border-gray-700 hover:bg-gray-700">
                    <p className="text-sm text-white">New satellite data available</p>
                    <p className="text-xs text-gray-400">2 minutes ago</p>
                  </div>
                  <div className="p-3 border-b border-gray-700 hover:bg-gray-700">
                    <p className="text-sm text-white">Alert: Unusual activity detected</p>
                    <p className="text-xs text-gray-400">5 minutes ago</p>
                  </div>
                  <div className="p-3 hover:bg-gray-700">
                    <p className="text-sm text-white">System maintenance scheduled</p>
                    <p className="text-xs text-gray-400">1 hour ago</p>
                  </div>
                </div>
                <div className="p-3 border-t border-gray-700">
                  <button className="text-sm text-blue-400 hover:text-blue-300">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="ml-2 hidden md:block">
              <p className="text-sm font-medium text-white">{user?.username}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
