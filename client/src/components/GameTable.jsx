import React, { useEffect, useRef } from 'react';
import '../styles/GameTable.css';
import DealerContainer from './DealerContainer';
import PlayerContainer from './PlayerContainer';
import BettingPanel from './BettingPanel';
import ResultToast from './ResultToast';
import ShoeWidget from './ShoeWidget';
import { useDispatch, useSelector } from 'react-redux';
import { dealerTurnAsync, resolveBlackjackAsync } from '../game/game.thunks';
import { GAME_STATES } from '../const';


const GameTable = () => {
    const dispatch = useDispatch();
    const playerStates = useSelector(state => state.game.playerStates);
    const phase = useSelector(state => state.game.phase);
    const isBetting = phase === GAME_STATES.BETTING;

    const dealerStartedRef = useRef(false);

    useEffect(() => {
        if (phase === GAME_STATES.BETTING || phase === GAME_STATES.INITIAL_GAME) {
            dealerStartedRef.current = false;
        }
        // Обычный ход — запускаем дилера (только если нет ожидающих рук)
        const hasWaiting = playerStates.some(ps => ps.isWaiting);
        if (playerStates.length > 0 && playerStates.every(ps => ps.isOver) && !hasWaiting && phase === GAME_STATES.INITIAL_GAME) {
            dealerStartedRef.current = true;
            dispatch(dealerTurnAsync());
            return;
        }
        // Блэкджек: phase сразу GAME_OVER без прохода через dealerTurnAsync
        if (phase === GAME_STATES.GAME_OVER && !dealerStartedRef.current) {
            dispatch(resolveBlackjackAsync());
        }
    }, [playerStates, phase, dispatch]);

    return (
        <div className="game-table">
            <div className="table-felt" style={{ position: 'relative' }}>
                <ShoeWidget />
                <DealerContainer />
                <div className="player-containers">
                    {playerStates.map((playerState, idx) => (
                        <PlayerContainer
                            key={`player-cont-${idx}`}
                            playerState={playerState}
                            playerIndex={idx}
                        />
                    ))}
                </div>
                <ResultToast />
            </div>
            <BettingPanel visible={isBetting} />
        </div>
    );
};

export default GameTable;
