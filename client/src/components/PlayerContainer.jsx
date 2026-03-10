import React from 'react';
import '../styles/PlayerContainer.css';
import CardHand from './CardHand';
import ScoreDisplay from './ScoreDisplay';
import { useSelector } from 'react-redux';
import { GAME_STATES } from '../const';

const PlayerContainer = ({ playerState, playerIndex, isSplitLayout }) => {
    const { phase, showCardValues } = useSelector(state => state.game);
    const isActive = !playerState.isOver && !playerState.isWaiting && phase === GAME_STATES.INITIAL_GAME;
    const isDimmed = isSplitLayout && !isActive && !playerState.isOver;

    return (
        <div
            className="player-container"
            style={{
                opacity: isDimmed ? 0.4 : 1,
                transition: 'opacity 0.3s ease',
                outline: isSplitLayout && isActive ? '2px solid rgba(201,168,76,0.5)' : 'none',
                borderRadius: '8px',
                padding: isSplitLayout ? '8px' : undefined,
            }}
        >
            <CardHand cards={playerState.hand} showCardValues={showCardValues} />
            <ScoreDisplay scoreFormatted={playerState.scoreFormatted} cardCount={playerState.hand.length} className="player-score" />
            <div className="player-bet-label">Bet: ${playerState.bet?.toLocaleString()}</div>
        </div>
    );
};

export default PlayerContainer;
