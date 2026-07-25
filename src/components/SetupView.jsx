import React, { useState } from 'react';
import { Users, Plus, Trash2, ArrowUp, ArrowDown, Play, ShieldAlert, Settings2 } from 'lucide-react';
import { SUITS } from '../utils/kaachuRules';

export default function SetupView({ onStartGame }) {
  const [players, setPlayers] = useState([
    { id: '1', name: 'Player 1' },
    { id: '2', name: 'Player 2' },
    { id: '3', name: 'Player 3' },
    { id: '4', name: 'Player 4' },
  ]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [structure, setStructure] = useState('up-down'); // 'up-down' | 'down' | 'up'
  const [includeNoTrump, setIncludeNoTrump] = useState(true);
  const [isHookEnabled, setIsHookEnabled] = useState(true);
  const [baseSuccessPoints, setBaseSuccessPoints] = useState(10);
  const [penaltyMode, setPenaltyMode] = useState('zero');

  const maxCardsCalculated = Math.max(1, Math.floor(52 / Math.max(1, players.length)));
  const [maxCardsInput, setMaxCardsInput] = useState(String(maxCardsCalculated));

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    const name = newPlayerName.trim();
    const updated = [...players, { id: Date.now().toString(), name }];
    setPlayers(updated);
    setNewPlayerName('');
    const newMax = Math.floor(52 / updated.length);
    setMaxCardsInput(String(newMax));
  };

  const handleRemovePlayer = (id) => {
    if (players.length <= 2) {
      alert('At least 2 players are required!');
      return;
    }
    const updated = players.filter(p => p.id !== id);
    setPlayers(updated);
    const newMax = Math.floor(52 / updated.length);
    setMaxCardsInput(String(newMax));
  };

  const handleMovePlayer = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= players.length) return;
    const updated = [...players];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setPlayers(updated);
  };

  const handleStart = () => {
    if (players.length < 2) {
      alert('Please add at least 2 players.');
      return;
    }

    const parsedMax = parseInt(maxCardsInput, 10);
    const finalMaxCards = isNaN(parsedMax) || parsedMax < 1 ? maxCardsCalculated : Math.min(13, parsedMax);

    onStartGame({
      players,
      structure,
      maxCards: finalMaxCards,
      includeNoTrump,
      isHookEnabled,
      baseSuccessPoints: Number(baseSuccessPoints) || 10,
      penaltyMode
    });
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Title Banner */}
      <div className="glass-card" style={{ textAlign: 'center', padding: '20px 16px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Kaachuful Setup
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Set players in seating order around your table
        </p>
      </div>

      {/* Players Card */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="var(--accent-primary)" />
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 700 }}>
              Players Seating Order ({players.length})
            </h3>
          </div>
        </div>

        {/* Add Player Input */}
        <form onSubmit={handleAddPlayer} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <input
            type="text"
            placeholder="Enter player name..."
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            style={{
              flex: 1,
              background: '#f6f3eb',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <button type="submit" className="btn-secondary">
            <Plus size={18} /> Add
          </button>
        </form>

        {/* Players List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {players.map((p, idx) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#faf8f5',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: 'var(--radius-full)',
                  background: idx === 0 ? '#d97706' : '#e7e2d7',
                  color: idx === 0 ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {idx + 1}
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.98rem' }}>{p.name}</span>
                {idx === 0 && <span className="dealer-badge">First Dealer</span>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <button
                  type="button"
                  onClick={() => handleMovePlayer(idx, -1)}
                  disabled={idx === 0}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', opacity: idx === 0 ? 0.2 : 1, cursor: 'pointer', padding: '4px' }}
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMovePlayer(idx, 1)}
                  disabled={idx === players.length - 1}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', opacity: idx === players.length - 1 ? 0.2 : 1, cursor: 'pointer', padding: '4px' }}
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemovePlayer(p.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '4px', marginLeft: '4px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rules & Max Cards Selection Card */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Settings2 size={18} color="var(--accent-primary)" />
          <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 700 }}>
            Game Rules & Cards
          </h3>
        </div>

        {/* Round Pattern */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
            Round Pattern
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { id: 'up-down', label: '1 ➔ Max ➔ 1', desc: 'Up & Down' },
              { id: 'down', label: 'Max ➔ 1', desc: 'Descending' },
              { id: 'up', label: '1 ➔ Max', desc: 'Ascending' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStructure(opt.id)}
                style={{
                  padding: '10px 6px',
                  borderRadius: 'var(--radius-md)',
                  border: structure === opt.id ? '2px solid #1c1917' : '1px solid var(--border-card)',
                  background: structure === opt.id ? '#1c1917' : '#faf8f5',
                  color: structure === opt.id ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <div>{opt.label}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 500, opacity: 0.7 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Direct Typeable Max Cards Input & Quick Digit Buttons */}
        <div style={{ marginBottom: '16px', background: '#faf8f5', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block' }}>
                Max Cards Per Round
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Type any number (1 - 13):
              </span>
            </div>

            {/* Direct Number Input Box */}
            <input
              type="number"
              min="1"
              max="13"
              value={maxCardsInput}
              onChange={(e) => setMaxCardsInput(e.target.value)}
              style={{
                width: '64px',
                background: '#ffffff',
                border: '2px solid #1c1917',
                borderRadius: 'var(--radius-md)',
                padding: '6px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontWeight: 800,
                fontSize: '1.2rem',
                textAlign: 'center',
                outline: 'none'
              }}
            />
          </div>

          {/* Quick Digit Selector Buttons (1 to 13) */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((num) => (
              <button
                key={num}
                type="button"
                className={`digit-chip ${maxCardsInput === String(num) ? 'active' : ''}`}
                onClick={() => setMaxCardsInput(String(num))}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Suit Rotation & No Trump Toggle */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Gujarati Suits (KAACHUFUL)</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={includeNoTrump}
                onChange={(e) => setIncludeNoTrump(e.target.checked)}
              />
              Include No Trump (NT)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {SUITS.filter(s => includeNoTrump || s.id !== 'NT').map(suit => (
              <span key={suit.id} className={`suit-badge suit-${suit.id}`} style={{ fontSize: '0.82rem', padding: '4px 10px' }}>
                {suit.symbol} {suit.name}
              </span>
            ))}
          </div>
        </div>

        {/* Dealer Hook Rule Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          background: '#faf8f5',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-card)'
        }}>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={16} color="var(--accent-warning)" />
              Dealer Hook Rule
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Dealer cannot bid a number making total bids equal to cards dealt.
            </div>
          </div>
          <input
            type="checkbox"
            checked={isHookEnabled}
            onChange={(e) => setIsHookEnabled(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Start Button */}
      <button className="btn-primary" onClick={handleStart} style={{ padding: '16px' }}>
        <Play size={20} fill="#f6f3eb" /> Start Kaachuful Game
      </button>
    </div>
  );
}
