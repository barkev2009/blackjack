import { createSlice } from '@reduxjs/toolkit';
import { createShoe } from '../utils';
import { GAME_STATES, DEFAULT_SETTINGS } from '../const';
import { checkBlackjack, drawCardFromShoe, setGamePhase, updateScore, revealDealerCard } from './game.utils';
import { chipsReducers } from './game.chips';
import { dealerReducers } from './game.dealer';
import { playersReducers } from './game.players';

const initialPlayerState = () => ({
    hand: [],
    score: [0, 0],
    scoreFormatted: '',
    basicStrategy: '',
    isOver: false,
    isBusted: false,
    result: null,
    bet: 0,
    isSplit: false,
    isWaiting: false,
});

const initialDealerState = () => ({
    hand: [],
    score: [0, 0],
    scoreFormatted: '',
    isOver: false,
    isBusted: false,
});

const initialState = {
    dealerState: initialDealerState(),
    playerStates: [initialPlayerState()],
    runningCount: 0,
    shoe: [],
    bankroll: 2000,
    bet: 0,
    chips: [],
    phase: GAME_STATES.BETTING,
    settings: { ...DEFAULT_SETTINGS },
    // Bidding assist
    biddingStrategy: null,
    showBiddingAdvice: false,
    lastResult: null,
    baseUnit: 25,
    fibIndex: 0,
    // Display toggles
    showCardValues: false,
    showRunningCount: true,
    showTrueCount: true,
    // Dev shoe panel
    showShoeDev: false,
};

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        initializeRound: (state) => {
            const bet = state.bet;
            
            state.dealerState = initialDealerState();
            const ps = initialPlayerState();
            ps.bet = bet;
            state.playerStates = [ps];

            // Reshuffle check based on settings
            const cutCard = Math.floor(state.settings.numDecks * 52 * state.settings.penetration);
            if (state.shoe.length === 0 || state.shoe.length < (state.settings.numDecks * 52 - cutCard)) {
                state.shoe = createShoe(state.settings.numDecks);
                state.runningCount = 0;
            }

            setGamePhase(state, GAME_STATES.INITIAL_GAME);

            // Deal: dealer card 1 (face up), player card 1, dealer card 2 (face down), player card 2
            drawCardFromShoe(state, state.dealerState, false);
            updateScore(state.dealerState);
            drawCardFromShoe(state, state.playerStates[0], false);
            updateScore(state.playerStates[0]);
            drawCardFromShoe(state, state.dealerState, true); // hidden
            drawCardFromShoe(state, state.playerStates[0], false);
            updateScore(state.playerStates[0]);

            // Check for blackjacks
            checkBlackjack(state);
        },

        setPhase: (state, action) => {
            state.phase = action.payload;
            // При переходе в BETTING автоматически очищаем стол
            if (action.payload === GAME_STATES.BETTING) {
                state.dealerState.hand = [];
                state.dealerState.score = [0, 0];
                state.dealerState.scoreFormatted = '';
                state.dealerState.isOver = false;
                state.dealerState.isBusted = false;
                state.playerStates = state.playerStates.map(ps => ({
                    ...ps,
                    hand: [],
                    score: [0, 0],
                    scoreFormatted: '',
                    result: null,
                    isOver: false,
                    isBusted: false,
                }));
            }
        },

        updateSettings: (state, action) => {
            state.settings = { ...state.settings, ...action.payload };
        },

        setBiddingStrategy: (state, action) => {
            state.biddingStrategy = action.payload;
        },

        setShowBiddingAdvice: (state, action) => {
            state.showBiddingAdvice = action.payload;
        },

        setBaseUnit: (state, action) => {
            state.baseUnit = action.payload;
        },

        toggleCardValues: (state) => {
            state.showCardValues = !state.showCardValues;
        },

        toggleRunningCount: (state) => {
            state.showRunningCount = !state.showRunningCount;
        },

        toggleTrueCount: (state) => {
            state.showTrueCount = !state.showTrueCount;
        },

        toggleShoeDev: (state) => {
            state.showShoeDev = !state.showShoeDev;
        },

        setLastResult: (state, action) => {
            state.lastResult = action.payload;
        },

        clearTable: (state) => {
            state.dealerState.hand = [];
            state.dealerState.score = [0, 0];
            state.dealerState.scoreFormatted = '';
            state.dealerState.isOver = false;
            state.dealerState.isBusted = false;
            state.playerStates = state.playerStates.map(ps => ({
                ...ps,
                hand: [],
                score: [0, 0],
                scoreFormatted: '',
            }));
        },

        resetGame: (state) => {
            return { ...initialState, settings: state.settings };
        },

        ...chipsReducers,
        ...dealerReducers,
        ...playersReducers,
    },
});

export const { actions } = gameSlice;
export default gameSlice.reducer;