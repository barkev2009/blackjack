import { createSlice } from '@reduxjs/toolkit';
import { createShoe } from '../utils';
import { GAME_STATES } from '../const';
import { checkBlackjack, createPlayerState, drawCardFromShoe, setGamePhase, updateScore } from './game.utils';
import { chipsReducers } from './game.chips';
import { dealerReducers } from './game.dealer';
import { playersReducers } from './game.players';
import { dealerTurnAsync } from './game.thunks';

const initialState = {
    dealerState: {
        hand: [],
        score: [0, 0],
        scoreFormatted: '',
        isOver: false,
        isBusted: false
    },
    playerStates: [{
        hand: [],
        score: [0, 0],
        bet: 0,
        scoreFormatted: '',
        basicStrategy: '',
        isOver: false,
        isBusted: false
    }],
    runningCount: 0,
    shoe: [],
    bankroll: 2000,
    bet: 0,
    chips: [],
    phase: GAME_STATES.BETTING
};

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        // Общие редьюсеры
        initializeRound: (state) => {
            state.dealerState = {
                hand: [],
                score: [0, 0],
                scoreFormatted: '',
                isOver: false,
                isBusted: false
            };
            state.playerStates = [{
                hand: [],
                score: [0, 0],
                bet: 0,
                scoreFormatted: '',
                basicStrategy: '',
                isOver: false,
                isBusted: false
            }];
            state.playerStates[0].bet = state.bet;
            setGamePhase(state, GAME_STATES.INITIAL_GAME);
            if (state.shoe.length < 6 * 52 * (1 - 0.2)) {
                state.shoe = createShoe();
            }

            drawCardFromShoe(state, state.dealerState);
            updateScore(state.dealerState, state.runningCount);
            drawCardFromShoe(state, state.playerStates[0]);
            updateScore(state.playerStates[0], state.runningCount);
            drawCardFromShoe(state, state.dealerState, true);
            drawCardFromShoe(state, state.playerStates[0]);
            updateScore(state.playerStates[0], state.runningCount);

            checkBlackjack(state);
        },
        setPhase: (state, action) => {
            state.phase = action.payload;
        },

        // Импортируем редьюсеры из модулей
        ...chipsReducers,
        ...dealerReducers,
        ...playersReducers,
    },
    extraReducers: (builder) => {
        builder.addCase(dealerTurnAsync.fulfilled, (state) => {
            // Обработка завершения хода дилера
            // state.playerStates.forEach(playerState => {
            //     console.log('COUNT RESULT');
            //     if (playerState.isBusted) {
            //         // Do nothing
            //         return
            //     }
            //     // Стейт победил
            //     if (playerState.score[0] > state.dealerState.score[0] || state.dealerState.isBusted) {
            //         state.bankroll += playerState.bet * 2
            //     }
            //     // Ничья
            //     if (playerState.score[0] === state.dealerState.score[0]) {
            //         state.bankroll += playerState.bet
            //     }
            //     setTimeout(() => state.phase = GAME_STATES.BETTING, 1000);
            // })
        });
        builder.addCase(dealerTurnAsync.rejected, (state, { error }) => {
            // Обработка ошибки
            console.log(error)
        });
    }
});
