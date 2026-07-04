import React from 'react';
import { LogOut, User, Bell } from 'lucide-react';

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

  // Derive display title: providers see their trade, customers see "Customer"
  const userTitle = user?.role === 'provider' && providerProfile?.serviceType?.length
    ? providerProfile.serviceType.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' / ')
    : (dict.customer || 'Customer');

  // Pick badge color by role
  const badgeColor = user?.role === 'provider' ? 'var(--color-primary)' : 'var(--color-secondary)';
  return (
    <header className="glass app-header">
      <div 
        onClick={() => setActivePage('home')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
      >
        <img 
          src="/logo_icon.png" 
          alt="Servio Logo" 
          style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '8px'
          }} 
        />
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '800', lineHeight: 1.1, color: 'var(--color-primary)' }}>Servio</h1>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{dict.headerTagline || 'Classy Local Service Concierge'}</span>
        </div>
      </div>

      <div className="page-tabs">
        {[
          { id: 'home', label: dict.navHome || 'Home' },
          { id: 'booking', label: user?.role === 'provider' ? (dict.activeConsole || 'Active Console') : (dict.bookService || 'Book Service') },
          { id: 'dashboard', label: dict.navDashboard || 'Dashboard' },
          { id: 'requests', label: dict.navRequests || 'Requests' },
          { id: 'estimator', label: dict.navEstimator || 'Estimator' },
          { id: 'settings', label: dict.navSettings || 'Settings' },
          { id: 'about', label: dict.navAbout || 'About' },
          ...(user?.role === 'admin' ? [{ id: 'admin', label: dict.adminConsole || 'Admin Console' }] : [])
        ].map((page) => (
          <button
            key={page.id}
            type="button"
            onClick={() => setActivePage(page.id)}
            className={`nav-pill ${activePage === page.id ? 'active' : ''}`}
          >
            {page.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Customer & Provider View Switcher (moved to old profile/wallet area) */}
        <div className="view-switcher">
          <button
            type="button"
            onClick={() => setActiveTab('customer')}
            className={activeTab === 'customer' ? 'nav-pill active' : 'nav-pill'}
          >{dict.customerView || 'Customer View'}</button>
          <button
            type="button"
            onClick={() => setActiveTab('provider')}
            className={activeTab === 'provider' ? 'nav-pill active' : 'nav-pill'}
          >{dict.providerView || 'Provider View'}</button>
        </div>

        {/* Profile & Wallet vertical stack */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          {/* User avatar button (Top) */}
          <div 
            onClick={() => setActivePage('settings')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              cursor: 'pointer',
              padding: '2px 8px',
              borderRadius: '20px',
              transition: 'background-color 0.2s',
              flexShrink: 0
            }}
          >
            {user?.profilePic ? (
              <img 
                src={user.profilePic} 
                alt="Profile" 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  border: '1px solid var(--color-primary)',
                  flexShrink: 0
                }} 
              />
            ) : (
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--bg-secondary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                flexShrink: 0
              }}>
                <User size={16} />
              </div>
            )}
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', lineHeight: 1.1 }}>{user?.name}</p>
              <span style={{
                fontSize: '10px',
                fontWeight: '700',
                color: 'white',
                backgroundColor: badgeColor,
                padding: '1px 7px',
                borderRadius: '20px',
                display: 'inline-block',
                marginTop: '3px',
                letterSpacing: '0.03em',
                textTransform: 'capitalize'
              }}>{userTitle}</span>
            </div>
          </div>

          {/* Wallet Balance Pill (Directly below Profile) */}
          <div 
            onClick={handleNavigateToWallet || (() => setActivePage('settings'))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '20px',
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              color: 'var(--color-primary)'
            }}
          >
            <span>💳</span>
            <span>{user?.walletBalance !== undefined ? user.walletBalance.toLocaleString() : '5,000'} PKR</span>
          </div>
        </div>

        {/* Notifications Icon & Dropdown */}
        <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
          <button 
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="glass"
            style={{
              width: '40px',
              height: '40px',
              padding: '0',
              borderRadius: '50%',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s',
              backgroundColor: isNotifOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              minHeight: 'unset',
              boxShadow: 'none'
            }}
            title="Notifications"
          >
            <Bell size={18} />
            {notifications.filter(n => !n.read).length > 0 && (
              <span style={{
                position: 'absolute',
                top: '0px',
                right: '0px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-danger)',
                border: '2px solid rgba(15, 23, 42, 0.95)',
                boxShadow: '0 0 8px var(--color-danger)'
              }}></span>
            )}
          </button>

          {/* Notifications Dropdown list */}
          {isNotifOpen && (
            <div className="glass scrollbar-custom" style={{
              position: 'absolute',
              top: '48px',
              right: '0',
              width: '320px',
              maxHeight: '380px',
              overflowY: 'auto',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              padding: '14px',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: 'var(--shadow-lg)',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(16px)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'white' }}>
                  {dict.notificationsTitle || "Notifications"} ({notifications.filter(n => !n.read).length})
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    }}
                    style={{ fontSize: '10px', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0, minHeight: 'unset', boxShadow: 'none' }}
                  >
                    Mark All Read
                  </button>
                  <span style={{ fontSize: '10px', color: 'var(--border-color)' }}>|</span>
                  <button 
                    onClick={() => {
                      setNotifications([]);
                    }}
                    style={{ fontSize: '10px', background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: 0, minHeight: 'unset', boxShadow: 'none' }}
                  >
                    Clear All
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
                        onClick={() => {
                          setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                        }}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          backgroundColor: notif.read ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
                          borderLeft: `3px solid ${statusColor}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
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

        {/* Logout action */}
        <button onClick={logout} className="glass" style={{
          width: '40px',
          height: '40px',
          padding: '0',
          borderRadius: '50%',
          color: 'var(--color-danger)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
