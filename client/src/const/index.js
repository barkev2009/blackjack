// 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000 
export const chipset = [
    { chipColor: 'violet', color: '#4a2b77', label: 5, value: 5, isComplex: false },
    { chipColor: 'blue', color: '#012450', label: 10, value: 10, isComplex: false },
    { chipColor: 'red', color: 'hsl(0, 69%, 45%)', label: 25, value: 25, isComplex: false },
    { chipColor: 'light-green', color: '#598300', label: 50, value: 50, isComplex: false },
    { chipColor: 'brown', color: '#540000', label: 100, value: 100, isComplex: false },
    { chipColor: 'violet', color: '#4a2b77', label: 250, value: 250, isComplex: true },
    { chipColor: 'blue', color: '#012450', label: 500, value: 500, isComplex: true },
    { chipColor: 'red', color: 'hsl(0, 69%, 45%)', label: '1K', value: 1000, isComplex: true },
    { chipColor: 'light-green', color: '#598300', label: '2.5K', value: 2500, isComplex: true },
    { chipColor: 'brown', color: '#540000', label: '5K', value: 5000, isComplex: true },
]

export const GAME_STATES = {
    BETTING: 'betting',
    INITIAL_GAME: 'initial',
    DEALER_TURN: 'dealer-turn',
    PLAYER_TURN: 'player-turn',
    GAME_OVER: 'game-over',
    CLEARING: 'clearing'
}

export const GAME_DECISIONS = {
    STAND: 'STAND',
    HIT: 'HIT',
    DOUBLE_DOWN: 'DOUBLE / HIT',
    DOUBLE_DOWN_S: 'DOUBLE / STAND',
    SPLIT: 'SPLIT',
}

export const BIDDING_STRATEGIES = {
    FLAT: 'flat',
    MARTINGALE: 'martingale',
    PAROLI: 'paroli',
    CARD_COUNT: 'card_count',
    FIBONACCI: 'fibonacci',
    D_ALEMBERT: 'd_alembert',
}

export const DEFAULT_SETTINGS = {
    numDecks: 6,
    penetration: 0.8,
    blackjackPayout: 1.5,
    doubleAfterSplit: true,
    resplitAces: false,
    hitAfterAcesSplit: true,
    dealerHitsSoft17: true,
    autoShuffle: false,
    maxSplits: 3,
    // Ставки по True Count: mode='mult' (множитель от baseUnit) или mode='fixed' (фикс сумма)
    tcSpread: {
        '-2': { mode: 'mult', value: 1 },
        '-1': { mode: 'mult', value: 1 },
        '0':  { mode: 'mult', value: 1 },
        '1':  { mode: 'mult', value: 1 },
        '2':  { mode: 'mult', value: 2 },
        '3':  { mode: 'mult', value: 4 },
        '4':  { mode: 'mult', value: 8 },
        '5':  { mode: 'mult', value: 12 },
    },
}

export const BLACKJACK_PAYOUTS = [
    { label: '3:2', value: 1.5 },
    { label: '6:5', value: 1.2 },
    { label: '1:1', value: 1.0 },
]