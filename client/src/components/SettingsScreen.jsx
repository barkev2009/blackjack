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
                <Row label="Hit after aces split">
                    <Toggle checked={settings.hitAfterAcesSplit} onChange={v => update('hitAfterAcesSplit', v)} />
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
                <Row label="Base Unit">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>$</span>
                        <input
                            type="number" min="1" max="10000" step="1" value={baseUnit}
                            onChange={e => { const v = Math.max(1, +e.target.value); dispatch(gameSlice.actions.setBaseUnit(v)); }}
                            style={{
                                width: '80px', padding: '5px 8px', borderRadius: '6px',
                                background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)',
                                color: 'var(--text)', fontFamily: 'DM Sans, sans-serif',
                                fontSize: '0.88rem', textAlign: 'right',
                            }}
                        />
                    </div>
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
                {biddingStrategy === 'card_count' && (
                    <TcSpreadEditor spread={settings.tcSpread} onChange={v => update('tcSpread', v)} baseUnit={baseUnit} />
                )}
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

const TC_KEYS = ['-2', '-1', '0', '1', '2', '3', '4', '5'];
const TC_LABELS = { '-2': 'TC ≤ −2', '-1': 'TC −1', '0': 'TC 0', '1': 'TC +1', '2': 'TC +2', '3': 'TC +3', '4': 'TC +4', '5': 'TC ≥ +5' };
const DEFAULT_SPREAD = {
    '-2': { mode: 'mult', value: 1 }, '-1': { mode: 'mult', value: 1 },
    '0':  { mode: 'mult', value: 1 }, '1':  { mode: 'mult', value: 1 },
    '2':  { mode: 'mult', value: 2 }, '3':  { mode: 'mult', value: 4 },
    '4':  { mode: 'mult', value: 8 }, '5':  { mode: 'mult', value: 12 },
};

const TcSpreadEditor = ({ spread, onChange, baseUnit }) => {
    // Нормализуем — поддерживаем старый формат (просто число)
    const normalize = (raw) => {
        const result = {};
        TC_KEYS.forEach(k => {
            const entry = raw?.[k];
            if (!entry) { result[k] = { ...DEFAULT_SPREAD[k] }; return; }
            result[k] = typeof entry === 'number'
                ? { mode: 'mult', value: entry }
                : { mode: entry.mode || 'mult', value: entry.value ?? 1 };
        });
        return result;
    };

    const current = normalize(spread);

    const updateMode = (key, mode) => {
        const entry = current[key];
        // При переключении в fixed — конвертируем mult*baseUnit в фикс сумму
        const newValue = mode === 'fixed'
            ? (entry.mode === 'mult' ? entry.value * baseUnit : entry.value)
            : (entry.mode === 'fixed' ? Math.max(1, Math.round(entry.value / baseUnit)) : entry.value);
        onChange({ ...current, [key]: { mode, value: newValue } });
    };

    const updateValue = (key, val) => {
        const n = Math.max(1, Math.round(Number(val)));
        if (isNaN(n)) return;
        onChange({ ...current, [key]: { ...current[key], value: n } });
    };

    return (
        <div style={{ marginTop: '4px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '12px 14px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                Bet Spread by True Count
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {TC_KEYS.map(key => {
                    const { mode, value } = current[key];
                    const betAmt = mode === 'fixed' ? value : baseUnit * value;
                    const isHigh = betAmt >= baseUnit * 8;
                    const amtColor = betAmt === baseUnit ? 'var(--text-dim)' : isHigh ? 'var(--win)' : 'var(--gold)';

                    return (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* TC label */}
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', width: '58px', flexShrink: 0 }}>
                                {TC_LABELS[key]}
                            </span>

                            {/* Mode toggle: ×mult | $fixed */}
                            <div style={{ display: 'flex', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--panel-border)', flexShrink: 0 }}>
                                {['mult', 'fixed'].map(m => (
                                    <button key={m} onClick={() => updateMode(key, m)} style={{
                                        padding: '3px 7px', fontSize: '0.72rem', cursor: 'pointer', border: 'none',
                                        background: mode === m ? 'rgba(201,168,76,0.25)' : 'rgba(0,0,0,0.3)',
                                        color: mode === m ? 'var(--gold)' : 'var(--text-dim)',
                                        fontFamily: 'DM Sans, sans-serif',
                                    }}>
                                        {m === 'mult' ? '×' : '$'}
                                    </button>
                                ))}
                            </div>

                            {/* Value input */}
                            <input
                                type="number" min="1"
                                value={value}
                                onChange={e => updateValue(key, e.target.value)}
                                style={{
                                    width: '56px', padding: '4px 6px', borderRadius: '5px',
                                    background: 'rgba(0,0,0,0.35)', border: '1px solid var(--panel-border)',
                                    color: 'var(--text)', fontFamily: 'DM Sans, sans-serif',
                                    fontSize: '0.85rem', textAlign: 'center', flexShrink: 0,
                                }}
                            />

                            {/* Result */}
                            <span style={{ fontSize: '0.75rem', color: amtColor }}>
                                = ${betAmt.toLocaleString()}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SettingsScreen;