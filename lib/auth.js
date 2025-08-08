/**
 * 🔐 LOGGING SYSTEM AUTHENTICATION
 * 
 * Integrates with 33tools-staging authentication
 * - Same username/password as main app
 * - SuperAdmin access required for logs
 * - JWT token validation
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class LoggingAuth {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.dbPath = path.join(__dirname, '../../../33tools-staging/route33-staging.db');
    
    console.log('🔐 Logging Authentication initialized');
    console.log(`   Database: ${this.dbPath}`);
  }

  /**
   * Validate user credentials against 33tools database
   */
  async validateCredentials(username, password) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Failed to connect to 33tools database:', err.message);
          reject(err);
          return;
        }
      });

      const query = `
        SELECT driver_id, username, name, password_hash, role 
        FROM drivers 
        WHERE username = ? AND is_active = 1
      `;

      db.get(query, [username], async (err, row) => {
        db.close();
        
        if (err) {
          console.error('❌ Database query error:', err.message);
          reject(err);
          return;
        }

        if (!row) {
          console.warn('⚠️ User not found:', username);
          resolve(null);
          return;
        }

        try {
          // Check password
          const isValidPassword = await bcrypt.compare(password, row.password_hash);
          
          if (!isValidPassword) {
            console.warn('⚠️ Invalid password for user:', username);
            resolve(null);
            return;
          }

          // Check if user has admin access (required for logs)
          if (row.role !== 'SuperAdmin' && row.role !== 'Admin') {
            console.warn('⚠️ Insufficient permissions for logging access:', username, 'Role:', row.role);
            resolve(null);
            return;
          }

          console.log('✅ User authenticated for logging access:', username, 'Role:', row.role);
          
          resolve({
            driver_id: row.driver_id,
            username: row.username,
            name: row.name,
            role: row.role
          });

        } catch (error) {
          console.error('❌ Password validation error:', error.message);
          reject(error);
        }
      });
    });
  }

  /**
   * Generate JWT token for authenticated user
   */
  generateToken(user) {
    const payload = {
      driver_id: user.driver_id,
      username: user.username,
      name: user.name,
      role: user.role,
      service: 'logging-system',
      issued_at: Date.now()
    };

    const token = jwt.sign(payload, this.JWT_SECRET, { 
      expiresIn: '24h',
      issuer: '33tools-logging-system'
    });

    console.log('🎟️ JWT token generated for logging access:', user.username);
    return token;
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET);
      
      // Check if token is specifically for logging system
      if (decoded.service !== 'logging-system') {
        console.warn('⚠️ Token not issued for logging system');
        return null;
      }

      console.log('✅ Token verified for logging access:', decoded.username);
      return decoded;
    } catch (error) {
      console.warn('⚠️ Token verification failed:', error.message);
      return null;
    }
  }

  /**
   * Express middleware for protecting routes
   */
  requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '') ||
                  req.query.token ||
                  req.cookies?.logging_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please provide a valid token'
      });
    }

    const user = this.verifyToken(token);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        message: 'Please log in again'
      });
    }

    // Add user info to request
    req.user = user;
    next();
  }

  /**
   * Express middleware for login endpoint
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Missing credentials',
          message: 'Username and password are required'
        });
      }

      const user = await this.validateCredentials(username, password);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Invalid username, password, or insufficient permissions'
        });
      }

      const token = this.generateToken(user);

      res.json({
        success: true,
        message: `Welcome to 33Tools Logging System, ${user.name}!`,
        user: {
          username: user.username,
          name: user.name,
          role: user.role
        },
        token,
        expires_in: '24h'
      });

    } catch (error) {
      console.error('❌ Login error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Authentication system error',
        message: 'Please try again later'
      });
    }
  }
}

module.exports = new LoggingAuth();