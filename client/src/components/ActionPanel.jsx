import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { gameSlice } from '../game/game.slice';
import { GAME_STATES } from '../const';
import { giveBSAdvice } from '../utils';
import '../styles/PlayerContainer.css';

const ActionPanel = () => {
    const dispatch = useDispatch();
    const { phase, settings, dealerState, playerStates, showCardValues } = useSelector(s => s.game);
    const [showBS, setShowBS] = useState(false);

    // Найдём активную руку
    const activeIndex = playerStates.findIndex(ps => !ps.isOver && !ps.isWaiting);
    const activePlayer = activeIndex >= 0 ? playerStates[activeIndex] : null;

    const isVisible = phase === GAME_STATES.INITIAL_GAME && activePlayer;
    if (!isVisible) return null;

    const canDouble = activePlayer.hand.length === 2;
    const canSplit = activePlayer.hand.length === 2 &&
        activePlayer.hand[0]?.label === activePlayer.hand[1]?.label;

    const dealerUpLabel = dealerState.hand[0]?.label;
    const bsAdvice = (dealerUpLabel && activePlayer.hand.length >= 2)
        ? giveBSAdvice(dealerUpLabel, activePlayer.hand, activePlayer.score, settings.doubleAfterSplit)
        : null;

    const handleStand  = () => dispatch(gameSlice.actions.stand({ playerIndex: activeIndex }));
    const handleHit    = () => dispatch(gameSlice.actions.hit({ playerIndex: activeIndex }));
    const handleDouble = () => dispatch(gameSlice.actions.doubleDown({ playerIndex: activeIndex }));
    const handleSplit  = () => dispatch(gameSlice.actions.split({ playerIndex: activeIndex }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* BS advice */}
            <div className={`bs-inline ${showBS && bsAdvice ? '' : 'hidden'}`}>
                {showBS && bsAdvice ? `→ ${bsAdvice}` : '-'}
            </div>

            <div className="blackjack-buttons">
                <button className="stand-button"  onClick={handleStand}>Stand</button>
                <button className="hit-button"    onClick={handleHit}>Hit</button>
                <button className="double-button" onClick={handleDouble} disabled={!canDouble}>Double</button>
                <button className="split-button"  onClick={handleSplit}  disabled={!canSplit}>Split</button>
                <button
                    className={`bs-btn ${showBS ? 'showing' : ''}`}
                    onClick={() => setShowBS(v => !v)}
                >BS</button>
            </div>
        </div>
    );
};

export default ActionPanel;
