import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAuth } from './auth.slice';
import {
    apiRegister, apiVerifyEmail, apiLogin, apiLogin2FA, apiResendOtp,
    apiForgotPassword, apiResetPassword,
    apiTelegramLinkCode, apiTelegramStatus,
} from '../services/api';

// ─── OTP: 6 отдельных полей ───────────────────────────────────────────────────
const OtpInput = ({ onComplete, loading }) => {
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const refs = useRef([]);

    useEffect(() => {
        setDigits(['', '', '', '', '', '']);
        setTimeout(() => refs.current[0]?.focus(), 50);
    }, []);

    const handleChange = (i, val) => {
        const digit = val.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[i] = digit;
        setDigits(next);
        if (digit && i < 5) refs.current[i + 1]?.focus();
        if (digit && i === 5 && next.join('').length === 6) onComplete(next.join(''));
    };

    const handleKeyDown = (i, e) => {
        if (e.key === 'Backspace') {
            if (digits[i]) { const n = [...digits]; n[i] = ''; setDigits(n); }
            else if (i > 0) refs.current[i - 1]?.focus();
        }
        if (e.key === 'ArrowLeft'  && i > 0) refs.current[i - 1]?.focus();
        if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;
        const next = Array(6).fill('').map((_, i) => pasted[i] || '');
        setDigits(next);
        refs.current[Math.min(pasted.length, 5)]?.focus();
        if (pasted.length === 6) onComplete(pasted);
    };

    return (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '4px 0' }}>
            {digits.map((d, i) => (
                <input key={i} ref={el => refs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1} value={d}
                    disabled={loading}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    onFocus={e => e.target.select()}
                    style={{
                        width: '44px', height: '52px', textAlign: 'center',
                        fontSize: '1.5rem', fontWeight: 700,
                        background: d ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.07)',
                        border: `1px solid ${d ? 'rgba(201,168,76,0.6)' : 'rgba(201,168,76,0.25)'}`,
                        borderRadius: '8px', color: '#e8dcc8', outline: 'none',
                        transition: 'all 0.15s', caretColor: 'transparent',
                    }}
                />
            ))}
        </div>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
