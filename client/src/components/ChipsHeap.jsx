import React from 'react';
import '../styles/ChipsHeap.css';
import { useSelector } from 'react-redux';
import Chip from './Chip';

const ChipsHeap = () => {
    const chips = useSelector(state => state.game.chips);

    return (
        <div className="chip-heap">
            {chips.map(({ color, value, label, style, isComplex }, idx) => (
                <Chip
                    key={idx}
                    color={color}
                    value={value}
                    label={label}
                    isComplex={isComplex}
                    clickable={false}
                    style={{
                        position: 'absolute',
                        // bottom из game.chips.js (0px, 4px, 8px...) — башенка растёт вверх
                        bottom: style?.bottom ?? '0px',
                        // центрируем горизонтально внутри враппера
                        left: '50%',
                        transform: `translateX(-50%) ${style?.transform ?? ''}`.trim(),
                    }}
                />
            ))}
        </div>
    );
};

export default ChipsHeap;
