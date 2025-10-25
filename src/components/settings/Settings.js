import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Shield, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    notifications: true,
    theme: 'dark'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile({ email: formData.email });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Profile Settings
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="input-field w-full bg-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role
              </label>
              <input
                type="text"
                value={user?.role || ''}
                disabled
                className="input-field w-full bg-gray-600"
              />
            </div>
            <button type="submit" className="btn-primary">
              Update Profile
            </button>
          </form>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Email Notifications</span>
              <input
                type="checkbox"
                checked={formData.notifications}
                onChange={(e) => setFormData({...formData, notifications: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Alert Notifications</span>
              <input
                type="checkbox"
                checked={true}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
