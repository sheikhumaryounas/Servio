import React from 'react';

export default function CameraModal({
  isOpen,
  onClose,
  videoRef,
  capturePhoto,
  title = "📷 Capture Photo",
  capturedPreview = null,
  onConfirmCapture,
  onRetakeCapture
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
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass font-sans" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: 'var(--text-main)' }}>{title}</h3>
        {capturedPreview ? (
          <>
            <div style={{
              width: '100%',
              aspectRatio: '4/3',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#000',
              border: '1px solid var(--border-color)',
              position: 'relative'
            }}>
              <img
                src={capturedPreview}
                alt="Captured preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '8px' }}>
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
                type="button"
                onClick={onRetakeCapture}
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
              >Retake</button>
              <button
                type="button"
                onClick={onConfirmCapture}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >Use Photo</button>
            </div>
          </>
        ) : (
          <>
            <div style={{
              width: '100%',
              aspectRatio: '4/3',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#000',
              border: '1px solid var(--border-color)',
              position: 'relative'
            }}>
              <video 
                ref={videoRef} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                playsInline
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '8px' }}>
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
                type="button"
                onClick={capturePhoto}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >Capture</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
