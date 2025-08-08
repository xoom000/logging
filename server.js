#!/usr/bin/env node

/**
 * 🚀 33TOOLS EXTERNAL LOGGING SYSTEM
 * 
 * Professional-grade logging infrastructure that stays up when main app crashes!
 * 
 * Features:
 * - Receives logs from 33tools-staging via HTTP
 * - Real-time streaming via WebSocket
 * - SQLite storage with file backup
 * - Live dashboard with 9 log panels
 * - Crash-resistant external architecture
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Configure this properly in production
    methods: ["GET", "POST"]
  }
});

// 🏗️ XXYY Port Architecture Compliance
// 77XX = External Logging System
// 7710 = Log Collector API (Backend)
// 7720 = Dashboard Frontend (React)  
// 7730 = WebSocket Stream (if separated)
// 7740 = Proxy (if needed)
const PORT = process.env.LOGGING_API_PORT || 7710;        
const DASHBOARD_PORT = process.env.LOGGING_WEB_PORT || 7720;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ensure storage directories exist
const STORAGE_DIR = path.join(__dirname, 'storage');
const LOGS_DIR = path.join(STORAGE_DIR, 'logs');
const DB_DIR = path.join(STORAGE_DIR, 'database');

[STORAGE_DIR, LOGS_DIR, DB_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Log storage and streaming
const logStorage = require('./lib/logStorage');
const logStreamer = require('./lib/logStreamer');

// Initialize components
logStorage.init(path.join(DB_DIR, 'logs.db'));
logStreamer.init(io);

// 📺 HDMI-STYLE FILE WATCHING CONFIGURATION
// Define log files to watch from GoPublic projects
const LOG_FILES_TO_WATCH = [
  '/home/xoom000/GoPublic/33tools-staging/logs/server.log',
  '/home/xoom000/GoPublic/33tools-staging/logs/frontend.log',
  '/home/xoom000/GoPublic/camping/logs/app.log',
  '/home/xoom000/GoPublic/bladespace/logs/error.log',
  '/home/xoom000/GoPublic/cds/logs/server.log'
];

// Stream callback to send file-based logs to dashboard
const streamFileLogsTosDashboard = (logEntry) => {
  logStreamer.broadcast('newLog', logEntry);
};

console.log('🚀 33TOOLS LOGGING SYSTEM STARTING...');
console.log('');
console.log('📊 NEW HDMI-STYLE ARCHITECTURE:');
console.log('   ┌─ GoPublic project logs ←──📺 HDMI File Watchers');
console.log('   ├─ Log Parser & Processor');
console.log('   ├─ SQLite Storage + File Backup');  
console.log('   └─ WebSocket → Live Dashboard');
console.log('');

// 📨 LOG COLLECTION ENDPOINTS
app.post('/api/logs', async (req, res) => {
  try {
    const logEntry = {
      id: require('uuid').v4(),
      timestamp: req.body.timestamp || new Date().toISOString(),
      level: req.body.level || 'INFO',
      category: req.body.category || 'GENERAL',
      message: req.body.message || '',
      data: req.body.data || null,
      source: req.body.source || 'unknown',
      environment: req.body.environment || 'development'
    };
    
    // Store in database
    await logStorage.store(logEntry);
    
    // Stream to connected dashboards
    logStreamer.broadcast(logEntry);
    
    // Console output for server monitoring
    const icon = {
      INFO: '📝',
      WARN: '⚠️',
      ERROR: '❌',
      DEBUG: '🔍'
    }[logEntry.level] || '📝';
    
    console.log(`${icon} [${logEntry.category}] ${logEntry.message}`);
    
    res.status(200).json({ success: true, id: logEntry.id });
    
  } catch (error) {
    console.error('❌ Log storage error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📊 LOG RETRIEVAL ENDPOINTS
app.get('/api/logs', async (req, res) => {
  try {
    const {
      category,
      level, 
      limit = 100,
      offset = 0,
      since,
      search
    } = req.query;
    
    const logs = await logStorage.query({
      category,
      level,
      limit: parseInt(limit),
      offset: parseInt(offset), 
      since,
      search
    });
    
    res.json({ success: true, logs, count: logs.length });
    
  } catch (error) {
    console.error('❌ Log query error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📈 ANALYTICS ENDPOINTS
app.get('/api/analytics/summary', async (req, res) => {
  try {
    const summary = await logStorage.getSummary();
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/analytics/categories', async (req, res) => {
  try {
    const categories = await logStorage.getCategoryCounts();
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🌐 WEBSOCKET CONNECTIONS
io.on('connection', (socket) => {
  console.log('📱 Dashboard connected:', socket.id);
  
  // Send initial log data
  socket.on('subscribe', async (filters) => {
    try {
      const recentLogs = await logStorage.query({
        ...filters,
        limit: 50
      });
      
      socket.emit('initial_logs', recentLogs);
      console.log(`📊 Sent ${recentLogs.length} initial logs to ${socket.id}`);
      
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('📱 Dashboard disconnected:', socket.id);
  });
});

// 🏥 HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: io.engine.clientsCount
  });
});

// 📊 SYSTEM INFO
app.get('/api/system/info', (req, res) => {
  res.json({
    version: require('./package.json').version,
    node: process.version,
    platform: process.platform,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: io.engine.clientsCount,
    database: logStorage.getStats()
  });
});

// Start server
server.listen(PORT, async () => {
  console.log('✅ LOG COLLECTOR SERVER RUNNING');
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 System info: http://localhost:${PORT}/api/system/info`);
  console.log('');
  
  // Start HDMI-style file watching
  console.log('📺 STARTING HDMI FILE WATCHERS...');
  try {
    await logStorage.startFileWatching(LOG_FILES_TO_WATCH, streamFileLogsTosDashboard);
    console.log('✅ HDMI file watching active!');
    console.log(`📺 Monitoring ${LOG_FILES_TO_WATCH.length} log files`);
  } catch (error) {
    console.error('❌ Failed to start file watching:', error.message);
  }
  
  console.log('');
  console.log('🎯 READY FOR LOGS!');
  console.log(`📨 HTTP endpoint: http://localhost:${PORT}/api/logs (legacy)`);
  console.log('📺 File watching: ACTIVE (new HDMI method)');
  console.log('');
  console.log('🚀 Next step: Start the dashboard with: npm run dashboard');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  logStorage.close(); // This will stop file watchers and close DB
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  logStorage.close(); // This will stop file watchers and close DB
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };