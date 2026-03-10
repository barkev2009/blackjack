import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { gameSlice } from '../game/game.slice';
import { apiLoadState, apiSaveState } from '../services/api';
import { GAME_STATES } from '../const';

const SAVE_DEBOUNCE_MS = 1500;

// Поля из Redux state которые сохраняем на сервер
const extractSaveable = (gameState) => ({
    shoe:          gameState.shoe,
    runningCount:  gameState.runningCount,
    phase:         gameState.phase,
    bet:           gameState.bet,
    chips:         gameState.chips,
    dealerState:   gameState.dealerState,
    playerStates:  gameState.playerStates,
    lastResult:    gameState.lastResult,
    settings:      gameState.settings,
    biddingStrategy:   gameState.biddingStrategy,
    showBiddingAdvice: gameState.showBiddingAdvice,
    baseUnit:      gameState.baseUnit,
    fibIndex:      gameState.fibIndex,
    showCardValues:    gameState.showCardValues,
    showScore:         gameState.showScore,
    showRunningCount:  gameState.showRunningCount,
    showTrueCount:     gameState.showTrueCount,
});

export const useGameSync = (isAuth) => {
    const dispatch  = useDispatch();
    const gameState = useSelector(s => s.game);
    const timerRef  = useRef(null);
    const loadedRef = useRef(false);

    // Загрузка при входе / сброс при выходе
    useEffect(() => {
        if (!isAuth) {
            // При логауте сбрасываем флаг — следующий вход загрузит стейт заново
            loadedRef.current = false;
            return;
        }
        if (loadedRef.current) return;
        loadedRef.current = true;

        apiLoadState()
            .then(({ bankroll, state }) => {
                dispatch(gameSlice.actions.loadServerState({ bankroll, state }));
            })
            .catch(err => console.warn('State load failed:', err));
    }, [isAuth, dispatch]);

    // Авто-сохранение с дебаунсом при каждом изменении стейта
    useEffect(() => {
        if (!isAuth || !loadedRef.current) return;
        // Не сохраняем во время анимации clearing
        if (gameState.phase === GAME_STATES.CLEARING) return;

        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            const saveable = extractSaveable(gameState);
            apiSaveState(gameState.bankroll, saveable)
                .catch(err => console.warn('State save failed:', err));
        }, SAVE_DEBOUNCE_MS);

        return () => clearTimeout(timerRef.current);
    }, [gameState, isAuth]);
};