// screens: 'login' | 'register' | 'verify_email' | 'twofa' | 'forgot' | 'reset_password'
const AuthScreen = () => {
    const dispatch = useDispatch();
    const [screen, setScreen] = useState('login');
    const [form, setForm] = useState({ username: '', email: '', password: '', newPassword: '' });
    const [pendingUserId, setPendingUserId] = useState(null);
    const [pendingPurpose, setPendingPurpose] = useState(null);
    const [pendingUsername, setPendingUsername] = useState('');
    const [twoFaVia, setTwoFaVia] = useState('email'); // 'email' | 'telegram'
    const [tgBotUrl, setTgBotUrl] = useState('');
    const [tgPolling, setTgPolling] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const reset = () => { setError(''); setInfo(''); };
    const go = (s) => { reset(); setScreen(s); };

    const wrap = (fn) => async (...args) => {
        reset(); setLoading(true);
        try { await fn(...args); }
        catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };

    const handleLogin = wrap(async () => {
        const res = await apiLogin(form.username, form.password);
        setPendingUserId(res.userId);
        setPendingPurpose('login_2fa');
        setTwoFaVia(res.via);
        setScreen('twofa');
        setInfo(res.via === 'telegram' ? 'Код отправлен в Telegram' : 'Код отправлен на вашу почту');
    });

    const handleRegister = wrap(async () => {
        const res = await apiRegister(form.username, form.email, form.password);
        setPendingUserId(res.userId);
        setPendingPurpose('verify_email');
        setScreen('verify_email');
        setInfo('Код подтверждения отправлен на почту');
    });

    const handleVerifyEmail = wrap(async (code) => {
        const res = await apiVerifyEmail(pendingUserId, code);
        setPendingUsername(res.username);
        if (res.telegramLinked) {
            dispatch(setAuth({ username: res.username, telegramLinked: true }));
        } else {
            setScreen('link_telegram');
            setInfo('Аккаунт подтверждён! Привяжите Telegram для 2FA.');
        }
    });

    const handle2FA = wrap(async (code) => {
        const res = await apiLogin2FA(pendingUserId, code);
        dispatch(setAuth({ username: res.username, telegramLinked: res.telegramLinked }));
    });

    const handleLinkTelegram = wrap(async () => {
        const r = await apiTelegramLinkCode();
        setTgBotUrl(r.botUrl);
        setTgPolling(true);
        // Поллим статус каждые 2 секунды до привязки
        const iv = setInterval(async () => {
            const s = await apiTelegramStatus().catch(() => ({ linked: false }));
            if (s.linked) {
                clearInterval(iv);
                setTgPolling(false);
                setInfo('Telegram привязан! 🎉');
                setTimeout(() => dispatch(setAuth({ username: pendingUsername, telegramLinked: true })), 800);
            }
        }, 2000);
        setTimeout(() => { clearInterval(iv); setTgPolling(false); }, 10 * 60 * 1000);
    });

    const handleSkipTelegram = () => {
        dispatch(setAuth({ username: pendingUsername, telegramLinked: false }));
    };

    const handleResend = wrap(async () => {
        await apiResendOtp(pendingUserId, pendingPurpose);
        setInfo('Код отправлен повторно');
    });

    const handleForgot = wrap(async () => {
        const res = await apiForgotPassword(form.email);
        setPendingUserId(res.userId);
        setPendingPurpose('reset_password');
        setScreen('reset_password');
        setInfo('Код для сброса пароля отправлен на почту');
    });

    const handleResetPassword = wrap(async (code) => {
        if (!form.newPassword) throw new Error('Введите новый пароль');
        await apiResetPassword(pendingUserId, code, form.newPassword);
        setInfo('Пароль успешно изменён');
        setTimeout(() => go('login'), 1500);
    });

    const hk = (fn) => (e) => { if (e.key === 'Enter') fn(); };

    return (
        <div style={s.overlay}>
            <div style={s.card}>
                <div style={s.logo}>♠ BlackJack Pro</div>

                {screen === 'login' && (<>
                    <div style={s.title}>Вход</div>
                    <Input placeholder="Логин" value={form.username} onChange={v => set('username', v)} onKeyDown={hk(handleLogin)} />
                    <Input placeholder="Пароль" type="password" showToggle value={form.password} onChange={v => set('password', v)} onKeyDown={hk(handleLogin)} />
                    <Btn onClick={handleLogin} disabled={loading}>{loading ? 'Входим...' : 'Войти'}</Btn>
                    <div style={s.link} onClick={() => go('forgot')}>Забыли пароль?</div>
                    <div style={s.link} onClick={() => go('register')}>Нет аккаунта? Зарегистрироваться</div>
                </>)}

                {screen === 'register' && (<>
                    <div style={s.title}>Регистрация</div>
                    <Input placeholder="Логин" value={form.username} onChange={v => set('username', v)} />
                    <Input placeholder="Email" type="email" value={form.email} onChange={v => set('email', v)} />
                    <Input placeholder="Пароль" type="password" showToggle value={form.password} onChange={v => set('password', v)} onKeyDown={hk(handleRegister)} />
                    <Btn onClick={handleRegister} disabled={loading}>{loading ? 'Регистрируем...' : 'Создать аккаунт'}</Btn>
                    <div style={s.link} onClick={() => go('login')}>Уже есть аккаунт? Войти</div>
                </>)}

                {screen === 'verify_email' && (<>
                    <div style={s.title}>Подтверждение почты</div>
                    <div style={s.hint}>Введите код из письма</div>
                    <OtpInput onComplete={handleVerifyEmail} loading={loading} />
                    <div style={s.link} onClick={handleResend}>Отправить повторно</div>
                </>)}

                {screen === 'twofa' && (<>
                    <div style={s.title}>Двухфакторная аутентификация</div>
                    <div style={s.hint}>
                        {twoFaVia === 'telegram' ? '📱 Введите код из Telegram' : '📧 Введите код из письма'}
                    </div>
                    <OtpInput onComplete={handle2FA} loading={loading} />
                    <div style={s.link} onClick={handleResend}>Отправить повторно</div>
                    <div style={s.link} onClick={() => go('login')}>← Назад</div>
                </>)}

                {screen === 'link_telegram' && (<>
                    <div style={s.title}>Привязка Telegram</div>
                    <div style={s.hint}>
                        Привяжите Telegram — коды входа будут приходить в мессенджер мгновенно, без почты
                    </div>
                    {!tgBotUrl ? (<>
                        <Btn onClick={handleLinkTelegram} disabled={loading}>
                            {loading ? 'Генерируем ссылку...' : '📱 Привязать Telegram'}
                        </Btn>
                        <div style={s.link} onClick={handleSkipTelegram}>Пропустить, привяжу позже</div>
                    </>) : (<>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6, textAlign: 'center' }}>
                            Нажмите кнопку ниже — откроется Telegram.<br />
                            Нажмите <b style={{ color: '#e8dcc8' }}>Start</b>, и страница обновится автоматически.
                        </div>
                        <a href={tgBotUrl} target="_blank" rel="noreferrer" style={{
                            background: 'rgba(42,171,238,0.15)', color: '#2aabee',
                            border: '1px solid rgba(42,171,238,0.4)', borderRadius: '8px',
                            padding: '13px', fontWeight: 700, fontSize: '1rem',
                            textAlign: 'center', textDecoration: 'none', display: 'block',
                        }}>
                            📱 Открыть Telegram бота
                        </a>
                        {tgPolling && <div style={{ ...s.hint, color: '#c9a84c' }}>⏳ Ожидаем подтверждения...</div>}
                        <div style={s.link} onClick={handleSkipTelegram}>Пропустить</div>
                    </>)}
                </>)}

                {screen === 'forgot' && (<>
                    <div style={s.title}>Восстановление пароля</div>
                    <div style={s.hint}>Введите почту, указанную при регистрации</div>
                    <Input placeholder="Email" type="email" value={form.email} onChange={v => set('email', v)} onKeyDown={hk(handleForgot)} />
                    <Btn onClick={handleForgot} disabled={loading}>{loading ? 'Отправляем...' : 'Получить код'}</Btn>
                    <div style={s.link} onClick={() => go('login')}>← Назад</div>
                </>)}

                {screen === 'reset_password' && (<>
                    <div style={s.title}>Новый пароль</div>
                    <div style={s.hint}>Введите код из письма и новый пароль</div>
                    <OtpInput onComplete={(code) => {
                        // Сохраняем код и ждём ввода пароля
                        set('resetCode', code);
                    }} loading={loading} />
                    <Input placeholder="Новый пароль (мин. 6 символов)" type="password" showToggle
                        value={form.newPassword} onChange={v => set('newPassword', v)}
                        onKeyDown={hk(() => form.resetCode && handleResetPassword(form.resetCode))} />
                    <Btn onClick={() => form.resetCode && handleResetPassword(form.resetCode)} disabled={loading || !form.resetCode}>
                        {loading ? 'Сохраняем...' : 'Сохранить пароль'}
                    </Btn>
                    <div style={s.link} onClick={() => go('forgot')}>← Назад</div>
                </>)}

                {error && <div style={s.error}>{error}</div>}
                {info  && <div style={s.info}>{info}</div>}
            </div>
        </div>
    );
};

