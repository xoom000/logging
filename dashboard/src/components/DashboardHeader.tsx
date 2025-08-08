/**
 * 📊 DASHBOARD HEADER - Professional Top Bar
 * 
 * Following 33tools design patterns with stats and controls
 */

import React from 'react';
import { DashboardHeaderProps } from '../types/LogTypes';
import moment from 'moment';

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isConnected,
  totalLogs,
  stats
}) => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-white/10 p-4">
      <div className="flex items-center justify-between">
        {/* Left Side - Branding */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">33</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">33Tools Logging System</h1>
              <p className="text-slate-400 text-xs">Real-time External Logging Dashboard</p>
            </div>
          </div>
        </div>

        {/* Center - Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            {/* Total Logs */}
            <div className="text-center">
              <div className="text-white font-bold text-lg">{totalLogs.toLocaleString()}</div>
              <div className="text-slate-400 text-xs">Total Logs</div>
            </div>

            {/* Error Count */}
            {stats && (
              <div className="text-center">
                <div className="text-red-400 font-bold text-lg">{stats.errorCount || 0}</div>
                <div className="text-slate-400 text-xs">Errors</div>
              </div>
            )}

            {/* Warning Count */}
            {stats && (
              <div className="text-center">
                <div className="text-yellow-400 font-bold text-lg">{stats.warningCount || 0}</div>
                <div className="text-slate-400 text-xs">Warnings</div>
              </div>
            )}

            {/* Today's Logs */}
            {stats && (
              <div className="text-center">
                <div className="text-green-400 font-bold text-lg">{stats.todayCount || 0}</div>
                <div className="text-slate-400 text-xs">Today</div>
              </div>
            )}

            {/* Connected Clients */}
            {stats && (
              <div className="text-center">
                <div className="text-blue-400 font-bold text-lg">{stats.connectedClients || 0}</div>
                <div className="text-slate-400 text-xs">Clients</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Status & Controls */}
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className={`
              w-3 h-3 rounded-full
              ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}
            `} />
            <span className={`text-sm font-medium ${
              isConnected ? 'text-green-400' : 'text-red-400'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Port Info */}
          <div className="text-slate-400 text-xs">
            <div>Dashboard: :7720</div>
            <div>API: :7710</div>
          </div>

          {/* Uptime */}
          {stats && (
            <div className="text-slate-400 text-xs text-right">
              <div>Uptime</div>
              <div>{moment.duration(stats.uptime || 0, 'milliseconds').humanize()}</div>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Bar - Quick Actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <span>🚀 External Logging System</span>
          <span>•</span>
          <span>📡 Real-time WebSocket Streaming</span>
          <span>•</span>
          <span>🔄 Auto-reconnection Enabled</span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <span>Last Update: {moment().format('HH:mm:ss')}</span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;