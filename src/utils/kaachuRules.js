export const SUITS = [
  { id: 'S', code: 'K', name: 'Kari', engName: 'Spades', symbol: '♠', color: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)' },
  { id: 'D', code: 'C', name: 'Chukat', engName: 'Diamonds', symbol: '♦', color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
  { id: 'C', code: 'F', name: 'Falli', engName: 'Clubs', symbol: '♣', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' },
  { id: 'H', code: 'L', name: 'Lal', engName: 'Hearts', symbol: '♥', color: '#fb7185', bg: 'rgba(251, 113, 133, 0.15)' },
  { id: 'NT', code: 'NT', name: 'No Trump', engName: 'No Trump', symbol: '🚫', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' }
];

export function getSuitInfo(suitId) {
  return SUITS.find(s => s.id === suitId) || SUITS[0];
}

/**
 * Generate rounds array for a game session
 */
export function generateRoundsSchedule(config) {
  const {
    playerCount,
    structure = 'up-down', // 'up-down' | 'down' | 'up'
    maxCards = Math.floor(52 / playerCount),
    minCards = 1,
    includeNoTrump = true,
    customSuitOrder = null // array of suit ids e.g. ['S', 'D', 'C', 'H', 'NT']
  } = config;

  let cardCounts = [];
  if (structure === 'up-down') {
    for (let c = minCards; c <= maxCards; c++) cardCounts.push(c);
    for (let c = maxCards - 1; c >= minCards; c--) cardCounts.push(c);
  } else if (structure === 'down') {
    for (let c = maxCards; c >= minCards; c--) cardCounts.push(c);
  } else if (structure === 'up') {
    for (let c = minCards; c <= maxCards; c++) cardCounts.push(c);
  }

  const defaultSuits = includeNoTrump
    ? ['S', 'D', 'C', 'H', 'NT']
    : ['S', 'D', 'C', 'H'];
  const suitsSequence = customSuitOrder && customSuitOrder.length > 0 ? customSuitOrder : defaultSuits;

  return cardCounts.map((cards, index) => {
    const dealerIndex = index % playerCount;
    const suitId = suitsSequence[index % suitsSequence.length];

    return {
      roundNumber: index + 1,
      cardsDealt: cards,
      dealerIndex,
      suitId,
      bids: {}, // { [playerId]: number }
      results: {}, // { [playerId]: { bid: number, tricksWon: number | null, madeBid: boolean | null, score: number } }
      completed: false
    };
  });
}

/**
 * Validates dealer bid under Hook Rule
 */
export function checkDealerHookViolation(bids, cardsDealt, dealerPlayerId, playerIds) {
  let sumBids = 0;
  let allOtherPlayersBid = true;

  for (const pid of playerIds) {
    if (pid !== dealerPlayerId) {
      if (bids[pid] === undefined || bids[pid] === null) {
        allOtherPlayersBid = false;
      } else {
        sumBids += Number(bids[pid]);
      }
    }
  }

  if (!allOtherPlayersBid) return null;

  const forbiddenDealerBid = cardsDealt - sumBids;
  return forbiddenDealerBid >= 0 ? forbiddenDealerBid : null;
}

/**
 * Calculates score for a player in a round
 */
export function calculatePlayerScore(bid, tricksWonOrMade, options = {}) {
  const {
    baseSuccessPoints = 10,
    penaltyMode = 'zero', // 'zero' | 'difference'
    penaltyMultiplier = 1
  } = options;

  if (bid === undefined || bid === null) return 0;

  let made = false;
  let actualTricks = null;

  if (typeof tricksWonOrMade === 'boolean') {
    made = tricksWonOrMade;
    actualTricks = made ? bid : null;
  } else if (typeof tricksWonOrMade === 'number') {
    actualTricks = tricksWonOrMade;
    made = bid === actualTricks;
  }

  if (made) {
    const numBid = Number(bid);
    if (numBid <= 1) {
      return 10;
    }
    return numBid * 10;
  } else {
    if (penaltyMode === 'difference' && actualTricks !== null) {
      return -Math.abs(actualTricks - bid) * penaltyMultiplier;
    }
    return 0; // standard Kachuful score for failed bid
  }
}

/**
 * Calculate totals for all players based on completed rounds
 */
export function calculateTotals(players, rounds) {
  const totals = {};
  const stats = {};

  players.forEach(p => {
    totals[p.id] = 0;
    stats[p.id] = {
      roundsPlayed: 0,
      bidsMade: 0,
      totalBids: 0,
      totalTricks: 0,
      currentStreak: 0,
      bestStreak: 0
    };
  });

  rounds.forEach(round => {
    if (!round.completed || !round.results) return;

    players.forEach(p => {
      const res = round.results[p.id];
      if (res) {
        totals[p.id] += res.score || 0;
        stats[p.id].roundsPlayed += 1;
        stats[p.id].totalBids += (res.bid || 0);

        if (res.tricksWon !== null && res.tricksWon !== undefined) {
          stats[p.id].totalTricks += res.tricksWon;
        }

        if (res.madeBid) {
          stats[p.id].bidsMade += 1;
          stats[p.id].currentStreak += 1;
          if (stats[p.id].currentStreak > stats[p.id].bestStreak) {
            stats[p.id].bestStreak = stats[p.id].currentStreak;
          }
        } else {
          stats[p.id].currentStreak = 0;
        }
      }
    });
  });

  return { totals, stats };
}
