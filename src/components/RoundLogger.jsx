import React, { useState, useEffect } from 'react';
import { Check, X, AlertTriangle, ArrowRight, ArrowLeft, Trophy } from 'lucide-react';
import { getSuitInfo, checkDealerHookViolation, calculatePlayerScore } from '../utils/kaachuRules';

export default function RoundLogger({ round, players, isHookEnabled, onSaveRound, onPreviousRound, isLastRound }) {
  const [phase, setPhase] = useState('bidding'); // 'bidding' | 'results'
  const [bids, setBids] = useState({});
  const [resultsMode, setResultsMode] = useState('quick'); // 'quick' (1-tap pass/fail) | 'exact' (tricks count)
  const [results, setResults] = useState({});

  const suitInfo = getSuitInfo(round.suitId);
  const dealerPlayer = players[round.dealerIndex] || players[0];
  const dealerPlayerId = dealerPlayer.id;

  // Initialize bids and results when round prop changes
  useEffect(() => {
    const initialBids = {};
    const initialResults = {};

    players.forEach(p => {
      initialBids[p.id] = round.bids[p.id] ?? 0;
      initialResults[p.id] = round.results[p.id] ?? {
        bid: round.bids[p.id] ?? 0,
        tricksWon: null,
        madeBid: true,
        score: calculatePlayerScore(round.bids[p.id] ?? 0, true)
      };
    });

    setBids(initialBids);
    setResults(initialResults);
    setPhase(round.completed ? 'results' : 'bidding');
  }, [round, players]);

  // Hook violation check for dealer
  const forbiddenDealerBid = isHookEnabled
    ? checkDealerHookViolation(bids, round.cardsDealt, dealerPlayerId, players.map(p => p.id))
    : null;

  const totalBids = Object.values(bids).reduce((a, b) => Number(a || 0) + Number(b || 0), 0);

  const handleBidChange = (playerId, newBid) => {
    const parsed = parseInt(newBid, 10);
    const val = isNaN(parsed) ? 0 : Math.max(0, Math.min(round.cardsDealt, parsed));
    setBids(prev => ({ ...prev, [playerId]: val }));
  };

  const handleQuickToggle = (playerId, made) => {
    const playerBid = bids[playerId] ?? 0;
    const score = calculatePlayerScore(playerBid, made);
    setResults(prev => ({
      ...prev,
      [playerId]: {
        bid: playerBid,
        tricksWon: made ? playerBid : null,
        madeBid: made,
        score
      }
    }));
  };

  const handleTricksChange = (playerId, tricks) => {
    const parsed = parseInt(tricks, 10);
    const tricksVal = isNaN(parsed) ? 0 : Math.max(0, Math.min(round.cardsDealt, parsed));
    const playerBid = bids[playerId] ?? 0;
    const made = playerBid === tricksVal;
    const score = calculatePlayerScore(playerBid, tricksVal);

    setResults(prev => ({
      ...prev,
      [playerId]: {
        bid: playerBid,
        tricksWon: tricksVal,
        madeBid: made,
        score
      }
    }));
  };

  const isDealerHookViolated = isHookEnabled && forbiddenDealerBid !== null && bids[dealerPlayerId] === forbiddenDealerBid;

  const handleProceedToResults = () => {
    if (isDealerHookViolated) {
      alert(`Dealer Hook Rule Violation! ${dealerPlayer.name} cannot bid ${forbiddenDealerBid} as it makes total bids equal to total cards (${round.cardsDealt}).`);
      return;
    }

    const updatedResults = { ...results };
    players.forEach(p => {
      const b = bids[p.id] ?? 0;
      if (!updatedResults[p.id]) {
        updatedResults[p.id] = {
          bid: b,
          tricksWon: b,
          madeBid: true,
          score: calculatePlayerScore(b, true)
        };
      } else {
        updatedResults[p.id].bid = b;
        updatedResults[p.id].score = calculatePlayerScore(b, updatedResults[p.id].madeBid);
      }
    });

    setResults(updatedResults);
    setPhase('results');
  };

  const handleSubmitRound = () => {
    if (resultsMode === 'exact') {
      let sumTricks = 0;
      players.forEach(p => {
        const t = results[p.id]?.tricksWon;
        if (t !== null && t !== undefined) sumTricks += Number(t);
      });

      if (sumTricks !== round.cardsDealt) {
        const confirmMsg = `Total tricks won (${sumTricks}) does not equal total cards dealt (${round.cardsDealt}). Submit anyway?`;
        if (!window.confirm(confirmMsg)) return;
      }
    }

    onSaveRound({
      bids,
      results
    });
  };

  // Generate array of numbers [0, 1, ..., cardsDealt] for direct digit tapping
  const digitOptions = Array.from({ length: round.cardsDealt + 1 }, (_, i) => i);

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Header Info Card */}
      <div className="glass-card" style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
              Round {round.roundNumber}
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800 }}>
              {round.cardsDealt} {round.cardsDealt === 1 ? 'Card' : 'Cards'} Dealt
            </h2>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontWeight: 600 }}>
              Trump Suit
            </span>
            <span className={`suit-badge suit-${suitInfo.id}`}>
              {suitInfo.symbol} {suitInfo.name}
            </span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-card)',
          fontSize: '0.88rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Dealer:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{dealerPlayer.name}</strong>
            <span className="dealer-badge">Dealer</span>
          </div>

          {phase === 'bidding' && (
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: totalBids === round.cardsDealt ? 'var(--accent-danger)' : 'var(--text-secondary)' }}>
              Total Bids: {totalBids}/{round.cardsDealt}
            </div>
          )}
        </div>

        {/* Dealer Hook Warning Banner */}
        {phase === 'bidding' && isHookEnabled && forbiddenDealerBid !== null && (
          <div style={{
            marginTop: '10px',
            padding: '8px 12px',
            background: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={16} color="#d97706" />
            <span>
              Dealer Hook Rule: <strong>{dealerPlayer.name}</strong> cannot bid <strong>{forbiddenDealerBid}</strong>.
            </span>
          </div>
        )}
      </div>

      {/* Phase Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <button
          className={`btn-secondary ${phase === 'bidding' ? 'active' : ''}`}
          onClick={() => setPhase('bidding')}
          style={{
            flex: 1,
            background: phase === 'bidding' ? '#1c1917' : '#faf8f5',
            borderColor: phase === 'bidding' ? '#1c1917' : 'var(--border-card)',
            color: phase === 'bidding' ? '#ffffff' : 'var(--text-secondary)'
          }}
        >
          1. Bids Entry
        </button>
        <button
          className={`btn-secondary ${phase === 'results' ? 'active' : ''}`}
          onClick={handleProceedToResults}
          style={{
            flex: 1,
            background: phase === 'results' ? '#1c1917' : '#faf8f5',
            borderColor: phase === 'results' ? '#1c1917' : 'var(--border-card)',
            color: phase === 'results' ? '#ffffff' : 'var(--text-secondary)'
          }}
        >
          2. Log Results
        </button>
      </div>

      {/* PHASE 1: BIDDING */}
      {phase === 'bidding' && (
        <div className="glass-card">
          <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px' }}>
            Select Bids for Round {round.roundNumber}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {players.map(p => {
              const isDealer = p.id === dealerPlayerId;
              const currentBid = bids[p.id] ?? 0;
              const isForbiddenForThisPlayer = isDealer && isHookEnabled && forbiddenDealerBid !== null && currentBid === forbiddenDealerBid;

              return (
                <div
                  key={p.id}
                  style={{
                    padding: '12px 14px',
                    background: isForbiddenForThisPlayer ? '#fef2f2' : '#faf8f5',
                    border: `1px solid ${isForbiddenForThisPlayer ? '#fca5a5' : 'var(--border-card)'}`,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{p.name}</span>
                      {isDealer && <span className="dealer-badge">Dealer</span>}
                    </div>

                    {/* Stepper + Direct Typeable Number Box */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        className="stepper-btn"
                        onClick={() => handleBidChange(p.id, currentBid - 1)}
                        disabled={currentBid <= 0}
                      >
                        -
                      </button>

                      <input
                        type="number"
                        min="0"
                        max={round.cardsDealt}
                        value={currentBid}
                        onChange={(e) => handleBidChange(p.id, e.target.value)}
                        style={{
                          width: '46px',
                          height: '40px',
                          background: '#ffffff',
                          border: `2px solid ${isForbiddenForThisPlayer ? 'var(--accent-danger)' : '#1c1917'}`,
                          borderRadius: 'var(--radius-md)',
                          color: isForbiddenForThisPlayer ? 'var(--accent-danger)' : 'var(--text-primary)',
                          fontFamily: 'var(--font-body)',
                          fontWeight: 800,
                          fontSize: '1.15rem',
                          textAlign: 'center',
                          outline: 'none'
                        }}
                      />

                      <button
                        className="stepper-btn"
                        onClick={() => handleBidChange(p.id, currentBid + 1)}
                        disabled={currentBid >= round.cardsDealt}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 1-Tap Quick Digit Buttons */}
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {digitOptions.map(num => (
                      <button
                        key={num}
                        type="button"
                        className={`digit-chip ${currentBid === num ? 'active' : ''}`}
                        onClick={() => handleBidChange(p.id, num)}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  {isForbiddenForThisPlayer && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', fontWeight: 700 }}>
                      ⚠️ Hook Rule Violation! Dealer cannot bid {forbiddenDealerBid}.
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <button
            className="btn-primary"
            onClick={handleProceedToResults}
            disabled={isDealerHookViolated}
            style={{ marginTop: '18px', padding: '14px', opacity: isDealerHookViolated ? 0.5 : 1 }}
          >
            Proceed to Log Results <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* PHASE 2: LOG RESULTS */}
      {phase === 'results' && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', fontWeight: 700 }}>
              Round Results
            </h3>

            {/* Mode selector */}
            <div style={{ display: 'flex', gap: '4px', background: '#f5f2e9', padding: '3px', borderRadius: 'var(--radius-md)' }}>
              <button
                type="button"
                onClick={() => setResultsMode('quick')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: resultsMode === 'quick' ? '#1c1917' : 'transparent',
                  color: resultsMode === 'quick' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                1-Tap Mode
              </button>
              <button
                type="button"
                onClick={() => setResultsMode('exact')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: resultsMode === 'exact' ? '#1c1917' : 'transparent',
                  color: resultsMode === 'exact' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Tricks Count
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {players.map(p => {
              const playerBid = bids[p.id] ?? 0;
              const res = results[p.id] || { bid: playerBid, madeBid: true, score: calculatePlayerScore(playerBid, true) };

              return (
                <div
                  key={p.id}
                  style={{
                    padding: '12px 14px',
                    background: '#faf8f5',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.98rem' }}>{p.name}</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                        Bid: <strong>{playerBid}</strong>
                      </span>
                    </div>

                    <div style={{
                      fontFamily: 'var(--font-body)',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      color: res.madeBid ? 'var(--accent-success)' : 'var(--text-muted)'
                    }}>
                      +{res.score || 0} pts
                    </div>
                  </div>

                  {/* 1-Tap Quick Pass / Fail */}
                  {resultsMode === 'quick' ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        className={`pass-fail-btn pass ${res.madeBid ? 'active' : ''}`}
                        onClick={() => handleQuickToggle(p.id, true)}
                      >
                        <Check size={18} /> Made ({10 + playerBid} pts)
                      </button>
                      <button
                        type="button"
                        className={`pass-fail-btn fail ${!res.madeBid ? 'active' : ''}`}
                        onClick={() => handleQuickToggle(p.id, false)}
                      >
                        <X size={18} /> Missed (0 pts)
                      </button>
                    </div>
                  ) : (
                    /* Exact Tricks Won Counter + Direct Digit Bar */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tricks Won:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            className="stepper-btn"
                            onClick={() => handleTricksChange(p.id, (res.tricksWon ?? 0) - 1)}
                            disabled={(res.tricksWon ?? 0) <= 0}
                          >
                            -
                          </button>

                          <input
                            type="number"
                            min="0"
                            max={round.cardsDealt}
                            value={res.tricksWon ?? 0}
                            onChange={(e) => handleTricksChange(p.id, e.target.value)}
                            style={{
                              width: '46px',
                              height: '40px',
                              background: '#ffffff',
                              border: `2px solid ${res.madeBid ? 'var(--accent-success)' : 'var(--accent-danger)'}`,
                              borderRadius: 'var(--radius-md)',
                              color: res.madeBid ? 'var(--accent-success)' : 'var(--accent-danger)',
                              fontFamily: 'var(--font-body)',
                              fontWeight: 800,
                              fontSize: '1.15rem',
                              textAlign: 'center',
                              outline: 'none'
                            }}
                          />

                          <button
                            className="stepper-btn"
                            onClick={() => handleTricksChange(p.id, (res.tricksWon ?? 0) + 1)}
                            disabled={(res.tricksWon ?? 0) >= round.cardsDealt}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Digit Chips for Tricks */}
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {digitOptions.map(num => (
                          <button
                            key={num}
                            type="button"
                            className={`digit-chip ${(res.tricksWon ?? 0) === num ? 'active' : ''}`}
                            onClick={() => handleTricksChange(p.id, num)}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
            <button
              className="btn-secondary"
              onClick={() => setPhase('bidding')}
              style={{ padding: '14px' }}
            >
              <ArrowLeft size={18} /> Edit Bids
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmitRound}
              style={{ flex: 1, padding: '14px' }}
            >
              {isLastRound ? <Trophy size={20} /> : null}
              {isLastRound ? 'Finish Game & View Winner' : 'Save & Next Round ➔'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
