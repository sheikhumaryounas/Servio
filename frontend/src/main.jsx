import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('🔴 Servio App Crash:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'Inter, sans-serif', padding: '20px'
        }}>
          <div style={{
            background: '#fff', border: '1px solid #e9ecef', borderRadius: '12px',
            padding: '32px', maxWidth: '500px', width: '100%', textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#333', marginBottom: '8px' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#4f46e5', color: '#fff', border: 'none',
                padding: '10px 24px', borderRadius: '8px', fontSize: '14px',
                fontWeight: '600', cursor: 'pointer'
              }}
            >
              🔄 Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

