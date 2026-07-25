import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SetupView from './components/SetupView';
import RoundLogger from './components/RoundLogger';
import Leaderboard from './components/Leaderboard';
import ScoreTable from './components/ScoreTable';
import WinnerModal from './components/WinnerModal';
import RulesModal from './components/RulesModal';
import { generateRoundsSchedule, calculateTotals } from './utils/kaachuRules';
import { Edit3, Trophy, Table as TableIcon, Undo2, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'kaachulogs_saved_game_v1';

export default function App() {
  const [gameConfig, setGameConfig] = useState(null);
  const [players, setPlayers] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('logger'); // 'logger' | 'leaderboard' | 'scorecard'
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Restore saved game from localStorage on launch
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.players && parsed.rounds) {
          setGameConfig(parsed.gameConfig);
          setPlayers(parsed.players);
          setRounds(parsed.rounds);
          setCurrentRoundIndex(parsed.currentRoundIndex || 0);
          if (parsed.showWinnerModal) setShowWinnerModal(true);
        }
      }
    } catch (err) {
      console.warn('Failed to load saved game:', err);
    }
  }, []);

  // Save game to localStorage on state changes
  useEffect(() => {
    if (players.length > 0 && rounds.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          gameConfig,
          players,
          rounds,
          currentRoundIndex,
          showWinnerModal
        }));
      } catch (err) {
        console.warn('Failed to persist game state:', err);
      }
    }
  }, [gameConfig, players, rounds, currentRoundIndex, showWinnerModal]);

  const handleStartGame = (config) => {
    const schedule = generateRoundsSchedule({
      playerCount: config.players.length,
      structure: config.structure,
      maxCards: config.maxCards,
      includeNoTrump: config.includeNoTrump
    });

    setGameConfig(config);
    setPlayers(config.players);
    setRounds(schedule);
    setCurrentRoundIndex(0);
    setActiveTab('logger');
    setShowWinnerModal(false);
  };

  const handleSaveRound = ({ bids, results }) => {
    const updatedRounds = [...rounds];
    updatedRounds[currentRoundIndex] = {
      ...updatedRounds[currentRoundIndex],
      bids,
      results,
      completed: true
    };

    setRounds(updatedRounds);

    if (currentRoundIndex < rounds.length - 1) {
      setCurrentRoundIndex(prev => prev + 1);
    } else {
      setShowWinnerModal(true);
    }
  };

  const handleUndoLastRound = () => {
    if (currentRoundIndex === 0 && !rounds[0]?.completed) return;

    const targetIdx = rounds[currentRoundIndex]?.completed ? currentRoundIndex : Math.max(0, currentRoundIndex - 1);
    const updated = [...rounds];
    updated[targetIdx] = {
      ...updated[targetIdx],
      completed: false
    };

    setRounds(updated);
    setCurrentRoundIndex(targetIdx);
    setActiveTab('logger');
    setShowWinnerModal(false);
  };

  const handleNewGamePrompt = () => {
    if (window.confirm('Start a new game? Current game progress will be cleared.')) {
      localStorage.removeItem(STORAGE_KEY);
      setGameConfig(null);
      setPlayers([]);
      setRounds([]);
      setCurrentRoundIndex(0);
      setShowWinnerModal(false);
    }
  };

  const isGameActive = players.length > 0 && rounds.length > 0;
  const currentRound = rounds[currentRoundIndex];
  const { totals, stats } = calculateTotals(players, rounds);

  return (
    <div style={{ width: '100%' }}>
      <Header
        gameActive={isGameActive}
        onNewGame={handleNewGamePrompt}
        currentRound={currentRoundIndex + 1}
        totalRounds={rounds.length}
        onShowRules={() => setShowRulesModal(true)}
      />

      {!isGameActive ? (
        <SetupView onStartGame={handleStartGame} />
      ) : (
        <>
          {/* Main Active Tab Content */}
          {activeTab === 'logger' && currentRound && (
            <RoundLogger
              round={currentRound}
              players={players}
              isHookEnabled={gameConfig?.isHookEnabled ?? true}
              onSaveRound={handleSaveRound}
              onPreviousRound={() => setCurrentRoundIndex(prev => Math.max(0, prev - 1))}
              isLastRound={currentRoundIndex === rounds.length - 1}
            />
          )}

          {activeTab === 'leaderboard' && (
            <Leaderboard players={players} totals={totals} stats={stats} />
          )}

          {activeTab === 'scorecard' && (
            <ScoreTable
              rounds={rounds}
              players={players}
              currentRoundIndex={currentRoundIndex}
              onEditRound={(index) => {
                setCurrentRoundIndex(index);
                setActiveTab('logger');
              }}
            />
          )}

          {/* Quick Action bar above bottom nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '0 4px' }}>
            <button
              className="btn-secondary"
              onClick={handleUndoLastRound}
              disabled={currentRoundIndex === 0 && !rounds[0]?.completed}
              style={{ fontSize: '0.8rem', padding: '6px 12px', opacity: (currentRoundIndex === 0 && !rounds[0]?.completed) ? 0.3 : 1 }}
            >
              <Undo2 size={14} /> Undo Round
            </button>

            <button
              className="btn-secondary"
              onClick={() => setShowWinnerModal(true)}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <Trophy size={14} color="var(--accent-warning)" /> View Standings Summary
            </button>
          </div>

          {/* Bottom Fixed Navigation */}
          <nav className="bottom-nav">
            <button
              className={`nav-item ${activeTab === 'logger' ? 'active' : ''}`}
              onClick={() => setActiveTab('logger')}
            >
              <Edit3 />
              <span>Round Log</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              <Trophy />
              <span>Standings</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'scorecard' ? 'active' : ''}`}
              onClick={() => setActiveTab('scorecard')}
            >
              <TableIcon />
              <span>Scorecard</span>
            </button>
          </nav>
        </>
      )}

      {/* Winner Modal */}
      {showWinnerModal && (
        <WinnerModal
          players={players}
          totals={totals}
          stats={stats}
          onClose={() => setShowWinnerModal(false)}
          onNewGame={handleNewGamePrompt}
        />
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <RulesModal onClose={() => setShowRulesModal(false)} />
      )}
    </div>
  );
}
