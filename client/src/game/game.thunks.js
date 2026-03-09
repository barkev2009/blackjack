import { createAsyncThunk } from '@reduxjs/toolkit';
import { gameSlice } from './game.slice';
import { GAME_STATES } from '../const';

const delay = ms => new Promise(r => setTimeout(r, ms));

export const dealerTurnAsync = createAsyncThunk(
    'game/dealerTurnAsync',
    async (_, { dispatch, getState }) => {
        try {
            dispatch(gameSlice.actions.revealDealerCardAction());
            await delay(700);

            const state0 = getState().game;
            if (state0.playerStates.every(ps => ps.isBusted)) {
                dispatch(gameSlice.actions.finishDealerTurn());
                dispatch(gameSlice.actions.setLastResult('loss'));
                dispatch(gameSlice.actions.setPhase(GAME_STATES.GAME_OVER));
                await delay(1800);
                dispatch(gameSlice.actions.setPhase(GAME_STATES.CLEARING));
                await delay(420);
                dispatch({ type: 'game/clearTable' });
                dispatch(gameSlice.actions.setPhase(GAME_STATES.BETTING));
                return;
            }

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

            // lastResult: bust считается как loss для бейджа
            const lastRes = finalState.playerStates.every(ps => ps.isBusted) ? 'loss'
                : finalState.playerStates.every(ps => ps.result === 'bust' || ps.result === 'loss') ? 'loss'
                : overallResult;
            if (lastRes) dispatch(gameSlice.actions.setLastResult(lastRes));

            dispatch(gameSlice.actions.setPhase(GAME_STATES.GAME_OVER));
            await delay(1800);
            dispatch(gameSlice.actions.setPhase(GAME_STATES.CLEARING));
            await delay(420);
            dispatch({ type: 'game/clearTable' });
            dispatch(gameSlice.actions.setPhase(GAME_STATES.BETTING));

            return { success: true };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
);

export const resolveBlackjackAsync = createAsyncThunk(
    'game/resolveBlackjackAsync',
    async (_, { dispatch }) => {
        await delay(1800);
        dispatch(gameSlice.actions.setPhase(GAME_STATES.CLEARING));
        await delay(420);
        dispatch({ type: 'game/clearTable' });
        dispatch(gameSlice.actions.setPhase(GAME_STATES.BETTING));
    }
);