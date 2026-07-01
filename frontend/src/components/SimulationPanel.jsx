import React from 'react';
import { Play, Pause } from 'lucide-react';

export default function SimulationPanel({
  isSimulating,
  handleStartSimulation
}) {
  return (
    <div className="glass simulation-panel">
      <div>
        <h4 style={{ fontSize: '13px', fontWeight: 'bold' }}>Simulation panel</h4>
        <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          {isSimulating ? 'Simulating active providers nearby' : 'Deploy fake providers in Karachi'}
        </p>
      </div>

      <button 
        onClick={handleStartSimulation}
        style={{
          backgroundColor: isSimulating ? 'var(--color-danger)' : 'var(--color-primary)',
          color: 'white',
          border: 'none',
          padding: '8px 14px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        {isSimulating ? (
          <>
            <Pause size={12} /> Reset
          </>
        ) : (
          <>
            <Play size={12} /> Simulate Providers
          </>
        )}
      </button>
    </div>
  );
}
