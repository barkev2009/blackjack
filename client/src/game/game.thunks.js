import { createAsyncThunk } from '@reduxjs/toolkit';
import { gameSlice } from './game.slice';
import { GAME_STATES } from '../const';

const delay = ms => new Promise(r => setTimeout(r, ms));

const checkAndReshuffle = async (dispatch, getState) => {
    const state = getState().game;
    const cutCard = Math.floor(state.settings.numDecks * 52 * state.settings.penetration);
    const reshuffleThreshold = state.settings.numDecks * 52 - cutCard;
    if (state.shoe.length < reshuffleThreshold) {
        dispatch(gameSlice.actions.reshuffleShoe());   // сразу обновляем колоду
        dispatch(gameSlice.actions.setIsShuffling(true));
        await delay(10000);                             // ждём анимацию
        dispatch(gameSlice.actions.setIsShuffling(false));
    }
};

const transitionToBetting = async (dispatch, getState) => {
    dispatch(gameSlice.actions.setPhase(GAME_STATES.CLEARING));
    await delay(420);
    dispatch({ type: 'game/clearTable' });
    await checkAndReshuffle(dispatch, getState);
    dispatch(gameSlice.actions.setPhase(GAME_STATES.BETTING));
};

export const dealerTurnAsync = createAsyncThunk(
    'game/dealerTurnAsync',
    async (_, { dispatch, getState }) => {
        try {
            // Сначала проверяем буст — до раскрытия карты дилера
            const state0 = getState().game;
            if (state0.playerStates.every(ps => ps.isBusted)) {
                dispatch(gameSlice.actions.finishDealerTurn());
                dispatch(gameSlice.actions.setLastResult('loss'));
                await delay(500);
                dispatch(gameSlice.actions.setPhase(GAME_STATES.GAME_OVER));
                await delay(600);
                dispatch(gameSlice.actions.revealDealerCardAction());
                await delay(1200);
                await transitionToBetting(dispatch, getState);
                return;
            }

            dispatch(gameSlice.actions.revealDealerCardAction());
            await delay(700);

            let currentState = getState().game;
            while (true) {
                const ds = currentState.dealerState;
                const score11 = ds.score[1];
                const score1 = ds.score[0];
                const isSoft = score1 !== score11 && score11 <= 21;
                const best = score11 <= 21 ? score11 : score1;

                if (ds.isBusted) break;
                if (best > 17) break;
                if (best === 17 && !isSoft) break;
                if (best === 17 && isSoft && !currentState.settings.dealerHitsSoft17) break;

                dispatch(gameSlice.actions.drawDealerCard());
                await delay(700);
                currentState = getState().game;
            }

            dispatch(gameSlice.actions.finishDealerTurn());

            const finalState = getState().game;
            const dealerBest = finalState.dealerState.score[1] <= 21
                ? finalState.dealerState.score[1]
                : finalState.dealerState.score[0];
            const dealerBusted = finalState.dealerState.isBusted;

            let overallResult = null;
            finalState.playerStates.forEach((ps, playerIndex) => {
                if (ps.isBusted) {
                    dispatch(gameSlice.actions.playerLose({ playerIndex }));
                    overallResult = overallResult || 'loss';
                    return;
                }
                const pBest = ps.score[1] <= 21 ? ps.score[1] : ps.score[0];
                if (dealerBusted || pBest > dealerBest) {
                    dispatch(gameSlice.actions.playerWin({ playerIndex }));
                    overallResult = 'win';
                } else if (pBest === dealerBest) {
                    dispatch(gameSlice.actions.playerPush({ playerIndex }));
                    overallResult = overallResult || 'push';
                } else {
                    dispatch(gameSlice.actions.playerLose({ playerIndex }));
                    overallResult = overallResult || 'loss';
                }
            });

            const lastRes = finalState.playerStates.every(ps => ps.isBusted) ? 'loss'
                : finalState.playerStates.every(ps => ps.result === 'bust' || ps.result === 'loss') ? 'loss'
                : overallResult;
            if (lastRes) dispatch(gameSlice.actions.setLastResult(lastRes));

            dispatch(gameSlice.actions.setPhase(GAME_STATES.GAME_OVER));
            await delay(1800);
            await transitionToBetting(dispatch, getState);

            return { success: true };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
);

export const resolveBlackjackAsync = createAsyncThunk(
    'game/resolveBlackjackAsync',
    async (_, { dispatch, getState }) => {
        await delay(1800);
        await transitionToBetting(dispatch, getState);
    }
);