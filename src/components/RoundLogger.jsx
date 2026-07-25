import React, { useState, useEffect } from 'react';
import { Check, X, AlertTriangle, ArrowRight, ArrowLeft, RefreshCw, Trophy } from 'lucide-react';
import { getSuitInfo, checkDealerHookViolation, calculatePlayerScore } from '../utils/kaachuRules';

export default function RoundLogger({ round, players, isHookEnabled, onSaveRound, onPreviousRound, isLastRound }) {
  const [phase, setPhase] = useState('bidding'); // 'bidding' | 'results'
  const [bids, setBids] = useState({});
  const [resultsMode, setResultsMode] = useState('quick'); // 'quick' (pass/fail) | 'exact' (tricks won)
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
    const bidVal = Math.max(0, Math.min(round.cardsDealt, newBid));
    setBids(prev => ({ ...prev, [playerId]: bidVal }));
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
    const tricksVal = Math.max(0, Math.min(round.cardsDealt, tricks));
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

    // Default results initialization if not touched
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
    // Validate exact tricks total if using exact mode
    if (resultsMode === 'exact') {
      let sumTricks = 0;
      let allEntered = true;
      players.forEach(p => {
        const t = results[p.id]?.tricksWon;
        if (t === null || t === undefined) allEntered = false;
        else sumTricks += Number(t);
      });

      if (sumTricks !== round.cardsDealt) {
        const confirmMsg = `Total tricks won (${sumTricks}) does not equal total cards dealt (${round.cardsDealt}). Do you want to submit anyway?`;
        if (!window.confirm(confirmMsg)) return;
      }
    }

    onSaveRound({
      bids,
      results
    });
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Header Info Card */}
      <div className="glass-card" style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
              Round {round.roundNumber}
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800 }}>
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
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            color: '#fcd34d',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={16} color="#f59e0b" />
            <span>
              Hook Rule Active: Dealer <strong>{dealerPlayer.name}</strong> cannot bid <strong>{forbiddenDealerBid}</strong>.
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
            background: phase === 'bidding' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
            borderColor: phase === 'bidding' ? 'var(--accent-primary)' : 'var(--border-card)',
            color: phase === 'bidding' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          1. Bids Entry
        </button>
        <button
          className={`btn-secondary ${phase === 'results' ? 'active' : ''}`}
          onClick={handleProceedToResults}
          style={{
            flex: 1,
            background: phase === 'results' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
            borderColor: phase === 'results' ? 'var(--accent-primary)' : 'var(--border-card)',
            color: phase === 'results' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          2. Log Results
        </button>
      </div>

      {/* PHASE 1: BIDDING */}
      {phase === 'bidding' && (
        <div className="glass-card">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
            Enter Bids for Round {round.roundNumber}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {players.map(p => {
              const isDealer = p.id === dealerPlayerId;
              const currentBid = bids[p.id] ?? 0;
              const isForbiddenForThisPlayer = isDealer && isHookEnabled && forbiddenDealerBid !== null && currentBid === forbiddenDealerBid;

              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: isForbiddenForThisPlayer ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isForbiddenForThisPlayer ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-card)'}`,
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{p.name}</span>
                      {isDealer && <span className="dealer-badge">Dealer</span>}
                    </div>
                    {isForbiddenForThisPlayer && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-danger)', fontWeight: 600 }}>
                        Forbidden Bid! (Hook Rule)
                      </span>
                    )}
                  </div>

                  {/* Stepper Input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      className="stepper-btn"
                      onClick={() => handleBidChange(p.id, currentBid - 1)}
                      disabled={currentBid <= 0}
                    >
                      -
                    </button>
                    <div className="number-display" style={{ color: isForbiddenForThisPlayer ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                      {currentBid}
                    </div>
                    <button
                      className="stepper-btn"
                      onClick={() => handleBidChange(p.id, currentBid + 1)}
                      disabled={currentBid >= round.cardsDealt}
                    >
                      +
                    </button>
                  </div>
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
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700 }}>
              Round Results
            </h3>

            {/* Mode selector */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.06)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
              <button
                type="button"
                onClick={() => setResultsMode('quick')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: resultsMode === 'quick' ? 'var(--accent-primary)' : 'transparent',
                  color: '#fff',
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
                  background: resultsMode === 'exact' ? 'var(--accent-primary)' : 'transparent',
                  color: '#fff',
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
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{p.name}</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                        Bid: <strong>{playerBid}</strong>
                      </span>
                    </div>

                    <div style={{
                      fontFamily: 'var(--font-heading)',
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
                        <Check size={18} /> Made Bid ({10 + playerBid} pts)
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
                    /* Exact Tricks Won Counter */
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tricks Won:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="stepper-btn"
                          onClick={() => handleTricksChange(p.id, (res.tricksWon ?? 0) - 1)}
                          disabled={(res.tricksWon ?? 0) <= 0}
                        >
                          -
                        </button>
                        <div className="number-display" style={{ color: res.madeBid ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                          {res.tricksWon ?? 0}
                        </div>
                        <button
                          className="stepper-btn"
                          onClick={() => handleTricksChange(p.id, (res.tricksWon ?? 0) + 1)}
                          disabled={(res.tricksWon ?? 0) >= round.cardsDealt}
                        >
                          +
                        </button>
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
