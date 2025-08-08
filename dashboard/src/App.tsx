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
import { useLogSocket } from './hooks/useLogSocket';
import { LogEntry, DashboardStats } from './types/LogTypes';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import './App.css';

const DashboardApp: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
        <button 
          onClick={() => {
            // Dump all visible log data to clipboard
            const logData = {
              timestamp: new Date().toISOString(),
              connectionStatus: connectionStatus,
              isConnected: isConnected,
              totalLogs: totalLogs,
              logsArray: logs,
              logsCount: logs.length,
              statsData: stats
            };
            
            const dumpText = `🔍 LOG DUMP - ${new Date().toLocaleString()}
════════════════════════════════════════════════════════════════════════════

📊 CONNECTION STATUS:
- Status: ${connectionStatus}
- Connected: ${isConnected}
- Total Logs: ${totalLogs}

📋 LOGS ARRAY (Length: ${logs.length}):
${logs.length === 0 ? '❌ NO LOGS FOUND IN CLIENT' : logs.map((log, index) => 
`${index + 1}. [${log.timestamp}] ${log.level} - ${log.message} (Source: ${log.source})`
).join('\n')}

📈 STATS DATA:
${stats ? JSON.stringify(stats, null, 2) : '❌ NO STATS DATA'}

🔗 RAW LOG OBJECT:
${JSON.stringify(logData, null, 2)}

════════════════════════════════════════════════════════════════════════════`;

            navigator.clipboard.writeText(dumpText).then(() => {
              alert(`📋 LOG DUMP COPIED TO CLIPBOARD!\n\nFound ${logs.length} logs in client\nConnection: ${isConnected ? 'Connected' : 'Disconnected'}`);
            }).catch(() => {
              // Fallback - show in alert if clipboard fails
              alert('Clipboard failed - showing in console');
              console.log('LOG DUMP:', dumpText);
            });
          }} 
          className="neuro-toggle"
          style={{ background: '#ff6b6b', color: 'white', fontWeight: 'bold' }}
        >
          📋 LOG DUMP
        </button>
        <button 
          onClick={() => window.open('/design-system', '_blank')} 
          className="neuro-toggle"
          style={{ opacity: 0.7 }}
        >
          🎨 Design Tools
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
        
        {/* Settings Modal */}
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
        
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
