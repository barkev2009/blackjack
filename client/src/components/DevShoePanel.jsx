import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const SUIT_SYMBOLS = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
const SUIT_COLORS = { spades: '#aac', hearts: '#f88', diamonds: '#f88', clubs: '#aac' };

const DevShoePanel = () => {
    const { shoe, dealerState, playerStates, runningCount } = useSelector(state => state.game);
    const [tab, setTab] = useState('shoe'); // 'shoe' | 'hands'

    const panelStyle = {
        position: 'fixed',
        bottom: 0, right: 0,
        width: '380px', maxHeight: '60vh',
        background: 'rgba(10,10,10,0.95)',
        border: '1px solid rgba(255,100,0,0.4)',
        borderBottom: 'none', borderRight: 'none',
        borderRadius: '12px 0 0 0',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        zIndex: 9999,
        fontFamily: 'monospace',
        fontSize: '0.75rem',
        color: '#e0d0b0',
        boxShadow: '0 0 30px rgba(255,100,0,0.15)',
    };

    return (
        <div style={panelStyle}>
            <div style={{ padding: '8px 12px', background: 'rgba(255,100,0,0.15)', display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid rgba(255,100,0,0.3)' }}>
                <span style={{ color: '#ff9940', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>🔧 Dev Panel</span>
                <span style={{ fontSize: '0.65rem', color: '#888', marginLeft: 'auto' }}>RC: {runningCount > 0 ? '+' : ''}{runningCount} | Shoe: {shoe.length} cards</span>
                {['shoe', 'hands'].map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem',
                        background: tab === t ? 'rgba(255,100,0,0.3)' : 'transparent',
                        color: tab === t ? '#ff9940' : '#888',
                        border: `1px solid ${tab === t ? 'rgba(255,100,0,0.5)' : 'transparent'}`,
                        cursor: 'pointer',
                    }}>{t}</button>
                ))}
            </div>

            <div style={{ overflow: 'auto', flex: 1, padding: '8px 12px' }}>
                {tab === 'hands' && (
                    <div>
                        <div style={{ marginBottom: '8px', color: '#aaa', fontSize: '0.7rem' }}>DEALER HAND</div>
                        <HandDisplay hand={dealerState.hand} score={dealerState.scoreFormatted} />
                        {playerStates.map((ps, i) => (
                            <div key={i}>
                                <div style={{ margin: '8px 0 4px', color: '#aaa', fontSize: '0.7rem' }}>PLAYER {i + 1} (bet: ${ps.bet})</div>
                                <HandDisplay hand={ps.hand} score={ps.scoreFormatted} result={ps.result} />
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'shoe' && (
                    <div>
                        <div style={{ color: '#aaa', fontSize: '0.7rem', marginBottom: '6px' }}>
                            REMAINING SHOE ({shoe.length} cards) — showing next 60
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                            {shoe.slice(0, 60).map((card, i) => (
                                <CardToken key={i} card={card} position={i + 1} />
                            ))}
                            {shoe.length > 60 && (
                                <span style={{ color: '#666', alignSelf: 'center' }}>+{shoe.length - 60} more...</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const HandDisplay = ({ hand, score, result }) => (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
        {hand.map((card, i) => <CardToken key={i} card={card} hidden={!card.face} />)}
        <span style={{ color: '#c9a84c', marginLeft: '4px' }}>{score}</span>
        {result && <span style={{ color: result === 'win' || result === 'blackjack' ? '#4caf72' : result === 'loss' || result === 'bust' ? '#e05050' : '#c9a84c', fontWeight: 700 }}>[{result}]</span>}
    </div>
);

const CardToken = ({ card, position, hidden = false }) => {
    if (hidden) return (
        <div style={{ background: '#223', border: '1px solid #445', borderRadius: '3px', padding: '1px 4px', color: '#556' }}>
            ?
        </div>
    );
    const suit = card.suit;
    const countColor = card.count > 0 ? '#4caf72' : card.count < 0 ? '#e05050' : '#888';
    return (
        <div style={{ background: '#1a1a2e', border: '1px solid #334', borderRadius: '3px', padding: '1px 4px', color: SUIT_COLORS[suit] || '#ccc', display: 'flex', gap: '2px', alignItems: 'center' }}>
            {position && <span style={{ color: '#555', fontSize: '0.6rem' }}>{position}.</span>}
            <span>{card.label}{SUIT_SYMBOLS[suit]}</span>
            <span style={{ color: countColor, fontSize: '0.6rem' }}>({card.count > 0 ? '+' : ''}{card.count})</span>
        </div>
    );
};

export default DevShoePanel;
