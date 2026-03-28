import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

const CARD_W = 36;
const CARD_H = 52;
const DURATION = 10000;

// Faro shuffle: два полупакета интерливятся карта-за-картой
const buildFaroTimeline = (deckSize, startX, startY, canvasW, canvasH) => {
    const events = []; // { time, cards: [{x,y,angle,opacity,suit,value}] }
    const half = Math.floor(deckSize / 2);

    // Начальные позиции двух стопок
    const leftX  = canvasW * 0.28;
    const rightX = canvasW * 0.72;
    const stackY = canvasH * 0.48;

    const SPLIT_DUR   = 1200;  // время разделения
    const RIFFLE_DUR  = 5800;  // время перемешивания
    const SQUARE_DUR  = 1500;  // время выравнивания
    const CUT_DUR     = 1500;  // финальный cut

    // ─── Фаза 0: стопка в центре ───────────────────────────────
    const initCards = Array.from({ length: deckSize }, (_, i) => ({
        id: i,
        x: canvasW / 2,
        y: stackY - i * 0.35,
        angle: (Math.random() - 0.5) * 0.5,
        opacity: 1,
        suit: i % 4,
        value: i % 13,
    }));
    events.push({ time: 0, cards: initCards });

    // ─── Фаза 1: разделение на два пакета ──────────────────────
    const splitCards = initCards.map((c, i) => {
        const isLeft = i < half;
        return {
            ...c,
            x: isLeft ? leftX : rightX,
            y: stackY - (isLeft ? i : i - half) * 0.5,
            angle: isLeft ? -4 : 4,
        };
    });
    events.push({ time: SPLIT_DUR, cards: splitCards });

    // ─── Фаза 2: riffle — карты интерливятся одна за одной ─────
    const riffleSteps = 16;
    for (let step = 0; step <= riffleSteps; step++) {
        const t = SPLIT_DUR + (RIFFLE_DUR * step) / riffleSteps;
        const merged = [];
        const progress = step / riffleSteps;
        const interleaved = Math.floor(progress * deckSize);

        for (let i = 0; i < deckSize; i++) {
            const fromLeft = i % 2 === 0;
            const srcIdx   = fromLeft ? Math.floor(i / 2) : Math.floor(i / 2);
            const placed   = i < interleaved;

            if (placed) {
                // Карта уже в центральной стопке
                merged.push({
                    id: i,
                    x: canvasW / 2 + (Math.random() - 0.5) * 3,
                    y: stackY - i * 0.38,
                    angle: (Math.random() - 0.5) * 3,
                    opacity: 1,
                    suit: i % 4,
                    value: i % 13,
                });
            } else {
                // Карта ещё в своём пакете
                const remLeft  = half  - Math.floor(interleaved / 2) - (interleaved % 2);
                const remRight = half  - Math.floor(interleaved / 2);
                const posInStack = fromLeft
                    ? srcIdx - Math.floor(interleaved / 2)
                    : srcIdx - Math.floor(interleaved / 2);

                merged.push({
                    id: i,
                    x: fromLeft ? leftX : rightX,
                    y: stackY - posInStack * 0.5,
                    angle: fromLeft ? -4 - (Math.random() * 2) : 4 + (Math.random() * 2),
                    opacity: 1,
                    suit: i % 4,
                    value: i % 13,
                });
            }
        }
        events.push({ time: t, cards: merged });
    }

    // ─── Фаза 3: выравниваем стопку ────────────────────────────
    const squaredCards = Array.from({ length: deckSize }, (_, i) => ({
        id: i,
        x: canvasW / 2,
        y: stackY - i * 0.38,
        angle: 0,
        opacity: 1,
        suit: i % 4,
        value: i % 13,
    }));
    events.push({ time: SPLIT_DUR + RIFFLE_DUR + SQUARE_DUR, cards: squaredCards });

    // ─── Фаза 4: разрезаем (cut) ───────────────────────────────
    const cutPoint = Math.floor(deckSize * 0.45);
    const cutCards = squaredCards.map((c, i) => ({
        ...c,
        y: i < cutPoint
            ? stackY - i * 0.38 - 60
            : stackY - (i - cutPoint) * 0.38,
        angle: i < cutPoint ? -1.5 : 1.5,
    }));
    events.push({ time: SPLIT_DUR + RIFFLE_DUR + SQUARE_DUR + 600, cards: cutCards });

    // ─── Фаза 5: собираем после cut ────────────────────────────
    events.push({ time: SPLIT_DUR + RIFFLE_DUR + SQUARE_DUR + CUT_DUR, cards: squaredCards });

    return events;
};

