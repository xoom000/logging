/**
 * 🎛️ SETTINGS MODAL - Centralized Configuration Interface
 * 
 * Tabbed modal for managing all dashboard settings:
 * - Layout tab: dimensions, grid settings
 * - Theme tab: colors, shadows, styling
 * - Debug tab: border toggles, debug options
 */

import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';

type TabType = 'layout' | 'theme' | 'typography' | 'interactive' | 'icons' | 'logs' | 'debug';

const SettingsModal: React.FC = () => {
  const { settings, updateSettings, resetSettings, isModalOpen, closeModal } = useSettings();
  const [activeTab, setActiveTab] = useState<TabType>('layout');

  if (!isModalOpen) return null;

  const handleLayoutChange = (field: string, value: number) => {
    updateSettings({
      layout: {
        ...settings.layout,
        [field]: value
      }
    });
  };

  const handleThemeChange = (field: string, value: string | number) => {
    updateSettings({
      theme: {
        ...settings.theme,
        [field]: value
      }
    });
  };

  const handleLogDisplayChange = (field: string, value: string | number | boolean) => {
    updateSettings({
      logDisplay: {
        ...settings.logDisplay,
        [field]: value
      }
    });
  };

  const handleTypographyChange = (element: 'timestamp' | 'logLevel' | 'message' | 'source', field: string, value: string | number) => {
    updateSettings({
      logDisplay: {
        ...settings.logDisplay,
        typography: {
          ...settings.logDisplay.typography,
          [element]: {
            ...settings.logDisplay.typography[element],
            [field]: value
          }
        }
      }
    });
  };

  const handleLayoutPaddingChange = (field: string, value: number) => {
    updateSettings({
      layout: {
        ...settings.layout,
        padding: {
          ...settings.layout.padding,
          [field]: value
        }
      }
    });
  };

  const handleLayoutMarginChange = (field: string, value: number) => {
    updateSettings({
      layout: {
        ...settings.layout,
        margins: {
          ...settings.layout.margins,
          [field]: value
        }
      }
    });
  };

  const handleLayoutAlignmentChange = (field: string, value: string) => {
    updateSettings({
      layout: {
        ...settings.layout,
        alignment: {
          ...settings.layout.alignment,
          [field]: value
        }
      }
    });
  };

  const handleInteractiveChange = (category: 'hover' | 'buttons' | 'logEntries', field: string, value: string | number | boolean) => {
    updateSettings({
      interactive: {
        ...settings.interactive,
        [category]: {
          ...settings.interactive[category],
          [field]: value
        }
      }
    });
  };

  const handleIconChange = (field: string, value: string | number | boolean) => {
    updateSettings({
      icons: {
        ...settings.icons,
        [field]: value
      }
    });
  };

  const handleIconColorChange = (level: string, value: string) => {
    updateSettings({
      icons: {
        ...settings.icons,
        colors: {
          ...settings.icons.colors,
          [level]: value
        }
      }
    });
  };

  const handleIconCustomChange = (level: string, value: string) => {
    updateSettings({
      icons: {
        ...settings.icons,
        customIcons: {
          ...settings.icons.customIcons,
          [level]: value
        }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="neuro-card" style={{ 
        width: '600px', 
        maxHeight: '80vh', 
        padding: '0',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div className="neuro-flex p-6 border-b border-gray-200">
          <h2 className="neuro-log-text defined text-xl">⚙️ Dashboard Settings</h2>
          <button 
            onClick={closeModal}
            className="neuro-toggle"
            style={{ marginLeft: 'auto' }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="neuro-flex p-4" style={{ borderBottom: '1px solid #ddd', flexWrap: 'wrap' }}>
          {([
            { key: 'layout', label: '📐 Layout', icon: '📐' },
            { key: 'theme', label: '🎨 Theme', icon: '🎨' },
            { key: 'typography', label: '🔤 Typography', icon: '🔤' },
            { key: 'interactive', label: '🖱️ Interactive', icon: '🖱️' },
            { key: 'icons', label: '🎯 Icons', icon: '🎯' },
            { key: 'logs', label: '📝 Logs', icon: '📝' },
            { key: 'debug', label: '🔍 Debug', icon: '🔍' }
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`neuro-toggle ${activeTab === tab.key ? 'active' : ''}`}
              style={{ fontSize: '11px', padding: '6px 12px', minWidth: '60px' }}
            >
              {tab.icon}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          
          {/* Layout Tab */}
          {activeTab === 'layout' && (
            <div className="space-y-4">
              <h3 className="neuro-log-text defined">📐 Layout Settings</h3>
              
              <div>
                <label className="neuro-log-text">Card Width: {settings.layout.cardWidth}px</label>
                <input
                  type="range"
                  min="280"
                  max="800"
                  value={settings.layout.cardWidth}
                  onChange={(e) => handleLayoutChange('cardWidth', parseInt(e.target.value))}
                  className="w-full mt-2"
                />
              </div>

              <div>
                <label className="neuro-log-text">Card Height: {settings.layout.cardHeight}px</label>
                <input
                  type="range"
                  min="120"
                  max="600"
                  value={settings.layout.cardHeight}
                  onChange={(e) => handleLayoutChange('cardHeight', parseInt(e.target.value))}
                  className="w-full mt-2"
                />
              </div>

              <div>
                <label className="neuro-log-text">Grid Gap: {settings.layout.gridGap}px</label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={settings.layout.gridGap}
                  onChange={(e) => handleLayoutChange('gridGap', parseInt(e.target.value))}
                  className="w-full mt-2"
                />
              </div>

              <div>
                <label className="neuro-log-text">Columns: {settings.layout.columns}</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={settings.layout.columns}
                  onChange={(e) => handleLayoutChange('columns', parseInt(e.target.value))}
                  className="w-full mt-2"
                />
              </div>
              
              <h4 className="neuro-log-text defined mt-6">Padding Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="neuro-log-text">Card: {settings.layout.padding.card}px</label>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={settings.layout.padding.card}
                    onChange={(e) => handleLayoutPaddingChange('card', parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
                <div>
                  <label className="neuro-log-text">Header: {settings.layout.padding.header}px</label>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={settings.layout.padding.header}
                    onChange={(e) => handleLayoutPaddingChange('header', parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
                <div>
                  <label className="neuro-log-text">Content: {settings.layout.padding.content}px</label>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={settings.layout.padding.content}
                    onChange={(e) => handleLayoutPaddingChange('content', parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
                <div>
                  <label className="neuro-log-text">Log Entry: {settings.layout.padding.logEntry}px</label>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={settings.layout.padding.logEntry}
                    onChange={(e) => handleLayoutPaddingChange('logEntry', parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
              </div>
              
              <h4 className="neuro-log-text defined mt-6">Margin Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="neuro-log-text">Log Entry: {settings.layout.margins.logEntry}px</label>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    value={settings.layout.margins.logEntry}
                    onChange={(e) => handleLayoutMarginChange('logEntry', parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
                <div>
                  <label className="neuro-log-text">Sections: {settings.layout.margins.sections}px</label>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={settings.layout.margins.sections}
                    onChange={(e) => handleLayoutMarginChange('sections', parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
              </div>
              
              <h4 className="neuro-log-text defined mt-6">Alignment Settings</h4>
              <div className="space-y-3">
                <div>
                  <label className="neuro-log-text">Header Alignment</label>
                  <select
                    value={settings.layout.alignment.header}
                    onChange={(e) => handleLayoutAlignmentChange('header', e.target.value)}
                    className="neuro-input mt-1"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="space-between">Space Between</option>
                  </select>
                </div>
                <div>
                  <label className="neuro-log-text">Log Content Alignment</label>
                  <select
                    value={settings.layout.alignment.logContent}
                    onChange={(e) => handleLayoutAlignmentChange('logContent', e.target.value)}
                    className="neuro-input mt-1"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <h3 className="neuro-log-text defined">🎨 Theme Settings</h3>
              
              <div>
                <label className="neuro-log-text">Base Color</label>
                <input
                  type="color"
                  value={settings.theme.baseColor}
                  onChange={(e) => handleThemeChange('baseColor', e.target.value)}
                  className="neuro-input mt-2"
                />
              </div>

              <div>
                <label className="neuro-log-text">Text Color</label>
                <input
                  type="color"
                  value={settings.theme.textColor}
                  onChange={(e) => handleThemeChange('textColor', e.target.value)}
                  className="neuro-input mt-2"
                />
              </div>

              <div>
                <label className="neuro-log-text">Shadow Intensity: {settings.theme.shadowIntensity}</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.theme.shadowIntensity}
                  onChange={(e) => handleThemeChange('shadowIntensity', parseFloat(e.target.value))}
                  className="w-full mt-2"
                />
              </div>

              <div>
                <label className="neuro-log-text">Border Radius: {settings.theme.borderRadius}px</label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={settings.theme.borderRadius}
                  onChange={(e) => handleThemeChange('borderRadius', parseInt(e.target.value))}
                  className="w-full mt-2"
                />
              </div>
            </div>
          )}

          {/* Typography Tab */}
          {activeTab === 'typography' && (
            <div className="space-y-6">
              <h3 className="neuro-log-text defined">🔤 Typography Settings</h3>
              
              {/* Timestamp Typography */}
              <div>
                <h4 className="neuro-log-text defined">⏰ Timestamp</h4>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="neuro-log-text">Size: {settings.logDisplay.typography.timestamp.fontSize}px</label>
                    <input
                      type="range"
                      min="8"
                      max="18"
                      value={settings.logDisplay.typography.timestamp.fontSize}
                      onChange={(e) => handleTypographyChange('timestamp', 'fontSize', parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                  <div>
                    <label className="neuro-log-text">Weight: {settings.logDisplay.typography.timestamp.fontWeight}</label>
                    <input
                      type="range"
                      min="100"
                      max="900"
                      step="100"
                      value={settings.logDisplay.typography.timestamp.fontWeight}
                      onChange={(e) => handleTypographyChange('timestamp', 'fontWeight', parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                  <div>
                    <label className="neuro-log-text">Color</label>
                    <input
                      type="color"
                      value={settings.logDisplay.typography.timestamp.color}
                      onChange={(e) => handleTypographyChange('timestamp', 'color', e.target.value)}
                      className="neuro-input mt-1"
                    />
                  </div>
                  <div>
                    <label className="neuro-log-text">Letter Spacing: {settings.logDisplay.typography.timestamp.letterSpacing}px</label>
                    <input
                      type="range"
                      min="-1"
                      max="3"
                      step="0.1"
                      value={settings.logDisplay.typography.timestamp.letterSpacing}
                      onChange={(e) => handleTypographyChange('timestamp', 'letterSpacing', parseFloat(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                </div>
              </div>
              
              {/* Log Level Typography */}
              <div>
                <h4 className="neuro-log-text defined">🏷️ Log Level</h4>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="neuro-log-text">Size: {settings.logDisplay.typography.logLevel.fontSize}px</label>
                    <input
                      type="range"
                      min="8"
                      max="18"
                      value={settings.logDisplay.typography.logLevel.fontSize}
                      onChange={(e) => handleTypographyChange('logLevel', 'fontSize', parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                  <div>
                    <label className="neuro-log-text">Weight: {settings.logDisplay.typography.logLevel.fontWeight}</label>
                    <input
                      type="range"
                      min="100"
                      max="900"
                      step="100"
                      value={settings.logDisplay.typography.logLevel.fontWeight}
                      onChange={(e) => handleTypographyChange('logLevel', 'fontWeight', parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                  <div>
                    <label className="neuro-log-text">Color</label>
                    <input
                      type="color"
                      value={settings.logDisplay.typography.logLevel.color}
                      onChange={(e) => handleTypographyChange('logLevel', 'color', e.target.value)}
                      className="neuro-input mt-1"
                    />
                  </div>
                  <div>
                    <label className="neuro-log-text">Transform</label>
                    <select
                      value={settings.logDisplay.typography.logLevel.textTransform}
                      onChange={(e) => handleTypographyChange('logLevel', 'textTransform', e.target.value)}
                      className="neuro-input mt-1"
                    >
                      <option value="none">None</option>
                      <option value="uppercase">UPPERCASE</option>
                      <option value="lowercase">lowercase</option>
                      <option value="capitalize">Capitalize</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Message Typography */}
              <div>
                <h4 className="neuro-log-text defined">💬 Message Text</h4>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="neuro-log-text">Size: {settings.logDisplay.typography.message.fontSize}px</label>
                    <input
                      type="range"
                      min="8"
                      max="20"
                      value={settings.logDisplay.typography.message.fontSize}
                      onChange={(e) => handleTypographyChange('message', 'fontSize', parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                  <div>
                    <label className="neuro-log-text">Weight: {settings.logDisplay.typography.message.fontWeight}</label>
                    <input
                      type="range"
                      min="100"
                      max="900"
                      step="100"
                      value={settings.logDisplay.typography.message.fontWeight}
                      onChange={(e) => handleTypographyChange('message', 'fontWeight', parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                  <div>
                    <label className="neuro-log-text">Color</label>
                    <input
                      type="color"
                      value={settings.logDisplay.typography.message.color}
                      onChange={(e) => handleTypographyChange('message', 'color', e.target.value)}
                      className="neuro-input mt-1"
                    />
                  </div>
                  <div>
                    <label className="neuro-log-text">Line Height: {settings.logDisplay.typography.message.lineHeight}</label>
                    <input
                      type="range"
                      min="1.0"
                      max="2.5"
                      step="0.1"
                      value={settings.logDisplay.typography.message.lineHeight}
                      onChange={(e) => handleTypographyChange('message', 'lineHeight', parseFloat(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                </div>
              </div>
              
              {/* Source Typography */}
              <div>
                <h4 className="neuro-log-text defined">📂 Source</h4>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="neuro-log-text">Size: {settings.logDisplay.typography.source.fontSize}px</label>
                    <input
                      type="range"
                      min="8"
                      max="16"
                      value={settings.logDisplay.typography.source.fontSize}
                      onChange={(e) => handleTypographyChange('source', 'fontSize', parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                  <div>
                    <label className="neuro-log-text">Weight: {settings.logDisplay.typography.source.fontWeight}</label>
                    <input
                      type="range"
                      min="100"
                      max="900"
                      step="100"
                      value={settings.logDisplay.typography.source.fontWeight}
                      onChange={(e) => handleTypographyChange('source', 'fontWeight', parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                  <div>
                    <label className="neuro-log-text">Color</label>
                    <input
                      type="color"
                      value={settings.logDisplay.typography.source.color}
                      onChange={(e) => handleTypographyChange('source', 'color', e.target.value)}
                      className="neuro-input mt-1"
                    />
                  </div>
                  <div>
                    <label className="neuro-log-text">Letter Spacing: {settings.logDisplay.typography.source.letterSpacing}px</label>
                    <input
                      type="range"
                      min="-1"
                      max="3"
                      step="0.1"
                      value={settings.logDisplay.typography.source.letterSpacing}
                      onChange={(e) => handleTypographyChange('source', 'letterSpacing', parseFloat(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Interactive Settings Tab */}
          {activeTab === 'interactive' && (
            <div className="space-y-6">
              <h3 className="neuro-log-text defined">🖱️ Interactive Settings</h3>
              
              {/* Hover Effects */}
              <div>
                <h4 className="neuro-log-text defined">✨ Hover Effects</h4>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="neuro-flex">
                      <input
                        type="checkbox"
                        checked={settings.interactive.hover.enabled}
                        onChange={(e) => handleInteractiveChange('hover', 'enabled', e.target.checked)}
                      />
                      <span className="neuro-log-text">Enable Hover Effects</span>
                    </label>
                  </div>
                  <div>
                    <label className="neuro-log-text">Transition: {settings.interactive.hover.transitionDuration}ms</label>
                    <input
                      type="range"
                      min="50"
                      max="500"
                      step="50"
                      value={settings.interactive.hover.transitionDuration}
                      onChange={(e) => handleInteractiveChange('hover', 'transitionDuration', parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                  <div>
                    <label className="neuro-log-text">Shadow Intensity: {settings.interactive.hover.shadowIntensity}</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={settings.interactive.hover.shadowIntensity}
                      onChange={(e) => handleInteractiveChange('hover', 'shadowIntensity', parseFloat(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                </div>
              </div>
              
              {/* Button Settings */}
              <div>
                <h4 className="neuro-log-text defined">🔘 Button Settings</h4>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="neuro-log-text">Border Radius: {settings.interactive.buttons.borderRadius}px</label>
                    <input
                      type="range"
                      min="4"
                      max="24"
                      value={settings.interactive.buttons.borderRadius}
                      onChange={(e) => handleInteractiveChange('buttons', 'borderRadius', parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                  <div>
                    <label className="neuro-log-text">Padding: {settings.interactive.buttons.padding}px</label>
                    <input
                      type="range"
                      min="4"
                      max="20"
                      value={settings.interactive.buttons.padding}
                      onChange={(e) => handleInteractiveChange('buttons', 'padding', parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                  <div>
                    <label className="neuro-log-text">Font Size: {settings.interactive.buttons.fontSize}px</label>
                    <input
                      type="range"
                      min="8"
                      max="18"
                      value={settings.interactive.buttons.fontSize}
                      onChange={(e) => handleInteractiveChange('buttons', 'fontSize', parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                  <div>
                    <label className="neuro-log-text">Font Weight: {settings.interactive.buttons.fontWeight}</label>
                    <input
                      type="range"
                      min="100"
                      max="900"
                      step="100"
                      value={settings.interactive.buttons.fontWeight}
                      onChange={(e) => handleInteractiveChange('buttons', 'fontWeight', parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                </div>
              </div>
              
              {/* Log Entry Interactions */}
              <div>
                <h4 className="neuro-log-text defined">📄 Log Entry Interactions</h4>
                <div className="space-y-3 mt-3">
                  <label className="neuro-flex">
                    <input
                      type="checkbox"
                      checked={settings.interactive.logEntries.hoverEnabled}
                      onChange={(e) => handleInteractiveChange('logEntries', 'hoverEnabled', e.target.checked)}
                    />
                    <span className="neuro-log-text">Enable Log Entry Hover</span>
                  </label>
                  <label className="neuro-flex">
                    <input
                      type="checkbox"
                      checked={settings.interactive.logEntries.hoverShadow}
                      onChange={(e) => handleInteractiveChange('logEntries', 'hoverShadow', e.target.checked)}
                    />
                    <span className="neuro-log-text">Hover Shadow Effect</span>
                  </label>
                  <label className="neuro-flex">
                    <input
                      type="checkbox"
                      checked={settings.interactive.logEntries.clickAnimation}
                      onChange={(e) => handleInteractiveChange('logEntries', 'clickAnimation', e.target.checked)}
                    />
                    <span className="neuro-log-text">Click Animation</span>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {/* Icons Tab */}
          {activeTab === 'icons' && (
            <div className="space-y-6">
              <h3 className="neuro-log-text defined">🎯 Icon Settings</h3>
              
              <div className="space-y-4">
                <label className="neuro-flex">
                  <input
                    type="checkbox"
                    checked={settings.icons.enabled}
                    onChange={(e) => handleIconChange('enabled', e.target.checked)}
                  />
                  <span className="neuro-log-text">Enable Icons</span>
                </label>
                
                <div>
                  <label className="neuro-log-text">Icon Size: {settings.icons.size}px</label>
                  <input
                    type="range"
                    min="8"
                    max="32"
                    value={settings.icons.size}
                    onChange={(e) => handleIconChange('size', parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
                
                <div>
                  <label className="neuro-log-text">Icon Spacing: {settings.icons.spacing}px</label>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    value={settings.icons.spacing}
                    onChange={(e) => handleIconChange('spacing', parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
                
                <div>
                  <label className="neuro-log-text">Position</label>
                  <select
                    value={settings.icons.position}
                    onChange={(e) => handleIconChange('position', e.target.value)}
                    className="neuro-input mt-2"
                  >
                    <option value="before">Before Text</option>
                    <option value="after">After Text</option>
                  </select>
                </div>
                
                <h4 className="neuro-log-text defined">Custom Icons</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(settings.icons.customIcons).map(([level, icon]) => (
                    <div key={level}>
                      <label className="neuro-log-text">{level.charAt(0).toUpperCase() + level.slice(1)}</label>
                      <input
                        type="text"
                        value={icon}
                        onChange={(e) => handleIconCustomChange(level, e.target.value)}
                        className="neuro-input mt-1"
                        placeholder="Emoji or text"
                      />
                    </div>
                  ))}
                </div>
                
                <h4 className="neuro-log-text defined">Icon Colors</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(settings.icons.colors).map(([level, color]) => (
                    <div key={level}>
                      <label className="neuro-log-text">{level.charAt(0).toUpperCase() + level.slice(1)}</label>
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => handleIconColorChange(level, e.target.value)}
                        className="neuro-input mt-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

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

              <div>
                <label className="neuro-log-text">Timestamp Format</label>
                <select
                  value={settings.logDisplay.timestampFormat}
                  onChange={(e) => handleLogDisplayChange('timestampFormat', e.target.value)}
                  className="neuro-input mt-2"
                >
                  <option value="time-only">Time Only (14:43:40)</option>
                  <option value="full">Full DateTime</option>
                  <option value="relative">Relative (2m ago)</option>
                </select>
              </div>

              <div className="space-y-2">
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
                  <span className="neuro-log-text">Show Level Icons</span>
                </label>

                <label className="neuro-flex">
                  <input
                    type="checkbox"
                    checked={settings.logDisplay.wordWrap}
                    onChange={(e) => handleLogDisplayChange('wordWrap', e.target.checked)}
                  />
                  <span className="neuro-log-text">Word Wrap Long Messages</span>
                </label>
              </div>
            </div>
          )}

          {/* Debug Tab */}
          {activeTab === 'debug' && (
            <div className="space-y-4">
              <h3 className="neuro-log-text defined">🔍 Debug Settings</h3>
              
              <div>
                <label className="neuro-flex">
                  <input
                    type="checkbox"
                    checked={settings.debug.showLegend}
                    onChange={(e) => handleDebugChange('showLegend', e.target.checked)}
                  />
                  <span className="neuro-log-text">Show Debug Legend</span>
                </label>
              </div>

              <div>
                <label className="neuro-flex">
                  <input
                    type="checkbox"
                    checked={settings.debug.showBorders}
                    onChange={(e) => handleDebugChange('showBorders', e.target.checked)}
                  />
                  <span className="neuro-log-text">Enable Debug Borders</span>
                </label>
              </div>

              {settings.debug.showBorders && (
                <div className="ml-6 space-y-2">
                  {Object.entries(settings.debug.borderSettings).map(([key, value]) => (
                    <div key={key}>
                      <label className="neuro-flex">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handleDebugChange(key, e.target.checked)}
                        />
                        <span className="neuro-log-text">{key.charAt(0).toUpperCase() + key.slice(1)} Border</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="neuro-flex p-6 border-t border-gray-200">
          <button onClick={resetSettings} className="neuro-toggle">
            🔄 Reset to Defaults
          </button>
          <button onClick={closeModal} className="neuro-toggle" style={{ marginLeft: 'auto' }}>
            ✅ Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;