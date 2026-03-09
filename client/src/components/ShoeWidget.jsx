import React from 'react';
import { useSelector } from 'react-redux';

const ShoeWidget = () => {
    const shoe = useSelector(s => s.game.shoe);
    const settings = useSelector(s => s.game.settings);
    const totalCards = settings.numDecks * 52;
    const remaining = shoe.length;
    const pct = remaining / totalCards; // 1 = full, 0 = empty
    const penetrationLine = 1 - settings.penetration; // где cut card

    // Визуальная колода: стопка прямоугольников
    const maxHeight = 80;
    const stackHeight = Math.max(4, Math.round(pct * maxHeight));
    
    // Цвет по заполненности
    const color = pct > 0.5 ? '#4caf72' : pct > 0.25 ? '#c9a84c' : '#e05050';

    return (
        <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            zIndex: 10,
        }}>
            {/* Стопка карт */}
            <div style={{
                width: '28px',
                height: `${maxHeight}px`,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
            }}>
                {/* Фон (пустой башмак) */}
                <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    height: `${maxHeight}px`,
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '3px',
                    background: 'rgba(0,0,0,0.2)',
                }} />
                {/* Cut card линия */}
                <div style={{
                    position: 'absolute',
                    bottom: `${penetrationLine * maxHeight}px`,
                    left: '-3px', right: '-3px',
                    height: '1px',
                    background: 'rgba(255,80,80,0.6)',
                    zIndex: 2,
                }} />
                {/* Оставшиеся карты */}
                <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    height: `${stackHeight}px`,
                    background: `linear-gradient(to top, ${color}60, ${color}30)`,
                    borderRadius: '2px',
                    transition: 'height 0.3s ease',
                    zIndex: 1,
                }}>
                    {/* Имитация стопки карт — горизонтальные линии */}
                    {Array.from({ length: Math.min(8, Math.round(pct * 8)) }).map((_, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            bottom: `${i * (stackHeight / 8)}px`,
                            left: 0, right: 0,
                            height: '1px',
                            background: 'rgba(255,255,255,0.08)',
                        }} />
                    ))}
                </div>
            </div>
            {/* Число оставшихся карт */}
            <div style={{
                fontSize: '0.6rem',
                color: color,
                fontWeight: 600,
                lineHeight: 1,
            }}>
                {remaining}
            </div>
        </div>
    );
};

export default ShoeWidget;
