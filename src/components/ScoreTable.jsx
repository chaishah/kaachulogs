import React from 'react';
import { Table, Edit2, Check, X } from 'lucide-react';
import { getSuitInfo } from '../utils/kaachuRules';

export default function ScoreTable({ rounds, players, onEditRound, currentRoundIndex }) {
  return (
    <div className="glass-card" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Table size={20} color="var(--accent-primary)" />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800 }}>
            Scorecard Matrix
          </h2>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          Tap row to jump/edit
        </span>
      </div>

      <div className="score-table-wrapper">
        <table className="score-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>R#</th>
              <th>Suit</th>
              <th>Cards</th>
              {players.map(p => (
                <th key={p.id}>{p.name}</th>
              ))}
              <th style={{ width: '45px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((round, idx) => {
              const suit = getSuitInfo(round.suitId);
              const dealer = players[round.dealerIndex] || players[0];
              const isCurrent = idx === currentRoundIndex;

              return (
                <tr
                  key={round.roundNumber}
                  style={{
                    background: isCurrent ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                    cursor: 'pointer'
                  }}
                  onClick={() => onEditRound(idx)}
                >
                  <td style={{ fontWeight: 700 }}>
                    {round.roundNumber}
                    {isCurrent && <span style={{ color: 'var(--accent-primary)', marginLeft: '2px' }}>●</span>}
                  </td>
                  <td>
                    <span style={{ color: suit.color, fontWeight: 800 }}>
                      {suit.symbol}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{round.cardsDealt}</td>

                  {players.map(p => {
                    const res = round.results ? round.results[p.id] : null;
                    const isDealer = p.id === dealer.id;

                    if (!round.completed || !res) {
                      return (
                        <td key={p.id} style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {isDealer ? '🃏 (Dealer)' : '-'}
                        </td>
                      );
                    }

                    return (
                      <td key={p.id}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {res.bid} {res.tricksWon !== null ? `(${res.tricksWon})` : ''}
                          </span>
                          <span className={res.madeBid ? 'cell-pass' : 'cell-fail'} style={{ fontSize: '0.9rem' }}>
                            +{res.score}
                          </span>
                        </div>
                      </td>
                    );
                  })}

                  <td>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditRound(idx);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <Edit2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
