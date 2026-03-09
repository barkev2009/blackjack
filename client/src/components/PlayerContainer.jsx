import React, { useState, useEffect } from 'react';
import '../styles/PlayerContainer.css';
import CardHand from './CardHand';
import { GAME_STATES } from '../const';
import { useDispatch, useSelector } from 'react-redux';
import { gameSlice } from '../game/game.slice';
import { giveBSAdvice } from '../utils';

const RESULT_LABELS = {
    win: '✓ Win',
    loss: '✗ Lose',
    push: '= Push',
    blackjack: '★ Blackjack',
    bust: '✗ Bust',
};

const PlayerContainer = ({ playerState, playerIndex }) => {
    const dispatch = useDispatch();
    const { phase, settings, dealerState, showCardValues } = useSelector(state => state.game);
    const [showBS, setShowBS] = useState(false);

    const isActive = !playerState.isOver && !playerState.isWaiting && phase === GAME_STATES.INITIAL_GAME;
    const canDouble = playerState.hand.length === 2 && !playerState.isOver;
    const canSplit = playerState.hand.length === 2 &&
        playerState.hand[0]?.label === playerState.hand[1]?.label &&
        !playerState.isOver;

    // BS advice
    const dealerUpLabel = dealerState.hand[0]?.label;
    const bsAdvice = (dealerUpLabel && playerState.hand.length >= 2 && !playerState.isOver)
        ? giveBSAdvice(dealerUpLabel, playerState.hand, playerState.score, settings.doubleAfterSplit)
        : null;

    const handleStand = () => dispatch(gameSlice.actions.stand({ playerIndex }));
    const handleHit = () => dispatch(gameSlice.actions.hit({ playerIndex }));
    const handleDouble = () => dispatch(gameSlice.actions.doubleDown({ playerIndex }));
    const handleSplit = () => dispatch(gameSlice.actions.split({ playerIndex }));

    const resultText = playerState.result ? RESULT_LABELS[playerState.result] : null;

    return (
        <div className="player-container">
            <CardHand cards={playerState.hand} showCardValues={showCardValues} />
            {playerState.isWaiting && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', fontStyle: 'italic' }}>
                    Waiting...
                </div>
            )}

            <div className="player-score">{playerState.scoreFormatted}</div>
            <div className="player-bet-label">Bet: ${playerState.bet?.toLocaleString()}</div>



            {isActive && (
                <>
                    {/* BS inline advice */}
                    <div className={`bs-inline ${showBS && bsAdvice ? '' : 'hidden'}`}>
                        {showBS && bsAdvice ? `→ ${bsAdvice}` : '-'}
                    </div>

                    <div className="blackjack-buttons">
                        <button className="stand-button" onClick={handleStand}>Stand</button>
                        <button className="hit-button" onClick={handleHit}>Hit</button>
                        <button
                            className="double-button"
                            onClick={handleDouble}
                            disabled={!canDouble}
                        >Double</button>
                        <button
                            className="split-button"
                            onClick={handleSplit}
                            disabled={!canSplit}
                        >Split</button>
                        <button
                            className={`bs-btn ${showBS ? 'showing' : ''}`}
                            onClick={() => setShowBS(v => !v)}
                            title="Basic Strategy hint"
                        >BS</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PlayerContainer;