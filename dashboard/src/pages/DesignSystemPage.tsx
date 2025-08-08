/**
 * 🎨 DESIGN SYSTEM PAGE
 * 
 * Separate page for the Design System Easel - removed from main dashboard
 * Accessible via navigation, keeps main dashboard clean and focused
 */

import React, { useState } from 'react';
import { DesignSystemEasel } from '../components/DesignSystemEasel';
import '../App.css';

const DesignSystemPage: React.FC = () => {
  const [isEaselOpen, setIsEaselOpen] = useState(true); // Open by default on this page

  return (
    <div className="neuro-app">
      {/* Page Header */}
      <header className="neuro-header">
        <div className="neuro-flex" style={{ alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <h1 className="neuro-title">🎨 Design System Easel</h1>
            <p className="neuro-subtitle">Custom modal and component designer</p>
          </div>
          <div className="neuro-flex" style={{ gap: '16px' }}>
            <button 
              onClick={() => window.location.href = '/'} 
              className="neuro-toggle"
              style={{ background: 'var(--neuro-bg-raised)', color: 'var(--neuro-text-primary)' }}
            >
              ← Back to Dashboard
            </button>
            <button 
              onClick={() => setIsEaselOpen(!isEaselOpen)} 
              className="neuro-toggle"
            >
              {isEaselOpen ? '🔐 Close Easel' : '🎨 Open Easel'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="neuro-grid" style={{ padding: '20px' }}>
        <div className="neuro-card" style={{ padding: '30px', textAlign: 'center' }}>
          <h2 className="neuro-log-text defined" style={{ marginBottom: '20px' }}>
            Component Design Workshop
          </h2>
          <p className="neuro-log-text soft" style={{ marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>
            Use the Design System Easel to create custom modals, test component styles, 
            and explore the neumorphic design system. This tool helps you prototype UI 
            components without cluttering the main logging dashboard.
          </p>
          
          {!isEaselOpen && (
            <button 
              onClick={() => setIsEaselOpen(true)} 
              className="neuro-toggle" 
              style={{ fontSize: '18px', padding: '15px 30px' }}
            >
              🎨 Launch Design System Easel
            </button>
          )}
        </div>

        {/* Design System Easel Modal */}
        <DesignSystemEasel 
          isOpen={isEaselOpen} 
          onClose={() => setIsEaselOpen(false)}
        />
      </main>

      {/* Footer */}
      <footer className="neuro-card" style={{ padding: '20px', marginTop: '30px', textAlign: 'center' }}>
        <span className="neuro-log-text soft" style={{ fontSize: '12px' }}>
          🎨 Design System Easel - Part of 33Tools Logging System
        </span>
      </footer>
    </div>
  );
};

export default DesignSystemPage;