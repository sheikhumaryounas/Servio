import React from 'react';
import { LogOut, User, Bell, Menu, X } from 'lucide-react';

export default function Header({ 
  user, 
  providerProfile,
  activePage,
  setActivePage,
  handleNavigateToWallet,
  activeTab, 
  setActiveTab, 
  theme, 
  setTheme, 
  setIsProfileModalOpen, 
  logout,
  language = 'en',
  translations = {},
  notifications = [],
  setNotifications
}) {
  const dict = translations[language] || {};
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Derive display title: providers see their trade, customers see "Customer"
  const userTitle = user?.role === 'provider' && providerProfile?.serviceType?.length
    ? providerProfile.serviceType.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' / ')
    : (dict.customer || 'Customer');

  // Pick badge color by role
  const badgeColor = user?.role === 'provider' ? 'var(--color-primary)' : 'var(--color-secondary)';

  const navPages = [
    { id: 'home', label: dict.navHome || 'Home' },
    { id: 'booking', label: user?.role === 'provider' ? (dict.activeConsole || 'Console') : (dict.bookService || 'Book') },
    { id: 'dashboard', label: dict.navDashboard || 'Dashboard' },
    { id: 'requests', label: dict.navRequests || 'Requests' },
    { id: 'estimator', label: dict.navEstimator || 'Estimator' },
    { id: 'settings', label: dict.navSettings || 'Settings' },
    { id: 'about', label: dict.navAbout || 'About' },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: dict.adminConsole || 'Admin' }] : [])
  ];

  return (
    <header className="glass app-header" style={{ position: 'relative', flexWrap: 'wrap', gap: '10px' }}>
      {/* ── Brand Logo ── */}
      <div 
        onClick={() => setActivePage('home')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}
      >
        <img 
          src="/logo_icon.png" 
          alt="Servio Logo" 
          style={{ width: '34px', height: '34px', borderRadius: '8px' }} 
        />
        <div>
          <h1 style={{ fontSize: '17px', fontWeight: '800', lineHeight: 1.1, color: 'var(--color-primary)' }}>Servio</h1>
          <span className="header-tagline-text" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {dict.headerTagline || 'Classy Local Service Concierge'}
          </span>
        </div>
      </div>

      {/* ── Desktop Navigation Tabs (hidden on mobile) ── */}
      <div className="page-tabs header-desktop-nav" style={{ flex: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
        {navPages.map((page) => (
          <button
            key={page.id}
            type="button"
            onClick={() => { setActivePage(page.id); setIsMobileMenuOpen(false); }}
            className={`nav-pill ${activePage === page.id ? 'active' : ''}`}
          >
            {page.label}
          </button>
        ))}
      </div>

      {/* ── Right-side Actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>

        {/* View Switcher */}
        <div className="view-switcher header-view-switcher">
          <button
            type="button"
            onClick={() => setActiveTab('customer')}
            className={activeTab === 'customer' ? 'nav-pill active' : 'nav-pill'}
          >{dict.customerView || 'Customer'}</button>
          <button
            type="button"
            onClick={() => setActiveTab('provider')}
            className={activeTab === 'provider' ? 'nav-pill active' : 'nav-pill'}
          >{dict.providerView || 'Provider'}</button>
        </div>

        {/* Profile & Wallet */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div 
            onClick={() => setActivePage('settings')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: '20px',
              transition: 'background-color 0.2s',
              flexShrink: 0
            }}
          >
            {user?.profilePic ? (
              <img 
                src={user.profilePic} 
                alt="Profile" 
                style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-primary)', flexShrink: 0 }} 
              />
            ) : (
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', color: 'var(--text-muted)', flexShrink: 0 }}>
                <User size={15} />
              </div>
            )}
            <div className="header-user-text" style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', lineHeight: 1.1 }}>{user?.name}</p>
              <span style={{
                fontSize: '10px', fontWeight: '700', color: 'white',
                backgroundColor: badgeColor, padding: '1px 6px',
                borderRadius: '20px', display: 'inline-block',
                marginTop: '2px', letterSpacing: '0.03em', textTransform: 'capitalize'
              }}>{userTitle}</span>
            </div>
          </div>

          {/* Wallet Balance Pill */}
          <div 
            onClick={handleNavigateToWallet || (() => setActivePage('settings'))}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '20px', padding: '3px 8px', cursor: 'pointer',
              fontSize: '11px', fontWeight: 'bold', color: 'var(--color-primary)'
            }}
          >
            <span>💳</span>
            <span>{user?.walletBalance !== undefined ? user.walletBalance.toLocaleString() : '5,000'} PKR</span>
          </div>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
          <button 
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="glass"
            style={{
              width: '38px', height: '38px', padding: '0', borderRadius: '50%',
              color: 'var(--text-main)', border: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
              backgroundColor: isNotifOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              minHeight: 'unset', boxShadow: 'none'
            }}
            title="Notifications"
          >
            <Bell size={17} />
            {notifications.filter(n => !n.read).length > 0 && (
              <span style={{
                position: 'absolute', top: '0px', right: '0px',
                width: '9px', height: '9px', borderRadius: '50%',
                backgroundColor: 'var(--color-danger)',
                border: '2px solid rgba(15, 23, 42, 0.95)',
                boxShadow: '0 0 6px var(--color-danger)'
              }}></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="glass scrollbar-custom header-notifications-dropdown" style={{
              maxHeight: '380px', overflowY: 'auto',
              borderRadius: '16px', border: '1px solid var(--border-color)',
              padding: '14px', zIndex: 9999,
              display: 'flex', flexDirection: 'column', gap: '10px',
              boxShadow: 'var(--shadow-lg)',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(16px)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'white' }}>
                  {dict.notificationsTitle || "Notifications"} ({notifications.filter(n => !n.read).length})
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button 
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                    style={{ fontSize: '10px', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0, minHeight: 'unset', boxShadow: 'none' }}
                  >Mark All Read</button>
                  <span style={{ fontSize: '10px', color: 'var(--border-color)' }}>|</span>
                  <button 
                    onClick={() => setNotifications([])}
                    style={{ fontSize: '10px', background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: 0, minHeight: 'unset', boxShadow: 'none' }}
                  >Clear All</button>
                  <span style={{ fontSize: '10px', color: 'var(--border-color)' }}>|</span>
                  <button 
                    onClick={() => setIsNotifOpen(false)}
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.08)', 
                      border: '1px solid var(--border-color)', 
                      color: 'var(--text-muted)', 
                      cursor: 'pointer', 
                      padding: '4px', 
                      borderRadius: '50%',
                      minHeight: 'unset', 
                      boxShadow: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      width: '22px',
                      height: '22px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                      e.currentTarget.style.color = 'var(--color-danger)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                    title="Close"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '12px' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map(notif => {
                    const statusColor = 
                      notif.type === 'success' ? 'var(--color-success)' :
                      notif.type === 'warning' ? 'var(--color-warning)' :
                      notif.type === 'danger' ? 'var(--color-danger)' :
                      'var(--color-primary)';
                    return (
                      <div 
                        key={notif.id}
                        onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                        style={{
                          padding: '8px 10px', borderRadius: '8px',
                          backgroundColor: notif.read ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
                          borderLeft: `3px solid ${statusColor}`,
                          display: 'flex', flexDirection: 'column', gap: '3px',
                          cursor: 'pointer', transition: 'background-color 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: notif.read ? 'var(--text-muted)' : 'white' }}>{notif.title}</span>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.2' }}>{notif.message}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Hamburger Menu (mobile only) */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="glass header-hamburger"
          style={{
            width: '38px', height: '38px', padding: '0', borderRadius: '50%',
            color: 'var(--text-main)', border: '1px solid var(--border-color)',
            display: 'none', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', minHeight: 'unset', boxShadow: 'none', flexShrink: 0
          }}
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Logout */}
        <button onClick={logout} className="glass" style={{
          width: '38px', height: '38px', padding: '0', borderRadius: '50%',
          color: 'var(--color-danger)', border: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s', minHeight: 'unset', boxShadow: 'none', flexShrink: 0
        }}>
          <LogOut size={17} />
        </button>
      </div>

      {/* ── Mobile Navigation Drawer ── */}
      {isMobileMenuOpen && (
        <div className="header-mobile-nav" style={{
          width: '100%', borderTop: '1px solid var(--border-color)',
          paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px'
        }}>
          {/* Page Nav */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {navPages.map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => { setActivePage(page.id); setIsMobileMenuOpen(false); }}
                className={`nav-pill ${activePage === page.id ? 'active' : ''}`}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                {page.label}
              </button>
            ))}
          </div>
          {/* View Switcher in drawer */}
          <div style={{ display: 'flex', gap: '6px', paddingTop: '6px', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={() => { setActiveTab('customer'); setIsMobileMenuOpen(false); }}
              className={activeTab === 'customer' ? 'nav-pill active' : 'nav-pill'}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >{dict.customerView || 'Customer View'}</button>
            <button
              type="button"
              onClick={() => { setActiveTab('provider'); setIsMobileMenuOpen(false); }}
              className={activeTab === 'provider' ? 'nav-pill active' : 'nav-pill'}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >{dict.providerView || 'Provider View'}</button>
          </div>
        </div>
      )}
    </header>
  );
}
