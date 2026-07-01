import React from 'react';
import { User } from 'lucide-react';

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  editName,
  setEditName,
  editPhone,
  setEditPhone,
  editProfilePic,
  setEditProfilePic,
  handleProfileImageChange,
  startProfileCamera,
  handleSaveProfile,
  isEditSaving
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.85)',
      zIndex: 9990,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <form 
        onSubmit={handleSaveProfile}
        className="glass font-sans" 
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'var(--text-main)', textAlign: 'center' }}>👤 Edit Profile Settings</h3>
        
        {/* Profile Avatar Selection Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', margin: '10px 0' }}>
          <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-primary)' }}>
            {editProfilePic ? (
              <img src={editProfilePic} alt="Edit Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: 'var(--text-muted)' }}>👤</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              id="profile-image-upload"
              style={{ display: 'none' }}
            />
            <label
              htmlFor="profile-image-upload"
              className="glass"
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '11px',
                cursor: 'pointer',
                color: 'var(--text-main)',
                backgroundColor: 'var(--bg-secondary)',
                fontWeight: '600'
              }}
            >
              📁 File
            </label>
            <button
              type="button"
              onClick={startProfileCamera}
              className="glass"
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '11px',
                cursor: 'pointer',
                color: 'var(--text-main)',
                backgroundColor: 'var(--bg-secondary)',
                fontWeight: '600'
              }}
            >
              📷 Camera
            </button>
            {editProfilePic && (
              <button
                type="button"
                onClick={() => setEditProfilePic(null)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--color-danger)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>Full Name</label>
          <input 
            type="text" 
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="e.g. Umar Younas"
            required 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>Phone Number</label>
          <input 
            type="tel" 
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            placeholder="e.g. 0300-1234567"
            required 
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            className="glass"
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >Cancel</button>
          <button
            type="submit"
            disabled={isEditSaving}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {isEditSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
