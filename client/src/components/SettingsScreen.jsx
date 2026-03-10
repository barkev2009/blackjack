import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { gameSlice } from '../game/game.slice';
import { apiTelegramLinkCode, apiTelegramStatus, apiTelegramUnlink } from '../services/api';
import { BLACKJACK_PAYOUTS, BIDDING_STRATEGIES } from '../const';
import { BIDDING_STRATEGY_LABELS, BIDDING_STRATEGY_DESCRIPTIONS } from '../utils';

const SettingsScreen = () => {
    const dispatch = useDispatch();
    const { settings, showCardValues, showScore, showRunningCount, showTrueCount, biddingStrategy, showBiddingAdvice, baseUnit } = useSelector(state => state.game);

    const update = (key, value) => dispatch(gameSlice.actions.updateSettings({ [key]: value }));

    return (
        <div className="screen-scrollable" style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--gold)', marginBottom: '24px', fontSize: '1.5rem' }}>
                ⚙ Settings
            </h2>

            {/* Game Rules */}
            <Section title="Game Rules">
                <Row label="Number of Decks">
                    <select value={settings.numDecks} onChange={e => update('numDecks', +e.target.value)}>
                        {[1, 2, 4, 6, 8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'deck' : 'decks'}</option>)}
                    </select>
                </Row>
                <Row label="Blackjack Payout">
                    <select value={settings.blackjackPayout} onChange={e => update('blackjackPayout', +e.target.value)}>
                        {BLACKJACK_PAYOUTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                </Row>
                <Row label={`Penetration — ${Math.round(settings.penetration * 100)}% dealt`}>
                    <input
                        type="range" min="0.5" max="0.95" step="0.05"
                        value={settings.penetration}
                        onChange={e => update('penetration', +e.target.value)}
                        style={{ width: '160px' }}
                    />
                </Row>
                <Row label="Double After Split (DAS)">
                    <Toggle checked={settings.doubleAfterSplit} onChange={v => update('doubleAfterSplit', v)} />
                </Row>
                <Row label="Dealer Hits Soft 17">
                    <Toggle checked={settings.dealerHitsSoft17} onChange={v => update('dealerHitsSoft17', v)} />
                </Row>
                <Row label="Resplit Aces">
                    <Toggle checked={settings.resplitAces} onChange={v => update('resplitAces', v)} />
                </Row>
                <Row label="Auto-Shuffle After Each Round">
                    <Toggle checked={settings.autoShuffle} onChange={v => update('autoShuffle', v)} />
                </Row>
                <Row label={`Max Splits: ${settings.maxSplits}`}>
                    <input type="range" min="1" max="4" step="1" value={settings.maxSplits}
                        onChange={e => update('maxSplits', +e.target.value)}
                        style={{ width: '120px' }} />
                </Row>
            </Section>

            {/* Display */}
            <Section title="Display">
                <Row label="Show Card Hi-Lo Values">
                    <Toggle checked={showCardValues} onChange={() => dispatch(gameSlice.actions.toggleCardValues())} />
                </Row>
                <Row label="Show Score">
                    <Toggle checked={showScore} onChange={() => dispatch(gameSlice.actions.toggleScore())} />
                </Row>
                <Row label="Show Running Count">
                    <Toggle checked={showRunningCount} onChange={() => dispatch(gameSlice.actions.toggleRunningCount())} />
                </Row>
                <Row label="Show True Count">
                    <Toggle checked={showTrueCount} onChange={() => dispatch(gameSlice.actions.toggleTrueCount())} />
                </Row>
            </Section>

            {/* Bidding Strategy */}
            <Section title="Bidding Strategy">
                <Row label={`Base Unit: $${baseUnit}`}>
                    <input type="range" min="5" max="500" step="5" value={baseUnit}
                        onChange={e => dispatch(gameSlice.actions.setBaseUnit(+e.target.value))}
                        style={{ width: '160px' }} />
                </Row>
                <Row label="Strategy">
                    <select
                        value={biddingStrategy || ''}
                        onChange={e => dispatch(gameSlice.actions.setBiddingStrategy(e.target.value || null))}
                    >
                        <option value="">None</option>
                        {Object.entries(BIDDING_STRATEGY_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                </Row>
                {biddingStrategy && (
                    <div style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--text-dim)', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                        {BIDDING_STRATEGY_DESCRIPTIONS[biddingStrategy]}
                    </div>
                )}
                <Row label="Show Bidding Advice on Betting Screen">
                    <Toggle checked={showBiddingAdvice} onChange={v => dispatch(gameSlice.actions.setShowBiddingAdvice(v))} />
                </Row>
            </Section>
            {/* Telegram 2FA */}
            <TelegramSection />
        </div>
    );
};

