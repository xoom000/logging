/**
 * 🔌 WEBSOCKET HOOK FOR REAL-TIME LOGGING
 * 
 * Custom hook following 33tools patterns for WebSocket connection
 * - Auto-reconnection with exponential backoff
 * - Real-time log streaming
 * - Connection status management
 */

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { LogEntry, DashboardStats, UseLogSocketOptions, ConnectionStatus } from '../types/LogTypes';

export const useLogSocket = (options: UseLogSocketOptions = {}) => {
  const {
    onConnect,
    onDisconnect,
    onNewLog,
    onStats,
    onError,
    autoReconnect = true,
    reconnectDelay = 1000
  } = options;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus['status']>('connecting');
  const [totalLogs, setTotalLogs] = useState(0);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;

  // Initialize socket connection
  useEffect(() => {
    console.log('🔌 Initializing WebSocket connection to logging server...');
    
    const newSocket = io('http://localhost:7710', {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: autoReconnect,
      reconnectionDelay: reconnectDelay,
      reconnectionAttempts: maxReconnectAttempts
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Connected to logging server');
      setConnectionStatus('connected');
      setReconnectAttempts(0);
      onConnect?.();
      
      // Request initial data
      newSocket.emit('request_recent', { limit: 100 });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from logging server:', reason);
      setConnectionStatus('disconnected');
      onDisconnect?.();
      
      // Auto-reconnect logic
      if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttempts), 30000);
        console.log(`🔄 Attempting reconnect in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          newSocket.connect();
        }, delay);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      setConnectionStatus('error');
      onError?.(error);
    });

    // Log events
    newSocket.on('new_log', (log: LogEntry) => {
      console.log(`📝 [${log.level}] [${log.category}] ${log.message}`);
      setTotalLogs(prev => prev + 1);
      onNewLog?.(log);
    });

    newSocket.on('recent_logs', (data: { logs: LogEntry[], count: number }) => {
      console.log(`📊 Received ${data.count} recent logs`);
      setTotalLogs(prev => prev + data.count);
      
      // Process each log
      data.logs.forEach(log => onNewLog?.(log));
    });

    newSocket.on('analytics_update', (data: { summary: DashboardStats }) => {
      console.log('📈 Analytics update received');
      onStats?.(data.summary);
    });

    // Ping/pong for connection health
    const pingInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit('ping');
      }
    }, 30000); // Ping every 30 seconds

    newSocket.on('pong', (data) => {
      console.log('🏓 Pong received, connection healthy');
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up WebSocket connection');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      clearInterval(pingInterval);
      newSocket.disconnect();
    };
  }, []);

  // Helper functions
  const subscribeToCategory = (category: string) => {
    if (socket) {
      console.log(`📺 Subscribing to category: ${category}`);
      socket.emit('subscribe_category', category);
    }
  };

  const unsubscribeFromCategory = (category: string) => {
    if (socket) {
      console.log(`📺 Unsubscribing from category: ${category}`);
      socket.emit('unsubscribe_category', category);
    }
  };

  const subscribeToLevel = (level: string) => {
    if (socket) {
      console.log(`📺 Subscribing to level: ${level}`);
      socket.emit('subscribe_level', level);
    }
  };

  const updateFilters = (filters: any) => {
    if (socket) {
      console.log('🔍 Updating filters:', filters);
      socket.emit('update_filters', filters);
    }
  };

  const requestRecentLogs = (options?: { limit?: number, category?: string }) => {
    if (socket) {
      console.log('📊 Requesting recent logs:', options);
      socket.emit('request_recent', options);
    }
  };

  return {
    socket,
    connectionStatus,
    totalLogs,
    reconnectAttempts,
    isConnected: connectionStatus === 'connected',
    
    // Helper functions
    subscribeToCategory,
    unsubscribeFromCategory,
    subscribeToLevel,
    updateFilters,
    requestRecentLogs
  };
};