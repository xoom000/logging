/**
 * 🔗 CONNECTION STATUS - Real-time Connection Indicator
 * 
 * Shows connection status with visual indicators
 */

import React from 'react';
import { ConnectionStatusProps } from '../types/LogTypes';

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  isConnected,
  reconnectAttempts = 0
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-500/50',
          text: 'text-green-400',
          icon: '🟢',
          message: 'Connected to logging server'
        };
      case 'connecting':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/50',
          text: 'text-yellow-400',
          icon: '🟡',
          message: 'Connecting to logging server...'
        };
      case 'disconnected':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          text: 'text-red-400',
          icon: '🔴',
          message: reconnectAttempts > 0 
            ? `Reconnecting... (attempt ${reconnectAttempts})`
            : 'Disconnected from logging server'
        };
      case 'error':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          text: 'text-red-400',
          icon: '❌',
          message: 'Connection error - check logging server'
        };
      default:
        return {
          bg: 'bg-gray-500/20',
          border: 'border-gray-500/50',
          text: 'text-gray-400',
          icon: '⚫',
          message: 'Unknown connection status'
        };
    }
  };

  const config = getStatusConfig();

  // Don't render if connected (keep UI clean)
  if (status === 'connected') {
    return null;
  }

  return (
    <div className={`
      ${config.bg} ${config.border} ${config.text}
      border-t px-4 py-2
      transition-all duration-300
    `}>
      <div className="flex items-center justify-center gap-2 text-sm">
        <span className="animate-pulse">{config.icon}</span>
        <span className="font-medium">{config.message}</span>
        
        {status === 'connecting' && (
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;