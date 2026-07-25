import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, RefreshCw, X } from 'lucide-react';

export default function WinnerModal({ players, totals, stats, onClose, onNewGame }) {
  const sortedPlayers = [...players].sort((a, b) => (totals[b.id] || 0) - (totals[a.id] || 0));
  const winner = sortedPlayers[0];
  const runnerUp = sortedPlayers[1];

  useEffect(() => {
    // Fire confetti celebration!
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Confetti effect failed', e);
    }
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ textAlign: 'center' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          boxShadow: '0 0 30px rgba(245, 158, 11, 0.5)'
        }}>
          <Trophy size={38} color="#fff" />
        </div>

        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>
          Game Over!
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Winner: <strong style={{ color: 'var(--accent-warning)', fontSize: '1.1rem' }}>{winner?.name}</strong> with {totals[winner?.id] || 0} pts! 🎉
        </p>

        {/* Podium Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {sortedPlayers.map((p, idx) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: idx === 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${idx === 0 ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-card)'}`,
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontWeight: 800,
                  color: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : '#b45309'
                }}>
                  #{idx + 1}
                </span>
                <strong style={{ fontSize: '1rem' }}>{p.name}</strong>
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem' }}>
                {totals[p.id] || 0} pts
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={onClose} style={{ flex: 1, padding: '14px' }}>
            View Final Scorecard
          </button>
          <button className="btn-primary" onClick={onNewGame} style={{ flex: 1, padding: '14px' }}>
            <RefreshCw size={18} /> Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
