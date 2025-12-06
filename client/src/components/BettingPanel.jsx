import React from 'react';
import Chip from './Chip';
import '../styles/BettingPanel.css';

const BettingPanel = ({
    balance,
    currentBet,
    onBetChange,
    onDeal,
    onClear,
    gameStatus
}) => {
    const chipValues = [1, 5, 10, 25, 100, 500];

    const handleChipClick = (value) => {
        if (balance >= currentBet + value) {
            onBetChange(currentBet + value);
        }
    };

    const isBettingPhase = gameStatus === 'betting';
    const canDeal = currentBet >= 10 && isBettingPhase;
    const canClear = currentBet > 0 && isBettingPhase;

    return (
        <div className="betting-panel">
            <div className="chips-section">
                <div className="chips-grid">
                    {chipValues.map(value => (
                        <Chip
                            key={value}
                            value={value}
                            onClick={handleChipClick}
                            disabled={!isBettingPhase || balance < currentBet + value}
                        />
                    ))}
                </div>
            </div>

            <div className="action-buttons">
                <button
                    className={`action-btn clear-btn ${!canClear ? 'disabled' : ''}`}
                    onClick={canClear ? onClear : undefined}
                    disabled={!canClear}
                >
                    Очистить
                </button>

                <button
                    className={`action-btn deal-btn ${!canDeal ? 'disabled' : ''}`}
                    onClick={canDeal ? onDeal : undefined}
                    disabled={!canDeal}
                >
                    DEAL
                </button>
            </div>

            <div className="betting-info">
                <p>Минимальная ставка: $10</p>
                <p>Текущая ставка: ${currentBet}</p>
            </div>
        </div>
    );
};

export default BettingPanel;