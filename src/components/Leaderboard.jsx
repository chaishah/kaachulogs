import React from 'react';
import { Crown, Flame, Award, TrendingUp } from 'lucide-react';

export default function Leaderboard({ players, totals, stats }) {
  // Sort players by total score descending
  const sortedPlayers = [...players].sort((a, b) => (totals[b.id] || 0) - (totals[a.id] || 0));
  const topScore = totals[sortedPlayers[0]?.id] || 0;

  return (
    <div className="glass-card" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Crown size={22} color="var(--accent-warning)" />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800 }}>
            Current Standings
          </h2>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {players.length} Players
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sortedPlayers.map((player, index) => {
          const score = totals[player.id] || 0;
          const pStats = stats[player.id] || { bidsMade: 0, roundsPlayed: 0, currentStreak: 0 };
          const diffFromLeader = topScore - score;
          const successRate = pStats.roundsPlayed > 0 ? Math.round((pStats.bidsMade / pStats.roundsPlayed) * 100) : 0;

          let rankClass = 'rank-other';
          if (index === 0) rankClass = 'rank-1';
          else if (index === 1) rankClass = 'rank-2';
          else if (index === 2) rankClass = 'rank-3';

          return (
            <div key={player.id} className={`leaderboard-row ${rankClass}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="rank-pill">
                  {index === 0 ? <Crown size={16} /> : index + 1}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)' }}>
                      {player.name}
                    </strong>
                    {pStats.currentStreak >= 2 && (
                      <span style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#fca5a5',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-full)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        <Flame size={12} color="#ef4444" /> {pStats.currentStreak} 🔥
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                    <span>Accuracy: {successRate}%</span>
                    <span>•</span>
                    <span>Made: {pStats.bidsMade}/{pStats.roundsPlayed}</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: index === 0 ? 'var(--accent-warning)' : 'var(--text-primary)'
                }}>
                  {score}
                </div>
                {index > 0 && diffFromLeader > 0 && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    -{diffFromLeader} pts
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
