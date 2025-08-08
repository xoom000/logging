/**
 * 📝 TYPESCRIPT TYPES FOR LOGGING SYSTEM
 * 
 * Type definitions following 33tools architecture patterns
 */

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
  source: string;
  environment: string;
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export type LogCategory = 
  | 'API'
  | 'FRONTEND' 
  | 'DATABASE'
  | 'AUTH'
  | 'ERROR'
  | 'PERFORMANCE'
  | 'BUSINESS'
  | 'SYSTEM'
  | 'DEBUG'
  | 'GENERAL';

export interface DashboardStats {
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  todayCount: number;
  connectedClients: number;
  uptime: number;
  topCategories: CategoryCount[];
}

export interface CategoryCount {
  category: LogCategory;
  count: number;
  errors: number;
  warnings: number;
  today: number;
  lastLog: string;
}

export interface ConnectionStatus {
  connected: boolean;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastPing?: number;
  reconnectAttempts?: number;
}

export interface LogPanelConfig {
  category: LogCategory;
  title: string;
  color: string;
  icon: string;
  maxLines: number;
  autoScroll: boolean;
}

export interface LogFilter {
  categories?: LogCategory[];
  levels?: LogLevel[];
  sources?: string[];
  search?: string;
  since?: string;
}

// WebSocket Events
export interface SocketEvents {
  // Incoming events
  new_log: (log: LogEntry) => void;
  category_log: (log: LogEntry) => void;
  level_log: (log: LogEntry) => void;
  recent_logs: (data: { logs: LogEntry[], count: number }) => void;
  analytics_update: (data: { summary: DashboardStats, categories: CategoryCount[] }) => void;
  connected: (data: { socketId: string, timestamp: string }) => void;
  error: (error: { type: string, message: string }) => void;
  
  // Outgoing events  
  subscribe_category: (category: LogCategory) => void;
  unsubscribe_category: (category: LogCategory) => void;
  subscribe_level: (level: LogLevel) => void;
  update_filters: (filters: LogFilter) => void;
  request_recent: (options?: { limit?: number, category?: LogCategory }) => void;
  ping: () => void;
}

// Hook Options
export interface UseLogSocketOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onNewLog?: (log: LogEntry) => void;
  onStats?: (stats: DashboardStats) => void;
  onError?: (error: any) => void;
  autoReconnect?: boolean;
  reconnectDelay?: number;
}

// Debug Border State
export interface DebugBorders {
  container: boolean;
  header: boolean;
  searchInput: boolean;
  logContent: boolean;
}

// UI Component Props
export interface LogGridProps {
  logs: LogEntry[];
  socket: any; // Socket.io client
  isConnected: boolean;
  debugBorders?: DebugBorders;
}

export interface LogPanelProps {
  config: LogPanelConfig;
  logs: LogEntry[];
  isConnected: boolean;
  onClear?: () => void;
  onExport?: () => void;
  debugBorders?: DebugBorders;
}

export interface DashboardHeaderProps {
  isConnected: boolean;
  totalLogs: number;
  stats: DashboardStats | null;
}

export interface ConnectionStatusProps {
  status: ConnectionStatus['status'];
  isConnected: boolean;
  reconnectAttempts?: number;
}