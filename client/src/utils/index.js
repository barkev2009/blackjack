import { GAME_DECISIONS } from "../const";

export const getRandomRotationAngle = () => {
    const arr = [-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10];
    return arr[Math.floor(Math.random() * arr.length)];
}

export const getLeftAdjustment = (idx) => {
    if (idx % 3 === 0) return '25%';
    if (idx % 3 === 1) return 'calc(25% - 3px)';
    return 'calc(25% + 3px)';
}

export const createDeck = () => {
    const suits   = ['spades','diamonds','clubs','hearts'];
    const labels  = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    const values  = [2,3,4,5,6,7,8,9,10,10,10,10,1];
    const counts  = [1,1,1,1,1,0,0,0,-1,-1,-1,-1,-1];
    const deck = [];
    for (const suit of suits)
        for (let i = 0; i < labels.length; i++)
            deck.push({ suit, value: values[i], label: labels[i], count: counts[i] });
    return deck;
}

export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export const createShoe = (n = 6) => {
    let shoe = [];
    for (let i = 0; i < n; i++) shoe = shoe.concat(createDeck());
    return shuffleArray(shoe);
}

// ============ BASIC STRATEGY ============
const hardBS = (d, p) => {
    if (p >= 17) return GAME_DECISIONS.STAND;
    if (p >= 13) return ['2','3','4','5','6'].includes(d) ? GAME_DECISIONS.STAND : GAME_DECISIONS.HIT;
    if (p === 12) return ['4','5','6'].includes(d) ? GAME_DECISIONS.STAND : GAME_DECISIONS.HIT;
    if (p === 11) return GAME_DECISIONS.DOUBLE_DOWN;
    if (p === 10) return ['10','J','Q','K','A'].includes(d) ? GAME_DECISIONS.HIT : GAME_DECISIONS.DOUBLE_DOWN;
    if (p === 9)  return ['3','4','5','6'].includes(d) ? GAME_DECISIONS.DOUBLE_DOWN : GAME_DECISIONS.HIT;
    return GAME_DECISIONS.HIT;
}

const softBS = (d, nonAce) => {
    if (nonAce >= 9) return GAME_DECISIONS.STAND;
    if (nonAce === 8) return d === '6' ? GAME_DECISIONS.DOUBLE_DOWN_S : GAME_DECISIONS.STAND;
    if (nonAce === 7) {
        if (['2','3','4','5','6'].includes(d)) return GAME_DECISIONS.DOUBLE_DOWN_S;
        if (['7','8'].includes(d)) return GAME_DECISIONS.STAND;
        return GAME_DECISIONS.HIT;
    }
    if (nonAce === 6) return ['3','4','5','6'].includes(d) ? GAME_DECISIONS.DOUBLE_DOWN : GAME_DECISIONS.HIT;
    if (nonAce >= 4)  return ['4','5','6'].includes(d) ? GAME_DECISIONS.DOUBLE_DOWN : GAME_DECISIONS.HIT;
    return ['5','6'].includes(d) ? GAME_DECISIONS.DOUBLE_DOWN : GAME_DECISIONS.HIT;
}

const splitBS = (das, d, lbl, score) => {
    if (['8','A'].includes(lbl)) return GAME_DECISIONS.SPLIT;
    if (['10','J','Q','K'].includes(lbl)) return hardBS(d, score);
    if (lbl === '9') return ['7','A','10','J','Q','K'].includes(d) ? hardBS(d, score) : GAME_DECISIONS.SPLIT;
    if (lbl === '7') return ['8','9','A','10','J','Q','K'].includes(d) ? hardBS(d, score) : GAME_DECISIONS.SPLIT;
    if (lbl === '6') {
        if (['3','4','5','6'].includes(d)) return GAME_DECISIONS.SPLIT;
        if (d === '2') return das ? GAME_DECISIONS.SPLIT : hardBS(d, score);
        return hardBS(d, score);
    }
    if (lbl === '5') return hardBS(d, score);
    if (lbl === '4') return ['5','6'].includes(d) ? (das ? GAME_DECISIONS.SPLIT : hardBS(d, score)) : hardBS(d, score);
    if (['2','3'].includes(lbl)) {
        if (['4','5','6','7'].includes(d)) return GAME_DECISIONS.SPLIT;
        if (['2','3'].includes(d)) return das ? GAME_DECISIONS.SPLIT : hardBS(d, score);
        return hardBS(d, score);
    }
    return '';
}

export const computeHandScores = (hand) => {
    let total = 0, aces = 0;
    for (const c of hand) { if (c.label === 'A') { aces++; total += 1; } else total += c.value; }
    const soft = aces > 0 && total + 10 <= 21 ? total + 10 : total;
    return [total, soft];
}

export const giveBSAdvice = (dealerLabel, hand, scores, das) => {
    const [hard, soft] = scores;
    const isSoft = hard !== soft && soft <= 21;
    const isPair = hand.length === 2 && hand[0].label === hand[1].label;
    if (isPair)  return splitBS(das, dealerLabel, hand[0].label, soft);
    if (isSoft)  return softBS(dealerLabel, soft - 11);
    return hardBS(dealerLabel, hard);
}

