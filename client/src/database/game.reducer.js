import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createShoe } from '../utils';
import { GAME_STATES } from '../const';
import { checkBlackjack, drawCardFromShoe, revealDealerCard, setGamePhase, updateScore } from './game.prepare';

// Асинхронный thunk для dealerTurn с задержкой
export const dealerTurnAsync = createAsyncThunk(
    'game/dealerTurnAsync',
    async (_, { dispatch, getState }) => {
        const state = getState().game;

        // Сначала раскрываем закрытую карту
        dispatch(revealDealerCardAction());
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 секунда

        if (getState().game.playerStates.every(state => state.isBusted)) {
            dispatch(finishDealerTurn());
            return
        } 

        // Пока счёт дилера < 17 и он не перебрал
        while (state.dealerState.score[1] < 17) {
            dispatch(drawDealerCard());
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Пауза 1 сек
            // Обновляем состояние из store после каждого шага
            const updatedState = getState().game;
            if (updatedState.dealerState.score[1] >= 17) break;
        }

        // Завершаем ход дилера
        dispatch(finishDealerTurn());
    }
);

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
        scoreFormatted: '',
        basicStrategy: '',
        isOver: false,
        isBusted: false
    }],
    runningCount: 0,
    shoe: [],
    bankroll: 2000,
    phase: GAME_STATES.BETTING
};

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        // Новые экшены для асинхронного dealerTurn
        revealDealerCardAction: (state) => {
            revealDealerCard(state.dealerState);
        },
        drawDealerCard: (state) => {
            drawCardFromShoe(state, state.dealerState);
            updateScore(state.dealerState);
        },
        finishDealerTurn: (state) => {
            state.dealerState.isOver = true;
        },
        initializeRound: (state) => {
            setGamePhase(state, GAME_STATES.INITIAL_GAME);
            if (state.shoe.length < 6 * 52 * (1 - 0.2)) {
                state.shoe = createShoe();
            }

            drawCardFromShoe(state, state.dealerState);
            updateScore(state.dealerState)
            drawCardFromShoe(state, state.playerStates[0]);
            updateScore(state.playerStates[0])
            drawCardFromShoe(state, state.dealerState, true);
            drawCardFromShoe(state, state.playerStates[0]);
            updateScore(state.playerStates[0]);

            checkBlackjack(state);
        },
        dealerTurn: (state) => {
            revealDealerCard(state.dealerState);

            // Рисуем карты синхронно до достижения 17+
            while (state.dealerState.score[1] < 17 && !state.dealerState.isBusted) {
                drawCardFromShoe(state, state.dealerState);
                updateScore(state.dealerState);
            }

            state.dealerState.isOver = true;
        },
        hit: (state, action) => {
            drawCardFromShoe(state, state.playerStates[action.payload.playerIndex]);
            updateScore(state.playerStates[action.payload.playerIndex]);
            state.playerStates[action.payload.playerIndex].isBusted = state.playerStates[action.payload.playerIndex].score[0] > 21
            state.playerStates[action.payload.playerIndex].isOver = state.playerStates[action.payload.playerIndex].score[0] >= 21
        },
        stand: (state, action) => {
            state.playerStates[action.payload.playerIndex].isOver = true;
            const score = state.playerStates[action.payload.playerIndex].score;
            state.playerStates[action.payload.playerIndex].score = [Math.max(...score), Math.max(...score)]
            state.playerStates[action.payload.playerIndex].scoreFormatted = Math.max(...score).toString()
        },
        doubleDown: (state, action) => {
            drawCardFromShoe(state, state.playerStates[action.payload.playerIndex]);
            updateScore(state.playerStates[action.payload.playerIndex]);
            state.playerStates[action.payload.playerIndex].isBusted = state.playerStates[action.payload.playerIndex].score[0] > 21;
            state.playerStates[action.payload.playerIndex].isOver = true;
        },
        split: (state, action) => {
            const [card1, card2] = state.playerStates[action.payload.playerIndex].hand;
            const state1 = {
                hand: [card1],
                score: card1.label === 'A' ? [1, 11] : [card1.value, card1.value],
                scoreFormatted: card1.label === 'A' ? '1 / 11' : card1.value.toString(),
                basicStrategy: '',
                isOver: false,
                isBusted: false
            }
            const state2 = {
                hand: [card2],
                score: card2.label === 'A' ? [1, 11] : [card2.value, card2.value],
                scoreFormatted: card2.label === 'A' ? '1 / 11' : card2.value.toString(),
                basicStrategy: '',
                isOver: false,
                isBusted: false
            };
            state.playerStates.splice(action.payload.playerIndex, 1, state1, state2);
            drawCardFromShoe(state, state.playerStates[action.payload.playerIndex]);
            updateScore(state.playerStates[action.payload.playerIndex]);
            drawCardFromShoe(state, state.playerStates[action.payload.playerIndex + 1]);
            updateScore(state.playerStates[action.payload.playerIndex]);
        }
    }
});

const { reducer } = gameSlice
export const { initializeRound, dealerTurn, hit, split, stand, doubleDown, revealDealerCardAction, drawDealerCard, finishDealerTurn } = gameSlice.actions
export default reducer
