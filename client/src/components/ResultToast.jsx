import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { GAME_STATES } from '../const';

const LABELS = {
    win:       { text: '✓ Win',       color: '#4caf72', bg: 'rgba(76,175,114,0.15)' },
    loss:      { text: '✗ Lose',      color: '#e05050', bg: 'rgba(224,80,80,0.15)' },
    push:      { text: '= Push',      color: '#c9a84c', bg: 'rgba(201,168,76,0.15)' },
    blackjack: { text: '★ Blackjack', color: '#7fffaa', bg: 'rgba(76,255,140,0.15)' },
    bust:      { text: '✗ Bust',      color: '#e05050', bg: 'rgba(224,80,80,0.15)' },
};

const ResultToast = () => {
    const phase = useSelector(s => s.game.phase);
    const playerStates = useSelector(s => s.game.playerStates);
    const bankroll = useSelector(s => s.game.bankroll);
    const [visible, setVisible] = useState(false);
    const [snap, setSnap] = useState(null); // snapshot при появлении

    useEffect(() => {
        if (phase === GAME_STATES.CLEARING || phase === GAME_STATES.BETTING) {
            setVisible(false);
            return;
        }
        if (phase === GAME_STATES.GAME_OVER && playerStates.length > 0) {
            // Считаем суммарный P&L раунда
            const totalBet = playerStates.reduce((s, ps) => s + (ps.bet || 0), 0);
            // Определяем главный результат
            const results = playerStates.map(ps => ps.result).filter(Boolean);
            let mainResult = null;
            if (results.includes('blackjack')) mainResult = 'blackjack';
            else if (results.every(r => r === 'win')) mainResult = 'win';
            else if (results.every(r => r === 'push')) mainResult = 'push';
            else if (results.every(r => r === 'bust')) mainResult = 'bust';
            else if (results.every(r => r === 'bust' || r === 'loss')) mainResult = 'loss';
            else if (results.includes('win')) mainResult = 'win';
            else mainResult = results[0];

            // P&L: bankroll уже обновлён, считаем относительно ставки
            let pnl = 0;
            playerStates.forEach(ps => {
                if (ps.result === 'blackjack') pnl += ps.bet * 1.5;
                else if (ps.result === 'win') pnl += ps.bet;
                else if (ps.result === 'push') pnl += 0;
                else pnl -= ps.bet;
            });

            setSnap({ result: mainResult, pnl });
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [phase]);

    if (!visible || !snap) return null;

    const cfg = LABELS[snap.result] || LABELS.loss;
    const pnlStr = snap.pnl === 0 ? 'Push' : snap.pnl > 0 ? `+${snap.pnl.toLocaleString()}` : `-${Math.abs(snap.pnl).toLocaleString()}`;
    const pnlColor = snap.pnl > 0 ? '#4caf72' : snap.pnl < 0 ? '#e05050' : '#c9a84c';

    return (
        <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'none',
            animation: 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
            <div style={{
                background: 'rgba(8, 18, 12, 0.92)',
                border: `1px solid ${cfg.color}60`,
                borderRadius: '16px',
                padding: '16px 36px',
                backdropFilter: 'blur(12px)',
                boxShadow: `0 12px 40px rgba(0,0,0,0.8), 0 0 0 1px ${cfg.color}30, inset 0 1px 0 rgba(255,255,255,0.05)`,
                textAlign: 'center',
            }}>
                <div style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: snap.result === 'blackjack' ? '2rem' : '1.6rem',
                    color: cfg.color,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    letterSpacing: '1px',
                    textShadow: `0 0 20px ${cfg.color}80, 0 2px 4px rgba(0,0,0,0.9)`,
                }}>
                    {cfg.text}
                </div>
                <div style={{
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: pnlColor,
                    marginTop: '4px',
                    fontFamily: 'DM Sans, sans-serif',
                    textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                }}>
                    {pnlStr}
                </div>
            </div>
        </div>
    );
};

export default ResultToast;