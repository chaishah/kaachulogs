import React from 'react';
import { RotateCcw, HelpCircle } from 'lucide-react';

export default function Header({ gameActive, onNewGame, currentRound, totalRounds, onShowRules }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 4px 16px 4px',
      marginBottom: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: '#1c1917',
          color: '#f6f3eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          ♠️
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.4rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1.1
          }}>
            Kaachu<span style={{ color: '#b91c1c' }}>Logs</span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Judgment Score Keeper
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {gameActive && (
          <div style={{
            background: '#faf8f5',
            border: '1px solid var(--border-card)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            Round {currentRound}/{totalRounds}
          </div>
        )}

        <button 
          className="btn-secondary" 
          onClick={onShowRules} 
          title="Game Rules"
          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
        >
          <HelpCircle size={16} />
        </button>

        {gameActive && (
          <button 
            className="btn-secondary" 
            onClick={onNewGame}
            title="New Game"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>
    </header>
  );
}
