import React from 'react';
import '../styles/Card.css';

const Card = ({ card, isDealer, hidden }) => {
    const getCardColor = () => {
        if (hidden) return 'back';
        return card.suit === '♥' || card.suit === '♦' ? 'red' : 'black';
    };

    const getCardValue = () => {
        if (hidden) return '?';
        return card.value;
    };

    const getSuitSymbol = () => {
        if (hidden) return '?';
        return card.suit;
    };

    return (
        <div className={`card ${getCardColor()} ${hidden ? 'hidden' : ''}`}>
            <div className="card-corner top-left">
                <div className="card-value">{getCardValue()}</div>
                <div className="card-suit">{getSuitSymbol()}</div>
            </div>
            <div className="card-center">
                <div className="card-suit-large">{getSuitSymbol()}</div>
            </div>
            <div className="card-corner bottom-right">
                <div className="card-value">{getCardValue()}</div>
                <div className="card-suit">{getSuitSymbol()}</div>
            </div>
        </div>
    );
};

export default Card;