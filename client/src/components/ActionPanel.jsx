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
    const [acting, setActing] = useState(false);

    // Найдём активную руку
    const activeIndex = playerStates.findIndex(ps => !ps.isOver && !ps.isWaiting);
    const activePlayer = activeIndex >= 0 ? playerStates[activeIndex] : null;

    const allBusted = playerStates.length > 0 && playerStates.every(ps => ps.isBusted);

    // Сбрасываем acting при любом изменении состояния рук —
    // это ловит хит (hand.length), смену активной руки (activeIndex),
    // и сплит тузов где activeIndex сразу уходит в -1
    const playerStatesKey = playerStates.map(ps => `${ps.isOver}-${ps.isWaiting}-${ps.hand.length}`).join('|');
    React.useEffect(() => {
        setActing(false);
    }, [playerStatesKey]);

    const isVisible = (phase === GAME_STATES.INITIAL_GAME && (activePlayer || allBusted))
        || (allBusted && phase === GAME_STATES.GAME_OVER);
    if (!isVisible) return null;

    const buttonsDisabled = acting || (allBusted && phase === GAME_STATES.GAME_OVER);

    const canDouble = !buttonsDisabled && activePlayer?.hand.length === 2;
    const canSplit = !buttonsDisabled && activePlayer?.hand.length === 2 &&
        activePlayer.hand[0]?.label === activePlayer.hand[1]?.label;

    const dealerUpLabel = dealerState.hand[0]?.label;
    const bsAdvice = (!buttonsDisabled && dealerUpLabel && activePlayer?.hand.length >= 2)
        ? giveBSAdvice(dealerUpLabel, activePlayer.hand, activePlayer.score, settings.doubleAfterSplit)
        : null;

    const handleStand  = () => { setActing(true); dispatch(gameSlice.actions.stand({ playerIndex: activeIndex })); };
    const handleHit    = () => { setActing(true); dispatch(gameSlice.actions.hit({ playerIndex: activeIndex })); };
    const handleDouble = () => { setActing(true); dispatch(gameSlice.actions.doubleDown({ playerIndex: activeIndex })); };
    const handleSplit  = () => { setActing(true); dispatch(gameSlice.actions.split({ playerIndex: activeIndex })); };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* BS advice */}
            <div className={`bs-inline ${showBS && bsAdvice ? '' : 'hidden'}`}>
                {showBS && bsAdvice ? `→ ${bsAdvice}` : '-'}
            </div>

            <div className="blackjack-buttons">
                <button className="stand-button"  onClick={handleStand}  disabled={buttonsDisabled}>Stand</button>
                <button className="hit-button"    onClick={handleHit}    disabled={buttonsDisabled}>Hit</button>
                <button className="double-button" onClick={handleDouble} disabled={buttonsDisabled || !canDouble}>Double</button>
                <button className="split-button"  onClick={handleSplit}  disabled={buttonsDisabled || !canSplit}>Split</button>
                <button
                    className={`bs-btn ${showBS ? 'showing' : ''}`}
                    onClick={() => setShowBS(v => !v)}
                >BS</button>
            </div>
        </div>
    );
};

export default ActionPanel;