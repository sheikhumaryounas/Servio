import React from 'react';
import { LogOut, User } from 'lucide-react';

export default function Header({ 
  user, 
  providerProfile,
  activeTab, 
  setActiveTab, 
  theme, 
  setTheme, 
  setIsProfileModalOpen, 
  logout 
}) {
  // Derive display title: providers see their trade, customers see "Customer"
  const userTitle = user?.role === 'provider' && providerProfile?.serviceType?.length
    ? providerProfile.serviceType.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' / ')
    : 'Customer';

  // Pick badge color by role
  const badgeColor = user?.role === 'provider' ? 'var(--color-primary)' : 'var(--color-secondary)';
  return (
    <header className="glass app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Classy Local Service Concierge</span>
        </div>
      </div>

      {/* Tab view controllers for simulation role swapping */}
      <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '4px' }}>
        <button 
          onClick={() => setActiveTab('customer')}
          style={{
            padding: '6px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'customer' ? 'var(--color-secondary)' : 'transparent',
            color: 'white',
            fontSize: '13px'
          }}
        >Customer View</button>
        <button 
          onClick={() => setActiveTab('provider')}
          style={{
            padding: '6px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'provider' ? 'var(--color-primary)' : 'transparent',
            color: 'white',
            fontSize: '13px'
          }}
        >Provider View</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Theme Selector */}
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            color: 'var(--text-main)',
            outline: 'none'
          }}
        >
          <option value="light">☀️ Light</option>
          <option value="dark">🌙 Dark</option>
          <option value="system">💻 System</option>
        </select>

        {/* User avatar button */}
        <div 
          onClick={() => setIsProfileModalOpen(true)}
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
          padding: '8px',
          borderRadius: '50%',
          color: 'var(--color-danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
