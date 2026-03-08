// game.thunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { gameSlice } from './game.slice';
import { GAME_STATES } from '../const';

// Асинхронный thunk для dealerTurn с задержкой
export const dealerTurnAsync = createAsyncThunk(
    'game/dealerTurnAsync',
    async (_, { dispatch, getState }) => {
        try {
            // Сначала раскрываем закрытую карту
            dispatch(gameSlice.actions.revealDealerCardAction());
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Проверяем, все ли игроки перебрали
            if (getState().game.playerStates.every(state => state.isBusted)) {
                dispatch(gameSlice.actions.finishDealerTurn());
                return;
            }

            // Пока счёт дилера < 17 и он не перебрал
            let currentState = getState().game;
            while (currentState.dealerState.score[1] < 17 && !currentState.dealerState.isBusted) {
                dispatch(gameSlice.actions.drawDealerCard());
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Обновляем состояние после каждой итерации
                currentState = getState().game;

                // Проверяем условия выхода
                if (currentState.dealerState.score[1] >= 17 || currentState.dealerState.isBusted) {
                    break;
                }
            }

            // Завершаем ход дилера
            // dispatch(gameSlice.actions.finishDealerTurn());
            dispatch(finishGameWithDelay());

            // Возвращаем результат для fulfilled
            return { success: true };

        } catch (error) {
            // Возвращаем ошибку для rejected
            console.error(error);
            throw error;
        }
    }
);

// Новый thunk для задержки перед сменой фазы
export const finishGameWithDelay = createAsyncThunk(
    'game/finishGameWithDelay',
    async (_, { dispatch }) => {
        // Подсчитываем результаты немедленно
        dispatch(calculateResults());

        // Ждём 1 секунду
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Меняем фазу
        dispatch(gameSlice.actions.setPhase(GAME_STATES.BETTING));
    }
);

// Вспомогательные экшены
export const calculateResults = createAsyncThunk(
    'game/calculateResults',
    async (_, { getState, dispatch }) => {
        const state = getState().game;

        state.playerStates.forEach((playerState, playerIndex) => {
            if (playerState.isBusted) return;

            if (playerState.score[1] > state.dealerState.score[1] ||
                state.dealerState.isBusted) {
                dispatch(gameSlice.actions.playerWin({ playerIndex })); // Используйте существующий экшен
            } else if (playerState.score[1] === state.dealerState.score[1]) {
                dispatch(gameSlice.actions.playerPush({ playerIndex })); // Используйте существующий экшен
            }
        });
        return;
    }
);