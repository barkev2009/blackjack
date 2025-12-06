import React from 'react';
import Card from './Card';
import '../styles/SplitHand.css';

const SplitHand = ({
    hand,
    score,
    handIndex,
    isActive,
    isCompleted,
    bet
}) => {
    return (
        <div className={`split-hand ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
            <div className="split-hand-header">
                <h3>Рука {handIndex + 1}</h3>
                <span className="split-bet">Ставка: ${bet}</span>
            </div>

            <div className="split-hand-cards">
                {hand.map((card, index) => (
                    <Card
                        key={index}
                        card={card}
                        hidden={false}
                    />
                ))}
            </div>

            <div className="split-hand-score">
                Очки: <span className="score-value">{score}</span>
                {isCompleted && (
                    <span className={`hand-status ${score > 21 ? 'busted' : 'active'}`}>
                        {score > 21 ? 'Перебор' : 'Готово'}
                    </span>
                )}
            </div>
        </div>
    );
};

export default SplitHand;