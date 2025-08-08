import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';

type EaselTabType = 'typography' | 'layout' | 'interactive' | 'icons' | 'theme' | 'templates';

interface DesignSystemEaselProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesignSystemEasel: React.FC<DesignSystemEaselProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<EaselTabType>('typography');

  if (!isOpen) return null;

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

  const exportDesignTemplate = () => {
    const template = {
      name: `Design Template ${new Date().toISOString().split('T')[0]}`,
      timestamp: new Date().toISOString(),
      settings: {
        typography: settings.logDisplay.typography,
        layout: {
          padding: settings.layout.padding,
          margins: settings.layout.margins,
          alignment: settings.layout.alignment,
          cardWidth: settings.layout.cardWidth,
          cardHeight: settings.layout.cardHeight,
          gridGap: settings.layout.gridGap
        },
        theme: settings.theme,
        interactive: settings.interactive,
        icons: settings.icons
      }
    };
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `design-template-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDesignTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const template = JSON.parse(e.target?.result as string);
        if (template.settings) {
          // Apply the template settings
          updateSettings({
            logDisplay: {
              ...settings.logDisplay,
              typography: template.settings.typography
            },
            layout: {
              ...settings.layout,
              ...template.settings.layout
            },
            theme: {
              ...settings.theme,
              ...template.settings.theme
            },
            interactive: {
              ...settings.interactive,
              ...template.settings.interactive
            },
            icons: {
              ...settings.icons,
              ...template.settings.icons
            }
          });
        }
      } catch (error) {
        console.error('Failed to import template:', error);
        alert('Failed to import template. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="neuro-card max-w-5xl w-full max-h-[90vh] m-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="neuro-flex p-6 border-b border-gray-200">
          <div className="neuro-flex">
            <span className="text-2xl">🎨</span>
            <h2 className="neuro-log-text defined text-xl">Design System Easel</h2>
            <span className="neuro-log-text soft text-sm ml-2">Universal UI Design Tool</span>
          </div>
          <button onClick={onClose} className="neuro-button-icon">✕</button>
        </div>

        {/* Tabs */}
        <div className="neuro-flex p-4" style={{ borderBottom: '1px solid #ddd', flexWrap: 'wrap' }}>
          {([
            { key: 'typography', label: '🔤 Typography', icon: '🔤' },
            { key: 'layout', label: '📐 Layout', icon: '📐' },
            { key: 'interactive', label: '🖱️ Interactive', icon: '🖱️' },
            { key: 'icons', label: '🎯 Icons', icon: '🎯' },
            { key: 'theme', label: '🎨 Theme', icon: '🎨' },
            { key: 'templates', label: '📄 Templates', icon: '📄' }
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`neuro-toggle ${activeTab === tab.key ? 'active' : ''}`}
              style={{ fontSize: '11px', padding: '8px 16px', minWidth: '80px' }}
            >
              {tab.icon}
              <span className="ml-2">{tab.label.split(' ')[1]}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          
          {/* Typography Tab */}
          {activeTab === 'typography' && (
            <div className="space-y-6">
              <h3 className="neuro-log-text defined">🔤 Typography Controls</h3>
              
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
          
          {/* Layout Tab */}
          {activeTab === 'layout' && (
            <div className="space-y-4">
              <h3 className="neuro-log-text defined">📐 Layout Controls</h3>
              
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
              
              <h4 className="neuro-log-text defined mt-6">Padding Controls</h4>
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
              
              <h4 className="neuro-log-text defined mt-6">Margin Controls</h4>
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
              
              <h4 className="neuro-log-text defined mt-6">Alignment Controls</h4>
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
          
          {/* Interactive Settings Tab */}
          {activeTab === 'interactive' && (
            <div className="space-y-6">
              <h3 className="neuro-log-text defined">🖱️ Interactive Controls</h3>
              
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
                <h4 className="neuro-log-text defined">🔘 Button Controls</h4>
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
              <h3 className="neuro-log-text defined">🎯 Icon Controls</h3>
              
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

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <h3 className="neuro-log-text defined">🎨 Theme Controls</h3>
              
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
          
          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <h3 className="neuro-log-text defined">📄 Design Templates</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="neuro-log-text defined">Export Current Design</h4>
                  <p className="neuro-log-text soft text-sm mb-3">
                    Save your current design as a reusable template
                  </p>
                  <button
                    onClick={exportDesignTemplate}
                    className="neuro-button"
                  >
                    📥 Export Design Template
                  </button>
                </div>
                
                <div>
                  <h4 className="neuro-log-text defined">Import Design Template</h4>
                  <p className="neuro-log-text soft text-sm mb-3">
                    Load a previously saved design template
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importDesignTemplate}
                    className="neuro-input"
                  />
                </div>
                
                <div className="mt-8">
                  <h4 className="neuro-log-text defined">Template Tips</h4>
                  <ul className="neuro-log-text soft text-sm space-y-1 mt-2">
                    <li>• Templates save typography, layout, theme, interactive, and icon settings</li>
                    <li>• Share templates with others for consistent designs</li>
                    <li>• Templates work across different components and projects</li>
                    <li>• Import will merge with existing settings</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};