/**
 * 🚀 33TOOLS LOGGING DASHBOARD
 * 
 * Real-time logging dashboard with 9 live log panels
 * - Uses WebSocket for real-time updates
 * - Follows 33tools architecture patterns
 * - Professional UI with dark theme
 */

import React, { useState } from 'react';
import LogGrid from './components/LogGrid';
import DashboardHeader from './components/DashboardHeader';
import ConnectionStatus from './components/ConnectionStatus';
import { SettingsModal } from './components/SettingsModalSimple';
import { DesignSystemEasel } from './components/DesignSystemEasel';
import { useLogSocket } from './hooks/useLogSocket';
import { LogEntry, DashboardStats } from './types/LogTypes';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import './App.css';

const DashboardApp: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEaselOpen, setIsEaselOpen] = useState(false);
  const { settings } = useSettings();
  
  // Initialize WebSocket connection
  const { socket, connectionStatus, totalLogs } = useLogSocket({
    onConnect: () => setIsConnected(true),
    onDisconnect: () => setIsConnected(false),
    onNewLog: (log: LogEntry) => {
      setLogs(prev => [log, ...prev.slice(0, 999)]); // Keep last 1000 logs
    },
    onStats: (newStats: DashboardStats) => setStats(newStats)
  });

  return (
    <div className="min-h-screen">
      {/* Professional Header */}
      <DashboardHeader 
        isConnected={isConnected}
        totalLogs={totalLogs}
        stats={stats}
      />
      
      {/* Connection Status Bar */}
      <ConnectionStatus 
        status={connectionStatus}
        isConnected={isConnected}
      />
      
      {/* Control Buttons */}
      <div className="neuro-flex" style={{ padding: '20px', justifyContent: 'center', gap: '16px' }}>
        <button onClick={() => setIsSettingsOpen(true)} className="neuro-toggle">
          ⚙️ Dashboard Settings
        </button>
        <button onClick={() => {
          console.log('Design System Easel button clicked!');
          setIsEaselOpen(true);
        }} className="neuro-toggle">
          🎨 Design System Easel
        </button>
      </div>

      {/* Main Dashboard Content */}
      <main className="neuro-grid">
        {/* 9-Panel Log Grid */}
        <LogGrid 
          logs={logs}
          socket={socket}
          isConnected={isConnected}
          debugBorders={settings.debug.showBorders ? settings.debug.borderSettings : undefined}
        />
        
        {/* Modals */}
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
        <DesignSystemEasel 
          isOpen={isEaselOpen} 
          onClose={() => {
            console.log('Closing Design System Easel');
            setIsEaselOpen(false);
          }} 
        />
        {isEaselOpen && <div style={{position: 'fixed', top: 0, left: 0, background: 'red', color: 'white', zIndex: 9999, padding: '10px'}}>EASEL IS OPEN</div>}
        
        {/* Footer Stats - Refined Neumorphic Style */}
        <footer className="neuro-card" style={{ padding: '30px', marginTop: '30px' }}>
          <div className="neuro-flex neuro-flex-wrap" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <span className="neuro-log-text defined">🚀 33Tools Logging System</span>
            <span className="neuro-log-text soft">📡 Port 7720 (Dashboard)</span>
            <span className="neuro-log-text soft">🔗 Connected to 7710 (API)</span>
            <span className="neuro-log-text soft">⚡ Real-time WebSocket</span>
          </div>
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <span className="neuro-log-text soft" style={{ fontSize: '12px' }}>
              Built with React 19 + TypeScript + Socket.io + Refined Neumorphic Design
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <DashboardApp />
    </SettingsProvider>
  );
};

export default App;
