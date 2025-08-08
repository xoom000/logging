/**
 * 📺 LOG PANEL - Individual Log Category Display
 * 
 * Terminal-style log viewer with real-time updates
 * - Glass-morphism design following 33tools patterns
 * - Auto-scroll, search, export functionality
 * - Professional UI with smooth animations
 */

import React, { useEffect, useRef, useState } from 'react';
import { LogPanelProps, LogEntry } from '../types/LogTypes';
import { useSettings } from '../contexts/SettingsContext';
import moment from 'moment';

const LogPanel: React.FC<LogPanelProps> = ({ 
  config, 
  logs, 
  isConnected, 
  onClear, 
  onExport,
  debugBorders 
}) => {
  const { settings } = useSettings();
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>(logs);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (config.autoScroll && isScrolledToBottom && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, config.autoScroll, isScrolledToBottom]);

  // Filter logs based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLogs(logs);
    } else {
      const filtered = logs.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.data && JSON.stringify(log.data).toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredLogs(filtered);
    }
  }, [logs, searchTerm]);

  // Handle scroll to detect if user is at bottom
  const handleScroll = () => {
    if (logContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsScrolledToBottom(isAtBottom);
    }
  };

  // Get neumorphic color classes based on log level
  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'neuro-log-error';
      case 'WARN': return 'neuro-log-warning';
      case 'INFO': return 'neuro-log-info';
      case 'DEBUG': return 'neuro-log-success';
      default: return 'neuro-log-text soft';
    }
  };

  // Get icon based on log level
  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR': return '❌ ';
      case 'WARN': return '⚠️ ';
      case 'INFO': return 'ℹ️ ';
      case 'DEBUG': return '🐛 ';
      default: return '📝 ';
    }
  };

  // Get panel border color
  const getPanelColor = (color: string) => {
    const colors = {
      blue: 'border-blue-500/30 bg-blue-500/5',
      green: 'border-green-500/30 bg-green-500/5',
      purple: 'border-purple-500/30 bg-purple-500/5',
      yellow: 'border-yellow-500/30 bg-yellow-500/5',
      red: 'border-red-500/30 bg-red-500/5',
      orange: 'border-orange-500/30 bg-orange-500/5',
      teal: 'border-teal-500/30 bg-teal-500/5',
      gray: 'border-gray-500/30 bg-gray-500/5',
      pink: 'border-pink-500/30 bg-pink-500/5'
    };
    return colors[color as keyof typeof colors] || 'border-slate-500/30 bg-slate-500/5';
  };

  const scrollToBottom = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      setIsScrolledToBottom(true);
    }
  };

  return (
    <div className={`
      h-full neuro-card
      ${isConnected ? 'opacity-100' : 'opacity-70'}
      transition-all duration-300
    `}
    style={{
      border: (config.category === 'API' && debugBorders?.container) ? '3px solid #ff0000' : 'none',
      minWidth: '600px',
      width: '600px'
    }}>
      {/* Panel Header */}
      <div className="neuro-flex" style={{
        border: (config.category === 'API' && debugBorders?.header) ? '2px solid #00ff00' : 'none',
        padding: `var(--header-padding)`,
        justifyContent: `var(--layout-alignment-header, 'space-between')` as any
      }}>
        <div className="neuro-flex">
          <span className="text-lg">{config.icon}</span>
          <h3 className="neuro-log-text defined text-base">{config.title}</h3>
          <div className={`
            w-3 h-3 rounded-full neuro-subtle
            ${isConnected ? 'neuro-log-success neuro-pulse' : 'neuro-log-error'}
          `} />
        </div>
        
        <div className="neuro-flex">
          <span className="neuro-log-text soft text-xs">
            {filteredLogs.length}/{logs.length}
          </span>
          
          {/* Action Buttons - Modern Switchboard Style */}
          <button
            onClick={() => {
              const term = prompt('Search logs for:');
              if (term !== null) setSearchTerm(term);
            }}
            className="neuro-toggle"
            title="Search logs"
            style={{
              border: (config.category === 'API' && debugBorders?.searchInput) ? '2px solid #ff00ff' : 'none'
            }}
          >
            🔍
          </button>
          
          <button
            onClick={scrollToBottom}
            className="neuro-toggle"
            title="Scroll to bottom"
          >
            ⬇️
          </button>
          
          <button
            onClick={onExport}
            className="neuro-toggle"
            title="Export logs"
          >
            📋
          </button>
          
          <button
            onClick={onClear}
            className="neuro-toggle"
            title="Clear panel"
          >
            🧹
          </button>
        </div>
      </div>

      {/* Log Content - Full Width Extended */}
      <div 
        ref={logContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
        style={{ 
          height: 'calc(100% - 80px)',
          border: (config.category === 'API' && debugBorders?.logContent) ? '2px solid #ffaa00' : 'none',
          padding: '0'
        }}
      >
        
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full neuro-log-text soft text-center">
            <div>
              <div className="text-3xl mb-3">{config.icon}</div>
              <div className="neuro-log-text defined">No {config.category.toLowerCase()} logs yet</div>
              <div className="neuro-log-text soft text-sm mt-2">
                {isConnected ? 'Waiting for logs...' : 'Disconnected'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ 
          gap: 'var(--log-spacing)',
          padding: `var(--content-padding)`,
          justifyContent: `var(--layout-alignment-logContent, 'left')` as any
        }}>
            {filteredLogs.map((log, index) => (
              <div 
                key={`${log.id}-${index}`}
                className="log-entry neuro-flex p-2 neuro-subtle hover:neuro-card transition-all duration-200"
                style={{ 
                  marginBottom: 'var(--log-spacing)'
                }}
              >
                {/* Timestamp */}
                {settings.logDisplay.showTimestamps && (
                  <span className="neuro-log-text soft shrink-0 w-20">
                    {settings.logDisplay.timestampFormat === 'full' 
                      ? moment(log.timestamp).format('MM/DD HH:mm:ss')
                      : settings.logDisplay.timestampFormat === 'relative'
                      ? moment(log.timestamp).fromNow()
                      : moment(log.timestamp).format('HH:mm:ss')
                    }
                  </span>
                )}
                
                {/* Log Level */}
                {settings.logDisplay.showLogLevel && (
                  <span className={`shrink-0 w-16 font-semibold ${getLogLevelColor(log.level)}`}>
                    {settings.logDisplay.showIcons && getLogLevelIcon(log.level)}
                    [{log.level}]
                  </span>
                )}
                
                {/* Source */}
                {settings.logDisplay.showSource && log.source && (
                  <span className="neuro-log-text soft shrink-0 w-24">
                    {log.source}
                  </span>
                )}
                
                {/* Message */}
                <span className="neuro-log-text flex-1" style={{
                  whiteSpace: settings.logDisplay.wordWrap ? 'normal' : 'nowrap',
                  overflow: settings.logDisplay.wordWrap ? 'visible' : 'hidden',
                  textOverflow: settings.logDisplay.wordWrap ? 'unset' : 'ellipsis',
                  wordBreak: settings.logDisplay.wordWrap ? 'break-word' : 'normal'
                }}>
                  {settings.logDisplay.wordWrap 
                    ? log.message 
                    : log.message.length > settings.logDisplay.maxLogLength 
                      ? log.message.substring(0, settings.logDisplay.maxLogLength) + '...'
                      : log.message
                  }
                </span>
                
                {/* Data (if present) */}
                {log.data && (
                  <span className="neuro-log-text soft shrink-0">
                    📄
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Auto-scroll indicator */}
        {!isScrolledToBottom && filteredLogs.length > 0 && (
          <div 
            className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-blue-700 transition-colors"
            onClick={scrollToBottom}
          >
            ↓ New logs available
          </div>
        )}
      </div>
    </div>
  );
};

export default LogPanel;