const Input = ({ placeholder, value, onChange, type = 'text', onKeyDown, showToggle }) => {
    const [show, setShow] = useState(false);
    return (
        <div style={{ position: 'relative' }}>
            <input type={showToggle ? (show ? 'text' : 'password') : type}
                placeholder={placeholder} value={value}
                onChange={e => onChange(e.target.value)} onKeyDown={onKeyDown}
                style={{ ...s.input, paddingRight: showToggle ? '44px' : '14px' }} />
            {showToggle && (
                <button type="button" onClick={() => setShow(v => !v)} tabIndex={-1} style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(201,168,76,0.7)', fontSize: '1rem', padding: '4px',
                }}>{show ? '🙈' : '👁'}</button>
            )}
        </div>
    );
};

const Btn = ({ onClick, children, disabled }) => (
    <button onClick={onClick} disabled={disabled}
        style={{ ...s.button, opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
        {children}
    </button>
);

const s = {
    overlay: { position: 'fixed', inset: 0, zIndex: 1000, background: 'radial-gradient(ellipse at center, #1a3a25 0%, #0d1f15 60%, #060e0a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' },
    card:    { background: 'rgba(8,18,12,0.95)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '16px', padding: '32px 28px', width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 24px 60px rgba(0,0,0,0.8)' },
    logo:    { fontFamily: 'Playfair Display, serif', color: '#c9a84c', fontSize: '1.4rem', fontWeight: 700, textAlign: 'center', marginBottom: '4px' },
    title:   { color: '#e8dcc8', fontSize: '1.1rem', fontWeight: 600, textAlign: 'center', marginBottom: '4px' },
    hint:    { color: '#888', fontSize: '0.85rem', textAlign: 'center' },
    input:   { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '8px', padding: '12px 14px', color: '#e8dcc8', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
    button:  { background: 'linear-gradient(135deg, #8b6914, #c9a84c)', color: '#0d1f15', border: 'none', borderRadius: '8px', padding: '13px', fontWeight: 700, fontSize: '1rem', marginTop: '4px', transition: 'opacity 0.2s', cursor: 'pointer' },
    link:    { color: '#c9a84c', fontSize: '0.85rem', textAlign: 'center', cursor: 'pointer', textDecoration: 'underline', opacity: 0.8 },
    error:   { color: '#e05050', fontSize: '0.85rem', textAlign: 'center', padding: '8px', background: 'rgba(224,80,80,0.1)', borderRadius: '6px' },
    info:    { color: '#4caf72', fontSize: '0.85rem', textAlign: 'center', padding: '8px', background: 'rgba(76,175,114,0.1)', borderRadius: '6px' },
};

export default AuthScreen;