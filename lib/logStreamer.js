/**
 * 📡 LOG STREAMER - Real-time WebSocket Broadcasting
 * 
 * Handles real-time streaming of logs to dashboard clients
 * - Broadcast new logs to all connected dashboards
 * - Handle client subscriptions and filters
 * - Room-based streaming for different log categories
 * - Performance optimized for high-volume logging
 */

class LogStreamer {
  constructor() {
    this.io = null;
    this.clients = new Map(); // Track connected clients and their preferences
    this.stats = {
      totalClients: 0,
      messagesSent: 0,
      startTime: Date.now()
    };
  }

  /**
   * Initialize with Socket.io server instance
   */
  init(io) {
    this.io = io;
    this.setupEventHandlers();
    
    console.log('📡 Log streamer initialized');
    console.log('🎯 Ready for real-time log broadcasting');
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`📱 Dashboard connected: ${socket.id}`);
      this.stats.totalClients++;
      
      // Track client preferences
      this.clients.set(socket.id, {
        id: socket.id,
        connected: true,
        filters: {},
        subscriptions: new Set(),
        joinedAt: new Date().toISOString()
      });

      // Handle subscription to specific log categories
      socket.on('subscribe_category', (category) => {
        const client = this.clients.get(socket.id);
        if (client) {
          client.subscriptions.add(category);
          socket.join(`category_${category}`);
          
          console.log(`📊 Client ${socket.id} subscribed to category: ${category}`);
        }
      });

      // Handle unsubscription
      socket.on('unsubscribe_category', (category) => {
        const client = this.clients.get(socket.id);
        if (client) {
          client.subscriptions.delete(category);
          socket.leave(`category_${category}`);
          
          console.log(`📊 Client ${socket.id} unsubscribed from category: ${category}`);
        }
      });

      // Handle subscription to specific log levels
      socket.on('subscribe_level', (level) => {
        socket.join(`level_${level}`);
        console.log(`📊 Client ${socket.id} subscribed to level: ${level}`);
      });

      // Handle filter updates
      socket.on('update_filters', (filters) => {
        const client = this.clients.get(socket.id);
        if (client) {
          client.filters = filters;
          console.log(`🔍 Client ${socket.id} updated filters:`, filters);
        }
      });

      // Handle dashboard requests for initial data
      socket.on('request_recent', async (options = {}) => {
        try {
          const logStorage = require('./logStorage');
          const recentLogs = await logStorage.query({
            limit: options.limit || 50,
            category: options.category,
            level: options.level,
            since: options.since
          });

          socket.emit('recent_logs', {
            logs: recentLogs,
            count: recentLogs.length,
            category: options.category,
            level: options.level
          });

          console.log(`📊 Sent ${recentLogs.length} recent logs to ${socket.id}`);
          
        } catch (error) {
          console.error('❌ Failed to send recent logs:', error.message);
          socket.emit('error', { 
            type: 'recent_logs_error',
            message: error.message 
          });
        }
      });

      // Handle ping for connection health
      socket.on('ping', () => {
        socket.emit('pong', { 
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        });
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`📱 Dashboard disconnected: ${socket.id} (${reason})`);
        this.clients.delete(socket.id);
        this.stats.totalClients = Math.max(0, this.stats.totalClients - 1);
      });

      // Send connection confirmation with stats
      socket.emit('connected', {
        socketId: socket.id,
        timestamp: new Date().toISOString(),
        stats: this.getStats()
      });
    });
  }

  /**
   * Broadcast a log entry to all connected clients
   */
  broadcast(logEntry) {
    if (!this.io) {
      console.warn('⚠️ Cannot broadcast - Socket.io not initialized');
      return;
    }

    // Broadcast to all clients
    this.io.emit('new_log', logEntry);
    
    // Broadcast to category-specific rooms
    this.io.to(`category_${logEntry.category}`).emit('category_log', logEntry);
    
    // Broadcast to level-specific rooms  
    this.io.to(`level_${logEntry.level}`).emit('level_log', logEntry);

    // Apply client-specific filters and send targeted updates
    this.clients.forEach((client, socketId) => {
      if (this.shouldSendToClient(logEntry, client)) {
        this.io.to(socketId).emit('filtered_log', logEntry);
      }
    });

    this.stats.messagesSent++;

    // Log high-priority messages to console
    if (logEntry.level === 'ERROR') {
      console.log(`🔥 ERROR broadcasted: ${logEntry.message}`);
    }
  }

  /**
   * Check if a log entry should be sent to a specific client based on their filters
   */
  shouldSendToClient(logEntry, client) {
    const filters = client.filters;
    
    if (!filters || Object.keys(filters).length === 0) {
      return true; // No filters = send everything
    }

    // Check category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(logEntry.category)) {
        return false;
      }
    }

    // Check level filter  
    if (filters.levels && filters.levels.length > 0) {
      if (!filters.levels.includes(logEntry.level)) {
        return false;
      }
    }

    // Check source filter
    if (filters.sources && filters.sources.length > 0) {
      if (!filters.sources.includes(logEntry.source)) {
        return false;
      }
    }

    // Check search term
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      const message = logEntry.message.toLowerCase();
      const dataString = logEntry.data ? JSON.stringify(logEntry.data).toLowerCase() : '';
      
      if (!message.includes(searchTerm) && !dataString.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Broadcast system events (server start, errors, etc.)
   */
  broadcastSystemEvent(event, data) {
    if (!this.io) return;

    const systemLog = {
      id: require('uuid').v4(),
      timestamp: new Date().toISOString(),
      level: 'INFO',
      category: 'SYSTEM',
      message: event,
      data: data,
      source: 'logging-system',
      environment: process.env.NODE_ENV || 'development'
    };

    this.broadcast(systemLog);
    console.log(`📢 System event broadcasted: ${event}`);
  }

  /**
   * Send analytics data to all clients
   */
  async broadcastAnalytics() {
    if (!this.io) return;

    try {
      const logStorage = require('./logStorage');
      const summary = await logStorage.getSummary();
      const categories = await logStorage.getCategoryCounts();

      this.io.emit('analytics_update', {
        summary,
        categories,
        streamerStats: this.getStats(),
        timestamp: new Date().toISOString()
      });

      console.log('📊 Analytics broadcasted to all clients');
      
    } catch (error) {
      console.error('❌ Failed to broadcast analytics:', error.message);
    }
  }

  /**
   * Get streaming statistics
   */
  getStats() {
    return {
      connectedClients: this.stats.totalClients,
      messagesSent: this.stats.messagesSent,
      uptime: Date.now() - this.stats.startTime,
      avgMessagesPerMinute: this.stats.messagesSent / ((Date.now() - this.stats.startTime) / 60000),
      clientList: Array.from(this.clients.values()).map(client => ({
        id: client.id,
        joinedAt: client.joinedAt,
        subscriptions: Array.from(client.subscriptions),
        hasFilters: Object.keys(client.filters).length > 0
      }))
    };
  }

  /**
   * Send direct message to specific client
   */
  sendToClient(socketId, event, data) {
    if (this.io && this.clients.has(socketId)) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.io) {
      this.io.removeAllListeners();
      this.clients.clear();
      console.log('✅ Log streamer destroyed');
    }
  }
}

// Export singleton instance
module.exports = new LogStreamer();