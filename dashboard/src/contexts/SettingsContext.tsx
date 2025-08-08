/**
 * 🎛️ SETTINGS CONTEXT - Centralized Configuration Management
 * 
 * Manages all dashboard settings, theme configs, and debug options
 * - Layout dimensions (card width, height, grid gap)
 * - Theme colors and styling options  
 * - Debug border toggles and visibility
 * - Persistence via localStorage
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface LayoutSettings {
  cardWidth: number;
  cardHeight: number;
  gridGap: number;
  columns: number;
}

export interface ThemeSettings {
  baseColor: string;
  textColor: string;
  shadowIntensity: number;
  borderRadius: number;
}

export interface TypographySettings {
  timestamp: {
    fontSize: number;
    fontWeight: number;
    color: string;
    fontFamily: string;
    letterSpacing: number;
    textAlign: 'left' | 'center' | 'right';
  };
  logLevel: {
    fontSize: number;
    fontWeight: number;
    color: string;
    fontFamily: string;
    letterSpacing: number;
    textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    textAlign: 'left' | 'center' | 'right';
  };
  message: {
    fontSize: number;
    fontWeight: number;
    color: string;
    fontFamily: string;
    letterSpacing: number;
    lineHeight: number;
    textAlign: 'left' | 'center' | 'right';
  };
  source: {
    fontSize: number;
    fontWeight: number;
    color: string;
    fontFamily: string;
    letterSpacing: number;
  };
}

export interface LayoutSettings {
  cardWidth: number;
  cardHeight: number;
  gridGap: number;
  columns: number;
  padding: {
    card: number;
    header: number;
    content: number;
    logEntry: number;
  };
  margins: {
    logEntry: number;
    sections: number;
  };
  alignment: {
    header: 'left' | 'center' | 'right' | 'space-between';
    logContent: 'left' | 'center' | 'right';
    timestamp: 'left' | 'center' | 'right';
    logLevel: 'left' | 'center' | 'right';
  };
}

export interface InteractiveSettings {
  hover: {
    enabled: boolean;
    transform: string;
    transitionDuration: number;
    backgroundChange: boolean;
    shadowIntensity: number;
  };
  buttons: {
    borderRadius: number;
    padding: number;
    fontSize: number;
    fontWeight: number;
    hoverLift: number;
    pressDepth: number;
    shadowSpread: number;
  };
  logEntries: {
    hoverEnabled: boolean;
    hoverBackground: string;
    hoverShadow: boolean;
    clickAnimation: boolean;
    selectionHighlight: string;
  };
}

export interface IconSettings {
  enabled: boolean;
  size: number;
  spacing: number;
  position: 'before' | 'after';
  customIcons: {
    error: string;
    warn: string;
    info: string;
    debug: string;
    success: string;
  };
  colors: {
    error: string;
    warn: string;
    info: string;
    debug: string;
    success: string;
  };
}

export interface LogDisplaySettings {
  typography: TypographySettings;
  showTimestamps: boolean;
  showLogLevel: boolean;
  showSource: boolean;
  timestampFormat: 'full' | 'time-only' | 'relative';
  maxLogLength: number;
  wordWrap: boolean;
  logSpacing: 'compact' | 'normal' | 'relaxed';
  showIcons: boolean;
}

export interface DebugSettings {
  showBorders: boolean;
  showLegend: boolean;
  borderSettings: {
    container: boolean;
    header: boolean;
    searchInput: boolean;
    logContent: boolean;
  };
}

export interface DashboardSettings {
  layout: LayoutSettings;
  theme: ThemeSettings;
  logDisplay: LogDisplaySettings;
  interactive: InteractiveSettings;
  icons: IconSettings;
  debug: DebugSettings;
}

interface SettingsContextType {
  settings: DashboardSettings;
  updateSettings: (newSettings: Partial<DashboardSettings>) => void;
  resetSettings: () => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const defaultSettings: DashboardSettings = {
  layout: {
    cardWidth: 536,
    cardHeight: 320,
    gridGap: 20,
    columns: 3,
    padding: {
      card: 16,
      header: 16,
      content: 12,
      logEntry: 8
    },
    margins: {
      logEntry: 4,
      sections: 12
    },
    alignment: {
      header: 'space-between',
      logContent: 'left',
      timestamp: 'left',
      logLevel: 'left'
    }
  },
  theme: {
    baseColor: '#e0e5ec',
    textColor: '#4a5568',
    shadowIntensity: 1,
    borderRadius: 20
  },
  logDisplay: {
    typography: {
      timestamp: {
        fontSize: 11,
        fontWeight: 400,
        color: '#6b7280',
        fontFamily: 'Monaco, monospace',
        letterSpacing: 0.3,
        textAlign: 'left'
      },
      logLevel: {
        fontSize: 10,
        fontWeight: 600,
        color: '#4a5568',
        fontFamily: 'Monaco, monospace',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        textAlign: 'left'
      },
      message: {
        fontSize: 12,
        fontWeight: 400,
        color: '#374151',
        fontFamily: 'Monaco, monospace',
        letterSpacing: 0.2,
        lineHeight: 1.4,
        textAlign: 'left'
      },
      source: {
        fontSize: 10,
        fontWeight: 400,
        color: '#9ca3af',
        fontFamily: 'Monaco, monospace',
        letterSpacing: 0.3
      }
    },
    showTimestamps: true,
    showLogLevel: true,
    showSource: false,
    timestampFormat: 'time-only',
    maxLogLength: 150,
    wordWrap: true,
    logSpacing: 'normal',
    showIcons: true
  },
  interactive: {
    hover: {
      enabled: true,
      transform: 'translateY(-1px)',
      transitionDuration: 200,
      backgroundChange: true,
      shadowIntensity: 1.2
    },
    buttons: {
      borderRadius: 12,
      padding: 10,
      fontSize: 12,
      fontWeight: 600,
      hoverLift: 2,
      pressDepth: 1,
      shadowSpread: 4
    },
    logEntries: {
      hoverEnabled: true,
      hoverBackground: 'rgba(255, 255, 255, 0.1)',
      hoverShadow: true,
      clickAnimation: true,
      selectionHighlight: '#3b82f6'
    }
  },
  icons: {
    enabled: true,
    size: 14,
    spacing: 4,
    position: 'before',
    customIcons: {
      error: '❌',
      warn: '⚠️',
      info: 'ℹ️',
      debug: '🐛',
      success: '✅'
    },
    colors: {
      error: '#ef4444',
      warn: '#f59e0b',
      info: '#3b82f6',
      debug: '#10b981',
      success: '#22c55e'
    }
  },
  debug: {
    showBorders: false,
    showLegend: false,
    borderSettings: {
      container: true,
      header: true,
      searchInput: true,
      logContent: true
    }
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<DashboardSettings>(defaultSettings);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('logging-dashboard-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Deep merge to ensure all nested properties have defaults
        const mergedSettings = {
          layout: { 
            ...defaultSettings.layout, 
            ...parsed.layout,
            padding: { ...defaultSettings.layout.padding, ...parsed.layout?.padding },
            margins: { ...defaultSettings.layout.margins, ...parsed.layout?.margins },
            alignment: { ...defaultSettings.layout.alignment, ...parsed.layout?.alignment }
          },
          theme: { ...defaultSettings.theme, ...parsed.theme },
          logDisplay: { 
            ...defaultSettings.logDisplay, 
            ...parsed.logDisplay,
            typography: {
              timestamp: { ...defaultSettings.logDisplay.typography.timestamp, ...parsed.logDisplay?.typography?.timestamp },
              logLevel: { ...defaultSettings.logDisplay.typography.logLevel, ...parsed.logDisplay?.typography?.logLevel },
              message: { ...defaultSettings.logDisplay.typography.message, ...parsed.logDisplay?.typography?.message },
              source: { ...defaultSettings.logDisplay.typography.source, ...parsed.logDisplay?.typography?.source }
            }
          },
          interactive: {
            ...defaultSettings.interactive,
            ...parsed.interactive,
            hover: { ...defaultSettings.interactive.hover, ...parsed.interactive?.hover },
            buttons: { ...defaultSettings.interactive.buttons, ...parsed.interactive?.buttons },
            logEntries: { ...defaultSettings.interactive.logEntries, ...parsed.interactive?.logEntries }
          },
          icons: {
            ...defaultSettings.icons,
            ...parsed.icons,
            customIcons: { ...defaultSettings.icons.customIcons, ...parsed.icons?.customIcons },
            colors: { ...defaultSettings.icons.colors, ...parsed.icons?.colors }
          },
          debug: { 
            ...defaultSettings.debug, 
            ...parsed.debug,
            borderSettings: { 
              ...defaultSettings.debug.borderSettings, 
              ...parsed.debug?.borderSettings 
            }
          }
        };
        setSettings(mergedSettings);
      } catch (error) {
        console.warn('Failed to parse saved settings:', error);
      }
    }
  }, []);

  // Apply settings to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    // Layout variables
    root.style.setProperty('--neuro-card-width', `${settings.layout.cardWidth}px`);
    root.style.setProperty('--neuro-card-height', `${settings.layout.cardHeight}px`);
    root.style.setProperty('--neuro-grid-gap', `${settings.layout.gridGap}px`);
    
    // Layout padding variables
    root.style.setProperty('--card-padding', `${settings.layout.padding.card}px`);
    root.style.setProperty('--header-padding', `${settings.layout.padding.header}px`);
    root.style.setProperty('--content-padding', `${settings.layout.padding.content}px`);
    root.style.setProperty('--log-entry-padding', `${settings.layout.padding.logEntry}px`);
    
    // Layout margin variables
    root.style.setProperty('--log-entry-margin', `${settings.layout.margins.logEntry}px`);
    root.style.setProperty('--sections-margin', `${settings.layout.margins.sections}px`);
    
    // Theme variables
    root.style.setProperty('--neuro-base', settings.theme.baseColor);
    root.style.setProperty('--neuro-text', settings.theme.textColor);
    
    // Typography variables - Timestamp
    root.style.setProperty('--timestamp-font-size', `${settings.logDisplay.typography.timestamp.fontSize}px`);
    root.style.setProperty('--timestamp-font-weight', `${settings.logDisplay.typography.timestamp.fontWeight}`);
    root.style.setProperty('--timestamp-color', settings.logDisplay.typography.timestamp.color);
    root.style.setProperty('--timestamp-font-family', settings.logDisplay.typography.timestamp.fontFamily);
    root.style.setProperty('--timestamp-letter-spacing', `${settings.logDisplay.typography.timestamp.letterSpacing}px`);
    root.style.setProperty('--timestamp-text-align', settings.logDisplay.typography.timestamp.textAlign);
    
    // Typography variables - Log Level
    root.style.setProperty('--loglevel-font-size', `${settings.logDisplay.typography.logLevel.fontSize}px`);
    root.style.setProperty('--loglevel-font-weight', `${settings.logDisplay.typography.logLevel.fontWeight}`);
    root.style.setProperty('--loglevel-color', settings.logDisplay.typography.logLevel.color);
    root.style.setProperty('--loglevel-font-family', settings.logDisplay.typography.logLevel.fontFamily);
    root.style.setProperty('--loglevel-letter-spacing', `${settings.logDisplay.typography.logLevel.letterSpacing}px`);
    root.style.setProperty('--loglevel-text-transform', settings.logDisplay.typography.logLevel.textTransform);
    root.style.setProperty('--loglevel-text-align', settings.logDisplay.typography.logLevel.textAlign);
    
    // Typography variables - Message
    root.style.setProperty('--message-font-size', `${settings.logDisplay.typography.message.fontSize}px`);
    root.style.setProperty('--message-font-weight', `${settings.logDisplay.typography.message.fontWeight}`);
    root.style.setProperty('--message-color', settings.logDisplay.typography.message.color);
    root.style.setProperty('--message-font-family', settings.logDisplay.typography.message.fontFamily);
    root.style.setProperty('--message-letter-spacing', `${settings.logDisplay.typography.message.letterSpacing}px`);
    root.style.setProperty('--message-line-height', `${settings.logDisplay.typography.message.lineHeight}`);
    root.style.setProperty('--message-text-align', settings.logDisplay.typography.message.textAlign);
    
    // Typography variables - Source
    root.style.setProperty('--source-font-size', `${settings.logDisplay.typography.source.fontSize}px`);
    root.style.setProperty('--source-font-weight', `${settings.logDisplay.typography.source.fontWeight}`);
    root.style.setProperty('--source-color', settings.logDisplay.typography.source.color);
    root.style.setProperty('--source-font-family', settings.logDisplay.typography.source.fontFamily);
    root.style.setProperty('--source-letter-spacing', `${settings.logDisplay.typography.source.letterSpacing}px`);
    
    // Legacy Log Display variables (for backward compatibility)
    root.style.setProperty('--log-max-length', `${settings.logDisplay.maxLogLength}ch`);
    root.style.setProperty('--log-spacing', 
      settings.logDisplay.logSpacing === 'compact' ? '2px' :
      settings.logDisplay.logSpacing === 'relaxed' ? '8px' : '4px'
    );
    root.style.setProperty('--log-word-wrap', 
      settings.logDisplay.wordWrap ? 'break-word' : 'nowrap'
    );
    
    // Interactive variables - Hover effects
    root.style.setProperty('--hover-transform', settings.interactive.hover.transform);
    root.style.setProperty('--hover-transition', `${settings.interactive.hover.transitionDuration}ms`);
    root.style.setProperty('--hover-shadow-intensity', `${settings.interactive.hover.shadowIntensity}`);
    
    // Interactive variables - Buttons
    root.style.setProperty('--button-border-radius', `${settings.interactive.buttons.borderRadius}px`);
    root.style.setProperty('--button-padding', `${settings.interactive.buttons.padding}px`);
    root.style.setProperty('--button-font-size', `${settings.interactive.buttons.fontSize}px`);
    root.style.setProperty('--button-font-weight', `${settings.interactive.buttons.fontWeight}`);
    
    // Interactive variables - Log entries
    root.style.setProperty('--log-entry-hover-bg', settings.interactive.logEntries.hoverBackground);
    root.style.setProperty('--log-entry-selection-color', settings.interactive.logEntries.selectionHighlight);
    
    // Icon variables
    root.style.setProperty('--icon-size', `${settings.icons.size}px`);
    root.style.setProperty('--icon-spacing', `${settings.icons.spacing}px`);
    root.style.setProperty('--icon-error-color', settings.icons.colors.error);
    root.style.setProperty('--icon-warn-color', settings.icons.colors.warn);
    root.style.setProperty('--icon-info-color', settings.icons.colors.info);
    root.style.setProperty('--icon-debug-color', settings.icons.colors.debug);
    root.style.setProperty('--icon-success-color', settings.icons.colors.success);
    
    // Shadow intensity
    const shadowDark = settings.theme.baseColor === '#e0e5ec' ? '#a3b1c6' : '#000000';
    const shadowLight = settings.theme.baseColor === '#e0e5ec' ? '#ffffff' : '#333333';
    root.style.setProperty('--neuro-shadow-dark', shadowDark);
    root.style.setProperty('--neuro-shadow-light', shadowLight);
    
  }, [settings]);

  // Save settings to localStorage
  const updateSettings = (newSettings: Partial<DashboardSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('logging-dashboard-settings', JSON.stringify(updated));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('logging-dashboard-settings');
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const value: SettingsContextType = {
    settings,
    updateSettings,
    resetSettings,
    isModalOpen,
    openModal,
    closeModal
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};