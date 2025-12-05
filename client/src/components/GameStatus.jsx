import React from 'react';
import '../styles/GameStatus.css';

const GameStatus = ({ message }) => {
    const getStatusClass = () => {
        if (message.includes('Blackjack') || message.includes('выиграли'))
            return 'status-winning';
        if (message.includes('проиграли') || message.includes('Перебор'))
            return 'status-losing';
        return '';
    };

    return (
        <div className="game-status">
            <div className={`status-message ${getStatusClass()}`}>
                {message}
            </div>
        </div>
    );
};

export default GameStatus;