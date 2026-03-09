import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { simulateGame, BIDDING_STRATEGY_LABELS } from '../utils';

const STRATEGIES = ['flat', 'martingale', 'paroli', 'd_alembert', 'fibonacci', 'card_count'];
const COLORS = {
    flat: '#c9a84c', martingale: '#e05050', paroli: '#4caf72',
    d_alembert: '#6090e0', fibonacci: '#e07030', card_count: '#a060e0',
};

const buildChartData = (runs, numPoints = 200) => {
    if (!runs.length) return [];
    const maxLen = Math.max(...runs.map(r => r.length));
    const step = Math.max(1, Math.floor(maxLen / numPoints));
    const points = [];
    for (let i = 0; i < maxLen; i += step) {
        const vals = runs
            .map(r => r[Math.min(i, r.length - 1)]?.bankroll ?? 0)
            .sort((a, b) => a - b);
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        points.push({ i, avg, p10: vals[Math.floor(vals.length * 0.10)], p90: vals[Math.floor(vals.length * 0.90)] });
    }
    return points;
};

const SimulationScreen = () => {
    const settings = useSelector(state => state.game.settings);
    const [numSims, setNumSims] = useState(100);
    const [numRounds, setNumRounds] = useState(1000);
    const [initialBankroll, setInitialBankroll] = useState(5000);
    const [baseUnit, setBaseUnit] = useState(25);
    const [selectedStrategies, setSelectedStrategies] = useState(['flat', 'card_count']);
    const [results, setResults] = useState(null);
    const [running, setRunning] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, strat: '' });
    const canvasRef = useRef(null);
    const chartWrapRef = useRef(null);

    const toggleStrategy = (s) =>
        setSelectedStrategies(prev =>
            prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
        );

    const runSim = async () => {
        setRunning(true);
        setResults(null);
        await new Promise(r => setTimeout(r, 30));

        const allResults = {};
        const totalSteps = selectedStrategies.length * numSims;
        let completedSteps = 0;

        for (const strat of selectedStrategies) {
            const simRuns = [];
            const tcAgg = { neg: 0, zero: 0, low: 0, high: 0 };
            let wageredAgg = 0;

            for (let i = 0; i < numSims; i++) {
                const { results: run, tcStats, totalWagered } = simulateGame(
                    settings, strat, numRounds, initialBankroll, baseUnit
                );
                simRuns.push(run);
                tcAgg.neg  += tcStats.neg;
                tcAgg.zero += tcStats.zero;
                tcAgg.low  += tcStats.low;
                tcAgg.high += tcStats.high;
                wageredAgg += totalWagered;
                completedSteps++;
                if (completedSteps % 10 === 0) {
                    setProgress({ current: completedSteps, total: totalSteps, strat: BIDDING_STRATEGY_LABELS[strat] });
                    await new Promise(r => setTimeout(r, 0));
                }
            }
            allResults[strat] = {
                runs: simRuns,
                chartData: buildChartData(simRuns),
                tcStats: tcAgg,
                totalWagered: wageredAgg,
            };
        }

        setResults(allResults);
        setRunning(false);
        setTimeout(() => drawChart(allResults), 60);
    };

    useEffect(() => {
        if (!results) return;
        let rafId = null;
        const observer = new ResizeObserver(() => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => drawChart(results));
        });
        if (chartWrapRef.current) observer.observe(chartWrapRef.current);
        return () => { observer.disconnect(); if (rafId) cancelAnimationFrame(rafId); };
    }, [results]);

    const drawChart = (allResults) => {
        const canvas = canvasRef.current;
        const wrap = chartWrapRef.current;
        if (!canvas || !wrap) return;
        const ctx = canvas.getContext('2d');
        const W = wrap.clientWidth;
        const H = Math.min(220, Math.round(W * 0.45));
        canvas.width = W; canvas.height = H;
        canvas.style.width = W + 'px'; canvas.style.height = H + 'px';

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(0, 0, W, H);

        const pad = { t: 12, r: 8, b: 8, l: 52 };
        const cW = W - pad.l - pad.r;
        const cH = H - pad.t - pad.b;

        let minBR = Infinity, maxBR = -Infinity;
        for (const { chartData } of Object.values(allResults)) {
            for (const pt of chartData) {
                if (pt.p10 < minBR) minBR = pt.p10;
                if (pt.p90 > maxBR) maxBR = pt.p90;
            }
        }
        minBR = Math.min(minBR, 0);
        const yRange = maxBR - minBR || 1;
        const toX = (i, maxI) => pad.l + (i / (maxI || 1)) * cW;
        const toY = (v) => pad.t + ((maxBR - v) / yRange) * cH;

        ctx.font = '9px monospace'; ctx.textAlign = 'right';
        for (let i = 0; i <= 3; i++) {
            const y = pad.t + (i / 3) * cH;
            ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + cW, y); ctx.stroke();
            const val = maxBR - (i / 3) * yRange;
            ctx.fillStyle = 'rgba(255,255,255,0.28)';
            ctx.fillText('$' + (Math.round(val / 100) / 10).toFixed(1) + 'k', pad.l - 3, y + 3);
        }

        const initY = toY(initialBankroll);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad.l, initY); ctx.lineTo(pad.l + cW, initY); ctx.stroke();
        ctx.setLineDash([]);

        for (const [strat, { chartData }] of Object.entries(allResults)) {
            if (!chartData.length) continue;
            const color = COLORS[strat] || '#888';
            const maxI = chartData[chartData.length - 1].i;

            ctx.fillStyle = color + '18';
            ctx.beginPath();
            chartData.forEach((pt, j) => {
                j === 0 ? ctx.moveTo(toX(pt.i, maxI), toY(pt.p90)) : ctx.lineTo(toX(pt.i, maxI), toY(pt.p90));
            });
            for (let j = chartData.length - 1; j >= 0; j--)
                ctx.lineTo(toX(chartData[j].i, maxI), toY(chartData[j].p10));
            ctx.closePath(); ctx.fill();

            ctx.strokeStyle = color; ctx.lineWidth = 2;
            ctx.beginPath();
            chartData.forEach((pt, j) => {
                j === 0 ? ctx.moveTo(toX(pt.i, maxI), toY(pt.avg)) : ctx.lineTo(toX(pt.i, maxI), toY(pt.avg));
            });
            ctx.stroke();
        }

        // Легенда рендерится как HTML под canvas
    };

    const getStats = (runs, totalWagered) => {
        const finals = runs.map(r => r[r.length - 1]?.bankroll ?? 0).sort((a, b) => a - b);
        const avg = finals.reduce((a, b) => a + b, 0) / finals.length;
        const median = finals[Math.floor(finals.length / 2)];
        const profitable = finals.filter(b => b > initialBankroll).length;
        const ruined = runs.filter(run => run.some(pt => pt.bankroll < baseUnit)).length;
        const stddev = Math.sqrt(finals.map(b => (b - avg) ** 2).reduce((a, b) => a + b, 0) / finals.length);
        const pnl = avg - initialBankroll;
        const avgWagered = totalWagered / runs.length;
        const houseEdge = avgWagered > 0 ? -pnl / avgWagered * 100 : 0;
        return { avg, median, profitable, ruined, stddev, pnl, houseEdge };
    };

    const fmtMoney = (n) => (n >= 0 ? '+$' : '-$') + Math.abs(Math.round(n)).toLocaleString();

    return (
        <div className="screen-scrollable" style={{ padding: '16px 12px', maxWidth: '900px', margin: '0 auto', boxSizing: 'border-box' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--gold)', marginBottom: '16px', fontSize: '1.3rem' }}>
                Simulation
            </h2>

            {/* Inputs — 2x2 grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <ConfigInput label="Simulations" value={numSims}         onChange={setNumSims}         min={1}   max={1000} />
                <ConfigInput label="Rounds/Sim"  value={numRounds}       onChange={setNumRounds}       min={100} max={50000} step={100} />
                <ConfigInput label="Bankroll"    value={initialBankroll} onChange={setInitialBankroll} min={100} max={100000} step={100} />
                <ConfigInput label="Base Unit"   value={baseUnit}        onChange={setBaseUnit}        min={5}   max={1000} step={5} />
            </div>

            {/* Strategy buttons — wrap */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    Compare Strategies
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {STRATEGIES.map(s => (
                        <button key={s} onClick={() => toggleStrategy(s)} style={{
                            padding: '6px 11px', borderRadius: '6px',
                            background: selectedStrategies.includes(s) ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.05)',
                            color: selectedStrategies.includes(s) ? COLORS[s] : 'var(--text-dim)',
                            border: '1px solid ' + (selectedStrategies.includes(s) ? COLORS[s] + '80' : 'rgba(255,255,255,0.1)'),
                            fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                            whiteSpace: 'nowrap',
                        }}>
                            {BIDDING_STRATEGY_LABELS[s]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Run button + progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button onClick={runSim} disabled={running || selectedStrategies.length === 0} style={{
                    padding: '10px 24px', borderRadius: '8px', background: 'var(--gold-dark)', color: '#fff',
                    fontWeight: 600, fontSize: '0.9rem', border: '1px solid var(--gold)',
                    cursor: 'pointer', opacity: running ? 0.6 : 1, fontFamily: 'DM Sans, sans-serif',
                    whiteSpace: 'nowrap',
                }}>
                    {running ? 'Running...' : 'Run Simulation'}
                </button>
                {running && (
                    <div style={{ flex: 1, minWidth: '120px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                            {progress.strat} {progress.current}/{progress.total}
                        </div>
                        <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', borderRadius: '2px', background: 'var(--gold)',
                                width: progress.total > 0 ? (progress.current / progress.total * 100) + '%' : '0%',
                                transition: 'width 0.2s ease',
                            }} />
                        </div>
                    </div>
                )}
            </div>

            {results && (<>
                {/* Chart */}
                <div ref={chartWrapRef} style={{
                    background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '10px',
                    marginBottom: '16px', border: '1px solid var(--panel-border)',
                    overflow: 'hidden', width: '100%', boxSizing: 'border-box',
                }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Avg bankroll · p10–p90 band
                    </div>
                    <canvas ref={canvasRef} style={{ display: 'block', width: '100%', maxWidth: '100%' }} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginTop: '10px' }}>
                        {Object.keys(results).map(strat => (
                            <div key={strat} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '14px', height: '3px', background: COLORS[strat] || '#888', borderRadius: '2px', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap' }}>
                                    {BIDDING_STRATEGY_LABELS[strat]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Results — card layout на мобильном */}
                <div style={{ marginBottom: '16px' }}>
                    {Object.entries(results).map(([strat, { runs, totalWagered }]) => {
                        const s = getStats(runs, totalWagered);
                        const rorPct = (s.ruined / numSims * 100).toFixed(1) + '%';
                        const heSign = s.houseEdge <= 0 ? '+' : '-';
                        const heStr = heSign + Math.abs(s.houseEdge).toFixed(2) + '%';
                        const color = COLORS[strat] || 'var(--gold)';
                        return (
                            <div key={strat} style={{
                                borderRadius: '10px', padding: '12px 14px', marginBottom: '8px',
                                background: 'rgba(0,0,0,0.25)', border: '1px solid var(--panel-border)',
                                borderLeft: '3px solid ' + color,
                            }}>
                                {/* Strategy name */}
                                <div style={{ color, fontWeight: 600, fontSize: '0.9rem', marginBottom: '10px' }}>
                                    {BIDDING_STRATEGY_LABELS[strat]}
                                </div>
                                {/* Stats grid 3x2 */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                    <StatCell label="Median"     value={'$' + Math.round(s.median).toLocaleString()} color={s.median >= initialBankroll ? 'var(--win)' : 'var(--loss)'} />
                                    <StatCell label="Avg P&L"    value={fmtMoney(s.pnl)}   color={s.pnl >= 0 ? 'var(--win)' : 'var(--loss)'} />
                                    <StatCell label="House Edge" value={heStr}              color={s.houseEdge <= 0 ? 'var(--win)' : s.houseEdge < 1 ? 'var(--push)' : 'var(--loss)'} />
                                    <StatCell label="Std Dev"    value={'$' + Math.round(s.stddev).toLocaleString()} color="var(--text-dim)" />
                                    <StatCell label="Profitable" value={s.profitable + '/' + numSims} color={s.profitable / numSims > 0.5 ? 'var(--win)' : 'var(--text-dim)'} />
                                    <StatCell label="Risk/Ruin"  value={rorPct}             color={s.ruined / numSims > 0.1 ? 'var(--loss)' : s.ruined > 0 ? 'var(--push)' : 'var(--text-dim)'} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* TC stats */}
                {results['card_count'] && (() => {
                    const tc = results['card_count'].tcStats;
                    const total = tc.neg + tc.zero + tc.low + tc.high || 1;
                    return (
                        <div style={{
                            background: 'rgba(160,96,224,0.08)', border: '1px solid rgba(160,96,224,0.3)',
                            borderRadius: '10px', padding: '12px 14px', marginBottom: '16px',
                        }}>
                            <div style={{ color: COLORS.card_count, fontWeight: 600, marginBottom: '8px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Hi-Lo True Count Distribution
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.78rem' }}>
                                {[
                                    { label: 'TC < 0',         val: tc.neg,  color: 'var(--loss)' },
                                    { label: 'TC 0–1',         val: tc.zero, color: 'var(--text-dim)' },
                                    { label: 'TC 1–3 (x2–4)', val: tc.low,  color: 'var(--push)' },
                                    { label: 'TC > 3 (x8–12)',val: tc.high, color: 'var(--win)' },
                                ].map(({ label, val, color }) => (
                                    <div key={label}>
                                        <div style={{ color: 'var(--text-dim)', fontSize: '0.65rem', marginBottom: '2px' }}>{label}</div>
                                        <div style={{ color, fontWeight: 600 }}>
                                            {(val / total * 100).toFixed(1)}%
                                            <span style={{ color: 'var(--text-dim)', fontWeight: 400, fontSize: '0.7rem' }}> ({val.toLocaleString()})</span>
                                        </div>
                                    </div>
                                ))}
                                <div>
                                    <div style={{ color: 'var(--text-dim)', fontSize: '0.65rem', marginBottom: '2px' }}>Advantage rounds</div>
                                    <div style={{ color: 'var(--win)', fontWeight: 600 }}>
                                        {((tc.low + tc.high) / total * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: '1.6' }}>
                    {settings.numDecks} decks · {Math.round(settings.penetration * 100)}% penetration · BJ {settings.blackjackPayout === 1.5 ? '3:2' : settings.blackjackPayout === 1.2 ? '6:5' : settings.blackjackPayout === 1.125 ? '17:16' : '1:1'} · dealer {settings.dealerHitsSoft17 ? 'hits' : 'stands'} soft 17
                </div>
            </>)}
        </div>
    );
};

const ConfigInput = ({ label, value, onChange, min, max, step = 1 }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
        <input type="number" min={min} max={max} step={step} value={value}
            onChange={e => onChange(+e.target.value)}
            style={{
                padding: '8px 10px', borderRadius: '6px', width: '100%', boxSizing: 'border-box',
                background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)',
                color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem',
            }}
        />
    </div>
);

const StatCell = ({ label, value, color }) => (
    <div>
        <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
            {label}
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color }}>
            {value}
        </div>
    </div>
);

export default SimulationScreen;
