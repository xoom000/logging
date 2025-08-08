/**
 * 🗄️ LOG STORAGE - SQLite Database Operations
 * 
 * Handles all database operations for the external logging system
 * - Store incoming logs from 33tools-staging
 * - Query logs for dashboard display
 * - Analytics and summary generation
 * - File backup for redundancy
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

class LogStorage {
  constructor() {
    this.db = null;
    this.dbPath = null;
    this.initialized = false;
    this.fileWatchers = new Map(); // Track file watchers for cleanup
    this.filePositions = new Map(); // Track read positions for each file
  }

  /**
   * Initialize the database connection and create tables
   */
  async init(dbPath) {
    return new Promise((resolve, reject) => {
      this.dbPath = dbPath;
      
      console.log('🗄️ Initializing log storage database...');
      console.log(`📍 Database path: ${dbPath}`);
      
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('❌ Database connection failed:', err.message);
          reject(err);
          return;
        }
        
        console.log('✅ Connected to SQLite database');
        this.createTables()
          .then(() => {
            this.initialized = true;
            console.log('✅ Log storage initialized successfully');
            resolve();
          })
          .catch(reject);
      });
    });
  }

  /**
   * Create necessary tables for log storage
   */
  async createTables() {
    return new Promise((resolve, reject) => {
      const createLogsTable = `
        CREATE TABLE IF NOT EXISTS logs (
          id TEXT PRIMARY KEY,
          timestamp DATETIME NOT NULL,
          level TEXT NOT NULL DEFAULT 'INFO',
          category TEXT NOT NULL DEFAULT 'GENERAL',
          message TEXT NOT NULL,
          data TEXT,
          source TEXT NOT NULL DEFAULT 'unknown',
          environment TEXT NOT NULL DEFAULT 'development',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const createIndexes = [
        'CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp)',
        'CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level)',
        'CREATE INDEX IF NOT EXISTS idx_logs_category ON logs(category)',
        'CREATE INDEX IF NOT EXISTS idx_logs_source ON logs(source)'
      ];

      const createMetricsTable = `
        CREATE TABLE IF NOT EXISTS metrics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp DATETIME NOT NULL,
          metric_name TEXT NOT NULL,
          metric_value REAL NOT NULL,
          category TEXT,
          source TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.db.run(createLogsTable, (err) => {
        if (err) {
          console.error('❌ Failed to create logs table:', err.message);
          reject(err);
          return;
        }

        // Create indexes
        let indexPromises = createIndexes.map(indexSQL => {
          return new Promise((resolveIndex, rejectIndex) => {
            this.db.run(indexSQL, (err) => {
              if (err) {
                console.error('❌ Failed to create index:', err.message);
                rejectIndex(err);
              } else {
                resolveIndex();
              }
            });
          });
        });

        Promise.all(indexPromises)
          .then(() => {
            this.db.run(createMetricsTable, (err) => {
              if (err) {
                console.error('❌ Failed to create metrics table:', err.message);
                reject(err);
                return;
              }

              console.log('✅ Database tables and indexes created successfully');
              resolve();
            });
          })
          .catch(reject);
      });
    });
  }

  /**
   * Store a log entry in the database
   */
  async store(logEntry) {
    if (!this.initialized) {
      throw new Error('Log storage not initialized');
    }

    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO logs (id, timestamp, level, category, message, data, source, environment)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        logEntry.id,
        logEntry.timestamp,
        logEntry.level,
        logEntry.category,
        logEntry.message,
        logEntry.data ? JSON.stringify(logEntry.data) : null,
        logEntry.source,
        logEntry.environment
      ];

      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('❌ Failed to store log entry:', err.message);
          reject(err);
          return;
        }

        // Also backup to file (redundancy)
        saveToFile(logEntry);
        
        resolve({ id: logEntry.id, changes: this.changes });
      });
    });
  }

  /**
   * Query logs with various filters
   */
  async query(filters = {}) {
    if (!this.initialized) {
      throw new Error('Log storage not initialized');
    }

    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM logs WHERE 1=1';
      const params = [];

      // Apply filters
      if (filters.category) {
        sql += ' AND category = ?';
        params.push(filters.category);
      }

      if (filters.level) {
        sql += ' AND level = ?';
        params.push(filters.level);
      }

      if (filters.source) {
        sql += ' AND source = ?';
        params.push(filters.source);
      }

      if (filters.since) {
        sql += ' AND timestamp >= ?';
        params.push(filters.since);
      }

      if (filters.search) {
        sql += ' AND (message LIKE ? OR data LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      // Order and limit
      sql += ' ORDER BY timestamp DESC';
      
      if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(filters.limit);
      }

      if (filters.offset) {
        sql += ' OFFSET ?';
        params.push(filters.offset);
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('❌ Failed to query logs:', err.message);
          reject(err);
          return;
        }

        // Parse JSON data fields
        const processedRows = rows.map(row => ({
          ...row,
          data: row.data ? JSON.parse(row.data) : null
        }));

        resolve(processedRows);
      });
    });
  }

  /**
   * Get summary statistics
   */
  async getSummary() {
    if (!this.initialized) {
      throw new Error('Log storage not initialized');
    }

    return new Promise((resolve, reject) => {
      const queries = [
        'SELECT COUNT(*) as total FROM logs',
        'SELECT COUNT(*) as errors FROM logs WHERE level = "ERROR"',
        'SELECT COUNT(*) as warnings FROM logs WHERE level = "WARN"',
        'SELECT COUNT(*) as today FROM logs WHERE date(timestamp) = date("now")',
        'SELECT category, COUNT(*) as count FROM logs GROUP BY category ORDER BY count DESC LIMIT 10'
      ];

      const summary = {};

      // Execute queries in sequence
      const executeQuery = (index) => {
        if (index >= queries.length - 1) {
          // Last query (category counts)
          this.db.all(queries[index], (err, rows) => {
            if (err) {
              reject(err);
              return;
            }
            summary.topCategories = rows;
            resolve(summary);
          });
          return;
        }

        this.db.get(queries[index], (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          const key = Object.keys(row)[0];
          summary[key] = row[key];
          executeQuery(index + 1);
        });
      };

      executeQuery(0);
    });
  }

  /**
   * Get category-based counts
   */
  async getCategoryCounts() {
    if (!this.initialized) {
      throw new Error('Log storage not initialized');
    }

    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          category,
          COUNT(*) as total,
          COUNT(CASE WHEN level = 'ERROR' THEN 1 END) as errors,
          COUNT(CASE WHEN level = 'WARN' THEN 1 END) as warnings,
          COUNT(CASE WHEN date(timestamp) = date('now') THEN 1 END) as today,
          MAX(timestamp) as last_log
        FROM logs 
        GROUP BY category 
        ORDER BY total DESC
      `;

      this.db.all(sql, (err, rows) => {
        if (err) {
          console.error('❌ Failed to get category counts:', err.message);
          reject(err);
          return;
        }

        resolve(rows);
      });
    });
  }

  /**
   * Get database statistics
   */
  getStats() {
    if (!this.initialized || !this.db) {
      return { status: 'not_initialized' };
    }

    const stats = fs.statSync(this.dbPath);
    
    return {
      status: 'connected',
      database_size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
      last_modified: stats.mtime,
      path: this.dbPath
    };
  }

  /**
   * 📺 HDMI-STYLE FILE WATCHER - Add log file monitoring
   * 
   * Watch log files from GoPublic projects and stream new lines
   * directly to the database like an HDMI cord connecting services
   */
  async startFileWatching(logFilePaths, streamCallback = null) {
    console.log('📺 Starting HDMI-style file watching...');
    
    for (const filePath of logFilePaths) {
      try {
        // Check if file exists, create if not
        if (!fs.existsSync(filePath)) {
          console.log(`📝 Creating log file: ${filePath}`);
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, '');
        }

        // Initialize file position tracking
        const stats = fs.statSync(filePath);
        this.filePositions.set(filePath, stats.size);

        // Set up file watcher
        const watcher = chokidar.watch(filePath, {
          persistent: true,
          usePolling: false,
          interval: 1000
        });

        watcher.on('change', () => {
          this.processFileChanges(filePath, streamCallback);
        });

        this.fileWatchers.set(filePath, watcher);
        
        console.log(`📺 Watching: ${path.basename(filePath)}`);
        
      } catch (error) {
        console.error(`❌ Failed to watch file ${filePath}:`, error.message);
      }
    }
    
    console.log(`📺 HDMI file watching active for ${logFilePaths.length} files`);
  }

  /**
   * Process new lines added to watched files
   */
  async processFileChanges(filePath, streamCallback) {
    try {
      const stats = fs.statSync(filePath);
      const lastPosition = this.filePositions.get(filePath) || 0;
      
      if (stats.size <= lastPosition) {
        return; // File hasn't grown
      }

      // Read only new data
      const stream = fs.createReadStream(filePath, {
        start: lastPosition,
        end: stats.size
      });

      let buffer = '';
      
      stream.on('data', (chunk) => {
        buffer += chunk.toString();
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer
        
        lines.forEach(line => {
          if (line.trim()) {
            this.parseAndStoreLogLine(line, filePath, streamCallback);
          }
        });
      });

      stream.on('end', () => {
        this.filePositions.set(filePath, stats.size);
      });

    } catch (error) {
      console.error(`❌ Error processing file changes for ${filePath}:`, error.message);
    }
  }

  /**
   * Parse log line and store in database
   */
  async parseAndStoreLogLine(logLine, filePath, streamCallback) {
    try {
      // Extract project name from file path
      const projectName = this.extractProjectName(filePath);
      
      // Parse log line (customize based on your log formats)
      const logEntry = this.parseLogFormat(logLine, projectName, filePath);
      
      if (logEntry) {
        // Store in database
        await this.store(logEntry);
        
        // Stream to dashboard via callback
        if (streamCallback) {
          streamCallback(logEntry);
        }
        
        console.log(`📺 ${projectName}: ${logEntry.level} - ${logEntry.message.substring(0, 50)}...`);
      }
      
    } catch (error) {
      console.error('❌ Error parsing log line:', error.message);
    }
  }

  /**
   * Extract project name from file path
   */
  extractProjectName(filePath) {
    const pathParts = filePath.split('/');
    const gopublicIndex = pathParts.findIndex(part => part === 'GoPublic');
    
    if (gopublicIndex >= 0 && pathParts[gopublicIndex + 1]) {
      return pathParts[gopublicIndex + 1];
    }
    
    return path.basename(path.dirname(filePath));
  }

  /**
   * Parse different log formats into standard log entry
   */
  parseLogFormat(logLine, projectName, filePath) {
    const timestamp = new Date().toISOString();
    const id = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Try to parse structured log formats
    let level = 'INFO';
    let message = logLine;
    let category = 'SYSTEM';
    
    // Parse JSON logs (if any)
    if (logLine.startsWith('{')) {
      try {
        const parsed = JSON.parse(logLine);
        return {
          id,
          timestamp: parsed.timestamp || timestamp,
          level: parsed.level || level,
          category: parsed.category || category,
          message: parsed.message || parsed.msg || logLine,
          data: parsed.data || null,
          source: projectName,
          environment: 'production'
        };
      } catch (e) {
        // Not JSON, continue with other parsing
      }
    }
    
    // Parse common log patterns: [2025-08-08T12:34:56] [INFO] Message
    const timestampRegex = /\[(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[^\]]*)\]/;
    const levelRegex = /\[(DEBUG|INFO|WARN|ERROR|FATAL)\]/i;
    
    const timestampMatch = logLine.match(timestampRegex);
    const levelMatch = logLine.match(levelRegex);
    
    if (timestampMatch) {
      message = logLine.replace(timestampMatch[0], '').trim();
    }
    
    if (levelMatch) {
      level = levelMatch[1].toUpperCase();
      message = message.replace(levelMatch[0], '').trim();
    }
    
    // Determine category based on content
    if (message.toLowerCase().includes('error') || level === 'ERROR') {
      category = 'ERROR';
    } else if (message.toLowerCase().includes('auth') || message.toLowerCase().includes('login')) {
      category = 'AUTH';
    } else if (message.toLowerCase().includes('api') || message.toLowerCase().includes('request')) {
      category = 'API';
    } else if (message.toLowerCase().includes('database') || message.toLowerCase().includes('db')) {
      category = 'DATABASE';
    }
    
    return {
      id,
      timestamp: timestampMatch ? timestampMatch[1] : timestamp,
      level,
      category,
      message,
      data: null,
      source: projectName,
      environment: 'production'
    };
  }

  /**
   * Stop all file watchers (cleanup)
   */
  stopFileWatching() {
    console.log('🔌 Unplugging HDMI file watchers...');
    
    for (const [filePath, watcher] of this.fileWatchers) {
      watcher.close();
      console.log(`📺 Stopped watching: ${path.basename(filePath)}`);
    }
    
    this.fileWatchers.clear();
    this.filePositions.clear();
    
    console.log('🔌 All HDMI watchers stopped');
  }

  /**
   * Close database connection and cleanup watchers
   */
  close() {
    this.stopFileWatching();
    
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err.message);
        } else {
          console.log('✅ Database connection closed');
        }
      });
    }
  }
}

/**
 * File backup function for redundancy
 */
function saveToFile(logEntry) {
  try {
    const logDir = path.join(__dirname, '../storage/logs');
    const logFile = path.join(logDir, `${logEntry.category.toLowerCase()}.log`);
    
    const logLine = `${logEntry.timestamp} [${logEntry.level}] ${logEntry.message}\n`;
    fs.appendFileSync(logFile, logLine);
    
  } catch (error) {
    // Fail silently - don't crash the logging system
    console.warn('⚠️ File backup failed:', error.message);
  }
}

// Export singleton instance
module.exports = new LogStorage();