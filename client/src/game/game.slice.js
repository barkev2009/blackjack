import { createSlice } from '@reduxjs/toolkit';
import { createShoe, createDeck, shuffleArray } from '../utils';
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
    shoe: [], // будет заполнена при первом initializeRound
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
    showScore: true,
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

            // Колода должна быть уже подготовлена при переходе в BETTING
            // Если вдруг пустая — создаём (fallback)
            if (state.shoe.length === 0) {
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
            // При переходе в BETTING: reshuffle если прошли cut card, затем очищаем стол
            if (action.payload === GAME_STATES.BETTING) {
                const cutCard = Math.floor(state.settings.numDecks * 52 * state.settings.penetration);
                const reshuffleThreshold = state.settings.numDecks * 52 - cutCard;
                if (state.shoe.length < reshuffleThreshold) {
                    state.shoe = createShoe(state.settings.numDecks);
                    state.runningCount = 0;
                }
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

        toggleScore: (state) => {
            state.showScore = !state.showScore;
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

        // Загрузка состояния с сервера при старте
        loadServerState: (state, action) => {
            const { bankroll, state: saved } = action.payload;
            if (!saved || Object.keys(saved).length === 0) {
                // Первый запуск — только банкролл
                state.bankroll = bankroll;
                return;
            }
            // Восстанавливаем все сохранённые поля
            return {
                ...initialState,
                ...saved,
                bankroll,
                // Display toggles сохраняем из saved, остальное из initialState по умолчанию
            };
        },

        resetGame: (state) => {
            return { ...initialState, settings: state.settings };
        },

        // Переход на другой стол: новая колода, случайная часть уже "сыграна"
        switchTable: (state) => {
            const numDecks = state.settings.numDecks;
            const totalCards = numDecks * 52;

            // Собираем новую перемешанную колоду
            let newShoe = [];
            for (let i = 0; i < numDecks; i++) newShoe = newShoe.concat(createDeck());
            shuffleArray(newShoe);

            // Случайная глубина проникновения: от 20% до 65% колоды уже сыграно
            const minPlayed = Math.floor(totalCards * 0.20);
            const maxPlayed = Math.floor(totalCards * 0.65);
            const cardsPlayed = minPlayed + Math.floor(Math.random() * (maxPlayed - minPlayed + 1));

            // Извлекаем "сыгранные" карты и считаем по ним RC
            const playedCards = newShoe.splice(0, cardsPlayed);
            const newRC = playedCards.reduce((acc, card) => acc + card.count, 0);

            state.shoe = newShoe;
            state.runningCount = newRC;

            // Сбрасываем стол (как в BETTING)
            state.dealerState = { hand: [], score: [0, 0], scoreFormatted: '', isOver: false, isBusted: false };
            state.playerStates = state.playerStates.map(ps => ({
                ...ps,
                hand: [],
                score: [0, 0],
                scoreFormatted: '',
                result: null,
                isOver: false,
                isBusted: false,
                bet: 0,
            }));
            state.bet = 0;
            state.chips = [];
            state.phase = GAME_STATES.BETTING;
            state.lastResult = null;
        },

        ...chipsReducers,
        ...dealerReducers,
        ...playersReducers,
    },
});

export const { actions } = gameSlice;
export default gameSlice.reducer;