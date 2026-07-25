import React from 'react';
import { RotateCcw, Award, PlayCircle, HelpCircle } from 'lucide-react';

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
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
        }}>
          ♠️
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.35rem',
            fontWeight: 800,
            lineHeight: 1.1
          }}>
            Kaachu<span className="text-gradient">Logs</span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Judgment Score Keeper
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {gameActive && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-card)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--text-secondary)'
          }}>
            R {currentRound}/{totalRounds}
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
