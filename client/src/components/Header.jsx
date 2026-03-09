import React from 'react';
import '../styles/Header.css';
import { useSelector, useDispatch } from 'react-redux';
import { gameSlice } from '../game/game.slice';

const Header = ({ activeScreen, setActiveScreen }) => {
    const { runningCount, shoe, bankroll, showRunningCount, showTrueCount, showShoeDev } = useSelector(state => state.game);
    const dispatch = useDispatch();

    const trueCount = shoe.length > 0 ? runningCount / (shoe.length / 52) : 0;

    return (
        <>
            <header>
                <div className="header-logo">♠ BlackJack Pro</div>

                <nav className="header-nav">
                    {['game', 'settings', 'simulation'].map(screen => (
                        <button
                            key={screen}
                            className={`header-nav-btn ${activeScreen === screen ? 'active' : ''}`}
                            onClick={() => setActiveScreen(screen)}
                        >
                            {screen.charAt(0).toUpperCase() + screen.slice(1)}
                        </button>
                    ))}
                </nav>

                {/* Stats — видны только на десктопе */}
                <div className="header-stats header-stats--desktop">
                    <StatItem label="Bankroll" value={'$' + bankroll.toLocaleString()} gold />
                    {showRunningCount && (
                        <StatItem label="Running" value={(runningCount > 0 ? '+' : '') + runningCount}
                            color={runningCount > 0 ? '#4caf72' : runningCount < 0 ? '#e05050' : undefined} />
                    )}
                    {showTrueCount && (
                        <StatItem label="True Count" value={(trueCount > 0 ? '+' : '') + trueCount.toFixed(1)}
                            color={trueCount > 1 ? '#4caf72' : trueCount < -1 ? '#e05050' : undefined} />
                    )}
                    <StatItem label="Shoe" value={shoe.length} />
                    <button
                        className={`header-dev-btn ${showShoeDev ? 'active' : ''}`}
                        onClick={() => dispatch(gameSlice.actions.toggleShoeDev())}
                    >🔧 DEV</button>
                </div>
            </header>

            {/* Mobile stats bar — только на game экране */}
            {activeScreen === 'game' && (
                <div className="mobile-stats-bar">
                    <StatItem label="Bankroll" value={'$' + bankroll.toLocaleString()} gold />
                    {showRunningCount && (
                        <StatItem label="RC" value={(runningCount > 0 ? '+' : '') + runningCount}
                            color={runningCount > 0 ? '#4caf72' : runningCount < 0 ? '#e05050' : undefined} />
                    )}
                    {showTrueCount && (
                        <StatItem label="TC" value={(trueCount > 0 ? '+' : '') + trueCount.toFixed(1)}
                            color={trueCount > 1 ? '#4caf72' : trueCount < -1 ? '#e05050' : undefined} />
                    )}
                    <StatItem label="Shoe" value={shoe.length} />
                    <button
                        className={`header-dev-btn ${showShoeDev ? 'active' : ''}`}
                        onClick={() => dispatch(gameSlice.actions.toggleShoeDev())}
                    >🔧 DEV</button>
                </div>
            )}
        </>
    );
};

const StatItem = ({ label, value, gold, color }) => (
    <div className="header-stat">
        <span className="header-stat-label">{label}</span>
        <span className="header-stat-value" style={{ color: gold ? 'var(--gold)' : color }}>
            {value}
        </span>
    </div>
);

export default Header;
