import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateRoundsSchedule,
  checkDealerHookViolation,
  calculatePlayerScore,
  calculateTotals,
  getSuitInfo
} from './kaachuRules.js';

test('getSuitInfo returns suit details correctly', () => {
  const kari = getSuitInfo('S');
  assert.equal(kari.name, 'Kari');
  assert.equal(kari.code, 'K');
  assert.equal(kari.symbol, '♠');

  const fallback = getSuitInfo('UNKNOWN');
  assert.equal(fallback.id, 'S');
});

test('generateRoundsSchedule creates correct up-down round structure', () => {
  const schedule = generateRoundsSchedule({
    playerCount: 4,
    structure: 'up-down',
    maxCards: 3,
    minCards: 1,
    includeNoTrump: true
  });

  // Cards: 1, 2, 3, 2, 1 (5 rounds total)
  assert.equal(schedule.length, 5);
  assert.deepEqual(schedule.map(r => r.cardsDealt), [1, 2, 3, 2, 1]);

  // Suits rotation check: S, D, C, H, NT
  assert.deepEqual(schedule.map(r => r.suitId), ['S', 'D', 'C', 'H', 'NT']);

  // Dealer rotation check: 0, 1, 2, 3, 0
  assert.deepEqual(schedule.map(r => r.dealerIndex), [0, 1, 2, 3, 0]);
});

test('checkDealerHookViolation correctly identifies forbidden bid for dealer', () => {
  const players = ['p1', 'p2', 'p3', 'dealer'];
  const bids = { p1: 1, p2: 1, p3: 2 };
  const cardsDealt = 5;

  // sum of other bids = 4. Total cards = 5. Dealer cannot bid (5 - 4) = 1.
  const forbidden = checkDealerHookViolation(bids, cardsDealt, 'dealer', players);
  assert.equal(forbidden, 1);

  // If sum of other bids = 6 (exceeding cards), 5 - 6 = -1 (no positive hook violation)
  const bids2 = { p1: 3, p2: 3, p3: 0 };
  const forbidden2 = checkDealerHookViolation(bids2, cardsDealt, 'dealer', players);
  assert.equal(forbidden2, null);
});

test('calculatePlayerScore evaluates standard scoring accurately', () => {
  // Exact bid 3 => 10 + 3 = 13
  assert.equal(calculatePlayerScore(3, 3), 13);
  assert.equal(calculatePlayerScore(3, true), 13);

  // Failed bid 3 (won 2) => 0
  assert.equal(calculatePlayerScore(3, 2), 0);
  assert.equal(calculatePlayerScore(3, false), 0);

  // Zero bid made => 10 + 0 = 10
  assert.equal(calculatePlayerScore(0, 0), 10);
  assert.equal(calculatePlayerScore(0, true), 10);
});

test('calculateTotals computes running scores and streaks', () => {
  const players = [{ id: 'p1', name: 'Alice' }, { id: 'p2', name: 'Bob' }];
  const rounds = [
    {
      completed: true,
      results: {
        p1: { bid: 2, tricksWon: 2, madeBid: true, score: 12 },
        p2: { bid: 1, tricksWon: 0, madeBid: false, score: 0 }
      }
    },
    {
      completed: true,
      results: {
        p1: { bid: 1, tricksWon: 1, madeBid: true, score: 11 },
        p2: { bid: 2, tricksWon: 2, madeBid: true, score: 12 }
      }
    }
  ];

  const { totals, stats } = calculateTotals(players, rounds);
  assert.equal(totals.p1, 23);
  assert.equal(totals.p2, 12);
  assert.equal(stats.p1.bidsMade, 2);
  assert.equal(stats.p1.bestStreak, 2);
  assert.equal(stats.p2.bidsMade, 1);
  assert.equal(stats.p2.currentStreak, 1);
});
