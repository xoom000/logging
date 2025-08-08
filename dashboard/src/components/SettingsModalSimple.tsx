import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';

type TabType = 'logs' | 'connection' | 'debug';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<TabType>('logs');

  if (!isOpen) return null;

  const handleLogDisplayChange = (field: string, value: string | number | boolean) => {
    updateSettings({
      logDisplay: {
        ...settings.logDisplay,
        [field]: value
      }
    });
  };

  const handleDebugChange = (field: string, value: boolean) => {
    if (field in settings.debug.borderSettings) {
      updateSettings({
        debug: {
          ...settings.debug,
          borderSettings: {
            ...settings.debug.borderSettings,
            [field]: value
          }
        }
      });
    } else {
      updateSettings({
        debug: {
          ...settings.debug,
          [field]: value
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="neuro-card max-w-2xl w-full max-h-[80vh] m-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="neuro-flex p-6 border-b border-gray-200">
          <div className="neuro-flex">
            <span className="text-xl">⚙️</span>
            <h2 className="neuro-log-text defined text-xl">Dashboard Settings</h2>
            <span className="neuro-log-text soft text-sm ml-2">Logging Configuration</span>
          </div>
          <button onClick={onClose} className="neuro-button-icon">✕</button>
        </div>

        {/* Tabs */}
        <div className="neuro-flex p-4" style={{ borderBottom: '1px solid #ddd' }}>
          {([
            { key: 'logs', label: '📝 Log Display', icon: '📝' },
            { key: 'connection', label: '🔌 Connection', icon: '🔌' },
            { key: 'debug', label: '🔍 Debug', icon: '🔍' }
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`neuro-toggle ${activeTab === tab.key ? 'active' : ''}`}
              style={{ fontSize: '13px', padding: '10px 20px' }}
            >
              {tab.icon} {tab.label.split(' ')[1]}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          
          {/* Log Display Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <h3 className="neuro-log-text defined">📝 Log Display Settings</h3>

              <div>
                <label className="neuro-log-text">Max Log Length: {settings.logDisplay.maxLogLength} chars</label>
                <input
                  type="range"
                  min="50"
                  max="300"
                  value={settings.logDisplay.maxLogLength}
                  onChange={(e) => handleLogDisplayChange('maxLogLength', parseInt(e.target.value))}
                  className="w-full mt-2"
                />
              </div>

              <div>
                <label className="neuro-log-text">Spacing</label>
                <select
                  value={settings.logDisplay.logSpacing}
                  onChange={(e) => handleLogDisplayChange('logSpacing', e.target.value)}
                  className="neuro-input mt-2"
                >
                  <option value="compact">Compact</option>
                  <option value="normal">Normal</option>
                  <option value="relaxed">Relaxed</option>
                </select>
              </div>

              <div className="space-y-2">
                <h4 className="neuro-log-text defined">Visibility Options</h4>
                
                <label className="neuro-flex">
                  <input
                    type="checkbox"
                    checked={settings.logDisplay.showTimestamps}
                    onChange={(e) => handleLogDisplayChange('showTimestamps', e.target.checked)}
                  />
                  <span className="neuro-log-text">Show Timestamps</span>
                </label>

                <label className="neuro-flex">
                  <input
                    type="checkbox"
                    checked={settings.logDisplay.showLogLevel}
                    onChange={(e) => handleLogDisplayChange('showLogLevel', e.target.checked)}
                  />
                  <span className="neuro-log-text">Show Log Level</span>
                </label>

                <label className="neuro-flex">
                  <input
                    type="checkbox"
                    checked={settings.logDisplay.showSource}
                    onChange={(e) => handleLogDisplayChange('showSource', e.target.checked)}
                  />
                  <span className="neuro-log-text">Show Source</span>
                </label>

                <label className="neuro-flex">
                  <input
                    type="checkbox"
                    checked={settings.logDisplay.showIcons}
                    onChange={(e) => handleLogDisplayChange('showIcons', e.target.checked)}
                  />
                  <span className="neuro-log-text">Show Icons</span>
                </label>

                <label className="neuro-flex">
                  <input
                    type="checkbox"
                    checked={settings.logDisplay.wordWrap}
                    onChange={(e) => handleLogDisplayChange('wordWrap', e.target.checked)}
                  />
                  <span className="neuro-log-text">Word Wrap</span>
                </label>
              </div>

              <div>
                <label className="neuro-log-text">Timestamp Format</label>
                <select
                  value={settings.logDisplay.timestampFormat}
                  onChange={(e) => handleLogDisplayChange('timestampFormat', e.target.value)}
                  className="neuro-input mt-2"
                >
                  <option value="time">Time Only (HH:mm:ss)</option>
                  <option value="full">Full (MM/DD HH:mm:ss)</option>
                  <option value="relative">Relative (2m ago)</option>
                </select>
              </div>
            </div>
          )}

          {/* Connection Tab */}
          {activeTab === 'connection' && (
            <div className="space-y-4">
              <h3 className="neuro-log-text defined">🔌 Connection Settings</h3>
              
              <div className="neuro-card p-4">
                <h4 className="neuro-log-text defined text-sm mb-2">WebSocket Configuration</h4>
                <div className="neuro-log-text soft text-xs space-y-1">
                  <div>URL: ws://localhost:7730/ws</div>
                  <div>Auto-reconnect: Enabled</div>
                  <div>Retry attempts: 5</div>
                  <div>Retry delay: 1000ms</div>
                </div>
              </div>
              
              <div className="neuro-card p-4">
                <h4 className="neuro-log-text defined text-sm mb-2">API Endpoints</h4>
                <div className="neuro-log-text soft text-xs space-y-1">
                  <div>Statistics: http://localhost:7710/api/stats</div>
                  <div>Logs: http://localhost:7710/api/logs</div>
                  <div>Health: http://localhost:7710/health</div>
                </div>
              </div>

              <div className="mt-6">
                <p className="neuro-log-text soft text-sm">
                  Connection settings are currently managed by the system. 
                  Future versions will allow custom endpoint configuration.
                </p>
              </div>
            </div>
          )}

          {/* Debug Tab */}
          {activeTab === 'debug' && (
            <div className="space-y-4">
              <h3 className="neuro-log-text defined">🔍 Debug Tools</h3>
              

              <div>
                <label className="neuro-flex">
                  <input
                    type="checkbox"
                    checked={settings.debug.showBorders}
                    onChange={(e) => handleDebugChange('showBorders', e.target.checked)}
                  />
                  <span className="neuro-log-text">Show Debug Borders</span>
                </label>
              </div>

              <div>
                <label className="neuro-flex">
                  <input
                    type="checkbox"
                    checked={settings.debug.showLegend}
                    onChange={(e) => handleDebugChange('showLegend', e.target.checked)}
                  />
                  <span className="neuro-log-text">Show Border Legend</span>
                </label>
              </div>

              <div className="space-y-2 mt-6">
                <h4 className="neuro-log-text defined">Border Controls</h4>
                
                {Object.entries(settings.debug.borderSettings).map(([key, value]) => (
                  <label key={key} className="neuro-flex">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleDebugChange(key, e.target.checked)}
                    />
                    <span className="neuro-log-text capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};