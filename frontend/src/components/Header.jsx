import React from 'react';
import { LogOut, User } from 'lucide-react';

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
  translations = {}
}) {
  const dict = translations[language] || {};

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
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '18px',
          color: 'white'
        }}>⚡</div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '800', lineHeight: 1.1, color: 'var(--color-primary)' }}>Servio</h1>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{dict.headerTagline || 'Classy Local Service Concierge'}</span>
        </div>
      </div>

      <div className="header-actions">
        <div className="page-tabs">
          {[
            { id: 'home', label: dict.navHome || 'Home' },
            { id: 'dashboard', label: dict.navDashboard || 'Dashboard' },
            { id: 'requests', label: dict.navRequests || 'Requests' },
            { id: 'estimator', label: dict.navEstimator || 'Estimator' },
            { id: 'settings', label: dict.navSettings || 'Settings' },
            { id: 'about', label: dict.navAbout || 'About' },
            ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin Console' }] : [])
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Wallet Balance Pill */}
          <div 
            onClick={handleNavigateToWallet || (() => setActivePage('settings'))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '20px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              color: 'var(--color-primary)'
            }}
          >
            <span>💳</span>
            <span>{user?.walletBalance !== undefined ? user.walletBalance.toLocaleString() : '5,000'} PKR</span>
          </div>

          {/* User avatar button */}
          <div 
            onClick={() => setActivePage('settings')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '20px',
              transition: 'background-color 0.2s'
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
                  border: '1px solid var(--color-primary)' 
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
                color: 'var(--text-muted)'
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
      </div>
    </header>
  );
}
