import React from 'react';
import { FileText, User, Clock } from 'lucide-react';

const AuditLogs = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <div className="flex space-x-2">
          <button className="btn-secondary">
            <FileText className="h-4 w-4 mr-2" />
            Export Logs
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <h3 className="text-white font-medium">User Login</h3>
                  <p className="text-gray-400 text-sm">analyst_user logged in</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-gray-400 text-sm">2 minutes ago</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <h3 className="text-white font-medium">Data Access</h3>
                  <p className="text-gray-400 text-sm">Satellite data accessed</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-gray-400 text-sm">5 minutes ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