// ============ BIDDING ============
export const getBiddingAdvice = (strategy, bankroll, lastBet, lastResult, baseUnit, runningCount, trueCount) => {
    switch (strategy) {
        case 'flat':       return baseUnit;
        case 'martingale': return lastResult === 'loss' ? Math.min(lastBet * 2, bankroll) : baseUnit;
        case 'paroli':     return lastResult === 'win'  ? Math.min(lastBet * 2, bankroll) : baseUnit;
        case 'd_alembert':
            if (lastResult === 'loss') return Math.min(lastBet + baseUnit, bankroll);
            if (lastResult === 'win' && lastBet > baseUnit) return lastBet - baseUnit;
            return baseUnit;
        case 'fibonacci':  return baseUnit;
        case 'card_count':
            if (trueCount <= 1) return baseUnit;
            if (trueCount <= 2) return baseUnit * 2;
            if (trueCount <= 3) return baseUnit * 4;
            if (trueCount <= 4) return baseUnit * 8;
            return Math.min(baseUnit * 12, bankroll * 0.25);
        default: return baseUnit;
    }
}

export const BIDDING_STRATEGY_LABELS = {
    flat:'Flat Bet', martingale:'Martingale', paroli:'Paroli',
    d_alembert:"D'Alembert", fibonacci:'Fibonacci', card_count:'Hi-Lo Count',
}
export const BIDDING_STRATEGY_DESCRIPTIONS = {
    flat:'Always bet the same amount.',
    martingale:'Double bet after a loss; return to base after a win.',
    paroli:'Double bet after a win; return to base after a loss.',
    d_alembert:'Add one unit after a loss, subtract after a win.',
    fibonacci:'Follow Fibonacci sequence (1-1-2-3-5-8...) after losses.',
    card_count:'Bet based on Hi-Lo true count: TC≥2→×2, TC≥3→×4, etc.',
}