const TelegramSection = () => {
    const [linked, setLinked]   = useState(null); // null=loading
    const [botUrl, setBotUrl]   = useState('');
    const [loading, setLoading] = useState(false);
    const [info, setInfo]       = useState('');

    useEffect(() => {
        apiTelegramStatus().then(r => setLinked(r.linked)).catch(() => setLinked(false));
    }, []);

    const handleLink = async () => {
        setLoading(true); setInfo('');
        try {
            const r = await apiTelegramLinkCode();
            setBotUrl(r.botUrl);
            // Поллим статус каждые 2 секунды
            const iv = setInterval(async () => {
                const s = await apiTelegramStatus().catch(() => ({ linked: false }));
                if (s.linked) { clearInterval(iv); setLinked(true); setBotUrl(''); setInfo('Telegram успешно привязан! 🎉'); }
            }, 2000);
            setTimeout(() => clearInterval(iv), 10 * 60 * 1000); // 10 мин таймаут
        } catch (e) { setInfo(e.message); }
        finally { setLoading(false); }
    };

    const handleUnlink = async () => {
        setLoading(true);
        try { await apiTelegramUnlink(); setLinked(false); setInfo('Telegram отвязан'); }
        catch (e) { setInfo(e.message); }
        finally { setLoading(false); }
    };

    return (
        <Section title="Безопасность">
            <div style={{ fontSize: '0.88rem', color: 'var(--text)', marginBottom: '4px' }}>
                Telegram 2FA — коды входа будут приходить в Telegram вместо почты
            </div>
            {linked === null && <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>Загрузка...</div>}
            {linked === false && !botUrl && (
                <button onClick={handleLink} disabled={loading} style={tgBtnStyle('#2aabee')}>
                    {loading ? 'Генерируем...' : '🔗 Привязать Telegram'}
                </button>
            )}
            {botUrl && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                        Нажмите кнопку ниже, откроется Telegram — нажмите Start. После этого страница обновится автоматически.
                    </div>
                    <a href={botUrl} target="_blank" rel="noreferrer" style={{ ...tgBtnStyle('#2aabee'), textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                        📱 Открыть Telegram бота
                    </a>
                </div>
            )}
            {linked === true && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#4caf72', fontSize: '0.88rem' }}>✓ Telegram привязан</span>
                    <button onClick={handleUnlink} disabled={loading} style={tgBtnStyle('#e05050', true)}>
                        Отвязать
                    </button>
                </div>
            )}
            {info && <div style={{ fontSize: '0.82rem', color: info.includes('ошиб') ? '#e05050' : '#4caf72' }}>{info}</div>}
        </Section>
    );
};

const tgBtnStyle = (color, small = false) => ({
    background: `${color}22`, color, border: `1px solid ${color}55`,
    borderRadius: '6px', padding: small ? '4px 10px' : '10px 16px',
    fontSize: small ? '0.78rem' : '0.88rem', fontWeight: 600, cursor: 'pointer',
});

const Section = ({ title, children }) => (
    <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '6px' }}>
            {title}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {children}
        </div>
    </div>
);

const Row = ({ label, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <span style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{label}</span>
        {children}
    </div>
);

const Toggle = ({ checked, onChange }) => (
    <button
        onClick={() => onChange(!checked)}
        style={{
            width: '44px', height: '24px', borderRadius: '12px', padding: '2px',
            background: checked ? 'var(--gold-dark)' : 'rgba(255,255,255,0.15)',
            border: `1px solid ${checked ? 'var(--gold)' : 'transparent'}`,
            display: 'flex', alignItems: 'center',
            justifyContent: checked ? 'flex-end' : 'flex-start',
            transition: 'all 0.2s', cursor: 'pointer',
        }}
    >
        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: checked ? 'var(--gold-light)' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }} />
    </button>
);

export default SettingsScreen;
