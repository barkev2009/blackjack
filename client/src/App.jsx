import React, { useState, useEffect } from 'react';
import './styles/App.css';
import GameTable from './components/GameTable';
import SettingsScreen from './components/SettingsScreen';
import SimulationScreen from './components/SimulationScreen';
import Header from './components/Header';
import DevShoePanel from './components/DevShoePanel';
import AuthScreen from './auth/AuthScreen';
import { useSelector, useDispatch } from 'react-redux';
import { setAuth, logout, setChecked } from './auth/auth.slice';
import { gameSlice } from './game/game.slice';
import { useGameSync } from './hooks/useGameSync';
import { apiMe, apiLogout, apiResetGame } from './services/api';
import CardPreloader from './components/CardPreloader';

function App() {
    const dispatch = useDispatch();
    const { isAuth, username, checked } = useSelector(s => s.auth);
    const { bankroll, showShoeDev } = useSelector(s => s.game);
    const [activeScreen, setActiveScreen] = useState('game');
    const [resetting, setResetting] = useState(false);
    const isAdmin    = username === 'admin';
    const isBankrupt = isAuth && bankroll <= 0;

    // При загрузке страницы проверяем cookie через /auth/me
    useEffect(() => {
        apiMe()
            .then(({ username }) => dispatch(setAuth({ username })))
            .catch(() => dispatch(setChecked())); // cookie нет или истёк
    }, []); // eslint-disable-line

    useGameSync(isAuth);

    const handleLogout = async () => {
        await apiLogout().catch(() => {});
        dispatch(logout()); // resetGame НЕ вызываем — стейт на сервере сохранён
    };

    const handleReset = async () => {
        setResetting(true);
        try {
            await apiResetGame();
            dispatch(gameSlice.actions.resetGame());
        } catch (e) {
            console.error(e);
        } finally { setResetting(false); }
    };

    // Пока не проверили сессию — показываем сплэш
    if (!checked) return (
        <div style={{
            height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(ellipse at center, #1a3a25 0%, #0d1f15 100%)',
            fontFamily: 'Playfair Display, serif', color: '#c9a84c', fontSize: '1.5rem',
        }}>
            ♠ BlackJack Pro
        </div>
    );

    if (!isAuth) return <AuthScreen />;

    return (
        <div className="App">
            <CardPreloader />
            <Header
                activeScreen={activeScreen}
                setActiveScreen={setActiveScreen}
                username={username}
                onLogout={handleLogout}
                isAdmin={isAdmin}
            />
            {activeScreen === 'settings'   && <SettingsScreen />}
            {activeScreen === 'simulation' && <SimulationScreen />}
            {activeScreen === 'game'       && <GameTable />}
            {isAdmin && showShoeDev        && <DevShoePanel />}

            {isBankrupt && (
                <div style={styles.overlay}>
                    <div style={styles.card}>
                        <div style={{ fontSize: '3rem' }}>💸</div>
                        <div style={styles.title}>Банкрот!</div>
                        <div style={styles.text}>
                            Ваш банкролл опустился до нуля.<br />Хотите начать заново?
                        </div>
                        <button onClick={handleReset} disabled={resetting} style={styles.btn}>
                            {resetting ? 'Сбрасываем...' : '🔄 Получить $2 000 и начать заново'}
                        </button>
                        <div style={styles.logoutLink} onClick={handleLogout}>Выйти из аккаунта</div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    },
    card: {
        background: 'rgba(8,18,12,0.98)',
        border: '1px solid rgba(224,80,80,0.4)',
        borderRadius: '16px', padding: '36px 28px',
        maxWidth: '360px', width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.9)', textAlign: 'center',
    },
    title: { fontFamily: 'Playfair Display, serif', color: '#e05050', fontSize: '2rem', fontWeight: 700 },
    text:  { color: '#c0a88a', fontSize: '0.95rem', lineHeight: 1.6 },
    btn: {
        background: 'linear-gradient(135deg, #8b6914, #c9a84c)',
        color: '#0d1f15', border: 'none', borderRadius: '10px',
        padding: '14px 20px', fontWeight: 700, fontSize: '1rem',
        cursor: 'pointer', width: '100%', marginTop: '4px',
    },
    logoutLink: { color: '#888', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', opacity: 0.7 },
};

export default App;