// ============ SIMULATION ============
export const simulateGame = (settings, biddingStrategy, numRounds, initialBankroll, baseUnit) => {
    const { numDecks, penetration, blackjackPayout, doubleAfterSplit, dealerHitsSoft17, maxSplits, autoShuffle } = settings;
    const results = [];
    let bankroll  = initialBankroll;
    let shoe      = createShoe(numDecks);
    let rc        = 0; // running count
    let lastBet   = baseUnit;
    let lastResult= null;
    let fibSeq    = [1,1,2,3,5,8,13,21,34,55,89,144];
    let fibIdx    = 0;

    const reshuffleAt = Math.floor(numDecks * 52 * (1 - penetration));
    let totalWagered = 0;

    const draw = (hidden = false) => {
        if (shoe.length <= reshuffleAt) {
            shoe = createShoe(numDecks); rc = 0; fibIdx = 0; lastResult = null; lastBet = baseUnit;
        }
        const card = shoe.shift();
        if (!hidden) rc += card.count;
        return card;
    };

    const bust      = (s) => s[0] > 21;               // hard > 21 means always bust
    const best      = (s) => s[1] <= 21 ? s[1] : s[0];
    const isSoft17  = (s) => s[0] !== s[1] && s[1] === 17;

    let tcStats = { neg:0, zero:0, low:0, high:0 };

    const nextBet = () => {
        const tc = shoe.length > 0 ? rc / (shoe.length / 52) : 0;
        if (tc < 0) tcStats.neg++; else if (tc < 1) tcStats.zero++; else if (tc <= 3) tcStats.low++; else tcStats.high++;
        let b = biddingStrategy === 'fibonacci'
            ? baseUnit * (fibSeq[Math.min(fibIdx, fibSeq.length-1)] || 1)
            : getBiddingAdvice(biddingStrategy, bankroll, lastBet, lastResult, baseUnit, rc, tc);
        return Math.max(baseUnit, Math.min(b, bankroll));
    };

    const updateFib = (res) => {
        if (biddingStrategy !== 'fibonacci') return;
        if (res === 'loss') fibIdx = Math.min(fibIdx+1, fibSeq.length-1);
        else if (res === 'win') fibIdx = Math.max(0, fibIdx-2);
    };

    for (let round = 0; round < numRounds; round++) {
        // autoShuffle: новая колода каждый раунд
        if (autoShuffle && round > 0) {
            shoe = createShoe(numDecks);
            rc = 0;
            lastResult = null;
            lastBet = baseUnit;
        }
        if (bankroll < baseUnit) break;

        const bet = nextBet();

        totalWagered += bet;

        // --- Deal ---
        const dHand = [draw(), draw(true)];          // dealer: up card, hole card (hidden)
        const pHands = [[draw(), draw()]];            // player initial hand
        const pBets  = [bet];                         // parallel bet array
        const dUp    = dHand[0].label;
        const dUpVal = dHand[0].value;

        // --- Dealer peek ---
        let dealerBJ = false;
        if (dUp === 'A' || dUpVal === 10) {
            rc += dHand[1].count;
            dealerBJ = computeHandScores(dHand)[1] === 21;
            if (!dealerBJ) rc -= dHand[1].count;     // keep hole card "hidden" in count
        }

        // --- Check player BJ ---
        const pS0    = computeHandScores(pHands[0]);
        const playerBJ = pS0[1] === 21 && pHands[0].length === 2;

        // --- BJ resolution ---
        if (playerBJ || dealerBJ) {
            // reveal hole card for count if not yet done
            if (!dealerBJ && dUp !== 'A' && dUpVal !== 10) rc += dHand[1].count;

            let pnl; // net profit/loss on the bet
            if (playerBJ && dealerBJ) { pnl = 0;                    lastResult = 'push'; }
            else if (playerBJ)        { pnl = bet * blackjackPayout; lastResult = 'blackjack'; }
            else                      { pnl = -bet;                  lastResult = 'loss'; }

            bankroll += pnl;   // bankroll unchanged on push, +payout on BJ, -bet on dealer BJ
            results.push({ round, bankroll, result: lastResult, bet });
            lastBet = bet; updateFib(lastResult);
            continue;
        }

        // --- Player turn ---
        // Track additional money put in (splits/doubles) separately
        // bankroll is NOT touched until end of round
        let extra = 0;
        let splits = 0;

        for (let hi = 0; hi < pHands.length; hi++) {
            const hand = pHands[hi];
            let s = computeHandScores(hand);

            // After splitting aces: one card only, no further action
            if (hand.length === 2 && hand[0].label === 'A' && splits > 0) continue;

            while (!bust(s) && best(s) < 21) {
                const avail    = bankroll - extra;      // funds available for more action
                const hBet     = pBets[hi];
                const canDbl   = hand.length === 2 && avail >= hBet;
                const canSplit = hand.length === 2
                    && hand[0].label === hand[1].label
                    && splits < maxSplits
                    && avail >= hBet;

                const advice = giveBSAdvice(dUp, hand, s, doubleAfterSplit);

                if (advice === GAME_DECISIONS.SPLIT && canSplit) {
                    splits++;
                    extra += hBet;
                    pBets.push(hBet);
                    const [c1, c2] = hand;
                    hand.splice(0, 2, c1, draw());
                    pHands.splice(hi + 1, 0, [c2, draw()]);
                    s = computeHandScores(hand);
                    continue;
                }

                if ((advice === GAME_DECISIONS.DOUBLE_DOWN || advice === GAME_DECISIONS.DOUBLE_DOWN_S) && canDbl) {
                    extra += hBet;
                    pBets[hi] = hBet * 2;
                    hand.push(draw());
                    s = computeHandScores(hand);
                    break;
                }

                if (advice === GAME_DECISIONS.STAND || advice === GAME_DECISIONS.DOUBLE_DOWN_S) break;
                hand.push(draw());
                s = computeHandScores(hand);
            }
        }

        // --- Reveal hole card ---
        if (!dealerBJ) rc += dHand[1].count;

        // --- Dealer turn (only if at least one player hand not busted) ---
        const allBust = pHands.every(h => bust(computeHandScores(h)));
        if (!allBust) {
            while (true) {
                const ds = computeHandScores(dHand);
                if (bust(ds)) break;
                const b17 = best(ds);
                if (b17 > 17) break;
                if (b17 === 17 && !isSoft17(ds)) break;
                if (b17 === 17 && isSoft17(ds) && !dealerHitsSoft17) break;
                dHand.push(draw());
            }
        }

        const dFinal   = computeHandScores(dHand);
        const dBusted  = bust(dFinal);
        const dBest    = best(dFinal);

        // --- Settle ---
        // totalWagered accumulates bet + extra (splits/doubles)
        let returned = 0; // how much comes back to player
        let wins = 0, losses = 0;

        for (let hi = 0; hi < pHands.length; hi++) {
            const ps     = computeHandScores(pHands[hi]);
            const pBust  = bust(ps);
            const pBest  = best(ps);
            const hBet   = pBets[hi];

            if (pBust) {
                losses++;
                // lost hBet — nothing returned
            } else if (dBusted || pBest > dBest) {
                wins++;
                returned += hBet * 2;   // stake back + equal winnings
            } else if (pBest === dBest) {
                returned += hBet;       // push — stake back only
            } else {
                losses++;
                // lost hBet
            }
        }

        totalWagered += extra;

        // Net change for this round only
        const roundWagered = bet + extra;
        bankroll = bankroll - roundWagered + returned;

        lastResult = wins > losses ? 'win' : losses > wins ? 'loss' : 'push';
        updateFib(lastResult);
        lastBet = bet;
        results.push({ round, bankroll, result: lastResult, bet });
    }

    return { results, tcStats, totalWagered };
};
