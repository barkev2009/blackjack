import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { GAME_STATES } from '../const';

const ScoreDisplay = ({ scoreFormatted, cardCount, className, flipDelay = 0 }) => {
    const phase = useSelector(s => s.game.phase);
    const showScore = useSelector(s => s.game.showScore);
    const [displayed, setDisplayed] = useState('');
    const [visible, setVisible] = useState(false);
    const timerRef = useRef(null);
    // Запоминаем cardCount в момент последнего изменения score
    const finalCardCountRef = useRef(cardCount);

    useEffect(() => {
        if (phase === GAME_STATES.BETTING) {
            clearTimeout(timerRef.current);
            setDisplayed('');
            setVisible(false);
            finalCardCountRef.current = 0;
        }
    }, [phase]);

    useEffect(() => {
        clearTimeout(timerRef.current);

        if (!showScore) { setVisible(false); return; }
        if (!scoreFormatted) { setDisplayed(''); setVisible(false); return; }

        if (phase === GAME_STATES.INITIAL_GAME) {
            // Обновляем финальный cardCount при каждом изменении score
            finalCardCountRef.current = cardCount;
            // Задержка: ждём пока карта с этим индексом (cardCount-1) закончит анимацию
            // Синхронизируем с началом появления карты (animDelay), не с концом
            const delay = (cardCount - 1) * 120;
            timerRef.current = setTimeout(() => {
                // Показываем только если cardCount не изменился (не пришла новая карта)
                if (finalCardCountRef.current === cardCount) {
                    setDisplayed(scoreFormatted);
                    setVisible(true);
                }
            }, delay);
        } else {
            if (flipDelay > 0) {
                timerRef.current = setTimeout(() => {
                    setDisplayed(scoreFormatted);
                    setVisible(true);
                }, flipDelay);
            } else {
                setDisplayed(scoreFormatted);
                setVisible(true);
            }
        }

        return () => clearTimeout(timerRef.current);
    }, [scoreFormatted, cardCount, phase, showScore]);

    if (!visible || !displayed) return <div className={className} style={{ minHeight: '1.6rem' }} />;

    return (
        <div className={className} style={{ animation: 'scoreIn 0.2s ease both' }}>
            {displayed}
        </div>
    );
};

export default ScoreDisplay;
