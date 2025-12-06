import React from 'react';
import '../styles/Chip.css';

const Chip = ({ value, onClick, disabled }) => {
    const getChipColor = () => {
        switch (value) {
            case 1: return '#FFFFFF'; // Белый
            case 5: return '#FF0000'; // Красный
            case 10: return '#0000FF'; // Синий
            case 25: return '#008000'; // Зеленый
            case 100: return '#000000'; // Черный
            case 500: return '#FFD700'; // Золотой
            default: return '#808080'; // Серый
        }
    };

    const getChipLabel = () => {
        if (value >= 1000) return `${value / 1000}K`;
        return value;
    };

    return (
        <button
            className={`chip ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && onClick(value)}
            disabled={disabled}
            style={{
                background: `radial-gradient(circle at 30% 30%, ${getChipColor()}, #000)`,
                borderColor: getChipColor()
            }}
            title={`$${value}`}
        >
            <span className="chip-value">${getChipLabel()}</span>
            <span className="chip-glow"></span>
        </button>
    );
};

export default Chip;