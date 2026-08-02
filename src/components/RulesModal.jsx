import React from 'react';
import { X, BookOpen, ShieldAlert, Award } from 'lucide-react';
import { SUITS } from '../utils/kaachuRules';

export default function RulesModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ textAlign: 'left', maxWidth: '520px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={22} color="var(--accent-primary)" />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800 }}>
              Kaachuful Rules
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '4px' }}>
              1. Suit Order (KAACHUFUL)
            </h4>
            <p>The name <strong>KAACHUFUL</strong> comes from the standard Gujarati suit sequence:</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {SUITS.map(s => (
                <span key={s.id} className={`suit-badge suit-${s.id}`} style={{ fontSize: '0.8rem', padding: '4px 8px' }}>
                  {s.symbol} {s.name} ({s.code})
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '4px' }}>
              2. Round & Card Progression
            </h4>
            <p>
              In Up & Down mode, game starts with 1 card dealt per player, increasing by 1 each round up to maximum (e.g., 13 cards for 4 players), then decreases back down to 1 card.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '4px' }}>
              3. Bidding & The Hook Rule
            </h4>
            <p>
              Before playing cards, every player bids the exact number of tricks they expect to win.
            </p>
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              marginTop: '6px',
              fontSize: '0.85rem'
            }}>
              <strong style={{ color: '#fcd34d' }}>The Dealer Hook:</strong> The final bidder (the dealer) cannot make a bid that causes the sum of all bids to equal the total cards dealt in that round. This guarantees at least one player fails!
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '4px' }}>
              4. Scoring System
            </h4>
            <ul style={{ paddingLeft: '20px' }}>
              <li><strong>Exact Bid:</strong> Score <code>10</code> points for bids of 0 or 1. Bids of 2 or more score <code>Bid × 10</code> points (e.g. Bid 0/1 = 10 pts; Bid 2 = 20 pts; Bid 3 = 30 pts).</li>
              <li><strong>Missed Bid:</strong> Score <code>0</code> points (win more or fewer tricks than bid).</li>
            </ul>
          </div>
        </div>

        <button className="btn-primary" onClick={onClose} style={{ marginTop: '20px', padding: '12px' }}>
          Got It!
        </button>
      </div>
    </div>
  );
}
