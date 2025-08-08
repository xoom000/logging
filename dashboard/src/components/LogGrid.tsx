/**
 * 📊 LOG GRID - 9 Panel Real-time Log Display
 * 
 * Following 33tools architecture with configuration-driven approach
 * - 9 panels showing different log categories
 * - Real-time updates via WebSocket
 * - Professional glass-morphism UI
 */

import React, { useState, useEffect } from 'react';
import LogPanel from './LogPanel';
import { LogGridProps, LogEntry, LogPanelConfig } from '../types/LogTypes';

// Configuration for 9 log panels following 33tools patterns
const LOG_PANEL_CONFIGS: LogPanelConfig[] = [
  {
    category: 'API',
    title: '🌐 API Logs',
    color: 'blue',
    icon: '🌐',
    maxLines: 50,
    autoScroll: true
  },
  {
    category: 'FRONTEND', 
    title: '⚛️ Frontend Logs',
    color: 'green',
    icon: '⚛️',
    maxLines: 50,
    autoScroll: true
  },
  {
    category: 'DATABASE',
    title: '🗄️ Database Logs', 
    color: 'purple',
    icon: '🗄️',
    maxLines: 50,
    autoScroll: true
  },
  {
    category: 'AUTH',
    title: '🔐 Auth Logs',
    color: 'yellow',
    icon: '🔐',
    maxLines: 50,
    autoScroll: true
  },
  {
    category: 'ERROR',
    title: '❌ Error Logs',
    color: 'red', 
    icon: '❌',
    maxLines: 100,
    autoScroll: true
  },
  {
    category: 'PERFORMANCE',
    title: '📊 Performance',
    color: 'orange',
    icon: '📊',
    maxLines: 30,
    autoScroll: true
  },
  {
    category: 'BUSINESS',
    title: '🚛 Business Logic',
    color: 'teal',
    icon: '🚛',
    maxLines: 50,
    autoScroll: true
  },
  {
    category: 'SYSTEM',
    title: '🔄 System Events',
    color: 'gray',
    icon: '🔄',
    maxLines: 30,
    autoScroll: true
  },
  {
    category: 'DEBUG',
    title: '🎯 Debug Logs',
    color: 'pink',
    icon: '🎯',
    maxLines: 50,
    autoScroll: true
  }
];

const LogGrid: React.FC<LogGridProps> = ({ logs, socket, isConnected, debugBorders }) => {
  const [filteredLogs, setFilteredLogs] = useState<{ [key: string]: LogEntry[] }>({});

  // Filter logs by category for each panel
  useEffect(() => {
    const newFilteredLogs: { [key: string]: LogEntry[] } = {};
    
    LOG_PANEL_CONFIGS.forEach(config => {
      newFilteredLogs[config.category] = logs
        .filter(log => log.category === config.category)
        .slice(0, config.maxLines);
    });
    
    setFilteredLogs(newFilteredLogs);
  }, [logs]);

  // Subscribe to categories when socket connects
  useEffect(() => {
    if (socket && isConnected) {
      console.log('📺 Subscribing to all log categories...');
      LOG_PANEL_CONFIGS.forEach(config => {
        socket.emit('subscribe_category', config.category);
      });
    }
  }, [socket, isConnected]);

  const handleClearPanel = (category: string) => {
    console.log(`🧹 Clearing panel: ${category}`);
    // In a real implementation, you might want to clear specific logs
    // For now, we'll just refresh the data
    if (socket) {
      socket.emit('request_recent', { category, limit: 10 });
    }
  };

  const handleExportPanel = (category: string) => {
    console.log(`📋 Exporting panel: ${category}`);
    const categoryLogs = filteredLogs[category] || [];
    
    if (categoryLogs.length === 0) {
      alert('No logs to export for this category');
      return;
    }

    // Create CSV content
    const csvContent = [
      'Timestamp,Level,Category,Message,Data,Source',
      ...categoryLogs.map(log => 
        `"${log.timestamp}","${log.level}","${log.category}","${log.message}","${log.data ? JSON.stringify(log.data) : ''}","${log.source}"`
      )
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${category.toLowerCase()}-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="neuro-grid" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, minmax(480px, 1fr))', 
      gap: '20px',
      minHeight: 'calc(100vh - 280px)'
    }}>
      {LOG_PANEL_CONFIGS.map((config, index) => (
        <div
          key={config.category}
          className={`
            ${index === 4 ? 'neuro-panel-wide' : ''} 
            ${index === 7 ? 'neuro-panel-medium' : ''}
            ${index === 8 ? 'neuro-panel-small' : ''}
          `}
          style={{
            gridColumn: index === 4 ? 'span 3' : index === 7 ? 'span 2' : index === 8 ? 'span 1' : 'auto'
          }}
        >
          <LogPanel
            config={config}
            logs={filteredLogs[config.category] || []}
            isConnected={isConnected}
            onClear={() => handleClearPanel(config.category)}
            onExport={() => handleExportPanel(config.category)}
            debugBorders={debugBorders}
          />
        </div>
      ))}
    </div>
  );
};

export default LogGrid;