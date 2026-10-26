import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboardIcon,
  UploadIcon,
  CreditCardIcon,
  PrinterIcon,
  FileTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LogoutIcon,
  SparklesIcon,
} from './DashboardIcons';
import './SidebarNav.css';

export default function SidebarNav({
  isCollapsed,
  onToggleCollapse,
  activeTab = 'dashboard',
  onSelectTab,
  onNavigateHome,
  onLogout,
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboardIcon,
    },
    {
      id: 'upload',
      label: 'Upload your Document',
      icon: UploadIcon,
    },
    {
      id: 'ai-studio',
      label: 'AI Studio & Copilot',
      icon: SparklesIcon,
      isAi: true,
    },
    {
      id: 'payment',
      label: 'Payment',
      icon: CreditCardIcon,
    },
    {
      id: 'queue',
      label: 'Print Queue',
      icon: PrinterIcon,
    },
    {
      id: 'forms',
      label: 'University Forms',
      icon: FileTextIcon,
    },
  ];

  return (
    <motion.aside
      className={`sidebar-nav-root ${isCollapsed ? 'collapsed' : 'expanded'}`}
      initial={false}
      animate={{
        width: isCollapsed ? 76 : 248,
      }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Student Navigation"
    >
      {/* Brand Header */}
      <div className="sidebar-brand-header">
        <button
          type="button"
          onClick={onNavigateHome}
          className="sidebar-brand-link"
          title="Return to Print-Fy Homepage"
          aria-label="Print-Fy Homepage"
        >
          <img
            src="/logo/printfy-logo.svg"
            alt="Print-Fy"
            className="sidebar-brand-logo"
          />
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span
                className="sidebar-brand-title"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                Print-Fy
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="sidebar-toggle-btn"
          aria-label={isCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse to icons'}
        >
          {isCollapsed ? (
            <ChevronRightIcon size={16} color="#ffffff" />
          ) : (
            <ChevronLeftIcon size={16} color="#ffffff" />
          )}
        </button>
      </div>

      {/* Navigation Destinations */}
      <nav className="sidebar-destinations-nav">
        <ul className="sidebar-destinations-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li key={item.id} className="sidebar-item-wrapper">
                <button
                  type="button"
                  onClick={() => onSelectTab && onSelectTab(item.id)}
                  className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Active Indicator Bar (Figma Node 206:950) */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="sidebar-active-indicator"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}

                  <div className="sidebar-btn-icon-wrapper">
                    <Icon
                      size={18}
                      color={isActive ? (item.isAi ? '#f4c453' : '#ec11bc') : (item.isAi ? '#f4c453' : '#f1eef1')}
                      className="sidebar-btn-icon"
                    />
                  </div>

                  {/* Function Name Text Label (hidden when collapsed) */}
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.span
                        className="sidebar-btn-label"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.18 }}
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        {item.label}
                        {item.isAi && (
                          <span
                            style={{
                              marginLeft: '6px',
                              background: '#f4c453',
                              color: '#1a1a1a',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              padding: '1px 5px',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            AI
                          </span>
                        )}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Floating tooltip in collapsed mode */}
                  {isCollapsed && (
                    <span className="sidebar-collapsed-tooltip" role="tooltip">
                      {item.label}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Navigation: Log Out */}
      <div className="sidebar-footer">
        <button
          type="button"
          onClick={onLogout}
          className="sidebar-footer-btn sidebar-logout-btn"
          title="Log Out of Print-Fy"
        >
          <LogoutIcon size={18} color="#f87171" />
          {!isCollapsed && (
            <span className="sidebar-footer-label logout-label">Log Out</span>
          )}
          {isCollapsed && (
            <span className="sidebar-collapsed-tooltip" role="tooltip">
              Log Out
            </span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
