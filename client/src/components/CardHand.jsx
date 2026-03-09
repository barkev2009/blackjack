import React from 'react';
import '../styles/CardHand.css';
import Card from './Card';
import { useSelector } from 'react-redux';
import { GAME_STATES } from '../const';

const CardHand = ({ cards, showCardValues = false }) => {
    const phase = useSelector(s => s.game.phase);
    const isClearing = phase === GAME_STATES.CLEARING;
    const isDealing = phase === GAME_STATES.INITIAL_GAME;
    const overlap = 28;
    const width = cards.length > 0 ? 80 + overlap * (cards.length - 1) : 80;

    return (
        <div className="card-hand" style={{ width: `${width}px` }}>
            <div className="card-hand-inner" style={{ position: 'relative', width: `${width}px`, height: '120px' }}>
                {cards.map(({ value, suit, face, label, count }, idx) => (
                    <Card
                        key={`card-${value}-${suit}-${idx}`}
                        label={label}
                        value={value}
                        suit={suit}
                        face={face}
                        count={count}
                        showCount={showCardValues && face}
                        animIndex={idx}
                        isClearing={isClearing}
                        isDealing={isDealing}
                        style={{ left: `${overlap * idx}px`, top: 0, zIndex: idx }}
                    />
                ))}
            </div>
        </div>
    );
};

export default CardHand;