// Масти: ♠♥♦♣
const SUITS   = ['♠', '♥', '♦', '♣'];
const SUIT_COLORS = ['#1a2e40', '#8b1a1a', '#8b1a1a', '#1a2e40'];
const VALUES  = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;

const drawCard = (ctx, x, y, angle, opacity, suit, value) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
    ctx.translate(x, y);
    ctx.rotate(angle * Math.PI / 180);

    // Тень
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    // Карта
    const r = 3;
    ctx.beginPath();
    ctx.moveTo(-CARD_W/2 + r, -CARD_H/2);
    ctx.lineTo( CARD_W/2 - r, -CARD_H/2);
    ctx.quadraticCurveTo( CARD_W/2, -CARD_H/2,  CARD_W/2, -CARD_H/2 + r);
    ctx.lineTo( CARD_W/2,  CARD_H/2 - r);
    ctx.quadraticCurveTo( CARD_W/2,  CARD_H/2,  CARD_W/2 - r,  CARD_H/2);
    ctx.lineTo(-CARD_W/2 + r,  CARD_H/2);
    ctx.quadraticCurveTo(-CARD_W/2,  CARD_H/2, -CARD_W/2,  CARD_H/2 - r);
    ctx.lineTo(-CARD_W/2, -CARD_H/2 + r);
    ctx.quadraticCurveTo(-CARD_W/2, -CARD_H/2, -CARD_W/2 + r, -CARD_H/2);
    ctx.closePath();

    ctx.fillStyle = '#f5f0e8';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Масть и значение
    const color = SUIT_COLORS[suit % 4];
    const suitChar = SUITS[suit % 4];
    const valChar = VALUES[value % 13];

    ctx.fillStyle = color;
    ctx.font = `bold ${CARD_W * 0.28}px 'Georgia', serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(valChar, -CARD_W/2 + 3, -CARD_H/2 + 2);

    ctx.font = `${CARD_W * 0.28}px serif`;
    ctx.fillText(suitChar, -CARD_W/2 + 3, -CARD_H/2 + 2 + CARD_W * 0.3);

    ctx.restore();
};

const ShuffleOverlay = () => {
    const isShuffling = useSelector(s => s.game.isShuffling);
    const canvasRef   = useRef(null);
    const rafRef      = useRef(null);
    const startRef    = useRef(null);

    useEffect(() => {
        if (!isShuffling) {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        const timeline = buildFaroTimeline(52, W/2, H/2, W, H);
        startRef.current = null;

        const render = (ts) => {
            if (!startRef.current) startRef.current = ts;
            const elapsed = ts - startRef.current;
            const progress = Math.min(elapsed / DURATION, 1);

            // Найти текущий и следующий кейфрейм
            let fromIdx = 0;
            for (let i = 0; i < timeline.length - 1; i++) {
                if (timeline[i].time <= elapsed) fromIdx = i;
            }
            const toIdx = Math.min(fromIdx + 1, timeline.length - 1);
            const from  = timeline[fromIdx];
            const to    = timeline[toIdx];
            const segDur = to.time - from.time;
            const segT   = segDur > 0 ? ease(Math.min((elapsed - from.time) / segDur, 1)) : 1;

            ctx.clearRect(0, 0, W, H);

            // Интерполируем карты
            const count = Math.min(from.cards.length, to.cards.length);
            for (let i = 0; i < count; i++) {
                const a = from.cards[i];
                const b = to.cards[i];
                drawCard(
                    ctx,
                    lerp(a.x, b.x, segT),
                    lerp(a.y, b.y, segT),
                    lerp(a.angle, b.angle, segT),
                    lerp(a.opacity, b.opacity, segT),
                    a.suit,
                    a.value,
                );
            }

            if (elapsed < DURATION) {
                rafRef.current = requestAnimationFrame(render);
            }
        };

        rafRef.current = requestAnimationFrame(render);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [isShuffling]);

    if (!isShuffling) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(5, 14, 9, 0.93)',
            backdropFilter: 'blur(4px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '28px',
            animation: 'shuffleOverlayIn 0.4s ease',
        }}>
            <style>{`
                @keyframes shuffleOverlayIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes shufflePulse {
                    0%, 100% { opacity: 0.6; letter-spacing: 0.18em; }
                    50%       { opacity: 1;   letter-spacing: 0.28em; }
                }
            `}</style>

            <canvas
                ref={canvasRef}
                width={420}
                height={320}
                style={{ borderRadius: '12px' }}
            />

            <div style={{
                fontFamily: "'Georgia', 'Playfair Display', serif",
                fontSize: '1.05rem',
                color: 'var(--gold, #c9a84c)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                animation: 'shufflePulse 2s ease-in-out infinite',
            }}>
                Shuffling…
            </div>
        </div>
    );
};

export default ShuffleOverlay;